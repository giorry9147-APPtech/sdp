import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { AuditModule } from './audit/audit.module';
import { DistrictenModule } from './districten/districten.module';
import { RessortenModule } from './ressorten/ressorten.module';
import { CategorieenModule } from './categorieen/categorieen.module';
import { MeldingenModule } from './meldingen/meldingen.module';
import { VergunningenModule } from './vergunningen/vergunningen.module';
import { ProjectenModule } from './projecten/projecten.module';
import { PlannenModule } from './plannen/plannen.module';
import { DashboardsModule } from './dashboards/dashboards.module';
import { FinancienModule } from './financien/financien.module';
import { DcNotitiesModule } from './dc-notities/dc-notities.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    CommonModule,
    AuditModule,
    AuthModule,
    DistrictenModule,
    RessortenModule,
    CategorieenModule,
    MeldingenModule,
    VergunningenModule,
    ProjectenModule,
    PlannenModule,
    DashboardsModule,
    FinancienModule,
    DcNotitiesModule,
  ],
})
export class AppModule {}
