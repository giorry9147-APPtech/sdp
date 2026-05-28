import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
  SetMetadata,
  applyDecorators,
  UseGuards,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ApiBearerAuth } from '@nestjs/swagger';
import type { Request } from 'express';
import { JwtAuthGuard } from './jwt-auth.guard';
import type { AuthenticatedUser } from '../common/types';

const PERMISSIE_KEY = 'rbac:permissies';
const SCOPE_KEY = 'rbac:scope';

export const RequirePermissies = (...codes: string[]) =>
  SetMetadata(PERMISSIE_KEY, codes);

export const RequireScope = (
  scope: 'NATIONAAL' | 'DISTRICT' | 'RESSORT' | 'ORGANISATIE',
  paramName?: string,
) => SetMetadata(SCOPE_KEY, { scope, paramName });

@Injectable()
export class RbacGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}

  canActivate(ctx: ExecutionContext): boolean {
    const required = this.reflector.getAllAndOverride<string[]>(PERMISSIE_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    const scopeMeta = this.reflector.getAllAndOverride<{
      scope: 'NATIONAAL' | 'DISTRICT' | 'RESSORT' | 'ORGANISATIE';
      paramName?: string;
    }>(SCOPE_KEY, [ctx.getHandler(), ctx.getClass()]);

    if (!required && !scopeMeta) return true;

    const req = ctx.switchToHttp().getRequest<Request>();
    const user = req.user as AuthenticatedUser | undefined;
    if (!user) throw new ForbiddenException('Niet ingelogd');

    if (required && required.length > 0) {
      const heeft = required.some((p) => user.permissies.has(p));
      if (!heeft) {
        throw new ForbiddenException(
          `Permissie ontbreekt (vereist: ${required.join(' of ')})`,
        );
      }
    }

    if (scopeMeta) {
      const ok = checkScope(user, scopeMeta, req);
      if (!ok) {
        throw new ForbiddenException('Buiten toegestane scope');
      }
    }
    return true;
  }
}

function checkScope(
  user: AuthenticatedUser,
  meta: { scope: 'NATIONAAL' | 'DISTRICT' | 'RESSORT' | 'ORGANISATIE'; paramName?: string },
  req: Request,
): boolean {
  // Nationale rollen mogen altijd — behalve op ORGANISATIE-scope: externe
  // diensten zijn een eigen silo en een nationale RO-rol is daar niet
  // automatisch lid van (anders zou RO elk dienst-dossier kunnen indienen).
  if (meta.scope !== 'ORGANISATIE' && user.rollen.some((r) => r.scope === 'NATIONAAL')) {
    return true;
  }
  if (meta.scope === 'NATIONAAL') return false;

  const paramValue = meta.paramName ? Number(req.params[meta.paramName]) : null;
  if (paramValue == null || Number.isNaN(paramValue)) return false;

  if (meta.scope === 'DISTRICT') {
    return user.rollen.some(
      (r) => r.scope === 'DISTRICT' && r.districtId === paramValue,
    );
  }
  if (meta.scope === 'RESSORT') {
    return user.rollen.some(
      (r) =>
        (r.scope === 'RESSORT' && r.ressortId === paramValue) ||
        // DC heeft ook toegang tot ressorten in zijn district — caller
        // moet expliciet de district-check toepassen indien gewenst
        (r.scope === 'DISTRICT'),
    );
  }
  if (meta.scope === 'ORGANISATIE') {
    // Externe-dienst-gebruiker mag alleen binnen de eigen organisatie. EO2.
    return user.rollen.some(
      (r) => r.scope === 'ORGANISATIE' && r.organisatieId === paramValue,
    );
  }
  return false;
}

/**
 * Combinatie-decorator: vereist login + permissies in één keer.
 * Voeg @ApiBearerAuth() automatisch toe voor OpenAPI.
 */
export const Auth = (...permissies: string[]) =>
  applyDecorators(
    UseGuards(JwtAuthGuard, RbacGuard),
    ApiBearerAuth(),
    ...(permissies.length > 0 ? [RequirePermissies(...permissies)] : []),
  );
