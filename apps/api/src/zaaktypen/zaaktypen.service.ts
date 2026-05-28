import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { Vertrouwelijkheid, Zaakkanaal } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import type { AuthenticatedUser } from '../common/types';

/**
 * Zaak-fundament (ZF1–ZF3). Leest de zaaktype-catalogus en levert twee
 * herbruikbare helpers die `Verzoek` (EO4) en `Verklaring` (VK1) straks
 * aanroepen:
 *  - valideerEigenschappen() — ZF2: valideert een waarden-map tegen de
 *    Eigenschap-definities van een zaaktype.
 *  - magZienVertrouwelijkheid() — ZF3: of een gebruiker een zaak/document
 *    van een bepaalde vertrouwelijkheidsklasse mag zien.
 */
@Injectable()
export class ZaaktypenService {
  constructor(private readonly prisma: PrismaService) {}

  /** Lijst zaaktypen, optioneel gefilterd op kanaal (G2G/C2G). */
  async lijst(kanaal?: Zaakkanaal) {
    return this.prisma.zaaktype.findMany({
      where: { actief: true, ...(kanaal ? { kanaal } : {}) },
      orderBy: [{ volgorde: 'asc' }, { naam: 'asc' }],
      select: {
        id: true,
        code: true,
        naam: true,
        kanaal: true,
        initiatorType: true,
        bronOrganisatieCode: true,
        slaWerkdagen: true,
        defaultVertrouwelijkheid: true,
        wettelijkeGrondslag: true,
        beschrijving: true,
      },
    });
  }

  /** Eén zaaktype met statussen, resultaten en eigenschap-definities. */
  async detail(code: string) {
    const zt = await this.prisma.zaaktype.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        statustypen: { orderBy: { volgnummer: 'asc' } },
        resultaattypen: { orderBy: { code: 'asc' } },
        eigenschappen: { orderBy: { volgnummer: 'asc' } },
      },
    });
    if (!zt) throw new NotFoundException(`Onbekend zaaktype: ${code}`);
    return zt;
  }

  /** Haalt het zaaktype op of gooit — voor gebruik door Verzoek/Verklaring. */
  async vereisZaaktype(code: string) {
    const zt = await this.prisma.zaaktype.findUnique({
      where: { code: code.toUpperCase() },
      include: { eigenschappen: true, statustypen: { orderBy: { volgnummer: 'asc' } } },
    });
    if (!zt || !zt.actief) {
      throw new BadRequestException(`Ongeldig of inactief zaaktype: ${code}`);
    }
    return zt;
  }

  /**
   * ZF2 — valideer een waarden-map tegen de Eigenschap-definities van een
   * zaaktype. Retourneert de genormaliseerde waarden (alleen bekende codes,
   * juiste primitieve typen). Gooit bij ontbrekende verplichte velden of
   * type-mismatch.
   */
  async valideerEigenschappen(
    zaaktypeId: number,
    waarden: Record<string, unknown> | null | undefined,
  ): Promise<Record<string, unknown>> {
    const defs = await this.prisma.eigenschap.findMany({ where: { zaaktypeId } });
    const input = waarden ?? {};
    const uit: Record<string, unknown> = {};

    for (const def of defs) {
      const v = input[def.code];
      const leeg = v === undefined || v === null || v === '';
      if (leeg) {
        if (def.verplicht) {
          throw new BadRequestException(`Verplicht veld ontbreekt: ${def.label} (${def.code})`);
        }
        continue;
      }
      uit[def.code] = this.castWaarde(def.type, def.code, def.label, v, def.opties);
    }
    return uit;
  }

  private castWaarde(
    type: string,
    code: string,
    label: string,
    v: unknown,
    opties: string[],
  ): unknown {
    switch (type) {
      case 'GETAL': {
        const n = Number(v);
        if (!Number.isFinite(n)) throw new BadRequestException(`${label} moet een getal zijn`);
        return n;
      }
      case 'JA_NEE':
        return Boolean(v);
      case 'DATUM': {
        const d = new Date(v as string);
        if (Number.isNaN(d.getTime())) throw new BadRequestException(`${label} moet een datum zijn`);
        return d.toISOString();
      }
      case 'KEUZE': {
        const s = String(v);
        if (opties.length > 0 && !opties.includes(s)) {
          throw new BadRequestException(`${label}: ongeldige keuze (${s})`);
        }
        return s;
      }
      case 'TEKST':
      default:
        return String(v).slice(0, 5000);
    }
  }

  /**
   * ZF3 — mag deze gebruiker een zaak/document van gegeven
   * vertrouwelijkheid zien? OPENBAAR/INTERN: elke ingelogde behandelaar.
   * VERTROUWELIJK: behandelaars met district/organisatie-scope.
   * CONFIDENTIEEL (bv. KPS-antecedenten): alleen DC of districtssecretaris.
   *
   * `behandelDistrictId` is het district van de zaak (voor scope-match).
   */
  magZienVertrouwelijkheid(
    user: AuthenticatedUser,
    niveau: Vertrouwelijkheid,
  ): boolean {
    const heeftRol = (codes: string[]) =>
      user.rollen.some((r) => codes.includes(r.rol));
    const isNationaal = user.rollen.some((r) => r.scope === 'NATIONAAL');

    switch (niveau) {
      case 'OPENBAAR':
      case 'INTERN':
        return true;
      case 'VERTROUWELIJK':
        // behandelaars + nationale toezichtsrollen
        return (
          isNationaal ||
          heeftRol([
            'dc',
            'districtssecretaris',
            'vergunningmedewerker',
            'meldingen_medewerker',
            'inspecteur',
          ])
        );
      case 'CONFIDENTIEEL':
        // alleen de eindverantwoordelijke DC-laag (bv. KPS-data bij VGG)
        return heeftRol(['dc', 'districtssecretaris']);
      default:
        return false;
    }
  }
}
