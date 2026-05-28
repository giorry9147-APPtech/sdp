# Uitbreidingshoofdstuk Blauwdruk e-Suriname / MijnSuriname — Verzoek-flows G2G & C2G via S-Road en OpenZaak-SR

## TL;DR
- **Verklaring van Goed Gedrag (VGG)** wordt in Suriname afgegeven door de **Districtscommissaris (DC)** op grond van het Reglement op het Beheer der Districten (G.B. 1948 no. 155, voorlopers G.B. 1943/1959) gelezen in samenhang met de Wet Regionale Organen (S.B. 1989 no. 44) en de Instructie Districtscommissarissen (S.B. 1990 no. 34); aanvraag verloopt fysiek via het Burger Informatie Centrum (BIC) van het commissariaat van woonplaats, met een CBB-uittreksel als bronstuk en een antecedenten-check via het Korps Politie Suriname (Politiehandvest G.B. 1971 no. 70). Er is **nog géén digitaal loket** voor de VGG op `digitale-id.gov.sr` (peildatum mei 2026).
- Beide flow-soorten — G2G (ministerie → commissariaat, bv. GBB-terreinonderzoek) en C2G (burger → commissariaat, bv. VGG) — kunnen op **één generiek zaakmodel** (OpenZaak-SR, naar ZGW-API-standaard) draaien, met **S-Road** (Surinaamse X-Road-instantie) als interoperabiliteitslaag voor authenticatie, transport en logging tussen organisaties.
- Houd het G2G-model bewust strak en simpel: **alleen ontvangst en afhandeling** door het commissariaat met terugkoppeling van het resultaat — geen aparte beschikkingsstap, geen live progress-mirroring. Eén zaaktype-template "Interbestuurlijk Onderzoeksverzoek" volstaat voor alle ministeries (GBB, TCT, EZ, ROM, OW, LVV).

---

## Deel A — Feitelijk onderzoek: de Verklaring van Goed Gedrag in Suriname

### A.1 Uitgevende instantie

De **Districtscommissaris** is de formele afgever van de Verklaring van Goed Gedrag (VGG, in de volksmond "goedgedrag" of "politieverklaring"). Dit is geen aparte attributie maar volgt uit de algemene bestuursbevoegdheid van de DC als bestuursorgaan van zijn district. De DC is daarnaast **Hulpofficier van Justitie**, **Ambtenaar van de Burgerlijke Stand**, en heeft onder eindtoezicht van de Procureur-Generaal de leiding over de rechterlijke en administratieve politie in zijn district — wat verklaart waarom de afgifte van een goedgedragverklaring een DC-bevoegdheid is en niet, zoals in Nederland (COVOG/Justis op basis van de Wet justitiële gegevens), een centraal-justitiële bevoegdheid.

In de praktijk loopt de aanvraag in vier samenwerkende lagen:

| Laag | Rol |
|---|---|
| **Burger Informatie Centrum (BIC)** van het commissariaat van woonplaats | Intake-loket: documentcontrole, inning leges, registratie aanvraag |
| **Afdeling DIV (Documentaire Informatie Voorziening)** van het commissariaat | Opmaak van de verklaring, archivering, koppeling aan dossier |
| **Korps Politie Suriname (KPS), Publiciteitsdienst (Duisburglaan 43-45)** | Antecedenten-check; informatie wordt teruggekoppeld aan het commissariaat |
| **Districtscommissaris** (of gemandateerde ambtenaar) | Ondertekening |

Voor **vreemdelingen** is afwijkend: zij vragen de VGG aan bij het Commissariaat Combé (Paramaribo) in plaats van het commissariaat van woonplaats. Een door de DC afgegeven, gelegaliseerd "goedgedrag" is verplicht bij verlenging van verblijfsvergunningen onder de codes PROJILL en TOPI (Hoofdafdeling Vreemdelingenzaken, Min. Justitie en Politie).

### A.2 Wettelijke basis

Geen Surinaamse wet bevat een artikel dat specifiek de "Verklaring van Goed Gedrag" definieert (anders dan in Nederland waar de VOG in de Wet justitiële gegevens is geregeld). De grondslag is samengesteld:

- **Reglement op het Beheer der Districten** (oorspronkelijk G.B. 1863 no. 10; vervangen G.B. 1943; opnieuw vastgesteld G.B. 1959; relevant artikel over bevoegdheden DC) — autonome bestuursbevoegdheid van de DC.
- **Staatsbesluit van 23 juli 1990, S.B. 1990 no. 34** — Instructie Districtscommissarissen, op grond van artikel 32 lid 1 Wet Regionale Organen.
- **Wet Regionale Organen** (S.B. 1989 no. 44) — politieke en bestuurlijke bevoegdheden DC.
- **Politiehandvest G.B. 1971 no. 70** (artikel 5 en 6) — wettelijke taakstelling KPS, basis voor antecedentenonderzoek.
- **Vreemdelingenwet 1991** (S.B. 1992 no. 33) — verplicht een gelegaliseerd goedgedrag bij specifieke verblijfsaanvragen.

### A.3 Procedurele route burger → DC

1. Burger gaat naar het BIC van het commissariaat in zijn ressort/wijk waar hij staat ingeschreven.
2. Indienen: een **recent CBB-uittreksel** (max. een maand oud), één **pasfoto** (bij buitenlands gebruik), één **plakzegel** (historisch SRD 1,50–2,00) en **administratiekosten** (historisch SRD 5,00). NB: na de tariefherziening van **1 mei 2018** (BIC Paramaribo-Zuidwest, gepubliceerd via de officiële Facebook-pagina van het commissariaat) worden nieuwe tarieven gehanteerd; tarieven worden per BIC vastgesteld en lokaal gepubliceerd.
3. Het BIC registreert de aanvraag; de afdeling DIV maakt de verklaring op.
4. De Publiciteitsdienst van het KPS (Duisburglaan 43-45, Paramaribo) verricht — voor zover van toepassing — de antecedentencontrole; communicatie verloopt schriftelijk en per e-mail/papier.
5. De DC (of een gemandateerde ambtenaar) ondertekent.
6. Doorlooptijd: **maximaal 6 weken** volgens het officiële formulier van het Secretariaat Vrij Verkeer van Personen (Min. ATM); in praktijk vaak 1–3 weken.
7. Voor internationaal gebruik moet de verklaring gelegaliseerd worden door de Griffier van het Hof van Justitie (Grote Combéweg 7, Paramaribo).

### A.4 Rol van het districtscommissariaat

