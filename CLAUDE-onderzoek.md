# Strategische Blauwdruk: Geïntegreerd Decentralisatieplatform voor Suriname

## TL;DR
- **Bouw één geïntegreerd nationaal platform — werknaam "e-Suriname / MijnSuriname" — onder regie van het Directoraat e-Government (Kabinet van de President), dat zowel burgerdiensten (DigiD-equivalent, berichtenbox, vergunningen, aangiftes, meldingen) als bestuurlijke processen voor de 10 districtscommissariaten, 62 ressortraden en districtsraden (zaaksysteem, vergadermodule à la Estlands VOLIS, budget/Wet Fid, GIS) ondersteunt — gebouwd op het Estse X-Road interoperabiliteitsmodel (open source, NIIS) als "S-Road" en het Nederlandse Common Ground 5-lagenprincipe, met basisregisters (CBB/CBA, MI-GLIS, KKF) als bron van waarheid.**
- **De voorwaarden zijn gunstig maar fragiel: 78,4% internetpenetratie en 149% mobiele penetratie (DataReportal/GSMA Q4-2025), een operationele e-ID en e-paspoort (CBB, vanaf 25 april 2025), een Digitale-ID Government Authenticator via digitale-id.gov.sr, een National Digital Strategy 2023-2030 (UNDP/Presidentiële Werkgroep e-Government, september 2023), én IDB Country Strategy 2021-2025 met digitale transformatie als pijler. Maar: de Ontwerpwet Bescherming Privacy en Persoonsgegevens ligt sinds 2020 bij DNA zonder behandeling, een DLGP-III is nog niet door IDB gefinancierd (laatste fase DLGP-II SU-L1011 werd formeel afgesloten december 2014), en de Wet Regionale Organen (S.B. 1989 no. 44) is door onvolledige fiscale decentralisatie (District Tax Law en DEF nooit aangenomen) nooit operationeel volwassen geworden.**
- **Concreet advies: start binnen 6 maanden met een Fase 0 governance- en wetgevingstraject (data protection law, e-Suriname agentschap-status, S-Road-instituut), volg met een 18-maanden Foundation-fase (S-Road interoperabiliteit, MijnSuriname burgerportaal MVP, OpenZaak-achtig zaaksysteem voor 2 pilot-districten — Wanica en Para — naar voorbeeld van DLGP-II piloting), en breid in 36-60 maanden uit naar volledige uitrol inclusief ressortraad-modules, GIS, BI en participatie. Indicatief budget over 5 jaar: USD 35-55 miljoen, te financieren via IDB (vervolg op SU-L1011), UNDP, EU en bilaterale samenwerking (Nederland/VNG, Estland/e-Governance Academy).**

---

## Key Findings

### 1. Suriname heeft de basisbouwstenen — maar geen samenhang
Suriname beschikt over een operationele e-ID (CBB, gelanceerd 15 maart 2019, biometrisch e-paspoort vanaf 25 april 2025), een Digitale-ID Government Authenticator (digitale-id.gov.sr) en digitale uittreksels via PKI (gelanceerd 7 april 2025). Het Directoraat e-Government valt onder het Kabinet van de President met directeur Llydion Dalfour (sinds september 2025, na ontheffing Prewien Ramadhin). Er bestaat echter geen interoperabiliteitslaag (geen X-Road equivalent), geen federatief identiteitsstelsel met machtigingen, en geen integraal burger- of bestuursportaal dat districtscommissariaten en ressortraden koppelt. Burgerdiensten zoals rijbewijsverlenging (gezamenlijk initiatief KPS + e-Gov, juli 2024–2025) staan in soft launch, vuurwapenaanvragen zijn al volledig digitaal.

### 2. Het decentralisatiestelsel is wettelijk verankerd maar fiscaal en operationeel onaf
Suriname heeft 10 districten, 62 ressorten en (afhankelijk van telling) 9 bestuursressorten, op grond van Decreet Ressortenindeling (S.B. 1987 No. 67), de Grondwet 1987 en de Wet Regionale Organen (S.B. 1989 No. 44). Drie politieke organen per district: districtscommissaris, districtsraad, ressortraad. Het Decentralization and Local Government Strengthening Program (DLGP), gefinancierd door IDB, kende fase I (2003-2008, SU0019) en fase II (2009-2014, SU-L1011) maar werd eind 2014 formeel afgesloten. De drie kerneenheden uit de evaluatie van Hernan Aspiazu (november 2014) — District Tax Law, Law on Financial Relations Central/Districts (District Equalization Fund), en update Artikel IV Wet Interim Financiële Decentralisatie — zijn nooit aangenomen door DNA. President Simons verklaarde op 19 augustus 2025 expliciet "Decentralisatie moet nu echt starten" en stelde op 22 december 2025 een Werkgroep Grondenrechten en Decentralisatie in. Een DLGP-III is nog niet door IDB goedgekeurd; de DLGP-stafmedewerkers (o.l.v. Mahender Pershad, Finance and Planning manager) werken vanuit het Ministerie van Regionale Ontwikkeling op overbruggingsbasis.

