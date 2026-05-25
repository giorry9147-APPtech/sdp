import {
  BadRequestException,
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PlanStatus } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';
import { AuditService } from '../audit/audit.service';
import type {
  NieuwDistrictsplanDto,
  NieuwRessortplanDto,
  StatusOvergangDto,
} from './dto';
import type { AuthenticatedUser } from '../common/types';

/**
 * Plannen-service — implementeert de WRO-cyclus:
 *
 *   ressortcoördinator → ressortplan (concept)
 *      → ter goedkeuring RR (rr_lid stemt) → goedgekeurd
 *      → input voor districtsplan
 *
 *   DC + districtssecretaris → districtsplan (concept)
 *      → ter goedkeuring DR (dr_lid stemt) → ter goedkeuring DC
 *      → ter goedkeuring RO (directeur decentralisatie)
 *      → goedgekeurd
 *
 * Status-overgangen zijn geguard: alleen valide transities zijn
 * toegestaan, en alleen door rollen met juiste permissie.
 */
@Injectable()
export class PlannenService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly audit: AuditService,
  ) {}

  // ─── Valide transities ────────────────────────────────────────────
  private readonly RESSORTPLAN_TRANSITIES: Record<PlanStatus, PlanStatus[]> = {
    CONCEPT: ['TER_GOEDKEURING_RR'],
    TER_GOEDKEURING_RR: ['GOEDGEKEURD', 'HERZIENING_NODIG', 'AFGEWEZEN'],
    TER_GOEDKEURING_DR: [],
    TER_GOEDKEURING_DC: [],
    TER_GOEDKEURING_RO: [],
    GOEDGEKEURD: ['GEARCHIVEERD'],
    AFGEWEZEN: ['CONCEPT'],
    HERZIENING_NODIG: ['CONCEPT'],
    GEARCHIVEERD: [],
  };

  private readonly DISTRICTSPLAN_TRANSITIES: Record<PlanStatus, PlanStatus[]> = {
    CONCEPT: ['TER_GOEDKEURING_DR'],
    TER_GOEDKEURING_DR: ['TER_GOEDKEURING_DC', 'HERZIENING_NODIG', 'AFGEWEZEN'],
    TER_GOEDKEURING_DC: ['TER_GOEDKEURING_RO', 'HERZIENING_NODIG'],
    TER_GOEDKEURING_RO: ['GOEDGEKEURD', 'HERZIENING_NODIG', 'AFGEWEZEN'],
    TER_GOEDKEURING_RR: [],
    GOEDGEKEURD: ['GEARCHIVEERD'],
    AFGEWEZEN: ['CONCEPT'],
    HERZIENING_NODIG: ['CONCEPT'],
    GEARCHIVEERD: [],
  };

  // ─── Ressortplan ──────────────────────────────────────────────────
  async maakRessortplan(dto: NieuwRessortplanDto, actorId: string, ip?: string) {
    const r = await this.prisma.ressort.findUnique({ where: { id: dto.ressortId } });
    if (!r) throw new BadRequestException('Onbekend ressort');

    // Volgende versie voor dit jaar
    const laatste = await this.prisma.ressortplan.findFirst({
      where: { ressortId: dto.ressortId, jaar: dto.jaar },
      orderBy: { versie: 'desc' },
    });
    const versie = (laatste?.versie ?? 0) + 1;

    const plan = await this.prisma.ressortplan.create({
      data: {
        ressortId: dto.ressortId,
        jaar: dto.jaar,
        versie,
        titel: dto.titel,
        inleiding: dto.inleiding,
        gemaaktDoorId: actorId,
        prioriteiten: {
          create: dto.prioriteiten.map((p, i) => ({
            volgorde: i,
            titel: p.titel,
            onderbouwing: p.onderbouwing,
            urgentie: p.urgentie ?? 'MIDDEL',
            kostenraming: p.kostenraming,
            doelgroep: p.doelgroep,
            verwachteImpact: p.verwachteImpact,
          })),
        },
      },
      include: { prioriteiten: true, ressort: true },
    });

    await this.audit.log({
      actorId,
      actie: 'CREATE',
      entiteitType: 'Ressortplan',
      entiteitId: plan.id,
      na: { ressortId: plan.ressortId, jaar: plan.jaar, versie: plan.versie },
      ip,
    });

    return plan;
  }

  async wijzigRessortplanStatus(
    id: number,
    dto: StatusOvergangDto,
    user: AuthenticatedUser,
    ip?: string,
  ): Promise<unknown> {
    const oud = await this.prisma.ressortplan.findUnique({
      where: { id },
      include: { ressort: true },
    });
    if (!oud) throw new NotFoundException();

    const toegestaan = this.RESSORTPLAN_TRANSITIES[oud.status] ?? [];
    if (!toegestaan.includes(dto.status)) {
      throw new BadRequestException(
        `Overgang ${oud.status} → ${dto.status} is niet toegestaan`,
      );
    }

    // Permissie-check per overgang
    if (dto.status === 'TER_GOEDKEURING_RR' && !user.permissies.has('ressortplan.indienen')) {
      throw new ForbiddenException('Geen permissie om in te dienen');
    }
    if (dto.status === 'GOEDGEKEURD' && !user.permissies.has('ressortplan.goedkeur_rr')) {
      throw new ForbiddenException('Goedkeuring door RR vereist');
    }

    const nieuw = await this.prisma.ressortplan.update({
      where: { id },
      data: {
        status: dto.status,
        goedgekeurdOp: dto.status === 'GOEDGEKEURD' ? new Date() : null,
      },
    });

    await this.audit.log({
      actorId: user.id,
      actie: 'STATUS_WIJZIGING',
      entiteitType: 'Ressortplan',
      entiteitId: id,
      voor: { status: oud.status },
      na: { status: nieuw.status },
      ip,
      context: { opmerking: dto.opmerking, ressortId: oud.ressortId },
    });

    return nieuw;
  }

  async lijstRessortplannen(filter: { ressortId?: number; jaar?: number; status?: PlanStatus }) {
    return this.prisma.ressortplan.findMany({
      where: filter,
      orderBy: [{ jaar: 'desc' }, { ressortId: 'asc' }, { versie: 'desc' }],
      include: {
        ressort: { select: { id: true, naam: true, districtId: true } },
        _count: { select: { prioriteiten: true } },
      },
    });
  }

  async ressortplanDetail(id: number) {
    const p = await this.prisma.ressortplan.findUnique({
      where: { id },
      include: {
        ressort: true,
        gemaaktDoor: { select: { id: true, naam: true } },
        prioriteiten: { orderBy: { volgorde: 'asc' } },
      },
    });
    if (!p) throw new NotFoundException();
    return p;
  }

  // ─── Districtsplan ────────────────────────────────────────────────
  async maakDistrictsplan(
    dto: NieuwDistrictsplanDto,
    actorId: string,
    ip?: string,
  ) {
    const d = await this.prisma.district.findUnique({ where: { id: dto.districtId } });
    if (!d) throw new BadRequestException('Onbekend district');

    const laatste = await this.prisma.districtsplan.findFirst({
      where: { districtId: dto.districtId, jaar: dto.jaar },
      orderBy: { versie: 'desc' },
    });
    const versie = (laatste?.versie ?? 0) + 1;

    const plan = await this.prisma.districtsplan.create({
      data: {
        districtId: dto.districtId,
        jaar: dto.jaar,
        versie,
        titel: dto.titel,
        inleiding: dto.inleiding,
        gemaaktDoorId: actorId,
        prioriteiten: {
          create: dto.prioriteiten.map((p, i) => ({
            volgorde: i,
            titel: p.titel,
            onderbouwing: p.onderbouwing,
            urgentie: p.urgentie ?? 'MIDDEL',
            kostenraming: p.kostenraming,
          })),
        },
      },
      include: { prioriteiten: true, district: true },
    });

    await this.audit.log({
      actorId,
      actie: 'CREATE',
      entiteitType: 'Districtsplan',
      entiteitId: plan.id,
      na: { districtId: plan.districtId, jaar: plan.jaar, versie: plan.versie },
      ip,
    });

    return plan;
  }

  async wijzigDistrictsplanStatus(
    id: number,
    dto: StatusOvergangDto,
    user: AuthenticatedUser,
    ip?: string,
  ): Promise<unknown> {
    const oud = await this.prisma.districtsplan.findUnique({ where: { id } });
    if (!oud) throw new NotFoundException();

    const toegestaan = this.DISTRICTSPLAN_TRANSITIES[oud.status] ?? [];
    if (!toegestaan.includes(dto.status)) {
      throw new BadRequestException(
        `Overgang ${oud.status} → ${dto.status} is niet toegestaan`,
      );
    }

    if (dto.status === 'TER_GOEDKEURING_DC' && !user.permissies.has('districtsplan.goedkeur_dr')) {
      throw new ForbiddenException('Goedkeuring door DR vereist');
    }
    if (dto.status === 'GOEDGEKEURD' && !user.permissies.has('districtsplan.goedkeur_ro')) {
      throw new ForbiddenException('Goedkeuring door RO vereist');
    }

    const nieuw = await this.prisma.districtsplan.update({
      where: { id },
      data: {
        status: dto.status,
        goedgekeurdOp: dto.status === 'GOEDGEKEURD' ? new Date() : null,
      },
    });

    await this.audit.log({
      actorId: user.id,
      actie: 'STATUS_WIJZIGING',
      entiteitType: 'Districtsplan',
      entiteitId: id,
      voor: { status: oud.status },
      na: { status: nieuw.status },
      ip,
      context: { opmerking: dto.opmerking, districtId: oud.districtId },
    });

    return nieuw;
  }

  async lijstDistrictsplannen(filter: {
    districtId?: number;
    jaar?: number;
    status?: PlanStatus;
  }) {
    return this.prisma.districtsplan.findMany({
      where: filter,
      orderBy: [{ jaar: 'desc' }, { districtId: 'asc' }, { versie: 'desc' }],
      include: {
        district: { select: { id: true, naam: true, code: true } },
        _count: { select: { prioriteiten: true } },
      },
    });
  }

  async districtsplanDetail(id: number) {
    const p = await this.prisma.districtsplan.findUnique({
      where: { id },
      include: {
        district: true,
        gemaaktDoor: { select: { id: true, naam: true } },
        prioriteiten: { orderBy: { volgorde: 'asc' } },
      },
    });
    if (!p) throw new NotFoundException();
    return p;
  }

  /**
   * Hulp-endpoint voor DC bij opstellen districtsplan:
   * geeft alle goedgekeurde ressortplan-prioriteiten van een district
   * voor een gegeven jaar terug, gegroepeerd per ressort.
   *
   * Dit is wat decentralisatie écht betekent — bottom-up aggregatie.
   */
  async aggregatieVoorDistrict(districtId: number, jaar: number) {
    const plannen = await this.prisma.ressortplan.findMany({
      where: {
        ressort: { districtId },
        jaar,
        status: 'GOEDGEKEURD',
      },
      include: {
        ressort: { select: { id: true, naam: true } },
        prioriteiten: { orderBy: { volgorde: 'asc' } },
      },
      orderBy: { ressortId: 'asc' },
    });

    return {
      districtId,
      jaar,
      aantalRessorten: plannen.length,
      totaalPrioriteiten: plannen.reduce((s, p) => s + p.prioriteiten.length, 0),
      perRessort: plannen.map((p) => ({
        ressort: p.ressort,
        plan: { id: p.id, titel: p.titel, versie: p.versie },
        prioriteiten: p.prioriteiten,
      })),
    };
  }
}
