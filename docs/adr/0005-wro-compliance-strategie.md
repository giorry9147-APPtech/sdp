# ADR 0005 — WRO-compliance: gefaseerde implementatie

**Status:** geaccepteerd
**Datum:** 2026-05-26

## Context

De **Wet Regionale Organen** (S.B. 1989 No. 44, gew. S.B. 2000 No. 93 + S.B.
2002 No. 54) telt 65 artikelen. Volledige technische implementatie zou
6-12 maanden ontwikkelwerk kosten en raakt onderwerpen die buiten een
bestuursplatform liggen (verkiezingsuitslagen, rechterlijke macht,
DNA-procesgang, Staatsraad).

Volledige inventarisatie staat in [`docs/08-wro-compliance.md`](../08-wro-compliance.md).

Zonder strategie ontstaan twee risico's:
1. **Onvolledige compliance verkocht als compleet** — jurist/auditor
   denkt dat het systeem alle wettelijke flows afdwingt terwijl gaten
   bestaan.
2. **Scope creep** — elke WRO-artikel wordt verleidelijk om "even" te
   bouwen, MVP wordt onafmaakbaar.

## Beslissing

### 1. Drie scope-cirkels

| Cirkel | Wat | In SDP? |
|--------|-----|---------|
| **Kern** | Bestuurswerk dat DC/RR/DR dagelijks doet | ✅ binnen MVP/Fase 2 |
| **Schil** | Toezicht, verordening-publicatie, jaarverslag | 🟡 alleen waar SDP de data bezit |
| **Buiten** | Verkiezingen, DNA-toetsing, Staatsraad, rechterlijke macht | 📋 nooit in SDP — stubs met externe link |

### 2. Hardheid van regels

Elke WRO-bepaling die we implementeren krijgt een **hardheid**:

- **HARD** — code blokkeert overtreding. Bv. art. 41 lid 2: behandeling
  ontwerp-verordening is openbaar → API weigert publieke route te
  serveren als status nog `CONCEPT` is.
- **ZACHT** — code waarschuwt of vraagt expliciete bevestiging. Bv. art.
  51 lid 1: ressortplan eind februari → dashboard-warning bij overschrijden.
- **INFORMATIEF** — alleen tonen wat de wet zegt. Bv. art. 14
  parlementaire immuniteit van DR-leden → info-tooltip, geen technisch
  effect.

### 3. Per-fase prioritering

| Fase | WRO-artikelen | Waarom |
|------|---------------|--------|
| **MVP (af)** | 1, 2, 17, 28, 31, 47.1c-d, 51.1-2, 52.1 | Workflow ressortplan→districtsplan + DC-rol + fonds |
| **Fase 2 (sprint 17-20)** | 1.2 (beleidsgebieden), 36-45 (verordeningen), 51-56 (deadlines) | Wettelijke planning-cyclus + lokale regelgeving |
| **Fase 2 (sprint 21-24)** | 15, 26 (jaarverslagen), 50 (burgerparticipatie) | Compliance-output: jaarverslag aan Min/SR/DNA |
| **Fase 3** | 34-35 (Regionale Commissaris), 57-61 (toezicht), 39 (handhaving) | Politiek-gevoelig; vereist eerst meerdere districten in productie |
| **Buiten code** | 3-10, 17-22 (eedaflegging, geloofsbrieven), 32 (eed DC), 16, 27 (Reglement van Orde) | Juridische documenten, niet workflow |

### 4. Stub-strategie voor externe partijen

Wanneer een WRO-flow afhangt van een partij buiten SDP, bouwen we een
**status-stub** in plaats van een integratie:

- **DNA-toetsing verordening (art. 43)** — `Status: INGEDIEND_BIJ_DNA`
  met `dnaIngediendOp` + handmatige status-update door districts-
  secretaris zodra DNA reageert. Geen API-koppeling. Wel
  PDF-bijlage-veld voor het DNA-bericht.
- **Staatsraad schorsing (art. 58 lid 2)** — `BesluitSchorsing`-tag op
  betrokken entiteit, met externe referentie.
- **Vaststelling President + Staatsblad (art. 45)** — twee handmatige
  status-velden + verwijzing naar Staatsblad-nummer.

### 5. Naamgeving in code

Alle WRO-gerelateerde velden/enums krijgen `WRO`-prefix of duidelijke
verwijzing om verschil te maken met procesneutrale waarden:

```ts
enum WROBeleidsgebied {
  NATUURLIJK_MILIEU              // art. 1 lid 2 bullet 1
  CIVIELTECHNISCHE_INFRA         // ...
  AGRARISCHE_INDUSTRIELE_ONTWIKKELING
  NUTSBEDRIJVEN
  ONDERWIJS_CULTUUR_SPORT
  MEDISCHE_SOCIALE_ZORG
  OVERIG                         // art. 1 lid 2 onder g (bij resolutie)
}
```

Comments verwijzen naar het artikel:
```ts
// WRO art. 51 lid 1 — uiterlijk eind februari aanbieden aan DR
deadlineWettelijk: Date
```

## Gevolgen

**Positief:**
- Jurist en auditor kunnen [`docs/08-wro-compliance.md`](../08-wro-compliance.md)
  als compliance-rapport gebruiken.
- Sprint-planning heeft duidelijke WRO-hooks per fase (zie
  [docs/03-stappenplan.md](../03-stappenplan.md)).
- Code-comments verwijzen consistent naar artikel-nummers — bij
  wetsherziening (art. 64 lid 1 noemt mogelijke staatsbesluit-updates)
  is impact-analyse mogelijk via grep.

**Negatief:**
- Pas wanneer Fase 3 af is, dekt SDP "volledige" WRO-implementatie. Tot
  die tijd is communicatie naar stakeholders ("wat doet SDP wel/niet")
  cruciaal.
- Stub-strategie voor DNA/Staatsraad betekent handmatige data-entry
  zolang er geen integratie is — risico op vergeten updates.

**Acties:**
- 08-wro-compliance.md wordt bijgehouden bij elke nieuwe feature.
- Nieuwe ADRs voor concrete sprints (bv. ADR 0006 voor verordeningen,
  ADR 0007 voor jaarverslag-generator) refereren terug naar deze ADR.

## Open vragen voor jurist (zie ook 08-wro-compliance.md)

1. Bestaande districtsverordeningen Districtsfonds per district?
2. Welke pre-1989 voorschriften zijn nog van kracht (art. 64 lid 1)?
3. Bestaan Regionale Commissarissen op dit moment?
