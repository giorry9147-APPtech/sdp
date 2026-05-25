# 02 — Componenten & modules

Elke module hieronder heeft:
- **Fase** (MVP / Fase 2 / Fase 3)
- **Primaire gebruikers**
- **Kernfunctionaliteit**
- **Afhankelijkheden**

Legenda: 🟢 MVP · 🟡 Fase 2 · 🔵 Fase 3

---

## 🟢 A. Identity & Access (auth + RBAC)

**Primaire gebruikers:** alle rollen
**Doel:** centrale login, sessies, rollen, permissies, audit-koppeling.

**Kernfunctionaliteit**
- Login met email + wachtwoord (Argon2id hashing)
- 2FA verplicht voor DC, secretarissen, RO-rol (TOTP)
- Magic-link login voor burgers (geen wachtwoord nodig voor melding)
- Role-Based Access Control matrix — zie [05-rollen-permissies.md](05-rollen-permissies.md)
- Sessiebeheer + forced logout bij rolwijziging
- Wachtwoord-reset met email-verificatie

**Afhankelijkheden:** email-gateway (SMTP), audit log.

---

## 🟢 B. Burger Meldpunt

**Primaire gebruikers:** burger, vergunningmedewerker, DC
**Doel:** burger meldt lokaal probleem zonder drempel.

**Kernfunctionaliteit**
- Melding indienen zonder account (alleen telefoon-nr of email voor terugkoppeling)
- Verplichte velden: district, ressort, categorie, omschrijving
- Optioneel: foto's (max 5, max 5MB), GPS-locatie, video
- Auto-toewijzing aan verantwoordelijke afdeling op basis van categorie
- Ticketnummer + statuslink per email/SMS
- Categorieën: wegen, water/drainage, vuilophaal, straatverlichting, marktproblemen, veiligheid, grondmelding (alleen melding, geen besluit), dienstverleningsklacht, overig
- Urgentie: laag / middel / hoog / crisis
- Status: nieuw → in behandeling → extra info nodig → opgelost → gesloten → heropend
- Burger kan terugkoppeling geven: "probleem opgelost ja/nee"

**Afhankelijkheden:** A (auth optioneel), I (notificaties), J (audit).

---

## 🟢 C. District Operations Center (DC-dashboard)

**Primaire gebruikers:** DC, districtssecretaris
**Doel:** één scherm met de actuele bestuurlijke toestand van het district.

**Kernfunctionaliteit**
- Live tegels: open meldingen, openstaande vergunningen, lopende projecten, escalaties, deadlines deze week
- Filter per ressort
- "Mijn taken" (acties wachtend op deze gebruiker)
- Quick-actions: nieuwe besluit-notitie, escalatie naar RO, oproep aan ressortcoördinator
- Trendgrafieken (laatste 30 dagen, 90 dagen)
- Top-5 categorieën meldingen
- Lijst recent gesloten dossiers (controlemoment)

**Afhankelijkheden:** B, D, F, G.

---

## 🟢 D. Vergunningen & procedures

**Primaire gebruikers:** burger, ondernemer, vergunningmedewerker, DC
**Doel:** digitale workflow voor lokale vergunningen waarbij de DC betrokken is.

**Kernfunctionaliteit (MVP)**
- Aanvraag-formulier per vergunningstype (start met hinderwet, markt-/stand, evenement, geluidsontheffing)
- Documentupload met verplichte/optionele markering
- Workflow: ontvangen → in behandeling → extra info nodig → goedgekeurd / afgewezen
- Veldcontrole-notities (mobiel invulbaar door inspecteur)
- Digitaal besluitdocument (PDF-export met handtekening DC)
- Bezwaar-stap (1 ronde, daarna escalatie)
- Volledige timeline per dossier

**Fase 2 uitbreiding**
- Vergunningcheck-beslisboom (heb ik een vergunning nodig?) — naar voorbeeld DSO/Omgevingsloket
- Betaling van leges (online betaling)
- Adviesvraag aan andere afdelingen

**Afhankelijkheden:** A, K (documenten), J (audit), I (notificaties).

---

## 🟢 E. Dossier- en documentbeheer (K)

