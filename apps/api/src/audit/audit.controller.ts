import { Controller, Get, Query } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuditService } from './audit.service';
import { Auth } from '../auth/rbac';

@ApiTags('audit')
@Controller('audit')
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  @Auth('audit.read.nationaal', 'audit.read.district')
  @ApiOperation({ summary: 'Audit-log raadplegen' })
  async lijst(
    @Query('entiteitType') entiteitType?: string,
    @Query('entiteitId') entiteitId?: string,
    @Query('actorId') actorId?: string,
    @Query('limit') limit?: string,
  ) {
    return this.audit.lijst({
      entiteitType,
      entiteitId,
      actorId,
      limit: limit ? Number(limit) : undefined,
    });
  }
}