Het commissariaat is **én uitgever**, **én intakepunt**, **én verificatiepunt** (woonplaats wordt afgeleid uit het CBB-uittreksel en de inschrijving in het district). Het is dus géén passief doorgeefluik: de DC heeft een eigen bestuursverantwoordelijkheid en zijn handtekening is constitutief voor de verklaring. Dat is precies de reden waarom de VGG zich uitstekend leent voor het model van OpenZaak-SR: alle elementen (intake, externe verificatie, besluit, archivering) zitten al in één bestuurslaag.

### A.5 Stand van digitalisering (mei 2026)

Gedigitaliseerd via `digitale-id.gov.sr` en aanverwante portalen:
- CBB-uittreksel en nationaliteitsverklaring (sinds 2024–2025)
- Vuurwapenvergunningen
- e-Visa, MKV, verblijfsvergunning-indiening (vz2.juspol.sr)
- Rijbewijs (gefaseerde uitrol, samen met KPS — verlengings- en duplicaatmodule live)
- Online registratie grondaanvraag (gbbregistratie.sr): officieel gerapporteerd **40.137 registraties landelijk medio oktober 2021** (GBB-minister Dinotha Vorswijk; geen recenter geverifieerd cijfer publiek beschikbaar).

**Niet** gedigitaliseerd: de Verklaring van Goed Gedrag. Dat is een natuurlijke kandidaat voor de eerste C2G-flow in MijnSuriname, omdat de twee bronregisters (CBB en KPS) al gedeeltelijk digitaal beschikbaar zijn en het commissariaat de afgever blijft.

---

## Deel B — Uitwerking: Verzoek-flows in e-Suriname/MijnSuriname

### B.1 Conceptueel onderscheid G2G vs. C2G — waarom één zaaksysteem volstaat

| Aspect | G2G (Government-to-Government) | C2G (Citizen-to-Government) |
|---|---|---|
| Initiator | Een ministerie of dienst (rechtspersoon) | Een burger (natuurlijke persoon) |
| Authenticatie | Organisatie-account via S-Road service-consumer (machine-to-machine, mTLS + OAuth2 client-credentials) | Burgeraccount via Digitale-ID gov.sr (OIDC, 2FA) |
| Indienkanaal | Vakapplicatie van het ministerie roept S-Road API aan; geen GUI vereist | MijnSuriname-portaal of mobiele app (loket-UI) |
| Verzoekschriftvorm | JSON-payload + bijlage(n) | Webformulier + uploads |
| Authoriteit van afgifte | Inhoudelijk rapport / advies | Beschikking / verklaring |
| Privacyklasse | Zaaksgewijs, vaak openbaar of intern | Persoonsgegevens (PCN/ID-equivalent) — strikt vertrouwelijk |
| Statusvolging burger? | **Nee** (per ontwerpkeuze) | Ja, status zichtbaar in MijnSuriname |

Hoewel de initiator verschilt, is wat **ontvangen, behandeld en gearchiveerd** wordt in essentie hetzelfde: een **zaak** van een bepaald **zaaktype**, met een **statusverloop**, **documenten**, **betrokkenen**, **termijnen** en een **resultaat**. Dit is precies het abstractieniveau van het Nederlandse ZGW (Zaakgericht Werken) en de ZGW-API's (Zaken-API, Catalogi-API, Documenten-API, Besluiten-API). Door OpenZaak-SR als enkel zaaksysteem te gebruiken:

1. Voorkomt men aparte silo's per kanaal (e-mailbakje "G2G-verzoeken", papier-stapel "VGG-aanvragen").
2. Krijgt iedere commissariaatsmedewerker één werkbak met alle zaken (G2G en C2G door elkaar of gefilterd op rol).
3. Wordt audit, rapportage en SLA-bewaking uniform.
4. Kan **configuratie boven code**: een nieuw zaaktype is een rij in de Catalogi-API en een rolentry, geen software-release.

S-Road verzorgt **tussen organisaties** het transport, de wederzijdse authenticatie en het niet-loochenbare logging (X-Road message-signing); OpenZaak-SR verzorgt **binnen** de ontvangende organisatie (commissariaat) de zaakvorming.

### B.2 Procesmodellen

#### B.2.a Flow 1 — GBB-onderzoeksverzoek aan commissariaat (G2G)

**Voorbeeld**: GBB krijgt een grondaanvraag binnen via het Domeinkantoor (Kerkplein 1, Paramaribo). De Dienst der Domeinen heeft op grond van het Decreet Uitgifte Domeingrond (S.B. 1982 no. 11) advies van de DC nodig: terreinligging, bewoning, bezwaren, woonplaatscheck.

```
[GBB Domeinkantoor]                 [S-Road bus]                 [Commissariaat-X (OpenZaak-SR)]
        |                                |                                 |
1. Maakt verzoek aan in GBB-vakapp       |                                 |
   (LAD-nr, perceel, doel) ------------> 2. POST /zaken (mTLS+JWT)         |
                                         |                                 |
                                         3. S-Road logt msg (signed) ----> 4. Zaak aangemaakt
                                                                              (zaaktype = TERREIN_ONDERZOEK_GBB,
                                                                               status = "Ontvangen")
                                                                              5. Notificatie naar werkbak DC-secretaris
                                                                              6. Toewijzing aan ressortraad/oriëntatie-team
                                                                              7. Veldonderzoek door ressort
                                                                              8. Rapport opgemaakt (PDF)
                                                                              9. Status -> "Afgehandeld"
                                                                                 Resultaat-object met rapport-PDF
                                                                                 ------------------------------------|
                                        10. Notificatie naar GBB (callback) <----|
                                        (POST /zaken/{id}/resultaat naar GBB-API)
11. GBB-vakapp ontvangt:                 |
   resultaat + rapport-PDF               |
   Koppelt aan grondaanvraagdossier      |
```

**Belangrijke ontwerpkeuze**: er is **geen aparte "Beschikking"-stap** van de DC. Het resultaat is een rapport (advies), niet een besluit. Er is ook **geen polling** vanuit GBB tijdens behandeling: GBB wacht passief op de callback / notificatie. Daarmee is GBB de eigenaar van zijn eigen "ingewonnen advies"-dossier, en het commissariaat van zijn "behandelde onderzoeksverzoeken"-dossier.

Stappen in BPMN-achtige notatie:

