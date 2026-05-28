import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { customAlphabet } from 'nanoid';
import { Prisma, Vertrouwelijkheid } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { StorageService } from '../common/storage.service';
import { AuditService } from '../audit/audit.service';
import { ZaaktypenService } from '../zaaktypen/zaaktypen.service';
import type { AuthenticatedUser } from '../common/types';
import {
  BeantwoordDto,
  IntrekkenDto,
  MAX_VERZOEK_BIJLAGES,
  MAX_VERZOEK_BIJLAGE_BYTES,
  NieuwVerzoekDto,
  StatusWijzigDto,
  TOEGESTANE_VERZOEK_BIJLAGE_TYPES,
  VerzoekBijlagePresignDto,
  VerzoekBijlageRegistreerDto,
} from './dto';

const nano = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 6);

@Injectable()
export class VerzoekenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
    private readonly zaaktypen: ZaaktypenService,
    private readonly storage: StorageService,
  ) {}

  // ═══════════════════════════════════════════════════════════════════
  // EO5 — dienst-kant (scope ORGANISATIE)
  // ═══════════════════════════════════════════════════════════════════

  /** Externe dienst dient een G2G-verzoek in (zie EO4). */
  async indienen(dto: NieuwVerzoekDto, user: AuthenticatedUser, ip?: string) {
    const bronOrganisatieId = this.eigenOrganisatieId(user);

    const zaaktype = await this.zaaktypen.vereisZaaktype(dto.zaaktypeCode);
    if (zaaktype.kanaal !== 'G2G') {
      throw new BadRequestException(`Zaaktype ${dto.zaaktypeCode} is geen G2G-verzoek`);
    }

    const district = await this.prisma.district.findUnique({ where: { id: dto.districtId } });
    if (!district) throw new BadRequestException(`District ${dto.districtId} bestaat niet`);

    if (dto.ressortId) {
      const r = await this.prisma.ressort.findUnique({ where: { id: dto.ressortId } });
      if (!r || r.districtId !== dto.districtId) {
        throw new BadRequestException('Ressort hoort niet bij district');
      }
    }

    const eigenschappen = await this.zaaktypen.valideerEigenschappen(
      zaaktype.id,
      dto.eigenschappen,
    );

    const startStatus = zaaktype.statustypen[0];
    if (!startStatus) {
      throw new BadRequestException(`Zaaktype ${dto.zaaktypeCode} heeft geen statussen`);
    }

    const referentie = `VZK-${new Date().getFullYear()}-${district.code}-${nano()}`;
    const deadline = werkdagenVanaf(new Date(), zaaktype.slaWerkdagen);

    const verzoek = await this.prisma.verzoek.create({
      data: {
        referentie,
        zaaktypeId: zaaktype.id,
        bronOrganisatieId,
        districtId: dto.districtId,
        ressortId: dto.ressortId,
        statusCode: startStatus.code,
        vertrouwelijkheid: zaaktype.defaultVertrouwelijkheid,
        onderwerp: dto.onderwerp,
        omschrijving: dto.omschrijving,
        locatieOmschrijving: dto.locatieOmschrijving,
        externeReferentie: dto.externeReferentie,
        eigenschappen: eigenschappen as Prisma.InputJsonValue,
        deadline,
        ingediendDoorId: user.id,
        events: {
          create: {
            actorId: user.id,
            type: 'ingediend',
            payload: {
              zaaktype: zaaktype.code,
              via: 'dienst-portaal',
              organisatieId: bronOrganisatieId,
            } as Prisma.InputJsonValue,
          },
        },
      },
      include: {
        zaaktype: { select: { code: true, naam: true } },
        district: { select: { naam: true } },
      },
    });

    if (dto.latitude != null && dto.longitude != null) {
      await this.prisma.$executeRawUnsafe(
        `UPDATE verzoeken SET geom = ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography WHERE id = $3`,
        dto.longitude,
        dto.latitude,
        verzoek.id,
      );
    }

    await this.audit.log({
      actorId: user.id,
      actie: 'CREATE',
      entiteitType: 'Verzoek',
      entiteitId: verzoek.id,
      na: { referentie, zaaktype: zaaktype.code, districtId: dto.districtId },
      ip,
      context: { kanaal: 'G2G', organisatieId: bronOrganisatieId },
    });

    return {
      referentie: verzoek.referentie,
      zaaktype: verzoek.zaaktype.naam,
      status: verzoek.statusCode,
      district: verzoek.district.naam,
      vertrouwelijkheid: verzoek.vertrouwelijkheid,
      deadline: verzoek.deadline,
    };
  }

  /** Lijst verzoeken van de eigen organisatie. */
  async lijstEigenOrganisatie(
    user: AuthenticatedUser,
    filter: { afgehandeld?: boolean; zaaktypeCode?: string },
  ) {
    const organisatieId = this.eigenOrganisatieId(user);
    return this.prisma.verzoek.findMany({
      where: {
        bronOrganisatieId: organisatieId,
        ...this.afgehandeldFilter(filter.afgehandeld),
        ...(filter.zaaktypeCode ? { zaaktype: { code: filter.zaaktypeCode.toUpperCase() } } : {}),
      },
      orderBy: [{ createdAt: 'desc' }],
      select: this.lijstSelect(),
    });
  }

  /** Trek een eigen, nog niet afgehandeld verzoek in. */
  async intrekken(id: number, dto: IntrekkenDto, user: AuthenticatedUser, ip?: string) {
    const organisatieId = this.eigenOrganisatieId(user);
    const v = await this.prisma.verzoek.findUnique({ where: { id } });
    if (!v) throw new NotFoundException();
    if (v.bronOrganisatieId !== organisatieId) {
      throw new ForbiddenException('Verzoek hoort niet bij uw organisatie');
    }
    if (v.afgehandeldOp) throw new ConflictException('Verzoek is al afgehandeld');
    if (v.ingetrokkenOp) throw new ConflictException('Verzoek is al ingetrokken');

    const nieuw = await this.prisma.verzoek.update({
      where: { id },
      data: {
        ingetrokkenOp: new Date(),
        events: {
          create: {
            actorId: user.id,
            type: 'ingetrokken',
            payload: { reden: dto.reden } as Prisma.InputJsonValue,
          },
        },
      },
    });
    await this.audit.log({
      actorId: user.id,
      actie: 'UPDATE',
      entiteitType: 'Verzoek',
      entiteitId: id,
      na: { ingetrokken: true },
      ip,
      context: { reden: dto.reden },
    });
    return { referentie: nieuw.referentie, ingetrokken: true };
  }

  // ═══════════════════════════════════════════════════════════════════
  // EO6 — DC-kant (scope DISTRICT)
  // ═══════════════════════════════════════════════════════════════════

  /** Inbox: inkomende verzoeken voor een district. */
  async inbox(
    districtId: number,
    user: AuthenticatedUser,
    filter: { afgehandeld?: boolean; zaaktypeCode?: string },
  ) {
    this.vereisDistrictToegang(user, districtId);
    return this.prisma.verzoek.findMany({
      where: {
        districtId,
        ingetrokkenOp: null,
        ...this.afgehandeldFilter(filter.afgehandeld),
        ...(filter.zaaktypeCode ? { zaaktype: { code: filter.zaaktypeCode.toUpperCase() } } : {}),
      },
      orderBy: [{ afgehandeldOp: 'asc' }, { deadline: 'asc' }, { createdAt: 'desc' }],
      select: this.lijstSelect(true),
    });
  }

  /** Tussentijdse statuswijziging (catalogus-gevalideerd, niet de eind-status). */
  async wijzigStatus(id: number, dto: StatusWijzigDto, user: AuthenticatedUser, ip?: string) {
    const v = await this.laadVoorBehandeling(id, user);
    const statustype = v.zaaktype.statustypen.find((s) => s.code === dto.statusCode);
    if (!statustype) {
      throw new BadRequestException(`Onbekende status ${dto.statusCode} voor dit zaaktype`);
    }
    if (statustype.isEind) {
      throw new BadRequestException('Eind-status zetten gaat via POST /:id/beantwoord');
    }

    const nieuw = await this.prisma.verzoek.update({
      where: { id },
      data: {
        statusCode: dto.statusCode,
        events: {
          create: {
            actorId: user.id,
            type: 'status_gewijzigd',
            payload: {
              van: v.statusCode,
              naar: dto.statusCode,
              opmerking: dto.opmerking,
            } as Prisma.InputJsonValue,
          },
        },
      },
    });
    await this.audit.log({
      actorId: user.id,
      actie: 'STATUS_WIJZIGING',
      entiteitType: 'Verzoek',
      entiteitId: id,
      voor: { status: v.statusCode },
      na: { status: nieuw.statusCode },
      ip,
      context: { opmerking: dto.opmerking },
    });
    return { referentie: nieuw.referentie, status: nieuw.statusCode };
  }

  /** Eindbesluit: DC beantwoordt met resultaat (advies/beschikking) + motivatie. */
  async beantwoord(id: number, dto: BeantwoordDto, user: AuthenticatedUser, ip?: string) {
    const v = await this.laadVoorBehandeling(id, user);

    const resultaattype = await this.prisma.resultaattype.findFirst({
      where: { zaaktypeId: v.zaaktypeId, code: dto.resultaatCode },
    });
    if (!resultaattype) {
      throw new BadRequestException(`Onbekend resultaat ${dto.resultaatCode} voor dit zaaktype`);
    }

    const eindStatus =
      v.zaaktype.statustypen.find((s) => s.isEind) ??
      v.zaaktype.statustypen[v.zaaktype.statustypen.length - 1];

    const nieuw = await this.prisma.verzoek.update({
      where: { id },
      data: {
        resultaatCode: dto.resultaatCode,
        antwoord: dto.antwoord,
        beantwoordDoorId: user.id,
        beantwoordOp: new Date(),
        statusCode: eindStatus.code,
        afgehandeldOp: new Date(),
        events: {
          create: {
            actorId: user.id,
            type: 'beantwoord',
            payload: {
              resultaat: dto.resultaatCode,
              antwoord: dto.antwoord,
            } as Prisma.InputJsonValue,
          },
        },
      },
    });
    await this.audit.log({
      actorId: user.id,
      actie: 'BESLUIT_GENOMEN',
      entiteitType: 'Verzoek',
      entiteitId: id,
      voor: { status: v.statusCode },
      na: { status: nieuw.statusCode, resultaat: dto.resultaatCode },
      ip,
      context: { antwoord: dto.antwoord },
    });
    return {
      referentie: nieuw.referentie,
      status: nieuw.statusCode,
      resultaat: nieuw.resultaatCode,
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // Gedeeld — detail (dienst óf DC), met ZF3-vertrouwelijkheid
  // ═══════════════════════════════════════════════════════════════════

  async detail(id: number, user: AuthenticatedUser) {
    const v = await this.prisma.verzoek.findUnique({
      where: { id },
      include: {
        zaaktype: {
          include: {
            statustypen: { orderBy: { volgnummer: 'asc' } },
            resultaattypen: true,
            eigenschappen: { orderBy: { volgnummer: 'asc' } },
          },
        },
        bronOrganisatie: { select: { id: true, code: true, naam: true, korteNaam: true } },
        district: { select: { id: true, naam: true } },
        ressort: { select: { id: true, naam: true } },
        ingediendDoor: { select: { id: true, naam: true } },
        beantwoordDoor: { select: { id: true, naam: true } },
        bijlages: true,
        events: {
          orderBy: { createdAt: 'asc' },
          include: { actor: { select: { id: true, naam: true } } },
        },
      },
    });
    if (!v) throw new NotFoundException();

    // Autorisatie: óf eigen organisatie (dienst), óf eigen district (DC)
    const alsDienst =
      user.permissies.has('verzoek.read.eigen_organisatie') &&
      user.rollen.some((r) => r.organisatieId === v.bronOrganisatieId);
    const alsDc =
      user.permissies.has('verzoek.read.district') && this.heeftDistrict(user, v.districtId);
    if (!alsDienst && !alsDc) {
      throw new ForbiddenException('Geen toegang tot dit verzoek');
    }

    // ZF3 — vertrouwelijkheid van de zaak
    if (!this.zaaktypen.magZienVertrouwelijkheid(user, v.vertrouwelijkheid)) {
      throw new ForbiddenException('Onvoldoende rechten voor de vertrouwelijkheid van deze zaak');
    }
    // ZF3 — bijlages filteren op niveau
    const bijlages = v.bijlages.filter((b) =>
      this.zaaktypen.magZienVertrouwelijkheid(user, b.vertrouwelijkheid),
    );

    return { ...v, bijlages };
  }

  // ═══════════════════════════════════════════════════════════════════
  // EO7 — bijlages (presigned S3, ZF3-vertrouwelijkheid)
  // ═══════════════════════════════════════════════════════════════════

  async bijlagePresign(id: number, dto: VerzoekBijlagePresignDto, user: AuthenticatedUser) {
    const v = await this.laadVoorBijlage(id, user);
    if (v._count.bijlages >= MAX_VERZOEK_BIJLAGES) {
      throw new BadRequestException(`Maximaal ${MAX_VERZOEK_BIJLAGES} bijlages per verzoek`);
    }
    if (!TOEGESTANE_VERZOEK_BIJLAGE_TYPES.includes(dto.mimeType as never)) {
      throw new BadRequestException(`MIME-type ${dto.mimeType} niet toegestaan`);
    }
    if (dto.grootte > MAX_VERZOEK_BIJLAGE_BYTES) {
      throw new BadRequestException('Bestand te groot');
    }
    const key = `verzoeken/${id}/${this.storage.bijlageKey(id, dto.bestandsnaam).split('/').pop()}`;
    const uploadUrl = await this.storage.presignUpload({
      key,
      contentType: dto.mimeType,
      expiresInSec: 300,
    });
    return { fileKey: key, uploadUrl, expiresInSec: 300, maxBytes: MAX_VERZOEK_BIJLAGE_BYTES };
  }

  async bijlageRegistreer(
    id: number,
    dto: VerzoekBijlageRegistreerDto,
    user: AuthenticatedUser,
    ip?: string,
  ) {
    const v = await this.laadVoorBijlage(id, user);
    if (!TOEGESTANE_VERZOEK_BIJLAGE_TYPES.includes(dto.mimeType as never)) {
      throw new BadRequestException(`MIME-type ${dto.mimeType} niet toegestaan`);
    }
    const soort = dto.mimeType.startsWith('image/') ? 'foto' : 'document';
    const bijlage = await this.prisma.verzoekBijlage.create({
      data: {
        verzoekId: id,
        fileKey: dto.fileKey,
        soort,
        bestandsnaam: dto.bestandsnaam.slice(0, 255),
        grootte: dto.grootte,
        mimeType: dto.mimeType,
        vertrouwelijkheid: (dto.vertrouwelijkheid as Vertrouwelijkheid) ?? v.vertrouwelijkheid,
      },
    });
    await this.prisma.verzoekEvent.create({
      data: {
        verzoekId: id,
        actorId: user.id,
        type: 'bijlage_toegevoegd',
        payload: { bijlageId: bijlage.id, bestandsnaam: bijlage.bestandsnaam } as Prisma.InputJsonValue,
      },
    });
    await this.audit.log({
      actorId: user.id,
      actie: 'DOCUMENT_UPLOAD',
      entiteitType: 'VerzoekBijlage',
      entiteitId: bijlage.id,
      na: { verzoekId: id, fileKey: bijlage.fileKey },
      ip,
    });
    return { id: bijlage.id, soort: bijlage.soort, bestandsnaam: bijlage.bestandsnaam };
  }

  async bijlageDownloadUrl(id: number, bijlageId: number, user: AuthenticatedUser) {
    // hergebruik detail() voor de autorisatie + ZF3-filtering
    const v = await this.detail(id, user);
    const bijlage = v.bijlages.find((b) => b.id === bijlageId);
    if (!bijlage) throw new NotFoundException('Bijlage niet gevonden of geen toegang');
    const url = await this.storage.presignDownload(bijlage.fileKey, 120);
    await this.audit.log({
      actorId: user.id,
      actie: 'DOCUMENT_DOWNLOAD',
      entiteitType: 'VerzoekBijlage',
      entiteitId: bijlage.id,
      context: { verzoekId: id },
    });
    return { url, bestandsnaam: bijlage.bestandsnaam, mimeType: bijlage.mimeType };
  }

  // ═══════════════════════════════════════════════════════════════════
  // Helpers
  // ═══════════════════════════════════════════════════════════════════

  private eigenOrganisatieId(user: AuthenticatedUser): number {
    const rol = user.rollen.find((r) => r.scope === 'ORGANISATIE' && r.organisatieId);
    if (!rol?.organisatieId) {
      throw new ForbiddenException('Geen organisatie gekoppeld aan deze gebruiker');
    }
    return rol.organisatieId;
  }

  private heeftDistrict(user: AuthenticatedUser, districtId: number): boolean {
    return (
      user.rollen.some((r) => r.scope === 'NATIONAAL') ||
      user.rollen.some((r) => r.scope === 'DISTRICT' && r.districtId === districtId)
    );
  }

  private vereisDistrictToegang(user: AuthenticatedUser, districtId: number) {
    if (!this.heeftDistrict(user, districtId)) {
      throw new ForbiddenException('Buiten toegestane district-scope');
    }
  }

  /** Laad een verzoek + zaaktype voor DC-behandeling, met scope- en statuschecks. */
  private async laadVoorBehandeling(id: number, user: AuthenticatedUser) {
    const v = await this.prisma.verzoek.findUnique({
      where: { id },
      include: { zaaktype: { include: { statustypen: { orderBy: { volgnummer: 'asc' } } } } },
    });
    if (!v) throw new NotFoundException();
    this.vereisDistrictToegang(user, v.districtId);
    if (v.afgehandeldOp) throw new ConflictException('Verzoek is al afgehandeld');
    if (v.ingetrokkenOp) throw new ConflictException('Verzoek is ingetrokken');
    return v;
  }

  /** Laad een verzoek voor bijlage-acties (dienst-eigenaar of DC van district). */
  private async laadVoorBijlage(id: number, user: AuthenticatedUser) {
    const v = await this.prisma.verzoek.findUnique({
      where: { id },
      select: {
        id: true,
        bronOrganisatieId: true,
        districtId: true,
        vertrouwelijkheid: true,
        afgehandeldOp: true,
        ingetrokkenOp: true,
        _count: { select: { bijlages: true } },
      },
    });
    if (!v) throw new NotFoundException();
    const alsDienst = user.rollen.some((r) => r.organisatieId === v.bronOrganisatieId);
    const alsDc =
      user.permissies.has('verzoek.behandel') && this.heeftDistrict(user, v.districtId);
    if (!alsDienst && !alsDc) throw new ForbiddenException('Geen toegang tot dit verzoek');
    if (v.ingetrokkenOp) throw new ConflictException('Verzoek is ingetrokken');
    return v;
  }

  private afgehandeldFilter(afgehandeld?: boolean) {
    if (afgehandeld === undefined) return {};
    return afgehandeld ? { afgehandeldOp: { not: null } } : { afgehandeldOp: null };
  }

  private lijstSelect(metOrg = false) {
    return {
      id: true,
      referentie: true,
      onderwerp: true,
      statusCode: true,
      vertrouwelijkheid: true,
      deadline: true,
      afgehandeldOp: true,
      ingetrokkenOp: true,
      resultaatCode: true,
      createdAt: true,
      zaaktype: { select: { code: true, naam: true, kanaal: true } },
      district: { select: { id: true, naam: true } },
      ...(metOrg
        ? { bronOrganisatie: { select: { code: true, korteNaam: true } } }
        : {}),
      _count: { select: { bijlages: true } },
    } satisfies Prisma.VerzoekSelect;
  }
}

/** Tel N werkdagen (ma-vr) op bij een datum. Simpel; feestdagen niet meegerekend. */
function werkdagenVanaf(start: Date, werkdagen: number): Date {
  const d = new Date(start);
  let resterend = werkdagen;
  while (resterend > 0) {
    d.setDate(d.getDate() + 1);
    const dag = d.getDay();
    if (dag !== 0 && dag !== 6) resterend--;
  }
  return d;
}
