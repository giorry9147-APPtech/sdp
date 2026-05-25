import { Module } from '@nestjs/common';
import { DashboardsController } from './dashboards.controller';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuthModule],
  controllers: [DashboardsController],
})
export class DashboardsModule {}
