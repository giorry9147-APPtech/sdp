# 07 — Juridisch & wetgevingstraject

> **Wet komt vóór tech.** Zonder vastgestelde Privacywet kan een X-Road/S-Road implementatie niet rechtmatig data uitwisselen tussen basisregisters. Dit document is de roadmap voor het juridische pad parallel aan de technische bouw.

## Bestaand juridisch kader

### Constitutioneel
- **Grondwet 1987** artikel 159–163: democratische ordening op regionaal niveau

### Decentralisatie
- **Wet Regionale Organen (WRO)** S.B. 1989 No. 44, gewijzigd S.B. 2005 No. 28
  - DC/DR/RR-bevoegdheden
  - art. 40: districtsfonds
  - art. 47: autonome bevoegdheden (secundaire/tertiaire wegen, openbare ruimten, brandpreventie, openbare gezondheid)
- **Wet Interim Financiële Decentralisatie** S.B. 2003 No. 33 — interim, niet voltooid
- **Decreet Districtenindeling 1983** (S.B. 1983 No. 24); **Decreet C-67A** (S.B. 1985 No. 17)
- **Decreet Ressortenindeling** S.B. 1987 No. 67
- **Reglement op het Beheer der Districten** — historische basis

### Sector
- **Hinderwet** G. 1930 no. 64, gewijzigd S. 2001 no. 63 — DC vergunningsverlening
- **Staatsbesluit** 27 oktober 2016 — verplichte PerceelsID (MI-GLIS)
- **Artikel 187b Wetboek van Strafrecht** — huidige beperkte privacy-bescherming

### Internationale ratificaties (relevant)
- ICCPR
- IACHR
- Verdrag van Wenen (Diplomatieke Betrekkingen) — basis voor Data Embassy-analogie

## Wat **ontbreekt** (te realiseren wetgeving)

### A. Privacy & gegevensbescherming
**Ontwerpwet Bescherming Privacy en Persoonsgegevens** — ligt sinds 2020 bij DNA in behandeling, **niet aangenomen**.

Kritische onderdelen:
- Hoofdstuk VII: **Commissaris voor Persoonsgegevensbescherming** als onafhankelijke autoriteit
- Rechtsgrondslagen voor verwerking
- Rechten van betrokkenen (inzage, correctie, vergetelheid)
- Internationale doorgifte (relevant voor Data Embassy)
- Datalek-meldplicht
- Sanctieregime

**Status**: kritieke voorwaarde voor S-Road productie. **Aanname doel Q3 2026.**

### B. e-Suriname Agentschap-wet (nieuw)
- Oprichting Agentschap als publiekrechtelijk lichaam (ZBO-achtig)
- Rechtspersoonlijkheid
- Meerjarenbegroting (>2 jaar i.p.v. jaarlijks)
- Mandaat over alle ministeries voor digitale architectuur
- Loonschalen-autonomie (concurrerend met private sector)
- Verantwoording aan Stuurgroep + DNA

**Status**: voorbereiden Fase 0 (0–6 mnd), aanname Q4 2026.

### C. Staatsbesluit Basisregisters Suriname (nieuw)
- CBB/CBA, MI-GLIS, KKF officieel aangewezen als enige bron van waarheid
- BAS (Adressen) toevoegen zodra opgezet
- KPS (Voertuigen) toevoegen Fase 3
- Belastingen-register Fase 3
- Datakwaliteitsnormen + SLA's
- Hergebruikplicht (once-only): andere overheidsorganisaties **moeten** via deze registers ophalen, niet kopiëren
- Verplichte API-publicatie via S-Road

**Status**: voorbereiden Fase 0, in werking Fase 1.

### D. Wijzigingswet WRO (digitale toevoegingen)
- Digitale agenda's RR/DR (juridisch geldig)
- Digitale hoorzittingen (juridisch geldig)
- Digitale stemming in RR/DR (juridisch geldig, naar VOLIS-model)
- Digitale bekendmakingen (officieel publicatiemedium)
- Digitale handtekening DC voor besluiten

**Status**: voorbereiden Fase 0/1, aanname Fase 2.

### E. Wet op de Digitale Handtekening (eIDAS-equivalent, nieuw)
- 3 niveaus van zekerheid (laag/substantieel/hoog)
- Digitale handtekening = handgeschreven handtekening (zoals EE Digital Signatures Act 2000)
- Erkenning van eID-providers
- Internationale erkenning (CARICOM-koppeling, mogelijk eIDAS-erkenning EU later)

**Status**: voorbereiden Fase 1, aanname Fase 2.

### F. Wet op de Openbare Informatie / WOO-equivalent (nieuw)
- Default-openbaar voor overheidsinformatie
- Open Data verplicht voor bepaalde categorieën
- Burger recht op verzoek tot informatie
- Beperkingsgronden gelijk aan internationale standaarden

**Status**: voorbereiden Fase 2.

### G. District Tax Law (uit DLGP-II onafgemaakt)
- Eigen belastingautonomie districten
- Indien aangenomen: districtsbelasting-module in platform (Fase 3)
- Eindelijk maken fiscale decentralisatie operationeel

**Status**: politiek-gevoelig, niet kritiek voor MVP. Trigger voor Fase 3 module.

### H. Law on Financial Relations Central/Districts (DEF — District Equalization Fund) (uit DLGP-II onafgemaakt)
- Verevenings-mechanisme tussen districten
- Verdelingscriteria
- Onmisbaar voor volwassen fiscale decentralisatie

**Status**: politiek-gevoelig. Voorwaarde voor financieel beheer Fase 3 volwaardig.

