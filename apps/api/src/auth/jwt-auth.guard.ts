import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type { Request } from 'express';
import { AuthService } from './auth.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly auth: AuthService,
  ) {}

  async canActivate(ctx: ExecutionContext): Promise<boolean> {
    const req = ctx.switchToHttp().getRequest<Request>();
    const header = req.headers.authorization;
    if (!header?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Geen access-token');
    }
    const token = header.slice('Bearer '.length);

    let payload: { sub: string };
    try {
      payload = this.jwt.verify(token) as { sub: string };
    } catch {
      throw new UnauthorizedException('Ongeldig of verlopen token');
    }

    req.user = await this.auth.loadAuthenticatedUser(payload.sub);
    return true;
  }
}
