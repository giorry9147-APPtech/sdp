import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { customAlphabet } from 'nanoid';
import * as crypto from 'node:crypto';
import { MeldingStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { StorageService } from '../common/storage.service';
import { AuditService } from '../audit/audit.service';
import {
  BijlagePresignDto,
  BijlageRegistreerDto,
  BurgerFeedbackDto,
  EscaleerDto,
  HeropenDto,
  MAX_BIJLAGES_PER_MELDING,
  MAX_BIJLAGE_BYTES,
  NieuweMeldingDto,
  StatusWijzigingDto,
  TOEGESTANE_BIJLAGE_TYPES,
  ToewijzenDto,
} from './dto';

const nano = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 8);

/**
 * Fallback-ketens voor automatische toewijzing wanneer Categorie.
 * standaardToewijzingRol geen treffer geeft (B3). Volgorde = voorkeur.
 */
const TOEWIJZING_FALLBACK_ROLLEN = [
  'meldingen_medewerker',
  'districtssecretaris',
  'dc',
];

@Injectable()
export class MeldingenService {
  private readonly logger = new Logger(MeldingenService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly storage: StorageService,
  ) {}

  // ═══════════════════════════════════════════════════════════════════
  // PUBLIEK — burger zonder account
  // ═══════════════════════════════════════════════════════════════════

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

