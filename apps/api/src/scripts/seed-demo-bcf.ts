#!/usr/bin/env tsx
/**
 * Demo-seeder voor de B (Burger Meldpunt), C (DC-dashboard) en F
 * (Projectmonitoring) features uit de Fase-1 backlog.
 *
 * Doel: een DC die voor het eerst op het dashboard komt ziet meteen
 * concrete voorbeelden van élke feature die we toegevoegd hebben.
 *
 * Gebruik:
 *   pnpm --filter @sdp/api exec tsx src/scripts/seed-demo-bcf.ts
 *
 * Idempotent: prefixt alle demo-data met `[DEMO-BCF]` zodat herhaalde
 * runs eerst oude entries opruimen en daarna verse demo's plaatsen.
 *
 * Wat dit script aanmaakt (alles in district Wanica):
 *  - B1: melding met 3 foto-bijlages (via MinIO presigned PUT)
 *  - B3: 4 meldingen die elk een andere auto-toewijzing demonstreren
 *  - B4: melding in OPGELOST + magic-link, melding in BEVESTIGD_DOOR_BURGER
 *  - B5: melding die door burger heropend is
 *  - C1: ~40 extra meldingen verspreid over 90 dagen voor trendgrafiek
 *  - C4: 3 DC-dagnotities
 *  - F1+F2: 1 project met volledige contractor + 3 risicos in alle statussen
 */
import {
  MeldingStatus,
  Prisma,
  PrismaClient,
  ProjectStatus,
  Urgentie,
} from '@prisma/client';
import * as crypto from 'node:crypto';
import {
  S3Client,
  PutObjectCommand,
  CreateBucketCommand,
  HeadBucketCommand,
} from '@aws-sdk/client-s3';
import { customAlphabet } from 'nanoid';

const prisma = new PrismaClient();
const nano = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 8);
const nanoPrj = customAlphabet('0123456789', 5);

const DEMO_PREFIX = '[DEMO-BCF]';

// Mini-JPEG (1x1 zwart pixel) — genoeg om S3-put-flow te demonstreren
const MINI_JPEG = Buffer.from(
  'ffd8ffe000104a46494600010100000100010000ffdb004300080606070605080707070909080a0c140d0c0b0b0c1912130f141d1a1f1e1d1a1c1c20242e2720222c231c1c2837292c30313434341f27393d38323c2e333432ffc0000b080001000101011100ffc4001f0000010501010101010100000000000000000102030405060708090a0bffc4003510000201030302040305050404000001027700010203110405213106074151226171145281a191c12333152462f0c4c5d6e7e8e9e10208ffd9',
  'hex',
);

const s3 = new S3Client({
  endpoint: process.env.S3_ENDPOINT ?? 'http://localhost:9000',
  region: process.env.S3_REGION ?? 'us-east-1',
  forcePathStyle: (process.env.S3_FORCE_PATH_STYLE ?? 'true') === 'true',
  credentials: {
    accessKeyId: process.env.S3_ACCESS_KEY ?? 'minioadmin',
    secretAccessKey: process.env.S3_SECRET_KEY ?? 'minioadmin',
  },
});
const BUCKET = process.env.S3_BUCKET ?? 'sdp-uploads';

// ─── Helpers ──────────────────────────────────────────────────────

function daysAgo(d: number): Date {
  return new Date(Date.now() - d * 86_400_000);
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}
function log(emoji: string, msg: string) {
  console.log(`${emoji} ${msg}`);
}

async function zorgVoorBucket() {
  try {
    await s3.send(new HeadBucketCommand({ Bucket: BUCKET }));
  } catch {
    try {
      await s3.send(new CreateBucketCommand({ Bucket: BUCKET }));
    } catch {
      // ignored — MinIO/S3 niet bereikbaar; foto-upload-demo wordt overgeslagen
    }
  }
}

async function ticket(districtCode: string): Promise<string> {
  return `MLD-${new Date().getFullYear()}-${districtCode}-${nano()}`;
}

async function projectRef(districtCode: string): Promise<string> {
  return `PRJ-${new Date().getFullYear()}-${districtCode}-${nanoPrj()}`;
}

