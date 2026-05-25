# ADR 0002 — Pluggable Identity Provider

**Status:** geaccepteerd
**Datum:** 2026-05-24

## Context

De Surinaamse Digitale-ID Government Authenticator
(digitale-id.gov.sr) is operationeel sinds 7 april 2025 (PKI/digitale
uittreksels), maar er is nog geen publiek beschikbaar OIDC-endpoint dat
externe applicaties kunnen consumeren. Tegelijk moeten we vandaag al
inloggen mogelijk maken voor pilot-DC's en medewerkers.

We willen géén lock-in op één identity-bron, en geen vervang-pijn
wanneer Digitale-ID wel beschikbaar komt.

## Beslissing

Definieer een abstracte `IdentityProvider` interface met één methode
`verify(input): IdentityClaims | null` (plus optioneel `authorizeUrl()`
voor OIDC). Concrete implementaties:

1. **EmailPasswordProvider** — MVP-default, Argon2id hashing.
2. **DigitaleIdProvider** — stub die `NotImplementedException` gooit;
   wordt vervangen door echte OIDC-flow zodra het endpoint beschikbaar is.
3. **MagicLinkProvider** — later, voor burgers zonder account.

Keuze wordt server-side gemaakt via env var `AUTH_PROVIDER` in
[`apps/api/src/auth/auth.module.ts`](../../apps/api/src/auth/auth.module.ts).

Géén andere module in SDP weet welke provider actief is. `AuthService`
ontvangt de provider via DI (`IDENTITY_PROVIDER` symbol).

## Gevolgen

- Migratie naar Digitale-ID = één bestand vervangen + env-flag wijzigen.
- Bestaande email/password accounts blijven werken parallel (Fase 2 keuze).
- Gebruikers + rollen blijven altijd in onze database; provider levert
  alleen identiteit, niet permissies.

## Alternatieven overwogen

- **Direct OIDC met openid-client**: te vroeg, geen endpoint beschikbaar.
- **Auth0 / Clerk / Cognito**: lock-in én bestuurlijke data hoort onder
  Surinaamse controle (zie [docs-claude/07-juridisch.md](../../docs-claude/07-juridisch.md)).
- **Eigen wachtwoord-DB voor altijd**: blokkeert toekomstige overheids-SSO.
