# 05 — Rollen & permissies

## Principes

1. **Rol = wat doet deze persoon bestuurlijk of als gebruiker.** Permissies hangen aan de rol.
2. **Scope hoort bij de toewijzing** (nationaal / district / ressort / dorp / persoon).
3. **Identity via Digitale-ID** voor alle staf en burgers met account.
4. **Machtigingen** (DigiD Machtigen-equivalent) voor vertegenwoordigers van burgers/bedrijven.
5. **Audit op rolwijzigingen** — wie heeft wie wanneer welke rol gegeven, voor altijd traceerbaar.
6. **Least privilege** — liever twee smalle rollen dan één brede.

## Identity-niveaus (eIDAS-equivalent)

| Niveau | Methode | Toepassing |
|--------|---------|------------|
| **Laag** | Email + password | Burger leest publieke info, doet eenvoudige meldingen |
| **Substantieel** | Digitale-ID app + PIN | Burger ziet Persoonlijke Gegevens, doet aangiftes |
| **Hoog** | CBB e-ID kaart + chip-pin / e-paspoort NFC + biometrie | Digitale handtekening, gevoelige besluiten, raadsstemming |

Alle staf-rollen vereisen minimaal **substantieel** niveau. DC, Minister, Auditor en stemmingen vereisen **hoog**.

## Rollen

### Burger / ondernemer / instelling

| Rol | Niveau | Omschrijving |
|-----|--------|--------------|
| `burger` | laag/substantieel | Natuurlijke persoon met SUR-ID |
| `ondernemer` | substantieel | Eigenaar/bestuurder ingeschreven in KKF |
| `gemachtigde` | substantieel | Vertegenwoordigt burger of bedrijf (mantelzorger, accountant, advocaat) |
| `instelling` | substantieel | NGO, vereniging, religieuze instelling met KKF-inschrijving |
| `e-resident` | substantieel | Buitenlandse e-resident (Fase 4 — als ingevoerd) |

### Bestuurlijk — districtelijk

| Rol | Scope | Niveau | Omschrijving |
|-----|-------|--------|--------------|
| `dc` | district | hoog | Districtscommissaris (door President benoemd) |
| `districtssecretaris` | district | substantieel | Dagelijks beheer, vervangt DC |
| `bestuursopzichter` | bestuursressort | substantieel | Hoofd bestuursressort |
| `ressortcoordinator` | ressort | substantieel | Coördinator voor één ressort |
| `dr_lid` | district | hoog | Lid Districtsraad (DR) — stemt op besluiten |
| `dr_voorzitter` | district | hoog | DR-voorzitter |
| `rr_lid` | ressort | hoog | Lid Ressortraad (RR) — stemt op besluiten |
| `rr_voorzitter` | ressort | hoog | RR-voorzitter |
| `vergunningmedewerker` | district | substantieel | Behandelt vergunningaanvragen |
| `projectmedewerker` | district | substantieel | Beheert projecten |
| `financieel_medewerker` | district | substantieel | Begroting, uitgaven, Wet Fid |
| `meldingen_medewerker` | district/ressort | substantieel | Verwerkt binnenkomende meldingen |
| `inspecteur` | district | substantieel | Veldcontroles (mobiel) |
| `gis_medewerker` | district | substantieel | GIS-beheer per district |

### Bestuurlijk — traditioneel (Fase 3)

| Rol | Scope | Niveau | Omschrijving |
|-----|-------|--------|--------------|
| `granman` | binnenland (groep dorpen) | hoog | Paramount chief Marron-gemeenschap |
| `kapitein` | dorp | substantieel | Dorpshoofd binnenland (Inheems of Marron) |
| `basja` | dorp | substantieel | Onderhoofd / assistent kapitein |

### Nationaal

| Rol | Scope | Niveau | Omschrijving |
|-----|-------|--------|--------------|
| `president` | nationaal | hoog | President — symbolisch lezen, geen actief gebruik |
| `vp` | nationaal | hoog | Vice-president |
| `minister` | ministerie | hoog | Minister van betreffend ministerie |
| `sg` | ministerie | hoog | Secretaris-generaal |
| `directeur` | directoraat | substantieel | Directeur (bv. Decentralisatie, e-Government) |
| `beleidsmedewerker` | ministerie | substantieel | Analyse, rapportages |
| `dna_lid` | DNA | hoog | Lid De Nationale Assemblée |
| `dna_griffier` | DNA | substantieel | Griffie ondersteuning |
| `auditor` | nationaal | hoog | CLAD — read-only over alles + audit log |
| `commissaris_pdp` | nationaal | hoog | Commissaris Persoonsgegevensbescherming (Privacywet Hfst VII) |

