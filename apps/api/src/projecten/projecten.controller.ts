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
import { Prisma, ProjectStatus } from '@prisma/client';
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
  @IsOptional() @IsString() @MaxLength(200) contractor?: string;
  @IsOptional() @IsNumber() @Min(0) budgetIndicatief?: number;
  @IsOptional() @IsDateString() startDatum?: string;
  @IsOptional() @IsDateString() eindDatumPlan?: string;
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
  async lijst(
    @Query('districtId', ParseIntPipe) districtId: number,
    @Query('status') status?: ProjectStatus,
  ) {
    return this.prisma.project.findMany({
      where: { districtId, status },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      include: {
        ressort: { select: { id: true, naam: true } },
        categorie: { select: { naam: true } },
        _count: { select: { updates: true } },
      },
    });
  }

  @Get(':id')
  @Auth('project.read.district', 'dashboard.nationaal')
  @ApiOperation({ summary: 'Project detail + voortgangslogboek' })
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
        _count: { select: { updates: true } },
      },
    });
    if (!p) throw new NotFoundException();
    return p;
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
