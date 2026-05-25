import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../common/prisma.service';
import { Auth } from '../auth/rbac';

@ApiTags('dashboards')
@Controller('dashboards')
export class DashboardsController {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * DC-dashboard per district — alle live-tegels die de DC dagelijks
   * nodig heeft. Volgt het ontwerp uit docs/02-componenten.md §C.
   */
  @Get('district/:districtId')
  @Auth('dashboard.district', 'dashboard.nationaal')
  @ApiOperation({ summary: 'DC-dashboard cijfers voor één district' })
  async district(@Param('districtId', ParseIntPipe) districtId: number) {
    const [district, meldOpen, meldCrisis, vergOpen, projLopend, planConcept, planTerGoedkeuring] =
      await Promise.all([
        this.prisma.district.findUnique({
          where: { id: districtId },
          select: {
            id: true,
            code: true,
            naam: true,
            hoofdstad: true,
            _count: { select: { ressorten: true } },
          },
        }),
        this.prisma.melding.count({
          where: { districtId, status: { in: ['NIEUW', 'IN_BEHANDELING', 'EXTRA_INFO_NODIG'] } },
        }),
        this.prisma.melding.count({
          where: { districtId, urgentie: 'CRISIS', status: { notIn: ['GESLOTEN', 'OPGELOST'] } },
        }),
        this.prisma.vergunning.count({
          where: {
            districtId,
            status: { in: ['INGEDIEND', 'IN_BEHANDELING', 'EXTRA_INFO_NODIG'] },
          },
        }),
        this.prisma.project.count({
          where: {
            districtId,
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

    if (!district) {
      return null;
    }

    // Top-5 categorieën meldingen laatste 30 dagen
    const dertigDagen = new Date(Date.now() - 30 * 86400_000);
    const topCategorieen = await this.prisma.melding.groupBy({
      by: ['categorieId'],
      where: { districtId, createdAt: { gte: dertigDagen } },
      _count: true,
      orderBy: { _count: { categorieId: 'desc' } },
      take: 5,
    });

    const catNamen = await this.prisma.categorie.findMany({
      where: { id: { in: topCategorieen.map((c) => c.categorieId) } },
      select: { id: true, naam: true },
    });
    const catMap = new Map(catNamen.map((c) => [c.id, c.naam]));

    return {
      district,
      meldingen: {
        open: meldOpen,
        crisis: meldCrisis,
        topCategorieen30dagen: topCategorieen.map((c) => ({
          categorie: catMap.get(c.categorieId) ?? '?',
          aantal: c._count,
        })),
      },
      vergunningen: { open: vergOpen },
      projecten: { lopend: projLopend },
      plannen: {
        concept: planConcept,
        terGoedkeuring: planTerGoedkeuring,
      },
    };
  }

  /**
   * Nationaal dashboard voor RO — overzicht alle districten.
   */
  @Get('nationaal')
  @Auth('dashboard.nationaal')
  @ApiOperation({ summary: 'Nationaal dashboard (RO)' })
  async nationaal() {
    const districten = await this.prisma.district.findMany({
      orderBy: { naam: 'asc' },
      select: { id: true, code: true, naam: true },
    });

    const cijfers = await Promise.all(
      districten.map(async (d) => {
        const [meldOpen, vergOpen, projLopend] = await Promise.all([
          this.prisma.melding.count({
            where: { districtId: d.id, status: { notIn: ['GESLOTEN', 'OPGELOST'] } },
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

    return cijfers;
  }
}
