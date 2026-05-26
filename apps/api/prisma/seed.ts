/**
 * SDP seed — vult bestuurlijke structuur, standaardrollen, permissies en
 * basis-categorieën. Idempotent: kan meerdere keren gerund worden.
 *
 * BRONNEN te verifiëren door beheer:
 *  - Decreet Districtenindeling 1983 (S.B. 1983 No. 24) + C-67A (S.B. 1985 No. 17)
 *  - Decreet Ressortenindeling S.B. 1987 No. 67
 *  - Wet Regionale Organen S.B. 1989 No. 44 (gewijzigd S.B. 2005 No. 28)
 *
 * Ressortnamen hieronder zijn de best-beschikbare op basis van openbare
 * bronnen en moeten worden gevalideerd tegen de officiële tekst van
 * S.B. 1987 No. 67. Verifieer vóór productie!
 */
import { PrismaClient, RolScope, CategorieType } from '@prisma/client';

const prisma = new PrismaClient();

// ─── Districten ───────────────────────────────────────────────────────
const DISTRICTEN: Array<{ code: string; naam: string; hoofdstad: string }> = [
  { code: 'PAR', naam: 'Paramaribo', hoofdstad: 'Paramaribo' },
  { code: 'WAN', naam: 'Wanica', hoofdstad: 'Lelydorp' },
  { code: 'NIC', naam: 'Nickerie', hoofdstad: 'Nieuw Nickerie' },
  { code: 'COR', naam: 'Coronie', hoofdstad: 'Totness' },
  { code: 'SAR', naam: 'Saramacca', hoofdstad: 'Groningen' },
  { code: 'COM', naam: 'Commewijne', hoofdstad: 'Nieuw Amsterdam' },
  { code: 'MAR', naam: 'Marowijne', hoofdstad: 'Albina' },
  { code: 'PAA', naam: 'Para', hoofdstad: 'Onverwacht' },
  { code: 'BRO', naam: 'Brokopondo', hoofdstad: 'Brokopondo' },
  { code: 'SIP', naam: 'Sipaliwini', hoofdstad: 'Paramaribo (admin)' },
];