1. **Start** (GBB-zijde): GBB-medewerker maakt verzoek aan; vakapp valideert verplichte velden.
2. **Send Task**: vakapp roept `POST /api/v1/zaken` aan via S-Road, met zaaktypeURI = `…/zaaktypen/TERREIN_ONDERZOEK_GBB` en `bronorganisatie = OIN-SR-GBB`, `ontvangstcommissariaat = districtcode`.
3. **Receive Task** (commissariaat-zijde): zaak komt binnen in OpenZaak-SR; trigger automatische routering op district + zaaktype.
4. **User Task**: secretaris commissariaat ziet zaak; wijst toe aan team buitendienst / ressortraad.
5. **User Task**: ressortteam doet veldonderzoek (eventueel met offline mobiele app); legt waarnemingen vast.
6. **User Task**: rapport-PDF wordt geüpload als Document, gekoppeld aan de zaak.
7. **Decision**: bezwaar/geen bezwaar (binair attribuut op resultaat; géén beschikking).
8. **Service Task**: status van zaak gaat naar "Afgehandeld"; Resultaat-record wordt aangemaakt.
9. **Send Task**: OpenZaak-SR publiceert event op Notificaties-API; S-Road levert het callback-bericht af bij het GBB-endpoint.
10. **End** (GBB-zijde): GBB ontvangt rapport, koppelt aan oorspronkelijke grondaanvraag, vervolgt eigen proces (conceptbeschikking, Bereidverklaring, etc.).

#### B.2.b Flow 2 — Verklaring van Goed Gedrag (C2G)

```
[Burger via MijnSuriname]    [S-Road]      [OpenZaak-SR DC-X]    [CBB]      [KPS]
        |                       |                |                 |          |
1. Login digitale-ID (OIDC+2FA) |                |                 |          |
2. Kiest "Aanvraag VGG"         |                |                 |          |
3. Vult formulier (doel, etc.)  |                |                 |          |
4. Submit ----------------> 5. POST /zaken --> 6. Zaak aangemaakt |          |
                                                  (status=Ontvangen)
                                                  zaaktype=VGG_BURGER
                                7. Trigger auto-verrijking:
                                   GET /personen/{id} ----------->  8. CBB lvert
                                                                       uittreksel
                                                                       (woonplaats, BS)
                                   GET /antecedenten/{id} -------------------->  9. KPS levert
                                                                                    JD-record
                               10. Beide responses
                                   gekoppeld als Documenten
                               11. Status -> "In behandeling"
                               12. Werkbak BIC-medewerker: review
                               13. (optioneel) DIV opmaak verklaring
                               14. DC ondertekent digitaal (gekwalificeerde
                                   elektronische handtekening / e-Gov-cert)
                               15. Status -> "Gereed"
                               16. Resultaat = VGG-PDF
17. Notificatie naar burger <----|
   (e-mail + push in MijnSuriname)
18. Burger downloadt VGG-PDF
   (met QR-code voor verificatie)
   OF betaalt + haalt fysiek op
```

Stappen (genummerd):

1. Burger logt in met Digitale-ID-account op MijnSuriname (OIDC, 2FA verplicht).
2. Kiest in catalogus "Verklaring van Goed Gedrag aanvragen".
3. Formulier toont vooringevulde NAW (uit CBB lookup), burger vult **doel** in (werk/studie/visum/etc.) en kiest **commissariaat van woonplaats** (default op basis van CBB-adres).
4. Betaalt leges via online betaling (Centrale Bank-koppeling) of kiest "op locatie betalen".
5. MijnSuriname-portaal roept `POST /zaken` aan op OpenZaak-SR van het juiste districtscommissariaat (routering via S-Road).
6. Zaak wordt aangemaakt met `zaaktype = VGG_BURGER`, status `Ontvangen`.
7-9. **Auto-verrijking**: OpenZaak-SR roept via S-Road (a) CBB Personen-API voor uittreksel; (b) KPS Antecedenten-API voor antecedentencheck. Beide responses worden als documenten aan de zaak gehangen. NB: de KPS-respons is **vertrouwelijk** — alleen zichtbaar voor de DC-rol, niet voor de burger.
10. Status verspringt naar `In behandeling`.
11. BIC-medewerker reviewt; afdeling DIV stelt de verklaring op (template).
12. DC (of gemandateerde ambtenaar) ondertekent digitaal — bij voorkeur met een gekwalificeerde elektronische handtekening op basis van een door e-Gov uitgegeven certificaat (vergelijkbaar met eIDAS-niveau "substantieel" of "hoog").
13. Status verspringt naar `Gereed`. Resultaat-record wordt aangemaakt met type `VGG_AFGEGEVEN` of `VGG_GEWEIGERD`.
14. Burger krijgt notificatie (push + e-mail). Downloadt PDF in MijnSuriname; de PDF bevat een QR-code/verificatielink (`https://verify.gov.sr/vgg/{hash}`) zodat derde partijen (werkgevers, ambassades) de echtheid kunnen verifiëren zonder bij het commissariaat aan te kloppen.
15. Voor internationaal gebruik: optionele vervolg-zaak "Legalisatie" naar Hof van Justitie (eveneens via S-Road).

**SLA-doel**: 5 werkdagen voor standaardgevallen (met automatische CBB+KPS-koppeling), 15 werkdagen bij vlaggen ("hit" in antecedentenregister). Dit is een **drastische** verbetering t.o.v. de huidige "maximaal 6 weken".

### B.3 Zaaktypen-catalogus (Surinaamse ZTC, naar imZTC/ZGW-model)

Onderstaand een initiële catalogus voor OpenZaak-SR. Conventie: zaaktype-ID is `{DOMEIN}_{ACTIE}_{INITIATOR}`. Elke zaaktype heeft een Catalogus-API record met statussen, roltypes, resultaattypes, informatieobjecttypes en eigenschappen.

