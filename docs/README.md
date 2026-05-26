# SDP — Suriname Decentralisatie Platform

Documentatieset voor het ontwerp en de bouw van het **Suriname Decentralisatie Platform (SDP)**: digitale bestuursinfrastructuur voor districtscommissariaten, districtsraden, ressortraden en het Ministerie van Regionale Ontwikkeling en Sport (RO).

## Positionering

> Het Suriname Decentralisatie Platform digitaliseert de bestuurlijke werking van districtscommissariaten door lokale meldingen, vergunningen, ressortplannen, districtsprojecten en financiële rapportages centraal te beheren, zodat decentralisatie meetbaar, transparant en uitvoerbaar wordt.

**Wat het wél is:** digitaal bestuurs- en decentralisatieplatform voor de 10 districten en ~62 ressorten.
**Wat het níet is:** kadaster, rechter, of automatisch besluitvormend systeem over grondenrechten.

## Inhoud

| # | Document | Doel |
|---|----------|------|
| 01 | [MVP scope](01-mvp-scope.md) | Wat zit er wél in de MVP en wat expliciet niet |
| 02 | [Componenten & modules](02-componenten.md) | Alle functionele modules, MVP-eerst gemarkeerd |
| 03 | [Stappenplan / roadmap](03-stappenplan.md) | Concrete bouwvolgorde, sprints en milestones |
| 04 | [Technische architectuur](04-architectuur.md) | Stack, datamodel, integraties, security |
| 05 | [Rollen & permissies](05-rollen-permissies.md) | Wie mag wat, RBAC-matrix |
| 06 | [Features voor later (Fase 2/3)](06-features-later.md) | Wat bewust uit de MVP blijft |
| 07 | [Aanvullend onderzoek](07-aanvullend-onderzoek.md) | Wat ontbreekt in het huidige onderzoek + aanbevelingen |
| 08 | [WRO-compliance mapping](08-wro-compliance.md) | Per artikel Wet Regionale Organen: status MVP + gap + fase |

## Bronnen

Het basisonderzoek staat in [`../AI-onderzoek.md`](../AI-onderzoek.md). De brontekst van de Wet Regionale Organen staat in [`wet-regionale-organen.md`](wet-regionale-organen.md). De documenten in deze map bouwen daarop voort en maken het bouwbaar.

## Faseplanning samengevat

```
Fase 1 — MVP (3–6 maanden)
  District Operations: meldingen, vergunningen, dossiers, dashboards, projecten, rapportage

Fase 2 — Planning & Decentralisatie (6–12 maanden)
  Ressortplannen, districtsplannen, begrotingen, burgerparticipatie

Fase 3 — GIS & Intelligence (12+ maanden)
  Kaarten (PostGIS), analytics, AI-assistentie, beleidsadvies, integraties
```
