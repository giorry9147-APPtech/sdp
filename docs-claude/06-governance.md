# 06 — Governance & organisatie

## Eigenaar/opdrachtgever-model

### Bestuurlijk niveau
- **Kabinet van de President** — voorzitter Digitale Transformatie Stuurgroep
- **Minister van Binnenlandse Zaken** — ICT-beleid, e-ID-stack
- **Minister van Regionale Ontwikkeling en Sport** — districten, binnenland, decentralisatie
- **Minister van Financiën** — financiële decentralisatie, Wet Fid, begrotingsboekhouding
- **Minister van Justitie en Politie** — Privacywet, eIDAS-equivalent, KPS-integratie

### Uitvoerend niveau
- **Directoraat e-Government** (Kabinet van de President, directeur Llydion Dalfour sinds sep 2025) — voorloper en initiator
- → schalen tot **e-Suriname Agentschap** met:
  - eigen rechtspersoonlijkheid (publiekrechtelijk ZBO-achtig)
  - meerjarenbegroting
  - mandaat over alle ministeries voor digitale architectuur
  - eigen loonschalen (concurrerend met private sector)
  - analoog: **Estonian RIA** + **Nederlands Logius**

### Inhoudelijk — interoperabiliteit
- **SISI** (Suriname Interoperability Solutions Institute) voor X-Road / S-Road beheer
- Start als unit binnen e-Suriname Agentschap
- Later eigen rechtspersoonlijkheid (analoog NIIS — Nordic Institute for Interoperability Solutions)

## Governance-model — meerlagig

| Niveau | Orgaan | Frequentie | Samenstelling |
|--------|--------|------------|---------------|
| **Strategisch** | Nationale Digitale Stuurgroep | kwartaal | President (vz), MinBiZa, MinROS, MinFin, MinJus, DNA-voorzitter, IDB-vertegenwoordiger, UNDP-vertegenwoordiger |
| **Tactisch** | Regiegroep e-Suriname | maandelijks | Directeur e-Suriname Agentschap, SG's van betrokken ministeries, 1 DC-vertegenwoordiger (rouleerend per district), 1 RR-vertegenwoordiger (rouleerend) |
| **Operationeel** | Technische werkgroepen | wekelijks | Architecten, product owners, security, leveranciers |
| **Districtelijk** | Districtelijk Implementatie Team (DIT) | wekelijks tijdens uitrol | DC, districtssecretaris, ICT-coördinator, RR-voorzitters |
| **Toezicht** | Commissaris Persoonsgegevens (PDP) | continue | Onafhankelijke autoriteit (Privacywet Hfst VII) |
| **Externe audit** | CLAD + DNA | jaarlijks | CLAD jaarrekening + DNA-controle |

## Capaciteitsopbouw

### Werving e-Suriname Agentschap (eerste 12 maanden)
- Directeur Agentschap (1)
- Platform-architecten (5)
- Product owners (3)
- Security lead + SOC-engineers (4)
- Senior engineers (8)
- Junior engineers (12)
- Product designers / UX (3)
- Data engineers (2)
- DevOps / SRE (4)
- Compliance & juridisch (2)
- Communicatie (2)
- HR / operations (3)

### Loonschalen
- Concurrerend met private sector Suriname én diaspora (NL/USA)
- Onafhankelijke salarisbenchmark elke 2 jaar
- Retentiebonussen voor key engineers
- Mogelijkheid tot remote-werk voor diaspora

### Opleidingstrajecten
- **e-Governance Academy (Tallinn)** — standaard 5-daagse training voor 5 senior engineers (Fase 0)
- **TalTech** (Tallinn University of Technology) — uitwisselingsprogramma's
- **TU Delft / VNG Academy** — Common Ground / OpenZaak training
- **Anton de Kom Universiteit** — ICT-curriculum verbreden, certificering
- **Polytechnic College Suriname** — vak-engineers, bouwt op bestaand
- **Cisco Networking Academy** (reeds aangekondigd via e-Gov) — uitbreiden
- **Train-de-trainer**: ressortraad-leden, DC-secretarissen krijgen basis-ICT/VOLIS-training

### Open source citizenship
- Gemeenten/districten kunnen zelf bijdragen aan codebase
- Externe contributors welkom (Foundation for Public Code-stijl)
- "OpenLab" maandelijkse hackathon

### Diaspora-talent
- Surinamers in NL/USA als adviseurs, reviewers, deeltijd-engineers
- Remote-policy ingericht
- Speciaal: diaspora-NL met VNG/Logius/RDW achtergrond — meest waardevol

## Public-private partnerships

### Connectiviteit & infra
- **Telesur** — vaste lijn + mobiel + TNBP + submarine cable
- **Digicel** — mobiel, SMS-gateway
- **Datacenter Suriname / EBS** — lokale cloud-hosting
- **Bio-SWEET** (IDB SU-L1076) — binnenland-connectiviteit

### Internationale leveranciers
- **NL**: Atabix, Centric, Cegeka, PinkRoccade, Dimpact — Common Ground componenten + expertise via VNG International / Connecting Suriname
- **EE**: Cybernetica, Nortal, Helmes — X-Road / UXP implementatie
- **Vlatacom (Servië)** — reeds gecontracteerd voor e-ID/e-paspoort materialen
- **Guardtime (EE)** — KSI-anchoring (optioneel Fase 4)

### Inkoopstrategie
- Open source-first in aanbestedingscriteria
- Portability + Haven-compatibility verplicht
- Geen exclusieve contracten >3 jaar
- SBOM-eisen
- Code-eigenaarschap blijft bij Suriname

