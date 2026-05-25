import { Module } from '@nestjs/common';
import { MeldingenController } from './meldingen.controller';
import { MeldingenService } from './meldingen.service';
import { AuditModule } from '../audit/audit.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [AuditModule, AuthModule],
  controllers: [MeldingenController],
  providers: [MeldingenService],
})
export class MeldingenModule {}
