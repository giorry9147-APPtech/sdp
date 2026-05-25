# 11 — Aanvullend onderzoek: wat ontbreekt + aanbevelingen

Dit document inventariseert wat de blauwdruk in [`../CLAUDE-onderzoek.md`](../CLAUDE-onderzoek.md) **niet of onvoldoende dekt**, plus aanvullende risico's en aanbevelingen.

De blauwdruk is uitgebreid en degelijk — maar er zijn structurele lacunes die vóór of tijdens Fase 0/1 moeten worden geadresseerd.

---

## 1. Inheemse en Marron-bestuursstructuren — onderbelicht

**Wat de blauwdruk noemt:** binnenland-bestuursdragers (granman, kapitein, basja) worden genoemd in de tabel bestuurslaag, maar verder nauwelijks uitgewerkt.

**Realiteit:** In Sipaliwini (4/5e van het land), delen van Brokopondo, Marowijne en Para zijn **traditionele bestuursstructuren** dominant, niet de formele WRO-structuur:

- **Inheemse dorpen**: kapitein, basja, dorpsraad
- **Marron-gemeenschappen**: granman (paramount chief), kapiteins per dorp (Saramaccaans, Aukaans, Paramaccaans, Kwinti, Matawai)
- Formeel beperkt in WRO, **de facto** wel het bestuurlijke aanspreekpunt

**Aanbevelingen:**
- Datamodel uitbreiden (Fase 3): entiteit `dorp` onder `ressort`, met rollen `granman`/`kapitein`/`basja`
- **Stakeholder-consultatie met VIDS** (Vereniging Inheemse Dorpshoofden) en Marron-organisaties vóór binnenland-uitrol — niet halverwege improviseren
- Procedures aangepast voor binnenland (vooral grondmeldingen) — alternatieve goedkeuringsroute waar traditioneel gezag betrokken is
- Documenteer expliciet: **dit is geen politieke uitspraak over erkenning**, alleen werkprocesregistratie
- President Simons stelde op 22 dec 2025 een **Werkgroep Grondenrechten en Decentralisatie** in — koppeling zoeken

**Status:** politiek-cultureel het meest gevoelige onderdeel. Gemis hier kan leiden tot ofwel exclusie van binnenland-bevolking ofwel publiek conflict.

---

## 2. WhatsApp als primaire kanaal — onderschat

**Wat de blauwdruk noemt:** WhatsApp Business API wordt genoemd onder notificaties. Maar wordt verder niet uitgewerkt.

**Realiteit:** WhatsApp is in Suriname het dominante communicatiekanaal — vaak het enige actief gebruikte digitale kanaal voor de oudere generatie. Het wordt al **de facto** voor bestuurlijke communicatie gebruikt (DC ↔ ressort ↔ burger).

**Aanbevelingen:**
- **WhatsApp Business API** als first-class kanaal in Fase 2 (niet alleen notificatie)
- Burger kan melding **starten via WhatsApp**, bot stelt vragen, opent dossier in Signalen-SR
- Statusupdates via WhatsApp
- DC kan via WhatsApp dossier openen (deeplink → MijnSuriname login)
- Maar: **WhatsApp is geen opslag** — dossier blijft in platform, WhatsApp is alleen interface
- Verkennen: WhatsApp Pay-koppeling voor leges (als beschikbaar in SUR)

---

## 3. Connectiviteit binnenland — strategie ontbreekt op detail

**Wat de blauwdruk noemt:** "offline-first apps met store-and-forward sync via S-Road" en "eventueel LoRaWAN-gebaseerde messaging".

**Wat ontbreekt:** concreet plan voor:
- Welke bandwidth verwachten we waar precies?
- Hoeveel dorpen exact zonder permanente connectivity?
- Hoe vaak komt een ressortcoördinator uit Sipaliwini naar Paramaribo?
- Wat is de Starlink-regulering status in Suriname?
- Hoe verhouden Bio-SWEET dorpen zich tot e-Suriname touchpoints?

**Aanbevelingen:**
- **Connectivity-survey** binnen Fase 0 (samen met Telesur en Bio-SWEET team)
- **Per-dorp strategie** (permanente verbinding / intermittent / store-and-forward / fysiek bezoek)
- **Gemeenschappelijke ICT-punten** als concept uitwerken (welk model: kiosk, mobiele eenheid, dorpsmedewerker met laptop?)
- **USSD-fallback** voor feature-phones overwegen (Fase 3)
- **Starlink-regulering monitoren** — kan game-changer zijn voor Sipaliwini

