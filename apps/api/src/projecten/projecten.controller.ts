import {
  BadRequestException,
  Body,
  Controller,
  Get,
  NotFoundException,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import {
  IsDateString,
  IsEmail,
  IsEnum,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';
import type { Request } from 'express';
import { customAlphabet } from 'nanoid';
import { Prisma, ProjectRisicoStatus, ProjectStatus } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { AuditService } from '../audit/audit.service';
import { Auth } from '../auth/rbac';
import type { AuthenticatedUser } from '../common/types';

class NieuwProjectDto {
  @IsInt() districtId!: number;
  @IsOptional() @IsInt() ressortId?: number;
  @IsOptional() @IsInt() categorieId?: number;
  @IsString() @MinLength(3) @MaxLength(200) titel!: string;
  @IsOptional() @IsString() @MaxLength(5000) beschrijving?: string;
  // F2 — Contractor gestructureerd
  @IsOptional() @IsString() @MaxLength(200) contractor?: string;
  @IsOptional() @IsString() @MaxLength(40) contractorKkfNummer?: string;
  @IsOptional() @IsString() @MaxLength(200) contractorContactpersoon?: string;
  @IsOptional() @IsString() @MaxLength(40) contractorTelefoon?: string;
  @IsOptional() @IsEmail() contractorEmail?: string;
  @IsOptional() @IsNumber() @Min(0) budgetIndicatief?: number;
  @IsOptional() @IsDateString() startDatum?: string;
  @IsOptional() @IsDateString() eindDatumPlan?: string;
}

/** F2 — alleen contractor-gegevens bijwerken (PATCH-flow). */
class ContractorUpdateDto {
  @IsOptional() @IsString() @MaxLength(200) contractor?: string;
  @IsOptional() @IsString() @MaxLength(40) contractorKkfNummer?: string;
  @IsOptional() @IsString() @MaxLength(200) contractorContactpersoon?: string;
  @IsOptional() @IsString() @MaxLength(40) contractorTelefoon?: string;
  @IsOptional() @IsEmail() contractorEmail?: string;
}

/** F1 — Nieuw risico aanmaken. */
class NieuwRisicoDto {
  @IsString() @MinLength(3) @MaxLength(200) titel!: string;
  @IsString() @MinLength(10) @MaxLength(5000) beschrijving!: string;
  @IsOptional() @IsString() @MaxLength(5000) mitigatie?: string;
}

/** F1 — Risico bijwerken (status + mitigatie). */
class RisicoUpdateDto {
  @IsOptional() @IsEnum(ProjectRisicoStatus) status?: ProjectRisicoStatus;
  @IsOptional() @IsString() @MaxLength(5000) mitigatie?: string;
}

class VoortgangDto {
  @IsString() @MinLength(3) @MaxLength(5000) body!: string;
}

class StatusWijzigingDto {
  @IsEnum(ProjectStatus)
  status!: ProjectStatus;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  opmerking?: string;
}

const nano = customAlphabet('0123456789', 5);

@ApiTags('projecten')
@Controller('projecten')
export class ProjectenController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  @Post()
  @Auth('project.create')
  @ApiOperation({ summary: 'Nieuw project aanmaken' })
  async maak(@Body() dto: NieuwProjectDto, @Req() req: Request) {
    const u = req.user as AuthenticatedUser;
    const d = await this.prisma.district.findUnique({ where: { id: dto.districtId } });
    if (!d) throw new BadRequestException('Onbekend district');

    if (dto.ressortId) {
      const r = await this.prisma.ressort.findUnique({ where: { id: dto.ressortId } });
      if (!r || r.districtId !== dto.districtId) {
        throw new BadRequestException(`Ressort hoort niet bij district`);
      }
    }

    const ref = `PRJ-${new Date().getFullYear()}-${d.code}-${nano()}`;
    const p = await this.prisma.project.create({
      data: {
        referentie: ref,
        districtId: dto.districtId,
        ressortId: dto.ressortId,
        categorieId: dto.categorieId,
        titel: dto.titel,
        beschrijving: dto.beschrijving,
        contractor: dto.contractor,
        contractorKkfNummer: dto.contractorKkfNummer,
        contractorContactpersoon: dto.contractorContactpersoon,
        contractorTelefoon: dto.contractorTelefoon,
        contractorEmail: dto.contractorEmail?.toLowerCase(),
        budgetIndicatief: dto.budgetIndicatief,
        startDatum: dto.startDatum ? new Date(dto.startDatum) : null,
        eindDatumPlan: dto.eindDatumPlan ? new Date(dto.eindDatumPlan) : null,
      },
    });

    await this.audit.log({
      actorId: u.id,
      actie: 'CREATE',
      entiteitType: 'Project',
      entiteitId: p.id,
      na: { referentie: p.referentie, districtId: p.districtId },
      ip: req.ip,
    });

    return p;
  }

  @Get()
  @Auth('project.read.district', 'dashboard.nationaal')
  @ApiOperation({ summary: 'Lijst projecten per district' })
  @ApiQuery({ name: 'status', required: false, enum: ProjectStatus })
  @ApiQuery({ name: 'subregioId', required: false, description: 'Filter op DC-cluster' })
  @ApiQuery({ name: 'ressortId', required: false, description: 'Filter op één ressort (C6)' })
  async lijst(
    @Query('districtId', ParseIntPipe) districtId: number,
    @Query('status') status?: ProjectStatus,
    @Query('subregioId') subregioId?: string,
    @Query('ressortId') ressortId?: string,
  ) {
    return this.prisma.project.findMany({
      where: {
        districtId,
        status,
        ...(subregioId ? { subregioId: Number(subregioId) } : {}),
        ...(ressortId ? { ressortId: Number(ressortId) } : {}),
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      include: {
        ressort: { select: { id: true, naam: true } },
        subregio: { select: { id: true, code: true, naam: true } },
        categorie: { select: { naam: true } },
        _count: { select: { updates: true } },
      },
    });
  }

  @Get(':id')
  @Auth('project.read.district', 'dashboard.nationaal')
  @ApiOperation({ summary: 'Project detail + voortgangslogboek + risicos' })
  async detail(@Param('id', ParseIntPipe) id: number) {
    const p = await this.prisma.project.findUnique({
      where: { id },
      include: {
        district: true,
        ressort: true,
        categorie: true,
        updates: {
          orderBy: { createdAt: 'desc' },
          include: { actor: { select: { id: true, naam: true } } },
        },
        risicos: {
          orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
          include: { actor: { select: { id: true, naam: true } } },
        },
        _count: { select: { updates: true, risicos: true } },
      },
    });
    if (!p) throw new NotFoundException();
    return p;
  }

  // ─── F2 — Contractor-gegevens bijwerken ───────────────────────────
  @Patch(':id/contractor')
  @Auth('project.update')
  @ApiOperation({ summary: 'Contractor-gegevens bijwerken (F2)' })
  async wijzigContractor(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ContractorUpdateDto,
    @Req() req: Request,
  ) {
    const u = req.user as AuthenticatedUser;
    const oud = await this.prisma.project.findUnique({ where: { id } });
    if (!oud) throw new NotFoundException();

    const nieuw = await this.prisma.project.update({
      where: { id },
      data: {
        contractor: dto.contractor ?? oud.contractor,
        contractorKkfNummer: dto.contractorKkfNummer ?? oud.contractorKkfNummer,
        contractorContactpersoon:
          dto.contractorContactpersoon ?? oud.contractorContactpersoon,
        contractorTelefoon: dto.contractorTelefoon ?? oud.contractorTelefoon,
        contractorEmail:
          dto.contractorEmail !== undefined
            ? dto.contractorEmail.toLowerCase()
            : oud.contractorEmail,
      },
    });

    await this.audit.log({
      actorId: u.id,
      actie: 'UPDATE',
      entiteitType: 'Project',
      entiteitId: id,
      voor: {
        contractor: oud.contractor,
        kkf: oud.contractorKkfNummer,
      } as Prisma.InputJsonValue,
      na: {
        contractor: nieuw.contractor,
        kkf: nieuw.contractorKkfNummer,
        contactpersoon: nieuw.contractorContactpersoon,
      } as Prisma.InputJsonValue,
      ip: req.ip,
      context: { veld: 'contractor' },
    });

    return nieuw;
  }

  // ─── F1 — Risico-notities ─────────────────────────────────────────
  @Post(':id/risicos')
  @Auth('project.update')
  @ApiOperation({ summary: 'Risico-notitie toevoegen aan project (F1)' })
  async risicoMaak(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: NieuwRisicoDto,
    @Req() req: Request,
  ) {
    const u = req.user as AuthenticatedUser;
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException();

    const risico = await this.prisma.projectRisico.create({
      data: {
        projectId: id,
        actorId: u.id,
        titel: dto.titel,
        beschrijving: dto.beschrijving,
        mitigatie: dto.mitigatie,
      },
      include: { actor: { select: { id: true, naam: true } } },
    });

    await this.audit.log({
      actorId: u.id,
      actie: 'CREATE',
      entiteitType: 'ProjectRisico',
      entiteitId: risico.id,
      na: {
        projectId: id,
        titel: risico.titel,
        status: risico.status,
      } as Prisma.InputJsonValue,
      ip: req.ip,
    });

    return risico;
  }

  @Patch(':id/risicos/:risicoId')
  @Auth('project.update')
  @ApiOperation({ summary: 'Risico bijwerken (status of mitigatie)' })
  async risicoWijzig(
    @Param('id', ParseIntPipe) id: number,
    @Param('risicoId', ParseIntPipe) risicoId: number,
    @Body() dto: RisicoUpdateDto,
    @Req() req: Request,
  ) {
    const u = req.user as AuthenticatedUser;
    const oud = await this.prisma.projectRisico.findFirst({
      where: { id: risicoId, projectId: id },
    });
    if (!oud) throw new NotFoundException('Risico niet gevonden');

    if (dto.status === undefined && dto.mitigatie === undefined) {
      throw new BadRequestException('Geef status of mitigatie op');
    }

    const nieuw = await this.prisma.projectRisico.update({
      where: { id: risicoId },
      data: {
        status: dto.status ?? oud.status,
        mitigatie: dto.mitigatie ?? oud.mitigatie,
      },
      include: { actor: { select: { id: true, naam: true } } },
    });

    await this.audit.log({
      actorId: u.id,
      actie: dto.status ? 'STATUS_WIJZIGING' : 'UPDATE',
      entiteitType: 'ProjectRisico',
      entiteitId: risicoId,
      voor: { status: oud.status } as Prisma.InputJsonValue,
      na: { status: nieuw.status, mitigatie: nieuw.mitigatie } as Prisma.InputJsonValue,
      ip: req.ip,
      context: { projectId: id },
    });

    return nieuw;
  }

  @Post(':id/voortgang')
  @Auth('project.update')
  @ApiOperation({ summary: 'Voortgangsupdate toevoegen' })
  async voortgang(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: VoortgangDto,
    @Req() req: Request,
  ) {
    const u = req.user as AuthenticatedUser;
    const project = await this.prisma.project.findUnique({ where: { id } });
    if (!project) throw new NotFoundException();

    const update = await this.prisma.projectUpdate.create({
      data: { projectId: id, actorId: u.id, body: dto.body },
      include: { actor: { select: { id: true, naam: true } } },
    });

    await this.audit.log({
      actorId: u.id,
      actie: 'UPDATE',
      entiteitType: 'Project',
      entiteitId: id,
      na: { kind: 'voortgang', body: dto.body.slice(0, 100) },
      ip: req.ip,
    });

    return update;
  }

  @Patch(':id/status')
  @Auth('project.update', 'project.goedkeur')
  @ApiOperation({
    summary: 'Status wijzigen (idee → goedgekeurd → gestart → afgerond, etc.)',
  })
  async wijzigStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: StatusWijzigingDto,
    @Req() req: Request,
  ) {
    const u = req.user as AuthenticatedUser;
    const oud = await this.prisma.project.findUnique({ where: { id } });
    if (!oud) throw new NotFoundException();

    // GOEDGEKEURD vereist apart permissie
    if (
      (dto.status === 'GOEDGEKEURD' || dto.status === 'GEANNULEERD') &&
      !u.permissies.has('project.goedkeur')
    ) {
      throw new BadRequestException(
        `Status ${dto.status} vereist permissie project.goedkeur`,
      );
    }

    // Bij afronden vastleggen wanneer
    const eindDatumWerkelijk =
      dto.status === 'AFGEROND' || dto.status === 'GEEVALUEERD'
        ? new Date()
        : undefined;

    const nieuw = await this.prisma.project.update({
      where: { id },
      data: {
        status: dto.status,
        eindDatumWerkelijk: eindDatumWerkelijk ?? oud.eindDatumWerkelijk,
        updates: {
          create: {
            actorId: u.id,
            body:
              `Status gewijzigd: ${oud.status} → ${dto.status}` +
              (dto.opmerking ? `\n\n${dto.opmerking}` : ''),
          },
        },
      },
    });

    await this.audit.log({
      actorId: u.id,
      actie: 'STATUS_WIJZIGING',
      entiteitType: 'Project',
      entiteitId: id,
      voor: { status: oud.status } as Prisma.InputJsonValue,
      na: { status: nieuw.status } as Prisma.InputJsonValue,
      ip: req.ip,
      context: { opmerking: dto.opmerking },
    });

    return nieuw;
  }
}
