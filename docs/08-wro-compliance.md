# 08 — WRO-compliance mapping

> Per artikel van de **Wet Regionale Organen** (S.B. 1989 No. 44, gewijzigd bij
> S.B. 2000 No. 93 en S.B. 2002 No. 54): wat staat in de wet, wat zit in MVP,
> wat zijn de gaps en in welke fase ze landen.

Bronwet: [`docs/wet-regionale-organen.md`](wet-regionale-organen.md) (711 regels, 65 artikelen).
Strategie: [ADR 0005](adr/0005-wro-compliance-strategie.md).

---

## Hoe deze tabel lezen

| Status | Betekenis |
|--------|-----------|
| ✅ **Geïmplementeerd** | Werkt in de code, getest, in productie |
| 🟡 **Gedeeltelijk** | Basis-functionaliteit aanwezig, wettelijke details missen |
| ❌ **Niet in MVP** | Helemaal niet in code, gemarkeerd voor latere fase |
| 📋 **Buiten scope** | Bewust niet in SDP — hoort bij andere instantie (DNA, MI-GLIS, etc.) |

---

## HOOFDSTUK I — Algemene bepalingen

### Art. 1 — Definities (district, ressort, plannen)

| Element | Status | Realisatie |
|---------|--------|-----------|
| District als bestuurseenheid | ✅ | [`District`](../apps/api/prisma/schema.prisma) — 10 records geseed |
| Ressort als bestuurseenheid | ✅ | [`Ressort`](../apps/api/prisma/schema.prisma) — 62 records |
| Districtsplan-definitie | 🟡 | [`Districtsplan`](../apps/api/prisma/schema.prisma) — model + workflow, **mist beleidsgebieden uit lid 2** |
| Ressortplan-definitie | 🟡 | [`Ressortplan`](../apps/api/prisma/schema.prisma) — idem |

**Lid 2 (districtsplan-onderwerpen):**
> _natuurlijk milieu, civieltechnische infra, agrarische/industriële ontwikkeling, nutsbedrijven, onderwijs/cultuur/sport, medische/sociale zorg, andere bij resolutie_

**Gap:** geen `WROBeleidsgebied` enum op `RessortplanPrioriteit` / `DistrictsplanPrioriteit`. Bij toevoegen: dropdown in plan-editor + filter in rapportages. **Fase: 2 sprint 17-20.**

### Art. 2 — Regionale organen

- ✅ Districtsraad (DR), Ressortraad (RR), Districtsbestuur (DB) — alle drie als rol-context aanwezig (`dr_lid`, `rr_lid`, `dc`).
- 📋 Verkiezingsuitslag-administratie hoort bij Onafhankelijk Kiesbureau, niet SDP.

---

## HOOFDSTUK II — Inrichting regionale organen

### §1 — Districtsraad (art. 3-16)

| Bepaling | Status | Toelichting |
|----------|--------|-------------|
| Art. 3-4: samenstelling, voorzitterschap door DC | 🟡 | DC-rol bestaat, geen `Districtsraad`-entity met leden-lijst |
| Art. 6: einde lidmaatschap | ❌ | Geen UI voor lidmaatschap-management |
| Art. 7-8: eedaflegging, geloofsbrieven | ❌ | Geen workflow |
| Art. 10: openbare vergaderingen, stemmingsregels | ❌ | Geen vergader-/stemmingsmodule |
| Art. 11: vergaderfrequentie ≥1x/maand | ❌ | Geen agenda |
| Art. 12: regelgevende bevoegdheid → districtsverordening | ❌ | Compleet missend, zie art. 36-45 |
| **Art. 15: DR-jaarverslag (5 onderdelen, uiterlijk eind maart)** | ❌ | Generator niet aanwezig. Data is er gedeeltelijk (audit-log, plannen, meldingen) |
| Art. 16: Reglement van Orde | 📋 | Buiten code-scope, is juridisch document |

**Volgorde Fase 2-3:**
1. `Districtsraad`-entity (samenstelling + zittingsperiode) — sprint 13-16
2. Vergader-/agenda-module — sprint 17-20
3. Jaarverslag-generator (art. 15) — sprint 21-24
4. Verordening-module → zie art. 36-45 — sprint 17-20

### §2 — Ressortraad (art. 17-27)

Spiegel van §1, met verschillen:
- Art. 21: voorzitterschap door **oudste lid in jaren** (niet door DC) bij eerste vergadering
- **Art. 26: RR-jaarverslag uiterlijk eind februari** (1 maand vóór DR-deadline)

Status idem aan DR: rollen ✅, entity ❌, vergadering ❌, jaarverslag ❌.

### §3 — Districtsbestuur (art. 28-33)

