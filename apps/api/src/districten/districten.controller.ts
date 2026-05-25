import { Controller, Get, NotFoundException, Param, ParseIntPipe } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../common/prisma.service';

@ApiTags('districten')
@Controller('districten')
export class DistrictenController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Alle 10 districten' })
  async lijst() {
    return this.prisma.district.findMany({
      orderBy: { naam: 'asc' },
      select: {
        id: true,
        code: true,
        naam: true,
        hoofdstad: true,
        _count: { select: { ressorten: true } },
      },
    });
  }

  @Get(':code')
  @ApiOperation({ summary: 'Eén district op code (bv. PAR, WAN, SIP)' })
  async detail(@Param('code') code: string) {
    const d = await this.prisma.district.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        ressorten: {
          orderBy: { naam: 'asc' },
          select: { id: true, code: true, naam: true },
        },
      },
    });
    if (!d) throw new NotFoundException(`District ${code} bestaat niet`);
    return d;
  }

  @Get('id/:id')
  @ApiOperation({ summary: 'Eén district op id' })
  async detailOpId(@Param('id', ParseIntPipe) id: number) {
    const d = await this.prisma.district.findUnique({
      where: { id },
      include: {
        ressorten: {
          orderBy: { naam: 'asc' },
          select: { id: true, code: true, naam: true },
        },
      },
    });
    if (!d) throw new NotFoundException();
    return d;
  }
}
