#!/usr/bin/env tsx
/**
 * SDP admin-CLI — gebruiker aanmaken met rol en scope.
 *
 * Gebruik:
 *   pnpm --filter @sdp/api admin:create \
 *     --email dc.wanica@sdp.local \
 *     --naam "Anand Sewdien" \
 *     --wachtwoord Welkom2026! \
 *     --rol dc \
 *     --district WAN
 *
 * Bij ressort-scope rol:
 *   ... --rol ressortcoordinator --district WAN --ressort WAN-LELYDORP
 *
 * Voor nationale rollen: laat --district en --ressort weg.
 *   ... --rol super_admin
 */
import { PrismaClient, type RolScope } from '@prisma/client';
import * as argon2 from 'argon2';

type Args = {
  email: string;
  naam: string;
  wachtwoord: string;
  rol: string;
  district?: string;
  ressort?: string;
  telefoon?: string;
};

function parseArgs(argv: string[]): Args {
  const args: Record<string, string> = {};
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a.startsWith('--')) {
      const key = a.slice(2);
      const val = argv[i + 1];
      if (!val || val.startsWith('--')) {
        throw new Error(`Missende waarde voor --${key}`);
      }
      args[key] = val;
      i++;
    }
  }
  for (const verplicht of ['email', 'naam', 'wachtwoord', 'rol'] as const) {
    if (!args[verplicht]) {
      throw new Error(`--${verplicht} is verplicht`);
    }
  }
  return args as unknown as Args;
}

function help(): never {
  console.log(`
SDP admin:create — gebruiker aanmaken

Verplicht:
  --email <addr>           e-mailadres (uniek)
  --naam <naam>            volledige naam
  --wachtwoord <pw>        wachtwoord (min 8 tekens)
  --rol <code>             bv. super_admin, dc, districtssecretaris,
                           ressortcoordinator, vergunningmedewerker, etc.

Optioneel:
  --district <code>        district-code (bv. WAN); verplicht voor DISTRICT/RESSORT rollen
  --ressort <code>         ressort-code (bv. WAN-LELYDORP); voor RESSORT rollen
  --telefoon <nr>          telefoonnummer

Voorbeelden:
  admin:create --email super@sdp.local --naam "Beheerder" --wachtwoord Welkom2026! --rol super_admin
  admin:create --email dc.wanica@sdp.local --naam "DC Wanica" --wachtwoord Welkom2026! --rol dc --district WAN
  admin:create --email rc.lelydorp@sdp.local --naam "RC Lelydorp" --wachtwoord Welkom2026! --rol ressortcoordinator --district WAN --ressort WAN-LELYDORP
`);
  process.exit(0);
}

async function main() {
  const argv = process.argv.slice(2);
  if (argv.length === 0 || argv.includes('--help') || argv.includes('-h')) {
    help();
  }

  const args = parseArgs(argv);

  if (args.wachtwoord.length < 8) {
    throw new Error('Wachtwoord moet minimaal 8 tekens zijn');
  }

  const prisma = new PrismaClient();
  try {
    // Rol ophalen
    const rol = await prisma.rol.findUnique({ where: { code: args.rol } });
    if (!rol) {
      const beschikbaar = await prisma.rol.findMany({
        select: { code: true, naam: true, scope: true },
        orderBy: { code: 'asc' },
      });
      console.error(`✗ Rol "${args.rol}" bestaat niet. Beschikbaar:`);
      for (const r of beschikbaar) {
        console.error(`    ${r.code.padEnd(28)} (${r.scope})  — ${r.naam}`);
      }
      process.exit(1);
    }

    // Scope-validatie
    let districtId: number | undefined;
    let ressortId: number | undefined;

    if (rol.scope === 'DISTRICT' || rol.scope === 'RESSORT') {
      if (!args.district) {
        throw new Error(`Rol "${rol.code}" vereist --district`);
      }
      const district = await prisma.district.findUnique({
        where: { code: args.district.toUpperCase() },
      });
      if (!district) throw new Error(`District ${args.district} bestaat niet`);
      districtId = district.id;
    }

    if (rol.scope === 'RESSORT') {
      if (!args.ressort) {
        throw new Error(`Rol "${rol.code}" vereist --ressort`);
      }
      const ressort = await prisma.ressort.findFirst({
        where: { code: { equals: args.ressort, mode: 'insensitive' } },
      });
      if (!ressort) throw new Error(`Ressort ${args.ressort} bestaat niet`);
      if (ressort.districtId !== districtId) {
        throw new Error(
          `Ressort ${args.ressort} hoort niet bij district ${args.district}`,
        );
      }
      ressortId = ressort.id;
    }

    // Wachtwoord hashen
    const hash = await argon2.hash(args.wachtwoord, {
      type: argon2.argon2id,
      memoryCost: 65536,
      timeCost: 3,
      parallelism: 4,
    });

    // Gebruiker aanmaken of updaten
    const email = args.email.toLowerCase();
    const gebruiker = await prisma.gebruiker.upsert({
      where: { email },
      update: {
        naam: args.naam,
        wachtwoordHash: hash,
        telefoon: args.telefoon,
        emailGeverifieerd: true,
        status: 'ACTIEF',
      },
      create: {
        email,
        naam: args.naam,
        wachtwoordHash: hash,
        telefoon: args.telefoon,
        authProvider: 'EMAIL_PASSWORD',
        emailGeverifieerd: true,
        status: 'ACTIEF',
      },
    });

    // Rol toewijzen (idempotent: voorkom dubbele actieve toewijzing)
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

    console.log('✓ Gebruiker klaar:');
    console.log(`  Email      : ${gebruiker.email}`);
    console.log(`  Naam       : ${gebruiker.naam}`);
    console.log(`  ID         : ${gebruiker.id}`);
    console.log(`  Rol        : ${rol.code} (${rol.scope})`);
    if (districtId) console.log(`  District   : ${args.district}`);
    if (ressortId) console.log(`  Ressort    : ${args.ressort}`);
  } catch (e) {
    console.error('✗ Fout:', e instanceof Error ? e.message : e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

void main();