// ─── Demo-data opruimen ───────────────────────────────────────────

async function ruimEerderOp() {
  log('🧹', 'Opruimen eerder demo-data…');

  // Meldingen + cascading (bijlages, events) — ook S3-objecten
  const meldingen = await prisma.melding.findMany({
    where: { titel: { startsWith: DEMO_PREFIX } },
    include: { bijlages: true },
  });
  for (const m of meldingen) {
    for (const b of m.bijlages) {
      try {
        await s3.send(new (await import('@aws-sdk/client-s3')).DeleteObjectCommand({
          Bucket: BUCKET,
          Key: b.fileKey,
        }));
      } catch {
        // ignore
      }
    }
  }
  await prisma.melding.deleteMany({ where: { titel: { startsWith: DEMO_PREFIX } } });

  await prisma.dcNotitie.deleteMany({ where: { body: { startsWith: DEMO_PREFIX } } });

  // Projects: zoek op titel-prefix, cascade haalt risicos automatisch mee
  await prisma.project.deleteMany({ where: { titel: { startsWith: DEMO_PREFIX } } });
}

// ─── B-features ───────────────────────────────────────────────────

async function seedBurgerMeldpunt(districtId: number, districtCode: string) {
  console.log('\n═══ B. Burger Meldpunt ═══════════════════════════════════');

  // Beschikbare categorieën pakken
  const cats = await prisma.categorie.findMany({
    where: { type: 'MELDING', actief: true },
  });
  const byCode = (c: string) => cats.find((x) => x.code === c)!;

  // ── B1: melding met 3 foto-bijlages ────────────────────────────
  const b1Ticket = await ticket(districtCode);
  const b1 = await prisma.melding.create({
    data: {
      ticketNummer: b1Ticket,
      districtId,
      categorieId: byCode('MELD-WATER').id,
      titel: `${DEMO_PREFIX} B1 — Foto-bijlages: drainage Kwattaweg verstopt`,
      omschrijving:
        'Drainage op kruispunt Kwattaweg / Houttuinweg overstroomt na elke regenbui. ' +
        '3 foto\'s bijgevoegd ter onderbouwing — zie bijlages.',
      urgentie: 'HOOG',
      melderNaam: 'Stanley Pinas',
      melderEmail: 'demo.b1@example.com',
      melderConsent: true,
      status: 'IN_BEHANDELING',
      events: { create: { type: 'aangemaakt', payload: { via: 'demo-seeder' } } },
    },
  });
  for (let i = 1; i <= 3; i++) {
    const key = `meldingen/${b1.id}/demo-foto-${i}.jpg`;
    try {
      await s3.send(
        new PutObjectCommand({
          Bucket: BUCKET,
          Key: key,
          Body: MINI_JPEG,
          ContentType: 'image/jpeg',
        }),
      );
      await prisma.meldingBijlage.create({
        data: {
          meldingId: b1.id,
          fileKey: key,
          soort: 'foto',
          bestandsnaam: `demo-foto-${i}.jpg`,
          grootte: MINI_JPEG.length,
          mimeType: 'image/jpeg',
        },
      });
    } catch (e) {
      log('⚠️', `MinIO niet bereikbaar — foto-upload overgeslagen (${e})`);
      break;
    }
  }
  log('📷', `B1 Foto-upload: ${b1Ticket} (3 foto's in MinIO)`);

  // ── B3: één melding per categorie om auto-toewijzing te tonen ──
  const b3Scenarios = [
    {
      cat: 'MELD-WATER',
      titel: 'Wateroverlast Lelydorp-zuid',
      verwachteRol: 'projectmedewerker',
    },
    {
      cat: 'MELD-VUIL',
      titel: 'Vuilophaal overgeslagen — Domburg',
      verwachteRol: 'meldingen_medewerker',
    },
    {
      cat: 'MELD-VEILIG',
      titel: 'Onveilig kruispunt — schoolzone',
      verwachteRol: 'inspecteur',
    },
    {
      cat: 'MELD-MARKT',
      titel: 'Standplaats-verzoek nieuwe markt',
      verwachteRol: 'vergunningmedewerker',
    },
  ];

  for (const sc of b3Scenarios) {
    const cat = byCode(sc.cat);
    // Vind iemand met de rol in dit district
    const rol = await prisma.rol.findUnique({ where: { code: cat.standaardToewijzingRol ?? '' } });
    let toewijzing: { id: string; naam: string } | null = null;
    if (rol) {
      const gr = await prisma.gebruikerRol.findFirst({
        where: { rolId: rol.id, districtId, gebruiker: { status: 'ACTIEF' } },
        include: { gebruiker: { select: { id: true, naam: true } } },
      });
      toewijzing = gr?.gebruiker ?? null;
    }
    // Fallback chain als demo van categorie-zonder-medewerker
    if (!toewijzing) {
      for (const f of ['meldingen_medewerker', 'districtssecretaris', 'dc']) {
        const r = await prisma.rol.findUnique({ where: { code: f } });
        if (!r) continue;
        const gr = await prisma.gebruikerRol.findFirst({
          where: { rolId: r.id, districtId, gebruiker: { status: 'ACTIEF' } },
          include: { gebruiker: { select: { id: true, naam: true } } },
        });
        if (gr) {
          toewijzing = gr.gebruiker;
          break;
        }
      }
    }

    const t = await ticket(districtCode);
    await prisma.melding.create({
      data: {
        ticketNummer: t,
        districtId,
        categorieId: cat.id,
        titel: `${DEMO_PREFIX} B3 ${sc.cat} — ${sc.titel}`,
        omschrijving: `Demo melding voor categorie ${cat.naam}. Verwachte auto-toewijzing: rol ${sc.verwachteRol}.`,
        urgentie: 'MIDDEL',
        toegewezenAanId: toewijzing?.id,
        toegewezenOp: toewijzing ? new Date() : null,
        status: toewijzing ? 'IN_BEHANDELING' : 'NIEUW',
        events: {
          create: [
            { type: 'aangemaakt', payload: { via: 'demo-seeder' } },
            ...(toewijzing
              ? [
                  {
                    type: 'auto_toegewezen',
                    payload: {
                      aan: { id: toewijzing.id, naam: toewijzing.naam },
                      rol: cat.standaardToewijzingRol ?? null,
                      reden: `categorie.standaardToewijzingRol=${cat.standaardToewijzingRol}`,
                    } as Prisma.InputJsonValue,
                  },
                ]
              : []),
          ],
        },
      },
    });
    log(
      '🎯',
      `B3 ${sc.cat.padEnd(12)} → ${toewijzing ? toewijzing.naam : '(geen match)'} (${t})`,
    );
  }

  // ── B4: melding in OPGELOST met magic-link + reeds-bevestigde ──
  const b4Open = await prisma.melding.create({
    data: {
      ticketNummer: await ticket(districtCode),
      districtId,
      categorieId: byCode('MELD-LICHT').id,
      titel: `${DEMO_PREFIX} B4 — Wacht op burger-bevestiging: lantaarn gerepareerd`,
      omschrijving:
        'Straatlantaarn Lelydorp-centrum is door TBL vervangen. ' +
        'DC heeft status op OPGELOST gezet; magic-link gegenereerd voor melder.',
      melderNaam: 'Maria Lieuw-A-Jong',
      melderEmail: 'demo.b4@example.com',
      melderConsent: true,
      urgentie: 'MIDDEL',
      status: 'OPGELOST',
      geslotenOp: new Date(),
      events: {
        create: [
          { type: 'aangemaakt', payload: { via: 'demo-seeder' }, createdAt: daysAgo(5) },
          {
            type: 'status_gewijzigd',
            payload: { van: 'IN_BEHANDELING', naar: 'OPGELOST' } as Prisma.InputJsonValue,
            createdAt: daysAgo(0),
          },
        ],
      },
    },
  });
  // Echte magic-link
  const token = crypto.randomBytes(32).toString('base64url');
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
  await prisma.magicLink.create({
    data: {
      tokenHash,
      doel: 'melding-feedback',
      context: { meldingId: b4Open.id } as Prisma.InputJsonValue,
      verlooptOp: new Date(Date.now() + 14 * 86_400_000),
    },
  });
  log('🔗', `B4 Feedback-token klaar voor ${b4Open.ticketNummer}:`);
  log('  ', `   /status/feedback?token=${token}`);

  const b4Done = await prisma.melding.create({
    data: {
      ticketNummer: await ticket(districtCode),
      districtId,
      categorieId: byCode('MELD-VUIL').id,
      titel: `${DEMO_PREFIX} B4 — Reeds bevestigd door burger: vuilcontainer leeggemaakt`,
      omschrijving: 'Burger heeft via magic-link bevestigd dat het probleem opgelost is.',
      melderEmail: 'demo.b4-done@example.com',
      melderConsent: true,
      status: 'BEVESTIGD_DOOR_BURGER',
      burgerBevestigdOp: daysAgo(1),
      geslotenOp: daysAgo(1),
      events: {
        create: [
          { type: 'aangemaakt', payload: {}, createdAt: daysAgo(7) },
          { type: 'status_gewijzigd', payload: { naar: 'OPGELOST' } as Prisma.InputJsonValue, createdAt: daysAgo(2) },
          {
            type: 'burger_bevestigd',
            payload: { oordeel: 'BEVESTIGD', opmerking: 'Bedankt, alles werkt weer.' } as Prisma.InputJsonValue,
            createdAt: daysAgo(1),
          },
        ],
      },
    },
  });
  log('✅', `B4 Bevestigd-door-burger: ${b4Done.ticketNummer}`);

  // ── B5: melding heropend door burger ───────────────────────────
  const b5 = await prisma.melding.create({
    data: {
      ticketNummer: await ticket(districtCode),
      districtId,
      categorieId: byCode('MELD-WATER').id,
      titel: `${DEMO_PREFIX} B5 — Heropend door burger: drainage opnieuw verstopt`,
      omschrijving:
        'Probleem was opgelost (drainage doorgespoten) maar 2 weken later ' +
        'opnieuw verstopt. Burger heeft via /status pagina heropend.',
      urgentie: 'HOOG',
      melderNaam: 'Robby Sastrohardjo',
      melderEmail: 'demo.b5@example.com',
      melderConsent: true,
      status: 'HEROPEND',
      burgerHeropendOp: new Date(),
      events: {
        create: [
          { type: 'aangemaakt', payload: {}, createdAt: daysAgo(20) },
          { type: 'status_gewijzigd', payload: { naar: 'OPGELOST' } as Prisma.InputJsonValue, createdAt: daysAgo(14) },
          {
            type: 'burger_heropend',
            payload: { vorigeStatus: 'OPGELOST', reden: 'Probleem terug sinds afgelopen weekend' } as Prisma.InputJsonValue,
            createdAt: new Date(),
          },
        ],
      },
    },
  });
  log('🔄', `B5 Heropend: ${b5.ticketNummer}`);
}