| Zaaktype-ID | Naam | Initiator | Ontvanger | Processtappen (statussen) | SLA (werkdagen) | Verplichte documenten | Resultaattypen |
|---|---|---|---|---|---|---|---|
| `TERREIN_ONDERZOEK_GBB` | Terreinonderzoek t.b.v. grondaanvraag | Min. GBB (Dienst der Domeinen) | DC-X commissariaat | Ontvangen → Toegewezen → Veldwerk → Rapport-concept → Afgehandeld | 30 | Verzoekbrief GBB, perceelkaart, LAD-nr | Bezwaar / Geen bezwaar / Voorwaardelijk advies |
| `TCT_BUSVERGUNNING_ADVIES` | Advies route-/standplaatsvergunning openbaar vervoer | Min. TCT (Dir. Transport) | DC-X | Ontvangen → Toegewezen → Onderzoek → Afgehandeld | 14 | Aanvraag bushouder, traject, bestaande concessies | Positief / Negatief / Voorwaarden |
| `TCT_BOOTHOUDER_ADVIES` | Advies vergunning veerdienst / boothouder | Min. TCT | DC (m.n. Commewijne, Marowijne) | Ontvangen → Veldwerk → Afgehandeld | 14 | Aanvraagdossier, route, vaartuig-info | Positief / Negatief |
| `EZ_BEDRIJFSVERGUNNING_LOKAAL_ADVIES` | Lokaal advies bedrijfs-/vestigingsvergunning | Min. EZ (Ond. & Tech. Innovatie) | DC-X | Ontvangen → Locatiebezoek → Afgehandeld | 21 | Verzoek EZ, KvK-uittreksel, locatiegegevens | Positief / Negatief / Voorwaarden |
| `HINDERWET_VERGUNNING` | Hinderwetvergunning (autonoom DC) | Burger / Ondernemer | DC-X | Ontvangen → Adviezen (KPS/Brandweer/NMA) → Beschikking → Gepubliceerd | 180 (max. 6 mnd, art. 5 lid 2 Decreet E-24) | Verzoekschrift, plattegrond, machinelijst | Vergunning verleend / Geweigerd / Voorwaardelijk |
| `LBB_KAPVERGUNNING_ADVIES` | Advies kapvergunning (LBB) | Min. GBB (LBB, afd. Natuurbeheer) | DC-X | Ontvangen → Veldcontrole → Afgehandeld | 21 | Aanvraag kap, perceelinfo, doel | Positief / Negatief |
| `ROM_MILIEUKLACHT_DOORZET` | Doorzet milieuklacht (ROM/NMA/NIMOS) | Min. ROM (NMA) | DC-X | Ontvangen → Lokaal onderzoek → Afgehandeld | 14 | Klachtdossier ROM, locatie | Gegrond / Ongegrond / Doorverwezen |
| `LVV_AGRARISCH_LOCATIE_ADVIES` | Lokaal advies agrarische bestemming | Min. LVV | DC-X (m.n. Nickerie, Saramacca, Commewijne, Wanica) | Ontvangen → Veldwerk → Afgehandeld | 21 | LVV-aanvraag, perceel, doel | Geschikt / Ongeschikt / Voorwaarden |
| `OW_INFRA_AANBESTEDING_ADVIES` | Advies infrastructurele werken in district | Min. OW (Dir. Civieltechnische Werken) | DC-X | Ontvangen → Onderzoek → Afgehandeld | 14 | Projectdossier, ligging | Positief / Negatief |
| `JUSPOL_LOCATIECHECK` | Locatiecheck t.b.v. verblijfs-/naturalisatieprocedure | Min. Justitie & Politie | DC-X | Ontvangen → Adresverificatie → Afgehandeld | 7 | Aanvraag JusPol, persoonsgegevens, adres | Bevestigd / Afwijkend / Onvindbaar |
| `BIZA_OPENBARE_ORDE_VERZOEK` | Verzoek tot lokale openbare-ordehandeling | Min. Binnenlandse Zaken | DC-X | Ontvangen → Onderzoek → Afgehandeld | 7 | Aanvraag BiZa, context | Onderzoeksrapport |
| **`VGG_BURGER`** | **Verklaring van Goed Gedrag** | **Burger** | **DC van woonplaats (Combé voor vreemdelingen)** | **Ontvangen → Auto-verrijking CBB/KPS → In behandeling → Ondertekend → Gereed** | **5 (standaard) / 15 (KPS-hit)** | **CBB-uittreksel (auto), KPS-antecedenten (auto), pasfoto (bij internationaal gebruik)** | **VGG afgegeven / VGG geweigerd** |
| `WOONPLAATSVERKLARING_BURGER` | Verklaring van woonplaats | Burger | DC of CBB-wijkkantoor | Ontvangen → Verificatie → Gereed | 3 | CBB-koppeling | Verklaring afgegeven |
| `VERLOREN_ID_VERKLARING` | Verklaring verloren ID-kaart | Burger | DC | Ontvangen → Verklaring → Gereed | 1 | KPS-aangifte (auto) | Verklaring afgegeven |
| `EVENEMENTEN_VERGUNNING` | Vergunning publieke vermakelijkheid / muziek-/dansparty | Burger / Organisatie | DC | Ontvangen → Adviezen (KPS/Brandweer) → Beschikking | 30 | Verzoekschrift, plattegrond, datum | Vergunning verleend / Geweigerd |

#### Generiek metamodel

Alle bovenstaande zaaktypen erven van twee abstracte super-zaaktypen:

- `INTERBESTUURLIJK_VERZOEK_GENERIEK` — voor alle G2G; één template, alleen velden voor "Initiërende organisatie", "Onderwerp", "Bijlagen", "Gewenste leverdatum".
- `BURGERAANVRAAG_GENERIEK` — voor alle C2G; één template met PCN/ID-nummer, Doel, Leges-status.

Nieuwe verzoektypen toevoegen = nieuwe rij in Catalogus-API + roltype + resultaattype. **Geen code-deploy**.

### B.4 Datamodel

Onderstaand het kern-datamodel voor OpenZaak-SR (in lijn met ZGW Zaken-API en imZTC). In het Nederlandse model wordt RSIN (Rechtspersonen en Samenwerkingsverbanden Identificatienummer) gebruikt; in Suriname te vervangen door een nationaal Organisatie-ID, hier **OIN-SR**.