### 3. Nederland (Common Ground/MijnOverheid) en Estland (X-Road/e-Estonia) bieden complementaire referentiemodellen
**Nederland** levert het 5-lagen architectuurmodel van Common Ground (interactie, processen, integratie/FSC, services, data), MijnOverheid (Berichtenbox + Lopende Zaken + Persoonlijke Gegevens, beheerd door Logius, bijna 400 aangesloten organisaties), DigiD/eHerkenning, de Haven cloud-hosting standaard (Kubernetes-gebaseerd, pas-toe-of-leg-uit per 25 maart 2022), open source componenten zoals OpenZaak en Signalen, en zaakgericht werken (StUF/ZGW-API's). Signalen bedient 3 miljoen inwoners en verwerkt met 2.800 ambtenaren jaarlijks meer dan 800.000 meldingen (signalen.org). **Estland** levert X-Road (decentrale data exchange laag, open source MIT, beheerd door NIIS sinds 2017, wereldwijd ingezet met "hundreds of millions of end users" volgens x-road.global), de "once-only" datacollectie, KSI-blockchain voor integriteit, het e-ID/Mobile-ID/Smart-ID drieluik, e-Residency (132.000+ e-residents uit 185 landen per december 2025, e-resident.gov.ee), i-Voting (51% van stemmen in 2023 parlementsverkiezingen via internet — 312.181 elektronische stemmen vs. 301.000 papieren stemmen; valimised.ee/IPU Parline), VOLIS voor lokale raden, en het Data Embassy-concept (sinds 2017 met Luxemburg, juridisch verankerd via Verdrag van Wenen-analogie). Estland heeft 79 omavalitsus (gemeenten, na fusie 2017 van 213), Nederland 342 gemeenten — beide modellen schalen naar het Surinaamse niveau van 10 districten + 62 ressorten.

### 4. Connectiviteit is verrassend goed voor de kuststreek; het binnenland blijft een structurele uitdaging
Per DataReportal Digital 2026 Suriname: 503.000 internetgebruikers eind 2025 op een bevolking van 641.000 (78,4% penetratie); 149% mobiele connecties; 93,5% van mobiele verbindingen is 3G/4G/5G. Telesur heeft sinds 2010 de Suriname-Guyana Submarine Cable en sinds 2019 het Telesur National Broadband Project (TNBP) uitgerold. IDB project SU-L1076 (Bio-SWEET — Bioeconomy Empowerment in Suriname through Access to Water, Energy and Telecommunications, USD 46,5 miljoen, contract 29 januari 2025, uitvoerder N.V. Energiebedrijven Suriname) levert energie, water én telecommunicatie aan binnenlanddorpen via een CCLIP-envelop van USD 135 miljoen. SUR-IX (Internet Exchange Point) is operationeel sinds november 2022. Maar: in het binnenland (Sipaliwini, delen van Brokopondo/Marowijne) blijft connectiviteit fragiel, en taaldiversiteit (Nederlands officieel, Sranantongo lingua franca, plus Sarnami, Surinaams-Javaans, Saramaccaans, Aukaans/Ndyuka en inheemse talen) vereist een meertalige UX-strategie.

### 5. Het juridisch fundament voor digitalisering is nog onvolledig
De Ontwerpwet Bescherming Privacy en Persoonsgegevens staat op de DNA-website onder "Ontwerpwetten bij DNA → In behandeling → Burgerrechtelijk" en ligt sinds 2020 in behandeling zonder aanname. De wet voorziet onder Hoofdstuk VII in een Commissaris voor Persoonsgegevensbescherming als onafhankelijke autoriteit — die bestaat dus nog niet. Dagblad Suriname (4 juli 2025): "Ook ontbreekt een centrale autoriteit die toezicht houdt op alle digitale diensten." Bescherming steunt nu op artikel 187b Wetboek van Strafrecht. Zonder vastgestelde privacywet kan een X-Road-equivalent niet rechtmatig data uitwisselen tussen basisregisters.

---

## Details

### 1. Surinaamse context en juridisch kader

**Bestuurlijke structuur (artikel 159–163 Grondwet 1987; Wet Regionale Organen S.B. 1989 No. 44):**

| Bestuurslaag | Aantal | Politieke organen | Hoofd |
|---|---|---|---|
| District | 10 (Paramaribo, Wanica, Nickerie, Coronie, Saramacca, Commewijne, Marowijne, Para, Brokopondo, Sipaliwini) | Districtsraad (DR), Districtsbestuur | Districtscommissaris (door President benoemd) |
| Bestuursressort | 9 (Paramaribo NO + ZW; 7 in Sipaliwini) | — | Bestuursopzichter |
| Ressort | 62 (S.B. 1987 No. 67) | Ressortraad (RR) | RR-voorzitter |
| Binnenland | Stoelmanseiland, Atjoni, Apoera, Snesikondre | Traditionele gezagsdragers | Granman, kapitein, basja |

**Wetgevingsstack:**
- Grondwet artikel 159–163: democratische ordening op regionaal niveau, criteria voor gebiedsindeling (bevolkingsconcentratie, ontwikkelingspotentie, bestuurbaarheid, infrastructuur, locatie bestuurscentrum)
- Wet Regionale Organen (WRO) S.B. 1989 No. 44, gewijzigd S.B. 2005 No. 28 — bevoegdheden DC/DR/RR, art. 40 districtsfonds, art. 47 autonome bevoegdheden (secundaire/tertiaire wegen, openbare ruimten, brandpreventie, openbare gezondheid)
- Wet Interim Financiële Decentralisatie (S.B. 2003 No. 33) — interim-fase, niet voltooid
- Hinderwet (G. 1930 no. 64, gewijzigd S. 2001 no. 63) — vergunningverlening DC
- Reglement op het Beheer der Districten — historische basis
- Decreet Districtenindeling 1983 (S.B. 1983 No. 24); Decreet C-67A (S.B. 1985 No. 17)

**Sleutelinstituties:**
- **Ministerie van Regionale Ontwikkeling en Sport (ROS)** — beleidsministerie voor districten, binnenlandontwikkeling, inheemse en marronontwikkeling; minister Miquella Huur (2026)
- **Ministerie van Binnenlandse Zaken** — bevolkingsadministratie, ICT-beleid (e-ID)
- **CBB (Centraal Bureau voor Burgerzaken)** — Centrale Bevolkingsadministratie, e-paspoort, e-ID
- **MI-GLIS (Management Instituut voor Grondregistratie en Land Informatie Systeem)** — kadaster, perceelsidentificaties (Staatsbesluit 27 oktober 2016), Percelen Online ArcGIS
- **Kabinet van de President / Directoraat e-Government** — onder leiding van Llydion Dalfour (sinds september 2025); gov.sr-netwerk, Digitale-ID, PKI
- **De Nationale Assemblée (DNA)** — wetgevende macht, 51 leden
- **CLAD (Centrale Lands Accountantsdienst)** — government accounting

**Lessons learned uit DLGP I en II (Aspiazu-evaluatie 2014):**
1. *Wettelijk kader bleef incompleet*: District Tax Law en Law on Financial Relations Central/Districts (DEF) zijn na 2008 nooit door DNA aangenomen — fiscale autonomie ontbreekt nog steeds in 2026.
2. *Capaciteit gefragmenteerd*: Bureau Decentralisatie binnen ROS werd versterkt met computers, e-mail/internet en training, maar bleef onderbemand. Citizen Information Centers (CIC's) en Citizen Participation Plans (CPP's) werden in pilot-districten opgezet maar niet schaalbaar gemaakt.
3. *Begrotings- en financieel beheer*: Pilot-districten Paramaribo, Wanica, Nickerie, Para, Commewijne, Marowijne, Saramacca, Coronie, Brokopondo, Sipaliwini bereikten verschillende graden van certificering. De Centrale Begrotingsboekhouding (CBB, Ministerie van Financiën — niet te verwarren met Bureau voor Burgerzaken) blijft eindverantwoordelijk.
4. *GLIS-koppeling*: Kadastrale linkage tussen districten en GLIS was contractueel voorzien maar nooit volledig operationeel.

**Surinaamse context-uitdagingen:**
- **Binnenland-bereikbaarheid**: Sipaliwini omvat 4/5e van het land, direct bestuurd vanuit Paramaribo, met operationele bestuursressorten Paramacca (Snesikondre), Tapanahony (Stoelmanseiland), Boven-Suriname (Atjoni), Boven-Saramacca, Kabalebo (Apoera). Boven-Coppename en Coeroeni zijn niet operationeel.
- **Taaldiversiteit**: Nederlands (officieel), Sranantongo (lingua franca, ~95% spreekt), Sarnami Hindoestaans, Surinaams-Javaans, Saramaccaans, Aukaans/Ndyuka, Paramaccaans, Kwinti, Matawai, Carib (Kari'na), Arowak (Lokono), Trio, Wayana.
- **Internetpenetratie**: 78,4% nationaal maar veel lager in binnenland; mobile-first is dus geen optie maar noodzaak.
- **Financiering**: IMF-traject (EFF gestart 2021), begrotingstekort historisch hoog; macro-fiscale stabiliteit prioriteit IDB-Country Strategy 2021-2025.

### 2. Internationale referentiemodellen

#### Nederland — Common Ground / MijnOverheid / Haven

**MijnOverheid architectuur (beheerd door Logius, BZK):**
- Authenticatie via DigiD (gebruikersnaam/wachtwoord + sms, of DigiD-app met biometrie/pincode; substantieel/hoog via NFC ID-scan)
- **Berichtenbox**: persoonlijke digitale brievenbus voor post van bijna 400 aangesloten organisaties (Belastingdienst, DUO, SVB, UWV, RDW, gemeentes, waterschappen); werkt op basis van BSN; PKIoverheid-certificaten; formeel rechtsgevolg
- **Lopende Zaken**: statusvolging van aanvragen via koppelingen met zaaksystemen — vereist zaakgericht werken bij aansluitende organisatie
- **Persoonlijke Gegevens**: BRP, kentekens (RDW), WOZ-waarde, pensioenoverzicht
- Push-notificaties via Berichtenbox-app; e-mailmeldingen; DigiD Machtigen voor mantelzorgers/familie
- Elke Nederlander ≥14 jaar heeft automatisch een MijnOverheid-account

**Common Ground 5-lagenmodel (VNG, 2017):**
1. **Interactie** (websites, apps, formulieren — Vue/React/Angular)
2. **Processen** (workflow, BPMN; OpenZaak voor zaakgericht werken)
3. **Integratie** (FSC — Federatieve Service Connectiviteit, opvolger van NLX, sinds 2025 standaard)
4. **Services** (microservices, REST/OAS API's)
5. **Data** (bronregisters, géén kopieën)

Kernprincipe: "data bij de bron bevragen, niet kopiëren". Concrete bouwstenen:
- **OpenZaak**: open source ZGW-API's voor zaakgericht werken
- **Signalen** (gemeente Amsterdam, open source via Foundation for Public Code): meldingen openbare ruimte met machine learning categorisatie; bedient 3 miljoen inwoners en verwerkt met 2.800 ambtenaren jaarlijks meer dan 800.000 meldingen (signalen.org)
- **OpenZaakbrug** (VNG/Dimpact/WeAreFrank!): migratiebrug StUF → ZGW-API's

**Haven cloud-standaard (VNG bestuur 25 maart 2022, pas-toe-of-leg-uit):**
- Platform- en leveranciersonafhankelijke Kubernetes-configuratie
- Een applicatie die op één Haven-omgeving draait, werkt op alle andere
- Wordt bouwsteen van de Generieke Digitale Infrastructuur (GDI) via Meerjarenprogramma Infrastructuur Digitale Overheid (MIDO)
- Haven Compliancy Checker; referentie-implementaties bij Previder, Fundaments
- Toepassingen: Signalen, Huishoudboekje, Registratie toeristische verhuur

**Standaarden:**
- StUF 3.01 (SOAP-gebaseerd, legacy) → ZGW-API's (REST-gebaseerd, modern)
- Documentcreatieservices 1.1 (StUF Regiegroep, 2 april 2014)
- Zaak- en Documentservices (StUF-ZKN + CMIS)
- GEMMA referentiearchitectuur
- Basisregistraties: BRP, BAG, BRT, BRK, BGT, WOZ, NHR, BLAU

**Concrete burgerservice-voorbeelden uit Nederland:**
- Verhuisaangifte: digitaal via gemeente, automatisch naar BRP
- Geboorteaangifte: binnen 3 dagen, in gemeente van geboorte
- Paspoort/ID-kaart: afspraak via gemeente, biometrie ter plaatse
- Bouwvergunning: via DSO (Digitaal Stelsel Omgevingswet)
- Meldingen openbare ruimte: via gemeentelijke MOR-systemen (vaak Signalen)
- Belastingen: gemeentelijke heffingen via gemeente; Rijksbelastingen via Belastingdienst.nl

#### Estland — e-Estonia / X-Road / VOLIS

**X-Road (X-tee):**
- Ontwikkeld 2001 door Estonian Information System Authority (RIA)
- Sinds 2017 onder Nordic Institute for Interoperability Solutions (NIIS), opgericht door Estland en Finland; sinds 2018 ook IJsland
- Open source MIT-licentie, gratis beschikbaar
- Decentrale data exchange laag: organisaties hebben elk een Security Server, Central Services coördineren registratie, certificaten en time-stamping
- Geen blockchain in X-Road zelf (CTO Petteri Kivimäki, 2018) — wél KSI-blockchain voor data-integriteit van Estse registers
- Wereldwijd ingezet met "hundreds of millions of end users" (x-road.global); gedocumenteerde implementaties o.a. Estland (X-tee), Finland (Suomi.fi), IJsland (Straumurinn), Cambodja (CamDX, 2020), Argentinië, Japan, Duitsland, Faröer, Namibië (UXP-variant via Cybernetica)

**e-Identity stack:**
- ID-kaart sinds 2002, verplicht; 384-bit ECC public key encryptie; 2 PIN's (PIN1 voor authenticatie, PIN2 voor digitale handtekening — wettelijk gelijk aan handgeschreven)
- Mobile-ID (SIM-card gebaseerd)
- Smart-ID (mobiele app sinds 2017)
- e-Residency sinds 2014; 132.000+ e-residents uit 185 landen per december 2025 (e-resident.gov.ee blog 'Interesting e-resident stats to celebrate our 11th anniversary')
- eIDAS-conform; identity wallets onder eIDAS 2

**i-Voting:**
- Sinds 2005 (eerste land ter wereld); 2023: 51% van stemmen via internet (312.181 elektronische stemmen vs. 301.000 papieren stemmen; valimised.ee/IPU Parline) — "For the first time since the introduction of e-voting in 2005, more electronic votes (51%) were cast than paper votes (49%)."
- Cryptografische verificatie via ElGamal/mixnet; ID-card + PIN2
- 7-daags vroegstemmen-venster; stemwijziging onbeperkt mogelijk
- Tijdsbesparing: ~11.000 werkdagen / EUR 504.000 in parlementsverkiezingen 2011

**Belangrijke e-services:**
- e-Tax (sinds 2000, ~99% online aangiften, gemiddeld 3 minuten)
- e-Health / Patient Portal (Digilugu, opgevolgd door Health Portal 2024)
- e-School
- e-Prescription (sinds 2010)
- e-Cabinet voor regeringsbesluitvorming
- e-Business Register
- e-File (justitie)
- RIHA (catalogus van interoperability resources — verplicht voor alle publieke databases)
- Once-only principle (wettelijk verankerd: dezelfde data niet meerdere keren ophalen)

**VOLIS (Kohaliku omavalitsuse volikogu/valitsuse infosüsteem):**
- Pilot Jõgeva, 11 juni 2010, gefinancierd door EU ERDF, gecoördineerd door Ministerie van Binnenlandse Zaken
- Live-streaming raadsvergaderingen
- Agenda, notulen, stemming, dossiers
- Ingelogd via ID-card of Mobile-ID
- Burgers kunnen zonder login meekijken
- Na de Estse gemeentelijke fusie 2017: 79 omavalitsus (van 213)

**Data Embassy:**
- Wereldprimeur Estland-Luxemburg, verdrag 20 juni 2017 (ondertekend door PM Ratas/Bettel), geratificeerd door Riigikogu
- Datacenter in Betzdorf, Luxemburg; soeverein gebied conform Verdrag van Wenen-analogie
- Budget: EUR 2,2 miljoen totaal, EUR 236.000 jaarlijks, 85% gefinancierd door EU ERDF
- Sindsdien: Monaco bij Luxemburg (2021); India en Bahrein hebben programma's aangekondigd
- Bevat back-ups van kritieke databases én staat operationele recovery toe

**Lessons learned uit 25 jaar e-Estonia:**
1. *Start klein, schaal slim*: X-Road begon in 2001 met enkele ministeries
2. *Politieke continuïteit*: meerdere kabinetten droegen door (Laar, Ansip, Ratas, Kallas)
3. *Verplichte digitale ID*: vereist voor 99% van diensten
4. *Wetgeving als enabler*: Digital Signatures Act 2000, Public Information Act, Cyber Security Act
5. *RIA als coördinerende autoriteit*: technische én beleidsmatige regie
6. *Open source én publiek-private samenwerking* (Cybernetica voor UXP, NIIS voor X-Road)
7. *AI-services*: ~50 AI-toepassingen in publieke sector
8. *Cybersecurity-resilientie* na cyberaanval 2007 (Rusland)

### 3. Core features van het geïntegreerde platform

#### Burgerportaal "MijnSuriname" (voor 503.000+ internetgebruikers en groeiend)

| Feature | Equivalent NL/EE | Surinaamse bron-koppeling |
|---|---|---|
| Identiteit & authenticatie | DigiD / Estonian eID | Digitale-ID Government Authenticator + CBB e-ID kaart (Vlatacom-chip) |
| Berichtenbox | MijnOverheid Berichtenbox | Nieuw te bouwen, gekoppeld aan ministeries + DC-kantoren |
| Lopende Zaken | MijnOverheid Lopende Zaken | Koppeling met S-Road via zaaksystemen |
| Identiteitsdocumenten | gemeente paspoortaanvraag | Burgerzaken.gov.sr e-loket — uitbreiden met afspraak + voortgang |
| Aangiftes (geboorte/overlijden/huwelijk) | gemeente / Riigikogu | CBB-frontend, integratie met Burgerlijke Stand |
| Verhuisaangifte | gemeente | CBB Bevolkingsregister (CBA) — momenteel face-to-face bij BvB |
| Rijbewijs aanvragen/verlengen | RDW / Estonian PPA | Reeds in soft-launch via samenwerking KPS + e-Gov (juli 2024–2025) |
| Belastingen (district) | gemeentelijke OZB | Districtsbelasting (afhankelijk van District Tax Law) |
| Meldingen openbare ruimte | Signalen NL | Surinaamse "Signalen-SR" implementatie (open source, NL-fork) |
| Vergunningen (bouw, hinderwet, kapvergunning, evenementen) | DSO Omgevingswet | DC-loket integratie, GIS-koppeling MI-GLIS |
| Subsidieaanvragen | rijks/gemeentelijk | Districtsfonds-aanvragen (Wet Fid art. 40) |
| Participatie & raadplegingen | Rahvaalgatus.ee | Ressortraad-hoorzittingen digitaal beschikbaar |
| Open data dashboards | data.overheid.nl | Per district/ressort KPI's |
| Klachten en bezwaren | gemeentelijk | Zaaktype "klacht/bezwaar" |

**Meertaligheid (minimum)**: Nederlands (default), Engels (vereist door internationale gebruikers), Sranantongo (basisfunctionaliteit), met op termijn Saramaccaans en Aukaans voor binnenland-gemeenschappen.

#### Bestuurlijk/intern platform "BestuurSR"

| Module | Functie | Referentie |
|---|---|---|
| Zaaksysteem | Case management, workflow, audit trail | OpenZaak (NL) als startpunt |
| Vergadermodule | Agenda, notulen, besluiten, stemming RR/DR | VOLIS (EE) |
| Document Management (DMS) | Versiebeheer, archiefwet-compliant | Alfresco / Nextcloud + CMIS |
| Budget- en financieel beheer | Wet Fid, Districtsfonds, jaarrekening | Maatwerk + ERP-koppeling Ministerie van Financiën |
| HR & personeel | DC-kantoor staf | OpenSource HR (OrangeHRM) |
| Project- en programmamanagement | DLGP-projecten, infrastructuur | OpenProject + GIS-koppeling |
| GIS | Ruimtelijke ordening, percelen, wegen | MI-GLIS ArcGIS Percelen Online + QGIS-frontend |
| Interbestuurlijke samenwerking | DC ↔ ministeries ↔ DNA | S-Road plus Berichtenbox-equivalent |
| Rapportages en BI | KPI's per district/ressort | Metabase / Superset |
| Asset management | Voertuigen, gebouwen, infra | Snipe-IT open source |
| Communicatie/publicatie | District-websites, bekendmakingen | Drupal/WordPress + open standaard publicatie |

#### Cross-cutting features
- **Single Sign-On (SSO)** via OpenID Connect / SAML 2.0 — koppeling met Digitale-ID
- **S-Road (Surinaamse X-Road)**: open source X-Road v7 deployment, beheerd door een nieuw op te richten Suriname Interoperability Solutions Institute (SISI) of belegd bij e-Government
- **Notificaties**: e-mail (SMTP via PKI-overheid certificaten), SMS (Telesur/Digicel APIs), push (mobiele app), WhatsApp Business API (gezien hoge WhatsApp-penetratie in Suriname)
- **Mobile-first responsive design** + Progressive Web App + native iOS/Android voor offline-modus binnenland
- **Toegankelijkheid**: WCAG 2.1 AA (in lijn met Estonia's toegankelijkheidsbeleid en NL Tijdelijk Besluit Digitale Toegankelijkheid)
- **Analytics**: privacy-friendly (Matomo/Plausible), GDPR/PDP-conform

### 4. Architectuur en technisch blauwdruk

#### Hoog-niveau referentiearchitectuur (gebaseerd op Common Ground 5-lagen)

```
┌─────────────────────────────────────────────────────────────────┐
│  LAAG 1: PRESENTATIE                                              │
│  MijnSuriname-portaal | District-websites | BestuurSR-werkplek    │
│  Mobile apps (iOS/Android, PWA) | Chatbots                        │
├─────────────────────────────────────────────────────────────────┤
│  LAAG 2: PROCESSEN                                                │
│  BPMN workflows | Zaakgericht werken | Vergaderingen | Vergunning │
├─────────────────────────────────────────────────────────────────┤
│  LAAG 3: INTEGRATIE — S-ROAD                                      │
│  Security Server per ministerie/DC | Central Services | Time-     │
│  stamping | Certificate Authority (NL/EE-model)                   │
├─────────────────────────────────────────────────────────────────┤
│  LAAG 4: SERVICES                                                 │
│  REST APIs (OAS 3.0) | OAuth2/OIDC | Identity Provider (Digitale- │
│  ID) | Notification Service | Document Service | Payment Service  │
├─────────────────────────────────────────────────────────────────┤
│  LAAG 5: DATA — Basisregisters                                    │
│  CBB/CBA (persoon) | MI-GLIS (perceel) | Bedrijven (KKF) |        │
│  Adressen (toe te bouwen) | Voertuigen (KPS) | Belastingen (BD)   │
├─────────────────────────────────────────────────────────────────┤
│  INFRA: Soevereine cloud (NL-Haven-equivalent) + Data Embassy DR  │
└─────────────────────────────────────────────────────────────────┘
```

**Architectuurkeuzes:**
1. **API-first, modular monolith voor MVP, microservices waar schaal het rechtvaardigt** — Suriname's volume (641.000 inwoners, 10 districten) rechtvaardigt geen volledige microservices-explosie; volg het PKB-principe (Pacing, KISS, Bottom-up).
2. **Open source-first** zoals Estland NIIS en Nederland VNG — vermijdt vendor lock-in, kritisch voor een land met beperkte deviezen.
3. **S-Road**: deploy X-Road v7 open source vanaf NIIS, conform "Independent X-Road instance" model uit het NIIS-blog (Petteri Kivimäki, 30 maart 2020). Concrete stappen: bilaterale MoU met NIIS / e-Governance Academy Estland.
4. **Master Data Management**:
   - **Personenregister**: CBB Centrale Bevolkingsadministratie (CBA) als single source of truth — uitbreiden met BSN-equivalent (CBB-ID-nummer bestaat al)
   - **Bedrijvenregister**: Kamer van Koophandel en Fabrieken (KKF) — modernisering vereist
   - **Adressen**: nieuw te bouwen "Basisregistratie Adressen Suriname (BAS)" — gebaseerd op GLIS Perceel-ID + DC-toewijzing
   - **Percelen**: MI-GLIS (sinds Staatsbesluit 27 oktober 2016 verplichte PerceelsID)
5. **Beveiliging**: zero-trust, mTLS via S-Road, encryptie at-rest (AES-256) en in-transit (TLS 1.3), audit logging (immutable, eventueel KSI-blockchain notarisatie van log-hashes), security-by-design (NIS2/BIO-aligned)
6. **DevSecOps**: GitLab CI/CD, SBOM verplicht, OWASP ZAP/Trivy in pipeline
7. **Cloud-strategie — hybrid sovereign cloud**:
   - Primair: lokale datacenters in Paramaribo (bv. Telesur/EBS/Datacenter Suriname)
   - DR: Data Embassy in bevriend land (logische kandidaten: Nederland, Brazilië, of CARICOM-partner zoals Trinidad)
   - Beleid: "data-soevereiniteit by default" — persoonsgegevens nooit buiten Surinaams jurisdictiegebied zonder verdragsmatige bescherming
8. **Schaalbaarheid/resilience binnenland**: offline-first apps met store-and-forward synchronisatie via S-Road wanneer connectiviteit terugkeert; eventueel LoRaWAN-gebaseerde messaging in Boven-Suriname/Tapanahony
9. **Standaarden**: REST/JSON, OAS 3.0, OAuth2/OIDC, SAML 2.0, eIDAS-vergelijkbaar voor identiteitsniveaus (laag/substantieel/hoog)

#### KSI-blockchain en register-integriteit
Voor registers zoals Burgerlijke Stand (geboorte, overlijden, huwelijk) en perceelregister GLIS — waar manipulatie politieke/economische gevolgen heeft — overwegen KSI-stijl notarisatie (zoals Guardtime/Estonia). Geen volledige blockchain-database, maar hash-anchoring van logverkeer in een onafhankelijk ledger.

### 5. Organisatorische inrichting en governance

**Eigenaar/opdrachtgever:**
- **Bestuurlijk**: Kabinet van de President (President als Voorzitter Digitale Transformatie Stuurgroep), Minister van Binnenlandse Zaken, Minister van Regionale Ontwikkeling en Sport
- **Uitvoerend**: Directoraat e-Government (directeur Llydion Dalfour) → om te schalen tot **"e-Suriname Agentschap"** met eigen rechtspersoonlijkheid en meerjarenbegroting, analoog aan Estse RIA en Nederlandse Logius
- **Inhoudelijk**: nieuw op te richten **S-Road Stichting / SISI (Suriname Interoperability Solutions Institute)** voor X-Road beheer (analoog NIIS); kan starten als unit binnen e-Government

**Governance-model:**

| Niveau | Orgaan | Frequentie | Samenstelling |
|---|---|---|---|
| Strategisch | Nationale Digitale Stuurgroep | Kwartaal | President (vz), MinBiza, MinROS, MinFin, MinJustitie, DNA-voorzitter, IDB-vertegenwoordiger |
| Tactisch | Regiegroep e-Suriname | Maandelijks | Directeur e-Gov, secretarissen-generaal, DC-vertegenwoordigers (rouleerend) |
| Operationeel | Technische werkgroepen | Wekelijks | Architecten, productowners, security, leveranciers |
| Districtelijk | Districtelijke Implementatie Teams | Wekelijks tijdens uitrol | DC, districtssecretaris, ICT-coördinator, RR-voorzitters |

**Capaciteitsopbouw:**
- ICT-academy bij Anton de Kom Universiteit + Polytechnic College Suriname; partnerschap met TalTech (Estland) en TU Delft
- Cisco Networking Academy via e-Gov (reeds aangekondigd)
- Junior/senior software engineers vacatures bij MI-GLIS reeds open — uitbreiden
- "Open source citizenship": gemeenten/districten kunnen zelf bijdragen aan codebase
- Train-de-trainer voor ressortraad-leden in basis-ICT en VOLIS-gebruik

**Public-private partnerships:**
- Telesur, Digicel — connectiviteit binnenland
- Nederlandse leveranciers (Atabix, Centric, Cegeka, PinkRoccade, Dimpact) voor componenten en expertise via VNG International / Connecting Suriname
- Estlandse leveranciers (Cybernetica, Nortal, Helmes) voor X-Road implementatie
- Vlatacom (Servië) voor e-ID/e-paspoort infrastructuur — reeds gecontracteerd voor materialen

**Internationale samenwerking:**
- **IDB**: opvolger voor DLGP I/II (mogelijke DLGP-III binnen Country Strategy 2026-2030), aanvullend op SU-L1076 Bio-SWEET en bestaande publieke management-projecten
- **UNDP**: Digital Readiness Assessment (reeds uitgevoerd voor NDS 2023-2030) → vervolgsupport
- **EU**: via Caribbean Investment Facility / Global Gateway voor digitale soevereiniteit
- **Nederland**: VNG International, Logius kennisuitwisseling, ambassade Paramaribo (post staatsbezoek december 2025)
- **Estland**: e-Governance Academy (Tallinn) levert standaard 5-daagse training; NIIS-lidmaatschap als eventueel doel
- **CARICOM**: regionale interoperabiliteit (eLAC2026, CARICOM ICT Strategy)
- **Wereldbank**: Digital Public Infrastructure-financiering

### 6. Fasering en roadmap (5 jaar, 60 maanden)

| Fase | Periode | Doelen | Deliverables | Indicatieve kosten (USD) |
|---|---|---|---|---|
| **Fase 0 — Voorbereiding & Governance** | 0–6 mnd | Wetgeving, stuurgroep, architectuurprincipes, financiering veiligstellen | Aanname Wet Bescherming Privacy en Persoonsgegevens; oprichting e-Suriname Agentschap; MoU met NIIS en VNG; Architectuur Principes Document; financieringsplan IDB/UNDP/EU | 1,5–2,5 mln (consultancy, juridisch, training) |
| **Fase 1 — Foundation** | 6–18 mnd | Digitale identiteit op stoom, basisregisters geharmoniseerd, S-Road MVP, MijnSuriname MVP | S-Road v7 productiedeployment met 5 ministeries; CBB/MI-GLIS/KKF als bronregisters gekoppeld; MijnSuriname portaal met Berichtenbox + Persoonlijke Gegevens; Signalen-SR pilot in Paramaribo | 8–12 mln |
| **Fase 2 — Core services** | 18–36 mnd | Kerndiensten burger, zaaksysteem DC, ressortraad-module | Vergunningen-flow voor 4 vergunningstypen; verhuisaangifte digitaal; OpenZaak-SR bij DC's Wanica, Para; VOLIS-SR voor 10 ressortraden; meldingen openbare ruimte landelijk; lopende zaken | 12–18 mln |
| **Fase 3 — Uitbreiding** | 36–48 mnd | Volledige uitrol 10 districten + 62 ressorten, GIS-integratie, financieel, BI | Alle DC's en RR's aangesloten; GIS-koppeling MI-GLIS productie; budget/financieel beheer Wet Fid-conform; BI-dashboards per district; districtsbelasting-module | 8–12 mln |
| **Fase 4 — Optimalisatie & Innovatie** | 48–60 mnd | AI, predictive, proactive services, volledige integratie | AI-classificatie meldingen (à la Signalen NL); proactive services (geboorte → automatische registratie kinderbijslag); i-Voting pilot (lokale verkiezingen); Data Embassy operationeel | 5–8 mln |
| **Totaal 5 jaar** | | | | **35–55 mln** |

**KPI's per fase:**

| KPI | T0 (2026) | Eind Fase 1 (2028) | Eind Fase 3 (2030) |
|---|---|---|---|
| % burgers met Digitale-ID account | <10% | 30% | 70% |
| % gemeenten/DC's gedigitaliseerd | 0% | 30% (3/10) | 100% (10/10) |
| Aantal ressortraden met VOLIS-SR | 0 | 10/62 | 62/62 |
| Gemiddelde doorlooptijd uittreksel | 1–5 dagen | <1 dag | <1 uur |
| % aangiftes digitaal | <5% | 30% | 75% |
| Open data datasets gepubliceerd | <20 | 100 | 500 |
| Connected basisregisters via S-Road | 0 | 5 | 15 |
| Klanttevredenheid (NPS) | n.v.t. | +20 | +40 |

### 7. Risico's en mitigaties

| Risico | Impact | Waarschijnlijkheid | Mitigatie |
|---|---|---|---|
| **Politiek**: regeringswisselingen verstoren continuïteit (President Simons-kabinet sinds juli 2025) | Hoog | Hoog | Verankering in wet (e-Suriname Agentschap-wet, vergelijkbaar met SVB/UWV-status), DNA-breed gedragen meerjarenplan, internationale verdragen (Data Embassy MoU's) als bindende afspraken |
| **Financieel**: IMF-traject, beperkte fiscale ruimte | Hoog | Hoog | Faseren in IDB-leningen (concessionele rente SOFR-based), multi-donor pooling, ROI-modellen tonen (Estland: significante tijdsbesparing per burger per jaar via once-only-principe) |
| **Technisch**: legacy systemen, fragmentatie | Hoog | Hoog | API-strangler-patroon: nieuwe S-Road services ervoor; legacy uitfaseren in 3-5 jaar; verplicht zaakgericht werken voor nieuwe systemen |
| **Ontbrekende basisregisters**: geen BAG-equivalent, KKF gefragmenteerd | Hoog | Hoog | "Basisregistratie Adressen Suriname (BAS)" opzetten in Fase 1 in samenwerking MI-GLIS + DC's |
| **Adoptie**: digitale geletterdheid laag, vooral binnenland | Middel | Hoog | Multi-channel: papier blijft beschikbaar (via DC-loket); ressortraad-leden trainen als digitale ambassadeurs; meertalige UX |
| **Cybersecurity**: aanvallen, Suriname is doelwit door olie/gas-strategisch belang | Hoog | Middel | National CSIRT versterken, jaarlijkse pentests, Data Embassy voor DR, KSI-anchoring kritieke registers, partnerschap met TS-CERT.EE |
| **Data privacy / vertrouwen**: zonder vastgestelde privacywet geen rechtsgrond voor data-uitwisseling | Hoog | Hoog | Fase 0 absolute prioriteit: aanname Ontwerpwet Bescherming Privacy en Persoonsgegevens + installatie Commissaris voor Persoonsgegevensbescherming, vóór S-Road productie |
| **Capaciteit**: ICT-talent emigreert | Middel | Hoog | Loonschalen e-Suriname Agentschap competitief, retentiebonussen, opleidingsprogramma's, diaspora-talent (Surinamers in NL/USA als adviseurs) |
| **Vendor lock-in**: hyperscalers, propriëtaire suites | Middel | Middel | Haven-stijl pas-toe-of-leg-uit; open source-first inkoop; portability als aanbestedingscriterium |
| **Taal & inclusie binnenland** | Middel | Middel | UX-onderzoek met Saramaccaanse/Aukaanse gemeenschappen; pictogram-zware design; voice-interface in Sranantongo |

### 8. Concrete succes-KPI's (samenvattend)

**Adoptie:**
- 70% van volwassenen heeft een actieve Digitale-ID in 2030
- 50% van transacties met de overheid verloopt digitaal (default) in 2030
- 80% klanttevredenheid (CSAT) over digitale dienstverlening

**Doorlooptijden:**
- Uittreksel: 5 dagen → 1 uur (digitaal direct)
- Bouwvergunning eenvoudig: 90 dagen → 30 dagen
- Verhuisaangifte: 3 dagen → real-time
- Aanvraag districtsfondssubsidie: 60 dagen → 14 dagen

**Kostenbesparingen:**
- 30% efficiencywinst bij DC-administratie
- Once-only-effect: significante tijdsbesparing per burger per jaar (Estland-benchmark)
- 15% reductie papier- en kopieerkosten centrale overheid

**Transparantie:**
- 500+ open datasets per 2030
- 100% raadsbesluiten DR/RR online toegankelijk
- Real-time begrotingsuitvoering districten zichtbaar

**Inclusie:**
- 90% binnenland-dorpen heeft minimaal een lokale digitale touchpoint (community ICT-punt of mobiele eenheid)
- Volledige WCAG 2.1 AA compliance

### 9. Concrete aanbevelingen — Top 10 om te starten

1. **Verschuif politieke energie naar het aannemen van de Ontwerpwet Bescherming Privacy en Persoonsgegevens binnen Q3 2026** — zonder dit kan geen S-Road, geen volwaardig burgerportaal en geen data-uitwisseling tussen CBB, MI-GLIS, KKF en DC's juridisch verantwoord worden gebouwd. Stel tegelijk een onafhankelijke Commissaris voor Persoonsgegevensbescherming aan (Hoofdstuk VII van de ontwerpwet).

2. **Schaal het Directoraat e-Government op tot een onafhankelijk "e-Suriname Agentschap"** met eigen rechtspersoonlijkheid, meerjarenbegroting en mandaat over alle ministeries — model: Estonian Information System Authority (RIA) + Nederlandse Logius. Onderwerp aan wettelijke borging via een aparte instellingswet.

3. **Onderteken een Memorandum of Understanding met NIIS (Nordic Institute for Interoperability Solutions, Tallinn)** voor X-Road v7 implementatie. Start met een 5-daagse training bij e-Governance Academy en richt een nationale "S-Road" unit op binnen e-Suriname.

4. **Initieer onmiddellijk een formeel verzoek aan IDB voor een DLGP-III ("Decentralization 3.0: Digital")** als opvolger van SU0019 (DLGP-I) en SU-L1011 (DLGP-II), uit te voeren door Ministerie van Regionale Ontwikkeling en Sport, met expliciete IT-componenten — geïntegreerd met de IDB Country Strategy 2026–2030.

5. **Bouw een minimaal "MijnSuriname" burgerportaal in 12 maanden** met drie functies: Berichtenbox (à la MijnOverheid), Persoonlijke Gegevens (CBA + GLIS-uittreksel + KKF) en Digitale-ID single sign-on. Hergebruik open source componenten van Logius en VNG; vraag Logius om kennisuitwisseling via Nederlandse Ambassade Paramaribo.

6. **Implementeer "Signalen-SR" als pilot in district Paramaribo en Wanica binnen 9 maanden** — open source fork van gemeente Amsterdam Signalen via Foundation for Public Code, met machine-learning categorisatie aangepast aan Sranantongo en lokale categorieën (drainage, kapvergunningen, hinderwetklachten).

7. **Maak MI-GLIS, CBB en KKF tot officiële "basisregisters"** via een Staatsbesluit Basisregisters Suriname, met afdwingbare datakwaliteitsnormen, hergebruikplicht (once-only) en gepubliceerde API-specificaties. Vereis dat alle ministeries en DC's data via deze registers ophalen, niet kopiëren.

8. **Selecteer twee pilot-districten — Wanica en Para — voor end-to-end implementatie van het bestuurlijk platform** (zaaksysteem OpenZaak-SR, vergadermodule VOLIS-SR voor ressortraden, GIS-koppeling, financieel beheer Wet Fid). Schaal pas op na een succesvolle 6-maandse validatie. Volgt het beproefde DLGP-II piloteringsmodel (Aspiazu, 2014).

9. **Sluit een Data Embassy-overeenkomst met een bevriend land** (Nederland is logisch gezien historie en juridische verwantschap; Brazilië/Trinidad als CARICOM-optie). Bevat back-ups van CBA, BS-akten en MI-GLIS perceelregister onder Wenen-Conventie-analoge bescherming. Budget richtlijn: USD 1,5–3 miljoen eenmalig + USD 250.000/jaar (Estonia-Luxemburg benchmark: EUR 2,2 miljoen totaal + EUR 236.000 jaarlijks).

10. **Verklaar "Haven-Suriname" tot cloud-hosting standaard binnen 12 maanden** — gebaseerd op de VNG Haven-Kubernetes-configuratie, pas-toe-of-leg-uit principe. Verplicht dat alle nieuwe overheids-cloud uitvragen Haven-compatible zijn; werk met lokale providers (Telesur, Datacenter Suriname) plus desnoods Europese hyperscalers met EU-soevereiniteit. Voorkomt vendor lock-in en faciliteert hergebruik van Nederlandse Common Ground componenten.

---

## Recommendations (gefaseerd, met benchmarks)

**Onmiddellijk (0–3 maanden):**
- Politiek mandaat verkrijgen via Presidentieel Besluit "Digitale Transformatie Suriname"
- Inrichting Nationale Digitale Stuurgroep (zie governance hierboven)
- Onderhandeling met DNA voor versnelde behandeling Ontwerpwet Bescherming Privacy en Persoonsgegevens — benchmark: aanname Q3 2026
- IDB / UNDP / Nederlandse Ambassade benaderen voor Fase 0 financiering (USD 1,5–2,5 miljoen)
- MoU met NIIS en e-Governance Academy

**Korte termijn (3–12 maanden):**
- e-Suriname Agentschap-wet ontwerpen en aanbieden DNA
- Architectuur Principes Document publiceren (open consultatie)
- S-Road v7 pilot deployment met 3 ministeries (BiZa, MinFin, ROS) + 1 DC (Wanica)
- MijnSuriname MVP live met Berichtenbox + Lopende Zaken
- Benchmark: ≥5.000 actieve gebruikers van MijnSuriname binnen 6 maanden van go-live

**Middellange termijn (12–36 maanden):**
- 5 burgerdiensten end-to-end digitaal: uittreksel, verhuisaangifte, rijbewijsverlenging, vergunning eenvoudig, melding openbare ruimte
- 4 DC's met OpenZaak-SR (Wanica, Para, Nickerie, Commewijne)
- 20 ressortraden met VOLIS-SR
- Benchmark: 50% van DC-aanvragen digitaal ontvangen

**Lange termijn (36–60 maanden):**
- Volledige uitrol 10 districten / 62 ressorten
- Proactive services (geboorte → automatische registraties)
- Data Embassy operationeel
- Eerste i-Voting pilot voor ressortraadverkiezingen 2030

**Triggers voor herevaluatie (drempels die strategie zouden veranderen):**
- Privacywet niet aangenomen vóór Q4 2026 → S-Road productie uitstellen, juridische "minimale" private contracten gebruiken
- IDB-financiering DLGP-III niet rond Q2 2027 → alternatief consortium UNDP+EU+NL
- Binnenland connectiviteit blijft onder 30% in 2028 → meer investeren in offline-first apps, gemeenschappelijke ICT-punten met satelliet (Starlink na regulering)
- Adoptie MijnSuriname onder 100.000 gebruikers in 18 maanden → UX-revisie, marketingcampagne, mogelijk verplichtstelling Digitale-ID voor specifieke diensten (volgens beleidslijn die door e-Government in 2025 reeds is aangekondigd)

---

## Caveats

- **DLGP-III bestaat formeel nog niet**: IDB heeft geen derde fase Decentralization-lening goedgekeurd. Het Ministerie van Regionale Ontwikkeling onderhoudt een DLGP-secretariaat op binnenlandse middelen (Pershad et al., presentatie aan minister Huur, 19 februari 2026). De aanduiding "DLGP fase III" in dit rapport is een aanbeveling, geen bestaande financiering.
- **Wet Regionale Organen is geheel intact maar niet geüpdated voor digitale tijd**: een wijzigingswet zou expliciet digitale agenda's, raadsvergaderingen, hoorzittingen en bekendmakingen moeten faciliteren.
- **Cijfers en datums**: het exacte aantal dorpen in IDB SU-L1076 Bio-SWEET (USD 46,5 miljoen) komt uit derde partij (TS2.tech: ~50 dorpen) — primaire IDB-document verwijst breder naar "binnenland gemeenschappen"; verifieer voor offerteaanvragen via de Loan Proposal PDF.
- **e-Government leiderschap is recent gewijzigd**: directeur Llydion Dalfour sinds september 2025; continuïteit van beleid afhankelijk van politieke borging.
- **Het Bureau voor Burgerzaken (BvB) versus de Centrale Begrotingsboekhouding (CBB)**: in dit rapport gebruiken we "CBB" consistent voor Centraal Bureau voor Burgerzaken; de Centrale Begrotingsboekhouding van Financiën heeft géén relatie met dit programma maar wordt soms verwarrend met dezelfde afkorting aangeduid.
- **Connectiviteit-cijfers**: 78,4% internetpenetratie (DataReportal Q4-2025) is hoog voor de regio maar overschat ruraal gebruik; werkelijke effectieve toegang in Sipaliwini en Boven-Suriname is veel lager.
- **i-Voting** wordt door externe security experts (incl. team Halderman 2014) bekritiseerd; pilot pas adopteren na onafhankelijke audit en publieke consultatie.
- **Data Embassy juridisch novum**: rechten en immuniteiten via Wenen-Conventie-analogie zijn niet universeel erkend; vereist bilateraal verdrag dat DNA moet ratificeren.
- **Kostenramingen** zijn indicatief, gebaseerd op vergelijkbare landenprojecten (Estland NIIS-implementaties, IDB digitale projecten in Caribische staten) — werkelijke kosten hangen af van aanbesteding, hergebruik van open source en hoeveelheid in-house ontwikkeling.
- **Het Nationaal Digital Strategy 2023-2030 heeft geen aparte begrotingsallocatie**: financiering verloopt piecemeal via individuele IDB/UNDP-operaties en ministeriële budgetten. Dit beperkt de coördineerbare investeringscapaciteit en versterkt het argument voor een autonoom e-Suriname Agentschap met eigen meerjarig budget.