---

## 4. Klimaat & rampenbestendigheid — niet behandeld

**Wat de blauwdruk noemt:** vrijwel niets specifiek over klimaat.

**Realiteit:**
- **Kustzone**: Paramaribo, Wanica, Coronie, Saramacca, Commewijne kwetsbaar voor zeespiegelstijging en overstromingen
- **Binnenland**: extreme regenval, droogte, isolement bij hoogwater
- **Cycloon-randzone**: minder direct dan Caraïbische eilanden, wel storm-events
- Suriname is signatory van **Klimaatakkoord van Parijs** + heeft eigen NDC

**Aanbevelingen:**
- **Crisis-modus** in platform (Fase 4 expliciet)
- Koppeling met **NCCR** (Nationaal Coördinatie Centrum Rampenbeheersing)
- **Backup-strategie**: minstens één off-site backup in andere klimaatzone (Data Embassy)
- **DR-runbook**: wat als datacenter Paramaribo zelf overstroomt?
- **Categorie "klimaat/water-overlast"** in Signalen-SR vanaf MVP
- **Klimaat-resilience** als ontwerpcriterium voor lokale datacenters (vloed-niveau, koeling)

---

## 5. Cybersecurity diepte — meer dan een tabelregel

**Wat de blauwdruk noemt:** "National CSIRT versterken, jaarlijkse pentests, Data Embassy voor DR, KSI-anchoring kritieke registers"

**Wat ontbreekt:**
- Hoe ziet huidig National CSIRT eruit?
- Wat is de capaciteit?
- Bestaat er een Cyber Security Act?
- Wat is huidige incident-response readiness?
- Wie heeft mandaat voor lock-down bij incident?
- Hoe sluit Suriname aan op CARICOM/internationale CSIRT-netwerken?

**Aanbevelingen:**
- **Cyber Security Act** ontwerpen + indienen (zie [07-juridisch.md](07-juridisch.md) §K)
- **CSIRT-capaciteit assessment** in Fase 0
- **Partnerschap met TS-CERT.EE** (Estland) of NL NCSC voor mentoring
- **24/7 SOC** binnen e-Suriname Agentschap (Fase 1+)
- **Threat intelligence sharing** met CARICOM-buren
- **Red team exercises** jaarlijks vanaf Fase 2
- **Backup van CSIRT in Data Embassy** (Fase 4)
- **Olie/gas sector** maakt SUR een doelwit voor staats-actoren — vroege focus op nation-state threat modeling

---

## 6. Diaspora-engagement — onbenutte hulpbron

**Wat de blauwdruk noemt:** "diaspora-talent (Surinamers in NL/USA als adviseurs)" als capaciteitsmaatregel.

**Wat ontbreekt:** strategie voor diaspora als gebruikers + partners + investeerders.

**Realiteit:**
- Grote Surinaamse diaspora (~350.000+ in Nederland alleen)
- Veel professionals met ICT/overheid-ervaring
- Nederlandse Surinamers zijn frequent op SUR-bezoek + hebben familie hier
- Remittances zijn significante BNP-bijdrage

**Aanbevelingen:**
- **Diaspora-services in MijnSuriname** (Fase 2):
  - Paspoortverlenging via consulaten + portaal
  - Bevolkingsregister-mutaties op afstand
  - Belastingen voor onroerend goed in SUR
- **Diaspora-engineer-pool** als programma (Fase 0)
- **Diaspora-bonds** als alternatieve financieringsbron (lange termijn)
- **e-Residency-discussie** (Fase 4+) niet alleen buitenlanders maar primair diaspora

---

## 7. Adoptie & change management — onderbelicht

**Wat de blauwdruk noemt:** "Multi-channel: papier blijft beschikbaar; ressortraad-leden trainen als digitale ambassadeurs; meertalige UX"

**Wat ontbreekt:** concrete change-management strategie. Risico: prachtig systeem, niemand gebruikt het.