// ─── Ressorten ────────────────────────────────────────────────────────
// VERIFICATIE NODIG tegen S.B. 1987 No. 67. Onderstaande zijn werknamen.
const RESSORTEN: Array<{ district: string; naam: string }> = [
  // Paramaribo (12)
  { district: 'PAR', naam: 'Beekhuizen' },
  { district: 'PAR', naam: 'Blauwgrond' },
  { district: 'PAR', naam: 'Centrum' },
  { district: 'PAR', naam: 'Flora' },
  { district: 'PAR', naam: 'Latour' },
  { district: 'PAR', naam: 'Livorno' },
  { district: 'PAR', naam: 'Munder' },
  { district: 'PAR', naam: 'Pontbuiten' },
  { district: 'PAR', naam: 'Rainville' },
  { district: 'PAR', naam: 'Tammenga' },
  { district: 'PAR', naam: 'Welgelegen' },
  { district: 'PAR', naam: 'Weg naar Zee' },

  // Wanica (7)
  { district: 'WAN', naam: 'De Nieuwe Grond' },
  { district: 'WAN', naam: 'Domburg' },
  { district: 'WAN', naam: 'Houttuin' },
  { district: 'WAN', naam: 'Koewarasan' },
  { district: 'WAN', naam: 'Kwatta' },
  { district: 'WAN', naam: 'Lelydorp' },
  { district: 'WAN', naam: 'Saramaccapolder' },

  // Nickerie (6)
  { district: 'NIC', naam: 'Groot Henar' },
  { district: 'NIC', naam: 'Henar' },
  { district: 'NIC', naam: 'Nieuw Nickerie' },
  { district: 'NIC', naam: 'Oostelijke Polders' },
  { district: 'NIC', naam: 'Westelijke Polders' },
  { district: 'NIC', naam: 'Wageningen' },

  // Coronie (3)
  { district: 'COR', naam: 'Johanna Maria' },
  { district: 'COR', naam: 'Totness' },
  { district: 'COR', naam: 'Welgelegen' },

  // Saramacca (6)
  { district: 'SAR', naam: 'Calcutta' },
  { district: 'SAR', naam: 'Groningen' },
  { district: 'SAR', naam: 'Jarikaba' },
  { district: 'SAR', naam: 'Kampong Baroe' },
  { district: 'SAR', naam: 'Tijgerkreek' },
  { district: 'SAR', naam: 'Wayamboweg' },

  // Commewijne (6)
  { district: 'COM', naam: 'Alkmaar' },
  { district: 'COM', naam: 'Bakkie' },
  { district: 'COM', naam: 'Margaretha' },
  { district: 'COM', naam: 'Meerzorg' },
  { district: 'COM', naam: 'Nieuw Amsterdam' },
  { district: 'COM', naam: 'Tamanredjo' },

  // Marowijne (6)
  { district: 'MAR', naam: 'Albina' },
  { district: 'MAR', naam: 'Galibi' },
  { district: 'MAR', naam: 'Moengo' },
  { district: 'MAR', naam: 'Moengotapoe' },
  { district: 'MAR', naam: 'Patamacca' },
  { district: 'MAR', naam: 'Wanhatti' },

  // Para (5)
  { district: 'PAA', naam: 'Bigi Poika' },
  { district: 'PAA', naam: 'Carolina' },
  { district: 'PAA', naam: 'Onverwacht' },
  { district: 'PAA', naam: 'Para Noord' },
  { district: 'PAA', naam: 'Para Zuid' },

  // Brokopondo (6)
  { district: 'BRO', naam: 'Brokopondo Centrum' },
  { district: 'BRO', naam: 'Brownsweg' },
  { district: 'BRO', naam: 'Klaaskreek' },
  { district: 'BRO', naam: 'Kwakoegron' },
  { district: 'BRO', naam: 'Marshallkreek' },
  { district: 'BRO', naam: 'Sarakreek' },

  // Sipaliwini (5 bestuursressorten — geen RR; tellen formeel niet
  // bij de 62 RR-ressorten maar bestuurlijk wel als eenheden)
  { district: 'SIP', naam: 'Boven Saramacca' },
  { district: 'SIP', naam: 'Boven Suriname' },
  { district: 'SIP', naam: 'Kabalebo' },
  { district: 'SIP', naam: 'Paramacca' },
  { district: 'SIP', naam: 'Tapanahony' },
];

// ─── Rollen ───────────────────────────────────────────────────────────
const ROLLEN: Array<{
  code: string;
  naam: string;
  scope: RolScope;
  beschrijving: string;
}> = [
  // Nationaal
  { code: 'super_admin', naam: 'Systeembeheerder', scope: RolScope.NATIONAAL, beschrijving: 'Platform-beheer (alleen technisch team)' },
  { code: 'ro_minister', naam: 'Minister RO', scope: RolScope.NATIONAAL, beschrijving: 'Leest alles, beslist niets in het systeem zelf' },
  { code: 'ro_directeur_decentralisatie', naam: 'Directeur Decentralisatie', scope: RolScope.NATIONAAL, beschrijving: 'Keurt districtsplannen en begrotingen goed' },
  { code: 'ro_beleidsmedewerker', naam: 'RO Beleidsmedewerker', scope: RolScope.NATIONAAL, beschrijving: 'Analyse, rapportages, exports' },
  { code: 'auditor', naam: 'Auditor / Toezichthouder', scope: RolScope.NATIONAAL, beschrijving: 'CLAD — read-only over alles + audit log' },

  // District
  { code: 'dc', naam: 'Districtscommissaris', scope: RolScope.DISTRICT, beschrijving: 'Eindverantwoordelijk in het district' },
  { code: 'districtssecretaris', naam: 'Districtssecretaris', scope: RolScope.DISTRICT, beschrijving: 'Dagelijks beheer, vervangt DC' },
  { code: 'vergunningmedewerker', naam: 'Vergunningmedewerker', scope: RolScope.DISTRICT, beschrijving: 'Behandelt vergunningaanvragen' },
  { code: 'projectmedewerker', naam: 'Projectmedewerker', scope: RolScope.DISTRICT, beschrijving: 'Beheert projecten, voortgangsupdates' },
  { code: 'financieel_medewerker', naam: 'Financieel medewerker', scope: RolScope.DISTRICT, beschrijving: 'Districtsfonds (Fase 2)' },
  { code: 'inspecteur', naam: 'Inspecteur', scope: RolScope.DISTRICT, beschrijving: 'Veldcontroles (mobiel)' },
  { code: 'meldingen_medewerker', naam: 'Meldingen-medewerker', scope: RolScope.DISTRICT, beschrijving: 'Verwerkt binnenkomende meldingen' },
  { code: 'dr_lid', naam: 'Lid Districtsraad (DR)', scope: RolScope.DISTRICT, beschrijving: 'Stemt op districts-besluiten' },

  // Ressort
  { code: 'ressortcoordinator', naam: 'Ressortcoördinator', scope: RolScope.RESSORT, beschrijving: 'Coördinator voor één ressort' },
  { code: 'rr_lid', naam: 'Lid Ressortraad (RR)', scope: RolScope.RESSORT, beschrijving: 'Stemt op ressort-besluiten en plannen' },
];

