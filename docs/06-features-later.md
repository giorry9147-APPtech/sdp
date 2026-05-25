# 06 — Features voor later (Fase 2 & 3)

Alles in dit document is **bewust uit de MVP gehouden**. Doel: focus voor MVP-bouw, transparantie naar stakeholders dat het wel op de roadmap staat.

---

## Fase 2 — Planning & decentralisatie (na pilot)

### Ressort- en districtsplanning (Module J)
Volledige planningscyclus van ressortplan → districtsplan → districtsbegroting, met goedkeuringsflows op alle niveaus. Vereist eerst draagvlak bij districtsraden.

### Burgerparticipatie (Module K)
- Online consultaties per ressort
- Stem op voorstellen (1-burger-1-stem, met CBB-koppeling later)
- Ideeën-bus
- Hoorzitting-archief
- Combinatie met meldingen-heatmap

### Financiële module (Module L)
Districtsbegroting, uitgavenregistratie, audit-flow conform SB 2006 nr. 134. Apart project met betrokken auditors.

### Meertaligheid
- **Sranan Tongo** als tweede interface-taal
- **Sarnami** voor delen van Nickerie/Wanica
- **Javaans** voor delen van Commewijne
- Auto-vertaling voor melding-omschrijvingen via AI (review-stap)
- Voicemail / spraakmemo's bij meldingen (transcriptie via Whisper)

### Notificatie-uitbreidingen
- **SMS** via Digicel/Telesur
- **WhatsApp Business API** — burger meldt via WhatsApp, terugkoppeling via WhatsApp
- **Push notifications** via PWA

### Offline-mode
- Service worker met IndexedDB voor draft-meldingen
- Sync-queue wanneer verbinding terug is
- Voor binnenland (Sipaliwini, Brokopondo) essentieel

### OCR & document-intelligentie
- Papieren documenten scannen → tekst doorzoekbaar
- Auto-extractie van velden (datum, bedrag, partijen) uit standaarddocumenten

### Vergunning-uitbreidingen
- **Vergunningcheck-beslisboom** (heb ik vergunning nodig?) — naar voorbeeld DSO/Omgevingsloket NL
- Online betaling van leges
- Multi-departementaal advies (parallelle stappen)

### Inheemse en Marron-dorpsbestuurslaag
- Extra entiteit `dorp` onder ressort
- Rol `dorpshoofd` / `kapitein` / `granman`
- Specifieke procedures voor binnenlandse dorpen
- Zie [07-aanvullend-onderzoek.md](07-aanvullend-onderzoek.md) §3

### Multi-district uitrol
- Onboarding-flow per district (data-migratie, training, go-live)
- Vergelijkende dashboards tussen districten (alleen RO)
- Best-practice deling tussen DC's

---

## Fase 3 — GIS, AI & integraties

### GIS-viewer (Module M)
- Interactieve kaart met layer-toggles
- Districten + ressortgrenzen (officiële geodata)
- Meldingen, vergunningen, projecten als overlays
- **"Regels op de kaart"** — wat geldt op deze locatie?
- Polygon-tekenen voor terreinbeheer
- Heatmaps per categorie
- Mobile field-mapping (inspecteur tekent op kaart)
- Export naar GeoJSON / Shapefile / PDF-kaart

### Externe integraties (Module N)
- **CBB** (Centraal Bureau voor Burgerzaken) — identiteitsverificatie burgers
- **MI-GLIS** — perceelinformatie (read-only)
- **e-Government Suriname** — single sign-on
- **Politie / 112** — escalatie veiligheidsmeldingen
- **Ministerie OW** — projectkoppeling infrastructuur
- **Belastingdienst** — leges-betaling
- **Centraal Bureau voor de Statistiek** — geanonimiseerde data delen
- **Open Data API** — publieke transparantie (read-only, geaggregeerd)
- **DigiD-equivalent** als die er komt voor Suriname

### AI-assistentie (Module O)
- **Burger-chatbot** ("welke vergunning heb ik nodig voor X?")
- **Dossier-samenvatting** (DC krijgt 1-pager bij complex dossier)
- **Concept-besluit-opsteller** (DC beslist, AI tikt voor)
- **Patroonherkenning** (trending klachten, budgetafwijkingen)
- **Vertaling** real-time Nederlands ↔ Sranan ↔ Sarnami
- **Voicebot** (binnenland: bel-in nummer, AI neemt melding op in lokale taal)

### Anti-corruptie / whistleblower-module
- Vertrouwelijk meldkanaal (apart van reguliere meldingen)
- Aparte ontvanger (auditor of externe partij)
- Geen audit-koppeling aan reguliere staf
- Encryptie at-rest met aparte sleutels

### Disaster / crisis management
- Activeerbare crisismodus (verhoogde prioriteit, simpel UI)
- Massa-melding-aggregatie tijdens overstroming / storm
- Live kaart van schademeldingen
- Koppeling met Nationaal Coördinatie Centrum Rampenbeheersing (NCCR)
- Specifiek relevant voor kustdistricten (zeespiegelstijging) en binnenland (droogte/regenval)

### Native mobile apps
- iOS + Android (React Native of native)
- Voor inspecteurs in het veld (betere camera, GPS, offline)
- Voor burgers (push, locatie, offline draft)

### USSD / SMS-meldpunt
- Voor mensen zonder smartphone
- Korte codes per district (bv. *123*1#)
- Belangrijk voor binnenland en oudere doelgroep

### Verkiezingen districts-/ressortraad
- Kandidatenbeheer
- Stemresultaten registreren en publiceren
- Mandaatperiodes per gekozen lid
- Koppeling met Centraal Hoofdstembureau (CHS)

### Open Data portaal
- Publiek dashboard met geaggregeerde statistieken (geen PII)
- CSV/JSON downloads
- API met API-keys voor onderzoekers, journalisten
- Vergelijkbaar met data.overheid.nl

### Internationale uitbreiding (heel ver weg)
- Platform abstraheren: andere Caribische landen met vergelijkbare structuur (Guyana, Belize) zouden het kunnen overnemen
- White-label / open-source release

---

## Wat we waarschijnlijk **nooit** moeten doen

| Idee | Waarom niet |
|------|-------------|
| Eigen kadaster opbouwen | MI-GLIS is bestaande autoriteit; concurrentie zou verwarrend en schadelijk zijn |
| Definitieve uitspraken over grondenrechten | Buiten mandaat, juridisch onmogelijk, politiek explosief |
| Automatische besluiten (AI keurt vergunning goed) | Bestuurlijke beslissingen horen bij mensen met mandaat |
| Sociale netwerk-functies | Geen overheidstaak; risico op politieke verzeiling |
| Commerciële ads / monetisatie | Vertrouwen in overheidsplatform vergt geen commerciële belangen |
| Cryptocurrency / blockchain voor "transparantie" | Voegt complexiteit zonder concreet voordeel boven append-only audit log |

## Prioritering Fase 2/3

Aanbevolen volgorde na MVP (op basis van waarde × haalbaarheid):

1. Multi-district uitrol (waarde = schaal)
2. Notificaties via SMS/WhatsApp (waarde = adoptie burgers)
3. Offline-mode + meertaligheid (waarde = binnenland erbij)
4. Ressortplanning + burgerparticipatie (waarde = bestuurlijke cyclus compleet)
5. Financiële module (waarde = hoge bestuurlijke impact, complex)
6. GIS-viewer (waarde = beleid + politieke zichtbaarheid)
7. Externe integraties (één per kwartaal)
8. AI-assistentie (laatst — eerst data, dan modellen)
