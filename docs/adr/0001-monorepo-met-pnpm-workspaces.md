# ADR 0001 — Monorepo met pnpm workspaces

**Status:** geaccepteerd
**Datum:** 2026-05-24

## Context

We bouwen een API (NestJS) en een frontend (Next.js) die nauw gekoppeld zijn:
gedeelde DTO's, gedeelde types, mogelijk later gedeelde validatie-schema's.
Twee aparte repo's geeft overhead op deps-versies, type-synchronisatie en
PR-volgorde. Een monorepo houdt alles in lockstep.

## Beslissing

Monorepo met **pnpm workspaces**:
- `apps/api` — NestJS backend
- `apps/web` — Next.js frontend
- `packages/shared` — gedeelde types (later toe te voegen)

Geen Nx of Turborepo in MVP — pnpm workspaces volstaan voor onze schaal.

## Gevolgen

- Eén lockfile, één install, atomic PRs over backend+frontend mogelijk.
- CI moet leren om alleen relevante workspaces te bouwen (later).
- Bij e-Suriname-migratie kan elke workspace apart worden geëxtraheerd.
