# Project context voor Claude Code sessies

Dit bestand wordt automatisch geladen aan het begin van elke sessie.
Houd het kort — voor diepere context: zie `README.md`, `docs/`, `docs-claude/`.

## Wat is dit project

SDP = Suriname Decentralisatie Platform. Digitaal bestuursplatform voor
de 10 districten + ~62 ressorten van Suriname, op basis van de Wet
Regionale Organen (S.B. 1989 No. 44).

We zitten in **Optie A** uit `docs-claude/10-relatie-sdp.md`:
SDP wordt gebouwd nu (3-6 mnd MVP) als compatibele voorloper van het
bredere e-Suriname-platform (X-Road, Common Ground). Architectuur is
disciplined e-Suriname-compatible — geen lock-in op specifieke
identity-provider, cloud, of stack-keuzes die migratie blokkeren.

## Stack

- pnpm workspaces
- Backend: NestJS 10 + Prisma + PostgreSQL 16 + PostGIS 3.4
- Frontend: Next.js 14 (App Router) + Tailwind
- Auth: pluggable IdentityProvider (email/password = MVP-default;
  Digitale-ID OIDC = stub voor later)
- RBAC met scope (nationaal/district/ressort) via `@Auth(...)` decorator
- Audit-log append-only vanaf dag 1

## Decentralisatie-focus (belangrijk)

Dit is GEEN generieke citizen-portal. Het is specifiek voor Surinaamse
decentralisatie. Features moeten gericht zijn op:
- Districten + ressorten als first-class entiteiten
- Ressortplan → districtsplan workflow (WRO-conform)
- DC-bevoegdheden (vergunningen, meldingen)
- Districtsfonds (Wet Fid art. 40) — schema klaar, UI Fase 2

## Belangrijke beslissingen

Zie `docs/adr/` — leest snel.
- ADR 0001: monorepo
- ADR 0002: pluggable identity provider (Digitale-ID OPEN gelaten)
- ADR 0003: PostGIS vanaf dag 1
- ADR 0004: ressortplan → districtsplan workflow

## Wat NIET doen

- Geen lock-in op Digitale-ID kiezen — eerst beschikbaar maken
- Geen kadaster-functionaliteit bouwen (MI-GLIS is autoriteit)
- Geen besluiten over grondenrechten (juridisch buiten mandaat)
- Geen WhatsApp als opslag (alleen als interface in Fase 2)
- Geen scope creep — Fase-gates strikt handhaven

## Commando's

```sh
pnpm install
pnpm services:up           # postgres + minio + mailpit
pnpm --filter @sdp/api prisma migrate dev
pnpm db:seed
pnpm dev                   # api + web parallel
```

API: http://localhost:4000  ·  Docs: http://localhost:4000/api/docs
Web: http://localhost:3000

## Open punten (vóór Fase 2)

- Officiële ressortnamen valideren tegen Decreet Ressortenindeling S.B. 1987 No. 67
- Admin-CLI voor eerste user (`pnpm api admin:create`)
- Pilot-DC kiezen (Wanica of Paramaribo) — zie docs/01-mvp-scope.md
- Hosting-keuze (lokaal Suriname vs. regio) — zie docs/04-architectuur.md
- **`@sdp.sr`-domein registreren** + DC-mailboxen activeren (zie Fase 0 in docs/03-stappenplan.md). Demo gebruikt nu sdp.sr-accounts uit docs/DC's.md, echte emails staan daar maar zitten NIET in de database.

## Demo-data (na seed)

- 10 districten + 62 ressorten + 15 subregios (PAR-NO/ZW/MD, WAN-ZO/CN/NW, MAR-MOE/ALB, SIP-COE/COP/SAR/SUR/TAP/KAB/PAM)
- 20 realistische DC-accounts op `@sdp.sr` (wachtwoord `Welkom2026!`) — bv. `ernesto.muller@sdp.sr` (DC Wanica Zuid-Oost), `josafat.kanape@sdp.sr` (DC Sipa Tapanahony)
- Ondersteunende `@sdp.local` rollen (districtssecretaris, RR-lid, etc.) voor 4-ogen-flows
