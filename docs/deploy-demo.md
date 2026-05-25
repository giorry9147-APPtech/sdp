# Deploy demo — Vercel + Fly.io + Neon (gratis)

Live demo zonder server-beheer. Drie providers, ieder voor wat ze het
beste doen. Hele setup in ~30–45 minuten.

```
   Browser
     │
     │ https://sdp-demo.vercel.app   (Vercel — Next.js frontend)
     ▼
   Vercel
     │
     │ fetch https://sdp-suriname-api.fly.dev/api/...
     ▼
   Fly.io  (regio GRU — São Paulo, dichtbij Suriname)
     │
     │ DATABASE_URL postgresql://...neon.tech/...
     ▼
   Neon  (managed Postgres + PostGIS)
```

## Wat krijg je gratis

| Provider | Onderdeel | Vrije ruimte | Catch |
|----------|-----------|--------------|-------|
| **Vercel** | Next.js hosting | Hobby tier: 100GB bandbreedte/mnd | Geen cold starts |
| **Fly.io** | NestJS container | Pay-as-you-go, ~$0–3/mnd voor klein gebruik | Stopt bij geen verkeer (~5s cold start) |
| **Neon** | Postgres + PostGIS | 0.5 GB opslag, blijft draaien | Auto-suspend na 5 min idle (1–2s wakker maken) |

Voor pitch-demo's: alles bij elkaar gratis tot ~5 dollar per maand.

---

## Stap 1 — GitHub repo (5 min)

