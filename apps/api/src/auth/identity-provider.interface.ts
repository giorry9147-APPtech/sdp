/**
 * IdentityProvider — pluggable interface voor authenticatie.
 *
 * Doel: SDP heeft géén lock-in op één identity-bron. We starten met
 * email/password (MVP), en kunnen later Digitale-ID Government
 * Authenticator (OIDC) of CBB e-ID inpluggen zonder business-code te
 * raken.
 *
 * Het keuzepunt voor welke provider wordt geactiveerd zit in
 * `auth.module.ts` via env var AUTH_PROVIDER.
 *
 * Belangrijk: gebruikers + rollen blijven altijd in onze database.
 * De provider levert alleen het bewijs WIE iemand is — niet WAT die
 * mag (dat is RBAC, en blijft in SDP).
 */

export type IdentityClaims = {
  /** Stabiele identifier binnen de provider (sub-claim bij OIDC). */
  externalId: string;
  email?: string;
  emailVerified?: boolean;
  naam?: string;
  telefoon?: string;
  /** Provider-specifieke extra claims (bv. eIDAS-niveau). */
  raw?: Record<string, unknown>;
};

export type LoginInput = {
  email?: string;
  wachtwoord?: string;
  /** Voor OIDC: callback authorization-code. */
  code?: string;
  /** Voor OIDC: PKCE code-verifier. */
  codeVerifier?: string;
  ip?: string;
  userAgent?: string;
};

export interface IdentityProvider {
  /** Korte naam van deze provider (logging / debug). */
  readonly name: string;

  /**
   * Verifieer credentials en return claims óf null bij ongeldige login.
   * Implementaties horen géén sessie te creëren — dat doet AuthService.
   */
  verify(input: LoginInput): Promise<IdentityClaims | null>;

  /**
   * Voor OIDC-providers: URL waarheen de browser gestuurd moet worden
   * om de login-flow te starten. Voor lokale providers: null.
   */
  authorizeUrl?(state: string, redirectUri: string): string | null;
}
