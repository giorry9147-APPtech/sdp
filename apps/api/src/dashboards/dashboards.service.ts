import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';

/**
 * Dashboard-aggregaties voor DC en RO. Bewust thin laag bovenop Prisma
 * — geen caching, want cijfers veranderen continu en de dataset is klein
 * (1 district = max enkele duizenden meldingen per jaar).
 */
@Injectable()
export class DashboardsService {
  constructor(private readonly prisma: PrismaService) {}

  // ═══════════════════════════════════════════════════════════════════
  // Hoofdoverzicht — alle live-tegels in één call
  // ═══════════════════════════════════════════════════════════════════

  async dcDashboard(
    districtId: number,
    filter: { ressortId?: number; subregioId?: number } = {},
  ) {
    const district = await this.prisma.district.findUnique({
      where: { id: districtId },
      select: {
        id: true,
        code: true,
        naam: true,
        hoofdstad: true,
        _count: { select: { ressorten: true } },
      },
    });
    if (!district) throw new NotFoundException(`District ${districtId} bestaat niet`);

    const meldFilter: Prisma.MeldingWhereInput = {
      districtId,
      ...(filter.ressortId ? { ressortId: filter.ressortId } : {}),
      ...(filter.subregioId ? { subregioId: filter.subregioId } : {}),
    };
    const vergFilter: Prisma.VergunningWhereInput = {
      districtId,
      ...(filter.subregioId ? { subregioId: filter.subregioId } : {}),
    };
    const projFilter: Prisma.ProjectWhereInput = {
      districtId,
      ...(filter.ressortId ? { ressortId: filter.ressortId } : {}),
      ...(filter.subregioId ? { subregioId: filter.subregioId } : {}),
    };

    const [
      meldOpen,
      meldCrisis,
      vergOpen,
      projLopend,
      planConcept,
      planTerGoedkeuring,
    ] = await Promise.all([
      this.prisma.melding.count({
        where: {
          ...meldFilter,
          status: { in: ['NIEUW', 'IN_BEHANDELING', 'EXTRA_INFO_NODIG', 'HEROPEND'] },
        },
      }),
      this.prisma.melding.count({
        where: {
          ...meldFilter,
          urgentie: 'CRISIS',
          status: { notIn: ['GESLOTEN', 'OPGELOST', 'BEVESTIGD_DOOR_BURGER'] },
        },
      }),
      this.prisma.vergunning.count({
        where: {
          ...vergFilter,
          status: { in: ['INGEDIEND', 'IN_BEHANDELING', 'EXTRA_INFO_NODIG'] },
        },
      }),
      this.prisma.project.count({
        where: {
          ...projFilter,
          status: { in: ['GOEDGEKEURD', 'BUDGET_AANGEVRAAGD', 'GESTART', 'VERTRAAGD'] },
        },
      }),
      this.prisma.districtsplan.count({
        where: { districtId, status: 'CONCEPT' },
      }),
      this.prisma.districtsplan.count({
        where: {
          districtId,
          status: { in: ['TER_GOEDKEURING_DR', 'TER_GOEDKEURING_DC', 'TER_GOEDKEURING_RO'] },
        },
      }),
    ]);

    const top = await this.topCategorieen({ districtId, dagen: 30, ...filter });

    return {
      district,
      meldingen: {
        open: meldOpen,
        crisis: meldCrisis,
        topCategorieen30dagen: top,
      },
      vergunningen: { open: vergOpen },
      projecten: { lopend: projLopend },
      plannen: { concept: planConcept, terGoedkeuring: planTerGoedkeuring },
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // C1 — Trendgrafiek N dagen
  // Geeft per-dag-aantallen voor meldingen + vergunningen, geschikt voor
  // bar- of line-chart.
  // ═══════════════════════════════════════════════════════════════════

  async trend(
    districtId: number,
    opts: { dagen: number; ressortId?: number; subregioId?: number },
  ) {
    const dagen = clampDagen(opts.dagen);
    const start = startOfDayUTC(new Date(Date.now() - (dagen - 1) * 86_400_000));

    // Bouwers: gebruik $queryRaw met date_trunc om server-side te aggregeren
    // — Postgres rekent veel sneller dan dag-voor-dag in app-code.
    const meldRows = await this.prisma.$queryRaw<
      { datum: Date; aantal: bigint }[]
    >(Prisma.sql`
      SELECT date_trunc('day', created_at)::date AS datum, COUNT(*)::bigint AS aantal
      FROM meldingen
      WHERE district_id = ${districtId}
        AND created_at >= ${start}
        ${opts.ressortId ? Prisma.sql`AND ressort_id = ${opts.ressortId}` : Prisma.empty}
        ${opts.subregioId ? Prisma.sql`AND subregio_id = ${opts.subregioId}` : Prisma.empty}
      GROUP BY datum
      ORDER BY datum
    `);

    const vergRows = await this.prisma.$queryRaw<
      { datum: Date; aantal: bigint }[]
    >(Prisma.sql`
      SELECT date_trunc('day', created_at)::date AS datum, COUNT(*)::bigint AS aantal
      FROM vergunningen
      WHERE district_id = ${districtId}
        AND created_at >= ${start}
        ${opts.subregioId ? Prisma.sql`AND subregio_id = ${opts.subregioId}` : Prisma.empty}
      GROUP BY datum
      ORDER BY datum
    `);

    // Vul lege dagen op met 0 zodat de grafiek geen gaten heeft
    const series = (rows: { datum: Date; aantal: bigint }[]) => {
      const map = new Map<string, number>();
      for (const r of rows) {
        map.set(toISODate(r.datum), Number(r.aantal));
      }
      const out: Array<{ datum: string; aantal: number }> = [];
      for (let i = 0; i < dagen; i++) {
        const d = new Date(start.getTime() + i * 86_400_000);
        const key = toISODate(d);
        out.push({ datum: key, aantal: map.get(key) ?? 0 });
      }
      return out;
    };

    return {
      dagen,
      meldingen: series(meldRows),
      vergunningen: series(vergRows),
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // C2 — Top-5 categorieën meldingen (configureerbare periode)
  // ═══════════════════════════════════════════════════════════════════

  async topCategorieen(opts: {
    districtId: number;
    dagen: number;
    ressortId?: number;
    subregioId?: number;
  }) {
    const dagen = clampDagen(opts.dagen);
    const sinds = new Date(Date.now() - dagen * 86_400_000);

    const top = await this.prisma.melding.groupBy({
      by: ['categorieId'],
      where: {
        districtId: opts.districtId,
        createdAt: { gte: sinds },
        ...(opts.ressortId ? { ressortId: opts.ressortId } : {}),
        ...(opts.subregioId ? { subregioId: opts.subregioId } : {}),
      },
      _count: true,
      orderBy: { _count: { categorieId: 'desc' } },
      take: 5,
    });
    if (top.length === 0) return [];

    const cats = await this.prisma.categorie.findMany({
      where: { id: { in: top.map((c) => c.categorieId) } },
      select: { id: true, naam: true, code: true },
    });
    const catMap = new Map(cats.map((c) => [c.id, c]));
    return top.map((t) => ({
      categorie: catMap.get(t.categorieId)?.naam ?? '?',
      code: catMap.get(t.categorieId)?.code ?? null,
      aantal: t._count,
    }));
  }

  // ═══════════════════════════════════════════════════════════════════
  // C5 — Recent gesloten dossiers (controlemoment)
  // Last N dagen aan: gesloten meldingen + beslote vergunningen +
  // afgeronde projecten. Voor DC: "wat is er afgelopen week afgesloten?"
  // ═══════════════════════════════════════════════════════════════════

  async recentGesloten(
    districtId: number,
    opts: { dagen: number; ressortId?: number; subregioId?: number },
  ) {
    const dagen = clampDagen(opts.dagen);
    const sinds = new Date(Date.now() - dagen * 86_400_000);

    const [meldingen, vergunningen, projecten] = await Promise.all([
      this.prisma.melding.findMany({
        where: {
          districtId,
          status: { in: ['GESLOTEN', 'OPGELOST', 'BEVESTIGD_DOOR_BURGER'] },
          geslotenOp: { gte: sinds },
          ...(opts.ressortId ? { ressortId: opts.ressortId } : {}),
          ...(opts.subregioId ? { subregioId: opts.subregioId } : {}),
        },
        orderBy: { geslotenOp: 'desc' },
        take: 10,
        select: {
          id: true,
          ticketNummer: true,
          titel: true,
          status: true,
          geslotenOp: true,
          categorie: { select: { naam: true } },
        },
      }),
      this.prisma.vergunning.findMany({
        where: {
          districtId,
          status: { in: ['GOEDGEKEURD', 'AFGEWEZEN', 'INGETROKKEN'] },
          beslotenOp: { gte: sinds },
          ...(opts.subregioId ? { subregioId: opts.subregioId } : {}),
        },
        orderBy: { beslotenOp: 'desc' },
        take: 10,
        select: {
          id: true,
          referentie: true,
          titel: true,
          status: true,
          beslotenOp: true,
          categorie: { select: { naam: true } },
        },
      }),
      this.prisma.project.findMany({
        where: {
          districtId,
          status: { in: ['AFGEROND', 'GEEVALUEERD', 'GEANNULEERD'] },
          updatedAt: { gte: sinds },
          ...(opts.ressortId ? { ressortId: opts.ressortId } : {}),
          ...(opts.subregioId ? { subregioId: opts.subregioId } : {}),
        },
        orderBy: { updatedAt: 'desc' },
        take: 10,
        select: {
          id: true,
          referentie: true,
          titel: true,
          status: true,
          updatedAt: true,
          categorie: { select: { naam: true } },
        },
      }),
    ]);

    return {
      dagen,
      meldingen: meldingen.map((m) => ({
        id: m.id,
        kenmerk: m.ticketNummer,
        titel: m.titel,
        status: m.status,
        afgesloten: m.geslotenOp,
        categorie: m.categorie?.naam ?? null,
        soort: 'melding' as const,
      })),
      vergunningen: vergunningen.map((v) => ({
        id: v.id,
        kenmerk: v.referentie,
        titel: v.titel,
        status: v.status,
        afgesloten: v.beslotenOp,
        categorie: v.categorie?.naam ?? null,
        soort: 'vergunning' as const,
      })),
      projecten: projecten.map((p) => ({
        id: p.id,
        kenmerk: p.referentie,
        titel: p.titel,
        status: p.status,
        afgesloten: p.updatedAt,
        categorie: p.categorie?.naam ?? null,
        soort: 'project' as const,
      })),
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // C3 — Mijn taken (cross-module: wat wacht op deze gebruiker?)
  // ═══════════════════════════════════════════════════════════════════

  async mijnTaken(
    gebruikerId: string,
    permissies: Set<string>,
    rolDistrictIds: number[],
  ) {
    // Meldingen toegewezen aan mij, nog niet afgehandeld
    const meldingen = await this.prisma.melding.findMany({
      where: {
        toegewezenAanId: gebruikerId,
        status: { in: ['NIEUW', 'IN_BEHANDELING', 'EXTRA_INFO_NODIG', 'HEROPEND'] },
      },
      orderBy: [{ urgentie: 'desc' }, { createdAt: 'asc' }],
      take: 25,
      select: {
        id: true,
        ticketNummer: true,
        titel: true,
        urgentie: true,
        status: true,
        createdAt: true,
        district: { select: { naam: true } },
      },
    });

    // Vergunningen die wachten op behandelaar in mijn district
    // (vergunning.behandel) — als geen aanvragerId-koppeling, dan op
    // basis van district + niet-eindstatus.
    const vergunningen =
      permissies.has('vergunning.behandel') && rolDistrictIds.length > 0
        ? await this.prisma.vergunning.findMany({
            where: {
              districtId: { in: rolDistrictIds },
              status: { in: ['INGEDIEND', 'IN_BEHANDELING', 'EXTRA_INFO_NODIG'] },
            },
            orderBy: [{ ingediendOp: 'asc' }],
            take: 15,
            select: {
              id: true,
              referentie: true,
              titel: true,
              status: true,
              ingediendOp: true,
              district: { select: { naam: true } },
            },
          })
        : [];

    // Plannen die wachten op mijn goedkeuring
    const planFilters: Prisma.DistrictsplanWhereInput[] = [];
    if (permissies.has('districtsplan.goedkeur_dr')) {
      planFilters.push({ status: 'TER_GOEDKEURING_DR' });
    }
    if (permissies.has('districtsplan.goedkeur_ro')) {
      planFilters.push({ status: 'TER_GOEDKEURING_RO' });
    }
    const districtsplannen =
      planFilters.length > 0
        ? await this.prisma.districtsplan.findMany({
            where: {
              OR: planFilters,
              ...(rolDistrictIds.length > 0 &&
              !permissies.has('districtsplan.goedkeur_ro')
                ? { districtId: { in: rolDistrictIds } }
                : {}),
            },
            orderBy: { updatedAt: 'asc' },
            take: 10,
            select: {
              id: true,
              titel: true,
              jaar: true,
              status: true,
              updatedAt: true,
              district: { select: { naam: true } },
            },
          })
        : [];

    // Uitgaven in afwachting (fonds.goedkeur)
    const uitgaven = permissies.has('fonds.goedkeur')
      ? await this.prisma.districtsfondsUitgave.findMany({
          where: {
            status: 'AANGEVRAAGD',
            ...(rolDistrictIds.length > 0
              ? { districtsfonds: { districtId: { in: rolDistrictIds } } }
              : {}),
          },
          orderBy: { geboektOp: 'asc' },
          take: 15,
          select: {
            id: true,
            bedrag: true,
            beschrijving: true,
            geboektOp: true,
            districtsfonds: {
              select: { id: true, jaar: true, district: { select: { naam: true } } },
            },
          },
        })
      : [];

    // Projecten met VERTRAAGD-status — DC's controle-moment
    const projecten =
      permissies.has('project.read.district') && rolDistrictIds.length > 0
        ? await this.prisma.project.findMany({
            where: {
              districtId: { in: rolDistrictIds },
              status: 'VERTRAAGD',
            },
            orderBy: { updatedAt: 'asc' },
            take: 10,
            select: {
              id: true,
              referentie: true,
              titel: true,
              status: true,
              updatedAt: true,
              district: { select: { naam: true } },
            },
          })
        : [];

    // Inkomende verzoeken van externe diensten, nog niet afgehandeld (EO9)
    const verzoeken =
      permissies.has('verzoek.behandel') && rolDistrictIds.length > 0
        ? await this.prisma.verzoek.findMany({
            where: {
              districtId: { in: rolDistrictIds },
              afgehandeldOp: null,
              ingetrokkenOp: null,
            },
            orderBy: [{ deadline: 'asc' }, { createdAt: 'asc' }],
            take: 15,
            select: {
              id: true,
              referentie: true,
              onderwerp: true,
              statusCode: true,
              deadline: true,
              zaaktype: { select: { naam: true } },
              bronOrganisatie: { select: { korteNaam: true, code: true } },
              district: { select: { naam: true } },
            },
          })
        : [];

    return {
      meldingen,
      vergunningen,
      districtsplannen,
      uitgaven: uitgaven.map((u) => ({
        id: u.id,
        bedrag: u.bedrag,
        beschrijving: u.beschrijving,
        geboektOp: u.geboektOp,
        fonds: u.districtsfonds
          ? {
              id: u.districtsfonds.id,
              jaar: u.districtsfonds.jaar,
              district: u.districtsfonds.district.naam,
            }
          : null,
      })),
      projecten,
      verzoeken,
      totaal:
        meldingen.length +
        vergunningen.length +
        districtsplannen.length +
        uitgaven.length +
        projecten.length +
        verzoeken.length,
    };
  }

  // ═══════════════════════════════════════════════════════════════════
  // Nationaal (ongewijzigd)
  // ═══════════════════════════════════════════════════════════════════

  async nationaal() {
    const districten = await this.prisma.district.findMany({
      orderBy: { naam: 'asc' },
      select: { id: true, code: true, naam: true },
    });

    return Promise.all(
      districten.map(async (d) => {
        const [meldOpen, vergOpen, projLopend] = await Promise.all([
          this.prisma.melding.count({
            where: {
              districtId: d.id,
              status: {
                notIn: ['GESLOTEN', 'OPGELOST', 'BEVESTIGD_DOOR_BURGER'],
              },
            },
          }),
          this.prisma.vergunning.count({
            where: { districtId: d.id, status: { in: ['INGEDIEND', 'IN_BEHANDELING'] } },
          }),
          this.prisma.project.count({
            where: {
              districtId: d.id,
              status: { in: ['GESTART', 'GOEDGEKEURD', 'VERTRAAGD'] },
            },
          }),
        ]);
        return { district: d, meldOpen, vergOpen, projLopend };
      }),
    );
  }
}

// ─── helpers ─────────────────────────────────────────────────────────

function clampDagen(d: number): number {
  if (!Number.isFinite(d) || d <= 0) throw new BadRequestException('dagen moet > 0');
  // 1 t/m 365 — meer is voor MVP overkill
  return Math.min(365, Math.max(1, Math.floor(d)));
}

function startOfDayUTC(d: Date): Date {
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
}

function toISODate(d: Date): string {
  return d.toISOString().slice(0, 10);
}