| Bepaling | Status |
|----------|--------|
| Art. 28: DB = DC + min. vertegenwoordigers | 🟡 DC-rol alleen, geen "min-vertegenwoordiger"-rol |
| Art. 30: districtsbesluit (uitvoeringsbesluit) | ❌ |
| Art. 31: DC vertegenwoordigt Regering | ✅ via rol-scope |
| Art. 32: instructie + eed DC | 📋 buiten code |

### §4 — Regionale Commissaris (art. 34-35)

> Regio = meerdere districten, door President benoemde Regionale Commissaris.

- ❌ **Niet in MVP en niet in Fase 2.** Politiek-gevoelig (regio's komen niet vaak voor, en Sipa is al sub-bestuursrechtelijk complex).
- Indien ooit relevant: voeg `Regio`-entity toe boven `District` met aparte scope.

---

## HOOFDSTUK III — Regionale regelgeving

### Art. 36-45 — Districtsverordeningen

**Status:** ❌ **Compleet missend uit MVP.** Grootste WRO-gap.

Wettelijke workflow (art. 41-45):
```
CONCEPT
  → INGEDIEND_BIJ_DR         (door DC of DR-lid, art. 41)
  → AANGENOMEN_DR            (openbare vergadering, art. 41 lid 2)
  → BEKENDGEMAAKT            (DC-commissariaat + lokale dagbladen + Advertentieblad, art. 42 lid 2)
  → BEZWAARTERMIJN_3_WEKEN   (burgers kunnen bezwaar maken bij DNA, art. 42 lid 3)
  → INGEDIEND_BIJ_DNA        (binnen 1 week na DR-goedkeuring, art. 42 lid 1)
  → DNA_TOETSING_6_WEKEN     (art. 43 lid 1)
    → GEEN_BEZWAAR  → naar Minister
    → BEZWAREN      → terug naar DR, kan herzien indienen (art. 43 lid 2)
    → VERNIETIGD    (strijd Grondwet/wet/Regeerprogramma, art. 44)
  → VASTGESTELD_PRESIDENT    (op voordracht Minister, art. 45 lid 2)
  → GEPUBLICEERD_STAATSBLAD  (treedt na 30 dagen in werking als geen ingangsdatum, art. 45 lid 3)
```

Bijzondere gevallen:
- Art. 38: bestemmingsheffing-verordening behoeft **DNA-goedkeuring** (niet alleen geen-bezwaar)
- Art. 40: Districtsfonds-verordening behoeft **DNA-goedkeuring**

**Implementatie (Fase 2, sprint 17-20):**
- Nieuw model `Districtsverordening` met `Status` enum bovenstaand
- Workflow-events tabel (vergelijk `MeldingEvent`)
- DNA-flow als externe stub (geen integratie, alleen handmatige status-update door secretaris)
- PDF-generator voor publicatie

### Art. 39 — Geldboetes + verbeurdverklaring bij overtreding

- ❌ Niet in MVP. Hoort bij Vergunningen/Hinderwet en mogelijk een aparte handhaving-module.
- Fase 3 als handhaving-module relevant wordt.

### Art. 40 — Districtsfonds

| Lid | Status |
|-----|--------|
| Lid 1: fonds via districtsverordening + DNA-goedkeuring | 🟡 fonds bestaat, maar zonder DV-link |
| Lid 2: inkomsten (heffingen, boetes, andere) | 🟡 alleen `totaalBudget`, geen inkomstenbronnen-tabel |
| Lid 3: beheer door DB volgens DR-voorschriften | ✅ via `fonds.boek` / `fonds.goedkeur` permissies + 4-ogen approval |

**Geïmplementeerd in vorige sessie (Sprint 21-24):** approval-flow + audit-CSV.

---

## HOOFDSTUK IV — Regionale bestuursvoering

### Art. 46-50 — Dagelijks bestuur

| Bepaling | Status |
|----------|--------|
| Art. 47 lid 1a: uitvoering wetten/staatsbesluiten | 📋 hele rechtsorde, niet in 1 platform |
| Art. 47 lid 1b: openbare orde | 📋 politie/justitie |
| Art. 47 lid 1c: voorbereiding ressort-/districtsplannen | ✅ workflow aanwezig |
| Art. 47 lid 1d: beheer districtsfonds | ✅ |
| Art. 47 lid 1e-f: wegen, bruggen, plantsoenen | 🟡 via meldingen-categorie + projecten |
| Art. 47 lid 1g: gezondheidszorg, uitvaart | 🟡 via vergunningen-types |
| Art. 47 lid 1h-i: brand + rampen | ❌ apart crisismodule |
| **Art. 50: burgerparticipatie + communicatieproces** | 🟡 meldingen openen kanaal, geen formele consultaties |

**Burgerparticipatie-uitbreidingen (Fase 2, sprint 25-28):**
- Online consultatie-module
- Bevolkingssessie-agenda bij DC

### §2 — Planopstelling en begroting (art. 51-56)

**Belangrijke wettelijke deadlines:**

| Wanneer | Wie | Wat | Aan wie |
|---------|-----|-----|---------|
| Eind feb | RR | Ressortplan komend jaar | DR |
| Eind feb | RR | Ressort-jaarverslag (art. 26) | DR + DB + Min. |
| Eind maart | DR | Districtsplan komend jaar | Minister |
| Eind maart | DR | DR-jaarverslag (art. 15) | Min. + Staatsraad + DNA |
| Eind april | RR | Ressortbegroting komend jaar | DR |
| Eind mei | DR | Districtsbegroting komend jaar | Minister |

**Status:**
- ✅ Ressortplan → Districtsplan workflow aanwezig
- ❌ Wettelijke deadlines niet vastgelegd in schema (geen `deadlineWettelijk DateTime` of jaar-fase-berekening)
- ❌ Geen "aanstaande deadlines"-widget op dashboard
- ❌ Ressort-/districtsbegroting als aparte entiteit (los van Districtsfonds)

**Fase 2 sprint 17-20:**
1. Deadline-velden + berekening (jaar + maandnummer)
2. Dashboard-widget "wettelijke deadlines komende 30 dagen"
3. Email-reminder als deadline binnen 7 dagen valt en plan/begroting nog niet ingediend is

### §3 — Toezicht (art. 57-61)

Minister kan besluiten schorsen via Staatsraad (art. 58 lid 2).
DC kan RR-bevoegdheden tijdelijk laten overnemen door DR (art. 59).
DNA kan DR-bevoegdheden laten overnemen door 3-leden commissie (art. 60).
Minister kan DB-bevoegdheden tijdelijk overdragen aan DR (art. 61).

**Status:** ❌ Geen toezicht-/schorsing-workflow in MVP. Politiek zware module — **Fase 3 of later**.

---

## HOOFDSTUK V — Overgangs- en slotbepalingen (art. 62-65)

Geen code-impact. Wel ADR-waardig: art. 64 over voortbestaan oudere voorschriften → relevant voor Hinderwet (vergunningen) en waterschap-regels.

---

## Per-feature samenvatting

### Audit-log (`AuditLog`)
- Dekt impliciet art. 47 lid 1a (uitvoering wetten) door alle write-acties te loggen
- Bron voor jaarverslag-generator (art. 15, 26)

### Meldingen
- Dekt art. 47 lid 1e-f gedeeltelijk (wegen, plantsoenen via categorieën)
- Dekt art. 50 lid 1 (burgercommunicatie) als instap

### Vergunningen
- Dekt art. 47 lid 1g (gezondheidszorg via Hinderwet)
- Hinderwet-vergunning kan straks gerelateerd worden aan een districtsverordening (art. 36-45)

### Plannen
- Dekt art. 47 lid 1c, art. 51-52 voor het workflow-deel
- Mist art. 1 lid 2 beleidsgebieden + deadlines

### Districtsfonds
- Dekt art. 40 + art. 47 lid 1d (beheer)
- 4-ogen approval (sinds vorige sessie) is **niet wettelijk vereist** maar wel gangbare overheidspraktijk
- CSV-export ondersteunt CLAD-audit (Wet Fid art. 40 vereist auditor-betrokkenheid)

---

## Wettelijke deadlines per kalendermaand

Snel-overzicht voor implementatie van het deadline-widget:

```
┌─ FEB ─────────────────────────────────┐  ┌─ MAART ───────────────────────────────┐
│ • RR: ressortplan       → DR          │  │ • DR: districtsplan      → Minister   │
│ • RR: jaarverslag       → DR+DB+Min   │  │ • DR: jaarverslag        → Min+SR+DNA │
└───────────────────────────────────────┘  └───────────────────────────────────────┘
┌─ APRIL ───────────────────────────────┐  ┌─ MEI ─────────────────────────────────┐
│ • RR: ressortbegroting  → DR          │  │ • DR: districtsbegroting → Minister   │
│ • DB: bestuursverslag   → DR+Min      │  └───────────────────────────────────────┘
│   (art. 46 lid 3, vóór 1 april)       │
└───────────────────────────────────────┘
```

---

## Open vragen voor jurist

1. **Art. 1 lid 2 onder g** — "andere bij resolutie aan te geven onderwerpen": welke resoluties bestaan en moeten als hardcoded beleidsgebied erbij?
2. **Art. 38-40** — bestaande districtsverordeningen Districtsfonds: zijn die er per district? Welke heffingen lopen?
3. **Art. 50** — minimum-eisen burgerparticipatie: bestaat er een Reglement van Orde?
4. **Art. 64 lid 1** — welke pre-1989 voorschriften zijn nog van kracht? Welke verwerken we?
5. **Art. 34** — bestaan er Regionale Commissarissen op dit moment? (Vermoeden: nee.)
