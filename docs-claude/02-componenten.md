# 02 — Componenten & modules

Het platform bestaat uit drie clusters:

1. **MijnSuriname** — burgerportaal (publiek, single sign-on)
2. **BestuurSR** — intern/bestuurlijk werkplekplatform
3. **S-Road + Basisregisters** — fundament (interoperabiliteit + data)

Daarnaast: cross-cutting services (notificaties, betalingen, identity, audit).

Legenda fase: 🟢 MVP (Fase 0/1) · 🟡 Fase 2 · 🟠 Fase 3 · 🔵 Fase 4

---

## Cluster 1 — MijnSuriname (burgerportaal)

### 🟢 1.1 — SSO & Digitale-ID koppeling
**Doel:** één login voor alle overheidsdiensten via bestaande Digitale-ID.

- OpenID Connect / SAML 2.0 als gateway
- 3 niveaus van zekerheid (laag/substantieel/hoog) — eIDAS-equivalent
- Hergebruik CBB e-ID kaart (Vlatacom-chip) + e-paspoort (vanaf 25 apr 2025)
- Machtigingen-module (DigiD Machtigen-equivalent) voor mantelzorgers/familie/bedrijven

### 🟢 1.2 — Berichtenbox
**Doel:** persoonlijke, juridisch geldige digitale brievenbus.

- Post van ministeries, DC-kantoren, basisregisters
- PKI-overheid certificaten voor authenticiteit
- Push-notificaties + email-melding
- Mobiel + web; binnen 7 dagen geopend → lees-bevestiging

### 🟢 1.3 — Persoonlijke Gegevens
**Doel:** burger ziet zijn eigen data uit basisregisters.

- CBA (persoon, gezin)
- MI-GLIS (eigendom percelen) — read-only
- KKF (bedrijven waarvan burger eigenaar/bestuurder is)
- Kentekens (KPS), rijbewijs-status
- Correctie-verzoeken indienbaar (geroute naar bronregister)

### 🟢 1.4 — Lopende Zaken (basic)
**Doel:** statusvolging van aanvragen.

- Lijst van actieve dossiers met status, eigenaar, deadline
- Vereist zaakgericht werken bij aansluitende organisatie (OpenZaak-SR in Fase 2 voor volledige werking)
- MVP: simpele status-feed (nieuw → in behandeling → klaar)

### 🟡 1.5 — Identiteitsdocumenten online
- Paspoort / ID-aanvraag online inplannen
- Voortgang aanvraag
- Bezorgkeuze (afhalen DC vs. thuisbezorgd)

### 🟡 1.6 — Aangiftes
- Geboorte, overlijden, huwelijk, naamswijziging
- Vereist Burgerlijke Stand workflow + CBA-integratie

### 🟡 1.7 — Verhuisaangifte
- Real-time naar CBA
- Automatische gevolgupdates (rijbewijs-adres, kentekens, belastingen)
- Once-only-principe (geen herhaalde bewijzen vragen)

### 🟡 1.8 — Rijbewijs aanvragen/verlengen
- Al in soft-launch via KPS + e-Gov samenwerking (jul 2024–2025)
- Inhalen in MijnSuriname-omgeving

### 🟢 1.9 — Signalen-SR (meldingen openbare ruimte)
**Doel:** burger meldt lokaal probleem (drainage, kapvergunning, hinderwetklacht, vuilophaal, weg, brug).

- Open source fork van gemeente Amsterdam Signalen (Foundation for Public Code)
- Machine-learning categorisatie (Fase 3 — Nederlands + Sranantongo)
- Foto/GPS-bijlage
- Auto-routering naar verantwoordelijke DC of ministerie
- Burger volgt status via MijnSuriname Lopende Zaken
- Sranantongo categorieën vanaf Fase 2

### 🟡 1.10 — Vergunningen
- Bouwvergunning (gekoppeld GLIS + DC)
- Hinderwetvergunning (G. 1930 no. 64)
- Kapvergunning
- Evenementvergunning
- Geluidsontheffing
- Marktstand-vergunning
- Inspiratie: NL DSO (Digitaal Stelsel Omgevingswet)

### 🟠 1.11 — Subsidieaanvragen
- Districtsfonds-aanvragen (Wet Fid art. 40)
- Sectorale subsidies (cultuur, sport, sociaal)

### 🟠 1.12 — Participatie & raadplegingen
- Ressortraad-hoorzittingen digitaal beschikbaar
- Online input/comments per voorstel
- Stemmingen op lokale prioriteiten
- Naar voorbeeld Rahvaalgatus.ee (EE)

### 🟠 1.13 — Open Data dashboards
- Per district/ressort: meldingen-volume, openstaande zaken, projecten, begroting-uitvoering
- Geanonimiseerd
- API + CSV/JSON downloads (data.overheid.nl-stijl)

### 🟢 1.14 — Klachten & bezwaren
- Generiek zaaktype "klacht/bezwaar"
- Routering naar juiste instantie
- Termijnen automatisch bewaakt

---

