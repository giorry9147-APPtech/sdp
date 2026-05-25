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
import type { Request } from 'express';
import { customAlphabet } from 'nanoid';
import { Prisma, VergunningStatus } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { AuditService } from '../audit/audit.service';
import { Auth } from '../auth/rbac';
import type { AuthenticatedUser } from '../common/types';
import { BesluitDto, PubliekeAanvraagDto, StatusWijzigingDto } from './dto';

const nano = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 6);

@Controller('vergunningen')
export class VergunningenController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ─── Publiek ──────────────────────────────────────────────────────
  @Post()
  @ApiTags('publiek')
  @ApiOperation({
    summary: 'Vergunning aanvragen (publiek — geen account vereist)',
    description:
      'Aanvrager geeft contact-info zelf op. Bij ONDERNEMING is KKF-nummer ' +
      'verplicht. Geeft referentienummer terug waarmee de status gevolgd kan ' +
      'worden via GET /vergunningen/ref/:ref.',
  })
  async aanvraag(@Body() dto: PubliekeAanvraagDto, @Req() req: Request) {
    const d = await this.prisma.district.findUnique({
      where: { id: dto.districtId },
    });
    if (!d) throw new BadRequestException(`District ${dto.districtId} bestaat niet`);

    const cat = await this.prisma.categorie.findUnique({
      where: { id: dto.categorieId },
    });
    if (!cat || cat.type !== 'VERGUNNING') {
      throw new BadRequestException('Ongeldige vergunning-categorie');
    }

    const ref = `VRG-${new Date().getFullYear()}-${d.code}-${nano()}`;
    const v = await this.prisma.vergunning.create({
      data: {
        referentie: ref,
        categorieId: dto.categorieId,
        districtId: dto.districtId,
        titel: dto.titel,
        beschrijving: dto.beschrijving,
        locatieOmschrijving: dto.locatieOmschrijving,
        aanvragerSoort: dto.aanvragerSoort,
        aanvragerNaam: dto.aanvragerNaam,
        aanvragerTelefoon: dto.aanvragerTelefoon,
        aanvragerEmail: dto.aanvragerEmail.toLowerCase(),
        aanvragerKkfNummer: dto.aanvragerKkfNummer,
        status: 'INGEDIEND',
        ingediendOp: new Date(),
        events: {
          create: {
            type: 'ingediend',
            payload: { via: 'publiek-formulier' } as Prisma.InputJsonValue,
          },
        },
      },
      include: { district: true, categorie: true },
    });

    await this.audit.log({
      actie: 'CREATE',
      entiteitType: 'Vergunning',
      entiteitId: v.id,
      na: { referentie: v.referentie, districtId: v.districtId },
      ip: req.ip,
      context: { kanaal: 'publiek' },
    });

    return {
      referentie: v.referentie,
      status: v.status,
      district: v.district.naam,
      categorie: v.categorie.naam,
      ingediendOp: v.ingediendOp,
    };
  }

  @Get('ref/:ref')
  @ApiTags('publiek')
  @ApiOperation({ summary: 'Status van vergunning op referentienummer (publiek)' })
  async statusOpRef(@Param('ref') ref: string) {
    const v = await this.prisma.vergunning.findUnique({
      where: { referentie: ref.toUpperCase() },
      select: {
        referentie: true,
        status: true,
        titel: true,
        beschrijving: true,
        locatieOmschrijving: true,
        ingediendOp: true,
        beslotenOp: true,
        besluit: true,
        district: { select: { naam: true } },
        categorie: { select: { naam: true } },
        events: {
          orderBy: { createdAt: 'asc' },
          select: { type: true, payload: true, createdAt: true },
        },
      },
    });
    if (!v) throw new NotFoundException('Onbekend referentienummer');
    return v;
  }

  // ─── Intern (auth vereist) ────────────────────────────────────────
  @Get()
  @Auth('vergunning.read.district', 'vergunning.read.nationaal')
  @ApiTags('vergunningen')
  @ApiOperation({ summary: 'Lijst vergunningen per district (DC + medewerker)' })
  @ApiQuery({ name: 'subregioId', required: false, description: 'Filter op DC-cluster' })
  async lijst(
    @Query('districtId', ParseIntPipe) districtId: number,
    @Query('status') status?: VergunningStatus,
    @Query('subregioId') subregioId?: string,
  ) {
    return this.prisma.vergunning.findMany({
      where: {
        districtId,
        status,
        ...(subregioId ? { subregioId: Number(subregioId) } : {}),
      },
      orderBy: [{ status: 'asc' }, { createdAt: 'desc' }],
      include: {
        categorie: { select: { id: true, naam: true } },
        subregio: { select: { id: true, code: true, naam: true } },
        aanvrager: { select: { id: true, naam: true, email: true } },
      },
    });
  }

  @Get(':id')
  @Auth('vergunning.read.district', 'vergunning.read.nationaal')
  @ApiTags('vergunningen')
  async detail(@Param('id', ParseIntPipe) id: number) {
    const v = await this.prisma.vergunning.findUnique({
      where: { id },
      include: {
        categorie: true,
        district: true,
        aanvrager: { select: { id: true, naam: true, email: true } },
        documenten: true,
        events: {
          orderBy: { createdAt: 'asc' },
          include: { actor: { select: { id: true, naam: true } } },
        },
      },
    });
    if (!v) throw new NotFoundException();
    return v;
  }

  @Patch(':id/status')
  @Auth('vergunning.behandel')
  @ApiTags('vergunningen')
  @ApiOperation({
    summary: 'Tussentijdse status-wijziging (IN_BEHANDELING, EXTRA_INFO_NODIG, etc.)',
  })
  async wijzigStatus(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: StatusWijzigingDto,
    @Req() req: Request,
  ) {
    if (dto.status === 'GOEDGEKEURD' || dto.status === 'AFGEWEZEN') {
      throw new BadRequestException(
        'Eindbesluit (goedkeur/afwijzing) gaat via POST /:id/besluit',
      );
    }

    const u = req.user as AuthenticatedUser;
    const oud = await this.prisma.vergunning.findUnique({ where: { id } });
    if (!oud) throw new NotFoundException();

    if (oud.beslotenOp) {
      throw new BadRequestException(
        'Eindbesluit is al genomen; status kan niet meer gewijzigd worden',
      );
    }

    const nieuw = await this.prisma.vergunning.update({
      where: { id },
      data: {
        status: dto.status,
        events: {
          create: {
            actorId: u.id,
            type: 'status_gewijzigd',
            payload: {
              van: oud.status,
              naar: dto.status,
              opmerking: dto.opmerking,
            } as Prisma.InputJsonValue,
          },
        },
      },
    });

    await this.audit.log({
      actorId: u.id,
      actie: 'STATUS_WIJZIGING',
      entiteitType: 'Vergunning',
      entiteitId: id,
      voor: { status: oud.status },
      na: { status: nieuw.status },
      ip: req.ip,
      context: { opmerking: dto.opmerking },
    });

    return nieuw;
  }

  @Post(':id/besluit')
  @Auth('vergunning.goedkeur')
  @ApiTags('vergunningen')
  @ApiOperation({ summary: 'DC neemt eindbesluit: goedkeuren of afwijzen' })
  async besluit(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: BesluitDto,
    @Req() req: Request,
  ) {
    if (dto.status !== 'GOEDGEKEURD' && dto.status !== 'AFGEWEZEN') {
      throw new BadRequestException(
        'Eindbesluit moet GOEDGEKEURD of AFGEWEZEN zijn',
      );
    }

    const u = req.user as AuthenticatedUser;
    const oud = await this.prisma.vergunning.findUnique({ where: { id } });
    if (!oud) throw new NotFoundException();
    if (oud.beslotenOp) {
      throw new BadRequestException('Er is al een besluit genomen');
    }

    const nieuw = await this.prisma.vergunning.update({
      where: { id },
      data: {
        status: dto.status,
        besluit: dto.besluit,
        besluitDoorId: u.id,
        beslotenOp: new Date(),
        events: {
          create: {
            actorId: u.id,
            type: 'besluit',
            payload: {
              status: dto.status,
              besluit: dto.besluit,
            } as Prisma.InputJsonValue,
          },
        },
      },
    });

    await this.audit.log({
      actorId: u.id,
      actie: 'BESLUIT_GENOMEN',
      entiteitType: 'Vergunning',
      entiteitId: id,
      voor: { status: oud.status },
      na: { status: nieuw.status },
      ip: req.ip,
      context: { besluit: dto.besluit },
    });

    return nieuw;
  }
}