    // B3 — bepaal auto-toewijzing op basis van categorie
    const toewijzing = await this.bepaalAutoToewijzing(
      dto.districtId,
      cat.standaardToewijzingRol,
    );

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
        toegewezenAanId: toewijzing?.gebruikerId,
        toegewezenOp: toewijzing ? new Date() : undefined,
        status: toewijzing ? 'IN_BEHANDELING' : 'NIEUW',
        events: {
          create: [
            { type: 'aangemaakt', payload: { via: 'publiek-formulier' } },
            ...(toewijzing
              ? [
                  {
                    type: 'auto_toegewezen',
                    payload: {
                      aan: { id: toewijzing.gebruikerId, naam: toewijzing.naam },
                      rol: toewijzing.rolCode,
                      reden: toewijzing.viaFallback
                        ? cat.standaardToewijzingRol
                          ? `geen actieve gebruiker met rol ${cat.standaardToewijzingRol} in district — fallback naar ${toewijzing.rolCode}`
                          : `categorie heeft geen standaardrol — fallback naar ${toewijzing.rolCode}`
                        : `categorie.standaardToewijzingRol=${cat.standaardToewijzingRol}`,
                    } as Prisma.InputJsonValue,
                  },
                ]
              : []),
          ],
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
      context: {
        kanaal: 'publiek',
        autoToegewezenAan: toewijzing?.gebruikerId,
      },
    });

    // Magic-link aanmaken voor burger als email of telefoon meegegeven
    // (terugkoppeling-pagina) — token in response, frontend laat hem aan
    // de melder zien als secundaire toegangsweg naast het ticketnummer.
    let volgToken: string | null = null;
    if ((melding.melderEmail || melding.melderTelefoon) && melding.melderConsent) {
      volgToken = await this.maakMagicLink(melding.id, 'melding-volgen', 30);
    }

    return { melding, volgToken };
  }

  /** Status van melding ophalen op ticketnummer (publiek). */
  async statusOpTicket(ticketNummer: string) {
    const m = await this.prisma.melding.findUnique({
      where: { ticketNummer: ticketNummer.toUpperCase() },
      select: {
        id: true,
        ticketNummer: true,
        status: true,
        titel: true,
        district: { select: { naam: true } },
        ressort: { select: { naam: true } },
        categorie: { select: { naam: true } },
        createdAt: true,
        updatedAt: true,
        burgerBevestigdOp: true,
        burgerHeropendOp: true,
        bijlages: {
          select: { id: true, soort: true, bestandsnaam: true, mimeType: true },
        },
        events: {
          orderBy: { createdAt: 'asc' },
          select: { type: true, payload: true, createdAt: true },
        },
      },
    });
    if (!m) throw new NotFoundException('Onbekend ticketnummer');
    return m;
  }

  // ═══════════════════════════════════════════════════════════════════
  // INTERN — DC / behandelaars
  // ═══════════════════════════════════════════════════════════════════

  async lijstVoorDistrict(
    districtId: number,
    filter: { status?: MeldingStatus; subregioId?: number; ressortId?: number },
  ) {
    return this.prisma.melding.findMany({
      where: {
        districtId,
        status: filter.status,
        ...(filter.subregioId ? { subregioId: filter.subregioId } : {}),
        ...(filter.ressortId ? { ressortId: filter.ressortId } : {}),
      },
      orderBy: [{ urgentie: 'desc' }, { createdAt: 'desc' }],
      include: {
        ressort: { select: { id: true, naam: true } },
        subregio: { select: { id: true, code: true, naam: true } },
        categorie: { select: { id: true, naam: true } },
        toegewezenAan: { select: { id: true, naam: true } },
        _count: { select: { bijlages: true, events: true } },
      },
    });
  }

  /**
   * C4 — Escalatie naar Regering / RO. Voegt een event toe op de
   * melding, bumpt urgentie indien nog niet CRISIS, en zet een
   * audit-entry zodat RO-dashboard 'geescaleerd' kan filteren.
   */
  async escaleer(id: number, dto: EscaleerDto, actorId: string, ip?: string) {
    const m = await this.prisma.melding.findUnique({ where: { id } });
    if (!m) throw new NotFoundException();

    const nieuweUrgentie =
      m.urgentie === 'CRISIS' || m.urgentie === 'HOOG' ? m.urgentie : 'HOOG';

    const nieuw = await this.prisma.melding.update({
      where: { id },
      data: {
        urgentie: nieuweUrgentie,
        events: {
          create: {
            actorId,
            type: 'escalatie_naar_ro',
            payload: {
              vorigeUrgentie: m.urgentie,
              nieuweUrgentie,
              reden: dto.reden,
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
      voor: { urgentie: m.urgentie },
      na: { urgentie: nieuw.urgentie, escalatie: true },
      ip,
      context: { escalatie: true, naar: 'RO', reden: dto.reden },
    });

    return { id: nieuw.id, urgentie: nieuw.urgentie, geescaleerd: true };
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

    const isAfgesloten =
      dto.status === 'GESLOTEN' ||
      dto.status === 'OPGELOST' ||
      dto.status === 'BEVESTIGD_DOOR_BURGER';

    const nieuw = await this.prisma.melding.update({
      where: { id },
      data: {
        status: dto.status,
        geslotenOp: isAfgesloten ? new Date() : null,
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

    // B4 — bij OPGELOST een magic-link genereren voor de melder zodat
    // hij/zij kan bevestigen dat het echt is opgelost. Token wordt
    // teruggegeven; SMTP-koppeling (H1) verstuurt later automatisch.
    let feedbackToken: string | null = null;
    if (
      dto.status === 'OPGELOST' &&
      (oud.melderEmail || oud.melderTelefoon) &&
      oud.melderConsent
    ) {
      feedbackToken = await this.maakMagicLink(id, 'melding-feedback', 14);
      this.logger.log(
        `Burger-feedback magic-link voor melding ${id}: token=${feedbackToken} ` +
          `(stuur naar ${oud.melderEmail ?? oud.melderTelefoon})`,
      );
    }

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

    return { ...nieuw, feedbackToken };
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

  // ═══════════════════════════════════════════════════════════════════
  // B1 — Foto/bestand-bijlages (S3/MinIO)
  // ═══════════════════════════════════════════════════════════════════

  /**
   * Stap 1: client vraagt een presigned upload-URL op basis van ticket.
   * We controleren: melding bestaat, max-aantal niet overschreden,
   * MIME-type toegestaan, grootte binnen limiet.
   */
  async bijlagePresign(ticketNummer: string, dto: BijlagePresignDto) {
    const melding = await this.prisma.melding.findUnique({
      where: { ticketNummer: ticketNummer.toUpperCase() },
      select: { id: true, _count: { select: { bijlages: true } } },
    });
    if (!melding) throw new NotFoundException('Onbekend ticketnummer');

    if (melding._count.bijlages >= MAX_BIJLAGES_PER_MELDING) {
      throw new BadRequestException(
        `Maximaal ${MAX_BIJLAGES_PER_MELDING} bijlages per melding`,
      );
    }
    if (!TOEGESTANE_BIJLAGE_TYPES.includes(dto.mimeType as never)) {
      throw new BadRequestException(`MIME-type ${dto.mimeType} niet toegestaan`);
    }
    if (dto.grootte > MAX_BIJLAGE_BYTES) {
      throw new BadRequestException(
        `Bestand te groot (max ${MAX_BIJLAGE_BYTES} bytes)`,
      );
    }

    const key = this.storage.bijlageKey(melding.id, dto.bestandsnaam);
    const uploadUrl = await this.storage.presignUpload({
      key,
      contentType: dto.mimeType,
      expiresInSec: 300,
    });

    return {
      fileKey: key,
      uploadUrl,
      expiresInSec: 300,
      maxBytes: MAX_BIJLAGE_BYTES,
    };
  }

  /**
   * Stap 2: client meldt na succesvolle PUT dat het bestand in S3 staat.
   * We registreren een MeldingBijlage-rij + event.
   */
  async bijlageRegistreer(
    ticketNummer: string,
    dto: BijlageRegistreerDto,
    ip?: string,
  ) {
    const melding = await this.prisma.melding.findUnique({
      where: { ticketNummer: ticketNummer.toUpperCase() },
      select: { id: true, _count: { select: { bijlages: true } } },
    });
    if (!melding) throw new NotFoundException('Onbekend ticketnummer');

    if (melding._count.bijlages >= MAX_BIJLAGES_PER_MELDING) {
      throw new BadRequestException(
        `Maximaal ${MAX_BIJLAGES_PER_MELDING} bijlages per melding`,
      );
    }
    if (!TOEGESTANE_BIJLAGE_TYPES.includes(dto.mimeType as never)) {
      throw new BadRequestException(`MIME-type ${dto.mimeType} niet toegestaan`);
    }

    const soort = dto.mimeType.startsWith('image/')
      ? 'foto'
      : dto.mimeType === 'application/pdf'
        ? 'document'
        : 'overig';

    const bijlage = await this.prisma.meldingBijlage.create({
      data: {
        meldingId: melding.id,
        fileKey: dto.fileKey,
        soort,
        bestandsnaam: dto.bestandsnaam.slice(0, 255),
        grootte: dto.grootte,
        mimeType: dto.mimeType,
      },
    });

    await this.prisma.meldingEvent.create({
      data: {
        meldingId: melding.id,
        type: 'bijlage_toegevoegd',
        payload: {
          bijlageId: bijlage.id,
          soort,
          bestandsnaam: bijlage.bestandsnaam,
        } as Prisma.InputJsonValue,
      },
    });

    await this.audit.log({
      actie: 'DOCUMENT_UPLOAD',
      entiteitType: 'MeldingBijlage',
      entiteitId: bijlage.id,
      na: { meldingId: melding.id, fileKey: bijlage.fileKey, soort },
      ip,
      context: { kanaal: 'publiek' },
    });

    return {
      id: bijlage.id,
      soort: bijlage.soort,
      bestandsnaam: bijlage.bestandsnaam,
    };
  }

  /** Presigned GET-URL voor een bijlage (intern, RBAC via controller). */
  async bijlageDownloadUrl(meldingId: number, bijlageId: number, actorId: string) {
    const bijlage = await this.prisma.meldingBijlage.findFirst({
      where: { id: bijlageId, meldingId },
    });
    if (!bijlage) throw new NotFoundException('Bijlage niet gevonden');

    const url = await this.storage.presignDownload(bijlage.fileKey, 120);

    await this.audit.log({
      actorId,
      actie: 'DOCUMENT_DOWNLOAD',
      entiteitType: 'MeldingBijlage',
      entiteitId: bijlage.id,
      context: { meldingId, fileKey: bijlage.fileKey },
    });

    return { url, bestandsnaam: bijlage.bestandsnaam, mimeType: bijlage.mimeType };
  }

  // ═══════════════════════════════════════════════════════════════════
  // B4 — Burger-feedback na OPGELOST (via magic-link)
  // ═══════════════════════════════════════════════════════════════════

  async feedbackVanBurger(token: string, dto: BurgerFeedbackDto, ip?: string) {
    const link = await this.consumeMagicLink(token, 'melding-feedback');
    const meldingId = (link.context as { meldingId?: number } | null)?.meldingId;
    if (!meldingId) throw new BadRequestException('Token heeft geen meldingId');

    const m = await this.prisma.melding.findUnique({ where: { id: meldingId } });
    if (!m) throw new NotFoundException();

    if (m.status !== 'OPGELOST') {
      throw new ConflictException(
        `Feedback alleen mogelijk in status OPGELOST (huidige: ${m.status})`,
      );
    }

    const nieuweStatus: MeldingStatus =
      dto.oordeel === 'BEVESTIGD' ? 'BEVESTIGD_DOOR_BURGER' : 'IN_BEHANDELING';

    const nieuw = await this.prisma.melding.update({
      where: { id: meldingId },
      data: {
        status: nieuweStatus,
        burgerBevestigdOp: dto.oordeel === 'BEVESTIGD' ? new Date() : null,
        geslotenOp: dto.oordeel === 'BEVESTIGD' ? new Date() : null,
        events: {
          create: {
            type:
              dto.oordeel === 'BEVESTIGD'
                ? 'burger_bevestigd'
                : 'burger_niet_tevreden',
            payload: {
              oordeel: dto.oordeel,
              opmerking: dto.opmerking,
            } as Prisma.InputJsonValue,
          },
        },
      },
    });

    await this.audit.log({
      actie: 'STATUS_WIJZIGING',
      entiteitType: 'Melding',
      entiteitId: meldingId,
      voor: { status: m.status },
      na: { status: nieuw.status },
      ip,
      context: { kanaal: 'burger-feedback', oordeel: dto.oordeel },
    });

    return {
      ticketNummer: nieuw.ticketNummer,
      status: nieuw.status,
      oordeel: dto.oordeel,
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // B5 — Heropenen door burger
  // ═══════════════════════════════════════════════════════════════════

  async heropenVanBurger(ticketNummer: string, dto: HeropenDto, ip?: string) {
    const m = await this.prisma.melding.findUnique({
      where: { ticketNummer: ticketNummer.toUpperCase() },
    });
    if (!m) throw new NotFoundException('Onbekend ticketnummer');

    const heropenbaar: MeldingStatus[] = [
      'OPGELOST',
      'GESLOTEN',
      'BEVESTIGD_DOOR_BURGER',
    ];
    if (!heropenbaar.includes(m.status)) {
      throw new ConflictException(
        `Heropenen niet mogelijk vanaf status ${m.status}`,
      );
    }

    const nieuw = await this.prisma.melding.update({
      where: { id: m.id },
      data: {
        status: 'HEROPEND',
        burgerHeropendOp: new Date(),
        geslotenOp: null,
        events: {
          create: {
            type: 'burger_heropend',
            payload: {
              vorigeStatus: m.status,
              reden: dto.reden,
            } as Prisma.InputJsonValue,
          },
        },
      },
    });

    await this.audit.log({
      actie: 'STATUS_WIJZIGING',
      entiteitType: 'Melding',
      entiteitId: m.id,
      voor: { status: m.status },
      na: { status: nieuw.status },
      ip,
      context: { kanaal: 'burger-heropen', reden: dto.reden },
    });

    return { ticketNummer: nieuw.ticketNummer, status: nieuw.status };
  }

  // ═══════════════════════════════════════════════════════════════════
  // INTERNE HELPERS
  // ═══════════════════════════════════════════════════════════════════

  private async genereerTicketnummer(districtCode: string): Promise<string> {
    const jaar = new Date().getFullYear();
    // Bv. MLD-2026-WAN-7K3F2BJM
    return `MLD-${jaar}-${districtCode}-${nano()}`;
  }

  /**
   * B3 — vind eerste actieve gebruiker in district met de gewenste rol.
   * Probeert eerst de in de categorie ingestelde rol; valt anders terug
   * op een keten (meldingen_medewerker → districtssecretaris → dc).
   */
  private async bepaalAutoToewijzing(
    districtId: number,
    voorkeurRolCode: string | null,
  ): Promise<
    | { gebruikerId: string; naam: string; rolCode: string; viaFallback: boolean }
    | null
  > {
    const probeer = async (rolCode: string) => {
      const rol = await this.prisma.rol.findUnique({ where: { code: rolCode } });
      if (!rol) return null;
      const gr = await this.prisma.gebruikerRol.findFirst({
        where: {
          rolId: rol.id,
          OR: [{ geldigTot: null }, { geldigTot: { gt: new Date() } }],
          // DC + DR-rollen scoping op district; nationale rollen worden niet
          // gebruikt voor auto-toewijzing van meldingen.
          districtId,
          gebruiker: { status: 'ACTIEF' },
        },
        include: { gebruiker: { select: { id: true, naam: true } } },
        orderBy: { createdAt: 'asc' },
      });
      return gr ? { gebruikerId: gr.gebruiker.id, naam: gr.gebruiker.naam, rolCode } : null;
    };

    if (voorkeurRolCode) {
      const hit = await probeer(voorkeurRolCode);
      if (hit) return { ...hit, viaFallback: false };
    }
    for (const rolCode of TOEWIJZING_FALLBACK_ROLLEN) {
      if (rolCode === voorkeurRolCode) continue;
      const hit = await probeer(rolCode);
      if (hit) return { ...hit, viaFallback: true };
    }
    return null;
  }

  /** Maak een magic-link met gegeven doel + TTL in dagen. */
  private async maakMagicLink(
    meldingId: number,
    doel: 'melding-volgen' | 'melding-feedback',
    ttlDagen: number,
  ): Promise<string> {
    const token = crypto.randomBytes(32).toString('base64url');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    await this.prisma.magicLink.create({
      data: {
        tokenHash,
        doel,
        context: { meldingId } as Prisma.InputJsonValue,
        verlooptOp: new Date(Date.now() + ttlDagen * 86_400_000),
      },
    });
    return token;
  }

  /**
   * Verifieer + consumeer (one-shot) een magic-link met het gegeven doel.
   * Bij volgen-token mag hergebruik; bij feedback-token niet (we markeren
   * `gebruiktOp`). Voor MVP: feedback is one-shot, volgen is N keer.
   */
  private async consumeMagicLink(
    token: string,
    doel: 'melding-volgen' | 'melding-feedback',
  ) {
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    const link = await this.prisma.magicLink.findUnique({ where: { tokenHash } });
    if (!link || link.doel !== doel) {
      throw new NotFoundException('Token ongeldig of onbekend');
    }
    if (link.verlooptOp < new Date()) {
      throw new BadRequestException('Token verlopen');
    }
    if (link.gebruiktOp && doel === 'melding-feedback') {
      throw new ConflictException('Token reeds gebruikt');
    }
    if (doel === 'melding-feedback') {
      await this.prisma.magicLink.update({
        where: { id: link.id },
        data: { gebruiktOp: new Date() },
      });
    }
    return link;
  }
}