| Entiteit | Veld | Type | Cardinaliteit | Beschrijving |
|---|---|---|---|---|
| **Zaak** | uuid | UUID | 1 | Primaire sleutel |
| | identificatie | string | 1 | Menselijk leesbaar zaaknr (bv. `WAN-2026-001234`) |
| | zaaktype | URL → Zaaktype | 1 | Verwijst naar Catalogus-API |
| | bronorganisatie | OIN-SR | 1 | Indienende organisatie (of `BURGER` voor C2G) |
| | verantwoordelijkeOrganisatie | OIN-SR | 1 | Ontvangend commissariaat |
| | startdatum | date | 1 | |
| | einddatumGepland | date | 0..1 | SLA-deadline (afgeleid) |
| | uiterlijkeEinddatumAfdoening | date | 1 | Hard maximum |
| | registratiedatum | datetime | 1 | |
| | omschrijving | text | 1 | |
| | toelichting | text | 0..1 | |
| | vertrouwelijkheidaanduiding | enum | 1 | `openbaar` / `intern` / `vertrouwelijk` / `confidentieel` |
| | status (huidige) | URL → Status | 0..1 | |
| **Status** | uuid | UUID | 1 | |
| | zaak | URL → Zaak | 1 | |
| | statustype | URL → Statustype (uit ZTC) | 1 | |
| | datumStatusGezet | datetime | 1 | |
| | statustoelichting | text | 0..1 | |
| **Rol** | uuid | UUID | 1 | |
| | zaak | URL → Zaak | 1 | |
| | betrokkene | URL of dotted | 1 | Verwijst naar Persoon (CBB) of Niet-natuurlijk persoon (Organisatie) |
| | betrokkeneType | enum | 1 | `natuurlijk_persoon`, `niet_natuurlijk_persoon`, `vestiging`, `medewerker` |
| | roltype | URL → Roltype (uit ZTC) | 1 | bv. `initiator`, `behandelaar`, `belanghebbende`, `adviseur` |
| | omschrijving / indicatieMachtiging | string | 0..1 | |
| **ZaakInformatieObject** | zaak | URL → Zaak | 1 | |
| | informatieobject | URL → Document (Doc-API) | 1 | |
| | titel | string | 0..1 | |
| | beschrijving | text | 0..1 | |
| **EnkelvoudigInformatieObject (Document)** | uuid, bronorganisatie, identificatie, creatiedatum, titel, auteur, status, formaat, taal, bestandsnaam, inhoud (URL naar binary store), vertrouwelijkheidaanduiding, informatieobjecttype | … | … | Standaard ZGW-Documenten-API |
| **Resultaat** | zaak | URL → Zaak | 1 | |
| | resultaattype | URL → Resultaattype (uit ZTC) | 1 | bv. `vgg_afgegeven`, `advies_positief` |
| | toelichting | text | 0..1 | |
| **ZaakEigenschap** | zaak | URL → Zaak | 1 | Voor zaaktype-specifieke velden (bv. `perceel_nr`, `LAD_nr`, `doel_VGG`) |
| | eigenschap | URL → Eigenschap (uit ZTC) | 1 | |
| | waarde | string | 1 | |
| **AuditTrail** | uuid | UUID | 1 | |
| | bron | enum | 1 | `OpenZaak-SR` |
| | actie | string | 1 | `create`, `update`, `destroy`, `read_sensitive` |
| | resultaat | int | 1 | HTTP status |
| | hoofdObject | URL | 1 | bv. Zaak-URL |
| | resource | string | 1 | bv. `zaak`, `status`, `document` |
| | gebruikersWeergave | string | 1 | naam + organisatie |
| | toelichting | text | 0..1 | |
| | aanmaakdatum | datetime | 1 | |
| | wijzigingen | jsonb | 0..1 | diff oude→nieuwe waarde |

Relatie-overzicht: **Zaak (1) — (n) Status**, **Zaak (1) — (n) Rol**, **Zaak (1) — (n) ZaakInformatieObject (n) — (1) Document**, **Zaak (1) — (0..1) Resultaat**, **Zaak (1) — (n) ZaakEigenschap**, **Zaaktype (1) — (n) Statustype/Roltype/Resultaattype/Eigenschap/Informatieobjecttype**.

### B.5 S-Road message-flows en service-endpoints

#### Architectuurprincipes (overgenomen van Estse X-Road)

S-Road is de Surinaamse instantie van het X-Road open-source data-exchange platform, dat sinds 2017 door **NIIS — Nordic Institute for Interoperability Solutions** als kerncodebase wordt onderhouden. NIIS is opgericht op 7 maart 2017 toen het Finse Ministry of Finance en het Estse Ministry of Economic Affairs and Communications in Helsinki het *Formation and Cooperation Agreement* ondertekenden; de *Memorandum of Association* volgde op 14 juni 2017 en operaties startten in augustus 2017. Kerneigenschappen van X-Road:

- **Decentraal**: er is geen centrale database. Iedere overheidsorganisatie heeft een eigen **Security Server** die zijn services exposeert.
- **Peer-to-peer**: elke aanroep gaat rechtstreeks van de Security Server van de consument naar die van de leverancier; de **Central Server** (door e-Gov beheerd) levert alleen de PKI-trust en de globalconfig (members, subsystems, services).
- **Message protocol**: standaard X-Road message protocol (SOAP-envelop voor legacy; REST-adapter sinds X-Road 7) met versleutelde transportlaag (TLS 1.3) en niet-loochenbare berichthandtekening (XAdES-T).
- **Eenmalige principe (once-only)**: een burger levert dezelfde gegevens nooit twee keer aan; bronregisters worden bevraagd.

In Suriname concreet (codes fictief, conform X-Road conventie `INSTANCE/MEMBER_CLASS/MEMBER_CODE/SUBSYSTEM`):

```
SR-PROD/GOV/MIN-GBB/Domeinkantoor
SR-PROD/GOV/MIN-TCT/DirectoraatTransport
SR-PROD/GOV/MIN-EZ/Bedrijfsvergunningen
SR-PROD/GOV/MIN-JUSPOL/Vreemdelingenzaken
SR-PROD/GOV/KPS/Antecedenten
SR-PROD/GOV/CBB/Personen
SR-PROD/GOV/MI-GLIS/Kadaster
SR-PROD/GOV/COMMISSARIAAT-WANICA/OpenZaak
SR-PROD/GOV/COMMISSARIAAT-PMB-NW/OpenZaak
…  (10 districten × meerdere bestuursressorten)
SR-PROD/GOV/eGov/MijnSuriname
```

#### Services per organisatie (REST-conforme operaties)

| Organisatie | Subsysteem | Service | Operatie | Doel |
|---|---|---|---|---|
| Commissariaat-X | `OpenZaak` | `zaken` | `POST /zaken` | Aanmaken van een zaak |
| | | | `GET /zaken/{uuid}` | Status / inhoud opvragen (geautoriseerd) |
| | | | `PATCH /zaken/{uuid}` | Status-update door consument? — **disabled** (zaak is na intake "van" het commissariaat) |
| | `OpenZaak` | `zaakinformatieobjecten` | `POST` | Document koppelen |
| | `OpenZaak` | `resultaten` | `GET /zaken/{uuid}/resultaat` | Resultaat ophalen |
| CBB | `Personen` | `personen` | `GET /personen/{idnr}` | NAW + woonplaats + burgerlijke staat |
| KPS | `Antecedenten` | `antecedenten` | `GET /antecedenten/{idnr}` | Justitiële antecedenten (vertrouwelijk; alleen voor DC-rol) |
| | | `dossiers` | `GET /dossiers/{zaaknr}` | Aangifte- of dossierinfo (voor verloren-ID-verklaring) |
| MI-GLIS | `Kadaster` | `percelen` | `GET /percelen/{perceelid}` | Perceelinfo, kaart |
| GBB | `Domeinkantoor` | `grondaanvragen` | `POST` callback resultaat | Ontvangst rapport-PDF |
| TCT | `DirTransport` | `vergunningen` | `POST` callback | Ontvangst advies |
| eGov | `MijnSuriname` | `notificaties` | `POST` | Push-notificatie naar burger-account |

