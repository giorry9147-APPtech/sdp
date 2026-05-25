# 03 — Stappenplan / Roadmap

Concrete bouwvolgorde van eerste lijn code tot productie-pilot in één district. Gericht op een klein team (2–4 engineers, 1 PM/PO, 1 UX, 1 jurist/beleidsadviseur op afroep).

## Fase 0 — Voorbereiding (2–4 weken, parallel aan team-formatie)

**Doel:** zonder code helder krijgen wat er gebouwd wordt, met wie en onder welke regels.

- [ ] **Stakeholder-mapping**: RO, Directeur Decentralisatie, 1 DC (pilot), 1 districtssecretaris, 1 ressortcoördinator, jurist WRO.
- [ ] **Intentieverklaring** met RO / pilot-DC vastleggen (geen formeel contract nodig, wel commitment).
- [ ] **Juridische scan**: Wet Regionale Organen, persoonsgegevenswetgeving, archiefregels, retentieplicht.
- [ ] **Pilot-district kiezen** (zie [01-mvp-scope.md](01-mvp-scope.md))
- [ ] **Procesinterviews**: 1 dag meelopen bij DC-kantoor; vergunningloket; klachtenafhandeling.
- [ ] **Branding & naam vaststellen** (SDP definitief?), logo, kleurpalet.
- [ ] **Hosting-keuze**: lokaal datacenter Suriname vs. regio (Caribbean/AWS Brazilië) — zie [04-architectuur.md](04-architectuur.md).
- [ ] **Repo + CI/CD opzetten**, environments dev/staging/prod, secret management.

**Deliverable Fase 0:** projectcharter (1 pagina), pilot-DC akkoord, hosting-keuze gemaakt, repo staat klaar.

---

## Fase 1 — MVP-bouw (3–6 maanden)

### Sprint 1–2 (week 1–4) — Fundament

- [ ] Database schema v1 (PostgreSQL + PostGIS-extensie)
  - tabellen: `users`, `roles`, `permissions`, `user_roles`, `audit_log`, `districts`, `ressorts`, `categories`
  - seed: 10 districten + 62 ressorten
- [ ] Authenticatie + RBAC (module A)
- [ ] Audit-log fundament (module I) — *moet er staan vóór andere modules*
- [ ] Basis-UI scaffolding (layout, nav, theme, responsive grid)
- [ ] Email-gateway aansluiten (SMTP via SendGrid/Postmark/lokaal)
- [ ] Storage backend (S3-compatible, bv. Backblaze/Wasabi voor kostencontrole)

**Demoable:** een admin kan een gebruiker aanmaken, rol toewijzen, inloggen, en de actie verschijnt in de audit log.

### Sprint 3–4 (week 5–8) — Burger Meldpunt (Module B)

- [ ] Publiek formulier (geen login)
- [ ] Foto-upload + GPS
- [ ] Categorieën-config (admin instelbaar)
- [ ] Ticket-systeem + statusflow
- [ ] Email/in-app notificatie aan burger
- [ ] Toegewezen-aan-medewerker view
- [ ] Status updaten (medewerker view)

**Demoable:** burger meldt kapotte straatlamp via telefoon, krijgt ticketnummer, medewerker ziet het op kantoor, kan status updaten, burger krijgt mail.

### Sprint 5–6 (week 9–12) — Dossier & Vergunningen basis

- [ ] Documentbeheer (module E) met versies en permissies
- [ ] Vergunningen-module (module D) — start met hinderwet als eerste type
- [ ] Aanvraagformulier dynamisch per type
- [ ] Workflow-engine (statussen, transities, gatekeepers per rol)
- [ ] PDF-besluitgenerator (template + variabelen)
- [ ] Veldcontrole-notitie (mobiel)

**Demoable:** ondernemer dient hinderwet-aanvraag in, vergunningmedewerker behandelt, DC tekent digitaal, PDF wordt automatisch gegenereerd en ge-archiveerd.

### Sprint 7–8 (week 13–16) — Projecten + Dashboard

- [ ] Projectmonitoring (module F)
- [ ] DC-dashboard (module C) — live tegels, mijn taken
- [ ] Voortgangslogboek met foto's
- [ ] Filterbalk per ressort

**Demoable:** DC opent dashboard 's ochtends en ziet álle openstaande zaken in één scherm.

### Sprint 9–10 (week 17–20) — Rapportage + hardening

- [ ] Rapportage-module (G) — maandrapport PDF + Excel-export
- [ ] Performance-pass (queries, indexes, lazy-loading)
- [ ] Security-pass (OWASP top 10 audit, dependency scan)
- [ ] Backup + disaster-recovery test
- [ ] Browser-test op mid-range Android + slecht netwerk

