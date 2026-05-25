# 05 — Rollen & permissies

## Principes

1. **Rol = wat doet deze persoon bestuurlijk.** Permissies hangen aan de rol, niet aan de persoon.
2. **Scope hoort bij de toewijzing**, niet bij de rol zelf. Een DC is DC voor *één district*; dezelfde rol-definitie werkt voor alle DC's.
3. **Least privilege.** Een rol krijgt alleen wat hij nodig heeft. Liever twee rollen aanmaken dan één te brede.
4. **Audit op rolwijzigingen.** Wie heeft wie wanneer welke rol gegeven, voor altijd traceerbaar.

## Rollen

| Rol | Scope | Omschrijving |
|-----|-------|--------------|
| `super_admin` | systeem | Platform-beheer (alleen technisch team) |
| `ro_minister` | nationaal | Minister RO — leest alles, beslist niets in het systeem zelf |
| `ro_directeur_decentralisatie` | nationaal | Directeur Decentralisatie — leest alles, keurt districtsplannen/begrotingen goed |
| `ro_beleidsmedewerker` | nationaal | Analyse, rapportages, exports |
| `dc` | district | Districtscommissaris — eindverantwoordelijk in district |
| `districtssecretaris` | district | Dagelijks beheer, vervangt DC bij afwezigheid |
| `ressortcoordinator` | ressort | Coördinator voor één ressort |
| `vergunningmedewerker` | district | Behandelt vergunningaanvragen |
| `projectmedewerker` | district | Beheert projecten, updates voortgang |
| `financieel_medewerker` | district | Begroting, uitgaven (Fase 2) |
| `meldingen_medewerker` | district / ressort | Verwerkt binnenkomende meldingen |
| `inspecteur` | district | Veldcontroles (mobiel), voegt observaties toe |
| `auditor` | nationaal | Read-only over alle districten + audit log |
| `burger` | n.v.t. | Optioneel account; kan eigen meldingen volgen |
| `ondernemer` | n.v.t. | Optioneel account; kan vergunningen aanvragen + dossiers zien |

## Permissie-matrix (MVP)

Symbolen: ✅ volledig · 👁 alleen lezen · ✍ eigen records · 🟡 met goedkeuring · — geen

| Permissie | super_admin | ro_dir | dc | secr | ressort | vergun | project | meld | inspect | auditor | burger | ondern |
|-----------|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|:-:|
| **Burger melden (publiek)** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | 👁 | ✅ | ✅ |
| **Melding lezen (eigen district)** | ✅ | ✅ | ✅ | ✅ | ✅* | ✅ | ✅ | ✅ | ✅ | 👁 | ✍ | ✍ |
| **Melding status updaten** | ✅ | — | ✅ | ✅ | ✅* | ✅ | — | ✅ | ✅ | — | — | — |
| **Melding sluiten** | ✅ | — | ✅ | ✅ | ✅* | ✅ | — | 🟡 | — | — | — | — |
| **Vergunning aanvragen** | — | — | — | — | — | — | — | — | — | — | ✅ | ✅ |
| **Vergunning behandelen** | ✅ | — | ✅ | ✅ | — | ✅ | — | — | — | 👁 | — | — |
| **Vergunning goedkeuren** | ✅ | — | ✅ | 🟡 | — | — | — | — | — | — | — | — |
| **Vergunning veldcontrole** | ✅ | — | ✅ | ✅ | — | ✅ | — | — | ✅ | — | — | — |
| **Project aanmaken** | ✅ | ✅ | ✅ | ✅ | — | — | ✅ | — | — | — | — | — |
| **Project status updaten** | ✅ | — | ✅ | ✅ | — | — | ✅ | — | — | — | — | — |
| **Document uploaden** | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ | — | ✍ | ✍ |
| **Dashboard district** | ✅ | ✅ | ✅ | ✅ | ✅* | 👁 | 👁 | 👁 | — | 👁 | — | — |
| **Maandrapport genereren** | ✅ | ✅ | ✅ | ✅ | — | — | — | — | — | ✅ | — | — |
| **Export naar Excel/CSV** | ✅ | ✅ | ✅ | ✅ | 👁* | — | — | — | — | ✅ | — | — |
| **Gebruikers beheren (eigen district)** | ✅ | ✅ | ✅ | 🟡 | — | — | — | — | — | — | — | — |
| **Gebruikers beheren (nationaal)** | ✅ | ✅ | — | — | — | — | — | — | — | — | — | — |
| **Audit log lezen** | ✅ | ✅ | ✅* | ✅* | — | — | — | — | — | ✅ | — | — |
| **Categorieën configureren** | ✅ | ✅ | 🟡 | — | — | — | — | — | — | — | — | — |
| **Workflow-templates wijzigen** | ✅ | — | — | — | — | — | — | — | — | — | — | — |

\* Beperkt tot eigen scope (eigen district of eigen ressort)

## Fase 2 — extra permissies

| Permissie | ro_dir | dc | secr | financieel | auditor |
|-----------|:-:|:-:|:-:|:-:|:-:|
| Begroting aanmaken | 👁 | ✅ | ✅ | ✅ | 👁 |
| Begroting goedkeuren | ✅ | 🟡 | — | — | — |
| Uitgave registreren | — | 👁 | ✅ | ✅ | 👁 |
| Uitgave goedkeuren | — | ✅ | — | — | — |
| Ressortplan opstellen | — | — | — | — | — | (`ressortcoordinator` heeft deze)
| Districtsplan opstellen | 👁 | ✅ | ✅ | — | 👁 |

## Scope-isolatie

In de database wordt elk record waar relevant gestempeld met `district_id` (en optioneel `ressort_id`). Row-Level Security policies in PostgreSQL zorgen dat queries automatisch alleen records uit de eigen scope teruggeven, **ook als de applicatie het zou vergeten**.

Voorbeeld policy:
```sql
CREATE POLICY reports_district_isolation ON reports
  FOR ALL
  USING (
    district_id = current_setting('app.current_district_id')::int
    OR current_setting('app.user_is_national')::bool = true
  );
```

Sessievariabelen worden bij elke request gezet op basis van de geauthenticeerde gebruiker.

## Speciale gevallen

- **Burger zonder account**: kan melding doen, ontvangt magic-link om status te volgen. Geen toegang tot iets anders.
- **Inhuur / consultant**: krijgt tijdelijke rol met einddatum. Systeem revoke't automatisch op einddatum.
- **Wisseling DC**: oude DC raakt rol kwijt op einddatum, nieuwe krijgt rol vanaf startdatum, audit-log laat de overdracht zien.
- **Inheemse/Marron dorpshoofden**: in Fase 2 toegevoegd als `dorpshoofd` rol met scope = ressort (zie [07](07-aanvullend-onderzoek.md)).

## Wat we expliciet niet doen

- Geen "lees alles wat publiek is" rol voor burgers. Publieke transparantie komt via een aparte **Open Data API** (Fase 3), niet via accounts.
- Geen impersonatie ("inloggen als gebruiker X") in MVP. Te risicovol zonder volwassen audit-tooling.
- Geen vrije permissie-toekenning per gebruiker. Alleen rollen toekennen, anders verwordt RBAC tot chaos.