### e-Suriname Agentschap

| Rol | Scope | Niveau | Omschrijving |
|-----|-------|--------|--------------|
| `agentschap_directeur` | platform | hoog | Directeur e-Suriname Agentschap |
| `agentschap_architect` | platform | substantieel | Platform-architecten |
| `agentschap_engineer` | platform | substantieel | Engineers |
| `agentschap_security` | platform | hoog | Security lead + SOC |
| `sisi_admin` | S-Road | hoog | SISI / S-Road governance |
| `sisi_engineer` | S-Road | substantieel | S-Road engineers |
| `csirt` | nationaal | hoog | National CSIRT operators |

### Externe partijen

| Rol | Scope | Niveau | Omschrijving |
|-----|-------|--------|--------------|
| `journalist` | publiek | laag | Toegang Open Data + persaccount voor embargoes |
| `onderzoeker` | publiek | substantieel | Toegang geaggregeerde data |
| `consultant` | tijdelijk | substantieel | Externe inhuur — automatische einddatum |
| `developer_third_party` | API | substantieel | Externe ontwikkelaar met API-key |

## Permissie-matrix — burgerdiensten (samenvatting)

✅ volledig · 👁 alleen lezen · ✍ eigen records · 🟡 met goedkeuring · — geen

| Permissie | burger | ondern | gemacht | DC | secr | vergun | meld | minister | auditor |
|-----------|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Berichtenbox eigen | ✅ | ✅ | ✅* | — | — | — | — | — | 👁 |
| Persoonlijke Gegevens lezen | ✅ | ✅ | ✅* | — | — | — | — | — | 👁 |
| Persoonlijke Gegevens correctieverzoek | ✅ | ✅ | ✅* | — | — | — | — | — | — |
| Lopende Zaken eigen | ✅ | ✅ | ✅* | — | — | — | — | — | 👁 |
| Aangifte doen (geboorte/etc.) | ✅ | — | ✅* | — | — | — | — | — | — |
| Verhuisaangifte | ✅ | — | ✅* | — | — | — | — | — | 👁 |
| Vergunning aanvragen | ✅ | ✅ | ✅* | — | — | — | — | — | 👁 |
| Vergunning behandelen | — | — | — | ✅ | ✅ | ✅ | — | — | 👁 |
| Vergunning goedkeuren | — | — | — | ✅ | 🟡 | — | — | — | 👁 |
| Melding doen (Signalen-SR) | ✅ | ✅ | ✅* | — | — | — | — | — | 👁 |
| Melding behandelen | — | — | — | ✅ | ✅ | — | ✅ | — | 👁 |
| Subsidie aanvragen | ✅ | ✅ | ✅* | — | — | — | — | — | 👁 |
| Klacht/bezwaar indienen | ✅ | ✅ | ✅* | — | — | — | — | — | 👁 |
| Open Data downloaden | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ |
| Participeren (RR-consultatie) | ✅** | ✅** | — | — | — | — | — | — | 👁 |

\* met expliciete machtiging  ·  \** alleen voor eigen ressort

## Permissie-matrix — bestuurlijk

