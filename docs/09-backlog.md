# 09 — Backlog: MVP afmaken + Fase 2

> Concrete checklist van wat er nog moet voor Fase 1 (MVP) compleet
> en Fase 2 (Planning & Decentralisatie). Bij elk item een effort-
> schatting en welke schermen/files het raakt.

**Legenda effort:** S = 1-2 dagen · M = 3-5 dagen · L = 1-2 weken · XL = 2+ weken
**Legenda status:** ✅ af · 🟡 deels (schema er, UI/flow niet) · ❌ niet begonnen · 📋 buiten code-scope

---

## 1. MVP afmaken (Fase 1 restant)

### A. Identity & Access — auth

| # | Item | Status | Effort | Files / Verwijzing |
|---|------|--------|--------|---------------------|
| A1 | **2FA TOTP-flow** voor DC/secretaris/RO-rol | 🟡 schema klaar (`totpSecret`, `totpVerified`) | M | nieuw: `auth/totp.controller.ts`, QR-code UI, enrollment wizard |
| A2 | **Magic-link login** voor burgers (status-pagina meldingen) | 🟡 schema klaar (`MagicLink`) | M | nieuw: `auth/magic-link.service.ts`, email-template |
| A3 | **Wachtwoord-reset** met email-verificatie | ❌ | S | `auth/reset.controller.ts`, email-template |
| A4 | **Forced logout** bij rolwijziging | ❌ | S | sessie-invalidatie bij `GebruikerRol` create/delete |
| A5 | **Account-management UI** voor super_admin (lijst, deactiveren) | ❌ | M | nieuw: `/dashboard/admin/gebruikers` |

### B. Burger Meldpunt — ✅ AF

| # | Item | Status | Effort | Files / Verwijzing |
|---|------|--------|--------|---------------------|
| B1 | **Foto-upload** (max 5, max 5MB) via formulier | ✅ | M | `common/storage.service.ts` (S3-presign), `meldingen.controller.ts` POST `/bijlages/presign` + `/bijlages/registreer`, `melden/formulier.tsx` uploader |
| B2 | **GPS-locatie** automatisch via browser-API | ✅ | S | `melden/formulier.tsx` — prompt zodra district gekozen + handmatige fallback-knop |
| B3 | **Auto-toewijzing** aan afdeling op basis van categorie | ✅ | S | `Categorie.standaardToewijzingRol` (schema), `MeldingenService.bepaalAutoToewijzing()` met fallback-chain (medewerker → secretaris → DC), event `auto_toegewezen` |
| B4 | **Burger-terugkoppeling** "probleem opgelost ja/nee" via magic-link | ✅ | S | Status `BEVESTIGD_DOOR_BURGER`, magic-link doel `melding-feedback`, endpoint `POST /meldingen/feedback/:token`, pagina `/status/feedback` |
| B5 | **Heropenen** door burger als probleem terug is | ✅ | S | Endpoint `POST /meldingen/ticket/:nr/heropen`, transities OPGELOST/GESLOTEN/BEVESTIGD_DOOR_BURGER → HEROPEND, knop op `/status` |

**Notitie B4 (email-gateway):** de magic-link wordt nu aangemaakt + token
in de DC-UI getoond (en in API-log) zodat handmatig delen mogelijk is.
Zodra H1 (SMTP) live is, gaat de email automatisch.

### C. DC-dashboard — ✅ AF

