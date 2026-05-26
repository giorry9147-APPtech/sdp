import {
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Query,
  Req,
} from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { Auth } from '../auth/rbac';
import { DashboardsService } from './dashboards.service';
import type { AuthenticatedUser } from '../common/types';

@ApiTags('dashboards')
@Controller('dashboards')
export class DashboardsController {
  constructor(private readonly service: DashboardsService) {}

  /**
   * DC-dashboard per district — alle live-tegels die de DC dagelijks
   * nodig heeft. Volgt het ontwerp uit docs/02-componenten.md §C.
   * Met optionele ressort- en subregio-filter (C6).
   */
  @Get('district/:districtId')
  @Auth('dashboard.district', 'dashboard.nationaal')
  @ApiOperation({ summary: 'DC-dashboard cijfers voor één district' })
  @ApiQuery({ name: 'ressortId', required: false })
  @ApiQuery({ name: 'subregioId', required: false })
  async district(
    @Param('districtId', ParseIntPipe) districtId: number,
    @Query('ressortId') ressortId?: string,
    @Query('subregioId') subregioId?: string,
  ) {
    return this.service.dcDashboard(districtId, {
      ressortId: ressortId ? Number(ressortId) : undefined,
      subregioId: subregioId ? Number(subregioId) : undefined,
    });
  }

  /**
   * C1 — Trendgrafiek over N dagen (default 30, max 365) voor meldingen
   * en vergunningen.
   */
  @Get('district/:districtId/trend')
  @Auth('dashboard.district', 'dashboard.nationaal')
  @ApiOperation({ summary: 'Dagelijkse instroom-cijfers voor trendgrafiek' })
  @ApiQuery({ name: 'dagen', required: false, description: 'aantal dagen (1-365)' })
  @ApiQuery({ name: 'ressortId', required: false })
  @ApiQuery({ name: 'subregioId', required: false })
  async trend(
    @Param('districtId', ParseIntPipe) districtId: number,
    @Query('dagen') dagen?: string,
    @Query('ressortId') ressortId?: string,
    @Query('subregioId') subregioId?: string,
  ) {
    return this.service.trend(districtId, {
      dagen: dagen ? Number(dagen) : 30,
      ressortId: ressortId ? Number(ressortId) : undefined,
      subregioId: subregioId ? Number(subregioId) : undefined,
    });
  }

  /**
   * C2 — Top-5 categorieën meldingen voor configureerbare periode +
   * scope. Staat los van het basis-dashboard zodat het frontend de
   * periode per tegel kan instellen.
   */
  @Get('district/:districtId/categorie-top5')
  @Auth('dashboard.district', 'dashboard.nationaal')
  @ApiOperation({ summary: 'Top-5 meldingen-categorieën' })
  @ApiQuery({ name: 'dagen', required: false })
  @ApiQuery({ name: 'ressortId', required: false })
  @ApiQuery({ name: 'subregioId', required: false })
  async categorieTop5(
    @Param('districtId', ParseIntPipe) districtId: number,
    @Query('dagen') dagen?: string,
    @Query('ressortId') ressortId?: string,
    @Query('subregioId') subregioId?: string,
  ) {
    return this.service.topCategorieen({
      districtId,
      dagen: dagen ? Number(dagen) : 30,
      ressortId: ressortId ? Number(ressortId) : undefined,
      subregioId: subregioId ? Number(subregioId) : undefined,
    });
  }

  /**
   * C5 — Recent gesloten dossiers (controlemoment voor DC).
   */
  @Get('district/:districtId/recent-gesloten')
  @Auth('dashboard.district', 'dashboard.nationaal')
  @ApiOperation({ summary: 'Dossiers afgesloten in de laatste N dagen' })
  @ApiQuery({ name: 'dagen', required: false })
  @ApiQuery({ name: 'ressortId', required: false })
  @ApiQuery({ name: 'subregioId', required: false })
  async recentGesloten(
    @Param('districtId', ParseIntPipe) districtId: number,
    @Query('dagen') dagen?: string,
    @Query('ressortId') ressortId?: string,
    @Query('subregioId') subregioId?: string,
  ) {
    return this.service.recentGesloten(districtId, {
      dagen: dagen ? Number(dagen) : 7,
      ressortId: ressortId ? Number(ressortId) : undefined,
      subregioId: subregioId ? Number(subregioId) : undefined,
    });
  }

  /**
   * C3 — Mijn taken: cross-module lijst van wat op deze gebruiker
   * wacht. Doelt op werkdag-startscherm "wat heb ik vandaag te doen?".
   */
  @Get('mijn-taken')
  @Auth()
  @ApiOperation({ summary: 'Cross-module taken-overzicht voor ingelogde gebruiker' })
  async mijnTaken(@Req() req: Request) {
    const u = req.user as AuthenticatedUser;
    const rolDistrictIds = Array.from(
      new Set(
        u.rollen
          .map((r) => r.districtId)
          .filter((v): v is number => typeof v === 'number'),
      ),
    );
    return this.service.mijnTaken(u.id, u.permissies, rolDistrictIds);
  }

  /**
   * Nationaal dashboard voor RO — overzicht alle districten.
   */
  @Get('nationaal')
  @Auth('dashboard.nationaal')
  @ApiOperation({ summary: 'Nationaal dashboard (RO)' })
  async nationaal() {
    return this.service.nationaal();
  }
}
