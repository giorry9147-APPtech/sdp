import { Module } from '@nestjs/common';
import { FinancienController } from './financien.controller';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuditModule, AuthModule],
  controllers: [FinancienController],
})
export class FinancienModule {}
