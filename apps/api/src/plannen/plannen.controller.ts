import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { PlanStatus } from '@prisma/client';
import { PlannenService } from './plannen.service';
import {
  NieuwDistrictsplanDto,
  NieuwRessortplanDto,
  StatusOvergangDto,
} from './dto';
import { Auth } from '../auth/rbac';
import type { AuthenticatedUser } from '../common/types';

@ApiTags('plannen')
@Controller()
export class PlannenController {
  constructor(private readonly service: PlannenService) {}

  // ─── Ressortplannen ───────────────────────────────────────────────
  @Post('ressortplannen')
  @Auth('ressortplan.create')
  @ApiOperation({
    summary: 'Maak een nieuw ressortplan (versie wordt automatisch verhoogd)',
    description:
      'De ressortcoördinator stelt het plan op met prioriteiten. Indienen ter goedkeuring RR via PATCH /:id/status.',
  })
  async maakRessortplan(@Body() dto: NieuwRessortplanDto, @Req() req: Request) {
    const u = req.user as AuthenticatedUser;
    return this.service.maakRessortplan(dto, u.id, req.ip);
  }

  @Get('ressortplannen')
  @Auth('dashboard.district', 'dashboard.nationaal')
  @ApiOperation({ summary: 'Lijst ressortplannen, filterbaar' })
  async lijstRessortplannen(
    @Query('ressortId') ressortId?: string,
    @Query('jaar') jaar?: string,
    @Query('status') status?: PlanStatus,
  ) {
    return this.service.lijstRessortplannen({
      ressortId: ressortId ? Number(ressortId) : undefined,
      jaar: jaar ? Number(jaar) : undefined,
      status,
    });
  }

  @Get('ressortplannen/:id')
  @Auth('dashboard.district', 'dashboard.nationaal')
  @ApiOperation({ summary: 'Ressortplan + prioriteiten' })
  detailRp(@Param('id', ParseIntPipe) id: number) {
    return this.service.ressortplanDetail(id);
  }

  @Patch('ressortplannen/:id/status')
  @Auth('ressortplan.indienen', 'ressortplan.goedkeur_rr')
  @ApiOperation({
    summary: 'Wijzig status van ressortplan (concept → ter goedkeuring → goedgekeurd)',
  })
  statusRp(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: StatusOvergangDto,
    @Req() req: Request,
  ) {
    const u = req.user as AuthenticatedUser;
    return this.service.wijzigRessortplanStatus(id, dto, u, req.ip);
  }

  // ─── Districtsplannen ─────────────────────────────────────────────
  @Post('districtsplannen')
  @Auth('districtsplan.create')
  @ApiOperation({ summary: 'Maak nieuw districtsplan' })
  async maakDistrictsplan(@Body() dto: NieuwDistrictsplanDto, @Req() req: Request) {
    const u = req.user as AuthenticatedUser;
    return this.service.maakDistrictsplan(dto, u.id, req.ip);
  }

  @Get('districtsplannen')
  @Auth('dashboard.district', 'dashboard.nationaal')
  async lijstDistrictsplannen(
    @Query('districtId') districtId?: string,
    @Query('jaar') jaar?: string,
    @Query('status') status?: PlanStatus,
  ) {
    return this.service.lijstDistrictsplannen({
      districtId: districtId ? Number(districtId) : undefined,
      jaar: jaar ? Number(jaar) : undefined,
      status,
    });
  }

  @Get('districtsplannen/:id')
  @Auth('dashboard.district', 'dashboard.nationaal')
  detailDp(@Param('id', ParseIntPipe) id: number) {
    return this.service.districtsplanDetail(id);
  }

  @Patch('districtsplannen/:id/status')
  @Auth(
    'districtsplan.goedkeur_dr',
    'districtsplan.goedkeur_ro',
    'districtsplan.create',
  )
  statusDp(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: StatusOvergangDto,
    @Req() req: Request,
  ) {
    const u = req.user as AuthenticatedUser;
    return this.service.wijzigDistrictsplanStatus(id, dto, u, req.ip);
  }

  // ─── Aggregatie ───────────────────────────────────────────────────
  @Get('districten/:districtId/ressortplan-aggregatie')
  @Auth('districtsplan.create', 'dashboard.district')
  @ApiOperation({
    summary:
      'Aggregeer goedgekeurde ressortplan-prioriteiten van alle ressorten ' +
      'in een district voor een gegeven jaar (input voor districtsplan)',
  })
  aggregatie(
    @Param('districtId', ParseIntPipe) districtId: number,
    @Query('jaar', ParseIntPipe) jaar: number,
  ) {
    return this.service.aggregatieVoorDistrict(districtId, jaar);
  }
}
