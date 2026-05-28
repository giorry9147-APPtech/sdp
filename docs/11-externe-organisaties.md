# 11 — Externe organisaties: verzoeken & adviesverzoeken aan het DC

> Ontwerp voor het laten inloggen van **externe overheidsdiensten**
> (Grondbeleid & Bosbeheer, SBB, TCT, Economische Zaken, …) zodat zij
> verzoeken en adviesverzoeken kunnen indienen bij het
> districtscommissariaat — en de DC die kan beantwoorden.
>
> Status: **ontwerp** (Fase 2). Implementatie-checklist staat in
> [09-backlog.md](09-backlog.md) (Module P, items `EO1`–`EO21`).
> Architectuurbesluit: [ADR 0006](adr/0006-externe-organisaties-verzoek-workflow.md).

---

## 1. Het probleem in één zin

Vandaag verloopt het verkeer tussen nationale diensten en het
districtscommissariaat **op papier** (rekest in tweevoud, plakzegel,
"door tussenkomst van …"). Het SDP wordt de digitale voordeur waarin
een dienst een gestructureerd verzoek indient, de DC reageert, en het
hele spoor onveranderbaar wordt gelogd.

## 2. De kerninzicht: DC heeft twee rollen, niet één

Uit het procesonderzoek (zie §8 bronnen) blijkt dat de DC op twee
fundamenteel verschillende manieren met diensten samenwerkt:

| Rol DC | Output | Bindend? | Voorbeelden | Wettelijke grondslag |
|--------|--------|----------|-------------|----------------------|
| **Adviseur** | een *advies* (positief / negatief / voorwaardelijk) | nee — de dienst/minister beslist | domeingrond-uitgifte, bedrijfsvergunning, houtconcessie | Decreet Uitgifte Domeingrond S.B. 1982 No. 11; Wet Bedrijven en Beroepen; Wet Bosbeheer S.B. 1992 No. 80 |
| **Beslisser** | een *beschikking* | ja — DC verleent zelf | hindervergunning, markt-/standplaats | Hinderwet 1929 |

**Belangrijk:** de *beslisser*-rol is al gebouwd — dat is de bestaande
[Vergunning-module](../apps/api/src/vergunningen/) (categorie `VRG-HINDER`,
`VRG-MARKT`). Wat ontbreekt is de **adviseur**-rol: een kanaal waarin een
externe dienst een procedure leidt en de DC om advies vraagt.

> **Juridische noot:** de adviesplicht/-recht staat **niet** in de Wet
> Regionale Organen maar in de **sectorale wetten**. In code citeren we
> daarom de sectorale wet, niet de WRO:
> `// Decreet Uitgifte Domeingrond S.B. 1982 No. 11 — DC-advies`.

## 3. Hoe het past in het bestaande geheel

Het SDP is bewust ZGW-/zaakgericht ontworpen (zie
[04-architectuur.md](04-architectuur.md) en
[ADR 0002](adr/0002-pluggable-identity-provider.md)). Het nieuwe
`Verzoek` is gewoon een **zaak** met dezelfde patronen die meldingen en
vergunningen al gebruiken:

| Bestaand patroon | Hergebruik voor Verzoek |
|------------------|--------------------------|
| Pluggable `IdentityProvider` (email/pw → Digitale-ID) | Externe-dienst-gebruikers loggen via dezelfde laag in. **Geen** nieuwe auth-stack. |
| RBAC met scope (`NATIONAAL`/`DISTRICT`/`RESSORT`) | Nieuwe scope `ORGANISATIE` + `organisatieId` op `GebruikerRol`. |
| `Melding` + `MeldingEvent` + `MeldingBijlage` event-sourced workflow | `Verzoek` + `VerzoekEvent` + `VerzoekBijlage` — identiek model. |
| `StorageService` presigned S3/MinIO upload (B1) | Bijlages bij verzoeken hergebruiken dit 1-op-1. |
| `AuditService` append-only log | Elke indiening + antwoord + statuswissel gelogd. |
| Dashboard met permission-gated nav ([shell.tsx](../apps/web/src/app/dashboard/shell.tsx)) | DC krijgt tegel "Inkomende verzoeken"; dienst-gebruiker ziet een eigen portaal-view. |
| `dashboards/mijn-taken` cross-module (C3) | Openstaande adviesverzoeken verschijnen automatisch in "Mijn taken". |