## Cluster 2 — BestuurSR (bestuurlijk werkplek)

### 🟡 2.1 — Zaaksysteem (OpenZaak-SR)
**Doel:** alle bestuurlijke zaken in één systeem met audit trail.

- Open source op basis van OpenZaak (NL VNG)
- ZGW-API's (REST) als interface
- StUF-bruggen niet nodig (geen legacy)
- Workflow-engine (BPMN)
- Documenten gekoppeld via CMIS

### 🟡 2.2 — Vergadermodule (VOLIS-SR)
**Doel:** ressortraad/districtsraad-vergaderingen volledig digitaal.

- Open source fork van Estonian VOLIS
- Agenda, notulen, besluiten, stemming
- Live-streaming naar publiek (zonder login meekijken)
- Ingelogd via Digitale-ID voor raadsleden
- Documenten per agendapunt
- Mobile app voor raadsleden

### 🟢 2.3 — Document Management (DMS)
- Alfresco / Nextcloud + CMIS
- Versiebeheer, audit, retentie (Archiefwet-compliant)
- Per dossier en per organisatie permissies

### 🟠 2.4 — Budget- en financieel beheer
- Wet Fid (Interim Financiële Decentralisatie) compliant
- Districtsfonds boekhouding
- Jaarrekening + jaarverslag
- Koppeling met centrale begrotingsboekhouding (MinFin)
- CLAD-audit toegang

### 🟡 2.5 — HR & personeel
- OrangeHRM (open source) of vergelijkbaar
- DC-kantoor staf
- Verlof, uren, salarissen-input

### 🟡 2.6 — Project- en programmamanagement
- OpenProject (open source)
- DLGP-projecten, infrastructuurprojecten
- GIS-koppeling voor ruimtelijke projecten
- Voortgang, budget, risico, contractor

### 🟠 2.7 — GIS
- MI-GLIS ArcGIS Percelen Online als bron
- QGIS-frontend voor ambtenaren
- MapLibre web-viewer voor publiek
- Layers: percelen, wegen, water, projecten, vergunningen, meldingen

### 🟢 2.8 — Interbestuurlijke samenwerking
- DC ↔ ministeries ↔ DNA communicatie
- S-Road plus Berichtenbox-equivalent voor interne post
- Workflow-coördinatie tussen organen

### 🟠 2.9 — Rapportages & BI
- Metabase / Superset (open source)
- KPI's per district/ressort (zie [03-stappenplan.md](03-stappenplan.md))
- Geautomatiseerde maandrapporten

### 🟡 2.10 — Asset management
- Snipe-IT (open source)
- Voertuigen, gebouwen, infra
- Onderhoudskalender

### 🟡 2.11 — Communicatie / publicatie
- District-websites (Drupal/WordPress)
- Open standaard publicatie (bekendmakingen, besluiten)
- Auto-syndicatie naar MijnSuriname Berichtenbox

---

## Cluster 3 — Fundament: S-Road + Basisregisters

### 🟢 3.1 — S-Road (Surinaamse X-Road)
**Doel:** decentrale, beveiligde data-uitwisseling tussen overheidsorganisaties.

- X-Road v7 open source (NIIS, MIT-licentie)
- **Security Server** per ministerie + per DC
- **Central Services**: registratie, certificaten, time-stamping, MetaData
- Time-stamping autoriteit + Certificate Authority onder Surinaamse jurisdictie
- mTLS tussen Security Servers
- Vanaf Fase 1: 5 ministeries + 1 DC
- Vanaf Fase 3: alle DC's + ressortraden + 15+ basisregisters

**Beheer:** Suriname Interoperability Solutions Institute (SISI) — kan starten als unit binnen e-Suriname Agentschap, later eigen rechtspersoonlijkheid (analoog NIIS).

### 🟢 3.2 — Basisregister Personen (CBB / CBA)
- Centraal Bureau voor Burgerzaken — Centrale Bevolkingsadministratie
- Reeds operationeel
- API's publiek via S-Road (Fase 1)
- Source of truth voor: persoon, gezin, adres, ID, paspoort

### 🟢 3.3 — Basisregister Percelen (MI-GLIS)
- Management Instituut voor Grondregistratie en Land Informatie Systeem
- Staatsbesluit 27 okt 2016: verplichte PerceelsID
- ArcGIS Percelen Online (bestaand)
- API's via S-Road (Fase 1)

### 🟢 3.4 — Basisregister Bedrijven (KKF)
- Kamer van Koophandel en Fabrieken
- Modernisering vereist (UX + API)
- Source of truth voor: bedrijf, eigenaar, bestuur, vestiging

### 🟡 3.5 — Basisregistratie Adressen Suriname (BAS) — *nieuw te bouwen*
- Op basis van GLIS Perceel-ID + DC-toewijzing
- Analoog NL BAG (Basisregistratie Adressen en Gebouwen)
- **Echt missing infrastructure**: zonder authoritative adresregister werken alle andere diensten met inconsistente adressen

