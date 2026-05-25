# 07 — Aanvullend onderzoek: wat ontbreekt + aanbevelingen

Dit document inventariseert wat het basisonderzoek in [`../AI-onderzoek.md`](../AI-onderzoek.md) **niet of onvoldoende dekt**, en doet aanbevelingen om die gaten te dichten vóór of tijdens de bouw.

---

## 1. Authenticatie & identiteit — geen strategie vastgelegd

**Wat ontbreekt:** Het onderzoek noemt rollen, maar geen identity-laag. In Suriname is er (nog) geen DigiD-equivalent met massa-adoptie.

**Aanbevelingen:**
- MVP: eigen account met email/telefoon + 2FA voor staf, magic-link voor burgers.
- Onderzoek of het **CBB** een authenticatie-koppeling biedt (BSN-equivalent → SUR-ID?).
- Volg de ontwikkelingen rond e-Government Suriname; ontwerp auth-laag pluggable.
- **Ondernemers** hebben mogelijk eHerkenning-achtige verificatie nodig (KKF-koppeling).
- Voor binnenland zonder email: telefoonnummer + OTP is enige realistische optie.

**Te beslissen in Fase 0:** wie is "burger" technisch (telefoonnummer? SUR-ID? niets?).

---

## 2. Connectiviteit & offline werking — onderschat in onderzoek

**Wat ontbreekt:** Het onderzoek noemt slecht internet niet expliciet. Dit is in Suriname een fundamentele constraint, niet een edge case.

**Realiteit:**
- Sipaliwini en Brokopondo hebben grote delen zonder permanente datadekking.
- Marowijne en delen Para hebben wisselende 3G/4G.
- Ressortcoördinatoren komen soms eens per maand uit het binnenland.

**Aanbevelingen:**
- **PWA met service-worker + IndexedDB** vanaf Fase 2.
- **Sync-queue** voor draft-meldingen, sync wanneer verbinding terug.
- **USSD/SMS-meldpunt** in Fase 3 voor totaal-offline gevallen.
- **Print-templates** in MVP zodat papier nog altijd kan terugvallen.
- **Lokale lichte caching server** in DC-kantoren met intermittent uplink (Fase 3).
- Test alle MVP-flows expliciet op throttled 3G.

---

## 3. Inheemse en Marron-bestuursstructuren — volledig afwezig

**Wat ontbreekt:** Het onderzoek baseert zich op WRO (districten + ressorten). Maar in het binnenland (Sipaliwini, Brokopondo, delen Marowijne en Para) zijn **traditionele bestuursstructuren** dominant:

- **Inheemse dorpen**: kapitein, basja, dorpsraad
- **Marron-gemeenschappen**: granman (paramount chief), kapiteins per dorp
- Deze hebben formeel beperkte plek in WRO, maar zijn **de facto** de bestuurlijke realiteit op lokaal niveau.

**Aanbevelingen:**
- Datamodel uitbreiden in Fase 2: entiteit `dorp` onder `ressort`, met `dorpshoofd_type` (kapitein / basja / granman).
- Rol `dorpshoofd` met scope = dorp.
- Procedures aangepast voor binnenland (grondmeldingen vooral!) — andere goedkeuringsroute waar traditioneel gezag betrokken is.
- **Stakeholder-consultatie met VIDS** (Vereniging van Inheemse Dorpshoofden) en Marron-organisaties vóór binnenland-uitrol.
- Documenteer dat dit **niet** een politieke uitspraak is over erkenning, maar een feitelijke werkprocesregistratie.

**Dit is potentieel het meest gevoelige onderdeel — niet halverwege improviseren.**

---

## 4. Meertaligheid — niet behandeld

**Wat ontbreekt:** Onderzoek gaat impliciet uit van Nederlands.

**Realiteit:**
- Nederlands = officiële taal, maar niet ieders moedertaal of comfortabel.
- **Sranan Tongo** = lingua franca, vooral mondeling.
- **Sarnami** in Hindoestaanse gemeenschappen.
- **Javaans** in delen Commewijne / Wanica.
- **Marron-talen** (Saramaccaans, Aukaans, Paramaccaans) in binnenland.
- **Inheemse talen** (Caribisch, Arowaks, Trio, Wayana).

**Aanbevelingen:**
- MVP: Nederlands.
- Fase 2: Sranan Tongo en Sarnami als interface.
- **Burger-formulieren altijd kort en in beeldicoontjes** waar mogelijk (visuele categorieën).
- AI-vertaling voor melding-omschrijvingen (Fase 3).
- **Spraakmemo-optie** bij meldingen — transcriptie via Whisper-model dat lokale talen leert (Fase 3).

---

## 5. WhatsApp als primaire kanaal — onderschat

**Wat ontbreekt:** Het onderzoek noemt WhatsApp als *probleem* (versnipperde communicatie nu). Maar WhatsApp blijft *het* kanaal in Suriname.

