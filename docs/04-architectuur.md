# 04 — Technische architectuur

## Uitgangspunten

1. **Bouw als overheidsinfrastructuur, niet als webapp.** Audit, RBAC, versioning, retentie vanaf dag 1.
2. **PostgreSQL + PostGIS vanaf de eerste commit.** Ook al gebruiken we geo nog niet — datamodel moet ruimte-aware zijn.
3. **Eén codebase, multi-tenant per district.** Geen aparte deploy per district; data-scheiding via `district_id` + row-level security.
4. **API-first.** Web-UI is één client; mobile/USSD/AI komen later op dezelfde API.
5. **Open source by default.** Bouwt vertrouwen en reduceert leveranciersafhankelijkheid voor overheid.

## Stack

### Frontend
- **Next.js (App Router)** + **TypeScript**
- **Tailwind CSS** + **shadcn/ui** voor componenten
- **TanStack Query** voor server state
- **react-hook-form + zod** voor formvalidatie
- **MapLibre GL** voor GIS-viewer (Fase 3) — open alternatief voor Mapbox
- PWA-config (service worker) in Fase 2 voor offline draft

### Backend
- **NestJS** (TypeScript) — RBAC, workflow-engine, audit-decorator passen modulair
  - alternatief: **Laravel** als team meer PHP-ervaring heeft
- **Prisma ORM** (of TypeORM) met PostGIS support
- **BullMQ** + Redis voor achtergrondtaken (PDF-generatie, emails, exports)
- **OpenAPI** spec gegenereerd uit code, gepubliceerd als developer-portal

### Database
- **PostgreSQL 16+** met **PostGIS** extensie vanaf dag 1
- **Row-Level Security** voor district-isolatie
- **Logical replication** voor read-replica's later

### Storage
- **S3-compatible object storage**: Backblaze B2 of Wasabi voor kostenefficiëntie
- Bestanden virusscan via ClamAV bij upload
- Pre-signed URLs voor downloads (kort TTL)

### Auth
- Eigen auth-service (Argon2id, JWT met korte TTL + refresh)
- TOTP 2FA via `otplib`
- Magic-link voor burgers (token via email, 15min geldig)

### Infrastructure
- **Containerized** (Docker), draaien via:
  - **Kubernetes** of **Hetzner/lokale VPS** in eerste fase
  - Reverse proxy: **Caddy** of **Traefik** (auto-TLS)
- **CI/CD**: GitHub Actions / GitLab CI
- **Monitoring**: Grafana + Prometheus, Sentry voor errors
- **Logs**: gestructureerd (JSON), centraal verzameld

### Hosting-keuze (open vraag, beslissen in Fase 0)

| Optie | Voor | Tegen |
|-------|------|-------|
| **Lokaal datacenter Suriname** | data-soevereiniteit, politiek juist signaal | beperkte SLA, hogere kosten, beperkte schaal |
| **Regio Caribbean (Trinidad/Curaçao)** | latency redelijk, regionaal | zelfde politieke gevoeligheid als verder weg |
| **AWS São Paulo / Azure Brazil South** | beste SLA en schaal | datasoevereiniteit-discussie |
| **EU (Frankfurt/Amsterdam)** | GDPR-grade compliance | hoge latency, politiek lastig |

**Advies:** start MVP op cloud (snelheid), bouw infrastructuur-als-code zo dat migratie naar lokaal datacenter in Fase 2/3 een week werk is. Maak géén lock-in op proprietary cloud-diensten (geen AWS Lambda etc.).

## High-level diagram

```
┌────────────────────────────────────────────────────────┐
│                       CLIENTS                          │
│  Web (Next.js PWA)  ·  Burger-form  ·  Admin  ·  API   │
└──────────────────────────┬─────────────────────────────┘
                           │ HTTPS (TLS 1.3)
                           │
┌──────────────────────────▼─────────────────────────────┐
│              Reverse Proxy (Caddy/Traefik)             │
│        rate-limit · WAF rules · TLS termination        │
└──────────────────────────┬─────────────────────────────┘
                           │
┌──────────────────────────▼─────────────────────────────┐
│                  API (NestJS)                          │
│  ┌──────┐ ┌──────┐ ┌──────────┐ ┌──────┐ ┌─────────┐  │
│  │ Auth │ │ RBAC │ │ Workflow │ │ PDF  │ │ Audit   │  │
│  └──────┘ └──────┘ └──────────┘ └──────┘ └─────────┘  │
└────┬──────────────────┬──────────────────┬────────────┘
     │                  │                  │
     ▼                  ▼                  ▼
┌─────────┐      ┌─────────────┐    ┌────────────┐
│Postgres │      │ Object Store│    │   Redis    │
│+PostGIS │      │ (S3-compat) │    │+ BullMQ Q  │
│  RLS    │      │  ClamAV     │    │            │
└─────────┘      └─────────────┘    └────────────┘
     │                                    │
     │                                    ▼
     │                            ┌───────────────┐
     │                            │ Workers       │
     │                            │ (PDFs, mail,  │
     │                            │  exports, AV) │
     │                            └───────────────┘
     ▼
┌─────────────────┐
│  Audit Log      │
│  (append-only,  │
│   7+ jaar)      │
└─────────────────┘
```

