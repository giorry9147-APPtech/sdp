import { BadRequestException, Controller, Get, Param, Query } from '@nestjs/common';
import { ApiOperation, ApiQuery, ApiTags } from '@nestjs/swagger';
import { Zaakkanaal } from '@prisma/client';
import { ZaaktypenService } from './zaaktypen.service';

/**
 * Zaaktype-catalogus — publieke read (referentiedata, zoals categorieën).
 * Voedt de "nieuw verzoek"-wizard (EO8) en de burger-verklaring-flow (VK2).
 */
@ApiTags('publiek')
@Controller('zaaktypen')
export class ZaaktypenController {
  constructor(private readonly service: ZaaktypenService) {}

  @Get()
  @ApiOperation({ summary: 'Lijst zaaktypen (optioneel gefilterd op kanaal G2G|C2G)' })
  @ApiQuery({ name: 'kanaal', required: false, enum: ['G2G', 'C2G'] })
  async lijst(@Query('kanaal') kanaal?: string) {
    let k: Zaakkanaal | undefined;
    if (kanaal) {
      const up = kanaal.toUpperCase();
      if (up !== 'G2G' && up !== 'C2G') {
        throw new BadRequestException('kanaal moet G2G of C2G zijn');
      }
      k = up as Zaakkanaal;
    }
    return this.service.lijst(k);
  }

  @Get(':code')
  @ApiOperation({ summary: 'Zaaktype-detail incl. statussen, resultaten en eigenschappen' })
  async detail(@Param('code') code: string) {
    return this.service.detail(code);
  }
}