// ─── Permissies ───────────────────────────────────────────────────────
const PERMISSIES: Array<{ code: string; beschrijving: string }> = [
  // Meldingen
  { code: 'melding.create', beschrijving: 'Melding indienen' },
  { code: 'melding.read.eigen', beschrijving: 'Eigen melding(en) lezen' },
  { code: 'melding.read.district', beschrijving: 'Alle meldingen in eigen district lezen' },
  { code: 'melding.read.nationaal', beschrijving: 'Alle meldingen nationaal lezen' },
  { code: 'melding.behandel', beschrijving: 'Melding behandelen (status, toewijzen)' },
  { code: 'melding.sluit', beschrijving: 'Melding sluiten' },
  { code: 'melding.export', beschrijving: 'Meldingen exporteren' },
  // Vergunningen
  { code: 'vergunning.aanvraag', beschrijving: 'Vergunning aanvragen' },
  { code: 'vergunning.read.eigen', beschrijving: 'Eigen vergunningen lezen' },
  { code: 'vergunning.read.district', beschrijving: 'Vergunningen in eigen district lezen' },
  { code: 'vergunning.behandel', beschrijving: 'Vergunning behandelen' },
  { code: 'vergunning.goedkeur', beschrijving: 'Vergunning goedkeuren/afwijzen' },
  { code: 'vergunning.veldcontrole', beschrijving: 'Veldcontrole uitvoeren' },
  // Projecten
  { code: 'project.create', beschrijving: 'Project aanmaken' },
  { code: 'project.read.district', beschrijving: 'Projecten in eigen district lezen' },
  { code: 'project.update', beschrijving: 'Project bijwerken / voortgang loggen' },
  { code: 'project.goedkeur', beschrijving: 'Project goedkeuren' },
  // Plannen
  { code: 'ressortplan.create', beschrijving: 'Ressortplan opstellen' },
  { code: 'ressortplan.indienen', beschrijving: 'Ressortplan ter goedkeuring indienen' },
  { code: 'ressortplan.goedkeur_rr', beschrijving: 'Ressortplan goedkeuren namens RR' },
  { code: 'districtsplan.create', beschrijving: 'Districtsplan opstellen' },
  { code: 'districtsplan.goedkeur_dr', beschrijving: 'Districtsplan goedkeuren namens DR' },
  { code: 'districtsplan.goedkeur_ro', beschrijving: 'Districtsplan goedkeuren namens RO' },
  // Financieel
  { code: 'fonds.read', beschrijving: 'Districtsfonds inzien' },
  { code: 'fonds.boek', beschrijving: 'Uitgave boeken in districtsfonds' },
  { code: 'fonds.goedkeur', beschrijving: 'Begroting/uitgaven goedkeuren' },
  // Dashboards & rapportage
  { code: 'dashboard.district', beschrijving: 'Districts-dashboard inzien' },
  { code: 'dashboard.nationaal', beschrijving: 'Nationaal dashboard inzien' },
  { code: 'rapport.maand', beschrijving: 'Maandrapport genereren' },
  // Documenten
  { code: 'document.upload', beschrijving: 'Document uploaden' },
  { code: 'document.download', beschrijving: 'Document downloaden' },
  // Gebruikers
  { code: 'gebruiker.beheer.district', beschrijving: 'Gebruikers in eigen district beheren' },
  { code: 'gebruiker.beheer.nationaal', beschrijving: 'Gebruikers nationaal beheren' },
  // Audit
  { code: 'audit.read.district', beschrijving: 'Audit-log van eigen district lezen' },
  { code: 'audit.read.nationaal', beschrijving: 'Audit-log nationaal lezen' },
  // Config
  { code: 'config.categorieen', beschrijving: 'Categorieën beheren' },
  { code: 'config.workflow', beschrijving: 'Workflow-templates wijzigen' },
];