**Aanbevelingen:**
- **Pilot-DC mede-eigenaar maken** (Wanica + Para): hun naam aan het project verbinden
- **Eerste 4-8 weken na go-live: on-site support** door Agentschap
- **Train-de-trainer** met districtssecretaris zodat kennis blijft
- **Korte video-tutorials** (max 2 min) per rol, in Nederlands + Sranantongo
- **Adoptie-KPI's** meten: % aanvragen via MijnSuriname vs. fysiek loket
- **Maandelijkse feedback-sessie** met gebruikers eerste half jaar
- **Beloon adoptie**: dashboard waarop DC's elkaar zien op adoptie-metrics
- **Marketingcampagne** bij MijnSuriname launch (TV/radio/social/WhatsApp-broadcast)
- **Influencers** in lokale gemeenschappen als ambassadeurs

---

## 8. Privacy operationeel — verder dan alleen wet

**Wat de blauwdruk noemt:** Privacywet als kritieke voorwaarde + Commissaris PDP.

**Wat ontbreekt:** operationele privacy-mechanismen.

**Aanbevelingen:**
- **Data Protection Impact Assessment (DPIA)** verplicht vóór elke nieuwe dienst
- **Privacy by Design**-richtlijnen in Architectuur Principes Document
- **Privacy-officer** binnen e-Suriname Agentschap (apart van Compliance)
- **Burger-toegang tot eigen data** via Persoonlijke Gegevens module
- **Recht op vergetelheid** procedures (met wettelijke retentie-uitzonderingen)
- **Pseudonimisering** in alle rapportages en exports
- **Bewaartermijnen per dossiertype** gedocumenteerd en geautomatiseerd
- **Cookie-policy + privacystatement** voor alle publieke sites
- **Data-breach response runbook** (Fase 1)
- **Internationale doorgifte beleid** (relevant voor Data Embassy + cloud-providers)

---

## 9. Open Source-strategie — verder dan "first"

**Wat de blauwdruk noemt:** "Open source-first zoals Estland NIIS en Nederland VNG"

**Wat ontbreekt:** open source sustainability + governance.

**Aanbevelingen:**
- **Open source licentie-strategie**: voorkeur MIT/Apache 2.0 voor maximale herbruikbaarheid (Fase 0)
- **Foundation-model** overwegen voor langetermijn-governance (Foundation for Public Code-stijl)
- **External contributions** beleid: hoe accepteren we PRs van derden?
- **Trademark-bescherming** voor "MijnSuriname", "e-Suriname", "S-Road" namen
- **CARICOM-uitwisseling**: andere Caribische landen kunnen onze code hergebruiken (Belize, Guyana qua structuur vergelijkbaar)
- **Open source sustainability fund**: een deel van TCO reserveren voor doorontwikkeling van core-dependencies
- **Bijdrage aan upstream**: SUR-improvements terugbrengen in OpenZaak, Signalen, X-Road

---

## 10. API-economy & private sector access

**Wat de blauwdruk noemt:** "REST APIs (OAS 3.0)" en "Open Data API publiek beschikbaar"

**Wat ontbreekt:** strategie voor private sector toegang tot overheids-API's.

**Realiteit:**
- Surinaamse private sector kan via API-integratie efficiencywinst behalen
- Banken, verzekeraars, notarissen, accountants hebben behoefte aan geverifieerde overheidsdata
- API-economy is een **inkomstenbron** + **economische groeiversneller**

**Aanbevelingen:**
- **Developer Portal** (Fase 1) met OpenAPI specs, sandbox, testdata
- **API-keys + rate-limits** per consument
- **Premium-tier API's** mogelijk (betaalde diensten voor commerciële partijen)
- **Conditioneel toegankelijke API's**: met toestemming burger (à la DigiD Machtigen)
- **Hackathons** + developer events
- **API-Council** met private sector + overheid om prioriteiten te stellen

---

## 11. Inkoop & vendor management

**Wat de blauwdruk noemt:** "Haven-stijl pas-toe-of-leg-uit; open source-first inkoop; portability als aanbestedingscriterium"

**Wat ontbreekt:** concrete inkoop-mechaniek.

**Aanbevelingen:**
- **Inkoopkader** specifiek voor digitale dienstverlening (Fase 0)
- **Standaard contracten** met IP-eigendom bij Suriname, broncode-deponering bij exit
- **Geen exclusieve contracten >3 jaar** (vendor lock-in voorkomen)
- **SBOM-eisen** in elke aanbesteding (Software Bill of Materials)
- **Aanbesteding via lots** (kleinere stukken makkelijker te wisselen)
- **Lokale leveranciers prioriteit** waar mogelijk (capaciteitsopbouw binnenland)
- **Diaspora-aanbesteding mogelijkheid** (NL-SUR-bedrijven, dubbele nationaliteit)