### 🟠 3.6 — Basisregister Voertuigen (KPS)
- Voertuigen, kentekens, eigenaarschap
- Onderdeel rijbewijs- en kentekendiensten

### 🟠 3.7 — Basisregister Belastingen
- Aanslagen, betalingen, restituties
- Koppeling met Belastingdienst

---

## Cross-cutting services

### 🟢 4.1 — Identity Provider
- Digitale-ID Government Authenticator (bestaand)
- 3 niveaus van zekerheid
- Machtigingen-module (Fase 2)
- OpenID Connect / SAML 2.0

### 🟢 4.2 — Notificatieservice
- Email (SMTP via PKI-overheid certificaten)
- SMS (Telesur + Digicel API's)
- Push (PWA + native apps Fase 3)
- **WhatsApp Business API** (Fase 2 — hoge WhatsApp-penetratie SUR)

### 🟡 4.3 — Payment Service
- Online betalingen (leges, belastingen, subsidies)
- Lokale providers (banken) + internationale (Stripe/Adyen)

### 🟢 4.4 — Document Service
- PDF-generatie (besluit-templates)
- Digitale handtekening (eIDAS-equivalent niveau hoog)
- Archiefopname (Archiefwet)

### 🟢 4.5 — Audit log + KSI-anchoring
- Onveranderlijk (append-only)
- Hash-anchoring kritieke acties in onafhankelijk ledger (KSI-stijl, à la Guardtime/Estonia)
- Niet de hele blockchain — alleen integriteitsbewijs van log-hashes

### 🟢 4.6 — Mobile-first / PWA
- Responsive design (Vue/React)
- PWA met service worker
- Native iOS/Android voor offline binnenland (Fase 3)
- WCAG 2.1 AA verplicht

### 🟡 4.7 — Meertalige UX
- MVP: Nederlands + Engels
- Fase 2: Sranantongo basisfunctionaliteit
- Fase 3: Saramaccaans + Aukaans voor binnenland
- Voice-interface in Sranantongo overwegen voor laaggeletterden

### 🟢 4.8 — Analytics (privacy-friendly)
- Matomo of Plausible (geen Google Analytics)
- GDPR/PDP-conform
- Geen tracking pixels van derden

### 🟡 4.9 — Chatbot / hulpsysteem
- FAQ + vergunning-check beslisboom
- Fase 4: AI-gestuurde assistent

---

## Modules overzicht

| Cluster | Module | Fase |
|---------|--------|------|
| Burger | 1.1 SSO/Digitale-ID | 🟢 |
| Burger | 1.2 Berichtenbox | 🟢 |
| Burger | 1.3 Persoonlijke Gegevens | 🟢 |
| Burger | 1.4 Lopende Zaken (basic) | 🟢 |
| Burger | 1.5 Identiteitsdocumenten online | 🟡 |
| Burger | 1.6 Aangiftes | 🟡 |
| Burger | 1.7 Verhuisaangifte | 🟡 |
| Burger | 1.8 Rijbewijs online | 🟡 |
| Burger | 1.9 Signalen-SR | 🟢 |
| Burger | 1.10 Vergunningen | 🟡 |
| Burger | 1.11 Subsidieaanvragen | 🟠 |
| Burger | 1.12 Participatie | 🟠 |
| Burger | 1.13 Open Data | 🟠 |
| Burger | 1.14 Klachten/bezwaren | 🟢 |
| Bestuur | 2.1 OpenZaak-SR | 🟡 |
| Bestuur | 2.2 VOLIS-SR | 🟡 |
| Bestuur | 2.3 DMS | 🟢 |
| Bestuur | 2.4 Budget/financieel | 🟠 |
| Bestuur | 2.5 HR | 🟡 |
| Bestuur | 2.6 Project mgmt | 🟡 |
| Bestuur | 2.7 GIS | 🟠 |
| Bestuur | 2.8 Interbestuurlijk | 🟢 |
| Bestuur | 2.9 BI/Rapportages | 🟠 |
| Bestuur | 2.10 Asset mgmt | 🟡 |
| Bestuur | 2.11 Communicatie | 🟡 |
| Fundament | 3.1 S-Road | 🟢 |
| Fundament | 3.2 CBB/CBA | 🟢 |
| Fundament | 3.3 MI-GLIS | 🟢 |
| Fundament | 3.4 KKF | 🟢 |
| Fundament | 3.5 BAS (adressen) | 🟡 |
| Fundament | 3.6 KPS (voertuigen) | 🟠 |
| Fundament | 3.7 Belastingen | 🟠 |
| Cross | 4.1 Identity Provider | 🟢 |
| Cross | 4.2 Notificaties | 🟢 |
| Cross | 4.3 Payment | 🟡 |
| Cross | 4.4 Document/handtekening | 🟢 |
| Cross | 4.5 Audit + KSI | 🟢 |
| Cross | 4.6 Mobile/PWA | 🟢 |
| Cross | 4.7 Meertaligheid | 🟡 |
| Cross | 4.8 Analytics | 🟢 |
| Cross | 4.9 Chatbot/AI | 🟡/🔵 |
