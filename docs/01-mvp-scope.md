# 01 — MVP scope

## Doel van de MVP

Eén werkend district laten draaien op het platform, met **alle dagelijkse bestuursprocessen die nu via papier, Excel en WhatsApp lopen**, gedigitaliseerd. Daarna uitrol naar de overige districten.

De MVP moet **demonstreerbaar zijn aan RO, een DC en burgers** binnen één district (bijvoorbeeld Paramaribo of Wanica als pilot).

## MVP-principes

1. **Eén pilot-district eerst.** Niet alle 10 districten tegelijk. Schaalbaarheid komt later.
2. **Bestuurlijk werkbaar boven mooi.** Audit trail, rollen en dossieropbouw vanaf dag 1.
3. **Werkt op telefoon én laptop.** PWA, geen native app in MVP.
4. **Werkt op slecht internet.** Lichte payloads, offline-form draft, retry queue.
5. **Nederlands als interfacetaal.** Vertaling naar Sranan Tongo en andere talen in Fase 2.
6. **Geen externe integraties in MVP.** MI-GLIS, CBB en e-Gov koppelingen later — eerst eigen dossiers vullen.

## In scope (MVP — Fase 1)

| Module | Reden |
|--------|-------|
| **Authenticatie & rollen (RBAC)** | Fundament voor alles |
| **Burger meldpunt (klachten/meldingen)** | Snelste publieke waarde, laagste drempel |
| **DC-dashboard per district** | Geeft DC direct overzicht |
| **Vergunningen — basis workflow** | Hinderwet, markt, evenement; statussen + documenten |
| **Dossierbeheer & documentupload** | Vervangt fysieke mappen |
| **Projectmonitoring (basis)** | Status, budget, deadline, voortgangsupdates |
| **Rapportage-export** | PDF/Excel naar RO en ministerie |
| **Audit log** | Elke actie traceerbaar — niet onderhandelbaar |
| **Notificaties** | Email + in-app; SMS/WhatsApp in Fase 2 |

## Uit scope (expliciet niet in MVP)

| Feature | Waarom uitgesteld |
|---------|-------------------|
| GIS / kaartlagen (PostGIS visualisatie) | Database wel PostGIS-ready, viewer komt in Fase 3 |
| Financiële module (districtsbegroting, audit-flow) | Te politiek gevoelig zonder eerst proces te valideren |
| Ressort- en districtsplanning workflow | Vereist eerst draagvlak districtsraden — Fase 2 |
| Burgerparticipatie / online stemmen | Vereist juridische basis — Fase 2 |
| API-integraties (MI-GLIS, CBB, e-Gov) | Externe afhankelijkheid, vertraagt MVP |
| AI-assistent / beleidsadvies | Geen waarde zonder eerst data in het systeem |
| Native mobile apps | PWA voldoet voor MVP |
| Meertaligheid (Sranan, Sarnami, etc.) | Engineering-overhead, Nederlands eerst |
| USSD / SMS-fallback voor feature phones | Fase 2 — eerst smartphone-gebruikers |
| Whistleblower / anti-corruptie module | Apart vertrouwensmodel nodig — Fase 3 |

## Success-criteria MVP

De MVP is af als:

- [ ] 1 districtscommissariaat verwerkt **al hun nieuwe meldingen** via het platform (geen WhatsApp meer voor inkomende meldingen).
- [ ] Burgers kunnen **zonder account een melding doen** met foto + GPS.
- [ ] DC kan dagelijks **één scherm openen** en alle openstaande zaken zien.
- [ ] Minimaal **één vergunning-flow** loopt end-to-end digitaal (aanvraag → besluit → PDF).
- [ ] **Audit log** toont elke statuswijziging met gebruiker + timestamp.
- [ ] **Maandrapportage** naar RO is met één knop te genereren.
- [ ] Systeem werkt op een **mid-range Android-telefoon op 3G** binnen 3 seconden.

## Wat we expliciet NIET beloven in de MVP

- Geen besluiten over grondenrechten of eigendom.
- Geen vervanging van bestaande wetgeving — alleen ondersteuning.
- Geen automatische goedkeuringen — DC blijft beslisser.
- Geen openbare publicatie van persoonsgegevens.

## Pilot-district keuze

Aanbeveling: **Wanica** of **Paramaribo**.

- **Paramaribo** — meeste volume, hoogste digitale geletterdheid, zichtbaarheid voor RO.
- **Wanica** — kleiner, beheersbaar, mix stad/platteland, goede testcase voor schaalbaarheid.
- **Sipaliwini / Brokopondo** — NIET in MVP: internetdekking en taaldiversiteit maken het pas haalbaar na offline-mode (Fase 2).