// ─── Rol → Permissies mapping ─────────────────────────────────────────
const ROL_PERMISSIES: Record<string, string[]> = {
  super_admin: PERMISSIES.map((p) => p.code), // alles

  ro_minister: [
    'melding.read.nationaal',
    'vergunning.read.district',
    'project.read.district',
    'dashboard.nationaal',
    'rapport.maand',
    'audit.read.nationaal',
    'districtsplan.goedkeur_ro',
    'fonds.read',
  ],

  ro_directeur_decentralisatie: [
    'melding.read.nationaal',
    'vergunning.read.district',
    'project.read.district',
    'project.create',
    'dashboard.nationaal',
    'rapport.maand',
    'audit.read.nationaal',
    'districtsplan.goedkeur_ro',
    'fonds.read',
    'fonds.goedkeur',
    'gebruiker.beheer.nationaal',
    'config.categorieen',
  ],

  ro_beleidsmedewerker: [
    'melding.read.nationaal',
    'vergunning.read.district',
    'project.read.district',
    'dashboard.nationaal',
    'rapport.maand',
    'melding.export',
  ],

  auditor: [
    'melding.read.nationaal',
    'vergunning.read.district',
    'project.read.district',
    'fonds.read',
    'audit.read.nationaal',
    'dashboard.nationaal',
    'rapport.maand',
    'melding.export',
  ],

  dc: [
    'melding.read.district',
    'melding.behandel',
    'melding.sluit',
    'melding.export',
    'vergunning.read.district',
    'vergunning.behandel',
    'vergunning.goedkeur',
    'vergunning.veldcontrole',
    'project.create',
    'project.read.district',
    'project.update',
    'project.goedkeur',
    'districtsplan.create',
    'fonds.read',
    'fonds.goedkeur',
    'dashboard.district',
    'rapport.maand',
    'document.upload',
    'document.download',
    'gebruiker.beheer.district',
    'audit.read.district',
    'config.categorieen',
  ],

  districtssecretaris: [
    'melding.read.district',
    'melding.behandel',
    'melding.sluit',
    'vergunning.read.district',
    'vergunning.behandel',
    'project.create',
    'project.read.district',
    'project.update',
    'districtsplan.create',
    'fonds.read',
    'fonds.boek',
    'dashboard.district',
    'rapport.maand',
    'document.upload',
    'document.download',
    'audit.read.district',
  ],

  vergunningmedewerker: [
    'vergunning.read.district',
    'vergunning.behandel',
    'vergunning.veldcontrole',
    'document.upload',
    'document.download',
    'dashboard.district',
  ],

  projectmedewerker: [
    'project.read.district',
    'project.update',
    'document.upload',
    'document.download',
    'dashboard.district',
  ],

  financieel_medewerker: [
    'fonds.read',
    'fonds.boek',
    'project.read.district',
    'document.upload',
    'dashboard.district',
  ],

  inspecteur: [
    'vergunning.veldcontrole',
    'melding.behandel',
    'document.upload',
  ],

  meldingen_medewerker: [
    'melding.read.district',
    'melding.behandel',
    'document.upload',
    'dashboard.district',
  ],

  dr_lid: [
    'dashboard.district',
    'project.read.district',
    'districtsplan.goedkeur_dr',
    'fonds.read',
  ],

  ressortcoordinator: [
    'melding.read.district',
    'melding.behandel',
    'project.read.district',
    'ressortplan.create',
    'ressortplan.indienen',
    'dashboard.district',
  ],

  rr_lid: [
    'project.read.district',
    'ressortplan.goedkeur_rr',
  ],
};

