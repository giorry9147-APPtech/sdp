import { Injectable, Logger, NotImplementedException } from '@nestjs/common';
import type {
  IdentityClaims,
  IdentityProvider,
  LoginInput,
} from '../identity-provider.interface';

/**
 * STUB voor Digitale-ID Government Authenticator koppeling.
 *
 * Status: niet geïmplementeerd in MVP.
 *
 * Wanneer de Surinaamse Digitale-ID een productie-OIDC-endpoint biedt,
 * vervang `verify()` en `authorizeUrl()` met een echte OIDC-flow
 * (bv. via openid-client). Het gehele OIDC-deel is bewust geïsoleerd
 * tot dit bestand — geen andere code in SDP weet wélke provider in
 * gebruik is.
 *
 * Vereiste env-variabelen (in te vullen wanneer beschikbaar):
 *   DIGITALE_ID_ISSUER
 *   DIGITALE_ID_CLIENT_ID
 *   DIGITALE_ID_CLIENT_SECRET
 *   DIGITALE_ID_REDIRECT_URI
 *   DIGITALE_ID_SCOPES (default: 'openid profile email')
 */
@Injectable()
export class DigitaleIdProvider implements IdentityProvider {
  readonly name = 'digitale-id';
  private readonly logger = new Logger(DigitaleIdProvider.name);

  authorizeUrl(_state: string, _redirectUri: string): string | null {
    throw new NotImplementedException(
      'Digitale-ID provider is nog niet geïmplementeerd. ' +
        'Zet AUTH_PROVIDER=email-password tot productie-koppeling beschikbaar is.',
    );
  }

  async verify(_input: LoginInput): Promise<IdentityClaims | null> {
    throw new NotImplementedException(
      'Digitale-ID provider is nog niet geïmplementeerd.',
    );
  }
}