**Conclusie:** dit is geen nieuwe architectuur, het is een vijfde
zaaktype bovenop de bestaande fundamenten. Dat is precies de e-Suriname
"Optie A"-lijn uit [docs-claude/10-relatie-sdp.md](../docs-claude/10-relatie-sdp.md):
elk zaaktype is later mapbaar op een OpenZaak-SR `zaak` en publiceerbaar
via S-Road.

## 4. Datamodel

### 4.1 `Organisatie` — de externe dienst

```prisma
enum OrganisatieType {
  MINISTERIE        // bv. GBB, TCT, EZ
  DIENST            // bv. Dienst der Domeinen, SBB
  PARASTATAAL       // bv. nutsbedrijf
  ANDER
}

model Organisatie {
  id          Int             @id @default(autoincrement())
  code        String          @unique   // "GBB", "SBB", "TCT", "EZ"
  naam        String                     // "Ministerie van Grondbeleid en Bosbeheer"
  korteNaam   String?                    // "Grondbeleid & Bosbeheer"
  type        OrganisatieType
  actief      Boolean         @default(true)
  contactEmail String?
  createdAt   DateTime        @default(now())

  gebruikerRollen GebruikerRol[]
  verzoeken       Verzoek[]   @relation("VerzoekBron")
  // wettelijke domeinen die deze org afhandelt (vrije tags, voor filtering)
  domeinen        String[]               // ["domeingrond","houtconcessie"]

  @@map("organisaties")
}
```

### 4.2 `Verzoek` — de zaak

```prisma
enum VerzoekSoort {
  ADVIESVERZOEK     // DC moet een advies teruggeven (niet-bindend)
  INFORMATIEVERZOEK // DC levert informatie
  COORDINATIEVERZOEK// kennisgeving/afstemming (bv. TCT busroute)
}

enum VerzoekStatus {
  INGEDIEND
  IN_BEHANDELING
  EXTRA_INFO_NODIG
  BEANTWOORD          // DC heeft advies/antwoord gegeven
  INGETROKKEN         // dienst trekt het verzoek terug
  GESLOTEN
}

enum AdviesOordeel {
  POSITIEF
  NEGATIEF
  VOORWAARDELIJK
  GEEN_BEZWAAR
  NIET_VAN_TOEPASSING
}

model Verzoek {
  id              Int           @id @default(autoincrement())
  referentie      String        @unique   // "VZK-2026-WAN-XXXX"
  bronOrganisatieId Int         @map("bron_organisatie_id")
  districtId      Int           @map("district_id")
  ressortId       Int?          @map("ressort_id")
  soort           VerzoekSoort
  procedureType   String        @map("procedure_type") // "DOMEINGROND" | "BEDRIJFSVERGUNNING" | ...
  status          VerzoekStatus @default(INGEDIEND)
  onderwerp       String
  omschrijving    String        @db.Text
  wettelijkeGrondslag String?   @map("wettelijke_grondslag") // sectorale wet
  locatieOmschrijving String?   @map("locatie_omschrijving")
  geom            Unsupported("geography(Point, 4326)")?
  // externe referentie van de dienst (bv. LAD-nummer bij domeingrond)
  externeReferentie String?     @map("externe_referentie")
  deadline        DateTime?                 // door dienst gevraagde antwoorddatum

  // het antwoord van de DC
  oordeel         AdviesOordeel?
  antwoord        String?       @db.Text
  beantwoordDoorId String?      @map("beantwoord_door_id")
  beantwoordOp    DateTime?     @map("beantwoord_op")

  createdAt       DateTime      @default(now()) @map("created_at")
  updatedAt       DateTime      @updatedAt @map("updated_at")

  bronOrganisatie Organisatie   @relation("VerzoekBron", fields: [bronOrganisatieId], references: [id])
  district        District      @relation(fields: [districtId], references: [id])
  ressort         Ressort?      @relation(fields: [ressortId], references: [id])
  beantwoordDoor  Gebruiker?    @relation(fields: [beantwoordDoorId], references: [id])
  events          VerzoekEvent[]
  bijlages        VerzoekBijlage[]

  @@index([districtId, status, createdAt(sort: Desc)])
  @@index([bronOrganisatieId, status])
  @@map("verzoeken")
}
```