#### Authenticatie en autorisatie tussen organen

Authenticatie gebeurt op twee niveaus:

1. **Transport / organisatie-niveau** (X-Road): elke Security Server heeft een door de Central Server gesigneerd certificaat. Een aanroep wordt afgewezen als zender niet in de globalconfig staat of geen toegangsrecht heeft tot het subsysteem/service.
2. **Applicatie / gebruikers-niveau** (binnen organisatie): OAuth2 + OIDC met JWT, uitgegeven door eGov-IDP. Het JWT-token bevat claims: `oin_sr` (organisatie-id), `medewerker_id`, `rollen[]`, en — voor burgers — `pcn` (persoonsidentificatie).

X-Road headers (verplicht):

```
X-Road-Client: SR-PROD/GOV/MIN-GBB/Domeinkantoor
X-Road-Service: SR-PROD/GOV/COMMISSARIAAT-WANICA/OpenZaak/zaken
X-Road-UserId: ambtenaar.j.doe@gbb.gov.sr
X-Road-Id: <uuid van bericht>
```

Logging: elke Security Server logt het bericht (request+response) ondertekend met TimeStamp-Token (XAdES-T) zodat *non-repudiation* van zowel zender als ontvanger juridisch hard is. Dit ondersteunt audit en geschilbeslechting.

#### Berichtflow Flow 1 in detail

1. **GBB → S-Road → Commissariaat-Wanica**: `POST /zaken` met payload (zaaktype = `TERREIN_ONDERZOEK_GBB`, ZaakEigenschappen `LAD_nr`, `perceel_nr`, `aanvrager_naam`; bijlage als ZaakInformatieObject).
2. **OpenZaak-SR Wanica**: valideert tegen Catalogi-API; maakt zaak; geeft 201 Created met zaak-URL terug.
3. **Notificaties-API**: publiceert event `zaak.created` op kanaal `zaken`. Abonnees (interne werkbak-app, e-mailadapter) reageren.
4. (Inhoudelijke afhandeling intern; geen verkeer over S-Road.)
5. **Commissariaat → S-Road → GBB**: `POST` op GBB-callback-endpoint zodra `Resultaat` is gezet, met de resultaat-URL + document-URLs. GBB pulled vervolgens het document via `GET` indien gewenst.
6. **Logging**: zowel stap 1 als stap 5 worden hard gelogd in de respectievelijke Security Servers; e-Gov heeft via een Monitoring-subsysteem aggregate inzicht (geen inhoud) op berichtvolumes en latency.

#### Berichtflow Flow 2 in detail

1. **MijnSuriname → OpenZaak-SR (commissariaat van woonplaats)**: `POST /zaken` namens burger (machtigingsmodel: `betrokkene = persoon X`, `bronorganisatie = BURGER via eGov`).
2. **OpenZaak-SR → CBB (Personen-API)**: `GET /personen/{idnr}` — verrijking.
3. **OpenZaak-SR → KPS (Antecedenten-API)**: `GET /antecedenten/{idnr}` — verrijking; respons is gemarkeerd `vertrouwelijkheidaanduiding=confidentieel` zodat het document alleen voor de `behandelaar`-rol leesbaar is.
4. **Intern**: BIC-medewerker reviewt → DIV opmaak → DC ondertekent.
5. **OpenZaak-SR → MijnSuriname (Notificaties)**: bericht "VGG gereed".
6. **Burger → MijnSuriname**: download PDF (signed) + ontvangt verificatie-QR.

### B.6 Autorisatie- en rollenmodel (RBAC)

| Rol | Toepasselijk in | Bevoegdheden in OpenZaak-SR |
|---|---|---|
| `burger` | C2G | `POST /zaken` met zelf als betrokkene; `GET /zaken/{uuid}` voor eigen zaken; `GET` op eigen documenten (niet `vertrouwelijk`+) |
| `burger_gemachtigde` | C2G via machtiging | Idem als `burger` maar voor andere persoon, mits geldige machtiging in eGov-machtigingsregister |
| `ministerie_indiener` | G2G | `POST /zaken` namens eigen organisatie; `GET /zaken/{uuid}` voor zaken waar eigen organisatie initiator is; **GEEN** update/wijziging |
| `commissariaat_intake` (BIC) | C2G + G2G | `GET /zaken` (district-gefilterd); `PATCH status` van `Ontvangen` → `In behandeling`; documentbeheer |
| `commissariaat_behandelaar` (DIV/buitendienst) | C2G + G2G | Volle leesrechten zaak; documenten uploaden; status doorzetten; eigen rapport schrijven |
| `commissariaat_dc` of `gemandateerd_ondertekenaar` | C2G + G2G | Zaak afsluiten; `Resultaat` aanmaken; digitale handtekening plaatsen |
| `kps_antecedenten_serviceaccount` | Tussen-organisationeel | Mag alleen `GET /antecedenten/{id}` aanroepen vanaf X-Road-clients met service-recht; logt elke query |
| `cbb_personen_serviceaccount` | Tussen-organisationeel | Idem voor `GET /personen/{id}` |
| `audit_inspecteur` (CLAD, Rekenkamer) | Toezicht | Read-only op AuditTrails en zaak-metadata (niet vertrouwelijke inhoud, tenzij geautoriseerd) |
| `eGov_beheerder` | Platform | Catalogi-API beheer; Autorisatie-API; Security Server-config |

Implementatieadvies: gebruik **OAuth2 scopes** parallel aan rollen, bv. `zaken:read:district-WAN`, `zaken:write:district-WAN`, `documenten:read:vertrouwelijk`. Combinatie via tenant-aware autorisatiebeleid.

### B.7 "Strak maken": 10 concrete aanbevelingen

