import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import {
  IsBoolean,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import type { Request } from 'express';
import { Prisma } from '@prisma/client';
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

    // Som van uitgaven per fonds
    const ids = fondsen.map((f) => f.id);
    const sommen = await this.prisma.districtsfondsUitgave.groupBy({
      by: ['districtsfondsId'],
      where: { districtsfondsId: { in: ids } },
      _sum: { bedrag: true },
    });
    const sumMap = new Map(sommen.map((s) => [s.districtsfondsId, Number(s._sum.bedrag ?? 0)]));

    return fondsen.map((f) => {
      const besteed = sumMap.get(f.id) ?? 0;
      const budget = Number(f.totaalBudget);
      return {
        ...f,
        besteed,
        restant: budget - besteed,
        pctBesteed: budget > 0 ? Math.round((besteed / budget) * 100) : 0,
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

    const besteed = f.uitgaven.reduce((s, u) => s + Number(u.bedrag), 0);
    const budget = Number(f.totaalBudget);

    // Aggregatie per categorie (project / niet-project)
    const perCat: Record<string, number> = {
      projecten: 0,
      operationeel: 0,
    };
    for (const u of f.uitgaven) {
      if (u.projectId) perCat.projecten += Number(u.bedrag);
      else perCat.operationeel += Number(u.bedrag);
    }

    // Per project
    const perProject: Array<{ project: typeof f.uitgaven[0]['project']; bedrag: number }> = [];
    for (const u of f.uitgaven) {
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

    // Soft-check restant — niet hard blokkeren maar wel waarschuwen via log
    const huidigBesteed = await this.prisma.districtsfondsUitgave.aggregate({
      where: { districtsfondsId: fondsId },
      _sum: { bedrag: true },
    });
    const al = Number(huidigBesteed._sum.bedrag ?? 0);
    const isOverschrijding = al + dto.bedrag > Number(fonds.totaalBudget);

    const uitgave = await this.prisma.districtsfondsUitgave.create({
      data: {
        districtsfondsId: fondsId,
        projectId: dto.projectId,
        bedrag: dto.bedrag,
        beschrijving: dto.beschrijving,
        geboektDoorId: u.id,
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
        budgetOverschrijding: isOverschrijding,
      } as Prisma.InputJsonValue,
      ip: req.ip,
    });

    return { ...uitgave, budgetOverschrijding: isOverschrijding };
  }
}