// ─── Categorieën ─────────────────────────────────────────────────────
// `standaardToewijzingRol` = code van Rol waaraan meldingen van dit
// type bij intake automatisch worden toegewezen (B3). Service valt bij
// geen treffer terug op meldingen_medewerker → districtssecretaris → dc.
const CATEGORIEEN_MELDING: Array<{
  code: string;
  naam: string;
  icoon?: string;
  standaardToewijzingRol?: string;
}> = [
  { code: 'MELD-WATER', naam: 'Water & drainage', icoon: 'droplet', standaardToewijzingRol: 'projectmedewerker' },
  { code: 'MELD-WEG', naam: 'Wegen & infrastructuur', icoon: 'road', standaardToewijzingRol: 'projectmedewerker' },
  { code: 'MELD-VUIL', naam: 'Vuilophaal & afval', icoon: 'trash', standaardToewijzingRol: 'meldingen_medewerker' },
  { code: 'MELD-LICHT', naam: 'Straatverlichting', icoon: 'lamp', standaardToewijzingRol: 'meldingen_medewerker' },
  { code: 'MELD-MARKT', naam: 'Markt- & standplaats', icoon: 'store', standaardToewijzingRol: 'vergunningmedewerker' },
  { code: 'MELD-VEILIG', naam: 'Veiligheid & openbare orde', icoon: 'shield', standaardToewijzingRol: 'inspecteur' },
  { code: 'MELD-GROND', naam: 'Grondmelding (registratie, geen besluit)', icoon: 'map', standaardToewijzingRol: 'districtssecretaris' },
  { code: 'MELD-DIENST', naam: 'Klacht dienstverlening', icoon: 'message', standaardToewijzingRol: 'districtssecretaris' },
  { code: 'MELD-MILIEU', naam: 'Milieu & natuur', icoon: 'leaf', standaardToewijzingRol: 'inspecteur' },
  { code: 'MELD-OVERIG', naam: 'Overig', icoon: 'circle', standaardToewijzingRol: 'meldingen_medewerker' },
];

const CATEGORIEEN_VERGUNNING: Array<{ code: string; naam: string }> = [
  { code: 'VRG-HINDER', naam: 'Hinderwetvergunning' },
  { code: 'VRG-MARKT', naam: 'Marktstand- / standplaatsvergunning' },
  { code: 'VRG-EVENEMENT', naam: 'Evenementvergunning' },
  { code: 'VRG-GELUID', naam: 'Geluidsontheffing' },
  { code: 'VRG-KAP', naam: 'Kapvergunning' },
];

const CATEGORIEEN_PROJECT: Array<{ code: string; naam: string }> = [
  { code: 'PRJ-WEG', naam: 'Wegen' },
  { code: 'PRJ-BRUG', naam: 'Bruggen' },
  { code: 'PRJ-MARKT', naam: 'Markten' },
  { code: 'PRJ-SPORT', naam: 'Sportvelden' },
  { code: 'PRJ-SCHOOL', naam: 'Scholen' },
  { code: 'PRJ-BUURT', naam: 'Buurtcentra' },
  { code: 'PRJ-WATER', naam: 'Waterafvoer / drainage' },
  { code: 'PRJ-LANDBOUW', naam: 'Landbouwprojecten' },
  { code: 'PRJ-BINNENLAND', naam: 'Binnenlandontwikkeling' },
  { code: 'PRJ-OVERIG', naam: 'Overig' },
];