| Permissie | DC | secr | ressort coord | dr_lid | rr_lid | vergun | meld | financ | inspect | minister | auditor |
|-----------|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| Zaaksysteem dossier eigen | ✅ | ✅ | ✅* | — | — | ✅ | ✅ | ✅ | ✍ | — | 👁 |
| Zaaksysteem dossier district | ✅ | ✅ | ✅* | 👁 | 👁* | ✅ | ✅ | ✅ | ✍ | 👁 | 👁 |
| VOLIS-SR vergadering bekijken | ✅ | ✅ | ✅ | ✅ | ✅* | 👁 | 👁 | 👁 | — | 👁 | 👁 |
| VOLIS-SR stemmen | — | — | — | ✅ (DR) | ✅ (RR) | — | — | — | — | — | — |
| Vergadering plannen | ✅ | ✅ | ✅ | 🟡 | 🟡 | — | — | — | — | — | — |
| Notulen tekenen | ✅ | ✅ | — | — | — | — | — | — | — | — | — |
| Budget aanmaken | ✅ | ✅ | — | — | — | — | — | ✅ | — | — | 👁 |
| Budget goedkeuren | ✅ | — | — | ✅ (DR) | — | — | — | — | — | 🟡 | 👁 |
| Uitgave registreren | 👁 | ✅ | — | — | — | — | — | ✅ | — | — | 👁 |
| Uitgave goedkeuren | ✅ | — | — | — | — | — | — | 🟡 | — | — | 👁 |
| Project aanmaken | ✅ | ✅ | — | — | — | — | — | — | — | ✅ | 👁 |
| GIS-laag bewerken | 🟡 | 🟡 | — | — | — | — | — | — | ✅ | — | 👁 |
| Bekendmaking publiceren | ✅ | ✅ | — | — | — | — | — | — | — | ✅ | 👁 |
| Districtsraad-besluit ondertekenen | ✅ | — | — | — | — | — | — | — | — | — | 👁 |
| Audit log lezen (eigen district) | ✅ | ✅ | — | 👁 | — | — | — | — | — | — | ✅ |
| Audit log lezen (nationaal) | — | — | — | — | — | — | — | — | — | 👁 | ✅ |
| Open Data publiceren | ✅ | ✅ | — | — | — | — | — | — | — | ✅ | 👁 |
| Gebruikers beheren (eigen district) | ✅ | 🟡 | — | — | — | — | — | — | — | — | 👁 |
| Gebruikers beheren (nationaal) | — | — | — | — | — | — | — | — | — | ✅ (MinBiZa) | 👁 |

\* binnen eigen ressort

## Machtigingen (DigiD Machtigen-equivalent)

Een burger kan een ander machtigen om namens hem te handelen. Concreet:

- **Mantelzorger** voor ouder/zieke
- **Accountant** voor ondernemer
- **Advocaat** voor juridische zaken
- **Familie** voor minderjarigen of laaggeletterden

Per machtiging:
- Bereik (welke diensten?)
- Duur (vanaf — tot)
- Bewijsplicht (kopie volmacht in Document Service)
- Audit (elke handeling toont gemachtigde + namens-wie)
- Intrekken kan op elk moment door volmachtgever

## Speciale gevallen

### Burger zonder Digitale-ID
- Kan melding doen via publiek formulier (Signalen-SR) zonder account
- Krijgt magic-link via email/SMS om status te volgen
- Voor alles wat verder gaat: Digitale-ID verplicht

### Burger zonder smartphone / met laag digitaal niveau
- **DC-loket blijft fysiek beschikbaar**
- Loket-medewerker kan **namens burger** een aanvraag indienen (audit: actor = medewerker, namens = burger)
- Burger ontvangt bevestiging op papier én in Berichtenbox (als account bestaat)

### Wisseling DC / SG / Minister
- Oude rol verloopt automatisch op einddatum
- Nieuwe rol activeert op startdatum
- Audit-log toont overdracht
- Lopende zaken automatisch geherrouteerd

### Inheemse / Marron-dorpsbestuur (Fase 3)
- `kapitein` / `basja` / `granman` zijn formele rollen
- Scope = dorp (bij kapitein/basja) of groep dorpen (granman)
- Stemrecht in lokale participatieprocedures
- Documentatie van rolwisseling via DC + RR (formele bevestiging)

### e-Resident (Fase 4 — als ingevoerd)
- Buitenlandse natuurlijke persoon met Surinaamse digitale identiteit
- Beperkt tot zakelijke transacties (KKF-inschrijving, contracten, belastingen)
- Géén stemrecht, géén toegang tot bestuurlijke besluitvorming
- Politiek en juridisch beladen — pas overwegen na Fase 3

## Data-isolatie

- **Per organisatie**: S-Road access policies bepalen welke organisatie welke service mag bevragen
- **Per scope**: applicatie-laag filtert op `district_id` / `ressort_id` / `dorp_id`
- **Per record**: row-level security in databases (PostgreSQL RLS)
- **Per veld**: gevoelige velden (etniciteit, religie, gezondheid) extra beschermd; only-on-need-to-know
- **Per export**: audit + rate-limit; PII-velden gemaskeerd waar mogelijk

## Wat we expliciet niet doen

- Geen impersonatie ("inloggen als gebruiker X") in MVP
- Geen vrije permissie-toekenning per gebruiker (alleen rollen)
- Geen automatische rol-toekenning op basis van email-domein (te risicovol)
- Geen permanente "guest" rollen — alles met einddatum