`VerzoekEvent` en `VerzoekBijlage` zijn 1-op-1 kopieën van het melding-
patroon (event-sourced timeline + S3-bijlages). Niet hier uitgeschreven.

### 4.3 Koppeling aan `Gebruiker` / `GebruikerRol`

```prisma
// RolScope krijgt een waarde erbij
enum RolScope {
  NATIONAAL
  DISTRICT
  RESSORT
  ORGANISATIE   // nieuw — externe dienst
}

// GebruikerRol krijgt een nullable organisatieId
model GebruikerRol {
  // … bestaand …
  organisatieId Int?  @map("organisatie_id")
  organisatie   Organisatie? @relation(fields: [organisatieId], references: [id])
}
```

`AuthenticatedUser.rollen[]` (zie [common/types.ts](../apps/api/src/common/types.ts))
krijgt een `organisatieId?` veld erbij, analoog aan het bestaande
`subregioId`.

## 5. RBAC — nieuwe rollen & permissies

### Rollen

| Rol | Scope | Omschrijving |
|-----|-------|--------------|
| `extern_indiener` | organisatie | Dienst-medewerker — dient verzoeken in, volgt eigen organisatie-verzoeken |
| `extern_beheerder` | organisatie | + beheert gebruikers van de eigen organisatie, ziet álle org-verzoeken |

DC, districtssecretaris (en optioneel vergunningmedewerker) krijgen er
permissies bij — geen nieuwe rol nodig.

### Permissies

| Permissie | extern_indiener | extern_beheerder | dc | secr | vergun |
|-----------|:-:|:-:|:-:|:-:|:-:|
| `verzoek.indienen` (namens eigen org) | ✅ | ✅ | — | — | — |
| `verzoek.read.eigen_organisatie` | ✍ eigen | ✅ org-breed | — | — | — |
| `verzoek.intrekken` (eigen org) | ✍ | ✅ | — | — | — |
| `verzoek.read.district` (inkomend) | — | — | ✅ | ✅ | 👁 |
| `verzoek.behandel` (status, info-vraag) | — | — | ✅ | ✅ | ✅ |
| `verzoek.beantwoord` (advies/beschikking) | — | — | ✅ | 🟡 | — |
| `organisatie.beheer` (orgs + hun users) | — | — | — | — | — | (super_admin / `ro_directeur_decentralisatie`) |

Scope-isolatie: een `extern_indiener` ziet **alleen** verzoeken van de
eigen `organisatieId`; een DC ziet **alleen** verzoeken met de eigen
`districtId`. Beide afgedwongen in de service-laag én (Fase 3) via
Postgres Row-Level Security, conform [05-rollen-permissies.md](05-rollen-permissies.md) §scope-isolatie.

## 6. Workflow

```
            dienst (extern_indiener)              DC / secretaris
            ─────────────────────────            ──────────────────
INGEDIEND ──┤ verzoek.indienen
            │                                     verschijnt in
            │                                     "Inkomende verzoeken"
            │                                     + "Mijn taken" (C3)
            ▼
IN_BEHANDELING ◄──────────────────────────────── verzoek.behandel
            │                                     (DC pakt op)
            │
   ┌────────┤
   │        ▼
   │   EXTRA_INFO_NODIG ──► dienst vult aan ──► IN_BEHANDELING
   │
   ▼
BEANTWOORD ◄───────────────────────────────────  verzoek.beantwoord
            │                                     (oordeel + motivatie
            │                                      + ondertekenaar)
            │   dienst ziet het advies in portaal
            ▼
GESLOTEN
```

