import { Module } from '@nestjs/common';
import { VerzoekenController } from './verzoeken.controller';
import { VerzoekenService } from './verzoeken.service';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';
import { ZaaktypenModule } from '../zaaktypen/zaaktypen.module';

@Module({
  imports: [AuditModule, AuthModule, ZaaktypenModule],
  controllers: [VerzoekenController],
  providers: [VerzoekenService],
  exports: [VerzoekenService],
})
export class VerzoekenModule {}
