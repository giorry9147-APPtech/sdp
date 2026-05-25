import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { PrismaService } from './prisma.service';

@ApiTags('publiek')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Liveness — process draait' })
  live() {
    return { status: 'ok', ts: new Date().toISOString() };
  }

  @Get('ready')
  @ApiOperation({ summary: 'Readiness — DB bereikbaar' })
  async ready() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return { status: 'ready', db: 'ok', ts: new Date().toISOString() };
    } catch (e) {
      return {
        status: 'not-ready',
        db: 'unreachable',
        error: e instanceof Error ? e.message : 'fout',
        ts: new Date().toISOString(),
      };
    }
  }
}