async function main() {
  console.log('▶ SDP seed start');

  // PostGIS extension
  await prisma.$executeRawUnsafe(`CREATE EXTENSION IF NOT EXISTS postgis`);

  // Districten
  console.log('  ▸ Districten');
  for (const d of DISTRICTEN) {
    await prisma.district.upsert({
      where: { code: d.code },
      update: { naam: d.naam, hoofdstad: d.hoofdstad },
      create: { code: d.code, naam: d.naam, hoofdstad: d.hoofdstad },
    });
  }

  // Ressorten
  console.log('  ▸ Ressorten');
  for (const r of RESSORTEN) {
    const district = await prisma.district.findUnique({ where: { code: r.district } });
    if (!district) throw new Error(`District niet gevonden: ${r.district}`);

    const code = `${r.district}-${slug(r.naam)}`;
    await prisma.ressort.upsert({
      where: { code },
      update: { naam: r.naam, districtId: district.id },
      create: { code, naam: r.naam, districtId: district.id },
    });
  }

  // Rollen
  console.log('  ▸ Rollen');
  for (const r of ROLLEN) {
    await prisma.rol.upsert({
      where: { code: r.code },
      update: { naam: r.naam, scope: r.scope, beschrijving: r.beschrijving },
      create: r,
    });
  }

  // Permissies
  console.log('  ▸ Permissies');
  for (const p of PERMISSIES) {
    await prisma.permissie.upsert({
      where: { code: p.code },
      update: { beschrijving: p.beschrijving },
      create: p,
    });
  }

  // Rol → permissies mapping
  console.log('  ▸ Rol → permissies');
  for (const [rolCode, permCodes] of Object.entries(ROL_PERMISSIES)) {
    const rol = await prisma.rol.findUnique({ where: { code: rolCode } });
    if (!rol) continue;

    // Verwijder bestaande mapping, voeg nieuwe toe (idempotent)
    await prisma.rolPermissie.deleteMany({ where: { rolId: rol.id } });

    for (const permCode of permCodes) {
      const perm = await prisma.permissie.findUnique({ where: { code: permCode } });
      if (!perm) {
        console.warn(`    ✗ Permissie ${permCode} niet gevonden voor rol ${rolCode}`);
        continue;
      }
      await prisma.rolPermissie.create({
        data: { rolId: rol.id, permissieId: perm.id },
      });
    }
  }

  // Categorieën
  console.log('  ▸ Categorieën');
  for (const c of CATEGORIEEN_MELDING) {
    await prisma.categorie.upsert({
      where: { code: c.code },
      update: {
        naam: c.naam,
        icoon: c.icoon,
        type: CategorieType.MELDING,
        standaardToewijzingRol: c.standaardToewijzingRol,
      },
      create: { ...c, type: CategorieType.MELDING },
    });
  }
  for (const c of CATEGORIEEN_VERGUNNING) {
    await prisma.categorie.upsert({
      where: { code: c.code },
      update: { naam: c.naam, type: CategorieType.VERGUNNING },
      create: { ...c, type: CategorieType.VERGUNNING },
    });
  }
  for (const c of CATEGORIEEN_PROJECT) {
    await prisma.categorie.upsert({
      where: { code: c.code },
      update: { naam: c.naam, type: CategorieType.PROJECT },
      create: { ...c, type: CategorieType.PROJECT },
    });
  }

  // Stats
  const counts = {
    districten: await prisma.district.count(),
    ressorten: await prisma.ressort.count(),
    rollen: await prisma.rol.count(),
    permissies: await prisma.permissie.count(),
    categorieen: await prisma.categorie.count(),
  };
  console.log('✓ Seed klaar:', counts);
}

function slug(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

main()
  .catch((e) => {
    console.error('✗ Seed faalde:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