**Aanbevelingen:**
- **WhatsApp Business API** integratie als notificatiekanaal in Fase 2.
- Burger kan melding **starten via WhatsApp**, bot stelt vragen, opent dossier in SDP.
- Statusupdates via WhatsApp.
- DC kan vanaf WhatsApp dossierlink openen (deeplink → SDP login).
- **Niet:** WhatsApp als opslag (dossier blijft in SDP, WhatsApp is alleen interface).

---

## 6. Hosting & data-soevereiniteit — politiek onbehandeld

**Wat ontbreekt:** Het onderzoek noemt geen hosting. Dit is bestuurlijk **één van de gevoeligste vragen**.

**Vragen die beantwoord moeten worden:**
- Mag bestuurlijke data van Suriname op AWS Brazilië staan?
- Wat zegt de wet over data-soevereiniteit van overheidsdata?
- Wat zegt de wet over privacy (bestaat er een Surinaamse AVG/GDPR-equivalent)?
- Wie heeft toegang tot encryption keys?

**Aanbevelingen:**
- **Juridische scan** in Fase 0 — apart spoor, niet onderschatten.
- Start MVP op cloud (snelheid), maar **infrastructure-as-code** zodat migratie naar lokaal datacenter een week werk is.
- Geen vendor lock-in (geen Lambda, geen DynamoDB, geen Cognito).
- Encryption keys onder Surinaamse jurisdictie van dag 1.
- Beleid op data-export door medewerkers (audit + rate-limit).

---

## 7. Privacy & gegevensbescherming — niet behandeld

**Wat ontbreekt:** Geen privacyparagraaf in onderzoek.

**Aanbevelingen:**
- Inventariseren: Suriname's wettelijk kader (privacywet in ontwikkeling? Gebruik internationale standaarden zoals GDPR als baseline).
- **Data Protection Impact Assessment (DPIA)** vóór go-live MVP.
- Privacybeleid en cookie-policy voor publieke site.
- Recht-op-vergetelheid procedures (burger kan zijn melding-data laten verwijderen, met wettelijke retentie-uitzonderingen).
- **Pseudonimisering** in rapportages en exports.
- Bewaartermijnen per dossiertype documenteren.

---

## 8. Klimaat & rampenbestendigheid — niet behandeld

**Wat ontbreekt:** Suriname is laaggelegen + tropisch + binnenlandse afhankelijkheid van rivieren.

**Concrete risico's:**
- **Kustzone**: zeespiegelstijging, overstromingen Paramaribo/Wanica/Coronie/Saramacca.
- **Binnenland**: extreme regenval en droogte, geïsoleerd raken bij hoogwater.
- **Hurricane-randzone**: minder direct, maar wel storm-events.

**Aanbevelingen:**
- **Crisis-modus** in platform (zie [06](06-features-later.md) Fase 3).
- Koppeling met **NCCR** (Nationaal Coördinatie Centrum Rampenbeheersing).
- Backup-strategie: minstens één off-site backup in andere klimaatzone.
- DR-runbook: wat als het datacenter Paramaribo zelf uitvalt?
- Categorie "klimaat/water-overlast" in meldingen-taxonomie.

---

## 9. Open Data & transparantie als anti-corruptiemechanisme

**Wat ontbreekt:** Onderzoek noemt transparantie als doel, maar niet hoe je het hard maakt.

**Aanbevelingen:**
- **Publiek dashboard** met geaggregeerde KPI's per district (zonder PII).
- **Open Data API** met machine-leesbare downloads.
- Publicatie van vergunning-besluiten (geanonimiseerd) zoals overheid.nl.
- Publicatie van projectbudgetten en voortgang.
- **Whistleblower-module** (Fase 3) — apart vertrouwenskanaal.
- **Cryptografisch verifieerbare audit-log hashes** publiek beschikbaar (tampering-bewijs zonder inhoud te lekken).

Dit is bestuurlijk goud: het *bewijs* dat decentralisatie werkt. Niet alleen "we zeggen dat we het doen", maar "kijk zelf in de data".

---

## 10. Adoptie & change management — onderbelicht

**Wat ontbreekt:** Onderzoek beschrijft *wat* je bouwt, niet *hoe je het mensen laat gebruiken*.

**Risico:** prachtig systeem, niemand gebruikt het, alle communicatie blijft op WhatsApp lopen.

**Aanbevelingen:**
- **Pilot-DC mede-eigenaar maken**: zijn naam aan het project verbinden geeft commitment.
- **Eerste 4 weken na go-live: on-site support** door iemand van het team.
- **Train-de-trainer** met districtssecretaris zodat kennis blijft.
- **Korte video-tutorials** (max 2 min) per rol, in het Nederlands + Sranan.
- **Adoptie-KPI's** meten: % meldingen via SDP vs WhatsApp; % DC-acties via systeem vs telefoon.
- **Maandelijkse feedback-sessie** met gebruikers eerste half jaar.
- **Beloon adoptie**: dashboard waarop districten elkaar zien op adoptie-metrics.