| # | Item | Status | Effort | Files / Verwijzing |
|---|------|--------|--------|---------------------|
| C1 | **Trendgrafiek 30/90 dagen** (meldingen, vergunningen) | ✅ | M | `GET /dashboards/district/:id/trend?dagen=30\|90` (Postgres `date_trunc` aggregatie), [trend-grafiek.tsx](apps/web/src/app/dashboard/_components/trend-grafiek.tsx) — inline SVG dual-bar chart, geen externe dep |
| C2 | **Top-5 categorieën** meldingen | ✅ | S | `GET /dashboards/district/:id/categorie-top5?dagen=30\|90&ressortId&subregioId` met periode-toggle in UI |
| C3 | **"Mijn taken"** sectie (acties wachtend op deze gebruiker) | ✅ | M | `GET /dashboards/mijn-taken` (cross-module: meldingen toegewezen, vergunningen-wacht, plannen-goedkeuring, fonds-uitgaven 4-ogen, vertraagde projecten) — [mijn-taken.tsx](apps/web/src/app/dashboard/_components/mijn-taken.tsx) |
| C4 | **Quick-actions** (besluit-notitie, escalatie naar RO) | ✅ | S | `DcNotitie` model + `dc-notities` module, `POST /meldingen/:id/escaleer` + bulk-escalatie van CRISIS-meldingen vanaf dashboard — [quick-actions.tsx](apps/web/src/app/dashboard/_components/quick-actions.tsx) |
| C5 | **Recent gesloten dossiers** lijst (controlemoment) | ✅ | S | `GET /dashboards/district/:id/recent-gesloten?dagen=7\|30` (meldingen + vergunningen + projecten) — [recent-gesloten.tsx](apps/web/src/app/dashboard/_components/recent-gesloten.tsx) |
| C6 | **Filter per ressort** (niet alleen subregio) | ✅ | S | `gekozenRessortId` in [dashboard-context.tsx](apps/web/src/lib/dashboard-context.tsx), dropdown in [shell.tsx](apps/web/src/app/dashboard/shell.tsx), `ressortId` query op `/dashboards/*`, `/meldingen`, `/projecten` |

### D. Vergunningen

| # | Item | Status | Effort | Files / Verwijzing |
|---|------|--------|--------|---------------------|
| D1 | **PDF-besluitgenerator** met handtekening DC | ❌ | M | nieuw: `pdf/besluit-template.ts` (puppeteer of pdfkit) |
| D2 | **Bezwaar-stap** (1 ronde, daarna escalatie) | ❌ | M | nieuwe status `IN_BEZWAAR`, bezwaar-event-model |
| D3 | **Veldcontrole-notitie** (mobiel-friendly UI) | 🟡 `VergunningEvent` bestaat | S | aparte UI-pagina, foto-upload erbij |
| D4 | **Categorie-specifieke formulieren** (hinderwet vs markt vs evenement) | 🟡 categorie bestaat, dynamische velden nog niet | M | JSON-schema per categorie + dynamische form-renderer |
| D5 | **Digitale handtekening DC** (clickwrap of certificate) | ❌ | M | `digitalSign` veld + UI met "ondertekenen"-knop |

### E. Dossier & document

| # | Item | Status | Effort | Files / Verwijzing |
|---|------|--------|--------|---------------------|
| E1 | **S3/MinIO storage-backend** koppelen | 🟡 env-vars klaar, code niet | M | `common/storage.service.ts` + presigned URLs |
| E2 | **PDF-preview** in browser | ❌ | S | embed `<iframe>` of PDF.js |
| E3 | **Versiebeheer** (nieuwe versie = nieuw record, geen overschrijven) | ❌ | S | `versie` veld + chain via `vorigeVersieId` |
| E4 | **Full-text zoekfunctie** | ❌ | M | Postgres `tsvector` + GIN-index |
| E5 | **Download-log** (wie opende wat wanneer) | 🟡 auditlog kan dit logsen | S | hook in download-endpoint |

### F. Projectmonitoring — ✅ AF

| # | Item | Status | Effort | Files / Verwijzing |
|---|------|--------|--------|---------------------|
| F1 | **Risico-notities** (status: open/mitigated/escalated) | ✅ | S | `ProjectRisico` model (enum `ProjectRisicoStatus`: OPEN/GEMITIGEERD/GEESCALEERD), `POST /projecten/:id/risicos`, `PATCH /projecten/:id/risicos/:risicoId` (status + mitigatie), [risico-card.tsx](apps/web/src/app/dashboard/projecten/_components/risico-card.tsx) — inline-add + status-knoppen |
| F2 | **Contractor velden** structureren (KKF-link mogelijk) | ✅ | S | `Project.contractor*` velden uitgebreid (`contractorKkfNummer`, `contractorContactpersoon`, `contractorTelefoon`, `contractorEmail`), `PATCH /projecten/:id/contractor`, [contractor-card.tsx](apps/web/src/app/dashboard/projecten/_components/contractor-card.tsx) + nieuw-project-formulier |

