import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import { StorageService } from './storage.service';
import { HealthController } from './health.controller';

@Global()
@Module({
  controllers: [HealthController],
  providers: [PrismaService, StorageService],
  exports: [PrismaService, StorageService],
})
export class CommonModule {}