Een **adviesverzoek** sluit af met een `AdviesOordeel` + motivatie (het
niet-bindende advies). Een **coördinatieverzoek** kan afsluiten met enkel
`GEEN_BEZWAAR`. De dienst neemt vervolgens zelf de eindbeslissing in haar
eigen systeem — het SDP claimt die beslissing niet.

## 7. De portalen (frontend)

Geen aparte app. We hergebruiken `/dashboard` met permission-gated nav
(zoals nu al voor DC vs. RO werkt):

- **Dienst-gebruiker** (`extern_indiener`/`extern_beheerder`) ziet:
  - landing met eigen-organisatie KPI's (open / beantwoord / deadline-nabij)
  - "+ Nieuw verzoek" wizard (kies district → procedure-type → onderwerp → bijlages)
  - lijst eigen verzoeken met status + DC-antwoord
- **DC/secretaris** ziet extra:
  - nav-item "Verzoeken" → inbox van inkomende verzoeken voor het district
  - detail met antwoord-formulier (`oordeel` + motivatie + onderteken)
  - inkomende adviesverzoeken tellen mee in "Mijn taken" (C3) en de
    deadline-widget (Fase 2, item 17.7)

De vijf flagship `procedureType`-waarden voor de MVP-uitrol (gekozen op
documenteerbaarheid + juridische hardheid):

| procedureType | Bron-org | DC-rol | Flagship? |
|---------------|----------|--------|-----------|
| `DOMEINGROND` | GBB / Dienst der Domeinen | adviseur (verplicht advies, ~3-4 wk SLA) | **ja — Fase 2a** |
| `BEDRIJFSVERGUNNING` | EZ / KKF | adviseur (consultatie) | Fase 2b |
| `HOUTCONCESSIE` | GBB / SBB | adviseur (kan gevraagd worden) | Fase 2b |
| `BUSROUTE` / `STANDPLAATS` | TCT | coördinatie/kennisgeving (géén wettelijke advies-gate) | Fase 2b |
| `TOERISME_INRICHTING` | TCT | via bestaande hindervergunning (Vergunning-module) | hergebruik |

## 8. Bewuste keuzes & grenzen

- **Geen kadaster** — domeingrond-advies verwijst naar perceel/LAD-nummer,
  maar meet/registreert niet. Hypotheekkantoor + MI-GLIS blijven autoriteit
  (CLAUDE.md-regel).
- **Gemeenschapsbos defer** — houtkap op gemeenschapsgrond loopt feitelijk
  via kapitein/granman, niet de DC. We laten een "traditioneel gezag
  geraadpleegd"-slot open maar bouwen geen binnenland-bosflow zonder
  VIDS/Marron-consultatie (zie [07-aanvullend-onderzoek.md](07-aanvullend-onderzoek.md)).
- **TCT = coördinatie, geen advies-gate** — we vonden geen wettelijke
  adviesplicht voor busvergunningen/telecommasten. Modelleren als
  `COORDINATIEVERZOEK`, niet als bindende stap. Niet juridisch overclaimen.
- **Ministerie-naam** — gebruik **GBB** (Grondbeleid & Bosbeheer); `RGB`
  is historische alias. "Ruimtelijke Ordening" zit nu bij een ander
  ministerie en is een aparte adviseur.
- **Auth** — bouw tegen **Digitale-ID** (`digitale-id.gov.sr`) als
  concreet OIDC-doel. X-Road/S-Road is doel-architectuur, **nog niet live**
  in 2026 — geen harde afhankelijkheid.

## 9. Migratiepad naar e-Suriname