1. **Eén Catalogus, niet per ministerie**: het ZTC (zaaktypecatalogus) wordt door e-Gov centraal beheerd; ministeries en commissariaten kunnen alleen via een wijzigingsverzoek-procedure een nieuw zaaktype laten toevoegen. Voorkomt versplintering.
2. **Configuratie boven code**: nieuwe verzoektypen (bv. "TCT_LICHTRECLAME_ADVIES") worden toegevoegd als zaaktype + JSON-form-definition; geen software-release nodig. Volg Common Ground / Open Forms-model.
3. **Verplichte statustransitie-validatie**: status kan alleen volgens een vooraf gedefinieerd statemachine-pad veranderen (geen sprongen). OpenZaak-SR moet dit afdwingen op basis van Statustype-volgorde in ZTC.
4. **SLA-bewaking & escalatie**: per zaaktype een SLA in dagen; OpenZaak-SR schedulet automatische escalatie (e-mail + notificatie naar DC) bij T-3 dagen voor deadline, en markeert zaken `overschreden` na T+0. Maandelijks dashboard per commissariaat.
5. **Audit trail by default**: elke read op een `vertrouwelijk`-document én elke status-update wordt gelogd (wie, wanneer, vanaf welke IP, met welke X-Road client). Onveranderlijk (append-only, signed).
6. **Eén ID-systeem**: gebruik in alle zaken het **Persoonsnummer CBB / ID-nummer** als persistente identifier; geen losse "klantnummers". Voor organisaties: één **OIN-SR**.
7. **Verbied e-mail/papier-bypass**: in samenwerkingsovereenkomsten tussen ministeries en commissariaten wordt vastgelegd dat verzoeken die niet via S-Road binnenkomen, **niet** in behandeling worden genomen. Uitzondering: papieren burgeraanvragen worden door BIC ingescand en als zaak in OpenZaak-SR aangemaakt, zodat ook offline-burgers in het systeem zitten.
8. **Schema-versionering**: alle ZGW-API's via OpenAPI 3 met versie in URL (`/api/v1/`). Backwards-compatibele wijzigingen alleen door nieuwe optionele velden; breaking changes via `/api/v2/`. Sluit aan op X-Road's "Subsystem versioning".
9. **Hergebruik één generiek zaakmodel**: zoals beschreven in B.3; commissariaten moeten weerstaan zaaktype-eigen velden in de hoofdtabel "Zaak" te willen; alles wat zaaktype-specifiek is, hoort in `ZaakEigenschap`.
10. **Documentstandaard PDF/A + ondertekening**: alle eindproducten (rapport, verklaring, advies) worden als PDF/A-2 opgeslagen, voorzien van een gekwalificeerde elektronische handtekening (eGov-PKI), met inline QR voor publieke verificatie.

### B.8 Lijst van realistische interbestuurlijke verzoektypen (Suriname-context)

Op basis van het onderzoek zijn de volgende verzoekstromen tussen ministeries en districtscommissariaten realistisch (en kandidaat voor de eerste tranches G2G-zaaktypen):

| # | Ministerie / dienst | Onderwerp | DC-rol | Wettelijke / beleidskoppeling |
|---|---|---|---|---|
| 1 | GBB / Dienst der Domeinen | Terreinonderzoek t.b.v. domeingrondaanvraag | Advies inwinnen via ressortraad | Decreet Uitgifte Domeingrond (S.B. 1982 no. 11) |
| 2 | GBB / LBB Natuurbeheer | Advies kapvergunning / houtconcessie | Lokaal advies | Houtwet / Boswet |
| 3 | TCT / Dir. Transport | Advies route- en standplaatsvergunning bussen | Advies | Wet Personenvervoer; herregistratie 2025-2026 |
| 4 | TCT / Dir. Transport | Advies veerdienst/boothouder | Advies (m.n. Commewijne, Marowijne) | Vergunningenbeleid TCT |
| 5 | TCT / TAS | Advies plaatsing telecom-infrastructuur (zendmast/VSAT) | Lokale toets | Wet Telecommunicatievoorzieningen (Wtv) |
| 6 | EZ (Ondern. & Tech. Innovatie) | Lokaal advies bedrijfs-/vestigingsvergunning | Locatie-/hindertoets | Wet Bedrijven en Beroepen S.B. 2017 no. 40 |
| 7 | ROM / NMA (voorheen NIMOS) | Lokaal onderzoek milieuklacht / overlast bedrijven | Veldcontrole, handhaving | Hinderwet (G.B. 1930 no. 64); Wet Ecologische Omstandigheden Woongebieden |
| 8 | LVV | Advies agrarische bestemming / vee-/visserijregistratie | Lokaal advies | Decreet E-24 |
| 9 | OW (Civieltechnische werken, Verkavelingen) | Advies infrawerken / verkaveling in district | Lokaal advies | Wet Verkavelingen |
| 10 | Justitie & Politie / Vreemdelingenzaken | Locatie-/woonplaatsverificatie t.b.v. naturalisatie/verblijf | Adresverificatie | Vreemdelingenwet 1991 (S.B. 1992 no. 33); Wet Nationaliteit en Ingezetenschap |
| 11 | Justitie & Politie / KPS | Aanvraag bijzondere openbare-ordemaatregel (avondklok, demonstratiezone) | Voorbereidend besluit DC | Politiehandvest G.B. 1971 no. 70 |
| 12 | BiZa | Lokale assistentie bij verkiezingsorganisatie (DC = voorzitter Hoofdstembureau) | Uitvoering | Kiesregeling |
| 13 | Defensie / Maritieme Autoriteit Suriname | Advies vergunning bij waterwegen, havens | Lokaal advies | Havenwet (G.B. 1948 no. 155) |
| 14 | Min. Sociale Zaken & Volkshuisvesting | Lokale verificatie sociale-woningaanvragen | Adres + sociale check | SoZaVo-beleid |
| 15 | Min. Onderwijs, Wetenschap & Cultuur (MinOWC) | Schoolzonering / lokale veiligheidstoets | Advies | Onderwijsregelgeving |
| 16 | MI-GLIS | Verzoek tot adresverificatie t.b.v. kadasterregistratie | Cross-check | Wet GLIS |
| 17 | Rekenkamer Suriname | Inlichtingenverzoek t.b.v. rechtmatigheidsonderzoek | Documentlevering | Wet Rekenkamer |

C2G burgerdienst-zaaktypen (eerste tranche MijnSuriname):

