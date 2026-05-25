# 01 — MVP scope (Fase 0 + Fase 1 Foundation)

## Doel van de MVP

Eind van Fase 1 (18 maanden vanaf start) moet **e-Suriname** als platform aantoonbaar functioneren met:

1. **S-Road** (X-Road v7) in productie met minimaal 5 ministeries gekoppeld
2. **MijnSuriname** burgerportaal MVP met Berichtenbox + Persoonlijke Gegevens + SSO via Digitale-ID
3. **Signalen-SR** pilot in Paramaribo + Wanica (open source fork van Amsterdam Signalen)
4. **CBB, MI-GLIS, KKF** formeel aangewezen als basisregisters via Staatsbesluit
5. **Wettelijke verankering**: Privacywet aangenomen, e-Suriname Agentschap operationeel

## MVP-principes

1. **Eerst de fundamenten leggen, dan diensten bovenop.** S-Road en basisregisters vóór alles wat eindgebruikers raakt.
2. **Open source-first.** Hergebruik wat NIIS en VNG al hebben (X-Road, OpenZaak, Signalen, Common Ground). Niet zelf bouwen wat bestaat.
3. **Twee pilot-districten** (Wanica + Para), niet alle 10 tegelijk. Volgt DLGP-II piloteringsmodel.
4. **Bestaande Digitale-ID hergebruiken**, niet vervangen — voortbouwen op CBB e-ID en digitale-id.gov.sr.
5. **Mobile-first én offline-tolerant** vanwege 78,4% internetpenetratie en zwakke binnenlanddekking.
6. **Wet komt vóór tech.** Geen S-Road in productie zonder vastgestelde Privacywet — anders geen rechtsgrond voor data-uitwisseling.

## In scope (MVP — Fase 0 + 1)

### Fase 0 — Governance & wetgeving (0–6 mnd)

| Deliverable | Reden |
|------------|-------|
| **Aanname Privacywet** (Ontwerpwet Bescherming Privacy en Persoonsgegevens) | Juridische rechtsgrond voor data-uitwisseling tussen registers |
| **Commissaris voor Persoonsgegevensbescherming** (Hoofdstuk VII) | Onafhankelijke toezichthouder, vereiste voor compliance |
| **e-Suriname Agentschap-wet** | Rechtspersoonlijkheid + meerjarenbegroting + mandaat boven ministeries |
| **MoU met NIIS** (Tallinn) | X-Road v7 licentie + technische support |
| **MoU met VNG International / Logius** | Common Ground componenten + kennisuitwisseling |
| **Architectuur Principes Document** (publiek consult.) | Verankering open source, Haven, API-first |
| **Financieringsplan** | IDB DLGP-III + UNDP + EU + NL bilateraal |
| **Nationale Digitale Stuurgroep** ingesteld | Strategische sturing op kwartaalbasis |

### Fase 1 — Foundation (6–18 mnd)

| Module | Reden |
|--------|-------|
| **S-Road v7 productie** met 5 ministeries (BiZa, MinFin, MinROS, MinJus, e-Gov) + 1 pilot-DC (Wanica) | Interoperabiliteitslaag — fundament voor alles |
| **CBB / MI-GLIS / KKF als basisregisters** (Staatsbesluit Basisregisters) + API-publicatie | Single source of truth |
| **Digitale-ID koppeling** (SSO via OpenID Connect) | Hergebruik bestaande infra |
| **MijnSuriname portaal MVP**: Berichtenbox + Persoonlijke Gegevens + Lopende Zaken (basic) | Eerste publieksgezicht |
| **Signalen-SR pilot** in Paramaribo + Wanica (open source fork) | Snelste publieke waarde, bewezen NL-model |
| **Notificatieservice** (email + SMS via Telesur/Digicel) | Cross-cutting nodig |
| **Document Service** (open source DMS, Alfresco/Nextcloud + CMIS) | Versiebeheer + archiefwet-compliant |
| **Audit log + KSI-hash-anchoring kritieke acties** | Onveranderlijkheid, vertrouwen |
| **Haven-Suriname cloud standaard** (Kubernetes, pas-toe-of-leg-uit) | Vermijdt lock-in vanaf dag 1 |

## Uit scope (expliciet niet in MVP)

