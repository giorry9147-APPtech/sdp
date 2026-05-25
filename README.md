# SDP — Suriname Decentralisatie Platform

> Digitaal bestuurs- en decentralisatieplatform voor districtscommissariaten,
> ressortraden en districtsraden in Suriname.

**Status:** MVP-skeleton, in actieve ontwikkeling (Fase 1).
**Spoor:** Optie A uit [`docs-claude/10-relatie-sdp.md`](docs-claude/10-relatie-sdp.md)
— SDP als compatibele voorloper van het bredere e-Suriname.

## Wat zit erin (MVP)

- ✅ 10 districten + ~60 ressorten (seed; namen te verifiëren tegen S.B. 1987 No. 67)
- ✅ **Decentralisatie-kern**: ressortplannen → districtsplannen met WRO-flow
- ✅ **Burgermeldingen** zonder account (ticketnummer + statuspagina)
- ✅ **Vergunningen** (Hinderwet, markt, evenement, geluidsontheffing, kapvergunning)
- ✅ **Projecten** met voortgangslogboek
- ✅ **DC-dashboard** per district met live-tegels
- ✅ **RBAC** met scope (nationaal/district/ressort)
- ✅ **Audit-log** vanaf dag 1 (append-only, e-Suriname compatible)
- ✅ **Pluggable auth**: email/password vandaag, Digitale-ID OIDC straks (zonder code-changes elders)
- ✅ **PostGIS** vanaf dag 1 (geom-velden klaar voor Fase 3 GIS-viewer)
- ✅ **OpenAPI spec** op `/api/docs` — basis voor S-Road publicatie

## Niet erin (bewust)

- Geen GIS-viewer (data wel geo-aware; viewer = Fase 3)
- Geen WhatsApp Business API (= Fase 2)
- Geen offline-mode / native apps (= Fase 2/3)
- Geen meertaligheid (Sranan/Sarnami = Fase 2)
- Geen Digitale-ID OIDC implementatie (stub aanwezig; activeren wanneer endpoint beschikbaar)
- Geen Inheemse/Marron-bestuurslaag (= Fase 3)
- Geen financiële module / districtsbegroting UI (= Fase 2, schema wel klaar)

Zie [`docs/06-features-later.md`](docs/06-features-later.md) en
[`docs/01-mvp-scope.md`](docs/01-mvp-scope.md).

## Structuur

```
SPD/
├── apps/
│   ├── api/                NestJS backend (Prisma + PostGIS)
│   │   ├── prisma/
│   │   │   ├── schema.prisma
│   │   │   └── seed.ts     10 districten + ~60 ressorten + rollen + permissies
│   │   └── src/
│   │       ├── auth/       pluggable IdentityProvider + JWT + RBAC
│   │       ├── audit/      audit-log service + interceptor
│   │       ├── districten/ + ressorten/ + categorieen/
│   │       ├── meldingen/  burger-meldpunt + DC view
│   │       ├── vergunningen/
│   │       ├── projecten/
│   │       ├── plannen/    ressortplan + districtsplan workflow
│   │       └── dashboards/ DC + nationaal
│   └── web/                Next.js 14 App Router (PWA-klaar)
│       └── src/app/
│           ├── (publieke landingspagina)
│           ├── melden/     publiek formulier
│           ├── status/     burger volgt eigen melding
│           ├── districten/ overzicht 10 districten + ressorten
│           ├── login/
│           └── dashboard/  DC-dashboard
├── docs/                   SDP-spoor strategie (district-focus)
├── docs-claude/            e-Suriname spoor (nationale ambitie)
├── docker-compose.yml      Postgres+PostGIS, MinIO, Mailpit
├── .env.example
└── package.json            (pnpm workspaces)
```

## Setup — eerste keer

### Vereisten

