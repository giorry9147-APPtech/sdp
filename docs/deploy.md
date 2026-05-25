# Deploy-guide — pilot productie

Drie deploy-paden, afhankelijk van wat juridisch en politiek
toelaatbaar is (zie [`../docs-claude/07-juridisch.md`](../docs-claude/07-juridisch.md)
§6 over hosting-keuze).

## Pad A — Lokaal datacenter Suriname (aanbevolen voor pilot DC)

Past binnen het uitgangspunt "data-soevereiniteit by default".
Hosting bij Telesur, EBS Datacenter Suriname, of vergelijkbaar.

### Vereisten op de doel-host

- Ubuntu 22.04 LTS of Debian 12 (anders: container draait overal)
- 4 vCPU / 8 GB RAM / 100 GB SSD voor pilot (1 district)
- Docker Engine 24+ en Docker Compose v2
- Open poorten: 80 + 443 (Caddy verzorgt TLS automatisch)
- DNS-records:
  - `sdp.<domein>` → server (publiek)
  - `api.sdp.<domein>` → server (publiek)

### Setup

```sh
# 1. Repo clonen
git clone <repo-url> /opt/sdp && cd /opt/sdp

# 2. Productie .env aanmaken
cp .env.production.example .env
# Vul ALLE secrets — zie infra/secrets-checklist.md
nano .env

# 3. Caddyfile aanpassen (zet je domein-naam)
nano infra/Caddyfile

# 4. Builden + starten
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d

# 5. Database initialiseren (eerste keer)
docker exec sdp-api-prod npx prisma db push --skip-generate
docker exec sdp-api-prod npx prisma db seed

# 6. Eerste DC-account aanmaken
docker exec -it sdp-api-prod node dist/scripts/admin-create.js \
  --email dc@districtswanica.sr \
  --naam "DC Wanica" \
  --wachtwoord "$(openssl rand -base64 16)" \
  --rol dc --district WAN
# Geef wachtwoord persoonlijk aan de DC — niet via email
```

### Backup automatiseren

```sh
# Cron-entry
echo "0 2 * * * /opt/sdp/infra/backup.sh >> /var/log/sdp-backup.log 2>&1" \
  | crontab -

# Eerste test draaien
sudo /opt/sdp/infra/backup.sh
```

---

## Pad B — Caribbean cloud (Hetzner FSN1 / AWS São Paulo / Azure Brazil)

Snellere setup, beheerde managed-DB mogelijk, hogere SLA.
**Tegen:** data-soevereiniteit-discussie blijft. Documenteer politiek.

### AWS-variant

| Resource | Type | Doel |
|----------|------|------|
| EC2 `t4g.large` | 2 vCPU / 8 GB | Docker host (api + web) |
| RDS PostgreSQL 16 | `db.t4g.medium` met PostGIS extensie aan | Database |
| S3 bucket | versioned, encrypted | Uploads + backups |
| ALB | met ACM cert | TLS-terminatie |
| Route 53 | hosted zone | DNS |

`docker-compose.prod.yml` aanpassen:
- `postgres` service verwijderen (gebruik RDS)
- `DATABASE_URL` wijst naar RDS-endpoint
- Caddy weglaten (ALB doet TLS)

### Hetzner-variant (goedkoper, EU)

CX31 server (4 vCPU / 8 GB / 80 GB) ~€15/maand. Postgres in
dezelfde compose. Backups naar Hetzner Storage Box of Backblaze B2.

---

## Pad C — Multi-tenant SaaS (Fase 2, na pilot)

Wanneer meerdere districten parallel werken, schaal naar:

- **Kubernetes** (Hetzner managed, of self-hosted) — past op Haven-Suriname
  standaard uit `docs-claude/04-architectuur.md`
- API en web als Deployments met HPA
- Postgres met read-replica per regio
- S-Road Security Server toevoegen wanneer interoperabiliteit met
  ministeries nodig is

Past één-op-één in het [e-Suriname architectuur-spoor](../docs-claude/04-architectuur.md).

---

## Post-deploy verificatie

```sh
# Healthchecks
curl https://api.sdp.example.sr/api/docs
curl https://sdp.example.sr/

# Publieke flow
curl -X POST https://api.sdp.example.sr/api/meldingen \
  -H 'Content-Type: application/json' \
  -d '{"districtId":2,"categorieId":1,"titel":"Test","omschrijving":"Smoke-test van productie"}'

# Login werkt
curl -X POST https://api.sdp.example.sr/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"dc@districtswanica.sr","wachtwoord":"..."}'
```

Doorloop daarna [`infra/secrets-checklist.md`](../infra/secrets-checklist.md).

## Updates uitrollen

```sh
cd /opt/sdp
git pull
docker compose -f docker-compose.prod.yml build
docker compose -f docker-compose.prod.yml up -d
docker exec sdp-api-prod npx prisma db push --skip-generate
```

Voor schema-migrations met data: gebruik `prisma migrate deploy` ipv `db push`
(vereist migration-folder met SQL-files).

## Rollback

```sh
git checkout <vorige-tag>
docker compose -f docker-compose.prod.yml up -d --build
# Bij schema-rollback nodig: restore vanuit backup
./infra/restore.sh backups/<gewenste-backup>.sql.gz.gpg
```

## Incident-runbook (P0)

1. **API down** → `docker compose -f docker-compose.prod.yml logs api` + restart
2. **DB down** → check disk usage, check Postgres logs, herstart container
3. **Datalek vermoed** → trek alle JWT_SECRET-tokens in (rotate secret), forceer
   nieuwe login, audit-log scan op verdachte activiteit
4. **Datacenter offline** → DR-runbook activeren (Fase 4: Data Embassy);
   tot die tijd: communicatie via SMS/WhatsApp aan stakeholders