## Datamodel — kernentiteiten (MVP)

```
users (id, email, phone, password_hash, totp_secret, status, created_at)
roles (id, name, scope)              -- bv. 'dc' scope='district'
permissions (id, name)               -- bv. 'permit.approve'
role_permissions (role_id, permission_id)
user_roles (user_id, role_id, district_id NULLABLE, ressort_id NULLABLE)

districts (id, code, name, geom GEOGRAPHY)        -- 10 records
ressorts  (id, code, name, district_id, geom GEOGRAPHY)  -- ~62 records
categories (id, parent_id, name, type)            -- meldingen, vergunningen

reports        -- burgermeldingen
  (id, ticket_no, district_id, ressort_id, category_id, status,
   urgency, description, reporter_phone, reporter_email,
   geom POINT, created_at, assigned_to)
report_attachments (id, report_id, file_key, kind, size)
report_events     (id, report_id, actor_id, type, payload, created_at)

permits        -- vergunningen
  (id, ref_no, type, status, applicant_id, district_id,
   submitted_at, decided_at, decision)
permit_docs    (id, permit_id, file_key, required, uploaded_at)
permit_events  (id, permit_id, actor_id, type, payload, created_at)

projects       -- districtsprojecten
  (id, title, status, district_id, ressort_id, budget_indicative,
   start_date, end_date, contractor)
project_updates (id, project_id, actor_id, body, created_at)

audit_log      -- append-only
  (id, actor_id, action, entity_type, entity_id,
   before JSONB, after JSONB, ip, user_agent, created_at)
```

### Indexen vanaf dag 1
- `audit_log(entity_type, entity_id, created_at DESC)`
- `reports(district_id, status, created_at DESC)`
- `reports USING GIST(geom)` — voor latere GIS-queries
- `permits(status, district_id)`
- Full-text search: `tsvector` op `reports.description`, `permits.*`

## Security-basis

| Gebied | Maatregel |
|--------|-----------|
| Transport | TLS 1.3 verplicht, HSTS, geen mixed content |
| Auth | Argon2id, 2FA verplicht voor staf, magic-link voor burgers |
| Sessies | Korte JWT TTL (15 min) + refresh-token rotatie |
| Authorization | RBAC + Row-Level Security op `district_id` |
| Input | Zod-validatie alle endpoints; SQL alleen via Prisma (geen string-concat) |
| Uploads | MIME-sniffing + ClamAV scan + max-size + extensies whitelist |
| Audit | Elke write logt actor + before/after, onveranderbaar |
| Secrets | Env-vars via vault (Doppler/Infisical/sops); nooit in repo |
| Backups | Dagelijks encrypted off-site; maandelijks restore-test |
| Dependencies | Renovate/Dependabot; CI faalt bij hoge CVE |
| Headers | CSP, X-Frame-Options, Referrer-Policy via Caddy |
| Rate-limit | Per-IP en per-account; aparte limieten voor publiek meldpunt |
| PII export | Audit-log op exports; PII-velden gemaskeerd waar mogelijk |

## Workflow-engine principes

Vergunningen, meldingen en projecten zijn allemaal **stateful entities met transities**. Eén generieke engine:

```ts
type Workflow<S extends string> = {
  initial: S;
  transitions: Array<{
    from: S; to: S; trigger: string;
    guard?: (ctx) => boolean;        // mag deze rol/staat dit?
    effects?: Array<(ctx) => void>;  // emit event, send email, log
  }>;
};
```

Eén implementatie, per module geconfigureerd. Audit-log + notificaties als cross-cutting concerns (decorators).

## Performance-eisen MVP

- TTFB <500ms op alle dashboard-views (95p)
- Burger-form bruikbaar op 3G in <3s (initial paint)
- PDF-rapport genereren <10s voor 1 maand data
- Upload van 5MB foto succesvol op 1Mbps verbinding

## Wat we expliciet NIET kiezen (en waarom)

| Niet | Reden |
|------|-------|
| Microservices | Te vroeg, 1 monolith schaalt makkelijk genoeg, simpeler ops |
| GraphQL | REST + OpenAPI past beter bij overheids-integraties |
| Serverless / Lambda | Vendor lock-in, slecht voor data-soevereiniteit |
| MongoDB / NoSQL | Bestuurlijke data is relationeel, transacties belangrijk |
| Mobile-native (React Native) | PWA voldoet; tijd besparen voor MVP |
| Auth0/Clerk | Bestuurlijke auth moet onder eigen controle |
