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
import { VerzoekenService } from './verzoeken.service';
import {
  BeantwoordDto,
  IntrekkenDto,
  NieuwVerzoekDto,
  StatusWijzigDto,
  VerzoekBijlagePresignDto,
  VerzoekBijlageRegistreerDto,
} from './dto';
import { Auth } from '../auth/rbac';
import type { AuthenticatedUser } from '../common/types';

@ApiTags('verzoeken')
@Controller('verzoeken')
export class VerzoekenController {
  constructor(private readonly service: VerzoekenService) {}

  // ─── EO5 — dienst (scope ORGANISATIE) ─────────────────────────────
  @Post()
  @Auth('verzoek.indienen')
  @ApiOperation({ summary: 'G2G-verzoek indienen namens eigen organisatie' })
  async indienen(@Body() dto: NieuwVerzoekDto, @Req() req: Request) {
    const u = req.user as AuthenticatedUser;
    return this.service.indienen(dto, u, req.ip);
  }

  @Get('mijn')
  @Auth('verzoek.read.eigen_organisatie')
  @ApiOperation({ summary: 'Verzoeken van de eigen organisatie' })
  @ApiQuery({ name: 'afgehandeld', required: false, enum: ['true', 'false'] })
  @ApiQuery({ name: 'zaaktypeCode', required: false })
  async mijn(
    @Req() req: Request,
    @Query('afgehandeld') afgehandeld?: string,
    @Query('zaaktypeCode') zaaktypeCode?: string,
  ) {
    const u = req.user as AuthenticatedUser;
    return this.service.lijstEigenOrganisatie(u, {
      afgehandeld: parseBool(afgehandeld),
      zaaktypeCode,
    });
  }

  // ─── EO6 — DC (scope DISTRICT) ────────────────────────────────────
  @Get('inbox')
  @Auth('verzoek.read.district')
  @ApiOperation({ summary: 'Inbox: inkomende verzoeken voor een district' })
  @ApiQuery({ name: 'districtId', required: true })
  @ApiQuery({ name: 'afgehandeld', required: false, enum: ['true', 'false'] })
  @ApiQuery({ name: 'zaaktypeCode', required: false })
  async inbox(
    @Req() req: Request,
    @Query('districtId', ParseIntPipe) districtId: number,
    @Query('afgehandeld') afgehandeld?: string,
    @Query('zaaktypeCode') zaaktypeCode?: string,
  ) {
    const u = req.user as AuthenticatedUser;
    return this.service.inbox(districtId, u, {
      afgehandeld: parseBool(afgehandeld),
      zaaktypeCode,
    });
  }

  // ─── Gedeeld — detail ─────────────────────────────────────────────
  @Get(':id')
  @Auth('verzoek.read.eigen_organisatie', 'verzoek.read.district')
  @ApiOperation({ summary: 'Verzoek-detail (dienst of DC; ZF3-vertrouwelijkheid)' })
  async detail(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    const u = req.user as AuthenticatedUser;
    return this.service.detail(id, u);
  }

  @Get(':id/bijlages/:bijlageId/download-url')
  @Auth('verzoek.read.eigen_organisatie', 'verzoek.read.district')
  @ApiOperation({ summary: 'Presigned download-URL voor een verzoek-bijlage' })
  async bijlageDownload(
    @Param('id', ParseIntPipe) id: number,
    @Param('bijlageId', ParseIntPipe) bijlageId: number,
    @Req() req: Request,
  ) {
    const u = req.user as AuthenticatedUser;
    return this.service.bijlageDownloadUrl(id, bijlageId, u);
  }

  // ─── EO5 — intrekken (dienst) ─────────────────────────────────────
  @Post(':id/intrekken')
  @Auth('verzoek.intrekken')
  @ApiOperation({ summary: 'Eigen verzoek intrekken (alleen indien niet afgehandeld)' })
  async intrekken(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: IntrekkenDto,
    @Req() req: Request,
  ) {
    const u = req.user as AuthenticatedUser;
    return this.service.intrekken(id, dto, u, req.ip);
  }

  // ─── EO6 — behandel + beantwoord (DC) ─────────────────────────────
  @Patch(':id/status')
  @Auth('verzoek.behandel')
  @ApiOperation({ summary: 'Tussentijdse statuswijziging (catalogus-gevalideerd)' })
  async wijzigStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: StatusWijzigDto,
    @Req() req: Request,
  ) {
    const u = req.user as AuthenticatedUser;
    return this.service.wijzigStatus(id, dto, u, req.ip);
  }

  @Post(':id/beantwoord')
  @Auth('verzoek.beantwoord')
  @ApiOperation({ summary: 'DC beantwoordt verzoek met resultaat + motivatie' })
  async beantwoord(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: BeantwoordDto,
    @Req() req: Request,
  ) {
    const u = req.user as AuthenticatedUser;
    return this.service.beantwoord(id, dto, u, req.ip);
  }

  // ─── EO7 — bijlages (dienst bij indienen, DC bij behandeling) ─────
  @Post(':id/bijlages/presign')
  @Auth('verzoek.read.eigen_organisatie', 'verzoek.behandel')
  @ApiOperation({ summary: 'Presigned upload-URL voor een verzoek-bijlage' })
  async bijlagePresign(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: VerzoekBijlagePresignDto,
    @Req() req: Request,
  ) {
    const u = req.user as AuthenticatedUser;
    return this.service.bijlagePresign(id, dto, u);
  }

  @Post(':id/bijlages/registreer')
  @Auth('verzoek.read.eigen_organisatie', 'verzoek.behandel')
  @ApiOperation({ summary: 'Registreer een geüploade verzoek-bijlage' })
  async bijlageRegistreer(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: VerzoekBijlageRegistreerDto,
    @Req() req: Request,
  ) {
    const u = req.user as AuthenticatedUser;
    return this.service.bijlageRegistreer(id, dto, u, req.ip);
  }
}

function parseBool(v?: string): boolean | undefined {
  if (v === undefined) return undefined;
  return v === 'true';
}