---

## 11. Juridische verankering ontbreekt

**Wat ontbreekt:** Het systeem zou idealiter een **wettelijke basis** krijgen (besluit RO / ministeriële regeling) zodat afhandeling via SDP de officiële route wordt.

**Aanbevelingen:**
- In Fase 0: juridisch traject parallel starten.
- Werk toe naar **ministeriële regeling** die SDP als officieel kanaal aanwijst voor bepaalde procedures (meldingen, evenement-vergunning).
- Onderzoek of **digitale handtekening** van DC juridisch geldig is voor besluiten (waarschijnlijk ja, maar formeel valideren).
- Zorg dat **digitaal archief voldoet aan Archiefwet** (langetermijn-bewaring, exporteerbaarheid in standaardformaten).

---

## 12. Financiering & duurzaamheid — niet behandeld

**Wat ontbreekt:** Wie betaalt jaar 2, 3, 4?

**Mogelijke modellen:**
- **RO-begroting**: directe opname in ministeriebegroting.
- **DLGP-financiering**: koppeling met Decentralization and Local Government Strengthening Program.
- **Donor-financiering**: IDB, UNDP, EU hebben Caribbean governance-programma's.
- **Open source community**: kostenreductie door derdenbijdragen.

**Aanbevelingen:**
- Maak vroeg een **TCO-model** (Total Cost of Ownership) voor 5 jaar.
- Inclusief: hosting, onderhoud, support, doorontwikkeling, training.
- Donor-funding alleen voor *bouw*, niet voor structureel beheer (anders stort het in als donor weg is).
- Structureel beheer moet in RO-budget zitten.

---

## 13. Onboarding nieuwe districten — proces ontbreekt

**Wat ontbreekt:** Hoe rol je van 1 → 10 districten uit?

**Aanbevelingen — onboarding-runbook per district:**
1. Voorintake-gesprek met DC (1 dag)
2. Procesinventarisatie (1 week)
3. Data-migratie lopende dossiers (1–2 weken)
4. Training staf (2 dagen)
5. Soft launch (alleen nieuwe zaken via SDP, lopende blijven oude weg) — 4 weken
6. Full launch (alles via SDP)
7. On-site support eerste 2 weken
8. Maandelijkse check eerste half jaar

Eén ervaren onboarder kan dit; bij 10 districten = ~5 maanden aaneengesloten werk.

---

## 14. Wat NIET in de huidige scope hoort maar wel gevraagd zal worden

Bestuurders zullen zeggen "kan jullie systeem ook ...". Houd deze lijst paraat:

| Vraag | Antwoord |
|-------|----------|
| "Kan het ook verkiezingen organiseren?" | Nee. CHS-domein. Eventueel data-uitwisseling later. |
| "Kan het ook het kadaster vervangen?" | Nee. MI-GLIS is de autoriteit. Wij koppelen er alleen aan. |
| "Kan het ook grondrechten beslissen?" | Nee. Juridisch buiten mandaat. We registreren alleen meldingen. |
| "Kan het CRM voor politieke partijen?" | Nee. Strikt bestuurlijk. |
| "Kan ik er nationaal beleid mee uitschrijven?" | Nee. We faciliteren uitvoering, geen beleidsontwerp. |
| "Kan het ook ID-kaarten uitgeven?" | Nee. CBB-domein. |

Een duidelijk **"wat we niet doen"** is bestuurlijk net zo belangrijk als wat we wel doen.

---

## 15. Ontbrekende rollen die alsnog overwogen moeten worden

Het onderzoek noemt minister, DC, secretaris, etc. Mogelijk ook nodig:

- **Communicatiemedewerker** (publiceert namens district)
- **Klachtenfunctionaris** (specifiek voor escalaties)
- **Tolk** (voor publieksloket binnenland)
- **Externe adviseur** (consultant met tijdelijke toegang)
- **Pers/journalist** (toegang tot Open Data, niet tot interne dossiers)
- **Statistiekgebruiker** (CBvS, ABS, onderzoekers — read-only geaggregeerd)

---

## 16. Samenvatting: dichtsten in deze volgorde

Vóór MVP-bouw start:
1. ✅ Juridische scan (privacy, archiefwet, WRO-compatibiliteit)
2. ✅ Hosting-keuze (data-soevereiniteit)
3. ✅ Pilot-DC commitment
4. ✅ Auth-strategie (CBB-koppeling mogelijk? wachttijd?)

Tijdens MVP-bouw (parallel):
5. ✅ Stakeholder-consultatie inheems/Marron (voor Fase 2)
6. ✅ Adoptie/change management plan
7. ✅ TCO-model + funding-strategie

Na MVP, vóór schaal-uitrol:
8. ✅ Inheemse/Marron-bestuurslaag in datamodel
9. ✅ Meertaligheid (Sranan, Sarnami)
10. ✅ Offline-mode + WhatsApp-integratie