### I. Update art. IV Wet Interim Financiële Decentralisatie (uit DLGP-II onafgemaakt)
- Definitief maken wat interim was

**Status**: koppelen aan G en H.

### J. Archiefwet-update (nieuw of update)
- Digitaal archief = juridisch geldig archief
- Langetermijn-bewaring digitale documenten (PDF/A, etc.)
- Exporteerbaarheid in standaardformaten
- Retentietermijnen per dossiertype

**Status**: voorbereiden Fase 1.

### K. Cyber Security Act (nieuw)
- National CSIRT-mandaat
- Meldplicht security-incidenten
- Verplichtingen voor kritieke infrastructuur
- Penalties voor cyber-misdrijven
- Vergelijkbaar met EE Cyber Security Act

**Status**: voorbereiden Fase 1/2.

### L. Data Embassy-verdrag (bilateraal, nieuw)
- Datacenter onder soeverein gebied bevriend land (Wenen-Conventie-analogie)
- Logische kandidaten: Nederland, Brazilië, Trinidad
- Bilateraal verdrag — DNA-ratificatie verplicht

**Status**: voorbereiden Fase 3, ratificatie Fase 4.

## Tijdlijn wetgeving

```
Q1 2026:  Onderhandeling DNA Privacywet  ◄─ Fase 0 start
Q2 2026:  Voorbereiding e-Suriname Agentschap-wet
Q3 2026:  ✅ Privacywet aangenomen        (kritieke gate)
Q3 2026:  ✅ Commissaris PDP benoemd
Q4 2026:  ✅ e-Suriname Agentschap-wet aangenomen
Q4 2026:  ✅ Staatsbesluit Basisregisters in werking
Q1 2027:  Wijzigingswet WRO ingediend     ◄─ Fase 1
Q2 2027:  Wet Digitale Handtekening ingediend
Q4 2027:  ✅ Wijzigingswet WRO aangenomen
Q1 2028:  ✅ Wet Digitale Handtekening aangenomen
Q2 2028:  Archiefwet-update ingediend     ◄─ Fase 2
Q3 2028:  Cyber Security Act ingediend
Q1 2029:  ✅ Archiefwet aangenomen
Q2 2029:  ✅ Cyber Security Act aangenomen
Q4 2029:  WOO-equivalent ingediend         ◄─ Fase 3
Q1 2030:  District Tax Law + DEF heronderhandeling (politiek)
Q2 2030:  Data Embassy-verdrag onderhandeling ◄─ Fase 4
Q4 2030:  ✅ Data Embassy-verdrag geratificeerd
```

## Risico's & mitigaties (juridisch)

| Risico | Kans | Impact | Mitigatie |
|--------|------|--------|-----------|
| Privacywet wordt jaren vertraagd in DNA | hoog | kritiek | Fase 0 prioriteit; presidentiële druk; tijdelijke minimal-contracten tussen organisaties |
| Politieke wisseling verandert prioriteit | hoog | hoog | Verankering via Agentschap-wet als ZBO; internationale MoU's bindend |
| Districts-belasting-wet politiek vastloopt | hoog | middel | Niet kritiek voor MVP; module-bouw uitstellen tot na wet |
| Wijzigingswet WRO loopt vast in politieke gevoeligheden | middel | hoog | Stap-voor-stap aanpak: eerst digitale bekendmakingen (minst controversieel) |
| Data Embassy-verdrag DNA-ratificatie | middel | middel | Tijdig politieke draagvlak; CARICOM-partner mogelijk minder gevoelig |
| Internationale doorgifte zonder Privacywet | hoog | hoog | Géén internationale data zonder wet; tijdelijk lokale-only hosting |
| Archief-juridisch geen geldig digitaal archief | middel | hoog | Tijdelijk papier-backup voor cruciale dossiers tot Archiefwet update |
| Commissaris PDP onafhankelijkheid bedreigd | middel | hoog | Aparte begroting, langere benoemingstermijn dan kabinet, internationale toetsing |

## Stakeholders juridisch traject

| Stakeholder | Rol |
|-------------|-----|
| **DNA** | Wetgever |
| **Kabinet van de President** | Initiator wetsontwerpen, presidentiële besluiten |
| **Min. Justitie en Politie** | Privacywet, eIDAS-equivalent, strafrecht-koppeling |
| **Min. Binnenlandse Zaken** | e-Suriname Agentschap-wet, ICT-beleid, Basisregisters |
| **Min. Regionale Ontwikkeling en Sport** | WRO-wijzigingen, District Tax, DEF |
| **Min. Financiën** | Wet Interim Financiële Decentralisatie, Wet Fid |
| **Anton de Kom Universiteit (Juridische Faculteit)** | Wetenschappelijke onderbouwing |
| **Surinaamse Vereniging Privacyrecht** (indien bestaand) | Maatschappelijk middenveld |
| **Internationale adviseurs** | NL Autoriteit Persoonsgegevens, EE Andmekaitse Inspektsioon (DPI) |

## Aanbeveling — onmiddellijke acties (eerste 3 maanden)

1. **Presidentieel Besluit "Digitale Transformatie Suriname"** ondertekenen — geeft politiek mandaat
2. **DNA-onderhandeling Privacywet starten** — directe lobby via President + MinJus
3. **Architectuur Principes Document publiceren** — open consultatie, bouwt draagvlak
4. **Internationale juridische adviseurs werven** — NL AP, EE DPI, Logius juristen
5. **Capaciteit "Juridisch & Compliance" binnen Agentschap** opzetten (Fase 0 werving)