---

## 12. Verkiezingen-koppeling — meer dan i-Voting

**Wat de blauwdruk noemt:** i-Voting pilot voor ressortraadverkiezingen 2030.

**Wat ontbreekt:** bredere verkiezingen-integratie.

**Aanbevelingen:**
- **Kiesregister-koppeling** met CBA (wie heeft stemrecht waar?)
- **Kandidatenbeheer** voor RR/DR
- **Stemresultaten publicatie** in Open Data
- **Mandaatperiodes** per gekozen lid bijhouden (verloop, opvolging)
- **Koppeling met Centraal Hoofdstembureau (CHS)**
- **Politieke partijen-registratie**
- i-Voting **alléén voor specifieke laag** (RR-verkiezingen eerst), nooit voor presidentiële/DNA-verkiezingen zonder massieve audit

---

## 13. Standaarden-governance — wie beslist?

**Wat de blauwdruk noemt:** ZGW, CMIS, WCAG 2.1 AA, etc.

**Wat ontbreekt:** wie bewaakt deze standaarden in Suriname?

**Aanbevelingen:**
- **Forum Standaardisatie SR** (analoog NL Forum Standaardisatie) — verplicht "pas-toe-of-leg-uit" voor open standaarden
- **Lijst van verplichte open standaarden** publiceren (Fase 1)
- **Open consultatie** bij nieuwe standaard-keuzes
- **CARICOM-coördinatie** voor regionale standaarden
- **Internationale aansluiting**: ISO, W3C, OASIS, OGC

---

## 14. Toegankelijkheid + inclusie — concreter dan WCAG

**Wat de blauwdruk noemt:** "WCAG 2.1 AA"

**Wat ontbreekt:** Surinaamse-specifieke toegankelijkheid:

**Aanbevelingen:**
- **Pictogram-zware UI** voor laaggeletterden (geschat 5-10% van bevolking volgens UNESCO)
- **Voice-interfaces** voor blinden + analfabeten (Sranantongo)
- **Audio-output** voor formulieren
- **Tweetalige content waar relevant** (Nederlands + Sranantongo per pagina)
- **Mobile-first absoluut** (sommige burgers hebben nooit een laptop gebruikt)
- **Eenvoudig taalgebruik** als ontwerp-eis (max B1-niveau Nederlands)
- **Inclusie-audit** door gehandicapten-organisaties

---

## 15. Wat de blauwdruk NIET-noemt qua positionering

Een aantal politiek/strategische punten:

### "Sovereign AI" positie
De blauwdruk noemt AI alleen in Fase 4 (chatbot, classificatie). Geen visie op:
- Surinaams AI-model voor publieke sector?
- Soevereine LLM-hosting (vs. afhankelijkheid van OpenAI/Anthropic)?
- AI-ethiek wetgeving?

**Aanbeveling**: AI-strategie als apart spoor opzetten (Fase 2 onderzoek, Fase 3-4 implementatie).

### Crypto-/digital-currency
Blauwdruk noemt geen Central Bank Digital Currency (CBDC).
- Veel Caribische landen onderzoeken CBDCs
- Surinaamse banken-systeem heeft inefficiënties
- Koppeling overheidsdiensten ↔ digitale betalingen kan zeer waardevol zijn

**Aanbeveling**: monitoren CBSur (Centrale Bank Suriname) digitale-Surinaamse-dollar plannen. Niet zelf bouwen, wel koppeling voorzien.

### Internationale standaarden voor handel
- World Customs Organization data-standaarden
- WCO Single Window Initiative
- CARICOM SEW (Single Electronic Window)

**Aanbeveling**: Min. Buitenlandse Zaken / Belastingdienst-koppeling met handel-portal (Fase 3+).

### Onderwijs-koppeling
- Schoolregistratie, diploma-verificatie, studentenfinanciering
- Anton de Kom Universiteit + Polytechnic — partnerschap én gebruiker
- Vergelijkbaar met EE e-School

**Aanbeveling**: Min. Onderwijs als aansluiter Fase 3.

