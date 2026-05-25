# e-Suriname / MijnSuriname — Geïntegreerd Decentralisatie- & e-Governmentplatform

Documentatieset op basis van de strategische blauwdruk in [`../CLAUDE-onderzoek.md`](../CLAUDE-onderzoek.md): één geïntegreerd nationaal platform dat zowel **burgerdiensten** (DigiD-equivalent, berichtenbox, vergunningen, aangiftes, meldingen) als **bestuurlijke processen** voor de 10 districtscommissariaten, 62 ressortraden en districtsraden ondersteunt.

## Verhouding tot het SDP-spoor (`../docs/`)

| Spoor | Scope | Eigenaar | Budget | Looptijd |
|-------|-------|----------|--------|----------|
| **SDP** (`../docs/`) | District-bestuur (RO-domein) | Min. Regionale Ontwikkeling | bescheiden | 3–6 mnd MVP |
| **e-Suriname** (deze map) | Nationaal e-Gov + districts­bestuur | Kabinet van de President / e-Suriname Agentschap | USD 35–55 mln / 5 jaar | 60 mnd in 5 fases |

**SDP is bouwbaar binnen e-Suriname** als de bestuurlijke laag (BestuurSR) van het bredere platform — of als pragmatische voorloper die later op S-Road aansluit. Zie [10-relatie-sdp.md](10-relatie-sdp.md).

## Positionering

> Eén geïntegreerd nationaal platform — werknaam **"e-Suriname / MijnSuriname"** — onder regie van het Directoraat e-Government (Kabinet van de President), gebouwd op het Estse X-Road interoperabiliteitsmodel (als **"S-Road"**) en het Nederlandse Common Ground 5-lagenprincipe, met **CBB, MI-GLIS en KKF** als basisregisters.

## Inhoud

| # | Document | Doel |
|---|----------|------|
| 01 | [MVP scope](01-mvp-scope.md) | Wat zit er in Fase 0+1 (Foundation), wat expliciet niet |
| 02 | [Componenten & modules](02-componenten.md) | Burgerportaal MijnSuriname + bestuurlijk BestuurSR + S-Road |
| 03 | [Stappenplan / roadmap (5 fases, 60 mnd)](03-stappenplan.md) | Concrete deliverables per fase met KPI's |
| 04 | [Architectuur (5-lagen + S-Road)](04-architectuur.md) | Common Ground 5-lagen, S-Road, basisregisters, soevereine cloud |
| 05 | [Rollen & permissies](05-rollen-permissies.md) | Nationaal + districtelijk RBAC, machtigingen |
| 06 | [Governance & organisatie](06-governance.md) | e-Suriname Agentschap, SISI, stuurgroep, capaciteit |
| 07 | [Juridisch traject](07-juridisch.md) | Privacywet, e-Suriname-wet, Staatsbesluit Basisregisters, eIDAS-equivalent |
| 08 | [Financiering & TCO](08-financiering.md) | IDB DLGP-III, UNDP, EU, NL, kostenraming per fase |
| 09 | [Features voor later (Fase 3/4)](09-features-later.md) | AI, i-Voting, Data Embassy, proactive services |
| 10 | [Relatie met SDP-spoor](10-relatie-sdp.md) | Hoe SDP en e-Suriname elkaar versterken of vervangen |
| 11 | [Aanvullend onderzoek](11-aanvullend-onderzoek.md) | Wat ontbreekt in de blauwdruk + risico's + aanbevelingen |

## Bronnen

Het basisonderzoek staat in [`../CLAUDE-onderzoek.md`](../CLAUDE-onderzoek.md). Aanvullende referenties: Common Ground (VNG), X-Road (NIIS), MijnOverheid (Logius), DLGP I/II evaluatie (Aspiazu 2014), National Digital Strategy Suriname 2023-2030 (UNDP).

## Faseplanning samengevat

```
Fase 0 — Voorbereiding & Governance        0–6 mnd     USD 1,5–2,5 mln
   wetgeving, agentschap, MoU's, financiering

Fase 1 — Foundation                        6–18 mnd    USD 8–12 mln
   S-Road MVP, MijnSuriname MVP, Signalen-SR pilot

Fase 2 — Core services                     18–36 mnd   USD 12–18 mln
   vergunningen, zaaksysteem DC's, VOLIS-SR ressortraden

Fase 3 — Uitbreiding                       36–48 mnd   USD 8–12 mln
   alle 10 districten + 62 ressorten, GIS, BI, financieel

Fase 4 — Optimalisatie & Innovatie         48–60 mnd   USD 5–8 mln
   AI, proactive services, i-Voting pilot, Data Embassy

TOTAAL 5 jaar                                          USD 35–55 mln
```

## Kritieke voorwaarden (gaten dichten vóór bouw)

1. **Privacywet aannemen** (Ontwerpwet Bescherming Privacy en Persoonsgegevens ligt sinds 2020 bij DNA)
2. **Commissaris voor Persoonsgegevensbescherming** installeren
3. **e-Suriname Agentschap** met rechtspersoonlijkheid en meerjarenbegroting
4. **MoU met NIIS** voor X-Road en **e-Governance Academy** voor training
5. **IDB DLGP-III financiering** veiligstellen
6. **Staatsbesluit Basisregisters** (CBB/MI-GLIS/KKF officieel als enige bron van waarheid)