### G. Rapportage

| # | Item | Status | Effort | Files |
|---|------|--------|--------|-------|
| G1 | **Maandrapport per district** (vaste PDF-template) | ❌ | L | nieuw: `rapportage/maandrapport.service.ts` met PDFKit |
| G2 | **Excel-export** van élke lijstweergave | 🟡 CSV-export bestaat voor fonds; rest nog niet | M | uniform `excel.service.ts` met `xlsx` lib |
| G3 | **Periode-selectie** (week/maand/kwartaal/jaar/custom) | ❌ | S | datum-picker in lijstpagina's |
| G4 | **Ad-hoc filter en download** | ❌ | S | filter-state → download-knop |

### H. Notificaties

| # | Item | Status | Effort |
|---|------|--------|--------|
| H1 | **Email-gateway koppelen** (SMTP via SendGrid/Postmark) | 🟡 env klaar, code stub | M |
| H2 | **In-app notificatie-center** (bell-icon) | ❌ | M |
| H3 | **Per-gebruiker notificatie-instellingen** | ❌ | S |
| H4 | **Daily digest** (cron-job) | ❌ | S |
| H5 | **Email-templates** voor: melding-update, vergunning-status, plan-goedkeuring | ❌ | M |

### I. Audit log

| # | Item | Status | Effort |
|---|------|--------|--------|
| I1 | **Audit-viewer UI** met filter (gebruiker / dossier / type-actie) | 🟡 endpoint bestaat, UI minimaal | M |
| I2 | **Export CSV** vanuit audit-UI | 🟡 alleen voor fonds | S |
| I3 | **Retentie-beleid** documenteren + cleanup-job (7 jaar) | 📋 docs eerst, code later | S |

### Pilot-voorbereiding (Sprint 11-12 uit stappenplan)

