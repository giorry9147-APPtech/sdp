import { Module } from '@nestjs/common';
import { ZaaktypenController } from './zaaktypen.controller';
import { ZaaktypenService } from './zaaktypen.service';

/**
 * Zaak-fundament (ZF1–ZF3). Exporteert ZaaktypenService zodat de
 * komende Verzoek- (EO4) en Verklaring-modules (VK1) de catalogus +
 * validatie- en vertrouwelijkheid-helpers kunnen hergebruiken.
 */
@Module({
  controllers: [ZaaktypenController],
  providers: [ZaaktypenService],
  exports: [ZaaktypenService],
})
export class ZaaktypenModule {}
