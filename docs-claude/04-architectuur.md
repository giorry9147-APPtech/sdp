# 04 — Technische architectuur

## Uitgangspunten

1. **5-lagen architectuur** conform NL Common Ground: scheiding tussen interactie, processen, integratie, services en data.
2. **S-Road als interoperabiliteitslaag** — decentrale Estonian X-Road v7 deployment.
3. **Basisregisters als single source of truth** — data bij de bron bevragen, niet kopiëren (once-only).
4. **Open source first** — hergebruik NIIS, VNG, Logius, Foundation for Public Code componenten.
5. **API-first + modular monolith voor MVP**, microservices waar schaal het rechtvaardigt (Suriname's volume van 641.000 inwoners rechtvaardigt geen volledige microservices-explosie).
6. **Zero-trust + mTLS** via S-Road, encryptie at-rest (AES-256) en in-transit (TLS 1.3).
7. **Soevereine cloud + Data Embassy** — data-soevereiniteit by default.
8. **eIDAS-equivalent**: 3 zekerheidsniveaus (laag/substantieel/hoog).

## High-level referentiearchitectuur

```
┌───────────────────────────────────────────────────────────────────┐
│  LAAG 1 — PRESENTATIE                                             │
│  ┌──────────────┐ ┌─────────────┐ ┌──────────────┐ ┌──────────┐  │
│  │ MijnSuriname │ │  District-  │ │  BestuurSR   │ │ Chatbots │  │
│  │   portaal    │ │  websites   │ │   werkplek   │ │          │  │
│  │  Web + PWA   │ │             │ │              │ │          │  │
│  │  iOS/Android │ │             │ │              │ │          │  │
│  └──────────────┘ └─────────────┘ └──────────────┘ └──────────┘  │
├───────────────────────────────────────────────────────────────────┤
│  LAAG 2 — PROCESSEN                                               │
│  ┌────────────────┐ ┌──────────────┐ ┌──────────────────────┐    │
│  │ BPMN workflows │ │ Zaakgericht  │ │ Vergaderingen (VOLIS │    │
│  │                │ │ werken       │ │ -SR) + Vergunningen  │    │
│  │                │ │ (OpenZaak-SR)│ │                      │    │
│  └────────────────┘ └──────────────┘ └──────────────────────┘    │
├───────────────────────────────────────────────────────────────────┤
│  LAAG 3 — INTEGRATIE — S-ROAD                                     │
│  ┌────────────────────────────────────────────────────────────┐  │
│  │  Security Server per ministerie/DC (mTLS, message signing) │  │
│  │  Central Services (registratie, certs, time-stamping)      │  │
│  │  Certificate Authority (SUR jurisdictie)                   │  │
│  │  RIHA-equivalent (catalogus van resources)                 │  │
│  └────────────────────────────────────────────────────────────┘  │
├───────────────────────────────────────────────────────────────────┤
│  LAAG 4 — SERVICES                                                │
│  ┌────────┐ ┌────────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐ │
│  │ REST   │ │ OAuth2/    │ │ Identity │ │ Notify   │ │Payment │ │
│  │ APIs   │ │ OIDC       │ │ Provider │ │ Service  │ │Service │ │
│  │ (OAS3) │ │            │ │ (Dig.-ID)│ │ (mail/   │ │        │ │
│  │        │ │            │ │          │ │  SMS/    │ │        │ │
│  │        │ │            │ │          │ │  WApp)   │ │        │ │
│  └────────┘ └────────────┘ └──────────┘ └──────────┘ └────────┘ │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────────────────┐ │
│  │ Document Svc │ │  Audit Log   │ │  KSI Hash Anchoring      │ │
│  │ (+ dig. sig.)│ │ (append-only)│ │  (integriteitsbewijs)    │ │
│  └──────────────┘ └──────────────┘ └──────────────────────────┘ │
├───────────────────────────────────────────────────────────────────┤
│  LAAG 5 — DATA — BASISREGISTERS                                   │
│  ┌──────────┐ ┌──────────┐ ┌───────┐ ┌──────┐ ┌──────┐ ┌──────┐ │
│  │ CBB/CBA  │ │ MI-GLIS  │ │ KKF   │ │ BAS  │ │ KPS  │ │Belas-│ │
│  │ (persoon)│ │ (perceel)│ │(bedr.)│ │(adr.)│ │(vrtg)│ │ting  │ │
│  └──────────┘ └──────────┘ └───────┘ └──────┘ └──────┘ └──────┘ │
├───────────────────────────────────────────────────────────────────┤
│  INFRA: Haven-Suriname (Kubernetes, pas-toe-of-leg-uit)           │
│         Soevereine cloud Paramaribo + Data Embassy DR             │
└───────────────────────────────────────────────────────────────────┘
```

---

## Laag 1 — Presentatie

### Stack
- **Frontend framework**: Vue 3 (à la NL Common Ground) of React/Next.js — vast te leggen per applicatie
- **Design system**: gedeelde "e-Suriname Design System" (componenten, kleuren, typografie, iconografie)
- **PWA** verplicht voor publieke sites (offline-tolerant, installeerbaar)
- **Native iOS/Android** in Fase 3 voor binnenland (store-and-forward sync)
- **WCAG 2.1 AA** verplicht — bouwt op NL Tijdelijk Besluit Digitale Toegankelijkheid

### Toegankelijkheid & inclusie
- Pictogram-zwaar design voor laaggeletterdheid
- Meertaligheid (zie [02](02-componenten.md) §4.7)
- Voice-interface in Sranantongo overwegen
- Hoog-contrast en font-scaling

---

## Laag 2 — Processen

### Zaakgericht werken
- **OpenZaak-SR** (open source fork van NL OpenZaak)
- **ZGW-API's** (REST-gebaseerd, modern) — niet StUF (SOAP/legacy, niet nodig zonder bestaande StUF-systemen)
- **CMIS** voor documenten-koppeling

### Workflow-engine
- **BPMN 2.0** (Camunda 8 open source of Flowable)
- Eén engine, per module configureerbaar
- Audit + notificaties als cross-cutting concerns

### Vergaderingen
- **VOLIS-SR** (open source fork van Estonian VOLIS)
- Live-streaming
- Stemming + besluitvorming
- Documenten per agendapunt

---

## Laag 3 — S-Road (interoperabiliteit)

### Wat S-Road IS
- Decentrale, beveiligde data-uitwisselingslaag
- Op basis van **X-Road v7** (NIIS, open source MIT-licentie)
- Elke organisatie heeft een **Security Server**
- Central Services voor registratie, certificaten, time-stamping
- **mTLS** + **message signing** voor end-to-end vertrouwen
- **Geen blockchain in X-Road zelf** (CTO Kivimäki, 2018); wel optionele KSI-anchoring van logs

### Wat S-Road NIET is
- Geen centrale data-database (data blijft bij bronregisters)
- Geen ESB (Enterprise Service Bus)
- Geen workflow-engine
- Geen identity provider (gebruikt eigen of externe IdP)

### S-Road governance
- Beheer door **Suriname Interoperability Solutions Institute (SISI)** — kan starten als unit binnen e-Suriname Agentschap, later eigen rechtspersoonlijkheid (analoog NIIS)
- **RIHA-equivalent** verplicht: catalogus van alle interoperability resources (databases, services, dataset-omschrijvingen)
- **NIIS-lidmaatschap** mogelijk doel (vereist verdrag-niveau samenwerking)

### Productiepad
1. Fase 1: pilot met 5 ministeries (BiZa, MinFin, MinROS, MinJus, e-Gov) + 1 DC
2. Fase 2: + 4 DC's + 3 basisregisters extra
3. Fase 3: alle DC's + ressortraden + 15+ basisregisters

---

## Laag 4 — Services

### REST APIs
- **OpenAPI 3.0** spec verplicht
- Versioning: `/v1/`, `/v2/` in URL
- Gepubliceerd in centrale developer-portal
- Rate-limiting per consument

### Identity Provider
- **Digitale-ID Government Authenticator** (bestaand)
- OpenID Connect / SAML 2.0
- 3 niveaus (laag/substantieel/hoog) — eIDAS-equivalent
- 2FA verplicht voor staf (substantieel)
- Hoog niveau via CBB e-ID kaart + e-paspoort biometrie

### Notification Service
- Email (SMTP via PKI-overheid certificaten)
- SMS (Telesur + Digicel API's)
- Push (PWA + native Fase 3)
- **WhatsApp Business API** (Fase 2 — hoge WApp-penetratie SUR)

### Document Service
- PDF-generatie (besluit-templates)
- **Digitale handtekening eIDAS-niveau hoog** (CBB e-ID kaart + PIN2 of equivalent)
- Archiefopname (Archiefwet-compliant)

### Audit Log
- Append-only, immutable
- Per actie: actor, timestamp, IP, user-agent, before, after
- Centraal verzameld in dedicated audit-cluster
- **KSI-style hash-anchoring** van log-hashes in onafhankelijk ledger (à la Guardtime/Estonia) — geen volledige blockchain, alleen integriteitsbewijs

---

## Laag 5 — Basisregisters (Master Data)

### Authoritatieve bronnen

| Register | Beheerder | Status MVP | Status Fase 3 |
|----------|-----------|------------|----------------|
| **CBB/CBA** (persoon) | Centraal Bureau voor Burgerzaken | Bestaand, API publiek via S-Road | Volledig hergebruik |
| **MI-GLIS** (perceel) | MI-GLIS | Bestaand, API publiek via S-Road | Volledig GIS-koppeling |
| **KKF** (bedrijven) | Kamer van Koophandel en Fabrieken | Modernisering UX+API | Volledig hergebruik |
| **BAS** (adressen) | nieuw te bouwen | Opzet Fase 1/2 | Productie |
| **KPS** (voertuigen) | KPS | Fase 3 | Productie |
| **Belastingen** | Belastingdienst | Fase 3 | Productie |
| **Justitie** (vonnissen) | MinJus | Fase 4 | Productie |

### Once-only-principe
- Wettelijk verankerd via Privacywet / e-Suriname Agentschap-wet
- Dezelfde data nooit 2x ophalen
- Burger ziet wat over hem bekend is + kan correctie-verzoek doen

### Basisregistratie Adressen Suriname (BAS) — kritieke ontbrekende laag
- Suriname heeft géén officieel BAG-equivalent
- Zonder authoritative adresregister werken alle andere diensten met inconsistente adressen
- Op te bouwen op basis van GLIS Perceel-ID + DC-toewijzing
- Migratiestrategie: bestaande adresvelden in CBA + KKF + DC-systemen converteren naar BAS-referenties

---

## Infrastructuur — Haven-Suriname + soevereine cloud

### Haven-standaard (NL VNG, sinds 25 maart 2022)
- Platform- en leveranciersonafhankelijke Kubernetes-configuratie
- Een applicatie die op één Haven-omgeving draait, werkt op alle andere
- Pas-toe-of-leg-uit voor alle nieuwe overheids-cloud uitvragen
- Lokale providers (Telesur, Datacenter Suriname) + eventueel Europese hyperscalers met EU-soevereiniteit
- Voorkomt vendor lock-in

### Hybrid sovereign cloud
- **Primair**: lokale datacenters in Paramaribo (Telesur / EBS / Datacenter Suriname)
- **DR**: Data Embassy in bevriend land (Fase 4)
- **Beleid**: persoonsgegevens nooit buiten Surinaams jurisdictiegebied zonder verdragsmatige bescherming

### Data Embassy (Fase 4)
- Wereldprimeur Estland-Luxemburg, verdrag 2017
- Datacenter onder soeverein gebied (Verdrag van Wenen-analogie)
- Logische kandidaten voor SUR:
  - **Nederland** (historisch + juridisch verwant)
  - **Brazilië** (regionaal)
  - **Trinidad/CARICOM-partner** (regionaal)
- Budget richtlijn: USD 1,5–3 mln eenmalig + USD 250.000/jaar (EE-LU benchmark)
- Bilateraal verdrag vereist (DNA-ratificatie)

### Schaalbaarheid & resilience binnenland
- **Offline-first apps** met store-and-forward sync via S-Road wanneer connectiviteit terugkeert
- **LoRaWAN-gebaseerde messaging** in Boven-Suriname/Tapanahony (experimenteel Fase 4)
- **Gemeenschappelijke ICT-punten** in binnenland-dorpen (Bio-SWEET koppeling)
- **Satelliet** (Starlink) na regulering

---

## Security & compliance

| Gebied | Maatregel |
|--------|-----------|
| Transport | TLS 1.3 verplicht, HSTS, geen mixed content |
| Inter-system | mTLS via S-Road Security Servers + message signing |
| Auth | Digitale-ID, Argon2id voor wachtwoorden, 2FA voor staf |
| Authorization | RBAC + per-organisatie data-isolatie via S-Road access policies |
| Input | Schema-validatie alle endpoints (Zod/JSON Schema) |
| Uploads | MIME-sniffing + virusscan + max-size + extensies whitelist |
| Audit | KSI-anchoring kritieke acties; onveranderlijk |
| Secrets | Vault (HashiCorp/Doppler/Infisical); nooit in repo |
| Backups | Dagelijks encrypted; maandelijks restore-test; Data Embassy DR (Fase 4) |
| Dependencies | Renovate/Dependabot; CI faalt bij hoge CVE |
| Headers | CSP, X-Frame-Options, Referrer-Policy |
| Rate-limit | Per-IP en per-account; aparte limieten publiek/staf |
| Privacy | Privacywet + Commissaris Persoonsgegevens compliance |
| Cyber-resilience | National CSIRT, jaarlijkse pentest, NIS2/BIO-aligned |
| Standaarden | eIDAS-equivalent voor identity, ZGW voor zaken, CMIS voor documenten |

---

## DevSecOps

- **CI/CD**: GitLab CI / GitHub Actions
- **SBOM** verplicht per build (CycloneDX of SPDX)
- **OWASP ZAP / Trivy** in pipeline
- **Dependency scanning** met fail-on-CVE-high
- **Container scanning** (Snyk / Trivy)
- **Secrets scanning** (gitleaks / trufflehog)
- **Code review** verplicht (twee approvers voor productie)
- **Open source contributions** geëncourageerd ("open source citizenship")
- **Diaspora-talent** als reviewer-pool

---

## Standaarden (samenvatting)

| Domein | Standaard |
|--------|-----------|
| API | REST + OpenAPI 3.0 |
| Auth | OAuth2 + OpenID Connect + SAML 2.0 |
| Identity | eIDAS-equivalent (3 niveaus) |
| Zaken | ZGW-API's |
| Documenten | CMIS |
| Container orchestratie | Kubernetes (Haven-compatible) |
| Workflow | BPMN 2.0 |
| Audit-anchoring | KSI (Guardtime-stijl) |
| Toegankelijkheid | WCAG 2.1 AA |
| GIS | OGC standaarden (WMS/WFS/WMTS) + GeoJSON |
| Open data | DCAT-AP + CSV/JSON/RDF |

---

## Bewuste keuzes / NIET-keuzes

| Niet | Reden |
|------|-------|
| Hyperscaler-only (AWS Lambda etc.) | Data-soevereiniteit + vendor lock-in |
| MongoDB / pure NoSQL | Bestuurlijke data is relationeel, transacties belangrijk |
| Microservices-explosie vanaf dag 1 | Schaal rechtvaardigt het niet; modular monolith eerst |
| StUF (SOAP-legacy) | Geen bestaande StUF-systemen, direct REST/ZGW |
| Eigen blockchain als database | Onnodig; KSI-anchoring volstaat |
| Auth0/Clerk | Bestuurlijke auth onder eigen controle |
| Google Analytics | Privacy + soevereiniteit; Matomo/Plausible |
| Centrale data-database via X-Road | X-Road is bewust decentraal; data blijft bij bron |
| i-Voting in MVP/Fase 2 | Security-risico, vereist publieke consultatie en audit |