## Internationale samenwerking

### Multilateraal
- **IDB** — vervolg op SU0019/SU-L1011 (DLGP I & II); aanvullend op SU-L1076 (Bio-SWEET); IDB Country Strategy 2026–2030
- **UNDP** — Digital Readiness Assessment vervolg-support
- **EU** — Caribbean Investment Facility / Global Gateway
- **Wereldbank** — Digital Public Infrastructure
- **CARICOM** — regionale interoperabiliteit (eLAC2026, CARICOM ICT Strategy)

### Bilateraal
- **Nederland** — VNG International, Logius kennisuitwisseling, Ambassade Paramaribo (post staatsbezoek dec 2025), Connecting Suriname
- **Estland** — e-Governance Academy (training), NIIS (X-Road), potentieel NIIS-lidmaatschap
- **Brazilië / Trinidad** — Data Embassy-kandidaten, CARICOM-koppeling

## Organisatie-structuur e-Suriname Agentschap (voorgestelde indeling)

```
                    ┌─────────────────────┐
                    │ Directeur Agentschap│
                    └──────────┬──────────┘
                               │
        ┌──────────────────────┼──────────────────────────┐
        │                      │                          │
┌───────▼────────┐  ┌──────────▼──────────┐  ┌────────────▼───────────┐
│   Platform     │  │   Diensten          │  │   Operations           │
│ (architectuur, │  │ (MijnSuriname,      │  │ (DevOps, SRE, support, │
│  S-Road/SISI,  │  │  BestuurSR, modules)│  │  user-onboarding,      │
│  basisregister │  │                     │  │  training, comms)      │
│  governance)   │  │                     │  │                        │
└────────────────┘  └─────────────────────┘  └────────────────────────┘

        │                      │                          │
┌───────▼────────┐  ┌──────────▼──────────┐  ┌────────────▼───────────┐
│   Security &   │  │  Juridisch &        │  │  Strategie & business  │
│   CSIRT        │  │  Compliance         │  │  development           │
│                │  │  (Privacywet, IP,   │  │  (relaties IDB/UNDP/   │
│                │  │  Archiefwet, etc.)  │  │  EU/NL, KPI's)         │
└────────────────┘  └─────────────────────┘  └────────────────────────┘
```

## DLGP-secretariaat (overbrugging)

Het bestaande DLGP-secretariaat onder leiding van Mahender Pershad (Finance and Planning Manager) werkt vanuit het Ministerie van Regionale Ontwikkeling op overbruggingsbasis. Dit team:

- Is **niet** hetzelfde als e-Suriname Agentschap
- Behoudt focus op decentralisatie-procesondersteuning RO
- Wordt **partner** voor districtelijke uitrol (pilot Wanica + Para)
- Kan deels worden geïntegreerd in e-Suriname zodra DLGP-III gefinancierd is

## Communicatie & change management

### Naar burgers
- Landelijke campagne bij MijnSuriname launch
- TV/radio (NPS, ATV) — Sranantongo én Nederlands
- WhatsApp-broadcast via DC-kantoren
- DC-loket als fysieke informatiepunt
- Helpdesk per kanaal (telefoon, email, WhatsApp, fysiek)

### Naar staf
- "Internal launch" voor 4 ministeries (Fase 1)
- Trainingsweken bij start van elke nieuwe module
- Champions-netwerk in elk ministerie / DC
- Maandelijkse stand-up tussen DIT's (Districtelijk Implementatie Team) onderling

### Naar internationale stakeholders
- Engelstalig developer-portal
- Engelstalige strategie-documenten (basis voor IDB/UNDP)
- Jaarlijkse "e-Suriname Forum" conferentie (year 2+)

## Verantwoording

### Aan DNA
- Jaarrapportage e-Suriname Agentschap
- CLAD-jaarrekening
- Toezicht via vaste commissie Binnenlandse Zaken (DNA)

### Aan de samenleving
- Publieke roadmap + voortgang dashboard
- Open Data portaal (eigen werking + financien)
- Burgerpanels per kwartaal voor feedback

### Aan toezichthouders
- Commissaris Persoonsgegevens — toegang tot alle logs
- CLAD — financieel en proces-audit
- Externe security-audit jaarlijks

## KPI's voor het Agentschap (niet voor het platform)

| KPI | Doel |
|-----|------|
| Engineer-retentie 12 mnd | >85% |
| Time-to-hire kritieke rollen | <90 dagen |
| Open issues in beheer-backlog | <100 |
| Mean time to recovery (MTTR) | <4 uur P0 |
| Productie-incidenten per maand | <2 P1 |
| Klantcasus uitvoeringstijd | binnen SLA per dienst |
| Open source contributions (extern) | >10/jaar |
| Trainingsuren per engineer/jaar | >40 uur |

## Bewuste organisatie-keuzes

| Keuze | Reden |
|-------|-------|
| Eigen Agentschap i.p.v. ministerie-onderdeel | Politieke continuïteit, mandaat, retentie |
| SISI als aparte unit/instituut | NIIS-model bewezen, governance scheiding nodig |
| Open source first | Vermijdt deviezen-uitgaven en lock-in |
| Pilot-districten i.p.v. big-bang | DLGP-II les: piloting werkt, big-bang faalt |
| Geen ministerieel ICT-departement opheffen | Politiek onhaalbaar; coördinatie via Stuurgroep |
| Geen consultants-only model | Capaciteit moet in eigen huis blijven |
