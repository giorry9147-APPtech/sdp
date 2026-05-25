import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/prisma.service';
import type { AuditActie, Prisma } from '@prisma/client';

export type AuditEntry = {
  actorId?: string | null;
  actie: AuditActie;
  entiteitType: string;
  entiteitId: string | number;
  voor?: unknown;
  na?: unknown;
  ip?: string;
  userAgent?: string;
  context?: Record<string, unknown>;
};

@Injectable()
export class AuditService {
  constructor(private readonly prisma: PrismaService) {}

  async log(entry: AuditEntry): Promise<void> {
    await this.prisma.auditLog.create({
      data: {
        actorId: entry.actorId ?? null,
        actie: entry.actie,
        entiteitType: entry.entiteitType,
        entiteitId: String(entry.entiteitId),
        voor: (entry.voor ?? null) as Prisma.InputJsonValue,
        na: (entry.na ?? null) as Prisma.InputJsonValue,
        ip: entry.ip ?? null,
        userAgent: entry.userAgent ?? null,
        context: (entry.context ?? null) as Prisma.InputJsonValue,
      },
    });
  }

  async lijst(filter: {
    entiteitType?: string;
    entiteitId?: string;
    actorId?: string;
    vanaf?: Date;
    tot?: Date;
    limit?: number;
    offset?: number;
  }) {
    return this.prisma.auditLog.findMany({
      where: {
        entiteitType: filter.entiteitType,
        entiteitId: filter.entiteitId,
        actorId: filter.actorId,
        createdAt: {
          gte: filter.vanaf,
          lte: filter.tot,
        },
      },
      orderBy: { createdAt: 'desc' },
      take: filter.limit ?? 100,
      skip: filter.offset ?? 0,
    });
  }
}