| # | Dienst | Initiator | Bron(nen) | Eigen aan DC? |
|---|---|---|---|---|
| 1 | Verklaring van Goed Gedrag | Burger | CBB + KPS | Ja |
| 2 | Verklaring van Woonplaats (Surinamers) | Burger | CBB | Gedeeld met CBB-wijkkantoor |
| 3 | Verklaring verloren ID-kaart | Burger | KPS-aangifte | Ja |
| 4 | Hinderwetvergunning | Burger / Ondernemer | KPS + Brandweer + NMA | Ja (eindbeschikking DC) |
| 5 | Vergunning openbare vermakelijkheid / muziek-/dansparty | Burger / Org. | KPS + Brandweer | Ja |
| 6 | Bedrijfsvergunning lokaal (waar van toepassing) | Ondernemer | EZ + KvK | Ja (autonome bevoegdheid) |
| 7 | Klacht / melding overlast | Burger | — | Doorzet naar NMA / Arbeidsinspectie |
| 8 | Aanvraag jubileumbezoek / gouden huwelijk | Burger | CBB | Ja (BIC-werk) |

---

## Recommendations (gefaseerd, met concrete drempels)

**Fase 1 (0–6 mnd) — Funderingsleggen**

- Implementeer OpenZaak-SR (fork van het Nederlandse OpenZaak; OpenZaak is een open-source codebase gebouwd in opdracht van een coalitie van meer dan 45 gemeenten en ontwikkeld door Maykin Media B.V., en implementeert de ZGW API-standaarden van VNG Realisatie — voor Suriname te lokaliseren met Surinaamse strings en vervanging van RSIN door OIN-SR).
- Zet S-Road Central Server op onder e-Gov; sluit als eerste 3 organisaties aan: één pilot-commissariaat (Wanica), CBB, KPS.
- Bouw Catalogi-API en vul de eerste 3 zaaktypen: `VGG_BURGER`, `TERREIN_ONDERZOEK_GBB`, `WOONPLAATSVERKLARING_BURGER`.
- Drempel voor doorgaan naar fase 2: **≥ 200 VGG's** succesvol digitaal afgegeven; **≥ 95% SLA-haal van 5 werkdagen**.

**Fase 2 (6–18 mnd) — Opschalen G2G**

- Sluit alle 10 districten + bestuursressorten Paramaribo aan.
- Voeg GBB-, TCT-, EZ-, ROM-zaaktypen toe.
- Implementeer Notificaties-API + callback-mechanisme bij ministeries.
- Drempel: **≥ 70% van alle terreinonderzoeksadviezen** via S-Road; e-mail/papier alleen voor uitzonderingen.

**Fase 3 (18–36 mnd) — Burgervolwassenheid**

- Voeg de overige 7 burgerdiensten toe (Hinderwet-flow, evenementenvergunning).
- Verbind met Hof van Justitie (legalisatie als follow-up zaak).
- QR-verificatieportaal `verify.gov.sr` operationeel.
- Drempel: **≥ 50% van alle commissariaatsdiensten** via MijnSuriname; aantoonbare daling fysieke bezoeken.

**Wat zou de planning veranderen**

- **Bestuurlijke decline van het e-Gov Directoraat**: Chief of Staff Sergio Akiemboto bevestigde aan lokale media dat *"de functie van directeur e-Gov, samen met die van directeur Bestuurscoördinatie en Monitoring, in de huidige regeerperiode zal komen te vervallen"* (Dagblad Suriname, 2 september 2025); aanvullend werd op vrijdag 12 september 2025 directeur e-Government Prewien Ramadhin door het Kabinet van de President uit zijn functie ontheven. Dit vereist verschuiven van governance naar Kabinet van de President zelf of een nieuwe organisatorische verankering — een politiek-bestuurlijke risicofactor die nadrukkelijk in de kick-off moet worden geadresseerd.
- Vertraging in landelijke e-ID-roll-out: 2FA-functionaliteit blijft randvoorwaarde voor C2G.
- Aanpassing Hinderwet (consultatie ROM 2023): bij verruiming wetgeving moet zaaktype-template worden bijgesteld; configureerbaar dus weinig impact.

---

## Caveats

1. **De wettelijke grondslag** van de VGG in Suriname is samengesteld uit oudere reglementen (Reglement op het Beheer der Districten 1948 en voorgangers) en de Instructie Districtscommissarissen 1990. Er bestaat — voor zover in publieke bronnen vindbaar — **geen specifiek wettelijk artikel** dat de VGG als product definieert. Dit is een **juridisch zwakke plek**; aanbevolen wordt een staatsbesluit dat de digitale VGG expliciet kwalificeert (vergelijkbaar met de Wet justitiële gegevens in NL).
2. **Tarieven (SRD-bedragen)** in deze tekst zijn gebaseerd op een gedateerd ATM-formulier; door inflatie zijn de actuele tarieven hoger en variëren per BIC. Een bron uit 2018 bevestigt een tariefherziening; geen consistente landelijke tariefstructuur publiek beschikbaar.
3. **Facebook-bronnen** (BIC Paramaribo-Zuidwest, BIC Wanica Zuid-Oost) konden alleen via zoekmachine-snippets worden gelezen; volledige posts vereisen account-toegang en zijn niet automatisch verifieerbaar.
4. **Het ontwerp gaat uit** van een werkende Digitale-ID gov.sr-infrastructuur met 2FA. Voor burgers zonder smartphone is een offline-fallback (papieren aanvraag bij BIC, ambtenaar scant in en plaatst in OpenZaak-SR) cruciaal en in B.7 punt 7 expliciet meegenomen.
5. **KPS-koppeling**: een Antecedenten-API bestaat nog niet als publiek-geverifieerde service in Suriname; bouw vereist samenwerking met KPS-ICT en juridische dekking (bevoegdheidsverklaring per zaaktype + minimalisatie van velden — alleen "hit/no-hit" voor de meeste use-cases, met opvraagbare details voor de DC-rol).
6. **Politieke continuïteit e-Gov**: zoals hierboven beschreven is de directeurspositie e-Gov in september 2025 vacant gemaakt en is besloten de functie te laten vervallen. Een MijnSuriname/S-Road-roadmap is dus deels afhankelijk van bestuurlijke wil en internationale partnerships (UNDP, NIIS).
7. **Geen polling vanuit ministerie**: per gebruikersverzoek **expliciet zo ontworpen**. Mocht in een latere fase toch behoefte ontstaan aan inzage in voortgang, dan kan via de Notificaties-API een abonnement worden ingesteld zonder het procesontwerp te veranderen.
8. **Cijfer grondregistraties**: de eerder genoemde "ruim 75.000 burgers geregistreerd" via gbbregistratie.sr is onattribueerd in publieke bronnen; het meest recent geverifieerde cijfer is **40.137 registraties landelijk medio oktober 2021** (GBB-minister Dinotha Vorswijk, United News). Voor blauwdruk-volumetrie wordt aanbevolen om bij GBB actuele cijfers op te vragen voordat capaciteit wordt gedimensioneerd.