**Primaire gebruikers:** alle medewerkers
**Doel:** centrale plek voor alle bestanden per dossier, met versiebeheer.

**Kernfunctionaliteit**
- Upload (PDF, JPG, PNG, DOCX), max 25MB/file
- Versiehistorie (geen overschrijven; nieuwe versie = nieuw record)
- Permissies per dossier (publiek deel + intern deel)
- PDF-preview in browser
- Volledige zoekfunctie (full-text op metadata + OCR optioneel in Fase 2)
- Download-log (wie heeft wat wanneer geopend)

**Afhankelijkheden:** A, J, object-storage backend (S3-compatible).

---

## 🟢 F. Projectmonitoring (basis)

**Primaire gebruikers:** projectmedewerker, DC, RO
**Doel:** voortgang van fysieke projecten in het district volgen.

**Kernfunctionaliteit (MVP)**
- Project-record: titel, beschrijving, district, ressort, categorie, budget (indicatief), startdatum, einddatum, status
- Statusflow: idee → goedgekeurd → budget aangevraagd → gestart → vertraagd → afgerond → geëvalueerd
- Voortgangsupdates met foto's en korte tekst (logboek)
- Contractor / uitvoerder veld (vrije tekst in MVP, koppeling Fase 2)
- Risico-notities

**Fase 2 uitbreiding**
- Koppeling districtsbegroting (zie module M)
- Gantt-view
- Contracten-archief
- Mijlpaal-rapportage

**Afhankelijkheden:** A, K, J.

---

## 🟢 G. Rapportage & export

**Primaire gebruikers:** DC, districtssecretaris, RO
**Doel:** standaardrapportages voor ministerie zonder copy-paste werk.

**Kernfunctionaliteit (MVP)**
- Maandrapport per district (PDF, vaste template): meldingen, vergunningen, projecten, KPI's
- Excel-export van elke lijstweergave
- Ad-hoc filter en download
- Periode-selectie (week, maand, kwartaal, jaar, custom)

**Fase 2 uitbreiding**
- Geautomatiseerde wekelijkse mail naar RO
- Custom dashboard-builder
- Vergelijkende rapporten (district-tegen-district)

**Afhankelijkheden:** alle datamodules.

---

## 🟢 H. Notificaties

**Primaire gebruikers:** allen
**Doel:** zorgen dat actie-vereiste zaken niet blijven liggen.

**Kernfunctionaliteit (MVP)**
- In-app notificatie-center
- Email-notificaties (template + transactioneel)
- Per-gebruiker notificatie-instellingen (welke triggers wel/niet mailen)
- Daily digest optie

**Fase 2 uitbreiding**
- SMS via lokale provider (Digicel, Telesur)
- WhatsApp Business API integratie (zie [07-aanvullend-onderzoek.md](07-aanvullend-onderzoek.md))
- Push notifications via PWA

---

## 🟢 I. Audit log & dossiergeschiedenis

**Primaire gebruikers:** alle (lezen), auditor (analyseren)
**Doel:** geen bestuurlijke actie zonder spoor. Voorwaarde voor overheidsgebruik.

**Kernfunctionaliteit**
- Elke create/update/delete logt: actor, timestamp, IP, before-state, after-state
- Onveranderbaar (append-only), aparte tabel/storage
- Filter per gebruiker, per dossier, per type-actie
- Export naar CSV voor auditors
- Retentie: minimaal 7 jaar (bestuurlijke norm)

**Afhankelijkheden:** alle write-operaties hooken hierop.

---

## 🟡 J. Ressort- en districtsplanning

**Primaire gebruikers:** ressortcoördinator, DC, districtsraad
**Doel:** lokale behoeften → ressortplan → districtsplan → districtsbegroting.

**Kernfunctionaliteit**
- Ressortplan opstellen (prioriteiten + onderbouwing)
- Samenvoegen naar districtsplan (DC aggregatie-view)
- Kostenraming per prioriteit
- Goedkeuringsflow: ressortraad → districtsraad → DC → RO
- Versiebeheer plannen
- Koppeling met B (meldingen worden onderbouwing) en F (projecten worden uitvoering)

---

## 🟡 K. Burgerparticipatie

**Primaire gebruikers:** burger, ressortraad
**Doel:** input van burgers structureel meenemen in planning.

