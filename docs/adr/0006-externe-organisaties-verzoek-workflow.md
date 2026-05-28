# ADR 0006 — Externe organisaties & verzoek-/adviesverzoek-workflow

**Status:** voorgesteld
**Datum:** 2026-05-28

## Context

Naast burgers (meldingen) en ondernemers (vergunningen) moeten ook
**externe overheidsdiensten** met het districtscommissariaat kunnen
communiceren via het SDP. Concreet noemde de opdrachtgever:

- **Grondbeleid & Bosbeheer (GBB)** / Dienst der Domeinen / SBB —
  gronduitgifte, houtconcessies
- **TCT** (Transport, Communicatie & Toerisme) — busroutes, standplaatsen
- **Economische Zaken (EZ)** — bedrijfsvergunningen, markten

Procesonderzoek (zie [11-externe-organisaties.md](../11-externe-organisaties.md))
toont aan dat dit verkeer vandaag op papier verloopt (rekest in tweevoud,
"door tussenkomst van …") en dat de DC daarin **twee verschillende rollen**
speelt:

1. **Adviseur** — geeft een *niet-bindend advies* op een procedure die de
   dienst leidt (domeingrond, bedrijfsvergunning, houtconcessie). De
   minister/dienst beslist.
2. **Beslisser** — verleent zelf een *bindende beschikking*
   (hindervergunning, markt-/standplaats).

De beslisser-rol is al geïmplementeerd als de Vergunning-module. Wat
ontbreekt is (a) externe organisaties + hun gebruikers als
eerste-klas-burgers in het systeem, en (b) het adviseur-kanaal.

De juridische grondslag voor de adviesrol zit in **sectorale wetten**
(Decreet Uitgifte Domeingrond S.B. 1982 No. 11, Hinderwet 1929, Wet
Bosbeheer S.B. 1992 No. 80) — **niet** in de Wet Regionale Organen.

## Beslissing

### 1. Eén generiek `Verzoek`-zaaktype (geen entiteit per dienst)

We bouwen géén aparte tabellen per dienst (`grond_verzoek`,
`transport_verzoek`, …). In plaats daarvan één generieke `Verzoek`-zaak
met `soort` (ADVIES/INFORMATIE/COORDINATIE) en `procedureType`
(DOMEINGROND/BEDRIJFSVERGUNNING/HOUTCONCESSIE/…). Dit volgt exact het
event-sourced patroon van `Melding` (zaak + `VerzoekEvent` +
`VerzoekBijlage`), is ZGW-mapbaar, en schaalt naar nieuwe procedure-types
zonder schemawijziging.

### 2. Nieuwe RBAC-scope `ORGANISATIE`

`RolScope` krijgt de waarde `ORGANISATIE`. `GebruikerRol` krijgt een
nullable `organisatieId`, analoog aan het bestaande `subregioId` voor
DC-clusters. Nieuwe rollen `extern_indiener` en `extern_beheerder`
(scope organisatie). DC/secretaris krijgen permissies erbij
(`verzoek.read.district`, `verzoek.beantwoord`), geen nieuwe rol.

### 3. Hergebruik van de bestaande auth-laag

Externe-dienst-gebruikers loggen in via dezelfde pluggable
`IdentityProvider` (email/wachtwoord nu, Digitale-ID later). **Geen**
aparte auth-stack. Conform [ADR 0002](0002-pluggable-identity-provider.md)
blijven rollen + permissies altijd in de SDP-database.

### 4. Geen aparte frontend-app

Het portaal voor diensten is dezelfde `/dashboard` met permission-gated
navigatie (zoals DC vs. RO nu al verschillen). Een `extern_indiener` ziet
zijn eigen-organisatie-verzoeken + "nieuw verzoek"; de DC krijgt een
"Verzoeken"-inbox-tegel.

### 5. Gefaseerd, twee flagship-procedures

- **Fase 2a:** Organisatie + RBAC + generiek `Verzoek` + adviesverzoek-flow
  + dienst-portaal + DC-inbox. Flagship = **domeingrond-advies (GBB)** —
  best gedocumenteerd, juridisch hard, verplichte ~3-4 wk advies-SLA.
- **Fase 2b:** meer procedure-types (EZ-bedrijfsvergunning, SBB-houtconcessie,
  TCT-coördinatie), advies-fan-out naar meerdere adviseurs, deadline-reminders.
- **Fase 3:** Digitale-ID SSO + uitwisseling over S-Road i.p.v. directe login.

## Gevolgen

**Positief**
- Eén zaakmodel voor alle inter-bestuurlijke verzoeken; minimale
  schema-footprint; ZGW-/OpenZaak-mapbaar.
- Hergebruikt auth, RBAC-scope-mechaniek, event-sourcing, `StorageService`
  (B1), `AuditService`, en "Mijn taken" (C3) zonder herbouw.
- Modelleert de adviseur/beslisser-dualiteit correct: advies (`oordeel` +
  motivatie) vs. de al bestaande beschikking (Vergunning-module).

**Aandachtspunten**
- Nieuwe scope `ORGANISATIE` raakt de `RbacGuard` scope-check — moet
  expliciet getest worden dat een dienst-gebruiker nóóit district-data ziet.
- Externe gebruikers in dezelfde `gebruikers`-tabel vergroot het
  aanvalsoppervlak; 2FA (A1) sterk aanbevolen voor `extern_beheerder`.
- Juridische citaten zijn **sectoraal**, niet WRO — code-comments moeten
  dat reflecteren (anders breekt grep-search bij wetsherziening).

**Grenzen (bewust niet)**
- Geen kadaster-functionaliteit (MI-GLIS/Hypotheekkantoor blijven autoriteit).
- Geen binnenland-bosflow zonder traditioneel-gezag-consultatie.
- TCT als coördinatie/kennisgeving, niet als bindende advies-gate (geen
  wettelijke grondslag gevonden).

## Alternatieven overwogen

1. **Entiteit per dienst** — verworpen: rigide, schaalt niet, dupliceert
   workflow-code.
2. **Externe diensten als variant van `ondernemer`/aanvrager** — verworpen:
   verkeerde semantiek (G2G ≠ B2G), geen organisatie-scope, geen
   advies-output.
3. **Hindervergunning hergebruiken voor alles** — verworpen: hindervergunning
   is de DC-*beslisser*-rol (bindend); advies is fundamenteel anders
   (niet-bindend, dienst beslist).
4. **Aparte portaal-app** — verworpen: dupliceert auth/shell/deploy; de
   permission-gated `/dashboard` dekt het al.
