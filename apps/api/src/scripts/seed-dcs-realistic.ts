#!/usr/bin/env tsx
/**
 * Subregios + realistische DC-gebruikers seeden.
 *
 * Bron: docs/DC's.md (lijst DC's 2025-2030). Sommige districten hebben
 * meerdere DC's met elk een eigen sub-regio (Paramaribo 3, Wanica 3,
 * Marowijne 2, Sipaliwini 7). Districten met 1 DC krijgen geen subregio.
 *
 * Idempotent: meerdere runs blijven werken.
 *
 * Echte emailadressen uit de bronlijst gebruiken we (nog) niet — voor
 * productie-uitrol: zie docs/03-stappenplan.md (Fase 0 — accounts
 * activeren met @sdp.sr-domein én verificatie via persoonlijke email).
 *
 * Gebruik: pnpm --filter @sdp/api admin:seed-dcs
 */
import { PrismaClient, type AuthProvider } from '@prisma/client';
import * as argon2 from 'argon2';

const DEMO_WACHTWOORD = 'Welkom2026!';

// ─── Subregio-definitie ──────────────────────────────────────────────
// Alleen districten met meerdere DC's. Districten met 1 DC krijgen geen
// subregio (de DC werkt op districtsniveau).
const SUBREGIOS: Array<{ districtCode: string; code: string; naam: string }> = [
  // Paramaribo (3)
  { districtCode: 'PAR', code: 'PAR-NO', naam: 'Noord-Oost' },
  { districtCode: 'PAR', code: 'PAR-ZW', naam: 'Zuid-West' },
  { districtCode: 'PAR', code: 'PAR-MD', naam: 'Midden' },

  // Wanica (3)
  { districtCode: 'WAN', code: 'WAN-ZO', naam: 'Zuid-Oost' },
  { districtCode: 'WAN', code: 'WAN-CN', naam: 'Centrum' },
  { districtCode: 'WAN', code: 'WAN-NW', naam: 'Noord-West' },

  // Marowijne (2)
  { districtCode: 'MAR', code: 'MAR-MOE', naam: 'Moengo (Zuid-West)' },
  { districtCode: 'MAR', code: 'MAR-ALB', naam: 'Albina (Noord-Oost)' },

  // Sipaliwini (7 — binnenland, allemaal apart bestuurd)
  { districtCode: 'SIP', code: 'SIP-COE', naam: 'Coeroeni' },
  { districtCode: 'SIP', code: 'SIP-COP', naam: 'Boven Coppename' },
  { districtCode: 'SIP', code: 'SIP-SAR', naam: 'Boven Saramacca' },
  { districtCode: 'SIP', code: 'SIP-SUR', naam: 'Boven Suriname (Matawai)' },
  { districtCode: 'SIP', code: 'SIP-TAP', naam: 'Tapanahony' },
  { districtCode: 'SIP', code: 'SIP-KAB', naam: 'Kabalebo' },
  { districtCode: 'SIP', code: 'SIP-PAM', naam: 'Pamakka' },
];

// ─── DC's per (district, [subregio]) ──────────────────────────────────
// Namen uit docs/DC's.md. Emails: <vornaam>.<achternaam>@sdp.sr (slug).
type DcSeed = {
  email: string;
  naam: string;
  districtCode: string;
  subregioCode?: string;
};

