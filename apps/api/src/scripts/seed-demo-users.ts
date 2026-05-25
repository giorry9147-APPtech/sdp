#!/usr/bin/env tsx
/**
 * Demo-gebruikers — voor lokale ontwikkeling en demo's.
 * Idempotent: kan meerdere keren gerund worden.
 *
 * NIET gebruiken in productie!
 *
 * Gebruik: pnpm --filter @sdp/api admin:seed-demo
 */
import { PrismaClient, type AuthProvider } from '@prisma/client';
import * as argon2 from 'argon2';

const DEMO_WACHTWOORD = 'Welkom2026!';

type DemoUser = {
  email: string;
  naam: string;
  telefoon?: string;
  rollen: Array<{
    rolCode: string;
    districtCode?: string;
    ressortCode?: string;
  }>;
};

const USERS: DemoUser[] = [
  {
    email: 'super@sdp.local',
    naam: 'Beheerder (super_admin)',
    rollen: [{ rolCode: 'super_admin' }],
  },
  {
    email: 'minister@ro.sr',
    naam: 'Minister Regionale Ontwikkeling',
    rollen: [{ rolCode: 'ro_minister' }],
  },
  {
    email: 'directeur@ro.sr',
    naam: 'Directeur Decentralisatie',
    rollen: [{ rolCode: 'ro_directeur_decentralisatie' }],
  },
  {
    email: 'dc.wanica@sdp.local',
    naam: 'DC Wanica',
    rollen: [{ rolCode: 'dc', districtCode: 'WAN' }],
  },
  {
    email: 'dc.paramaribo@sdp.local',
    naam: 'DC Paramaribo',
    rollen: [{ rolCode: 'dc', districtCode: 'PAR' }],
  },
  {
    email: 'secretaris.wanica@sdp.local',
    naam: 'Districtssecretaris Wanica',
    rollen: [{ rolCode: 'districtssecretaris', districtCode: 'WAN' }],
  },
  {
    email: 'vergunningen.wanica@sdp.local',
    naam: 'Vergunningmedewerker Wanica',
    rollen: [{ rolCode: 'vergunningmedewerker', districtCode: 'WAN' }],
  },
  {
    email: 'meldingen.wanica@sdp.local',
    naam: 'Meldingen-medewerker Wanica',
    rollen: [{ rolCode: 'meldingen_medewerker', districtCode: 'WAN' }],
  },
  {
    email: 'rc.lelydorp@sdp.local',
    naam: 'Ressortcoördinator Lelydorp',
    rollen: [
      { rolCode: 'ressortcoordinator', districtCode: 'WAN', ressortCode: 'WAN-lelydorp' },
    ],
  },
  {
    email: 'rrlid.lelydorp@sdp.local',
    naam: 'RR-lid Lelydorp',
    rollen: [
      { rolCode: 'rr_lid', districtCode: 'WAN', ressortCode: 'WAN-lelydorp' },
    ],
  },
  {
    email: 'drlid.wanica@sdp.local',
    naam: 'DR-lid Wanica',
    rollen: [{ rolCode: 'dr_lid', districtCode: 'WAN' }],
  },
  {
    email: 'auditor@clad.sr',
    naam: 'CLAD Auditor',
    rollen: [{ rolCode: 'auditor' }],
  },
];

async function main() {
  const prisma = new PrismaClient();
  try {
    console.log('▶ Demo-gebruikers seeden...');
    const hash = await argon2.hash(DEMO_WACHTWOORD, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    for (const u of USERS) {
      const gebruiker = await prisma.gebruiker.upsert({
        where: { email: u.email },
        update: {
          naam: u.naam,
          wachtwoordHash: hash,
          telefoon: u.telefoon,
          emailGeverifieerd: true,
          status: 'ACTIEF',
        },
        create: {
          email: u.email,
          naam: u.naam,
          wachtwoordHash: hash,
          telefoon: u.telefoon,
          authProvider: 'EMAIL_PASSWORD' as AuthProvider,
          emailGeverifieerd: true,
          status: 'ACTIEF',
        },
      });

      for (const rolToewijzing of u.rollen) {
        const rol = await prisma.rol.findUnique({
          where: { code: rolToewijzing.rolCode },
        });
        if (!rol) {
          console.warn(`  ✗ Rol ${rolToewijzing.rolCode} niet gevonden — sla over`);
          continue;
        }

        let districtId: number | undefined;
        let ressortId: number | undefined;

        if (rolToewijzing.districtCode) {
          const d = await prisma.district.findUnique({
            where: { code: rolToewijzing.districtCode },
          });
          if (!d) throw new Error(`District ${rolToewijzing.districtCode} niet gevonden`);
          districtId = d.id;
        }

        if (rolToewijzing.ressortCode) {
          // Case-insensitive zodat 'WAN-LELYDORP' en 'WAN-lelydorp' beide werken
          const r = await prisma.ressort.findFirst({
            where: { code: { equals: rolToewijzing.ressortCode, mode: 'insensitive' } },
          });
          if (!r) throw new Error(`Ressort ${rolToewijzing.ressortCode} niet gevonden`);
          ressortId = r.id;
        }

        const bestaande = await prisma.gebruikerRol.findFirst({
          where: {
            gebruikerId: gebruiker.id,
            rolId: rol.id,
            districtId: districtId ?? null,
            ressortId: ressortId ?? null,
            OR: [{ geldigTot: null }, { geldigTot: { gt: new Date() } }],
          },
        });

        if (!bestaande) {
          await prisma.gebruikerRol.create({
            data: {
              gebruikerId: gebruiker.id,
              rolId: rol.id,
              districtId,
              ressortId,
            },
          });
        }
      }

      console.log(`  ✓ ${u.email.padEnd(35)} ${u.rollen.map((r) => r.rolCode).join(', ')}`);
    }

    console.log('');
    console.log('✓ Demo-gebruikers klaar. Wachtwoord voor allen:');
    console.log(`  ${DEMO_WACHTWOORD}`);
    console.log('');
    console.log('Probeer:');
    console.log('  dc.wanica@sdp.local                — DC dashboard Wanica');
    console.log('  rc.lelydorp@sdp.local              — ressortplan opstellen');
    console.log('  super@sdp.local                    — alles');
  } finally {
    await prisma.$disconnect();
  }
}

void main().catch((e) => {
  console.error('✗ Seed faalde:', e);
  process.exit(1);
});
