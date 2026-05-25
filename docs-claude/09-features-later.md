# 09 — Features voor later (Fase 3 & Fase 4 en daarbuiten)

Bewust uitgehouden van Fase 0/1/2 (MVP + Core services). Doel: focus voor de bouw, transparantie naar stakeholders dat het wel op de roadmap staat.

---

## Fase 3 (36–48 mnd) — Uitbreiding

### Volledige uitrol 10 districten + 62 ressortraden
- Alle DC's aangesloten op OpenZaak-SR, VOLIS-SR, S-Road
- Districtelijk Implementatie Team (DIT) per district
- Maandelijkse stand-up tussen alle DIT's
- "Best practice" deling tussen DC's

### GIS-viewer (publiek + intern)
- MapLibre GL voor publieke web-viewer
- Layers: percelen (MI-GLIS), wegen, water, projecten, vergunningen, meldingen, ressortgrenzen, districtgrenzen, risicogebieden
- "Regels op de kaart" (welke regels gelden op deze locatie?)
- Heatmaps per categorie
- Polygon-tekenen voor terreinbeheer
- Export naar GeoJSON / Shapefile / PDF-kaart

### Financieel beheer Wet Fid-conform
- Districtsfonds boekhouding
- Begroting per district per jaar
- Uitgavenregistratie per project, per categorie
- Budgetreservering bij projectstart
- Approval-flow met DR
- Audit-trail per transactie
- Koppeling MinFin centrale begrotingsboekhouding
- CLAD-audit toegang
- Export richting nationaal financieel systeem
- Vereist eerst: District Tax Law + DEF (politiek-gevoelig)

### BI-dashboards
- Metabase / Superset
- KPI's per district/ressort
- Geautomatiseerde maandrapportages
- Vergelijkende dashboards (district-tegen-district)
- Custom dashboard-builder

### Districtsbelasting-module (afhankelijk van District Tax Law)
- Aanslagen per perceel/persoon
- Online betaling
- Betalings-overzicht voor burger
- Inning + handhaving (incl. DR-besluiten)

### Subsidieaanvragen
- Districtsfonds-aanvragen (Wet Fid art. 40)
- Sectorale subsidies (cultuur, sport, sociaal)
- Aanvraag → beoordeling → besluit → uitkering
- Audit-trail subsidie-besteding

### Participatie & raadplegingen
- Online consultaties per ressort
- Stemmen op voorstellen (1 burger, 1 stem, Digitale-ID-check)
- Open ideeën-bus
- Hoorzitting-notulen archief
- Heatmap van issues per ressort (combineert met Signalen-meldingen)
- Naar voorbeeld Rahvaalgatus.ee (EE)

### Open Data Portaal
- 500+ datasets per 2030
- API met API-keys
- CSV/JSON/RDF downloads
- DCAT-AP metadata
- "Power BI"-stijl visualisaties

### Meertaligheid uitbreiden
- Saramaccaans + Aukaans + Paramaccaans voor binnenland
- Voice-interface in Sranantongo (Whisper-model)
- Pictogram-zware varianten voor laaggeletterden

### Native iOS/Android apps
- Offline-first met store-and-forward sync
- Voor binnenland-burgers (Sipaliwini, Brokopondo, Marowijne)
- Voor inspecteurs in het veld (camera, GPS, offline)
- Push-notificaties

### Inheemse / Marron-bestuurslaag
- Entiteit `dorp` onder ressort
- Rollen `kapitein` / `basja` / `granman`
- Specifieke procedures voor binnenland (grondmeldingen, traditionele besluitvorming)
- VIDS-consultatie (Vereniging Inheemse Dorpshoofden)
- Marron-organisatie consultatie

### Gemeenschappelijke ICT-punten in binnenland
- Fysiek touchpoint in dorpen zonder permanente internet
- Bio-SWEET koppeling (IDB SU-L1076)
- Train-de-trainer met dorpsmedewerker
- Satelliet (Starlink) of LoRaWAN-fallback

### Asset management
- Snipe-IT (open source)
- Voertuigen, gebouwen, infra
- Onderhoudskalender
- Per district + nationaal

---

## Fase 4 (48–60 mnd) — Optimalisatie & Innovatie

### AI-classificatie meldingen
- Signalen-SR ML-categorisatie (Nederlands + Sranantongo)
- Automatische routering op basis van foto + tekst
- Trending-detectie (welke categorieën stijgen?)
- Patroon-anomaliedetectie

### Proactive services
- **Geboorte → automatische registratie kinderbijslag**
- **Overlijden → automatische pensioen-stop + erfopvolging-procedures**
- **Verhuizing → automatische adres-update bij alle ministeries**
- **18 jaar → automatische uitnodiging Digitale-ID + kiesregister**
- **Onderneming start → automatische belasting-registratie**

Naar voorbeeld Estonia's once-only + proactive services.

### AI-chatbot burger-hulp
- "Welke vergunning heb ik nodig voor X?"
- Doorverwijzing naar juiste loket
- Antwoorden in Nederlands + Sranantongo
- Geen automatische besluiten — alleen informatie

### AI-dossier-samenvatting (intern)
- 1-pager bij complex dossier voor DC/minister
- Geen automatische beslissing — beslisser blijft mens

