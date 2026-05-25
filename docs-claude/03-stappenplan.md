# 03 — Stappenplan / Roadmap (5 fases, 60 maanden)

Gebaseerd op de fasering in [`../CLAUDE-onderzoek.md`](../CLAUDE-onderzoek.md) §6. Totaal indicatief budget: **USD 35–55 miljoen** over 5 jaar.

```
Fase 0  Voorbereiding & Governance         0–6 mnd    USD 1,5–2,5 mln
Fase 1  Foundation                         6–18 mnd   USD 8–12 mln
Fase 2  Core services                      18–36 mnd  USD 12–18 mln
Fase 3  Uitbreiding                        36–48 mnd  USD 8–12 mln
Fase 4  Optimalisatie & Innovatie          48–60 mnd  USD 5–8 mln
```

---

## Fase 0 — Voorbereiding & Governance (0–6 mnd) · USD 1,5–2,5 mln

**Doel:** wetgeving, financiering en governance op orde vóórdat ook maar één regel code geschreven wordt.

### Politiek & wetgeving (parallel, hoogste prioriteit)
- [ ] **Presidentieel Besluit "Digitale Transformatie Suriname"** ondertekenen
- [ ] **Onderhandeling DNA**: versnelde behandeling Ontwerpwet Bescherming Privacy en Persoonsgegevens — **doel: aanname Q3 2026**
- [ ] **e-Suriname Agentschap-wet** ontwerpen + indienen DNA
- [ ] **Staatsbesluit Basisregisters Suriname** voorbereiden (CBB, MI-GLIS, KKF officieel)
- [ ] **Wijzigingswet WRO** voorbereiden (digitale agenda's, raadsvergaderingen, bekendmakingen)

### Governance & organisatie
- [ ] **Nationale Digitale Stuurgroep** instellen (President, MinBiZa, MinROS, MinFin, MinJus, DNA-vz, IDB-rep)
- [ ] **Regiegroep e-Suriname** instellen (directeur e-Gov + SG's + DC-rep)
- [ ] **Werkplan** publiceren (open consultatie)

### Internationale samenwerking
- [ ] **MoU met NIIS** (Tallinn) — X-Road v7 licentie + technische support
- [ ] **MoU met e-Governance Academy** — 5-daagse training basisteam
- [ ] **MoU met VNG International / Logius** — Common Ground componenten + kennisuitwisseling
- [ ] **Bilateraal NL** (Ambassade Paramaribo, post staatsbezoek dec 2025) — kennisdeling
- [ ] **CARICOM**-coördinatie (eLAC2026, ICT Strategy)

### Financiering
- [ ] **Formeel verzoek IDB** voor DLGP-III als opvolger SU0019/SU-L1011
- [ ] **UNDP** approach voor Fase 0 + Fase 1 co-financiering
- [ ] **EU Caribbean Investment Facility / Global Gateway** verkennen
- [ ] **Wereldbank Digital Public Infrastructure** financiering verkennen
- [ ] **Financieringsplan jaar 1-5** vaststellen
- [ ] **TCO-model** publiceren (5 jaar)

### Architectuur & inkoop
- [ ] **Architectuur Principes Document** publiceren (open consult.)
- [ ] **Haven-Suriname** cloud-standaard verklaren (pas-toe-of-leg-uit)
- [ ] **Aanbestedingskader** met portability + open source als criteria
- [ ] **Repo + CI/CD** opzetten (GitLab CI, SBOM verplicht, OWASP scans)

### Capaciteit
- [ ] **e-Suriname kernteam** werven (directeur, 5 architecten, 3 product owners, security lead)
- [ ] **Loonschalen** vastgesteld competitief met private sector
- [ ] **Eerste training-cohort** bij e-Governance Academy
- [ ] **Diaspora-talent pool** opzetten (SUR-engineers in NL/USA als adviseurs)

**Gate Fase 0 → Fase 1:**
- ✅ Privacywet door DNA aangenomen
- ✅ e-Suriname Agentschap-wet aangenomen + agentschap opgericht
- ✅ Stuurgroep + Regiegroep actief
- ✅ IDB DLGP-III LOI of equivalente Fase 1 financiering rond
- ✅ MoU's met NIIS, VNG, e-Gov Academy operationeel
- ✅ Kernteam geworven

---

## Fase 1 — Foundation (6–18 mnd) · USD 8–12 mln

**Doel:** S-Road, basisregisters en MijnSuriname MVP live; Signalen-SR pilot in Paramaribo + Wanica.

### Sprint set A — S-Road implementatie (mnd 6–12)
- [ ] X-Road v7 productie deployment
- [ ] **Central Services**: registratie, certificaten, time-stamping
- [ ] **Certificate Authority** onder Surinaamse jurisdictie
- [ ] **5 Security Servers**: BiZa, MinFin, MinROS, MinJus, e-Gov
- [ ] **Eerste 3 dataservices** live (CBA→ministeries, MI-GLIS→DC, KKF→ministeries)
- [ ] **RIHA-equivalent**: catalogus van interoperability resources

### Sprint set B — Basisregisters openen (mnd 6–14)
- [ ] **Staatsbesluit Basisregisters** in werking
- [ ] **CBB/CBA API's** publiek via S-Road
- [ ] **MI-GLIS API's** publiek via S-Road
- [ ] **KKF modernisering** (UX + API)
- [ ] **Once-only-beleid** afgekondigd (data niet 2x ophalen)

### Sprint set C — MijnSuriname portaal MVP (mnd 9–18)
- [ ] SSO via Digitale-ID (OIDC)
- [ ] Berichtenbox (PKI-cert, ~5 ministeries als zenders)
- [ ] Persoonlijke Gegevens (CBA + GLIS + KKF read)
- [ ] Lopende Zaken (basic feed)
- [ ] Klachten/bezwaren generiek zaaktype
- [ ] Mobile-first PWA + WCAG 2.1 AA
- [ ] Privacy-friendly analytics (Matomo)

### Sprint set D — Signalen-SR pilot (mnd 9–15)
- [ ] Fork van gemeente Amsterdam Signalen
- [ ] Categorieën aangepast (drainage, kapvergunning, hinderwetklachten, vuilophaal, infrastructuur, openbare orde)
- [ ] Routering: Paramaribo + Wanica DC-kantoren
- [ ] Burger meldt via MijnSuriname of publiek formulier
- [ ] DC-kant: ontvangen → toewijzen → oplossen → sluiten

### Sprint set E — Cross-cutting (parallel)
- [ ] **Document Service** (Alfresco/Nextcloud + CMIS)
- [ ] **Notificaties**: email + SMS (Telesur/Digicel API's)
- [ ] **Audit log + KSI-anchoring**
- [ ] **DR/Backup**: lokaal + 1 internationale off-site (Data Embassy nog niet, gewoon S3 in andere regio)

### Pilot DC Wanica
- [ ] Eerste Security Server bij DC Wanica
- [ ] Eerste S-Road dataservice: melding-routering van Signalen-SR → DC Wanica
- [ ] Trainingen DC-staf (2 weken)
- [ ] On-site support eerste 4 weken na go-live

**Gate Fase 1 → Fase 2:**
- ✅ S-Road in productie met 5 ministeries + 1 DC
- ✅ MijnSuriname ≥5.000 actieve gebruikers binnen 6 mnd
- ✅ Signalen-SR verwerkt ≥1.000 meldingen/maand in Paramaribo+Wanica
- ✅ 30% van burgers heeft actieve Digitale-ID
- ✅ Geen kritieke security incidents
- ✅ IDB DLGP-III tweede tranche binnen voor Fase 2

---

## Fase 2 — Core services (18–36 mnd) · USD 12–18 mln

**Doel:** end-to-end digitale burgerdiensten + zaaksysteem in pilot-DC's + ressortraad-vergaderingen digitaal.

### Werkstromen
- [ ] **OpenZaak-SR** in DC's Wanica + Para (zaaksysteem)
- [ ] **VOLIS-SR** voor 10 ressortraden (Estonian model, Sranantongo basis)
- [ ] **Vergunningenflow** end-to-end voor 4 types: bouw, hinder, kap, evenement
- [ ] **Verhuisaangifte** digitaal via CBA
- [ ] **Rijbewijs** volledig in MijnSuriname (inhalen soft-launch KPS)
- [ ] **Identiteitsdocumenten** online inplannen + voortgang
- [ ] **Aangiftes** (geboorte/overlijden/huwelijk) digitaal
- [ ] **Sranantongo** basisfunctionaliteit MijnSuriname
- [ ] **WhatsApp Business API** notificaties
- [ ] **DC's Nickerie + Commewijne** aansluiten (totaal 4 DC's digitaal)
- [ ] **20 ressortraden** met VOLIS-SR
- [ ] **Machtigingen-module** (DigiD Machtigen-equivalent)
- [ ] **Payment Service** (leges, eenvoudige belasting)
- [ ] **HR-module** (OrangeHRM) voor pilot-DC's
- [ ] **Project Management** (OpenProject) voor DLGP-projecten
- [ ] **Asset Management** (Snipe-IT) voor pilot-DC's
- [ ] **BAS** (Basisregistratie Adressen Suriname) opzetten
- [ ] **Communicatie-publicatie** (district-websites, bekendmakingen)

### KPI's eind Fase 2
- 50% van DC-aanvragen digitaal ontvangen in pilot-districten
- 4 DC's met OpenZaak-SR
- 20 ressortraden met VOLIS-SR
- 10 burgerdiensten end-to-end digitaal
- ≥30.000 actieve MijnSuriname-gebruikers
- 100+ open datasets

---

## Fase 3 — Uitbreiding (36–48 mnd) · USD 8–12 mln

**Doel:** alle 10 districten + 62 ressorten aangesloten, GIS productie, financieel beheer, BI.

### Werkstromen
- [ ] **Volledige uitrol**: alle 10 DC's + 62 ressortraden aangesloten op S-Road, OpenZaak-SR en VOLIS-SR
- [ ] **GIS** met MI-GLIS Percelen Online als bron, QGIS-frontend, publieke web-viewer (MapLibre)
- [ ] **Budget/financieel beheer** Wet Fid-conform, koppeling MinFin centrale begrotingsboekhouding
- [ ] **Districtsbelasting-module** (afhankelijk van District Tax Law — als die er komt)
- [ ] **BI/Rapportages**: Metabase/Superset met KPI-dashboards per district
- [ ] **Subsidieaanvragen** (Districtsfonds Wet Fid art. 40)
- [ ] **Participatie & raadplegingen** (Rahvaalgatus-stijl per ressort)
- [ ] **Open Data Portaal** publiek met 500+ datasets
- [ ] **Saramaccaans + Aukaans** UX voor binnenland
- [ ] **Native iOS/Android apps** voor offline binnenland (store-and-forward sync)
- [ ] **Inheemse/Marron-bestuurslaag** in datamodel (kapiteins, granmans, basja) — zie [11](11-aanvullend-onderzoek.md)
- [ ] **Gemeenschappelijke ICT-punten** in binnenland-dorpen (Bio-SWEET koppeling)

### KPI's eind Fase 3
- 100% DC's en RR's digitaal
- GIS in productie met 5+ layers
- 70% van burgers met Digitale-ID
- 75% aangiftes digitaal
- 500+ open datasets
- 15 connected basisregisters via S-Road
- Gemiddelde doorlooptijd uittreksel <1 uur

---

## Fase 4 — Optimalisatie & Innovatie (48–60 mnd) · USD 5–8 mln

**Doel:** AI, proactive services, eerste i-Voting pilot, Data Embassy operationeel.

### Werkstromen
- [ ] **AI-classificatie meldingen** (Signalen-SR ML-categorisatie, Nederlands + Sranantongo)
- [ ] **Proactive services**: geboorte → automatische kinderbijslag-aanvraag
- [ ] **AI-chatbot** burger-hulp (vergunning-check, doorverwijzing)
- [ ] **Data Embassy** operationeel (Nederland of CARICOM-partner)
- [ ] **i-Voting pilot** voor ressortraadverkiezingen 2030 (na onafhankelijke security audit + publieke consultatie)
- [ ] **Volledige integratie** (alle ministeries, alle DC's, alle basisregisters)
- [ ] **Crisis-modus** voor rampenbeheersing (NCCR-koppeling)
- [ ] **CARICOM-interoperabiliteit** met regio-partners
- [ ] **Diaspora-services** (Surinamers in buitenland, e-Residency-discussie)

### KPI's eind Fase 4
- 70% burgers met actieve Digitale-ID
- 50% transacties met overheid default digitaal
- 80% klanttevredenheid (CSAT)
- 500+ open datasets
- Data Embassy operationeel met ≥3 kritieke registers back-up
- AI in ≥2 publieke processen
- Eerste i-Voting pilot uitgevoerd + geëvalueerd

---

## Cross-fase: KPI-overzicht

| KPI | T0 (2026) | Fase 1 (2028) | Fase 3 (2030) |
|-----|-----------|---------------|---------------|
| Burgers met Digitale-ID | <10% | 30% | 70% |
| DC's gedigitaliseerd | 0% | 30% (3/10) | 100% |
| Ressortraden met VOLIS-SR | 0 | 10/62 | 62/62 |
| Doorlooptijd uittreksel | 1–5 dagen | <1 dag | <1 uur |
| Aangiftes digitaal | <5% | 30% | 75% |
| Open data datasets | <20 | 100 | 500 |
| Basisregisters via S-Road | 0 | 5 | 15 |
| NPS digitale dienstverlening | n.v.t. | +20 | +40 |

---

## Risico's en mitigaties (samenvatting)

| Risico | Kans | Impact | Mitigatie |
|--------|------|--------|-----------|
| Politieke wisseling verstoort continuïteit | hoog | hoog | Verankering in wet (Agentschap), DNA-breed gedragen meerjarenplan, internationale verdragen |
| Privacywet niet aangenomen | hoog | hoog | Fase 0 absolute prio; zonder wet géén S-Road productie |
| IDB DLGP-III niet rond | middel | hoog | Alternatief consortium UNDP+EU+NL |
| Legacy systemen blokkeren integratie | hoog | hoog | Strangler-patroon: nieuwe S-Road services ervoor, legacy 3-5 jr uitfaseren |
| Geen BAG-equivalent | hoog | hoog | BAS in Fase 1/2 opzetten met MI-GLIS + DC's |
| Lage adoptie binnenland | hoog | middel | Multi-channel (papier blijft), ressortraad-leden als ambassadeurs, meertaligheid |
| Cybersecurity-aanval | middel | hoog | National CSIRT, jaarlijkse pentest, Data Embassy DR, KSI-anchoring |
| Capaciteit ICT-talent emigreert | hoog | middel | Competitieve loonschalen Agentschap, retentiebonus, opleidingstraject, diaspora |
| Vendor lock-in | middel | middel | Haven pas-toe-of-leg-uit, open source first |
| Taal/inclusie binnenland | middel | middel | UX-onderzoek met gemeenschappen, pictogrammen, voice in Sranantongo |
| Wet Regionale Organen niet up-to-date voor digitale tijd | middel | hoog | Wijzigingswet WRO opnemen in Fase 0 wetgevingstraject |
