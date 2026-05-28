import {
  Injectable,
  UnauthorizedException,
  Logger,
  Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as crypto from 'node:crypto';
import { PrismaService } from '../common/prisma.service';
import type {
  IdentityProvider,
  LoginInput,
} from './identity-provider.interface';
import type { AuthenticatedUser, RolScopeContext } from '../common/types';

export const IDENTITY_PROVIDER = Symbol('IDENTITY_PROVIDER');

export type LoginResult = {
  accessToken: string;
  refreshToken: string;
  user: AuthenticatedUser;
};

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly accessTtl: string;
  private readonly refreshTtlMs: number;

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwt: JwtService,
    @Inject(IDENTITY_PROVIDER) private readonly idp: IdentityProvider,
  ) {
    this.accessTtl = process.env.JWT_ACCESS_TTL ?? '15m';
    this.refreshTtlMs = parseTtl(process.env.JWT_REFRESH_TTL ?? '7d');
  }

  async login(input: LoginInput): Promise<LoginResult> {
    const claims = await this.idp.verify(input);
    if (!claims) {
      throw new UnauthorizedException('Ongeldige inloggegevens');
    }

    // Vind of maak de gebruiker. Voor email-password is externalId = users.id.
    // Voor OIDC providers wordt externalId de sub-claim en koppelen we via
    // (authProvider, externalId).
    let gebruiker = await this.prisma.gebruiker.findFirst({
      where: {
        OR: [
          { id: claims.externalId },
          claims.email ? { email: claims.email.toLowerCase() } : undefined,
        ].filter(Boolean) as never,
      },
    });

    if (!gebruiker && claims.email) {
      gebruiker = await this.prisma.gebruiker.create({
        data: {
          email: claims.email.toLowerCase(),
          naam: claims.naam ?? claims.email,
          telefoon: claims.telefoon ?? null,
          externalId: claims.externalId,
          emailGeverifieerd: claims.emailVerified ?? false,
        },
      });
    }

    if (!gebruiker) {
      throw new UnauthorizedException('Geen gebruikersaccount gevonden');
    }

    await this.prisma.gebruiker.update({
      where: { id: gebruiker.id },
      data: { laatsteLogin: new Date() },
    });

    const user = await this.loadAuthenticatedUser(gebruiker.id);
    const accessToken = this.signAccess(user);
    const { refreshToken } = await this.createSession(
      gebruiker.id,
      input.ip,
      input.userAgent,
    );

    this.logger.log(
      `Login ok: ${gebruiker.email ?? gebruiker.id} via ${this.idp.name}`,
    );
    return { accessToken, refreshToken, user };
  }

  async refresh(refreshToken: string, ip?: string): Promise<LoginResult> {
    const hash = hashToken(refreshToken);
    const sessie = await this.prisma.sessie.findFirst({
      where: { refreshHash: hash, ingetrokken: false },
    });
    if (!sessie || sessie.verlooptOp < new Date()) {
      throw new UnauthorizedException('Sessie verlopen');
    }

    // Rotate: trek oude sessie in, maak nieuwe
    await this.prisma.sessie.update({
      where: { id: sessie.id },
      data: { ingetrokken: true },
    });

    const user = await this.loadAuthenticatedUser(sessie.gebruikerId);
    const accessToken = this.signAccess(user);
    const nieuwe = await this.createSession(sessie.gebruikerId, ip, sessie.userAgent ?? undefined);

    return { accessToken, refreshToken: nieuwe.refreshToken, user };
  }

  async logout(refreshToken: string): Promise<void> {
    const hash = hashToken(refreshToken);
    await this.prisma.sessie.updateMany({
      where: { refreshHash: hash, ingetrokken: false },
      data: { ingetrokken: true },
    });
  }

  async loadAuthenticatedUser(gebruikerId: string): Promise<AuthenticatedUser> {
    const g = await this.prisma.gebruiker.findUnique({
      where: { id: gebruikerId },
      include: {
        rollen: {
          where: {
            OR: [{ geldigTot: null }, { geldigTot: { gt: new Date() } }],
          },
          include: {
            rol: {
              include: {
                permissies: { include: { permissie: true } },
              },
            },
            subregio: { select: { code: true, naam: true } },
            organisatie: { select: { code: true, naam: true, korteNaam: true } },
          },
        },
      },
    });

    if (!g || g.status !== 'ACTIEF') {
      throw new UnauthorizedException('Gebruiker niet actief');
    }

    const rollen: RolScopeContext[] = g.rollen.map((gr) => ({
      rol: gr.rol.code,
      scope: gr.rol.scope,
      districtId: gr.districtId ?? undefined,
      ressortId: gr.ressortId ?? undefined,
      subregioId: gr.subregioId ?? undefined,
      subregioCode: gr.subregio?.code,
      subregioNaam: gr.subregio?.naam,
      organisatieId: gr.organisatieId ?? undefined,
      organisatieCode: gr.organisatie?.code,
      organisatieNaam: gr.organisatie?.korteNaam ?? gr.organisatie?.naam,
    }));

    const permissies = new Set<string>();
    for (const gr of g.rollen) {
      for (const rp of gr.rol.permissies) {
        permissies.add(rp.permissie.code);
      }
    }

    return {
      id: g.id,
      email: g.email,
      naam: g.naam,
      rollen,
      permissies,
    };
  }

  private signAccess(user: AuthenticatedUser): string {
    return this.jwt.sign(
      {
        sub: user.id,
        email: user.email,
        naam: user.naam,
        rollen: user.rollen,
      },
      { expiresIn: this.accessTtl },
    );
  }

  private async createSession(
    gebruikerId: string,
    ip?: string,
    userAgent?: string,
  ): Promise<{ refreshToken: string }> {
    const refreshToken = crypto.randomBytes(48).toString('base64url');
    const refreshHash = hashToken(refreshToken);

    await this.prisma.sessie.create({
      data: {
        gebruikerId,
        refreshHash,
        ip,
        userAgent,
        verlooptOp: new Date(Date.now() + this.refreshTtlMs),
      },
    });

    return { refreshToken };
  }
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function parseTtl(ttl: string): number {
  const m = ttl.match(/^(\d+)\s*(s|m|h|d)$/);
  if (!m) throw new Error(`Ongeldige TTL: ${ttl}`);
  const n = Number(m[1]);
  const unit = m[2];
  const mult: Record<string, number> = { s: 1e3, m: 60e3, h: 3600e3, d: 86400e3 };
  return n * mult[unit];
}
