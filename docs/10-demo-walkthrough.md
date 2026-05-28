# 10 — Demo walkthrough: B/C/F features

Concrete demo-scenario's voor de Fase-1 features die we toegevoegd hebben:

- **B. Burger Meldpunt** (B1–B5) — foto-upload, GPS, auto-toewijzing, burger-feedback, heropenen
- **C. DC-dashboard** (C1–C6) — trendgrafiek, top-5, mijn-taken, quick-actions, recent-gesloten, ressort-filter
- **F. Projectmonitoring** (F1–F2) — risico-notities, contractor gestructureerd

Volg deze gids stap-voor-stap om alle features in actie te zien.

---

## 0. Demo-data plaatsen

```sh
# Eenmalig — start de lokale services en migrate
pnpm services:up
pnpm --filter @sdp/api prisma migrate dev   # of: prisma db push
pnpm db:seed                                  # baseline (districten, ressorten, rollen, categorieën)
pnpm --filter @sdp/api admin:seed-dcs         # 20 realistische DC's
pnpm --filter @sdp/api admin:seed-demo-data   # vergunningen, plannen, fondsen

# Dan: de B/C/F demo-scenario's
pnpm --filter @sdp/api admin:seed-demo-bcf
```

Het seed-script print **welke ticketnummers + magic-link** zijn aangemaakt.
Bewaar de uitvoer, je hebt het ticketnummer + token later nodig voor B4/B5.

Start de apps:

```sh
pnpm dev    # api op :4000, web op :3000
```

Login voor heel deze walkthrough (DC Wanica):

- **Email:** `ernesto.muller@sdp.sr` — DC Wanica Zuid-Oost
- **Wachtwoord:** `Welkom2026!`

> **Let op:** het oude generieke account `dc.wanica@sdp.local` is na
> `admin:seed-dcs` **gedeactiveerd** (status `INGETROKKEN`, login geweigerd)
> en vervangen door realistische DC's op `@sdp.sr`. Voor Wanica zijn dat
> `ernesto.muller@sdp.sr` (Zuid-Oost), `ravi.bhattoe@sdp.sr` (Centrum) en
> `glenda.kranenburg@sdp.sr` (Noord-West) — alle drie zien dezelfde
> district-brede data. Andere demo-logins: `super@sdp.local` (alles),
> en voor de verzoeken-flow (Module P) `domeinen@gbb.sr` /
> `beheer@gbb.sr` (externe dienst GBB).

> Alle demo-meldingen + project zijn gemarkeerd met titel-prefix `[DEMO-BCF]`
> zodat ze makkelijk te vinden zijn en bij een tweede seed-run worden vervangen.

---

## B. Burger Meldpunt

### B1 — Foto-upload (max 5 × 5 MB, S3/MinIO)

**Wat het script doet:** Maakt melding `[DEMO-BCF] B1 — Foto-bijlages: drainage Kwattaweg verstopt`
en uploadt 3 mini-JPEG's naar MinIO via de officiële presign-flow.

**Hoe het te zien:**