### Gezondheid-koppeling (e-Health)
- Patiëntendossier, e-Prescription, vaccinatie-register
- Vereist apart vertrouwens- en privacy-model
- Vergelijkbaar met EE Patient Portal / NL MedMij

**Aanbeveling**: separate e-Health strategie ontwerpen na Fase 2 — apart project met Min. Volksgezondheid.

---

## 16. Specifieke caveats uit blauwdruk gevalideerd

De blauwdruk eindigt met caveats die belangrijk zijn:

| Caveat | Status |
|--------|--------|
| DLGP-III bestaat formeel nog niet | bevestigd — Top-3 aanbeveling = formeel verzoek IDB |
| WRO niet up-to-date voor digitale tijd | bevestigd — wijzigingswet WRO in Fase 0/1 juridisch traject |
| Bio-SWEET dorpen-aantal onzeker | te verifiëren bij IDB Loan Proposal voor offertes |
| e-Government leiderschap recent gewijzigd | risico — borging via Agentschap-wet als ZBO essentieel |
| BvB vs CBB-financiën verwarring | terminologie expliciet hanteren in docs |
| 78,4% internetpenetratie overschat ruraal | bevestigd — connectivity-survey per dorp nodig (zie §3) |
| i-Voting wordt door externe security experts bekritiseerd | bevestigd — Fase 4+, onafhankelijke audit verplicht |
| Data Embassy juridisch novum | bevestigd — bilateraal verdrag, DNA-ratificatie |
| Kostenramingen indicatief | bevestigd — actuele aanbestedingen kunnen ±25% afwijken |
| NDS heeft geen aparte begrotingsallocatie | bevestigd — Agentschap-wet moet meerjarenbegroting borgen |

---

## 17. Dichtsten in deze volgorde

### Vóór Fase 0 start (binnen 3 maanden)
1. ✅ Presidentieel Besluit "Digitale Transformatie Suriname"
2. ✅ Stakeholder-mapping voltooid (inclusief VIDS + Marron-organisaties)
3. ✅ Connectivity-survey binnenland geinitieerd
4. ✅ Internationale juridische adviseurs werven
5. ✅ Bestaande infra-inventarisatie (wat is er al aan e-Gov? GLIS? KKF?)

### Tijdens Fase 0 (0–6 mnd)
6. ✅ Inheemse/Marron-bestuurslaag in datamodel-ontwerp opnemen
7. ✅ Cyber Security Act + CSIRT-plan
8. ✅ Diaspora-engagement strategie
9. ✅ Adoptie/change management plan per pilot-DC
10. ✅ Privacy operationeel kader (DPIA-template, privacy-officer, etc.)

### Tijdens Fase 1 (6–18 mnd)
11. ✅ WhatsApp Business API in roadmap promoveren (van Fase 2 naar Fase 1 als capaciteit toestaat)
12. ✅ Klimaat/crisis-modus design
13. ✅ Developer Portal + API-economy strategie
14. ✅ Forum Standaardisatie SR opzetten
15. ✅ Open source governance + sustainability

### Tijdens Fase 2+ (na 18 mnd)
16. ✅ Verkiezingen-integratie (kiesregister, kandidaten, etc.)
17. ✅ Onderwijs- en gezondheidskoppeling-strategie
18. ✅ Sovereign AI-spoor
19. ✅ CBDC monitoring + koppeling-voorbereiding
20. ✅ Internationale handel-koppeling

---

## 18. Conclusie

De blauwdruk in `CLAUDE-onderzoek.md` is **uitzonderlijk degelijk** in:
- Internationale benchmarking (X-Road, Common Ground)
- Juridische analyse (WRO, Privacywet, DLGP-historie)
- Fasering en governance
- Kostenstructuur en funding-mix

Hij is **onderbelicht** in:
- Inheemse/Marron-bestuursrealiteit (politiek-cultureel kritisch)
- WhatsApp als primair kanaal (operationeel kritisch)
- Connectivity binnenland (operationeel kritisch)
- Klimaat-resilience (operationeel + strategisch)
- Cybersecurity diepte (strategisch + risk)
- Adoptie/change management (uitvoeringskritisch)
- Diaspora-engagement (strategische kans)
- API-economy + private sector (economische impact)

De gaten zijn niet onoverkomelijk — maar moeten **expliciet worden geadresseerd in Fase 0** anders worden ze later veel duurder om te repareren.
