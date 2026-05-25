import { Controller, Get, Query, BadRequestException } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { CategorieType } from '@prisma/client';
import { PrismaService } from '../common/prisma.service';

@ApiTags('publiek')
@Controller('categorieen')
export class CategorieenController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Categorieën per type (melding | vergunning | project)' })
  @ApiQuery({ name: 'type', enum: ['melding', 'vergunning', 'project'] })
  async lijst(@Query('type') type: string) {
    const mapped: Record<string, CategorieType> = {
      melding: CategorieType.MELDING,
      vergunning: CategorieType.VERGUNNING,
      project: CategorieType.PROJECT,
    };
    const t = mapped[type?.toLowerCase()];
    if (!t) {
      throw new BadRequestException(
        'type moet melding, vergunning of project zijn',
      );
    }

    return this.prisma.categorie.findMany({
      where: { type: t, actief: true },
      orderBy: [{ volgorde: 'asc' }, { naam: 'asc' }],
      select: { id: true, code: true, naam: true, icoon: true },
    });
  }
}
