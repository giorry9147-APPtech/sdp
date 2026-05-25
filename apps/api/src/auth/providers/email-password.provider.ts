import { Injectable, Logger } from '@nestjs/common';
import * as argon2 from 'argon2';
import { PrismaService } from '../../common/prisma.service';
import type {
  IdentityClaims,
  IdentityProvider,
  LoginInput,
} from '../identity-provider.interface';

/**
 * Email + wachtwoord — de MVP-default.
 *
 * Wachtwoord-hashing met Argon2id (OWASP-aanbevolen). Bij vervanging
 * door Digitale-ID kunnen bestaande accounts deze provider blijven
 * gebruiken (parallelle bestaanwijze).
 */
@Injectable()
export class EmailPasswordProvider implements IdentityProvider {
  readonly name = 'email-password';
  private readonly logger = new Logger(EmailPasswordProvider.name);

  constructor(private readonly prisma: PrismaService) {}

  async verify(input: LoginInput): Promise<IdentityClaims | null> {
    if (!input.email || !input.wachtwoord) {
      return null;
    }

    const gebruiker = await this.prisma.gebruiker.findUnique({
      where: { email: input.email.toLowerCase() },
    });

    if (!gebruiker?.wachtwoordHash) {
      // Constant-time fake check tegen user-enumeration
      await argon2.verify(
        '$argon2id$v=19$m=65536,t=3,p=4$YWFhYWFhYWFhYWFhYWFhYQ$' +
          'q3hVtY9wA8wOoBJaCprD9oZRk/4t3LBNa3MGmcXEvLU',
        input.wachtwoord,
      ).catch(() => false);
      return null;
    }

    if (gebruiker.status !== 'ACTIEF') {
      this.logger.warn(`Login geweigerd: ${gebruiker.email} status=${gebruiker.status}`);
      return null;
    }

    const ok = await argon2.verify(gebruiker.wachtwoordHash, input.wachtwoord);
    if (!ok) return null;

    return {
      externalId: gebruiker.id,
      email: gebruiker.email ?? undefined,
      emailVerified: gebruiker.emailGeverifieerd,
      naam: gebruiker.naam,
      telefoon: gebruiker.telefoon ?? undefined,
    };
  }

  /** Helper voor seeding/admin: hash een wachtwoord. */
  static async hash(plain: string): Promise<string> {
    return argon2.hash(plain, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
  }
}
