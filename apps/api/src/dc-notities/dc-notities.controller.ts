import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { IsInt, IsString, MaxLength, MinLength } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import type { Request } from 'express';
import { PrismaService } from '../common/prisma.service';
import { AuditService } from '../audit/audit.service';
import { Auth } from '../auth/rbac';
import type { AuthenticatedUser } from '../common/types';

export class NieuweNotitieDto {
  @ApiProperty({ description: 'District-ID waaraan de notitie hangt' })
  @IsInt()
  districtId!: number;

  @ApiProperty({ description: 'Tekst van de notitie (max 4000 tekens)' })
  @IsString()
  @MinLength(2)
  @MaxLength(4000)
  body!: string;
}

@ApiTags('dc-notities')
@Controller('dc-notities')
export class DcNotitiesController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /**
   * C4 — DC's en districtssecretarissen leggen een dagaantekening vast
   * (waarom een besluit genomen is, welke afspraken er met RR/RO zijn).
   * Verschijnt op het dashboard als rolling log.
   */
  @Post()
  @Auth('dashboard.district')
  @ApiOperation({ summary: 'Nieuwe DC-dagnotitie' })
  async maken(@Body() dto: NieuweNotitieDto, @Req() req: Request) {
    const u = req.user as AuthenticatedUser;

    // Scope-check: gebruiker moet rol hebben in dit district (of nationaal)
    const okScope =
      u.rollen.some((r) => r.scope === 'NATIONAAL') ||
      u.rollen.some((r) => r.districtId === dto.districtId);
    if (!okScope) {
      throw new ForbiddenException('Geen rol in dit district');
    }

    const notitie = await this.prisma.dcNotitie.create({
      data: { districtId: dto.districtId, actorId: u.id, body: dto.body },
      include: { actor: { select: { id: true, naam: true } } },
    });

    await this.audit.log({
      actorId: u.id,
      actie: 'CREATE',
      entiteitType: 'DcNotitie',
      entiteitId: notitie.id,
      na: { districtId: dto.districtId, bodyLength: dto.body.length },
      ip: req.ip,
    });

    return notitie;
  }

  /**
   * Lijst notities voor een district (laatste N).
   */
  @Get()
  @Auth('dashboard.district')
  @ApiOperation({ summary: 'DC-dagnotities van een district' })
  @ApiQuery({ name: 'districtId', required: true })
  @ApiQuery({ name: 'limit', required: false })
  async lijst(
    @Query('districtId') districtIdRaw?: string,
    @Query('limit') limitRaw?: string,
  ) {
    if (!districtIdRaw) throw new BadRequestException('districtId verplicht');
    const districtId = Number(districtIdRaw);
    if (!Number.isFinite(districtId)) {
      throw new BadRequestException('districtId moet getal zijn');
    }
    const limit = Math.min(100, Math.max(1, Number(limitRaw) || 20));

    return this.prisma.dcNotitie.findMany({
      where: { districtId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: { actor: { select: { id: true, naam: true } } },
    });
  }
}
