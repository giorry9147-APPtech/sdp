# ADR 0004 — Ressortplan → Districtsplan: WRO-conforme workflow

**Status:** geaccepteerd
**Datum:** 2026-05-24

## Context

De Wet Regionale Organen (S.B. 1989 No. 44) schrijft voor dat
ressortraden ontwikkelingsplannen opstellen die geaggregeerd worden tot
een districtsplan. Veel andere bestuurssystemen springen hier overheen
en bouwen alleen "tickets en taken" — wij willen de **kern van
decentralisatie** in het systeem hebben.

## Beslissing

Twee aparte entiteiten met expliciete state-machines:

### Ressortplan-flow
```
CONCEPT
   │ ressortplan.indienen
   ▼
TER_GOEDKEURING_RR
   │ ressortplan.goedkeur_rr
   ▼
GOEDGEKEURD ───► GEARCHIVEERD
```

### Districtsplan-flow
```
CONCEPT
   │ districtsplan.create
   ▼
TER_GOEDKEURING_DR
   │ districtsplan.goedkeur_dr
   ▼
TER_GOEDKEURING_DC
   │ DC zelf
   ▼
TER_GOEDKEURING_RO
   │ districtsplan.goedkeur_ro
   ▼
GOEDGEKEURD ───► GEARCHIVEERD
```

Beide hebben:
- **Versie-veld** — nieuwe goedgekeurde versie maakt vorige automatisch
  archivable.
- **Prioriteiten** als child-entiteit met titel, onderbouwing, urgentie,
  kostenraming (SRD).
- **Status-transities** zijn hardgeguard in
  [`plannen.service.ts`](../../apps/api/src/plannen/plannen.service.ts) —
  alleen valide overgangen toegestaan, alleen door rollen met juiste
  permissie.

### Aggregatie-endpoint

`GET /api/districten/:id/ressortplan-aggregatie?jaar=YYYY` geeft alle
**goedgekeurde** ressortplan-prioriteiten van het hele district terug,
gegroepeerd per ressort. Dit is de feitelijke input voor het opstellen
van het districtsplan door de DC — bottom-up.

## Gevolgen

- WRO-cyclus is in het systeem zichtbaar en afdwingbaar.
- Audit-log toont wie wanneer welke stap heeft genomen.
- Bij e-Suriname-migratie kunnen deze workflows worden uitgedrukt in
  BPMN binnen OpenZaak-SR (Fase 2 e-Suriname).
- Goedkeuringsketen vereist meerdere echte rollen (rr_lid, dr_lid, dc,
  ro_directeur_decentralisatie) — onmogelijk om met één gebruiker een
  plan eenzijdig erdoor te drukken.

## Open punten

- Stemming binnen RR/DR: in MVP volstaat één goedkeur-actie van een
  rr_lid/dr_lid. Echte meerderheidsstemming met aanwezigheid-quorum
  komt in Fase 2 (vereist VOLIS-SR-achtige module).
- Koppeling districtsplan ↔ districtsbegroting komt in Fase 2 wanneer
  de financiële module wordt gebouwd.