**Demoable:** complete MVP, klaar voor interne UAT.

### Sprint 11–12 (week 21–24) — Pilot voorbereiding

- [ ] User acceptance test met pilot-DC en team (gestructureerd, gescripte scenario's)
- [ ] Issues uit UAT fixen
- [ ] Trainingsmateriaal (korte video's + 1-pager per rol)
- [ ] Train-de-trainer met districtssecretaris
- [ ] Data-migratie van bestaande Excel-lijsten (optioneel, alleen lopende dossiers)
- [ ] Go-live runbook (wat te doen bij uitval, contact-escalatie)

**Deliverable Fase 1:** SDP draait in productie bij 1 districtscommissariaat.

---

## Fase 2 — Planning & Decentralisatie (6–12 maanden na go-live)

**Voorwaarde:** Fase 1 minimaal 3 maanden stabiel in gebruik, ≥1 districtsuitbreiding gedaan.

### Sprint 13–16 — Uitrol overige districten

- [ ] Districten één voor één onboarden (volgorde: Paramaribo → Wanica → Nickerie → Commewijne → Para → Saramacca → Coronie → Marowijne → Brokopondo → Sipaliwini)
- [ ] Multi-tenant verfijning (data-isolatie tussen districten)
- [ ] Inheemse / Marron-dorpsbestuurslaag toevoegen (kapiteins, granmans) — zie [07](07-aanvullend-onderzoek.md)

### Sprint 17–20 — Ressort- en districtsplanning (Module J)

- [ ] Ressortplan-builder
- [ ] Aggregatie naar districtsplan
- [ ] Goedkeuringsflow met meerdere lagen
- [ ] Koppeling meldingen ↔ planprioriteiten

### Sprint 21–24 — Financiële module (Module L)

- [ ] Districtsbegroting
- [ ] Uitgavenregistratie
- [ ] Approval-flow
- [ ] Audit-export

### Sprint 25–28 — Burgerparticipatie + meertaligheid

- [ ] Online consultaties
- [ ] Sranan Tongo en Sarnami als interface-talen
- [ ] SMS / WhatsApp Business API notificaties
- [ ] Offline draft-mode (PWA service worker)

---

## Fase 3 — GIS, AI & integraties (12+ maanden)

### Sprint 29+ — GIS-viewer

- [ ] Kaartlagen districten + ressorten (officiële geodata van LBL / ministerie ROM)
- [ ] Meldingen, vergunningen, projecten als overlays
- [ ] "Regels op de kaart"

### Sprint X — Externe integraties (één per kwartaal)

- [ ] CBB single-source-of-truth burgers
- [ ] MI-GLIS perceelinformatie
- [ ] e-Government SSO
- [ ] Open Data API publiceren

### Sprint X — AI

- [ ] Burger-chatbot vergunning-check
- [ ] Dossier-samenvatter
- [ ] Patroonanalyse-dashboard

---

## Schaal-checkpoints (gates tussen fases)

Voor je naar de volgende fase gaat moeten deze waar zijn:

**Gate Fase 1 → Fase 2**
- 1 district minstens 3 maanden in productie
- ≥80% van inkomende meldingen wordt via SDP afgehandeld
- Geen kritieke (P0) bugs openstaand
- Backup-restore is getest in de praktijk
- DC en districtssecretaris kunnen het systeem zonder support gebruiken

**Gate Fase 2 → Fase 3**
- ≥5 districten in productie
- Ressortplan-cyclus is minstens 1× volledig doorlopen
- Financiële module is door auditor afgetekend
- Klachten over performance <5% van tickets

---

## Risico's en mitigaties

| Risico | Kans | Impact | Mitigatie |
|--------|------|--------|-----------|
| Politieke wisseling halverwege bouw | hoog | hoog | Werken met ambtelijke top, niet alleen politiek; documenteer waarde aantoonbaar |
| DC adopteert niet, blijft WhatsApp gebruiken | middel | hoog | Pilot-DC vroeg betrekken, mede-eigenaar maken; eerste 4 weken on-site support |
| Slecht internet bij ressorten in binnenland | hoog | middel | Offline-draft mode in Fase 2; print-fallback in MVP |
| Data-soevereiniteit / hosting-zorgen | middel | hoog | Vroeg juridisch advies; ready om naar lokale hosting te migreren |
| Burger-misbruik van meldpunt (spam, vals) | hoog | laag | Rate-limit per IP/telefoon; moderatie-queue voor publieke meldingen |
| Scope creep "kunnen we ook X erbij..." | hoog | hoog | Fase-gates strikt handhaven; backlog tonen, niet bouwen |
| Lekken van persoonsgegevens via export | laag | hoog | Audit-log op export; rate-limit; PII-velden maskeren in download |