| Tool | Versie | Installatie macOS |
|------|--------|-------------------|
| Node.js | ≥ 20 | `brew install node` of via [nvm](https://github.com/nvm-sh/nvm) |
| pnpm | ≥ 9 | `npm install -g pnpm` |
| Docker Desktop | recent | https://www.docker.com/products/docker-desktop |

### Installatie

```sh
# 1. Kopieer environment template
cp .env.example .env

# 2. Installeer dependencies (pnpm workspaces)
pnpm install

# 3. Start lokale services (Postgres+PostGIS, MinIO, Mailpit)
pnpm services:up

# 4. Genereer Prisma client + maak schema in DB + seed data
pnpm --filter @sdp/api prisma generate
pnpm --filter @sdp/api prisma db push --skip-generate
pnpm db:seed

# 5. Demo-gebruikers + realistische demo-data voor presentatie
pnpm --filter @sdp/api admin:seed-demo
pnpm --filter @sdp/api admin:seed-demo-data
```

### Dev-server starten

```sh
# Beide tegelijk:
pnpm dev

# Of apart:
pnpm --filter @sdp/api dev   # http://localhost:4000 + /api/docs
pnpm --filter @sdp/web dev   # http://localhost:3000
```

### Handige URLs

| URL | Wat |
|-----|-----|
| http://localhost:3000 | Frontend (burgerportaal) |
| http://localhost:3000/melden | Publiek meldingsformulier |
| http://localhost:3000/districten | De 10 districten |
| http://localhost:4000/api/docs | OpenAPI / Swagger UI |
| http://localhost:5432 | Postgres (sdp/sdp/sdp) |
| http://localhost:9001 | MinIO console (minioadmin/minioadmin) |
| http://localhost:8025 | Mailpit (alle uitgaande mail in dev) |

### Inloggen — demo-gebruikers

Na `admin:seed-demo` kun je inloggen met deze accounts (wachtwoord: **`Welkom2026!`**):

| Email | Rol | Voor demo |
|-------|-----|-----------|
| `dc.wanica@sdp.local` | DC Wanica | DC-dashboard + vergunningen + plannen |
| `rc.lelydorp@sdp.local` | Ressortcoördinator | Ressortplan opstellen |
| `rrlid.lelydorp@sdp.local` | RR-lid | Ressortplan goedkeuren |
| `drlid.wanica@sdp.local` | DR-lid | Districtsplan goedkeuren |
| `directeur@ro.sr` | Directeur Decentralisatie | RO-eindgoedkeuring |
| `auditor@clad.sr` | CLAD Auditor | Audit-log |
| `super@sdp.local` | Systeembeheerder | Alles |

### Nieuwe gebruiker aanmaken

```sh
pnpm --filter @sdp/api admin:create \
  --email jij@sdp.local \
  --naam "Jouw Naam" \
  --wachtwoord SterkWachtwoord123 \
  --rol dc \
  --district WAN
```

Beschikbare rollen: `super_admin`, `ro_minister`, `ro_directeur_decentralisatie`, `dc`, `districtssecretaris`, `vergunningmedewerker`, `meldingen_medewerker`, `ressortcoordinator`, `rr_lid`, `dr_lid`, `auditor`.

## Productie deploy

Zie [`docs/deploy.md`](docs/deploy.md). Korte versie:

```sh
cp .env.production.example .env  # vul secrets — zie infra/secrets-checklist.md
docker compose -f docker-compose.prod.yml up -d --build
docker exec sdp-api-prod npx prisma db push --skip-generate
docker exec sdp-api-prod npx prisma db seed
docker exec -it sdp-api-prod node dist/scripts/admin-create.js \
  --email dc@... --naam "..." --wachtwoord "..." --rol dc --district WAN
```

Inclusief: productie Dockerfiles met multi-stage builds, Caddy met
auto-TLS, dagelijkse encrypted Postgres-backups (`infra/backup.sh`),
restore-script en secrets-checklist.

## Architectuur in één paragraaf

NestJS API + Prisma + PostgreSQL/PostGIS, Next.js 14 frontend (App Router).
Pluggable auth via een `IdentityProvider` interface — email/password als
MVP-default, Digitale-ID OIDC als toekomstige drop-in. Alle write-acties
gaan door een audit-log. RBAC met scope (nationaal/district/ressort) via
decorator `@Auth(...)`. Geom-velden in alle locatie-entiteiten staan
klaar voor PostGIS-queries; de GIS-viewer komt in Fase 3.

Voor de volledige architectuur zie [`docs/04-architectuur.md`](docs/04-architectuur.md)
en de [ADRs](docs/adr/).

## Strategische documentatie

Twee parallelle sporen:
- [`docs/`](docs/) — **SDP** (dit project, district-focus, snelle MVP)
- [`docs-claude/`](docs-claude/) — **e-Suriname** (nationaal e-Gov, X-Road, 5 jaar, USD 35-55M)

Hun verhouding staat in [`docs-claude/10-relatie-sdp.md`](docs-claude/10-relatie-sdp.md).

## Bijdragen

Standaard workflow:
```sh
git checkout -b feat/iets-toevoegen
# ... wijzigingen ...
pnpm typecheck && pnpm lint
git commit -m "feat: korte beschrijving"
```

## Licentie

Open source-strategie volgt e-Suriname-spoor (zie [`docs-claude/11-aanvullend-onderzoek.md`](docs-claude/11-aanvullend-onderzoek.md) §9). Voorkeur MIT/Apache 2.0 voor maximale herbruikbaarheid binnen CARICOM. Definitieve keuze wordt vastgelegd in een ADR.
