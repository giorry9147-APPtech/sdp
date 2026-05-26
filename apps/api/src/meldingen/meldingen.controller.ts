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
import {
  BijlagePresignDto,
  BijlageRegistreerDto,
  BurgerFeedbackDto,
  EscaleerDto,
  HeropenDto,
  NieuweMeldingDto,
  StatusWijzigingDto,
  ToewijzenDto,
} from './dto';
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
      'Geeft ticketnummer + (indien melder-consent) een volg-token voor ' +
      'de status-pagina. Auto-toewijzing op basis van categorie.',
  })
  async indienen(@Body() dto: NieuweMeldingDto, @Req() req: Request) {
    const { melding, volgToken } = await this.service.indienenPubliek(dto, req.ip);
    return {
      ticketNummer: melding.ticketNummer,
      status: melding.status,
      district: melding.district.naam,
      ressort: melding.ressort?.naam,
      categorie: melding.categorie.naam,
      autoToegewezen: melding.toegewezenAanId != null,
      volgToken,
    };
  }

  @Get('ticket/:nr')
  @ApiTags('publiek')
  @ApiOperation({ summary: 'Status van melding op ticketnummer (publiek)' })
  async status(@Param('nr') nr: string) {
    return this.service.statusOpTicket(nr);
  }

  // ─── B1 — Foto-/bestand-upload (publiek, per ticket) ──────────────
  @Post('ticket/:nr/bijlages/presign')
  @ApiTags('publiek')
  @ApiOperation({
    summary: 'Vraag presigned upload-URL voor een bijlage (foto/PDF)',
    description: `Max 5 bijlages per melding, max 5 MB per bestand. ` +
      `Toegestane MIME: image/jpeg, image/png, image/webp, image/heic, image/heif, application/pdf.`,
  })
  async bijlagePresign(
    @Param('nr') nr: string,
    @Body() dto: BijlagePresignDto,
  ) {
    return this.service.bijlagePresign(nr, dto);
  }

  @Post('ticket/:nr/bijlages/registreer')
  @ApiTags('publiek')
  @ApiOperation({
    summary: 'Registreer een geüploade bijlage na succesvolle PUT naar S3',
  })
  async bijlageRegistreer(
    @Param('nr') nr: string,
    @Body() dto: BijlageRegistreerDto,
    @Req() req: Request,
  ) {
    return this.service.bijlageRegistreer(nr, dto, req.ip);
  }

  // ─── B4 — Burger-feedback (publiek, magic-link) ───────────────────
  @Post('feedback/:token')
  @ApiTags('publiek')
  @ApiOperation({
    summary: 'Burger geeft terugkoppeling na OPGELOST via magic-link token',
  })
  async burgerFeedback(
    @Param('token') token: string,
    @Body() dto: BurgerFeedbackDto,
    @Req() req: Request,
  ) {
    return this.service.feedbackVanBurger(token, dto, req.ip);
  }

  // ─── B5 — Heropenen (publiek, ticketnummer als identiteit) ────────
  @Post('ticket/:nr/heropen')
  @ApiTags('publiek')
  @ApiOperation({
    summary: 'Burger heropent een eerder gesloten melding (probleem terug)',
  })
  async heropen(
    @Param('nr') nr: string,
    @Body() dto: HeropenDto,
    @Req() req: Request,
  ) {
    return this.service.heropenVanBurger(nr, dto, req.ip);
  }

  // ─── Intern (auth vereist) ────────────────────────────────────────
  @Get()
  @Auth('melding.read.district', 'melding.read.nationaal')
  @ApiOperation({ summary: 'Lijst meldingen — scope op rol' })
  @ApiQuery({ name: 'districtId', required: true })
  @ApiQuery({ name: 'status', required: false, enum: MeldingStatus })
  @ApiQuery({ name: 'subregioId', required: false, description: 'Filter op DC-cluster' })
  @ApiQuery({ name: 'ressortId', required: false, description: 'Filter op één ressort (C6)' })
  async lijst(
    @Query('districtId', ParseIntPipe) districtId: number,
    @Query('status') status?: MeldingStatus,
    @Query('subregioId') subregioId?: string,
    @Query('ressortId') ressortId?: string,
  ) {
    return this.service.lijstVoorDistrict(districtId, {
      status,
      subregioId: subregioId ? Number(subregioId) : undefined,
      ressortId: ressortId ? Number(ressortId) : undefined,
    });
  }

  @Get(':id')
  @Auth('melding.read.district', 'melding.read.nationaal')
  @ApiOperation({ summary: 'Detail van een melding' })
  async detail(@Param('id', ParseIntPipe) id: number) {
    return this.service.detail(id);
  }

  @Get(':id/bijlages/:bijlageId/download-url')
  @Auth('melding.read.district', 'melding.read.nationaal')
  @ApiOperation({ summary: 'Presigned download-URL voor een melding-bijlage' })
  async bijlageDownload(
    @Param('id', ParseIntPipe) id: number,
    @Param('bijlageId', ParseIntPipe) bijlageId: number,
    @Req() req: Request,
  ) {
    const u = req.user as AuthenticatedUser;
    return this.service.bijlageDownloadUrl(id, bijlageId, u.id);
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

  // C4 — Escalatie naar RO via dashboard quick-action
  @Post(':id/escaleer')
  @Auth('melding.behandel')
  @ApiOperation({ summary: 'Escaleer melding naar RO (urgentie + audit + event)' })
  async escaleer(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: EscaleerDto,
    @Req() req: Request,
  ) {
    const u = req.user as AuthenticatedUser;
    return this.service.escaleer(id, dto, u.id, req.ip);
  }
}
