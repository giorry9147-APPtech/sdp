# 10 — Relatie tussen SDP en e-Suriname

Er liggen twee onderzoeken (`../AI-onderzoek.md` en `../CLAUDE-onderzoek.md`) die elk een platformvisie beschrijven. Ze sluiten elkaar **niet uit** — ze verschillen in scope, ambitie, eigenaar en tijdspad. Dit document maakt expliciet hoe ze zich tot elkaar verhouden.

## De twee sporen kort

| Aspect | **SDP** ([`../docs/`](../docs/)) | **e-Suriname** (deze map) |
|--------|----------------------------------|---------------------------|
| Bron | `AI-onderzoek.md` | `CLAUDE-onderzoek.md` |
| Scope | District-bestuur, decentralisatie | Nationaal e-Government + districtsbestuur |
| Doelgroep | Districtscommissariaten, RR/DR, RO | Alle burgers, ondernemers, ministeries, DC's, RR's |
| Eigenaar | Min. Regionale Ontwikkeling en Sport | Kabinet van de President / e-Suriname Agentschap |
| Wettelijke basis | Bestaande WRO | Nieuwe wetten nodig (Privacywet, Agentschap-wet, Basisregisters) |
| Budget | bescheiden (€100k–€1M range) | USD 35–55 mln over 5 jaar |
| Tijdspad MVP | 3–6 maanden | Fase 0+1 = 18 maanden |
| Tech-stack | Next.js + NestJS + PostgreSQL+PostGIS, monoliet | Common Ground 5-lagen + S-Road (X-Road) + basisregisters |
| Integratie | Eigen dossiers, MI-GLIS/CBB pas in Fase 3 | Basisregisters vanaf Fase 1 als single source of truth |
| GIS | PostGIS-ready vanaf dag 1, viewer Fase 3 | MI-GLIS-koppeling vanaf Fase 1, GIS-viewer Fase 3 |
| Pilot-district | Wanica óf Paramaribo | Wanica + Para (DLGP-II pad) |
| Funding | onbekend / nader te bepalen | IDB DLGP-III, UNDP, EU, NL bilateraal |
| Open source | aanbevolen | verplicht (Haven/NIIS/VNG model) |

## Drie mogelijke relaties

### Optie A — SDP als pragmatische voorloper van e-Suriname
**SDP wordt gebouwd nu (3–6 mnd), e-Suriname start parallel of na**.