### Data Embassy
- Bilateraal verdrag met Nederland (logisch) of Brazilië/Trinidad (CARICOM)
- Datacenter onder soeverein gebied (Wenen-Conventie-analogie)
- Backups van kritieke registers (CBA, BS-akten, GLIS perceelregister)
- Operationele recovery mogelijk
- Budget: USD 1,5-3 mln eenmalig + USD 250k/jaar

### i-Voting pilot (lokale verkiezingen 2030)
- **Voorwaarden**:
  - Onafhankelijke security audit
  - Publieke consultatie + maatschappelijk debat
  - Cryptografische verificatie (ElGamal/mixnet)
  - Digitale-ID hoog niveau verplicht
  - Vroegstemmen-venster + onbeperkte stemwijziging tot deadline
- Eerste toepassing: ressortraadverkiezingen (lokaal, lager risico)
- Niet voor presidentiële of DNA-verkiezingen in deze fase

### Crisis-modus / disaster management
- Activeerbare crisismodus (verhoogde prioriteit, simpel UI)
- Massa-melding-aggregatie tijdens overstroming/storm
- Live kaart van schademeldingen
- Koppeling met **NCCR** (Nationaal Coördinatie Centrum Rampenbeheersing)
- Specifiek voor kustdistricten (zeespiegelstijging) en binnenland (extreme regenval, droogte)

### CARICOM-interoperabiliteit
- Regionale data-uitwisseling (eLAC2026)
- Bijvoorbeeld: erkenning rijbewijs binnen CARICOM
- Studenten-data tussen universiteiten
- Reizigersdata (gezondheid, identiteit)

### Diaspora-services
- Surinamers in buitenland kunnen sommige diensten op afstand gebruiken
- Paspoortverlenging via Suriname-consulaten + MijnSuriname
- e-Residency-discussie (Estland-model)

### Volledige integratie
- Alle ministeries op S-Road
- Alle DC's op OpenZaak-SR
- Alle ressortraden op VOLIS-SR
- 15+ basisregisters operationeel
- Geen papieren parallel-processen meer voor digitale gebruikers

---

## Buiten huidige roadmap (mogelijk later)

### e-Residency (à la Estland)
- 132.000+ e-residents EE — businesscase voor SUR onbewezen
- Politiek beladen
- Vereist hoge mate van legitimiteit + capaciteit
- **Overwegen na Fase 4 evaluatie**

### Voice-first interfaces (volledig conversational)
- Voor laaggeletterden en binnenland
- Bel-in nummer, AI neemt melding op in lokale taal
- Whisper-model voor Sranantongo/Saramaccaans

### LoRaWAN-messaging binnenland
- Voor dorpen zonder permanente internet
- Experimenteel, beperkte bandwidth
- Voor cruciale notificaties (vergaderoproep, crisismeldingen)

### Open-source release internationaal
- White-label / open-source release naar andere kleine staten
- CARICOM-landen met vergelijkbare structuur (Guyana, Belize)
- Mogelijk inkomstenbron via support-contracten

### Predictive analytics voor beleid
- Demografische prognoses
- Migratiepatronen binnenland↔kust
- Klimaat-impact-prognoses
- Bevolkingsdruk per ressort
- Strikt anonimiseerd + privacy-by-design

### Blockchain (volledig) voor specifieke use cases
- KSI-anchoring is al voldoende voor integriteit
- Volledig blockchain alleen overwegen bij specifieke use case (bv. internationale handel-tracking)
- Niet voor "transparantie" — daar is open data + audit-log voor

### Quantum-resistente cryptografie
- Pas-toe-of-leg-uit voor nieuwe systemen vanaf 2030
- Vooral kritisch voor langetermijn-handtekeningen en archieven

---

## Wat we expliciet **niet** moeten doen

| Idee | Waarom niet |
|------|-------------|
| Eigen kadaster opbouwen | MI-GLIS is bestaande autoriteit; concurrentie zou verwarrend en schadelijk zijn |
| Definitieve uitspraken over grondenrechten | Buiten mandaat, juridisch onmogelijk, politiek explosief |
| Automatische besluiten (AI keurt vergunning goed) | Bestuurlijke beslissingen horen bij mensen met mandaat |
| Sociale netwerk-functies | Geen overheidstaak; risico op politieke verzeiling |
| Commerciële ads / monetisatie | Vertrouwen in overheidsplatform vergt geen commerciële belangen |
| Cryptocurrency / blockchain-as-database | Voegt complexiteit zonder concreet voordeel boven audit-log |
| Eigen messaging-app (vs WhatsApp/SMS) | Adoptie-strijd niet te winnen; partner met bestaande kanalen |
| Eigen sociale-media-platform | Overheidstaak nooit |
| Volledige biometrische surveillance | Mensenrechten + Privacywet-conflict |

## Prioritering Fase 3/4 (op basis van waarde × haalbaarheid)

Aanbevolen volgorde:

1. Volledige uitrol overige districten (waarde = nationaal bereik)
2. GIS-viewer (waarde = bestuurlijk + politiek)
3. Financieel beheer (afhankelijk van District Tax Law)
4. Open Data Portaal (waarde = transparantie + vertrouwen)
5. Inheemse/Marron-bestuurslaag (waarde = inclusiviteit + politiek correct)
6. Native apps + meertaligheid binnenland
7. Proactive services (waarde = burger-impact)
8. AI-chatbot (lage drempel, snelle waarde)
9. AI-classificatie meldingen (operationele efficiency)
10. Data Embassy (politiek profiel + DR)
11. i-Voting (politiek beladen, laatst)
