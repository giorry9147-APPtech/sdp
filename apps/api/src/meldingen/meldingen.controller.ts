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
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import type { Request } from 'express';
import { MeldingStatus } from '@prisma/client';
import { MeldingenService } from './meldingen.service';
import { NieuweMeldingDto, StatusWijzigingDto, ToewijzenDto } from './dto';
import { Auth } from '../auth/rbac';
import type { AuthenticatedUser } from '../common/types';

@ApiTags('meldingen')
@Controller('meldingen')
export class MeldingenController {
  constructor(private readonly service: MeldingenService) {}

  // ─── Publiek ──────────────────────────────────────────────────────
  @Post()
  @ApiTags('publiek')
  @ApiOperation({
    summary: 'Burger meldt openbare-ruimte probleem (zonder login)',
    description:
      'Geeft ticketnummer terug. Burger kan via GET /meldingen/ticket/:nr de status volgen.',
  })
  async indienen(@Body() dto: NieuweMeldingDto, @Req() req: Request) {
    const m = await this.service.indienenPubliek(dto, req.ip);
    return {
      ticketNummer: m.ticketNummer,
      status: m.status,
      district: m.district.naam,
      ressort: m.ressort?.naam,
      categorie: m.categorie.naam,
    };
  }

  @Get('ticket/:nr')
  @ApiTags('publiek')
  @ApiOperation({ summary: 'Status van melding op ticketnummer (publiek)' })
  async status(@Param('nr') nr: string) {
    return this.service.statusOpTicket(nr);
  }

  // ─── Intern (auth vereist) ────────────────────────────────────────
  @Get()
  @Auth('melding.read.district', 'melding.read.nationaal')
  @ApiOperation({ summary: 'Lijst meldingen — scope op rol' })
  @ApiQuery({ name: 'districtId', required: true })
  @ApiQuery({ name: 'status', required: false, enum: MeldingStatus })
  @ApiQuery({ name: 'subregioId', required: false, description: 'Filter op DC-cluster' })
  async lijst(
    @Query('districtId', ParseIntPipe) districtId: number,
    @Query('status') status?: MeldingStatus,
    @Query('subregioId') subregioId?: string,
  ) {
    return this.service.lijstVoorDistrict(districtId, {
      status,
      subregioId: subregioId ? Number(subregioId) : undefined,
    });
  }

  @Get(':id')
  @Auth('melding.read.district', 'melding.read.nationaal')
  @ApiOperation({ summary: 'Detail van een melding' })
  async detail(@Param('id', ParseIntPipe) id: number) {
    return this.service.detail(id);
  }

  @Patch(':id/status')
  @Auth('melding.behandel')
  @ApiOperation({ summary: 'Wijzig status van melding' })
  async statusWijzig(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: StatusWijzigingDto,
    @Req() req: Request,
  ) {
    const u = req.user as AuthenticatedUser;
    return this.service.wijzigStatus(id, dto, u.id, req.ip);
  }

  @Patch(':id/toewijzen')
  @Auth('melding.behandel')
  @ApiOperation({ summary: 'Wijs melding toe aan medewerker' })
  async toewijzen(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: ToewijzenDto,
    @Req() req: Request,
  ) {
    const u = req.user as AuthenticatedUser;
    return this.service.toewijzen(id, dto, u.id, req.ip);
  }
}