- SDP bewijst waarde van digitalisering in 1 district binnen maanden
- Bouwt politiek momentum + adoptie-bewijs voor e-Suriname investeringspitch
- Architectuur SDP **moet vanaf dag 1 e-Suriname-compatible** zijn:
  - Datamodel klaar voor mapping naar OpenZaak-SR (ZGW-API's)
  - Identity-laag klaar voor migratie naar Digitale-ID
  - Datalaag PostgreSQL/PostGIS → past in e-Suriname architectuur
  - REST-API met OpenAPI 3.0
- Bij start e-Suriname Fase 1: SDP wordt **één van de aansluiters** op S-Road
- Bij start e-Suriname Fase 2: SDP-vergunningenmodule wordt vervangen door of geïntegreerd met OpenZaak-SR
- SDP-meldpunt wordt vervangen door of doorgemigreerd naar Signalen-SR

**Voordeel**: snel beginnen, lerend bouwen, politiek mandaat verwerven
**Risico**: parallelle systemen, migratie-overhead, mogelijke verspilling

### Optie B — SDP wordt opgegaan in e-Suriname Fase 1
**Geen separate SDP-bouw; alles loopt direct via e-Suriname**.

- Wachten op Fase 0 (6 mnd) + Fase 1 start (18 mnd MVP)
- Eén consistent platform, geen migratie-pijn
- Vergt complete Fase 0 governance + wetgeving + financiering vooraf

**Voordeel**: één coherent systeem, geen wasted effort
**Risico**: 18+ maanden niets zichtbaars, politiek momentum verloren, gates kunnen falen

### Optie C — SDP als onafhankelijk traject, e-Suriname als ambitie-pad
**SDP wordt gebouwd en blijft district-platform; e-Suriname is een aparte nationale visie**.

- SDP eigenaarschap blijft bij Min. RO
- e-Suriname is breder dan alleen districten — burger-portaal, basisregisters, etc.
- Beide bestaan naast elkaar; later koppelen via S-Road

**Voordeel**: politieke duidelijkheid (RO heeft eigen platform), beide kunnen tempo bepalen
**Risico**: duplicatie van werk, inconsistente burger-ervaring, twee codebases

## Aanbeveling — Optie A (SDP als compatibele voorloper)

### Waarom A
1. **Tempo**: 3–6 mnd MVP = politiek bewijs
2. **Risico-reductie**: e-Suriname Fase 0 governance loopt parallel, kan vertraging oplopen zonder SDP-stilstand
3. **Lerend bouwen**: SDP geeft veld-input voor e-Suriname architectuur (wat werkt in DC-praktijk?)
4. **Funding-bewijs**: SDP-resultaten = onderbouwing voor DLGP-III aanvraag
5. **Compatibiliteit**: mits architectuur disciplined wordt aangehouden, is migratie naar e-Suriname haalbaar

### Voorwaarden voor SDP-bouw onder Optie A

SDP moet vanaf dag 1 deze e-Suriname-compatibele keuzes maken:

| Beslissing | Verplicht |
|------------|-----------|
| OpenAPI 3.0 spec voor alle endpoints | ✅ |
| PostgreSQL + PostGIS database | ✅ |
| Datamodel met ZGW-zaak-concepten (zaak, status, statustype, eigenaar) | ✅ |
| OAuth2/OpenID Connect auth-laag (pluggable) | ✅ |
| RBAC + Row-Level Security | ✅ |
| Append-only audit log | ✅ |
| Open source codebase (vermijdt licentie-issues bij migratie) | ✅ |
| Containerized + Kubernetes-ready (Haven-compatible) | ✅ |
| Géén AWS-specifieke services (Lambda, DynamoDB, Cognito) | ✅ |
| Documenten via S3-compatible storage + CMIS-ready | aanbevolen |
| Workflow-engine pluggable (later vervangen door BPMN/OpenZaak) | aanbevolen |

### Migratiepad SDP → e-Suriname (toekomstig)

```
SDP MVP (mnd 0-6)
  └─ produceert: 1 district digitaal, audit-log, dossiers
        │
        ▼
SDP Fase 2 (mnd 6-18)
  └─ multi-district uitrol, basis-integratie
        │
        ▼ (e-Suriname Fase 0 + start Fase 1)
        │
        ▼
S-Road wordt operationeel (mnd 12-18)
  └─ SDP krijgt eigen Security Server
  └─ SDP publiceert services via S-Road
  └─ SDP gaat CBB/MI-GLIS bevragen via S-Road i.p.v. eigen kopie
        │
        ▼
Identity-laag SDP wordt vervangen door Digitale-ID SSO (mnd 18-24)
  └─ SDP-gebruikers krijgen Digitale-ID-koppeling
        │
        ▼
SDP-vergunningenmodule wordt OpenZaak-SR (Fase 2 e-Suriname)
  └─ SDP-zaken worden gemigreerd naar OpenZaak-SR
  └─ SDP behoudt district-specifieke UI/workflows die OpenZaak niet biedt
        │
        ▼
SDP-meldpunt wordt Signalen-SR (Fase 1 e-Suriname)
  └─ Lopende meldingen worden gemigreerd
        │
        ▼
SDP-restanten: districts-specifieke modules zonder e-Suriname-equivalent
  └─ blijven binnen e-Suriname als district-extensies
  └─ of worden onderdeel van OpenZaak-SR landschap
```

## Praktisch — wat te doen nu

### Als beleid kiest voor Optie A
1. **Start SDP bouw** volgens [`../docs/03-stappenplan.md`](../docs/03-stappenplan.md)
2. **Start parallel Fase 0 e-Suriname** governance & wetgeving — zelfs zonder volledige Fase 1 financiering
3. **Maak SDP-architectuur disciplined e-Suriname-compatible** (zie bovenstaande tabel)
4. **Voorkom SDP-features die later weggegooid worden**:
   - Geen eigen identity-provider die niet pluggable is
   - Geen propriëtaire workflow die later niet naar BPMN/OpenZaak migreert
5. **Maak SDP-team beschikbaar voor e-Suriname kennisdeling** zodra Agentschap operationeel

### Als beleid kiest voor Optie B
- Stop SDP-bouw; wacht op e-Suriname Fase 0 + Fase 1
- Politiek risico: 18+ maanden niets zichtbaars, mogelijk verlies momentum
- Risico op falen Fase 0 gates (Privacywet, financiering) → langere stilstand

### Als beleid kiest voor Optie C
- SDP bouwen volgens [`../docs/`](../docs/) zonder e-Suriname-compatibiliteit-eisen
- e-Suriname-spoor onafhankelijk uitvoeren
- Accepteren: twee codebases, twee teams, mogelijke inconsistente burger-ervaring

## Open vragen (voor de opdrachtgever)

1. Wie is de ultieme opdrachtgever — Min. RO (SDP-spoor) of Kabinet van de President (e-Suriname-spoor)?
2. Is er politieke ruimte voor Fase 0 wetgevingstraject e-Suriname binnen 6 maanden?
3. Is er funding beschikbaar voor SDP (Optie A vereist beperkt budget) en zo ja, uit welke begroting?
4. Is er commitment om SDP later op te laten gaan in e-Suriname (Optie A)?
5. Wat is de prioriteit: snelheid (Optie A) of integraliteit (Optie B)?

Zonder antwoord op deze vragen blijft de keuze tussen A/B/C politiek-strategisch, niet technisch.

## Eindbeoordeling

Beide sporen zijn **complementair, niet concurrerend**, mits goed geregisseerd. De grootste **risk** is een Optie C scenario waar de twee onafhankelijk doorgaan zonder coördinatie — dat levert dubbel werk, inconsistente burger-ervaring en politiek-bestuurlijke verwarring op.

De grootste **opportunity** is Optie A met disciplined architectuur — snel zichtbaar resultaat én een pad naar het bredere e-Suriname zonder weggegooid werk.
