import {
  CallHandler,
  ExecutionContext,
  Injectable,
  Logger,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import type { Request } from 'express';
import { PrismaService } from '../common/prisma.service';

/**
 * Lichtgewicht audit-interceptor: registreert LOGIN/LOGOUT en
 * write-acties op specifieke routes. Voor business-events (status
 * wijziging, besluit) loggen services zelf via AuditService — die geven
 * meer context (before/after, reden).
 *
 * Dit interceptor is een **vangnet**, geen vervanging voor expliciete
 * service-logging.
 */
@Injectable()
export class AuditInterceptor implements NestInterceptor {
  private readonly logger = new Logger(AuditInterceptor.name);

  constructor(private readonly prisma: PrismaService) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const req = ctx.switchToHttp().getRequest<Request>();
    const method = req.method;
    const route = req.route?.path ?? req.url;

    // Alleen write-acties + login/logout
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
      return next.handle();
    }

    return next.handle().pipe(
      tap((_resp) => {
        // Specifieke routes hebben service-logging — sla over
        if (route.startsWith('/api/auth/login')) {
          this.fireAndForget({
            actie: 'LOGIN',
            entiteitType: 'Sessie',
            entiteitId: req.user?.id ?? 'anoniem',
            actorId: req.user?.id ?? null,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
          });
          return;
        }
        if (route.startsWith('/api/auth/logout')) {
          this.fireAndForget({
            actie: 'LOGOUT',
            entiteitType: 'Sessie',
            entiteitId: req.user?.id ?? 'anoniem',
            actorId: req.user?.id ?? null,
            ip: req.ip,
            userAgent: req.headers['user-agent'],
          });
        }
      }),
    );
  }

  private fireAndForget(entry: {
    actie: 'LOGIN' | 'LOGOUT';
    entiteitType: string;
    entiteitId: string;
    actorId: string | null;
    ip?: string;
    userAgent?: string;
  }): void {
    this.prisma.auditLog
      .create({
        data: {
          actorId: entry.actorId,
          actie: entry.actie,
          entiteitType: entry.entiteitType,
          entiteitId: entry.entiteitId,
          ip: entry.ip,
          userAgent: entry.userAgent,
        },
      })
      .catch((e) => this.logger.error('Audit-log faalde', e));
  }
}