**Kernfunctionaliteit**
- Online consultaties per ressort
- Stemmen op voorstellen (1 burger, 1 stem, met identificatie-check)
- Open ideeën-bus (laagdrempelig)
- Hoorzitting-notulen archief
- Heatmap van issues per ressort (combineert met meldingen)

---

## 🟡 L. Financiële decentralisatie / districtsfonds

**Primaire gebruikers:** financieel medewerker, DC, auditor, RO
**Doel:** districtsbegroting beheren en uitgaven volgen volgens SB 2006 nr. 134.

**Kernfunctionaliteit**
- Begroting per district per jaar
- Uitgavenregistratie (per project, per categorie)
- Budgetreservering bij projectstart
- Approval-flow: medewerker → DC → RO
- Audit trail per transactie
- Subsidie- en donor-tracking
- Export richting nationaal financieel systeem

**Let op:** politiek gevoelig. Pas bouwen ná validatie processen en met juridisch advies.

---

## 🔵 M. GIS / kaart-engine

**Primaire gebruikers:** allen (viewer), GIS-beheerder (lagen)
**Doel:** ruimtelijke visualisatie van alles op het platform.

**Kernfunctionaliteit**
- Kaartlagen: districtgrenzen, ressortgrenzen, projecten, meldingen, vergunningen, infrastructuur, risicogebieden
- "Regels op de kaart" (welke regels gelden op deze locatie?)
- Heatmaps (meldingsdichtheid, projectdichtheid)
- Polygon-tekenen voor terreinen
- Export naar GeoJSON / Shapefile
- Layer-toggle per rol

**Afhankelijkheden:** PostGIS in database vanaf MVP — viewer komt later, maar data moet meteen geo-aware zijn.

---

## 🔵 N. Externe integraties

**Primaire gebruikers:** systeem (achtergrond)
**Doel:** geen data-eilanden, "Haal Centraal"-principe.

**Integraties (in volgorde van waarde)**
- **CBB** (Centraal Bureau voor Burgerzaken) — burger-identificatie
- **MI-GLIS** — perceelinformatie
- **e-Government Suriname** — single-sign-on toekomst
- **Politie / 112** — escalatie van veiligheidsmeldingen
- **Ministerie OW** — projectkoppeling infrastructuur
- **Belastingdienst** — leges en betalingen
- **Open Data API** — publieke transparantie (read-only)

---

## 🔵 O. AI-assistentie

**Primaire gebruikers:** burger (vraagbaak), DC (samenvatting), beleid (analyse)
**Doel:** menselijke tijd vrijspelen, patronen opmerken.

**Kernfunctionaliteit (concept)**
- Burger-chatbot: "welke vergunning heb ik nodig voor X?"
- Dossier-samenvatting: 1-pager van een complex dossier
- Patroonherkenning: trending klachten, anomalieën in budget
- Concept-besluit-opsteller (DC beslist, AI tikt voor)
- Vertaling Nederlands ↔ Sranan Tongo / Sarnami

**Let op:** pas zinvol als de basisdata kwalitatief in het systeem zit. Niet eerder bouwen.

---

## Overzicht — modules per fase

| Module | MVP | Fase 2 | Fase 3 |
|--------|-----|--------|--------|
| A — Identity & Access | 🟢 | uitbr. | uitbr. |
| B — Burger Meldpunt | 🟢 | uitbr. | – |
| C — DC Dashboard | 🟢 | uitbr. | uitbr. |
| D — Vergunningen | 🟢 | uitbr. | – |
| E — Dossier/Document | 🟢 | uitbr. (OCR) | – |
| F — Projectmonitoring | 🟢 | uitbr. | – |
| G — Rapportage | 🟢 | uitbr. | – |
| H — Notificaties | 🟢 (email) | + SMS/WA | – |
| I — Audit log | 🟢 | – | – |
| J — Ressort/Districtsplanning | – | 🟡 | – |
| K — Burgerparticipatie | – | 🟡 | – |
| L — Financiën | – | 🟡 | uitbr. |
| M — GIS | (data-ready) | viewer | 🔵 |
| N — Externe integraties | – | – | 🔵 |
| O — AI-assistentie | – | – | 🔵 |
