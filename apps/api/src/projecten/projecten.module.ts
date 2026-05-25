import { Module } from '@nestjs/common';
import { ProjectenController } from './projecten.controller';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuditModule, AuthModule],
  controllers: [ProjectenController],
})
export class ProjectenModule {}
