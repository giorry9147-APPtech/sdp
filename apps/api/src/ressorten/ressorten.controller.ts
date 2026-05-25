import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../common/prisma.service';

@ApiTags('ressorten')
@Controller('ressorten')
export class RessortenController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Lijst van ressorten, filterbaar per district' })
  @ApiQuery({ name: 'district', required: false, description: 'District-code (bv. WAN) of id' })
  async lijst(@Query('district') district?: string) {
    let districtId: number | undefined;

    if (district) {
      const asNum = Number(district);
      if (Number.isFinite(asNum)) {
        districtId = asNum;
      } else {
        const d = await this.prisma.district.findUnique({
          where: { code: district.toUpperCase() },
        });
        districtId = d?.id;
      }
    }

    return this.prisma.ressort.findMany({
      where: { districtId },
      orderBy: [{ districtId: 'asc' }, { naam: 'asc' }],
      select: {
        id: true,
        code: true,
        naam: true,
        districtId: true,
        district: { select: { code: true, naam: true } },
      },
    });
  }
}
