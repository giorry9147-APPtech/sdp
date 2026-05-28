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
import {
  PrismaClient,
  RolScope,
  CategorieType,
  OrganisatieType,
  Zaakkanaal,
  InitiatorType,
  Vertrouwelijkheid,
  EigenschapType,
} from '@prisma/client';

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

  // Organisatie (externe diensten — Module P / EO3)
  { code: 'extern_indiener', naam: 'Externe indiener (dienst)', scope: RolScope.ORGANISATIE, beschrijving: 'Dient verzoeken in namens de eigen externe organisatie' },
  { code: 'extern_beheerder', naam: 'Externe beheerder (dienst)', scope: RolScope.ORGANISATIE, beschrijving: 'Beheert gebruikers + ziet alle verzoeken van de eigen organisatie' },
];

// ─── Externe organisaties (EO1) ───────────────────────────────────────
const ORGANISATIES: Array<{
  code: string;
  naam: string;
  korteNaam: string;
  type: OrganisatieType;
  domeinen: string[];
}> = [
  { code: 'GBB', naam: 'Ministerie van Grondbeleid en Bosbeheer', korteNaam: 'Grondbeleid & Bosbeheer', type: OrganisatieType.MINISTERIE, domeinen: ['domeingrond', 'houtconcessie'] },
  { code: 'SBB', naam: 'Stichting Bosbeheer en Bostoezicht', korteNaam: 'SBB', type: OrganisatieType.PARASTATAAL, domeinen: ['houtconcessie', 'bostoezicht'] },
  { code: 'TCT', naam: 'Ministerie van Transport, Communicatie en Toerisme', korteNaam: 'TCT', type: OrganisatieType.MINISTERIE, domeinen: ['transport', 'standplaats', 'toerisme'] },
  { code: 'EZ', naam: 'Ministerie van Economische Zaken, Ondernemerschap en Technologische Innovatie', korteNaam: 'Economische Zaken', type: OrganisatieType.MINISTERIE, domeinen: ['bedrijfsvergunning'] },
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
  // Externe organisaties / verzoeken (Module P — EO3)
  { code: 'verzoek.indienen', beschrijving: 'Verzoek indienen namens externe organisatie' },
  { code: 'verzoek.read.eigen_organisatie', beschrijving: 'Verzoeken van eigen organisatie lezen' },
  { code: 'verzoek.intrekken', beschrijving: 'Eigen ingediend verzoek intrekken' },
  { code: 'verzoek.read.district', beschrijving: 'Inkomende verzoeken voor eigen district lezen' },
  { code: 'verzoek.behandel', beschrijving: 'Verzoek behandelen (status, info-vraag)' },
  { code: 'verzoek.beantwoord', beschrijving: 'Verzoek beantwoorden met advies/beschikking' },
  { code: 'organisatie.beheer', beschrijving: 'Externe organisaties + hun gebruikers beheren' },
  { code: 'organisatie.gebruiker.beheer.eigen', beschrijving: 'Gebruikers van eigen organisatie beheren' },
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
    'organisatie.beheer',
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
    // Module P — inkomende verzoeken van externe diensten (EO3)
    'verzoek.read.district',
    'verzoek.behandel',
    'verzoek.beantwoord',
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
    // Module P — inkomende verzoeken (EO3)
    'verzoek.read.district',
    'verzoek.behandel',
    'verzoek.beantwoord',
  ],

  vergunningmedewerker: [
    'vergunning.read.district',
    'vergunning.behandel',
    'vergunning.veldcontrole',
    'document.upload',
    'document.download',
    'dashboard.district',
    'verzoek.read.district', // mag inkomende verzoeken inzien (EO3)
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

  // Externe diensten (Module P — EO3)
  extern_indiener: [
    'verzoek.indienen',
    'verzoek.read.eigen_organisatie',
    'verzoek.intrekken',
  ],
  extern_beheerder: [
    'verzoek.indienen',
    'verzoek.read.eigen_organisatie',
    'verzoek.intrekken',
    'organisatie.gebruiker.beheer.eigen',
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

// ─── Zaaktype-catalogus (ZF1–ZF3) ─────────────────────────────────────
// Configuratie boven code: een nieuw verzoek-/verklaring-type toevoegen =
// hier een rij + db:seed. `volgnummer` van statussen = array-index.
type ZaaktypeSeed = {
  code: string;
  naam: string;
  kanaal: Zaakkanaal;
  initiatorType: InitiatorType;
  bronOrganisatieCode?: string;
  slaWerkdagen: number;
  defaultVertrouwelijkheid?: Vertrouwelijkheid;
  wettelijkeGrondslag?: string;
  beschrijving?: string;
  volgorde?: number;
  statussen: Array<{ code: string; naam: string; isEind?: boolean }>;
  resultaten: Array<{ code: string; naam: string }>;
  eigenschappen?: Array<{
    code: string;
    label: string;
    type?: EigenschapType;
    verplicht?: boolean;
    opties?: string[];
  }>;
};

const ZAAKTYPEN: ZaaktypeSeed[] = [
  // ── G2G — overheidsdienst → DC ──────────────────────────────────
  {
    code: 'DOMEINGROND',
    naam: 'Terreinonderzoek t.b.v. grondaanvraag',
    kanaal: Zaakkanaal.G2G,
    initiatorType: InitiatorType.ORGANISATIE,
    bronOrganisatieCode: 'GBB',
    slaWerkdagen: 30,
    defaultVertrouwelijkheid: Vertrouwelijkheid.INTERN,
    wettelijkeGrondslag: 'Decreet Uitgifte Domeingrond S.B. 1982 No. 11',
    beschrijving: 'Dienst der Domeinen vraagt DC-advies bij een gronduitgifte-aanvraag.',
    volgorde: 1,
    statussen: [
      { code: 'ONTVANGEN', naam: 'Ontvangen' },
      { code: 'TOEGEWEZEN', naam: 'Toegewezen' },
      { code: 'VELDWERK', naam: 'Veldonderzoek' },
      { code: 'RAPPORT_CONCEPT', naam: 'Rapport in concept' },
      { code: 'AFGEHANDELD', naam: 'Afgehandeld', isEind: true },
    ],
    resultaten: [
      { code: 'GEEN_BEZWAAR', naam: 'Geen bezwaar' },
      { code: 'BEZWAAR', naam: 'Bezwaar' },
      { code: 'VOORWAARDELIJK', naam: 'Voorwaardelijk advies' },
    ],
    eigenschappen: [
      { code: 'LAD_nr', label: 'LAD-nummer', verplicht: true },
      { code: 'perceel_nr', label: 'Perceelnummer' },
      { code: 'beoogd_gebruik', label: 'Beoogd gebruik' },
    ],
  },
  {
    code: 'BEDRIJFSVERGUNNING',
    naam: 'Lokaal advies bedrijfs-/vestigingsvergunning',
    kanaal: Zaakkanaal.G2G,
    initiatorType: InitiatorType.ORGANISATIE,
    bronOrganisatieCode: 'EZ',
    slaWerkdagen: 21,
    wettelijkeGrondslag: 'Wet Bedrijven en Beroepen',
    beschrijving: 'EZ/KKF vraagt DC-advies (locatie-/hindertoets) bij een bedrijfsvergunning.',
    volgorde: 2,
    statussen: [
      { code: 'ONTVANGEN', naam: 'Ontvangen' },
      { code: 'LOCATIEBEZOEK', naam: 'Locatiebezoek' },
      { code: 'AFGEHANDELD', naam: 'Afgehandeld', isEind: true },
    ],
    resultaten: [
      { code: 'POSITIEF', naam: 'Positief' },
      { code: 'NEGATIEF', naam: 'Negatief' },
      { code: 'VOORWAARDEN', naam: 'Met voorwaarden' },
    ],
    eigenschappen: [
      { code: 'kkf_nummer', label: 'KKF-nummer', verplicht: true },
      { code: 'locatie', label: 'Vestigingslocatie' },
    ],
  },
  {
    code: 'HOUTCONCESSIE',
    naam: 'Advies kapvergunning / houtconcessie',
    kanaal: Zaakkanaal.G2G,
    initiatorType: InitiatorType.ORGANISATIE,
    bronOrganisatieCode: 'SBB',
    slaWerkdagen: 21,
    wettelijkeGrondslag: 'Wet Bosbeheer S.B. 1992 No. 80',
    beschrijving: 'SBB kan DC-advies vragen bij een kap-/concessie-aanvraag.',
    volgorde: 3,
    statussen: [
      { code: 'ONTVANGEN', naam: 'Ontvangen' },
      { code: 'VELDCONTROLE', naam: 'Veldcontrole' },
      { code: 'AFGEHANDELD', naam: 'Afgehandeld', isEind: true },
    ],
    resultaten: [
      { code: 'POSITIEF', naam: 'Positief' },
      { code: 'NEGATIEF', naam: 'Negatief' },
    ],
    eigenschappen: [
      { code: 'perceel_nr', label: 'Perceel / terrein' },
      { code: 'doel', label: 'Doel' },
      { code: 'trad_gezag_geraadpleegd', label: 'Traditioneel gezag geraadpleegd', type: EigenschapType.JA_NEE },
    ],
  },
  {
    code: 'BUSROUTE_STANDPLAATS',
    naam: 'Coördinatie route-/standplaatsvergunning openbaar vervoer',
    kanaal: Zaakkanaal.G2G,
    initiatorType: InitiatorType.ORGANISATIE,
    bronOrganisatieCode: 'TCT',
    slaWerkdagen: 14,
    beschrijving: 'TCT stemt af met DC over busroutes/standplaatsen (kennisgeving, geen wettelijke advies-gate).',
    volgorde: 4,
    statussen: [
      { code: 'ONTVANGEN', naam: 'Ontvangen' },
      { code: 'ONDERZOEK', naam: 'Onderzoek' },
      { code: 'AFGEHANDELD', naam: 'Afgehandeld', isEind: true },
    ],
    resultaten: [
      { code: 'GEEN_BEZWAAR', naam: 'Geen bezwaar' },
      { code: 'BEZWAAR', naam: 'Bezwaar' },
    ],
    eigenschappen: [{ code: 'traject', label: 'Traject / standplaats' }],
  },
  // ── C2G — burger → DC ───────────────────────────────────────────
  {
    code: 'VGG',
    naam: 'Verklaring van Goed Gedrag',
    kanaal: Zaakkanaal.C2G,
    initiatorType: InitiatorType.BURGER,
    slaWerkdagen: 5,
    defaultVertrouwelijkheid: Vertrouwelijkheid.VERTROUWELIJK,
    wettelijkeGrondslag:
      'Reglement Beheer der Districten G.B. 1948 No. 155 + Instructie DC\'s S.B. 1990 No. 34',
    beschrijving: 'Burger vraagt VGG aan; DC geeft af na CBB- + KPS-check.',
    volgorde: 10,
    statussen: [
      { code: 'ONTVANGEN', naam: 'Ontvangen' },
      { code: 'AUTO_VERRIJKING', naam: 'Verrijking CBB/KPS' },
      { code: 'IN_BEHANDELING', naam: 'In behandeling' },
      { code: 'ONDERTEKEND', naam: 'Ondertekend' },
      { code: 'GEREED', naam: 'Gereed', isEind: true },
    ],
    resultaten: [
      { code: 'VGG_AFGEGEVEN', naam: 'VGG afgegeven' },
      { code: 'VGG_GEWEIGERD', naam: 'VGG geweigerd' },
    ],
    eigenschappen: [
      {
        code: 'doel',
        label: 'Doel van de verklaring',
        type: EigenschapType.KEUZE,
        verplicht: true,
        opties: ['werk', 'studie', 'visum', 'verblijfsvergunning', 'overig'],
      },
    ],
  },
  {
    code: 'WOONPLAATSVERKLARING',
    naam: 'Verklaring van woonplaats',
    kanaal: Zaakkanaal.C2G,
    initiatorType: InitiatorType.BURGER,
    slaWerkdagen: 3,
    defaultVertrouwelijkheid: Vertrouwelijkheid.VERTROUWELIJK,
    beschrijving: 'Burger vraagt woonplaatsverklaring aan (CBB-bron).',
    volgorde: 11,
    statussen: [
      { code: 'ONTVANGEN', naam: 'Ontvangen' },
      { code: 'VERIFICATIE', naam: 'Verificatie' },
      { code: 'GEREED', naam: 'Gereed', isEind: true },
    ],
    resultaten: [{ code: 'AFGEGEVEN', naam: 'Afgegeven' }],
  },
  {
    code: 'VERLOREN_ID',
    naam: 'Verklaring verloren ID-kaart',
    kanaal: Zaakkanaal.C2G,
    initiatorType: InitiatorType.BURGER,
    slaWerkdagen: 1,
    defaultVertrouwelijkheid: Vertrouwelijkheid.VERTROUWELIJK,
    beschrijving: 'Burger meldt verlies ID; DC geeft verklaring (KPS-aangifte als bron).',
    volgorde: 12,
    statussen: [
      { code: 'ONTVANGEN', naam: 'Ontvangen' },
      { code: 'GEREED', naam: 'Gereed', isEind: true },
    ],
    resultaten: [{ code: 'AFGEGEVEN', naam: 'Afgegeven' }],
  },
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

  // Externe organisaties (EO1)
  console.log('  ▸ Externe organisaties');
  for (const o of ORGANISATIES) {
    await prisma.organisatie.upsert({
      where: { code: o.code },
      update: { naam: o.naam, korteNaam: o.korteNaam, type: o.type, domeinen: o.domeinen },
      create: { code: o.code, naam: o.naam, korteNaam: o.korteNaam, type: o.type, domeinen: o.domeinen },
    });
  }

  // Zaaktype-catalogus (ZF1–ZF3) — idempotent: upsert zaaktype, herzet kinderen
  console.log('  ▸ Zaaktype-catalogus');
  for (const zt of ZAAKTYPEN) {
    const data = {
      naam: zt.naam,
      kanaal: zt.kanaal,
      initiatorType: zt.initiatorType,
      bronOrganisatieCode: zt.bronOrganisatieCode ?? null,
      slaWerkdagen: zt.slaWerkdagen,
      defaultVertrouwelijkheid: zt.defaultVertrouwelijkheid ?? Vertrouwelijkheid.INTERN,
      wettelijkeGrondslag: zt.wettelijkeGrondslag ?? null,
      beschrijving: zt.beschrijving ?? null,
      volgorde: zt.volgorde ?? 0,
    };
    const zaaktype = await prisma.zaaktype.upsert({
      where: { code: zt.code },
      update: data,
      create: { code: zt.code, ...data },
    });

    // Kinderen idempotent herzetten
    await prisma.statustype.deleteMany({ where: { zaaktypeId: zaaktype.id } });
    await prisma.resultaattype.deleteMany({ where: { zaaktypeId: zaaktype.id } });
    await prisma.eigenschap.deleteMany({ where: { zaaktypeId: zaaktype.id } });

    await prisma.statustype.createMany({
      data: zt.statussen.map((s, i) => ({
        zaaktypeId: zaaktype.id,
        code: s.code,
        naam: s.naam,
        volgnummer: i + 1,
        isEind: s.isEind ?? false,
      })),
    });
    await prisma.resultaattype.createMany({
      data: zt.resultaten.map((r) => ({ zaaktypeId: zaaktype.id, code: r.code, naam: r.naam })),
    });
    if (zt.eigenschappen?.length) {
      await prisma.eigenschap.createMany({
        data: zt.eigenschappen.map((e, i) => ({
          zaaktypeId: zaaktype.id,
          code: e.code,
          label: e.label,
          type: e.type ?? EigenschapType.TEKST,
          verplicht: e.verplicht ?? false,
          volgnummer: i + 1,
          opties: e.opties ?? [],
        })),
      });
    }
  }

  // Stats
  const counts = {
    districten: await prisma.district.count(),
    ressorten: await prisma.ressort.count(),
    rollen: await prisma.rol.count(),
    permissies: await prisma.permissie.count(),
    categorieen: await prisma.categorie.count(),
    organisaties: await prisma.organisatie.count(),
    zaaktypen: await prisma.zaaktype.count(),
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
