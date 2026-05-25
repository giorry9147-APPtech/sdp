import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Header,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
  Res,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  IsBoolean,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import type { Request, Response } from 'express';
import { Prisma, DistrictsfondsUitgaveStatus } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { AuditService } from '../audit/audit.service';
import { Auth } from '../auth/rbac';
import type { AuthenticatedUser } from '../common/types';

/**
 * Districtsfonds — financiële decentralisatie (Wet Fid art. 40).
 *
 * Fase 2 module. Vereist normaliter:
 *  - DPIA voor financiële persoonsgegevens
 *  - CLAD-aansluiting voor jaarrekening
 *
 * Voor MVP/demo: read + uitgaven boeken + restant berekenen.
 */

class NieuwFondsDto {
  @IsInt() districtId!: number;
  @IsInt() @Min(2025) @Max(2099) jaar!: number;
  @IsNumber() @Min(0) totaalBudget!: number;
  @IsOptional() @IsString() @MaxLength(3) valuta?: string;
  @IsOptional() @IsBoolean() goedgekeurd?: boolean;
}

class NieuweUitgaveDto {
  @IsNumber() @Min(0) bedrag!: number;
  @IsString() @MinLength(3) @MaxLength(500) beschrijving!: string;
  @IsOptional() @IsInt() projectId?: number;
}

class BeslissingDto {
  @IsIn(['GOEDKEUREN', 'AFKEUREN']) actie!: 'GOEDKEUREN' | 'AFKEUREN';
  @IsOptional() @IsString() @MaxLength(500) reden?: string;
}