1. Maak op [github.com/new](https://github.com/new) een nieuwe **private** repo, naam bv. `sdp-suriname`. **Initialiseer niet** met README — die hebben we al.
2. Geef mij de repo-URL (`git@github.com:<jij>/sdp-suriname.git` of `https://github.com/<jij>/sdp-suriname.git`).
3. Ik koppel + push.

## Stap 2 — Neon Postgres (5 min)

1. Account: [neon.tech](https://neon.tech) (gratis met GitHub of Google login).
2. Klik **Create project**:
   - Project name: `sdp-suriname`
   - Postgres versie: 16 (default)
   - Region: **AWS us-east-2 (Ohio)** of **eu-central-1 (Frankfurt)** — Neon heeft geen GRU-regio, US-East geeft beste latency naar Fly GRU.
3. Na aanmaken: kopieer de **connection string** (`postgresql://...neon.tech/...?sslmode=require`). Bewaar deze veilig.
4. In de Neon SQL Editor (linker menu), draai:
   ```sql
   CREATE EXTENSION IF NOT EXISTS postgis;
   ```
   PostGIS is nodig voor de geo-velden.

## Stap 3 — Fly.io backend (10 min)

### 3a. flyctl installeren (eenmalig)

```sh
# macOS
brew install flyctl
# of zonder brew:
curl -L https://fly.io/install.sh | sh
```

### 3b. Account + login

```sh
fly auth signup    # of: fly auth login als je al account hebt
```

Credit card wordt gevraagd voor verificatie, maar voor klein gebruik
betaal je $0 (binnen de gratis tier).

### 3c. App aanmaken (zonder deploy)

```sh
cd /Users/cornerstonetech/Desktop/SPD
fly apps create sdp-suriname-api --org personal
```

Als de naam `sdp-suriname-api` al gepakt is, kies een eigen variant
(bv. `sdp-jij-api`) en wijzig de regel `app = ...` in `fly.toml`.

### 3d. Secrets zetten

```sh
fly secrets set \
  DATABASE_URL='<plak-neon-string-hier>' \
  JWT_SECRET="$(openssl rand -base64 48)" \
  WEB_ORIGIN='https://sdp-demo.vercel.app' \
  --app sdp-suriname-api
```

> `WEB_ORIGIN` mag voor nu een placeholder zijn — we updaten na Vercel-deploy.
> Onze CORS staat ook `*.vercel.app` toe voor preview-deploys, dus
> demo werkt direct.

### 3e. Deploy

```sh
fly deploy --app sdp-suriname-api
```

Eerste deploy duurt ~3–5 min (Docker build + push naar Fly registry +
release_command = `prisma db push` tegen Neon).

### 3f. Verifieer

```sh
fly logs --app sdp-suriname-api
# Open: https://sdp-suriname-api.fly.dev/api/health
# Open: https://sdp-suriname-api.fly.dev/api/docs
```

## Stap 4 — Database vullen (5 min)

Eenmalig vanaf je laptop tegen de Neon-DB:

```sh
cd /Users/cornerstonetech/Desktop/SPD
# Tijdelijk lokale .env aanpassen óf inline DATABASE_URL meegeven:
DATABASE_URL='<plak-neon-string-hier>' pnpm --filter @sdp/api prisma:seed
DATABASE_URL='<plak-neon-string-hier>' pnpm --filter @sdp/api admin:seed-demo
DATABASE_URL='<plak-neon-string-hier>' pnpm --filter @sdp/api admin:seed-demo-data
```

Of via Fly SSH (advanced):
```sh
fly ssh console --app sdp-suriname-api
# In de container:
node dist/scripts/admin-create.js --email demo@sdp.local --naam "Demo Beheerder" --wachtwoord "$(openssl rand -base64 16)" --rol super_admin
```

## Stap 5 — Vercel frontend (10 min)

### 5a. Project importeren

1. Ga naar [vercel.com/new](https://vercel.com/new)
2. Log in met GitHub
3. Selecteer je repo `sdp-suriname` → **Import**

### 5b. Belangrijk: configureer monorepo

| Veld | Waarde |
|------|--------|
| **Framework Preset** | Next.js (auto-detected) |
| **Root Directory** | `apps/web` ← klik **Edit** en zet deze! |
| **Build Command** | (default, leeg laten — `vercel.json` doet het) |
| **Install Command** | (default, leeg laten) |
| **Output Directory** | `.next` (default) |

### 5c. Environment Variables (verplicht)

Voeg toe vóór je deployt:

| Naam | Waarde |
|------|--------|
| `NEXT_PUBLIC_API_BASE_URL` | `https://sdp-suriname-api.fly.dev` |
| `NEXT_PUBLIC_APP_NAME` | `SDP — Demo` (of wat je wilt) |

### 5d. Deploy

Klik **Deploy** — bouwt en publiceert in ~2 min op `https://sdp-suriname-xxxx.vercel.app`.

### 5e. CORS na-instellen

Pak de uiteindelijke Vercel-URL en zet 'm in Fly als allowed origin:

```sh
fly secrets set WEB_ORIGIN='https://sdp-suriname-xxxx.vercel.app' --app sdp-suriname-api
```

Fly herstart automatisch (~30s).

## Stap 6 — Verificatie (5 min)

Open de Vercel-URL en doorloop:

- [ ] `/` — landingspagina laadt
- [ ] `/districten` — 10 districten zichtbaar (= data uit Neon!)
- [ ] `/melden` — formulier werkt, melding indienen geeft ticketnummer
- [ ] `/status?nr=...` — net ingediende melding zichtbaar
- [ ] `/login` met `dc.wanica@sdp.local` / `Welkom2026!`
- [ ] `/dashboard` — KPI-tegels gevuld
- [ ] `/dashboard/financien/1` — Districtsfonds Wanica met grafieken

Als iets niet werkt, check:
- `fly logs --app sdp-suriname-api` — backend errors
- Browser DevTools → Network — CORS / 404 errors
- Vercel deployment logs — build errors

## Stap 7 — Custom domein (optioneel, 10 min)

Wanneer je een eigen domein wilt:

**Frontend (Vercel):**
1. Vercel → project → Settings → Domains → Add
2. Voeg toe bv. `sdp.jouwdomein.sr`
3. Volg DNS-instructies (CNAME naar `cname.vercel-dns.com`)

**Backend (Fly):**
```sh
fly certs add api.sdp.jouwdomein.sr --app sdp-suriname-api
# Volg DNS-instructies (CNAME naar sdp-suriname-api.fly.dev)
# Update WEB_ORIGIN + NEXT_PUBLIC_API_BASE_URL naar nieuwe domeinen
```

## Onderhoud

### Updates uitrollen

```sh
git push origin main
# Vercel: automatisch deploy
# Fly: handmatig — fly deploy
```

Of zet Fly auto-deploy aan via GitHub Actions ([Fly docs](https://fly.io/docs/launch/continuous-deployment-with-github-actions/)).

### Kostenoog houden

- Fly: `fly status --app sdp-suriname-api` — toont machine-uren
- Neon: dashboard toont opslag (limiet 0.5 GB free)
- Vercel: dashboard toont bandbreedte (limiet 100 GB free)

### Backups Neon

Neon doet automatisch point-in-time backups (7 dagen gratis). Voor langer:
zie `infra/backup.sh` voor S3-backups (advanced).

## Schaal-pad

Wanneer dit groeit naar échte pilot:
1. Fly machine omhoog naar `shared-cpu-2x` / 1GB (~$5/mnd)
2. `min_machines_running = 1` (geen cold starts, ~$5–10/mnd)
3. Neon naar Pro ($19/mnd, 10GB, geen suspend)
4. Of overstappen naar Pad A uit [deploy.md](deploy.md) — lokaal SUR-datacenter.

## Troubleshooting

| Probleem | Oplossing |
|----------|-----------|
| `prisma db push` failt met "extension postgis" | Run `CREATE EXTENSION postgis;` in Neon SQL editor (stap 2.4) |
| Fly deploy timeout | Check `fly logs` voor Prisma-errors; vaak DATABASE_URL fout |
| CORS error in browser | Update `WEB_ORIGIN` met de exacte Vercel-URL (incl. https) |
| Vercel build faalt op `pnpm install` | Root Directory moet op `apps/web` staan, niet root |
| Login werkt niet | Check dat seed gedraaid is: `DATABASE_URL=... pnpm --filter @sdp/api admin:seed-demo` |
| Fly machine slaapt te snel | Zet in `fly.toml`: `min_machines_running = 1` (kost $5/mnd) |