// ─── C-features ───────────────────────────────────────────────────

async function seedDashboardData(districtId: number, districtCode: string) {
  console.log('\n═══ C. DC-dashboard ═════════════════════════════════════');

  const cats = await prisma.categorie.findMany({ where: { type: 'MELDING' } });
  const dcWanica = await prisma.gebruiker.findFirst({
    where: { naam: { contains: 'DC Wanica' } },
  });
  const ressorten = await prisma.ressort.findMany({ where: { districtId } });

  // C1 + C2 + C5 + C6 — spread van ~40 meldingen over 90 dagen
  log('📊', 'C1 Trend-data: 40 meldingen over 90 dagen plaatsen…');
  let geplaatst = 0;
  const verdelingPerCat = ['MELD-WATER', 'MELD-WEG', 'MELD-WATER', 'MELD-VUIL', 'MELD-LICHT', 'MELD-WEG', 'MELD-WATER'];
  for (let i = 0; i < 40; i++) {
    const dagen = Math.floor(Math.random() * 90);
    const catCode = pick(verdelingPerCat);
    const cat = cats.find((c) => c.code === catCode);
    if (!cat) continue;
    const ressort = Math.random() < 0.7 ? pick(ressorten) : null;
    const status: MeldingStatus = pick([
      'NIEUW',
      'IN_BEHANDELING',
      'IN_BEHANDELING',
      'OPGELOST',
      'GESLOTEN',
      'BEVESTIGD_DOOR_BURGER',
    ]);
    const urgentie: Urgentie = pick(['LAAG', 'MIDDEL', 'MIDDEL', 'HOOG', 'CRISIS']);
    await prisma.melding.create({
      data: {
        ticketNummer: await ticket(districtCode),
        districtId,
        ressortId: ressort?.id,
        categorieId: cat.id,
        titel: `${DEMO_PREFIX} C1 spread #${i + 1} — ${cat.naam.toLowerCase()}`,
        omschrijving: `Demo-melding voor trendgrafiek. Dag -${dagen}.`,
        urgentie,
        status,
        createdAt: daysAgo(dagen),
        geslotenOp: ['OPGELOST', 'GESLOTEN', 'BEVESTIGD_DOOR_BURGER'].includes(status)
          ? daysAgo(Math.max(0, dagen - 2))
          : null,
        events: {
          create: { type: 'aangemaakt', payload: {}, createdAt: daysAgo(dagen) },
        },
      },
    });
    geplaatst++;
  }
  log('📈', `   → ${geplaatst} meldingen voor trend (laatste 90d)`);

  // C3 — Mijn taken: items toewijzen aan DC Wanica
  if (dcWanica) {
    const t1 = await prisma.melding.create({
      data: {
        ticketNummer: await ticket(districtCode),
        districtId,
        categorieId: cats.find((c) => c.code === 'MELD-VEILIG')!.id,
        titel: `${DEMO_PREFIX} C3 — Toegewezen aan DC: brandveilig kruispunt`,
        omschrijving: 'Crisis-melding toegewezen aan DC. Verschijnt in "Mijn taken" sectie.',
        urgentie: 'CRISIS',
        status: 'IN_BEHANDELING',
        toegewezenAanId: dcWanica.id,
        toegewezenOp: new Date(),
        events: { create: { type: 'aangemaakt', payload: {} } },
      },
    });
    log('👤', `C3 Mijn-taken: melding ${t1.ticketNummer} toegewezen aan ${dcWanica.naam}`);
  }

  // C4 — DC-dagnotities
  if (dcWanica) {
    const notities = [
      'Vandaag overleg met RR Lelydorp over drainage-prioriteiten 2027. Afspraak: bezoek aan locatie volgende week dinsdag.',
      'Wegenaanleg Domburg loopt 3 weken vertraging op door materiaaltekort. Contractor zoekt alternatieve leverancier.',
      'Ontvangst werkbezoek ministerie ROS. Toegelicht: 3 prio-projecten + ressortplan 2027-input.',
    ];
    for (const body of notities) {
      await prisma.dcNotitie.create({
        data: {
          districtId,
          actorId: dcWanica.id,
          body: `${DEMO_PREFIX} ${body}`,
        },
      });
    }
    log('📝', `C4 Dag-notities: 3 stuks geplaatst door ${dcWanica.naam}`);
  }
}

