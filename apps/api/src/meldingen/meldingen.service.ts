import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { customAlphabet } from 'nanoid';
import { MeldingStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { AuditService } from '../audit/audit.service';
import type { NieuweMeldingDto, StatusWijzigingDto, ToewijzenDto } from './dto';

const nano = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 8);

@Injectable()
export class MeldingenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  /**
   * Publieke melding — geen authenticatie vereist. Burger ontvangt
   * ticketnummer + optioneel een magic-link om de status te volgen.
   */
  async indienenPubliek(dto: NieuweMeldingDto, ip?: string) {
    const district = await this.prisma.district.findUnique({
      where: { id: dto.districtId },
    });
    if (!district) {
      throw new BadRequestException(`District ${dto.districtId} bestaat niet`);
    }

    if (dto.ressortId) {
      const r = await this.prisma.ressort.findUnique({ where: { id: dto.ressortId } });
      if (!r || r.districtId !== dto.districtId) {
        throw new BadRequestException(
          `Ressort ${dto.ressortId} hoort niet bij district ${dto.districtId}`,
        );
      }
    }

    const cat = await this.prisma.categorie.findUnique({
      where: { id: dto.categorieId },
    });
    if (!cat || cat.type !== 'MELDING') {
      throw new BadRequestException('Ongeldige melding-categorie');
    }

    const ticket = await this.genereerTicketnummer(district.code);

    const melding = await this.prisma.melding.create({
      data: {
        ticketNummer: ticket,
        districtId: dto.districtId,
        ressortId: dto.ressortId,
        categorieId: dto.categorieId,
        titel: dto.titel,
        omschrijving: dto.omschrijving,
        locatieOmschrijving: dto.locatieOmschrijving,
        urgentie: dto.urgentie ?? 'MIDDEL',
        melderNaam: dto.melderNaam,
        melderTelefoon: dto.melderTelefoon,
        melderEmail: dto.melderEmail?.toLowerCase(),
        melderConsent: dto.melderConsent ?? false,
        events: {
          create: {
            type: 'aangemaakt',
            payload: { via: 'publiek-formulier' },
          },
        },
      },
      include: { district: true, ressort: true, categorie: true },
    });

    // GIS-punt apart updaten (Prisma kan Unsupported types niet typed schrijven)
    if (dto.latitude != null && dto.longitude != null) {
      await this.prisma.$executeRawUnsafe(
        `UPDATE meldingen SET geom = ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography WHERE id = $3`,
        dto.longitude,
        dto.latitude,
        melding.id,
      );
    }

    await this.audit.log({
      actie: 'CREATE',
      entiteitType: 'Melding',
      entiteitId: melding.id,
      na: { ticket: melding.ticketNummer, districtId: melding.districtId },
      ip,
      context: { kanaal: 'publiek' },
    });

    return melding;
  }

  /** Status van melding ophalen op ticketnummer (publiek). */
  async statusOpTicket(ticketNummer: string) {
    const m = await this.prisma.melding.findUnique({
      where: { ticketNummer: ticketNummer.toUpperCase() },
      select: {
        ticketNummer: true,
        status: true,
        titel: true,
        district: { select: { naam: true } },
        ressort: { select: { naam: true } },
        categorie: { select: { naam: true } },
        createdAt: true,
        updatedAt: true,
        events: {
          orderBy: { createdAt: 'asc' },
          select: { type: true, payload: true, createdAt: true },
        },
      },
    });
    if (!m) throw new NotFoundException('Onbekend ticketnummer');
    return m;
  }

  /** Voor DC/secretaris — lijst meldingen in eigen district. */
  async lijstVoorDistrict(districtId: number, filter: { status?: MeldingStatus }) {
    return this.prisma.melding.findMany({
      where: { districtId, status: filter.status },
      orderBy: [{ urgentie: 'desc' }, { createdAt: 'desc' }],
      include: {
        ressort: { select: { id: true, naam: true } },
        categorie: { select: { id: true, naam: true } },
        toegewezenAan: { select: { id: true, naam: true } },
        _count: { select: { bijlages: true, events: true } },
      },
    });
  }

  async detail(id: number) {
    const m = await this.prisma.melding.findUnique({
      where: { id },
      include: {
        district: true,
        ressort: true,
        categorie: true,
        toegewezenAan: { select: { id: true, naam: true, email: true } },
        bijlages: true,
        events: {
          orderBy: { createdAt: 'asc' },
          include: { actor: { select: { id: true, naam: true } } },
        },
      },
    });
    if (!m) throw new NotFoundException();
    return m;
  }

  async wijzigStatus(
    id: number,
    dto: StatusWijzigingDto,
    actorId: string,
    ip?: string,
  ) {
    const oud = await this.prisma.melding.findUnique({ where: { id } });
    if (!oud) throw new NotFoundException();

    const nieuw = await this.prisma.melding.update({
      where: { id },
      data: {
        status: dto.status,
        geslotenOp:
          dto.status === 'GESLOTEN' || dto.status === 'OPGELOST'
            ? new Date()
            : null,
        events: {
          create: {
            actorId,
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
      actorId,
      actie: 'STATUS_WIJZIGING',
      entiteitType: 'Melding',
      entiteitId: id,
      voor: { status: oud.status },
      na: { status: nieuw.status },
      ip,
      context: { opmerking: dto.opmerking },
    });

    return nieuw;
  }

  async toewijzen(
    id: number,
    dto: ToewijzenDto,
    actorId: string,
    ip?: string,
  ) {
    const oud = await this.prisma.melding.findUnique({ where: { id } });
    if (!oud) throw new NotFoundException();

    const target = await this.prisma.gebruiker.findUnique({
      where: { id: dto.toegewezenAanId },
    });
    if (!target) throw new BadRequestException('Onbekende gebruiker');

    const nieuw = await this.prisma.melding.update({
      where: { id },
      data: {
        toegewezenAanId: dto.toegewezenAanId,
        toegewezenOp: new Date(),
        status: oud.status === 'NIEUW' ? 'IN_BEHANDELING' : oud.status,
        events: {
          create: {
            actorId,
            type: 'toegewezen',
            payload: {
              aan: { id: target.id, naam: target.naam },
            } as Prisma.InputJsonValue,
          },
        },
      },
    });

    await this.audit.log({
      actorId,
      actie: 'UPDATE',
      entiteitType: 'Melding',
      entiteitId: id,
      voor: { toegewezenAanId: oud.toegewezenAanId },
      na: { toegewezenAanId: nieuw.toegewezenAanId },
      ip,
    });

    return nieuw;
  }

  private async genereerTicketnummer(districtCode: string): Promise<string> {
    const jaar = new Date().getFullYear();
    // Bv. MLD-2026-WAN-7K3F2BJM
    return `MLD-${jaar}-${districtCode}-${nano()}`;
  }
}