1. Open [http://localhost:3000/dashboard/meldingen](http://localhost:3000/dashboard/meldingen)
2. Klik de melding met titel beginnend met `[DEMO-BCF] B1`.
3. Sectie **Bijlages** toont 3 foto's met "bekijk / download" knop.
4. Klik — er opent een presigned MinIO-URL (geldig 2 minuten).

**Zelf testen (publieke flow):**

1. Open [http://localhost:3000/melden](http://localhost:3000/melden) (geen login nodig).
2. Vul het formulier in.
3. Bij **Foto's** klik *Bestanden kiezen* — sleep 1–5 foto's (JPG/PNG/WEBP/HEIC of PDF).
4. Submit — formulier uploadt eerst de melding, daarna één-voor-één de foto's.
5. Bij elke foto verschijnt "uploaden…" → "✓ geüpload".

**Validatie:**
- 6e bestand → "Maximaal 5 bestanden".
- Bestand > 5 MB → backend weigert met 400 "grootte must not be greater than 5242880".
- `.exe` of niet-toegestane MIME → 400 "MIME-type … niet toegestaan".

### B2 — GPS auto-detect

**Wat:** Browser-prompt voor locatie zodra district gekozen wordt (i.p.v. een handmatige knop).

**Zelf testen:**

1. Open [http://localhost:3000/melden](http://localhost:3000/melden).
2. Kies een district uit de dropdown.
3. Browser vraagt om locatie-toestemming.
4. Geef toestemming → veld toont `📍 Locatie gedeeld: 5.85xxx, -55.20xxx`.
5. Weiger → veld toont uitleg + handmatige "📍 Locatie delen" knop blijft beschikbaar.

**Database-effect:** PostGIS `geom` veld op de melding wordt gevuld met `ST_MakePoint(lon, lat)`.

### B3 — Auto-toewijzing per categorie

**Wat het script doet:** Plaatst 4 meldingen met verschillende categorieën om de auto-toewijzing
te demonstreren. Elke categorie heeft een `standaardToewijzingRol` (zie `prisma/seed.ts`).

**Hoe het te zien:**

| Categorie | Standaard-rol | Demo-melding |
|-----------|---------------|--------------|
| MELD-WATER | `projectmedewerker` | `B3 MELD-WATER — Wateroverlast Lelydorp-zuid` |
| MELD-VUIL | `meldingen_medewerker` | `B3 MELD-VUIL — Vuilophaal overgeslagen — Domburg` |
| MELD-VEILIG | `inspecteur` | `B3 MELD-VEILIG — Onveilig kruispunt — schoolzone` |
| MELD-MARKT | `vergunningmedewerker` | `B3 MELD-MARKT — Standplaats-verzoek nieuwe markt` |

1. Open [http://localhost:3000/dashboard/meldingen](http://localhost:3000/dashboard/meldingen).
2. Filter op kolom **Toegewezen** of zoek op `[DEMO-BCF] B3`.
3. Elke melding heeft een toegewezen behandelaar én een `auto_toegewezen` event in de tijdlijn met de reden.

> **Fallback-keten:** Heeft het district geen gebruiker met de gewenste rol,
> dan probeert de service `meldingen_medewerker → districtssecretaris → dc`.
> In Wanica is er geen `projectmedewerker`, dus MELD-WATER valt terug op `meldingen_medewerker`
> — dit is zichtbaar in het event-payload "fallback".

### B4 — Burger-terugkoppeling via magic-link

**Wat het script doet:**

- Maakt melding `[DEMO-BCF] B4 — Wacht op burger-bevestiging` in status `OPGELOST`
  met een werkende `melding-feedback` magic-link.
- Maakt melding `[DEMO-BCF] B4 — Reeds bevestigd door burger` in status `BEVESTIGD_DOOR_BURGER`.

**Hoe het te zien (burger-flow):**

1. Kopieer de feedback-link uit de seed-output (regel "B4 Feedback-token klaar voor ..."):
   ```
   http://localhost:3000/status/feedback?token=<jouw-token>
   ```
2. Open de link in een private/incognito venster (geen login nodig).
3. Twee knoppen:
   - **✓ Ja, probleem is opgelost** → status springt naar `BEVESTIGD_DOOR_BURGER`.
   - **✗ Nee, probleem speelt nog** → status terug naar `IN_BEHANDELING`.

**Hoe het te zien (DC-flow):**

1. Open de B4-melding in [/dashboard/meldingen](http://localhost:3000/dashboard/meldingen).
2. Sectie "Status wijzigen" → kies `OPGELOST` → opslaan.
3. Onder het formulier verschijnt automatisch een nieuwe feedback-link
   die je manueel naar de melder kan sturen (tot SMTP/H1 live is).

### B5 — Heropenen door burger

**Wat het script doet:** Maakt melding `[DEMO-BCF] B5 — Heropend door burger` met een
volledige levensloop in de tijdlijn (aangemaakt → opgelost → heropend).

**Hoe het te zien (DC):** Open de melding — status is `HEROPEND` (rode badge),
tijdlijn toont `burger_heropend` event met de opgegeven reden.

**Zelf testen:** 

1. Open [http://localhost:3000/status](http://localhost:3000/status).
2. Vul een ticketnummer van een afgesloten melding in (bv. een `B4 Reeds bevestigd`).
3. Onderaan verschijnt een gele **"Heropenen"** knop.
4. Klik → toelichting invullen → "Heropen melding".
5. Pagina herlaadt, status is nu `HEROPEND`.

---

## C. DC-dashboard

Login en open [http://localhost:3000/dashboard](http://localhost:3000/dashboard).

### C1 — Trendgrafiek 30/90 dagen

**Wat het script doet:** Plaatst 40 meldingen verspreid over 90 dagen met variabele
categorieën, urgenties en statussen.

**Hoe het te zien:**

1. Op het dashboard, sectie **Instroom — laatste 30 dagen**.
2. SVG-bar chart met groene staven (meldingen) en blauwe staven (vergunningen).
3. Klik **90 dagen** rechtsboven → grafiek toont 3× langere periode.
4. Hover over een staaf → tooltip met datum + aantal.

**Onder de motorkap:** `GET /api/dashboards/district/2/trend?dagen=30` — Postgres
aggregeert server-side met `date_trunc('day', created_at)`.

### C2 — Top-5 categorieën meldingen

**Hoe het te zien:**

- Sectie **Top categorieën meldingen**, met een 30d/90d toggle.
- Toont gefilterd op je actieve ressort-/subregio-filter.
- Bar-visualisatie geeft relatieve grootte per categorie.

### C3 — Mijn taken

**Wat het script doet:** Wijst een crisis-melding toe aan `DC Wanica`.

**Hoe het te zien:**

- Tegel **Mijn taken** met badge "5 actief" (precies aantal varieert).
- Subsecties:
  - **Meldingen aan mij toegewezen** — inclusief CRISIS-badge
  - **Vergunningen — wachten op behandeling** (als je `vergunning.behandel` hebt)
  - **Districtsplannen — wachten op uw goedkeuring** (DR/RO-permissies)
  - **Uitgaven — 4-ogen goedkeuring nodig** (`fonds.goedkeur`)
  - **Projecten met vertraging**

Klik op een rij → springt direct naar de detailpagina.

**Onder de motorkap:** `GET /api/dashboards/mijn-taken` — cross-module query
op basis van de permissies + district-rollen van de ingelogde gebruiker.

### C4 — Quick-actions: dag-notities + bulk-escalatie

**Wat het script doet:** Plaatst 3 DC-dagnotities namens DC Wanica.

**Hoe het te zien:**

1. Onderaan dashboard, sectie **Snelle acties**.
2. Twee knoppen:
   - **+ Dag-notitie** — opent inline editor; tekst wordt opgeslagen als
     `DcNotitie` en verschijnt in de lijst eronder.
   - **⚠ Escaleer N crisis-melding(en) naar RO** — alleen actief als er open
     CRISIS-meldingen in het district zijn.
3. Onder de knoppen: **Recente notities** lijst.

**Bulk-escalatie zelf testen:**

1. Maak eerst een open CRISIS-melding aan (bv. via [/melden](http://localhost:3000/melden) met urgentie "Crisis").
2. Terug naar dashboard → knop "Escaleer 1 crisis-melding naar RO" wordt actief.
3. Klik → reden invullen → bevestigen.
4. Op de melding-detail toont de tijdlijn `escalatie_naar_ro` event,
   urgentie blijft `CRISIS`, audit-log heeft `escalatie: true`.

### C5 — Recent gesloten dossiers

**Hoe het te zien:**

- Sectie **Recent afgesloten** rechts naast Top-5.
- Toont 7d (default) of 30d toggle.
- Drie subsecties: Meldingen / Vergunningen / Projecten.
- Klik op een rij → directe link naar dossier-detail (controlemoment).

### C6 — Ressort-filter

**Hoe het te zien:**

1. Linker sidebar onder "Filters" → dropdown **Ressort**.
2. Selecteer een specifiek ressort (bv. *Lelydorp*).
3. **Alle** tegels updaten: open-meldingen, trend, top-5, recent-gesloten.
4. Header subtitle toont "Ressort-filter actief".
5. De meldingen-lijstpagina respecteert de filter eveneens.

Sub-regio-toggle (al bestaand) en ressort-dropdown werken onafhankelijk.

---

## F. Projectmonitoring

Login en open [http://localhost:3000/dashboard/projecten](http://localhost:3000/dashboard/projecten).
Klik het project met titel `[DEMO-BCF] F1+F2 — Renovatie Lelydorpweg Noord`.

### F2 — Gestructureerde contractor

**Wat het script doet:** Vult alle nieuwe contractor-velden:
- Bedrijf: `Wanica Wegenbouw N.V.`
- KKF-nummer: `12345.6`
- Contactpersoon: `Marlon Pinas`
- Telefoon: `+597 8123456` (klikbaar als `tel:` link)
- E-mail: `marlon.pinas@wanicawegenbouw.sr` (klikbaar als `mailto:` link)

**Hoe het te zien:**

- Sectie **Contractor** als losse card (niet meer in de hoofd-header).
- Telefoon en e-mail zijn klikbaar.
- Knop **Bewerken** opent inline editor — wijzig één veld, andere blijven behouden.

**Validatie:** Email moet geldig zijn (class-validator `@IsEmail()`).

### F1 — Risico-notities

**Wat het script doet:** Drie risico's, één in elke status:

| Titel | Status |
|-------|--------|
| Materiaalkosten stijgen | `GEMITIGEERD` |
| Eigendomsbewijs kavel onduidelijk | `GEESCALEERD` |
| Regenseizoen verkort werktijd | `OPEN` |

**Hoe het te zien:**

- Sectie **Risico's (3)** naast Contractor.
- Subtitle: "1 open · 1 gemitigeerd · 1 geëscaleerd".
- Elk risico heeft een gekleurde status-badge en knoppen om de status te wisselen:
  - **Markeer gemitigeerd** (groen)
  - **Escaleer** (rood)
  - **Heropen** (amber, alleen zichtbaar als status != OPEN)
- Knop **+ Mitigatie** / **Mitigatie aanpassen** opent textarea voor mitigatie-tekst.
- **+ Risico** rechtsboven voegt nieuwe toe.

**Onder de motorkap:**

- `POST /api/projecten/:id/risicos` — nieuw risico
- `PATCH /api/projecten/:id/risicos/:risicoId` — status + mitigatie aanpassen
- Audit-log entry per wijziging, `STATUS_WIJZIGING` actie bij status-overgang

---

## Snelle commando-cheatsheet

```sh
# Demo-data plaatsen (idempotent, ruimt eerdere [DEMO-BCF] data op)
pnpm --filter @sdp/api admin:seed-demo-bcf

# Apps draaien
pnpm dev

# Database direct inspecteren
docker exec sdp-postgres psql -U sdp -d sdp -c \
  "SELECT ticket_nummer, status FROM meldingen WHERE titel LIKE '[DEMO-BCF]%';"

# API direct testen
curl -s http://localhost:4000/api/meldingen/ticket/<TICKET> | jq

# Swagger / OpenAPI
open http://localhost:4000/api/docs

# MinIO console (bekijk geüploade foto's)
open http://localhost:9001
# Login: minioadmin / minioadmin → bucket sdp-uploads → meldingen/
```

## Demo-uitlogvolgorde voor een live presentatie (~10 min)

1. **B1 Foto-upload** — open `[DEMO-BCF] B1` melding, klik foto's. *(1 min)*
2. **B2/B3 Burger-flow** — open `/melden` in nieuw tabblad, doe een echte melding,
   GPS-prompt, foto toevoegen, indienen. *(2 min)*
3. **B4 Feedback** — kopieer feedback-token URL, open incognito, klik "Ja opgelost". *(1 min)*
4. **B5 Heropenen** — op `/status` ticketnummer plakken, klik Heropenen. *(1 min)*
5. **C-dashboard tour** — open `/dashboard`, wijs aan: KPI-tegels → Mijn taken →
   Trend (toggle 30/90d) → Top-5 (toggle) → Recent-gesloten → ressort-filter sidebar. *(3 min)*
6. **C4 Quick-actions** — klik "+ Dag-notitie", schrijf 1 zin, opslaan; toon escalatie-knop. *(1 min)*
7. **F1+F2** — open project `[DEMO-BCF] F1+F2`, toon contractor-card + 3 risico's met statuskleuren. *(1 min)*