const DCS: DcSeed[] = [
  // Paramaribo
  { email: 'marlon.budike@sdp.sr',       naam: 'Marlon Budike',       districtCode: 'PAR', subregioCode: 'PAR-NO' },
  { email: 'ruchsana.ilahibaks@sdp.sr',  naam: 'Ruchsana Ilahibaks',  districtCode: 'PAR', subregioCode: 'PAR-ZW' },
  { email: 'wennys.vijfhoven@sdp.sr',    naam: 'Wennys Vijfhoven',    districtCode: 'PAR', subregioCode: 'PAR-MD' },

  // Wanica
  { email: 'ernesto.muller@sdp.sr',      naam: 'Ernesto Muller',      districtCode: 'WAN', subregioCode: 'WAN-ZO' },
  { email: 'ravi.bhattoe@sdp.sr',        naam: 'Ravi Bhattoe',        districtCode: 'WAN', subregioCode: 'WAN-CN' },
  { email: 'glenda.kranenburg@sdp.sr',   naam: 'Glenda Kranenburg',   districtCode: 'WAN', subregioCode: 'WAN-NW' },

  // 1-DC districten (geen subregio)
  { email: 'mohamed.bakas@sdp.sr',       naam: 'Mohamed Bakas',       districtCode: 'NIC' },
  { email: 'rajiv.ramsahai@sdp.sr',      naam: 'Rajiv Ramsahai',      districtCode: 'COM' },
  { email: 'patrick.kensenhuis@sdp.sr',  naam: 'Patrick Kensenhuis',  districtCode: 'PAA' },
  { email: 'aniel.ramautar@sdp.sr',      naam: 'Aniel Ramautar',      districtCode: 'SAR' },
  { email: 'eric.boldewijn@sdp.sr',      naam: 'Eric Boldewijn',      districtCode: 'COR' },
  { email: 'gregory.vanderkamp@sdp.sr',  naam: 'Gregory van der Kamp',districtCode: 'BRO' },

  // Marowijne
  { email: 'clyde.hunswijk@sdp.sr',      naam: 'Clyde Hunswijk',      districtCode: 'MAR', subregioCode: 'MAR-MOE' },
  { email: 'marvin.vijent@sdp.sr',       naam: 'Marvin Vijent',       districtCode: 'MAR', subregioCode: 'MAR-ALB' },

  // Sipaliwini
  { email: 'morishi.selindia@sdp.sr',       naam: 'Morishi Selindia',       districtCode: 'SIP', subregioCode: 'SIP-COE' },
  { email: 'clemens.karijosentono@sdp.sr',  naam: 'Clemens Karijosentono',  districtCode: 'SIP', subregioCode: 'SIP-COP' },
  { email: 'ruth.beely@sdp.sr',             naam: 'Ruth Beely',             districtCode: 'SIP', subregioCode: 'SIP-SUR' },
  { email: 'josafat.kanape@sdp.sr',         naam: 'Josafat Kanape',         districtCode: 'SIP', subregioCode: 'SIP-TAP' },
  { email: 'kevin.bronne@sdp.sr',           naam: 'Kevin Bronne',           districtCode: 'SIP', subregioCode: 'SIP-KAB' },
  { email: 'javinde.fulgence@sdp.sr',       naam: 'Javinde Fulgence',       districtCode: 'SIP', subregioCode: 'SIP-PAM' },
];

