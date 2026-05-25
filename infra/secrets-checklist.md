# Secrets-checklist — vóór productie go-live

Doorloop dit voor elke nieuwe deploy-omgeving (staging / pilot / productie).
Een gemiste regel kan een datalek of accountovername veroorzaken.

## Genereer alle secrets opnieuw

| Secret | Hoe genereren | Lengte |
|--------|---------------|--------|
| `JWT_SECRET` | `openssl rand -base64 48` | ≥48 bytes |
| `POSTGRES_PASSWORD` | `openssl rand -base64 24` | ≥24 bytes |
| `S3_SECRET_KEY` | provider-specifiek (AWS/MinIO console) | ≥40 chars |
| `SMTP_PASS` | provider-specifiek (Postmark/SendGrid token) | n.v.t. |

**Nooit** secrets uit `.env.example` of `.env.production.example` overnemen — die zijn placeholders.

## Opslag van secrets

- [ ] `.env` is in `.gitignore` (controle: `git check-ignore .env`)
- [ ] `.env.production` wordt **NIET** in repository gecommit
- [ ] Secrets staan in **password-manager** (1Password, Bitwarden) of **vault**
  (HashiCorp Vault, Infisical, Doppler) — niet in tickets/email/Slack
- [ ] Toegang tot secrets is op need-to-know basis; ops + tech-lead

## TLS / certificaten

- [ ] Domeinnaam geconfigureerd (DNS A/AAAA-record)
- [ ] Caddy verkrijgt automatisch Let's Encrypt cert (controleer logs na start)
- [ ] HSTS-header staat aan (zie Caddyfile) — alleen activeren na verificatie
  dat alle subdomeinen TLS hebben
- [ ] Voor lokale datacenter zonder publiek DNS: gebruik **mTLS met eigen CA**
  ipv Let's Encrypt

## Database

- [ ] Postgres **niet** publiek bereikbaar (geen `0.0.0.0:5432` binding)
- [ ] Backup-script werkt en is in cron geplaatst
- [ ] Eerste restore-test uitgevoerd vanuit backup (zie `infra/restore.sh`)
- [ ] PII-velden in audit-log-exports gemaskeerd waar mogelijk
- [ ] Verbinding via `sslmode=require` als DB extern is

## E-mail

- [ ] SPF + DKIM ingesteld voor afzender-domein
- [ ] DMARC policy minimaal `p=quarantine`
- [ ] `no-reply@` adres bestaat en bouncet niet
- [ ] Mailpit (dev) draait **niet** in productie

## Object storage

- [ ] Bucket-policy: alleen vanuit API account, geen publieke read
- [ ] Versioning aan voor accidental delete protection
- [ ] Lifecycle-rule voor oude attachments (>5 jaar → cold storage)

## Auth

- [ ] `AUTH_PROVIDER=email-password` is bewuste MVP-keuze
- [ ] Eerste admin-gebruiker aangemaakt via `admin:create` met **sterk** wachtwoord
- [ ] Demo-gebruikers (`admin:seed-demo`) **NIET** gerund in productie
- [ ] 2FA verplichten voor super_admin / dc-rollen wanneer module beschikbaar (Fase 2)

## Audit & logging

- [ ] Audit-log retentie minimaal 7 jaar (Archiefwet-norm) — backups dekken dit
- [ ] Application logs gaan naar centraal log-systeem (geen `stdout` only)
- [ ] Sentry / Grafana voor errors + metrics

## Backup & DR

- [ ] Dagelijkse backup naar **andere fysieke locatie** dan productie-DB
- [ ] Maandelijkse restore-test op staging
- [ ] Documenteer in runbook: RTO (recovery time) + RPO (data loss tolerance)
- [ ] Voor Fase 4: Data Embassy in bevriend land (zie `docs-claude/04-architectuur.md`)

## Compliance

- [ ] DPIA (Data Protection Impact Assessment) uitgevoerd voor MVP
- [ ] Privacy-statement op publieke site (`/melden`, `/vergunningen/aanvragen`)
- [ ] Bewaartermijnen per dossiertype gedocumenteerd
- [ ] Procedure recht-op-vergetelheid voor burgermeldingen vastgelegd

## Monitoring

- [ ] Healthchecks groen (`docker compose ps`)
- [ ] Alert op API 5xx-rate > 1%
- [ ] Alert op Postgres connection-pool saturation
- [ ] Alert op disk usage > 80%
- [ ] Maandelijkse security-update check (`docker compose pull`)

## Toegankelijkheid

- [ ] WCAG 2.1 AA audit uitgevoerd
- [ ] Toetsenbord-only navigatie werkt
- [ ] Schermlezer-test gedaan met NVDA / VoiceOver
- [ ] Contrast voldoet (zie Caddyfile CSP voor inline styles)

---

**Aanbeveling:** pin deze checklist aan in je PR-template voor go-live PRs.
