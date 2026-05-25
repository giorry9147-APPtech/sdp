# ADR 0003 — PostGIS vanaf dag 1, GIS-viewer in Fase 3

**Status:** geaccepteerd
**Datum:** 2026-05-24

## Context

Locatie is fundamenteel voor decentralisatie-data:
- Meldingen hebben een GPS-coördinaat (waar is de drainage stuk?)
- Vergunningen hebben een perceel-locatie
- Projecten hebben een fysieke locatie
- Districten en ressorten zijn polygonen op de kaart
- "Regels op de kaart" (Fase 3) vereist spatial queries

Wanneer we starten met `lat`/`lon` als losse floats en later migreren naar
PostGIS, betekent dat een grote schema-migratie met data-conversie.

## Beslissing

- **PostGIS-extensie geactiveerd vanaf de eerste migratie.**
- `Districten.geom` als `geography(MultiPolygon, 4326)`
- `Ressorten.geom` idem
- `Meldingen.geom` / `Vergunningen.geom` / `Projecten.geom` als `geography(Point, 4326)`
- **Géén GIS-viewer in MVP** — de data wordt geo-aware opgeslagen, maar
  visualisatie wacht tot Fase 3 (MapLibre + officiële geodata MI-GLIS).

## Gevolgen

- Tabellen hebben vanaf dag 1 spatial indexes klaar (`USING GIST(geom)`).
- Prisma kent `Unsupported("...")` voor geom-types — we schrijven die
  velden via `$executeRawUnsafe(...)`. Acceptabele beperking voor MVP.
- Lokale dev vereist `postgis/postgis:16-3.4` Docker image (geen vanilla
  postgres).
- Productie-hosting moet PostGIS ondersteunen (AWS RDS PostgreSQL doet
  dit; Aurora Serverless v2 ook).

## Migratiepad e-Suriname

Bij overgang naar e-Suriname (S-Road) blijft het schema bruikbaar.
De GIS-viewer in Fase 3 van e-Suriname (zie
[docs-claude/09-features-later.md](../../docs-claude/09-features-later.md))
kan SDP-data als data-source gebruiken via S-Road.