| # | Item | Wie | Effort |
|---|------|-----|--------|
| P1 | **UAT met pilot-DC en team** (gestructureerde scenario's) | jij + DC | L (1 week) |
| P2 | **Trainingsmateriaal** (video's + 1-pager per rol) | jij + UX | L |
| P3 | **Train-de-trainer** met districtssecretaris | jij | S (1 dag sessie) |
| P4 | **Data-migratie** van bestaande Excel-lijsten (optioneel) | jij + DC | M |
| P5 | **Go-live runbook** (incident-escalatie, contactlijst) | jij + DevOps | S |

### Security & ops (Sprint 9-10 + doorlopend)

| # | Item | Status | Effort |
|---|------|--------|--------|
| S1 | **OWASP top-10 audit** + dependency scan | ❌ | M |
| S2 | **Performance-pass** (queries, indexes, lazy-loading) | 🟡 indexes deels | M |
| S3 | **Backup + restore test** in praktijk (Neon → eigen S3) | 🟡 scripts klaar in `infra/`, ongetest | S |
| S4 | **Browser-test mid-range Android op 3G** | ❌ | S |
| S5 | **Disaster-recovery runbook** | ❌ | S |
| S6 | **Rate-limiting** op meldingen (anti-spam) | ❌ | S |

### Fase 0 / organisationeel (niet code, blokkeert wel productie)

| # | Item |
|---|------|
| O1 | **`@sdp.sr`-domein registreren** + DC-mailboxen activeren (zie 03-stappenplan.md Fase 0) |
| O2 | **Stakeholder-mapping** RO + pilot-DC + districtssecretaris + jurist WRO |
| O3 | **Intentieverklaring** met RO / pilot-DC |
| O4 | **Juridische scan** persoonsgegevenswetgeving, archiefregels, retentieplicht |
| O5 | **Pilot-district kiezen** (Wanica of Paramaribo) |
| O6 | **Hosting-besluit** voor productie (Neon-demo → naar SUR-DC of regionale cloud) |

---

## 2. Fase 2 — Planning & Decentralisatie

### Sprint 13–16: Uitrol overige districten

| # | Item | Status | Effort |
|---|------|--------|--------|
| 13.1 | **Onboarding-flow per district** (data-migratie + training-script) | ❌ | L |
| 13.2 | **Multi-tenant verfijning** (data-isolatie tussen districten verifiëren) | 🟡 scope-RBAC werkt | M |
| 13.3 | **Vergelijkende dashboards tussen districten** (alleen RO) | ❌ | M |
| 13.4 | **Best-practice deling** tussen DC's (interne forum / knowledge-base) | ❌ | M |
| 13.5 | **Inheemse/Marron-dorpsbestuurslaag**: `Dorp` entity onder Ressort + `dorpshoofd`/`kapitein`/`granman` rollen | ❌ | L |

### Sprint 17–20: Ressort-/districtsplanning + WRO

| # | Item | Status | Effort | WRO-art. |
|---|------|--------|--------|----------|
| 17.1 | **Ressortplan-builder UI** (prioriteit-editor, bulk import) | 🟡 basis bestaat | M | 51 |
| 17.2 | **Districtsplan-aggregatie UI** (DC ziet alle ressort-prio's gegroepeerd) | 🟡 endpoint bestaat, UI minimaal | M | 52 |
| 17.3 | **Goedkeuringsflow** met aanwezigheid-quorum en stemming | 🟡 single-actie nu | L | 10, 23 |
| 17.4 | **Meldingen ↔ planprioriteiten** koppeling (een prioriteit refereert N meldingen) | ❌ | M | 50 |
| 17.5 | **`WROBeleidsgebied` enum** op prioriteiten + UI-dropdown + rapportage-filter | ❌ | S | 1 lid 2 |
| 17.6 | **`Districtsverordening` model + workflow** (CONCEPT → INGEDIEND_DR → AANGENOMEN_DR → BEKENDGEMAAKT → INGEDIEND_DNA → GEEN_BEZWAAR/VERNIETIGD → VASTGESTELD_PRESIDENT → GEPUBLICEERD) | ❌ | XL | 36-45 |
| 17.7 | **Wettelijke deadlines** op plannen/begrotingen + dashboard-widget "komende 30 dagen" + email-reminder bij 7 dagen voor deadline | ❌ | M | 51-56 |
| 17.8 | **Ressortbegroting / districtsbegroting** als aparte entiteit (los van Districtsfonds) | ❌ | L | 53-55 |

### Sprint 21–24: Financiën + jaarverslagen

| # | Item | Status | Effort | WRO-art. |
|---|------|--------|--------|----------|
| 21.1 | **Districtsbegroting-UI** uitgebreider (categorieën, periode-rapportages) | 🟡 basis-UI bestaat | M | 53-55 |
| 21.2 | **Uitgavenregistratie** met budgetreservering bij projectstart | ❌ | M | 40 |
| 21.3 | **Subsidie- en donor-tracking** | ❌ | M | — |
| 21.4 | **Export richting nationaal financieel systeem** | ❌ stub | M | — |
| 21.5 | **DR-jaarverslag-generator** (PDF/markdown) uit audit-log + plannen + meldingen | ❌ | L | 15 |
| 21.6 | **RR-jaarverslag-generator** | ❌ | M | 26 |
| 21.7 | **Auditor-view** (CLAD-rol read-only over alles + uitgebreide audit-filters) | 🟡 rol bestaat, view niet | M | — |
| 21.8 | **CSV-export** ook voor Districtsfonds (jaar-totaal per categorie) | ✅ basis | — | — |
| 21.9 | **4-ogen approval** voor Districtsfonds-uitgaven | ✅ af | — | — |

### Sprint 25–28: Burgerparticipatie + meertaligheid + kanalen

| # | Item | Status | Effort | WRO-art. |
|---|------|--------|--------|----------|
| 25.1 | **Online consultaties per ressort** (open ideeën, stemmen, hoorzitting-archief) | ❌ | XL | 50 |
| 25.2 | **Heatmap meldingen per ressort** | ❌ | M | — |
| 25.3 | **Sranan Tongo** als interface-taal (i18n setup + vertalingen) | ❌ | L | — |
| 25.4 | **Sarnami** als interface-taal | ❌ | L | — |
| 25.5 | **SMS via Digicel/Telesur** notificaties | ❌ | M | — |
| 25.6 | **WhatsApp Business API** integratie (Meta account + nieuw notificatiekanaal) | ❌ | L | — |
| 25.7 | **Push notifications** via PWA | ❌ | M | — |
| 25.8 | **Offline draft-mode** (service worker + IndexedDB voor melding-drafts) | ❌ | L | — |

### Cross-cutting Fase 2

| # | Item | Status | Effort |
|---|------|--------|--------|
| X1 | **OCR & document-intelligentie** (gescande PDF's → tekst doorzoekbaar) | ❌ | L |
| X2 | **Vergunningcheck-beslisboom** ("heb ik vergunning nodig?") | ❌ | L |
| X3 | **Online betaling leges** (lokale gateway: Bank PSB / Mobile money) | ❌ | XL |
| X4 | **Adviesvraag aan andere afdelingen** (parallelle workflow-stappen in vergunningen) | ❌ | M |
| X5 | **CBB-koppeling-stub** voor burger-identificatie (interface klaarmaken zonder integratie) | ❌ | M |

---

## 3. Prioritering — aanbevolen volgorde

### Volgende sessie (small wins, hoge demo-waarde)
1. **A1 2FA TOTP-flow** (productie-blocker) — M
2. ~~B1 Foto-upload meldingen + S3~~ ✅ — afgerond samen met rest Burger Meldpunt (B1–B5)
3. **17.5 WROBeleidsgebied enum** (klein, compliance-waarde) — S
4. **G2 Excel-export uniform** (lage moeite, hoge frequentie nodig) — M

### Daarna (eerst rest MVP, dan Fase 2 selectief)
5. **G1 Maandrapport PDF** — DC gebruikt deze elke maand (~~C1 trendgrafiek~~ ✅ klaar)
6. **D1 PDF-besluitgenerator** (vergunningen-flow compleet maken)
7. **H1+H2 Email-gateway + notificatie-center**
8. **17.7 Wettelijke deadlines** dashboard-widget — laat platform "wettelijk slim" voelen

### Voor pilot-go-live
9. **P1-P5** (UAT, training, runbook) — niet-code maar blokkerend
10. **O1-O6** (Fase 0 organisationeel)

### Fase 2 echt starten als MVP draait
11. **17.6 Districtsverordening** (grootste WRO-gap)
12. **17.8 Begrotingen los van fonds**
13. **21.5-6 Jaarverslagen**
14. **25.x burgerparticipatie + meertaligheid**

---

## 4. Wat NIET in deze lijst

- Fase 3 features (GIS-viewer, AI, externe integraties, native apps) — zie [06-features-later.md](06-features-later.md)
- Politiek/juridische beslissingen (handhaving art. 39, toezicht art. 57-61, Regionale Commissaris art. 34) — zie [08-wro-compliance.md](08-wro-compliance.md)

---

## 5. Totaal-schatting

**MVP afmaken:** ~6-8 weken solo / 3-4 weken met 2 engineers (zonder pilot-voorbereiding) + 2 weken pilot.
**Fase 2 volledig:** ~6 maanden met 2-3 engineers (per sprint-cluster opbrengbaar als release).

Bij sessies van een paar uur per dag: MVP-restant ~3-4 maanden, Fase 2 ~12 maanden.
