import { Module } from '@nestjs/common';
import { DcNotitiesController } from './dc-notities.controller';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuditModule, AuthModule],
  controllers: [DcNotitiesController],
})
export class DcNotitiesModule {}