@ApiTags('financien')
@Controller('financien')
export class FinancienController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ─── Districtsfonds ───────────────────────────────────────────────
  @Get('districtsfondsen')
  @Auth('fonds.read')
  @ApiOperation({ summary: 'Lijst districtsfondsen, filterbaar per district + jaar' })
  async lijst(
    @Query('districtId') districtId?: string,
    @Query('jaar') jaar?: string,
  ) {
    const fondsen = await this.prisma.districtsfonds.findMany({
      where: {
        districtId: districtId ? Number(districtId) : undefined,
        jaar: jaar ? Number(jaar) : undefined,
      },
      orderBy: [{ jaar: 'desc' }, { districtId: 'asc' }],
      include: {
        district: { select: { id: true, code: true, naam: true } },
        _count: { select: { uitgaven: true } },
      },
    });

    // Som van uitgaven per fonds — alleen GOEDGEKEURD telt mee in besteed/restant.
    // AANGEVRAAGD (wacht op 4-ogen) en AFGEKEURD beïnvloeden het beschikbare budget niet.
    const ids = fondsen.map((f) => f.id);
    const sommen = await this.prisma.districtsfondsUitgave.groupBy({
      by: ['districtsfondsId'],
      where: {
        districtsfondsId: { in: ids },
        status: DistrictsfondsUitgaveStatus.GOEDGEKEURD,
      },
      _sum: { bedrag: true },
    });
    const sumMap = new Map(sommen.map((s) => [s.districtsfondsId, Number(s._sum.bedrag ?? 0)]));

    // Tellen van aanvragen-in-afwachting per fonds (voor badge in UI)
    const wachtend = await this.prisma.districtsfondsUitgave.groupBy({
      by: ['districtsfondsId'],
      where: {
        districtsfondsId: { in: ids },
        status: DistrictsfondsUitgaveStatus.AANGEVRAAGD,
      },
      _count: { _all: true },
    });
    const wachtMap = new Map(wachtend.map((w) => [w.districtsfondsId, w._count._all]));

    return fondsen.map((f) => {
      const besteed = sumMap.get(f.id) ?? 0;
      const budget = Number(f.totaalBudget);
      return {
        ...f,
        besteed,
        restant: budget - besteed,
        pctBesteed: budget > 0 ? Math.round((besteed / budget) * 100) : 0,
        uitgavenInAfwachting: wachtMap.get(f.id) ?? 0,
      };
    });
  }

  @Get('districtsfondsen/:id')
  @Auth('fonds.read')
  @ApiOperation({ summary: 'Detail districtsfonds incl. uitgaven' })
  async detail(@Param('id', ParseIntPipe) id: number) {
    const f = await this.prisma.districtsfonds.findUnique({
      where: { id },
      include: {
        district: { select: { id: true, code: true, naam: true } },
        uitgaven: {
          orderBy: { geboektOp: 'desc' },
          include: {
            project: { select: { id: true, referentie: true, titel: true, status: true } },
          },
        },
      },
    });
    if (!f) throw new NotFoundException();

    // Alleen GOEDGEKEURD telt mee in besteed/restant — 4-ogen-principe.
    const goedgekeurd = f.uitgaven.filter(
      (u) => u.status === DistrictsfondsUitgaveStatus.GOEDGEKEURD,
    );
    const besteed = goedgekeurd.reduce((s, u) => s + Number(u.bedrag), 0);
    const budget = Number(f.totaalBudget);

    // Som van aangevraagd-maar-nog-niet-besloten — toont DC's de "pijplijn".
    const aangevraagdBedrag = f.uitgaven
      .filter((u) => u.status === DistrictsfondsUitgaveStatus.AANGEVRAAGD)
      .reduce((s, u) => s + Number(u.bedrag), 0);

    // Aggregatie per categorie (project / niet-project) — alleen goedgekeurd
    const perCat: Record<string, number> = {
      projecten: 0,
      operationeel: 0,
    };
    for (const u of goedgekeurd) {
      if (u.projectId) perCat.projecten += Number(u.bedrag);
      else perCat.operationeel += Number(u.bedrag);
    }

    // Per project — alleen goedgekeurd
    const perProject: Array<{ project: typeof f.uitgaven[0]['project']; bedrag: number }> = [];
    for (const u of goedgekeurd) {
      if (!u.project) continue;
      const bestaand = perProject.find((p) => p.project?.id === u.project!.id);
      if (bestaand) bestaand.bedrag += Number(u.bedrag);
      else perProject.push({ project: u.project, bedrag: Number(u.bedrag) });
    }

    return {
      ...f,
      besteed,
      restant: budget - besteed,
      pctBesteed: budget > 0 ? Math.round((besteed / budget) * 100) : 0,
      aangevraagdBedrag,
      uitgavenInAfwachting: f.uitgaven.filter(
        (u) => u.status === DistrictsfondsUitgaveStatus.AANGEVRAAGD,
      ).length,
      verdeling: perCat,
      perProject,
    };
  }

  @Post('districtsfondsen')
  @Auth('fonds.goedkeur')
  @ApiOperation({ summary: 'Nieuw districtsfonds aanmaken (begroting)' })
  async maakFonds(@Body() dto: NieuwFondsDto, @Req() req: Request) {
    const u = req.user as AuthenticatedUser;
    const d = await this.prisma.district.findUnique({ where: { id: dto.districtId } });
    if (!d) throw new BadRequestException('Onbekend district');

    const bestaand = await this.prisma.districtsfonds.findUnique({
      where: { districtId_jaar: { districtId: dto.districtId, jaar: dto.jaar } },
    });
    if (bestaand) {
      throw new BadRequestException(
        `Er bestaat al een districtsfonds voor ${d.naam} ${dto.jaar}`,
      );
    }

    const f = await this.prisma.districtsfonds.create({
      data: {
        districtId: dto.districtId,
        jaar: dto.jaar,
        totaalBudget: dto.totaalBudget,
        valuta: dto.valuta ?? 'SRD',
        goedgekeurd: dto.goedgekeurd ?? false,
      },
    });

    await this.audit.log({
      actorId: u.id,
      actie: 'CREATE',
      entiteitType: 'Districtsfonds',
      entiteitId: f.id,
      na: { districtId: f.districtId, jaar: f.jaar, totaalBudget: dto.totaalBudget },
      ip: req.ip,
    });

    return f;
  }

  // ─── Uitgaven ────────────────────────────────────────────────────
  @Post('districtsfondsen/:id/uitgaven')
  @Auth('fonds.boek')
  @ApiOperation({ summary: 'Uitgave boeken op districtsfonds' })
  async boekUitgave(
    @Param('id', ParseIntPipe) fondsId: number,
    @Body() dto: NieuweUitgaveDto,
    @Req() req: Request,
  ) {
    const u = req.user as AuthenticatedUser;
    const fonds = await this.prisma.districtsfonds.findUnique({ where: { id: fondsId } });
    if (!fonds) throw new NotFoundException('Onbekend districtsfonds');

    if (dto.projectId) {
      const p = await this.prisma.project.findUnique({ where: { id: dto.projectId } });
      if (!p || p.districtId !== fonds.districtId) {
        throw new BadRequestException('Project hoort niet bij dit district');
      }
    }

    // Soft-check restant tegen GOEDGEKEURD totaal + deze nieuwe aanvraag.
    // Aangevraagde-maar-niet-goedgekeurde uitgaven tellen niet mee in het budget,
    // maar overschrijdingen worden wel gelogd voor de auditor.
    const huidigBesteed = await this.prisma.districtsfondsUitgave.aggregate({
      where: {
        districtsfondsId: fondsId,
        status: DistrictsfondsUitgaveStatus.GOEDGEKEURD,
      },
      _sum: { bedrag: true },
    });
    const al = Number(huidigBesteed._sum.bedrag ?? 0);
    const isOverschrijding = al + dto.bedrag > Number(fonds.totaalBudget);

    // Status = AANGEVRAAGD; wacht op 4-ogen-goedkeuring door iemand met fonds.goedkeur.
    const uitgave = await this.prisma.districtsfondsUitgave.create({
      data: {
        districtsfondsId: fondsId,
        projectId: dto.projectId,
        bedrag: dto.bedrag,
        beschrijving: dto.beschrijving,
        geboektDoorId: u.id,
        status: DistrictsfondsUitgaveStatus.AANGEVRAAGD,
      },
      include: {
        project: { select: { id: true, referentie: true, titel: true } },
      },
    });

    await this.audit.log({
      actorId: u.id,
      actie: 'CREATE',
      entiteitType: 'DistrictsfondsUitgave',
      entiteitId: uitgave.id,
      na: {
        fondsId,
        bedrag: dto.bedrag,
        beschrijving: dto.beschrijving.slice(0, 100),
        projectId: dto.projectId,
        status: 'AANGEVRAAGD',
        budgetOverschrijding: isOverschrijding,
      } as Prisma.InputJsonValue,
      ip: req.ip,
    });

    return { ...uitgave, budgetOverschrijding: isOverschrijding };
  }

  // ─── Approval-flow (4-ogen) ───────────────────────────────────────
  @Get('uitgaven/in-afwachting')
  @Auth('fonds.goedkeur')
  @ApiOperation({
    summary: 'Lijst aangevraagde uitgaven die wachten op goedkeuring (4-ogen)',
  })
  async inAfwachting(@Query('districtId') districtId?: string) {
    return this.prisma.districtsfondsUitgave.findMany({
      where: {
        status: DistrictsfondsUitgaveStatus.AANGEVRAAGD,
        ...(districtId
          ? { districtsfonds: { districtId: Number(districtId) } }
          : {}),
      },
      orderBy: { geboektOp: 'asc' },
      include: {
        districtsfonds: {
          select: {
            id: true,
            jaar: true,
            district: { select: { id: true, code: true, naam: true } },
          },
        },
        project: { select: { id: true, referentie: true, titel: true } },
      },
    });
  }

  @Post('uitgaven/:id/beslissing')
  @Auth('fonds.goedkeur')
  @ApiOperation({
    summary: '4-ogen beslissing: GOEDKEUREN of AFKEUREN van uitgave-aanvraag',
  })
  async beslis(
    @Param('id', ParseIntPipe) uitgaveId: number,
    @Body() dto: BeslissingDto,
    @Req() req: Request,
  ) {
    const u = req.user as AuthenticatedUser;
    const uitgave = await this.prisma.districtsfondsUitgave.findUnique({
      where: { id: uitgaveId },
    });
    if (!uitgave) throw new NotFoundException('Onbekende uitgave');

    if (uitgave.status !== DistrictsfondsUitgaveStatus.AANGEVRAAGD) {
      throw new BadRequestException(
        `Uitgave heeft al status ${uitgave.status} — kan niet opnieuw beslist worden`,
      );
    }

    // 4-ogen-principe: aanvrager mag niet z'n eigen aanvraag goedkeuren.
    if (uitgave.geboektDoorId && uitgave.geboektDoorId === u.id) {
      throw new ForbiddenException(
        '4-ogen-principe: je mag niet je eigen uitgave-aanvraag goedkeuren of afkeuren',
      );
    }

    if (dto.actie === 'AFKEUREN' && (!dto.reden || dto.reden.length < 3)) {
      throw new BadRequestException(
        'Reden van afkeuring is verplicht (min. 3 tekens)',
      );
    }

    const nieuweStatus =
      dto.actie === 'GOEDKEUREN'
        ? DistrictsfondsUitgaveStatus.GOEDGEKEURD
        : DistrictsfondsUitgaveStatus.AFGEKEURD;

    const bijgewerkt = await this.prisma.districtsfondsUitgave.update({
      where: { id: uitgaveId },
      data: {
        status: nieuweStatus,
        goedgekeurdDoorId: u.id,
        goedgekeurdOp: new Date(),
        afkeurReden: dto.actie === 'AFKEUREN' ? dto.reden : null,
      },
      include: {
        project: { select: { id: true, referentie: true, titel: true } },
      },
    });

    await this.audit.log({
      actorId: u.id,
      actie: 'UPDATE',
      entiteitType: 'DistrictsfondsUitgave',
      entiteitId: uitgaveId,
      voor: { status: 'AANGEVRAAGD' } as Prisma.InputJsonValue,
      na: {
        status: nieuweStatus,
        bedrag: Number(uitgave.bedrag),
        reden: dto.reden ?? null,
      } as Prisma.InputJsonValue,
      ip: req.ip,
    });

    return bijgewerkt;
  }

  // ─── Audit-export (CSV) ───────────────────────────────────────────
  @Get('districtsfondsen/:id/audit/csv')
  @Auth('fonds.read')
  @Header('Content-Type', 'text/csv; charset=utf-8')
  @ApiOperation({
    summary: 'Exporteer grootboek van districtsfonds als CSV (audit/CLAD)',
  })
  async exportCsv(
    @Param('id', ParseIntPipe) id: number,
    @Res() res: Response,
  ) {
    const fonds = await this.prisma.districtsfonds.findUnique({
      where: { id },
      include: {
        district: { select: { code: true, naam: true } },
        uitgaven: {
          orderBy: { geboektOp: 'asc' },
          include: {
            project: { select: { referentie: true, titel: true } },
          },
        },
      },
    });
    if (!fonds) throw new NotFoundException();

    // Verzamel actor-ids voor één query (geboekt + goedgekeurd).
    const actorIds = Array.from(
      new Set([
        ...fonds.uitgaven.map((u) => u.geboektDoorId).filter((s): s is string => !!s),
        ...fonds.uitgaven.map((u) => u.goedgekeurdDoorId).filter((s): s is string => !!s),
      ]),
    );
    const users = await this.prisma.gebruiker.findMany({
      where: { id: { in: actorIds } },
      select: { id: true, email: true, naam: true },
    });
    const userMap = new Map<string, string>(
      users.map((u) => [u.id, `${u.naam} <${u.email}>`]),
    );

    const csvHeader = [
      'datum',
      'status',
      'bedrag_SRD',
      'beschrijving',
      'project_ref',
      'project_titel',
      'aangevraagd_door',
      'beslist_door',
      'beslist_op',
      'afkeur_reden',
    ].join(';');

    const rows = fonds.uitgaven.map((u) =>
      [
        new Date(u.geboektOp).toISOString().slice(0, 10),
        u.status,
        Number(u.bedrag).toFixed(2),
        csvEscape(u.beschrijving),
        u.project?.referentie ?? '',
        csvEscape(u.project?.titel ?? ''),
        csvEscape(userMap.get(u.geboektDoorId ?? '') ?? ''),
        csvEscape(userMap.get(u.goedgekeurdDoorId ?? '') ?? ''),
        u.goedgekeurdOp ? new Date(u.goedgekeurdOp).toISOString() : '',
        csvEscape(u.afkeurReden ?? ''),
      ].join(';'),
    );

    const filename = `districtsfonds-${fonds.district.code}-${fonds.jaar}-grootboek.csv`;
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // BOM voor Excel UTF-8 detectie.
    res.send('﻿' + [csvHeader, ...rows].join('\n'));
  }
}

/** Escape voor CSV met `;`-separator: quotes verdubbelen, hele veld in quotes als nodig. */
function csvEscape(s: string): string {
  if (s === '' || s == null) return '';
  if (/[";\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}