| Feature | Naar fase | Waarom uitgesteld |
|---------|-----------|-------------------|
| Vergunningenflow (bouw, hinder, kap, evenement) end-to-end | Fase 2 | Vereist eerst zaaksysteem en koppelingen GLIS |
| OpenZaak-SR voor DC-zaaksysteem | Fase 2 | Bouwt op S-Road, niet zinvol vóór S-Road in productie |
| VOLIS-SR voor ressortraad-vergaderingen | Fase 2 | Pas zinvol als 4+ DC's al digitaal werken |
| Verhuisaangifte digitaal | Fase 2 | Vereist CBA-koppeling + Burgerlijke Stand workflow |
| Belastingen (district / rijks) | Fase 3 | Afhankelijk van District Tax Law (nog niet aangenomen) |
| GIS-viewer met MI-GLIS layers | Fase 3 | Vereist API-stabilisatie GLIS én publieke kaartbehoefte |
| Financieel/budgetbeheer Wet Fid | Fase 3 | Politiek gevoelig, vereist auditor-betrokkenheid |
| Districtsbelasting-module | Fase 3 | Wettelijke basis ontbreekt (District Tax Law) |
| BI-dashboards per district | Fase 3 | Pas waardevol als data structureel binnenkomt |
| Proactive services (geboorte → kinderbijslag) | Fase 4 | Vereist meerdere ministeries digitaal |
| AI-classificatie meldingen | Fase 4 | Eerst volume, dan model |
| i-Voting | Fase 4+ | Politiek/juridisch gevoelig, security-audit verplicht |
| Data Embassy (Nederland/Brazilië/Trinidad) | Fase 4 | Vereist bilateraal verdrag |
| e-Residency-equivalent | Niet in roadmap | Geen demand vastgesteld |

## Success-criteria MVP (eind Fase 1)

- [ ] **Privacywet aangenomen** door DNA en in werking
- [ ] **Commissaris Persoonsgegevens** benoemd en kantoor operationeel
- [ ] **e-Suriname Agentschap** opgericht met directeur, mandaat en jaar-1 begroting
- [ ] **S-Road in productie** met ≥5 ministeries + 1 DC, ≥3 dataservices uitgewisseld
- [ ] **Staatsbesluit Basisregisters** in werking; CBB/MI-GLIS/KKF gepubliceerde API's
- [ ] **MijnSuriname** live met ≥5.000 actieve gebruikers binnen 6 mnd na launch
- [ ] **Signalen-SR** verwerkt ≥1.000 burgermeldingen per maand in Paramaribo+Wanica
- [ ] **30% van burgers** heeft een actieve Digitale-ID (vs. <10% bij T0)
- [ ] **Eerste IDB DLGP-III tranche** ontvangen (Fase 2 financiering rond)
- [ ] **MoU met NIIS** en e-Governance Academy operationeel; 5+ getrainde S-Road engineers

## Wat we expliciet NIET beloven in de MVP

- Geen massa-digitalisering van álle overheidsdiensten — alleen de fundering en 1–2 voorbeeld-diensten
- Geen vervanging van bestaande wetgeving (WRO, Hinderwet, etc.) — alleen ondersteuning
- Geen automatische besluiten — bestuurders blijven beslissers
- Geen openbare publicatie van persoonsgegevens — Open Data alleen geaggregeerd
- Geen i-Voting in deze fase
- Geen districtsbelasting-inning (vereist nieuwe wet)

## Pilot-districten

**Wanica + Para**, conform DLGP-II pilot-pad (Aspiazu, 2014):

- **Wanica** — bevolkingsrijk, mix stedelijk/landelijk, goede connectiviteit, dichtbij Paramaribo
- **Para** — middelgroot, mix kust/binnenland-tendens, valideert binnenland-strategie zonder Sipaliwini-extremen

**Sipaliwini / Brokopondo expliciet NIET in MVP**: connectiviteit en taaldiversiteit vereisen offline-first apps en meertalige UX die pas in Fase 2/3 gebouwd worden.

## Triggers voor herevaluatie

(uit blauwdruk § Recommendations — bepalen of strategie aangepast moet worden)

| Trigger | Actie |
|---------|-------|
| Privacywet niet aangenomen vóór Q4 2026 | S-Road productie uitstellen; juridische "minimale" contracten gebruiken |
| IDB DLGP-III financiering niet rond Q2 2027 | Alternatief consortium UNDP + EU + NL bilateraal |
| Binnenland-connectiviteit onder 30% in 2028 | Offline-first apps prioriteren, satelliet (Starlink) na regulering |
| MijnSuriname adoptie <100.000 in 18 mnd | UX-revisie, marketingcampagne, gerichte verplichtstelling per dienst |