1. **Fase 2** — SDP host de organisaties + gebruikers zelf (email/pw).
2. **Fase 2/3** — `Verzoek` mapt op een OpenZaak-SR `zaak`; advies-output
   wordt een ZGW `besluit`/`resultaat`.
3. **Fase 3** — dienst-gebruikers authenticeren via Digitale-ID SSO; de
   organisaties verdwijnen uit de SDP-userbase en komen via de
   identity-federatie. Verzoeken worden uitgewisseld over S-Road i.p.v.
   directe login (de dienst gebruikt dan haar eigen systeem en SDP
   consumeert/levert via de bus).

Dit is exact dezelfde gefaseerde lock-in-vermijding als
[ADR 0002](adr/0002-pluggable-identity-provider.md).

## 10. Bronnen (procesonderzoek)

- Domeingrond: [gov.sr/thema/grondaanvraag](https://gov.sr/thema/grondaanvraag/);
  Decreet Uitgifte Domeingrond S.B. 1982 No. 11 (gew. S.B. 2017 No. 85)
- Bosbeheer: [SBB Concessies & Vergunningen](https://sbb.sr/consessies-vergunningen/);
  Wet Bosbeheer S.B. 1992 No. 80
- TCT: [Ministerie van TCT](https://gov.sr/ministeries/ministerie-van-transport-communicatie-toerisme/);
  ordenende voorschriften S.B. 1992 No. 030/031/032
- EZ / hindervergunning: [EZ procedures](https://gov.sr/ministeries/ministerie-van-economische-zaken-ondernemerschap-technologische-innovatie/procedures-en-vergunningen-aanvraagprocedure/);
  Hinderwet 1929; KKF Handelsregister
- e-Suriname: [e-Government](https://gov.sr/ministeries/kabinet-van-de-president/e-government/);
  [Digitale-ID](https://digitale-id.gov.sr/)
- WRO-grondslag DC: [Wet Regionale Organen](wet-regionale-organen.md) (S.B. 1989 No. 44)

> Onzekerheden expliciet: de exacte KKF↔EZ↔DC-routing voor
> bedrijfsvergunning en de X-Road-productiestatus zijn niet volledig
> publiek geverifieerd. Bevestig met EZ/KKF resp. het e-Gov-programma
> vóór hard-coding.

---

## 11. Gap-analyse t.o.v. de e-Suriname-blauwdruk

Naast dit ontwerp ligt er een bredere blauwdruk:
[12-blauwdruk-esuriname-g2g-c2g.md](12-blauwdruk-esuriname-g2g-c2g.md)
(G2G + C2G via OpenZaak-SR / S-Road / MijnSuriname). Die blauwdruk is de
**noordster**; dit Module-P-ontwerp is de pragmatische SDP-voorloper
(Optie A). Onderstaande gap-analyse toont wat de blauwdruk toevoegt en
wat we dus in backlog + stappenplan moeten opnemen.

| # | Blauwdruk-element | Huidig plan | Gap → backlog |
|---|-------------------|-------------|---------------|
| 1 | G2G verzoek (ministerie → DC), DC = adviseur | ✅ Module P (`EO1`–`EO21`) | klein, uitbreiden |
| 2 | **C2G burgerverklaringen** (VGG, woonplaats, verloren-ID) — DC = **afgever** | ❌ ontbreekt | **GROOT — nieuwe Module Q** (`VK*`) |
| 3 | **Catalogus-gedreven zaaktypen** ("configuratie boven code") | ❌ `procedureType` is hardcoded enum | architectuurkeuze → `ZF*` (zaak-fundament) |
| 4 | **Vertrouwelijkheidaanduiding** op zaak/document (KPS-data!) | ❌ | `ZF*` |
| 5 | SLA per zaaktype + auto-escalatie (T-3 / T+0) | 🟡 17.7 deadline-widget bestaat | zaaktype-gedreven maken → `ZF*` |
| 6 | **CBB Personen-API** (auto-verrijking NAW/woonplaats) | 🟡 Module N, Fase 3 | naar voren halen (VGG-dependency) → `INT*` |
| 7 | **KPS Antecedenten-API** (hit/no-hit, vertrouwelijk) | ❌ | `INT*` |
| 8 | MI-GLIS Percelen-API (referentie, geen kadaster) | 🟡 Module N, Fase 3 | `INT*` |
| 9 | **Gekwalificeerde digitale handtekening** (eGov-PKI) + PDF/A-2 | 🟡 D5 alleen voor vergunning | generaliseren → `ZF*` |
| 10 | **QR-verificatieportaal** (`verify.gov.sr`) | ❌ | `VK*` |
| 11 | OIN-SR (org-id) + PCN (persistente burger-id) | 🟡 `Organisatie.code` bestaat; geen PCN | standaardiseren → `ZF*` |
| 12 | Notificaties-API + async callback naar ministerie | 🟡 H-module (email); geen callback | `EO*` Fase 2b |
| 13 | Machtiging (`burger_gemachtigde`) | ❌ | Fase 3 → `VK*` |
| 14 | Offline fallback (BIC scant papier in) + bypass-verbod | ❌ | `VK*` |
| 15 | OpenZaak-SR / S-Road target-architectuur | 🟡 `EO20`–`EO21` | blijft Fase 3 noordster |

### Drie kernbeslissingen die nú genomen moeten worden (vóór de bouw)

1. **Gedeeld zaak-fundament of aparte modellen?** De blauwdruk pleit voor
   één generiek `Zaak`-model (OpenZaak-SR). Onze code heeft nu aparte
   `Melding`/`Vergunning`/`Verzoek`. **Advies:** bouw `Verzoek` (G2G) en de
   nieuwe `Verklaring` (C2G) op een **gedeeld, catalogus-gedreven
   zaak-fundament** (`Zaaktype` + `Eigenschap` + `vertrouwelijkheid` +
   `Resultaat`-typen als data), zodat een nieuw verzoektype een seed-rij is,
   géén release. Laat `Melding`/`Vergunning` zoals ze zijn (werkend), maar
   maak ze later ZGW-mapbaar. Dit is backlog-cluster **`ZF` (zaak-fundament)**.
2. **C2G is een aparte capaciteit, geen variant van meldingen.** Een
   *verklaring* (DC geeft een document af aan een burger) is fundamenteel
   anders dan een *melding* (burger meldt probleem) of *vergunning*
   (toestemming). Nieuwe **Module Q — Burgerverklaringen** met **VGG als
   flagship**, want twee bronregisters (CBB, KPS) zijn deels digitaal en de
   DC blijft afgever.
3. **Integraties (CBB/KPS) worden vervroegd van Fase 3 naar Fase 2.** VGG
   kan niet zonder. We bouwen ze als **pluggable provider-stubs** (zelfde
   patroon als [ADR 0002](adr/0002-pluggable-identity-provider.md)): een
   `PersonenProvider`/`AntecedentenProvider`-interface met een mock-impl nu
   en een S-Road-impl later. Geen lock-in.

### Wat bewust Fase 3 / noordster blijft (niet nu bouwen)

- OpenZaak-SR draaien als apart zaaksysteem — wij blijven SDP-native, ZGW-mapbaar.
- S-Road message-bus + Security Servers — afhankelijk van e-Gov-programma (politiek risico, zie blauwdruk-caveat 6).
- Machtigingsregister, legalisatie-koppeling Hof van Justitie.
- VGG juridisch dichttimmeren via nieuw staatsbesluit (blauwdruk-caveat 1) — beleid, geen code.

> **Juridische noot VGG:** de grondslag is samengesteld (Reglement Beheer
> der Districten G.B. 1948 No. 155 + Instructie DC's S.B. 1990 No. 34),
> géén specifiek wetsartikel. Tag in code de samengestelde grondslag en
> markeer als juridisch te verstevigen.