// ─── F-features ───────────────────────────────────────────────────

async function seedProjectMonitoring(districtId: number, districtCode: string) {
  console.log('\n═══ F. Projectmonitoring ═══════════════════════════════');

  const dcWanica = await prisma.gebruiker.findFirst({
    where: { naam: { contains: 'DC Wanica' } },
  });
  const projCat = await prisma.categorie.findFirst({
    where: { type: 'PROJECT', code: 'PRJ-WEG' },
  });

  const proj = await prisma.project.create({
    data: {
      referentie: await projectRef(districtCode),
      districtId,
      categorieId: projCat?.id,
      status: 'VERTRAAGD',
      titel: `${DEMO_PREFIX} F1+F2 — Renovatie Lelydorpweg Noord`,
      beschrijving:
        'Demo-project met gestructureerde contractor (F2) én 3 risico-notities ' +
        'in alle statussen (F1: open / gemitigeerd / geëscaleerd).',
      budgetIndicatief: 750_000,
      budgetWerkelijk: 312_500,
      startDatum: daysAgo(45),
      eindDatumPlan: new Date(Date.now() + 60 * 86_400_000),
      // F2 — gestructureerde contractor
      contractor: 'Wanica Wegenbouw N.V.',
      contractorKkfNummer: '12345.6',
      contractorContactpersoon: 'Marlon Pinas',
      contractorTelefoon: '+597 8123456',
      contractorEmail: 'marlon.pinas@wanicawegenbouw.sr',
    },
  });
  log('🏗️', `F2 Contractor: project ${proj.referentie} met KKF 12345.6 + contact`);

  if (dcWanica) {
    const risicos = [
      {
        titel: 'Materiaalkosten stijgen',
        beschrijving: 'Cement-prijs gestegen 18% sinds offerte. Risico op budget-overschrijding ~SRD 80k.',
        mitigatie: 'Onderhandelen met contractor over indexatie-clausule. RFP voor extra materiaalleverancier uitgezet.',
        status: 'GEMITIGEERD' as const,
      },
      {
        titel: 'Eigendomsbewijs kavel onduidelijk',
        beschrijving: 'Bij voorbereiding bleek dat MI-GLIS-eigendomsbewijs voor 200m segment ontbreekt.',
        mitigatie: 'Doorgezet naar RO + districtssecretaris voor juridische check. Werk op dat segment gepauzeerd.',
        status: 'GEESCALEERD' as const,
      },
      {
        titel: 'Regenseizoen verkort werktijd',
        beschrijving:
          'Voorspelling toont nattere periode mei-juli dan normaal. Asfalt-werk niet mogelijk bij regen.',
        mitigatie: null,
        status: 'OPEN' as const,
      },
    ];
    for (const r of risicos) {
      await prisma.projectRisico.create({
        data: {
          projectId: proj.id,
          actorId: dcWanica.id,
          ...r,
        },
      });
    }
    log('⚠️', `F1 Risicos: 3 stuks aangemaakt (OPEN / GEMITIGEERD / GEESCALEERD)`);
  }
}

