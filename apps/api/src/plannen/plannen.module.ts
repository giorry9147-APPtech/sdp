import { Module } from '@nestjs/common';
import { PlannenController } from './plannen.controller';
import { PlannenService } from './plannen.service';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuditModule, AuthModule],
  controllers: [PlannenController],
  providers: [PlannenService],
})
export class PlannenModule {}