// Oude generieke DC-emails — worden verwijderd want vervangen door realistische.
const OUDE_GENERIEKE_DCS = [
  'dc.wanica@sdp.local',
  'dc.paramaribo@sdp.local',
];

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('▶ Subregios + realistische DC\'s seeden...');

    // ─── Stap 1: subregios ──────────────────────────────────────────
    let aantalSub = 0;
    for (const s of SUBREGIOS) {
      const d = await prisma.district.findUnique({ where: { code: s.districtCode } });
      if (!d) throw new Error(`District ${s.districtCode} niet gevonden — run 'pnpm db:seed' eerst`);

      await prisma.subregio.upsert({
        where: { code: s.code },
        update: { naam: s.naam, districtId: d.id },
        create: { code: s.code, naam: s.naam, districtId: d.id },
      });
      aantalSub++;
    }
    console.log(`  ✓ ${aantalSub} subregios geüpsert`);

    // ─── Stap 2: oude generieke DC's deactiveren ────────────────────
    // Niet hard verwijderen — ze hebben demo-data aangemaakt (project
    // updates, audit-entries) die we als historie willen behouden.
    // INGETROKKEN voorkomt nieuwe logins.
    let aantalGedeactiveerd = 0;
    for (const email of OUDE_GENERIEKE_DCS) {
      const u = await prisma.gebruiker.findUnique({ where: { email } });
      if (u && u.status !== 'INGETROKKEN') {
        await prisma.gebruiker.update({
          where: { id: u.id },
          data: { status: 'INGETROKKEN' },
        });
        aantalGedeactiveerd++;
        console.log(`  · Gedeactiveerd (kan niet meer inloggen): ${email}`);
      }
    }
    if (aantalGedeactiveerd === 0) {
      console.log('  · Geen oude generieke DC\'s om te deactiveren');
    }

    // ─── Stap 3: realistische DC's upserten ─────────────────────────
    const hash = await argon2.hash(DEMO_WACHTWOORD, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });
    const rolDc = await prisma.rol.findUnique({ where: { code: 'dc' } });
    if (!rolDc) throw new Error('Rol "dc" niet gevonden — run pnpm db:seed eerst');

    let aantalDc = 0;
    for (const dc of DCS) {
      const district = await prisma.district.findUnique({ where: { code: dc.districtCode } });
      if (!district) throw new Error(`District ${dc.districtCode} niet gevonden`);

      let subregioId: number | undefined;
      if (dc.subregioCode) {
        const sr = await prisma.subregio.findUnique({ where: { code: dc.subregioCode } });
        if (!sr) throw new Error(`Subregio ${dc.subregioCode} niet gevonden`);
        subregioId = sr.id;
      }

      const gebruiker = await prisma.gebruiker.upsert({
        where: { email: dc.email },
        update: {
          naam: dc.naam,
          wachtwoordHash: hash,
          emailGeverifieerd: true,
          status: 'ACTIEF',
        },
        create: {
          email: dc.email,
          naam: dc.naam,
          wachtwoordHash: hash,
          authProvider: 'EMAIL_PASSWORD' as AuthProvider,
          emailGeverifieerd: true,
          status: 'ACTIEF',
        },
      });

      // DC-rol koppelen (idempotent via findFirst-then-create).
      const bestaande = await prisma.gebruikerRol.findFirst({
        where: {
          gebruikerId: gebruiker.id,
          rolId: rolDc.id,
          districtId: district.id,
          OR: [{ geldigTot: null }, { geldigTot: { gt: new Date() } }],
        },
      });

      if (!bestaande) {
        await prisma.gebruikerRol.create({
          data: {
            gebruikerId: gebruiker.id,
            rolId: rolDc.id,
            districtId: district.id,
            subregioId,
          },
        });
      } else if (bestaande.subregioId !== (subregioId ?? null)) {
        // Update subregio op bestaande rol indien gewijzigd.
        await prisma.gebruikerRol.update({
          where: { id: bestaande.id },
          data: { subregioId: subregioId ?? null },
        });
      }

      const label = subregioId
        ? `${dc.naam} (${district.code}-${dc.subregioCode?.split('-')[1]})`
        : `${dc.naam} (${district.code})`;
      console.log(`  ✓ ${dc.email.padEnd(34)} — ${label}`);
      aantalDc++;
    }

    // ─── Stap 4: bestaande demo-data taggen met subregioId ──────────
    // Voor elk district met subregios: verdeel bestaande items rond-om
    // (deterministisch: item.id modulo aantal subregios). Idempotent —
    // override telkens, want subregios kunnen verschuiven.
    const districtenMetSubregios = await prisma.district.findMany({
      include: { subregios: { orderBy: { id: 'asc' } } },
      where: { subregios: { some: {} } },
    });

    let aantalGetagd = 0;
    for (const d of districtenMetSubregios) {
      const subIds = d.subregios.map((s) => s.id);
      if (subIds.length === 0) continue;

      // Helper: id-modulo verdeling.
      const pickSubregio = (itemId: number) => subIds[itemId % subIds.length];

      // Meldingen
      const meldingen = await prisma.melding.findMany({
        where: { districtId: d.id },
        select: { id: true },
      });
      for (const m of meldingen) {
        await prisma.melding.update({
          where: { id: m.id },
          data: { subregioId: pickSubregio(m.id) },
        });
        aantalGetagd++;
      }

      // Vergunningen
      const verg = await prisma.vergunning.findMany({
        where: { districtId: d.id },
        select: { id: true },
      });
      for (const v of verg) {
        await prisma.vergunning.update({
          where: { id: v.id },
          data: { subregioId: pickSubregio(v.id) },
        });
        aantalGetagd++;
      }

      // Projecten
      const proj = await prisma.project.findMany({
        where: { districtId: d.id },
        select: { id: true },
      });
      for (const p of proj) {
        await prisma.project.update({
          where: { id: p.id },
          data: { subregioId: pickSubregio(p.id) },
        });
        aantalGetagd++;
      }
    }
    console.log(`  ✓ ${aantalGetagd} bestaande items (meldingen/vergunningen/projecten) getagd met subregio`);

    console.log('');
    console.log(`✓ Klaar: ${aantalSub} subregios + ${aantalDc} DC's. Wachtwoord: ${DEMO_WACHTWOORD}`);
    console.log('');
    console.log('Probeer:');
    console.log(`  ernesto.muller@sdp.sr        — DC Wanica Zuid-Oost`);
    console.log(`  josafat.kanape@sdp.sr        — DC Sipaliwini Tapanahony`);
    console.log(`  mohamed.bakas@sdp.sr         — DC Nickerie (geen subregio)`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