// ─── Main ─────────────────────────────────────────────────────────

async function main() {
  console.log('▶ SDP demo-seeder voor B/C/F features\n');

  const district = await prisma.district.findUnique({ where: { code: 'WAN' } });
  if (!district) {
    throw new Error('District Wanica niet gevonden — run eerst `pnpm db:seed`');
  }
  log('📍', `Doel-district: ${district.naam} (id=${district.id})`);

  await zorgVoorBucket();
  await ruimEerderOp();

  await seedBurgerMeldpunt(district.id, district.code);
  await seedDashboardData(district.id, district.code);
  await seedProjectMonitoring(district.id, district.code);

  // Korte samenvatting
  const [meldCount, projCount, notitieCount, risicoCount] = await Promise.all([
    prisma.melding.count({ where: { titel: { startsWith: DEMO_PREFIX } } }),
    prisma.project.count({ where: { titel: { startsWith: DEMO_PREFIX } } }),
    prisma.dcNotitie.count({ where: { body: { startsWith: DEMO_PREFIX } } }),
    prisma.projectRisico.count({
      where: { project: { titel: { startsWith: DEMO_PREFIX } } },
    }),
  ]);

  console.log('\n═══ Samenvatting ═══════════════════════════════════════');
  console.log(`  ${meldCount.toString().padStart(3)} meldingen (B-features + C-trend)`);
  console.log(`  ${projCount.toString().padStart(3)} project (F-features)`);
  console.log(`  ${notitieCount.toString().padStart(3)} DC-notities`);
  console.log(`  ${risicoCount.toString().padStart(3)} project-risicos`);
  console.log('\n📖 Walkthrough: docs/10-demo-walkthrough.md');
  console.log('🌐 Open: http://localhost:3000/dashboard (login: dc.wanica@sdp.local / Welkom2026!)');
}

main()
  .catch((e) => {
    console.error('✗ Demo-seed faalde:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
