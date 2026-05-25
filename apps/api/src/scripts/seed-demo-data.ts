#!/usr/bin/env tsx
/**
 * Demo-data seeder — vult het platform met realistische voorbeelden.
 *
 * Gebruik:  pnpm --filter @sdp/api admin:seed-demo-data
 *
 * Bevat:
 *  - ~50 meldingen (Wanica, Paramaribo, Nickerie, Para, Commewijne)
 *  - ~20 vergunningen in alle statussen
 *  - ~12 districtsprojecten met voortgangslogboeken
 *  - 4 ressortplannen (concept + goedgekeurd) voor Wanica + Paramaribo
 *  - 2 districtsplannen (Wanica goedgekeurd, Paramaribo in behandeling)
 *  - Districtsfonds + uitgaven voor Wanica
 *
 * Idempotent: ruimt eerst eerdere demo-data op (alleen demo-data, niet
 * gebruikers of structuur). Veilig om meerdere keren te runnen.
 */
import {
  AanvragerSoort,
  MeldingStatus,
  PlanStatus,
  PrismaClient,
  ProjectStatus,
  Urgentie,
  VergunningStatus,
} from '@prisma/client';
import { customAlphabet } from 'nanoid';

const prisma = new PrismaClient();
const nanoMld = customAlphabet('123456789ABCDEFGHJKLMNPQRSTUVWXYZ', 8);
const nanoVrg = customAlphabet('0123456789', 5);
const nanoPrj = customAlphabet('0123456789', 5);

// ─── Helpers ──────────────────────────────────────────────────────
function daysAgo(d: number): Date {
  return new Date(Date.now() - d * 86_400_000);
}
function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)]!;
}
function randomInt(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

// ─── Demo-content ────────────────────────────────────────────────

const SURINAAMSE_NAMEN_BURGER = [
  'Anand Sewdien', 'Vivian Pawiroredjo', 'Glenn Tjong-A-Hung',
  'Marlène Wijngaarde', 'Steven Polanen', 'Anita Bhageloe',
  'Rajiv Tewari', 'Eline Helstone', 'Kenneth Brandon',
  'Sandra Karta', 'Roy Pawironadi', 'Lakhmi Doerga',
  'Mariska Pinas', 'Ernie Wolf', 'Soejat Gummels',
  'Maureen Ravales', 'Bianca Tjin Asjoe', 'Dewanand Persaud',
];

const SURINAAMSE_BEDRIJVEN = [
  'Bakkerij Domburg N.V.', 'Tropical Foods B.V.', 'Resort Lelydorp',
  'Marowijne Visserij', 'Wanica Bouw & Logistiek',
  'Saramacca Agrarian Coop', 'Para Houtproductie',
  'Coronie Kokosbedrijf', 'Brokopondo Mining Services',
  'Nickerie Rijst & Co', 'Commewijne Kruidenhandel',
];

// ─── Meldingen ───────────────────────────────────────────────────

type MeldingSjabloon = {
  district: string;
  ressort?: string;
  catCode: string;
  titel: string;
  omschrijving: string;
  locatie: string;
  urgentie: Urgentie;
  geom?: [number, number]; // [lon, lat]
};

const MELDING_SJABLONEN: MeldingSjabloon[] = [
  // Wanica — Lelydorp
  {
    district: 'WAN', ressort: 'WAN-lelydorp',
    catCode: 'MELD-WEG',
    titel: 'Gaten in asfalt Lelydorpweg t.h.v. nr. 121',
    omschrijving: 'Sinds 3 weken zijn er grote gaten ontstaan na de zware regenval. Bandschade gerapporteerd door minstens 5 chauffeurs. Schoolbussen rijden er dagelijks.',
    locatie: 'Lelydorpweg, ressort Lelydorp',
    urgentie: 'HOOG',
    geom: [-55.2150, 5.7100],
  },
  {
    district: 'WAN', ressort: 'WAN-lelydorp',
    catCode: 'MELD-LICHT',
    titel: '12 lichtmasten defect aan Indira Gandhiweg',
    omschrijving: 'Vanaf de kruising met de Verlengde Hogestraat tot Lelydorp Centrum staan 12 lichtmasten al 2 weken uit. Onveilige situatie na 19:00.',
    locatie: 'Indira Gandhiweg, Lelydorp',
    urgentie: 'HOOG',
    geom: [-55.2120, 5.7050],
  },
  {
    district: 'WAN', ressort: 'WAN-lelydorp',
    catCode: 'MELD-WATER',
    titel: 'Drainage marktterrein verstopt na elke regenbui',
    omschrijving: 'Het marktterrein staat na elke regenbui meer dan een uur blank. Handelaars verliezen omzet, klanten klagen. Probleem speelt al sinds maart.',
    locatie: 'Lelydorpmarkt, Lelydorp Centrum',
    urgentie: 'MIDDEL',
    geom: [-55.2180, 5.7080],
  },
  {
    district: 'WAN', ressort: 'WAN-lelydorp',
    catCode: 'MELD-VUIL',
    titel: 'Vuilophaal overgeslagen 3 weken op rij',
    omschrijving: 'Onze straat heeft op donderdag vuilophaal, maar 3 weken niet meer gezien. Ratten in de bakken. Buurtgesprek met ressortcoördinator gevraagd.',
    locatie: 'Saramaccastraat, Lelydorp',
    urgentie: 'HOOG',
    geom: [-55.2140, 5.7090],
  },
  // Wanica — Kwatta
  {
    district: 'WAN', ressort: 'WAN-kwatta',
    catCode: 'MELD-WEG',
    titel: 'Brug Kwattaweg onveilig — losgeraakt asfalt',
    omschrijving: 'Op de brug over de Kwatta-kreek zit een groot losgeraakt stuk asfalt. Voetgangers moeten omfietsen. Bus rijdt langzaam over.',
    locatie: 'Kwattaweg brug, Kwatta',
    urgentie: 'HOOG',
  },
  {
    district: 'WAN', ressort: 'WAN-kwatta',
    catCode: 'MELD-VEILIG',
    titel: 'Wateroverlast bij hoge tijd — landbouwbedrijven',
    omschrijving: 'Bij springtij komen 4 landbouwerven onder water te staan. Schade aan kassen. Drainage richting kreek werkt niet meer.',
    locatie: 'Polder Kwatta',
    urgentie: 'HOOG',
  },
  {
    district: 'WAN', ressort: 'WAN-kwatta',
    catCode: 'MELD-DIENST',
    titel: 'Klacht over wachttijd DC-loket Wanica',
    omschrijving: 'Was 3 uur kwijt voor een verzoek dat in een halfuur kon. Onderbezetting? Graag online indienen mogelijk maken (komt eraan toch?).',
    locatie: 'DC-kantoor Wanica',
    urgentie: 'LAAG',
  },
  // Wanica — Houttuin
  {
    district: 'WAN', ressort: 'WAN-houttuin',
    catCode: 'MELD-MILIEU',
    titel: 'Illegale dumping bouwafval langs Houttuinweg',
    omschrijving: 'Achter de schoolzone wordt sinds vorige maand bouwafval gedumpt. Mogelijk asbest. Kinderen spelen er.',
    locatie: 'Houttuinweg, achter SBO Houttuin',
    urgentie: 'HOOG',
  },
  {
    district: 'WAN', ressort: 'WAN-houttuin',
    catCode: 'MELD-WEG',
    titel: 'Verkeerschaos schooltijden basisschool',
    omschrijving: 'Bij brengen/halen is er chaos. Suggestie: tijdelijke verkeersregelaar of zebrapad-stoplicht.',
    locatie: 'Schoolzone Houttuin',
    urgentie: 'MIDDEL',
  },
  // Paramaribo — Centrum
  {
    district: 'PAR', ressort: 'PAR-centrum',
    catCode: 'MELD-WEG',
    titel: 'Stoep Waterkant losgekomen tegels — gevaar voor toeristen',
    omschrijving: 'Voor het oude Stadhuis liggen tegels los. Twee toeristen hebben deze week al gevallen volgens omliggende winkeliers.',
    locatie: 'Waterkant, voor oud Stadhuis',
    urgentie: 'HOOG',
    geom: [-55.1685, 5.8264],
  },
  {
    district: 'PAR', ressort: 'PAR-centrum',
    catCode: 'MELD-MARKT',
    titel: 'Marktstand-toewijzing onduidelijk centrale markt',
    omschrijving: 'Verschillende handelaars zeggen rechten op dezelfde stand te hebben. Vraag of DC-loket procedure online kan maken.',
    locatie: 'Centrale Markt Paramaribo',
    urgentie: 'MIDDEL',
  },
  {
    district: 'PAR', ressort: 'PAR-centrum',
    catCode: 'MELD-VUIL',
    titel: 'Overvolle prullenbakken Onafhankelijkheidsplein',
    omschrijving: 'Vooral in het weekend lopen de bakken over. Toeristen en kinderen klagen. Aantal bakken verdubbelen of vaker legen.',
    locatie: 'Onafhankelijkheidsplein',
    urgentie: 'MIDDEL',
  },
  // Paramaribo — Blauwgrond
  {
    district: 'PAR', ressort: 'PAR-blauwgrond',
    catCode: 'MELD-WATER',
    titel: 'Goot Vondellaan stinkt — riool overstroming',
    omschrijving: 'Goot voor onze huizen stinkt naar riool sinds vorige maand. Vermoedelijk lozingsprobleem. Werkbezoek aangevraagd via WhatsApp DC.',
    locatie: 'Vondellaan, Blauwgrond',
    urgentie: 'HOOG',
  },
  {
    district: 'PAR', ressort: 'PAR-blauwgrond',
    catCode: 'MELD-LICHT',
    titel: 'Pleintje hoek Anton de Komstraat donker',
    omschrijving: 'Bewoners voelen zich onveilig. Lamp werkt sinds 3 maanden niet meer. Eerder gemeld via telefoon, geen actie.',
    locatie: 'Plein hoek A. de Komstraat',
    urgentie: 'MIDDEL',
  },
  // Paramaribo — Flora
  {
    district: 'PAR', ressort: 'PAR-flora',
    catCode: 'MELD-WEG',
    titel: 'Verzakking Floralaan — drempel ontstaan',
    omschrijving: 'Een natuurlijke "verkeersdrempel" door verzakking. Snelle wagens missen het, springen op. Twee bumpers losgemaakt.',
    locatie: 'Floralaan, ressort Flora',
    urgentie: 'HOOG',
  },
  {
    district: 'PAR', ressort: 'PAR-flora',
    catCode: 'MELD-MILIEU',
    titel: 'Grote hoeveelheid muggen sinds bouwput',
    omschrijving: 'In de bouwput op de hoek staat al weken water. Muggenoverlast voor de hele buurt. Dengue-risico.',
    locatie: 'Hoek Florastraat / Frederik Derbystraat',
    urgentie: 'HOOG',
  },
  // Paramaribo — Latour
  {
    district: 'PAR', ressort: 'PAR-latour',
    catCode: 'MELD-VEILIG',
    titel: 'Inbraak-pieken Latour — buurtwacht-overleg gevraagd',
    omschrijving: 'In de afgelopen 2 weken 6 inbraken in onze straat. KPS is op de hoogte. Buurt wil overleg met DC + ressortcoördinator.',
    locatie: 'Latourstraten',
    urgentie: 'HOOG',
  },
  // Nickerie
  {
    district: 'NIC', ressort: 'NIC-nieuw-nickerie',
    catCode: 'MELD-WATER',
    titel: 'Dijkdoorbraak risico polder 12 — boeren vragen actie',
    omschrijving: 'Boeren signaleren scheuren in dijk. Drie keer gemeld bij ministerie OW. Vraag aan DC: lokaal opvolgen.',
    locatie: 'Polder 12, Nieuw Nickerie',
    urgentie: 'CRISIS',
  },
  {
    district: 'NIC',
    catCode: 'MELD-LICHT',
    titel: 'Verlichting markt Nickerie defect',
    omschrijving: 'Markt-overdekking-verlichting werkt 30% niet. Donker bij vroege ochtend-handel.',
    locatie: 'Markthal Nieuw Nickerie',
    urgentie: 'MIDDEL',
  },
  {
    district: 'NIC',
    catCode: 'MELD-WEG',
    titel: 'Slechte aansluiting Westelijke ringweg',
    omschrijving: 'Asfalt langs de rijstvelden afgekalfd. Trekkers en zware voertuigen hebben moeite.',
    locatie: 'Westelijke ringweg, Nickerie',
    urgentie: 'MIDDEL',
  },
  // Para
  {
    district: 'PAA', ressort: 'PAA-onverwacht',
    catCode: 'MELD-VEILIG',
    titel: 'Speeltuin Onverwacht — kapotte schommel + glas',
    omschrijving: 'In speeltuin Onverwacht ligt al weken glas. Schommel kapot, kinderen klimmen toch. Letselrisico.',
    locatie: 'Speeltuin Onverwacht Centrum',
    urgentie: 'HOOG',
  },
  {
    district: 'PAA', ressort: 'PAA-carolina',
    catCode: 'MELD-WATER',
    titel: 'Watertekort dorp Carolina — pomp defect',
    omschrijving: 'Pomp van dorpswaterput defect sinds 5 dagen. 80 huishoudens halen water uit kreek (vervuild).',
    locatie: 'Dorp Carolina',
    urgentie: 'CRISIS',
  },
  // Commewijne
  {
    district: 'COM', ressort: 'COM-meerzorg',
    catCode: 'MELD-VEILIG',
    titel: 'Onveilige situatie pont Meerzorg-Paramaribo',
    omschrijving: 'Veerpont-toegangsweg heeft losgeraakte planken. Tweemaal bijna ongelukken.',
    locatie: 'Pontaanleg Meerzorg',
    urgentie: 'HOOG',
  },
  {
    district: 'COM', ressort: 'COM-nieuw-amsterdam',
    catCode: 'MELD-WEG',
    titel: 'Brug Marowijne-richting — scheur in beton',
    omschrijving: 'Zichtbare diagonale scheur in betonnen brug-staart. Schaal en monitoring nodig door ingenieur.',
    locatie: 'Brug Commewijne',
    urgentie: 'HOOG',
  },
];

// ─── Vergunning-sjablonen ────────────────────────────────────────

type VergunningSjabloon = {
  district: string;
  catCode: string;
  titel: string;
  beschrijving: string;
  locatie: string;
  aanvragerSoort: AanvragerSoort;
  status: VergunningStatus;
  besluit?: string;
  dagen_geleden_ingediend: number;
};

const VERGUNNING_SJABLONEN: VergunningSjabloon[] = [
  {
    district: 'WAN', catCode: 'VRG-MARKT',
    titel: 'Marktstand zaterdag Lelydorp markt',
    beschrijving: 'Wekelijkse marktstand voor verkoop van vers fruit en groenten. Stand 4-2x4m, zaterdag 06:00-13:00.',
    locatie: 'Lelydorpmarkt, stand 4',
    aanvragerSoort: 'ONDERNEMING',
    status: 'GOEDGEKEURD',
    besluit: 'Goedgekeurd voor periode juni-december 2026. Standgeld te voldoen voorafgaand aan elke zaterdag.',
    dagen_geleden_ingediend: 45,
  },
  {
    district: 'WAN', catCode: 'VRG-EVENEMENT',
    titel: 'Wijkfeest Lelydorp Centrum 5 juli',
    beschrijving: 'Jaarlijks wijkfeest met live muziek, eetstandjes en kinderactiviteiten. Verwachte 400 bezoekers. Tijdelijke afsluiting Lelydorpweg-zijstraat.',
    locatie: 'Lelydorp Centrum, voor het buurtcentrum',
    aanvragerSoort: 'BURGER',
    status: 'GOEDGEKEURD',
    besluit: 'Goedgekeurd. Voorwaarden: muziek max 23:00, EHBO-post aanwezig, schoonmaak voor 09:00 maandag.',
    dagen_geleden_ingediend: 30,
  },
  {
    district: 'WAN', catCode: 'VRG-HINDER',
    titel: 'Industriële oven bakkerij',
    beschrijving: 'Nieuwe industriële oven voor productie van brood. Bedrijfstijden 04:00-14:00. Schoorsteen 8m hoog.',
    locatie: 'Domburg, Industriestraat 12',
    aanvragerSoort: 'ONDERNEMING',
    status: 'IN_BEHANDELING',
    dagen_geleden_ingediend: 12,
  },
  {
    district: 'WAN', catCode: 'VRG-GELUID',
    titel: 'Geluidsontheffing live concert resort',
    beschrijving: 'Live concert bij resort Lelydorp, vrijdag 28 juni 19:00-01:00. Geluidsmeting beschikbaar op aanvraag.',
    locatie: 'Resort Lelydorp',
    aanvragerSoort: 'ONDERNEMING',
    status: 'EXTRA_INFO_NODIG',
    dagen_geleden_ingediend: 8,
  },
  {
    district: 'WAN', catCode: 'VRG-KAP',
    titel: 'Kapvergunning 3 oude mango-bomen — erf-uitbreiding',
    beschrijving: 'Drie zeer oude mango-bomen blokkeren geplande erf-uitbreiding voor opslagloods. Geen monumentale status.',
    locatie: 'Domburg, Bomenlaan 5',
    aanvragerSoort: 'ONDERNEMING',
    status: 'AFGEWEZEN',
    besluit: 'Afgewezen. Bomen hebben aanzienlijke ecologische waarde voor de straat. Suggestie: herontwerp erf-plan met behoud van 2 van de 3 bomen.',
    dagen_geleden_ingediend: 60,
  },
  {
    district: 'WAN', catCode: 'VRG-MARKT',
    titel: 'Foodtruck-standplaats woensdagavonden',
    beschrijving: 'Wekelijkse foodtruck-standplaats op kruising. Saté & roti. Periode juli-december.',
    locatie: 'Kruising Lelydorpweg / Indira Gandhiweg',
    aanvragerSoort: 'ONDERNEMING',
    status: 'INGEDIEND',
    dagen_geleden_ingediend: 3,
  },
  {
    district: 'PAR', catCode: 'VRG-EVENEMENT',
    titel: 'Owru-yari festival Waterkant',
    beschrijving: 'Oud-en-nieuw festival Waterkant 31 december. Verwacht 8000 bezoekers. Beveiligingsplan + EHBO ingericht.',
    locatie: 'Waterkant Paramaribo',
    aanvragerSoort: 'BURGER',
    status: 'IN_BEHANDELING',
    dagen_geleden_ingediend: 20,
  },
  {
    district: 'PAR', catCode: 'VRG-HINDER',
    titel: 'Restaurant terras-uitbreiding Centrum',
    beschrijving: 'Uitbreiding van terras met 12 zitplaatsen op stoep. Doorgang voetgangers blijft 1,5m.',
    locatie: 'Heerenstraat, Centrum',
    aanvragerSoort: 'ONDERNEMING',
    status: 'GOEDGEKEURD',
    besluit: 'Goedgekeurd voor proefperiode 6 maanden. Evaluatie december 2026.',
    dagen_geleden_ingediend: 90,
  },
  {
    district: 'PAR', catCode: 'VRG-MARKT',
    titel: 'Marktstand Centrale Markt — 5 standplaatsen',
    beschrijving: 'Uitbreiding huidige vergunning met 5 extra standplaatsen voor groothandel groenten.',
    locatie: 'Centrale Markt Paramaribo',
    aanvragerSoort: 'ONDERNEMING',
    status: 'INGEDIEND',
    dagen_geleden_ingediend: 2,
  },
  {
    district: 'PAR', catCode: 'VRG-KAP',
    titel: 'Kapvergunning monumentale Kankantri — niet toegestaan',
    beschrijving: 'Aanvraag voor kap van eeuwenoude Kankantri-boom om bouwruimte te maken.',
    locatie: 'Anton de Komstraat',
    aanvragerSoort: 'BURGER',
    status: 'AFGEWEZEN',
    besluit: 'Afgewezen. Kankantri is heilig in Surinaamse cultuur, en deze boom is monumentaal. Geen kap toegestaan.',
    dagen_geleden_ingediend: 75,
  },
  {
    district: 'NIC', catCode: 'VRG-HINDER',
    titel: 'Rijstdrooginstallatie Nickerie',
    beschrijving: 'Nieuwe drooginstallatie naast bestaande loods. Stof + geluid binnen normen.',
    locatie: 'Wageningen, agrarisch terrein',
    aanvragerSoort: 'ONDERNEMING',
    status: 'GOEDGEKEURD',
    besluit: 'Goedgekeurd. Jaarlijkse hercontrole op stof-emissie.',
    dagen_geleden_ingediend: 100,
  },
  {
    district: 'NIC', catCode: 'VRG-EVENEMENT',
    titel: 'Holi-festival Nickerie',
    beschrijving: 'Jaarlijks Holi-festival, kleurpoeders, sound-systeem. Vermoedelijk 1200 deelnemers.',
    locatie: 'Stadspark Nieuw Nickerie',
    aanvragerSoort: 'BURGER',
    status: 'GOEDGEKEURD',
    besluit: 'Goedgekeurd, opruimplan akkoord.',
    dagen_geleden_ingediend: 50,
  },
  {
    district: 'COM', catCode: 'VRG-MARKT',
    titel: 'Vissersmarkt Meerzorg',
    beschrijving: 'Dagelijkse verse vis-stand bij ponttoegang. Koelkast met generator.',
    locatie: 'Pont Meerzorg',
    aanvragerSoort: 'ONDERNEMING',
    status: 'IN_BEHANDELING',
    dagen_geleden_ingediend: 18,
  },
  {
    district: 'COM', catCode: 'VRG-HINDER',
    titel: 'Suiker-rietverwerking',
    beschrijving: 'Verlenging vergunning. Productie ongewijzigd, milieu-meting bijgevoegd.',
    locatie: 'Marienburg',
    aanvragerSoort: 'ONDERNEMING',
    status: 'GOEDGEKEURD',
    besluit: 'Verlenging goedgekeurd voor 2 jaar.',
    dagen_geleden_ingediend: 120,
  },
  {
    district: 'PAA', catCode: 'VRG-KAP',
    titel: 'Kapvergunning kreupelhout speeltuin-uitbreiding',
    beschrijving: 'Uitbreiding speeltuin Onverwacht; vereist kappen van laag kreupelhout (geen bomen).',
    locatie: 'Speeltuin Onverwacht',
    aanvragerSoort: 'BURGER',
    status: 'GOEDGEKEURD',
    besluit: 'Goedgekeurd. Wel herplant gevraagd langs nieuwe grens.',
    dagen_geleden_ingediend: 25,
  },
  {
    district: 'WAN', catCode: 'VRG-EVENEMENT',
    titel: 'Buurtkermis Houttuin (ingetrokken)',
    beschrijving: 'Aanvraag is ingetrokken na omwonenden-bezwaar.',
    locatie: 'Houttuin Centrum',
    aanvragerSoort: 'BURGER',
    status: 'INGETROKKEN',
    dagen_geleden_ingediend: 35,
  },
];

// ─── Project-sjablonen ───────────────────────────────────────────

type ProjectSjabloon = {
  district: string;
  ressort?: string;
  catCode: string;
  titel: string;
  beschrijving: string;
  status: ProjectStatus;
  budgetIndicatief: number;
  budgetWerkelijk?: number;
  startDagenGeleden?: number;
  duurDagen?: number;
  contractor?: string;
  voortgang: Array<{ dagenGeleden: number; tekst: string }>;
};

const PROJECT_SJABLONEN: ProjectSjabloon[] = [
  {
    district: 'WAN', ressort: 'WAN-lelydorp',
    catCode: 'PRJ-WEG',
    titel: 'Renovatie Lelydorpweg Noord',
    beschrijving: 'Volledige asfalt-renovatie + nieuwe drainage 2,4 km. Onderdeel ressortplan Lelydorp 2026.',
    status: 'GESTART',
    budgetIndicatief: 450_000,
    budgetWerkelijk: 178_000,
    startDagenGeleden: 30,
    duurDagen: 120,
    contractor: 'Wanica Wegenbouw N.V.',
    voortgang: [
      { dagenGeleden: 30, tekst: 'Aanvang werk. Verkeer omleidingen ingericht. Bewoners genformeerd via WhatsApp-groep.' },
      { dagenGeleden: 20, tekst: 'Oude asfalt verwijderd over eerste 800m. Drainage-buizen besteld.' },
      { dagenGeleden: 10, tekst: 'Drainage-buizen geleverd, plaatsing gestart. Schoolzone heeft prioriteit.' },
      { dagenGeleden: 2, tekst: 'Eerste 600m drainage afgerond. Op schema. Asfaltering volgende week.' },
    ],
  },
  {
    district: 'WAN', ressort: 'WAN-lelydorp',
    catCode: 'PRJ-LICHT' as never, // PRJ-OVERIG of geen — kies overig
    titel: 'Straatverlichting Saramaccastraat',
    beschrijving: 'Vervanging 32 lichtmasten + LED-armaturen voor energiezuiniger gebruik.',
    status: 'BUDGET_AANGEVRAAGD',
    budgetIndicatief: 85_000,
    contractor: 'EBS Wanica',
    voortgang: [
      { dagenGeleden: 14, tekst: 'Plan ingediend bij EBS voor budgetreservering.' },
      { dagenGeleden: 7, tekst: 'EBS akkoord met principe; wacht op finale offerte.' },
    ],
  },
  {
    district: 'WAN', ressort: 'WAN-kwatta',
    catCode: 'PRJ-BRUG',
    titel: 'Brug-reparatie Kwatta-kreek',
    beschrijving: 'Reparatie loslatend asfalt + structurele inspectie van de brug.',
    status: 'AFGEROND',
    budgetIndicatief: 65_000,
    budgetWerkelijk: 62_500,
    startDagenGeleden: 90,
    duurDagen: 45,
    contractor: 'Bouwbedrijf Marowijne',
    voortgang: [
      { dagenGeleden: 90, tekst: 'Start. Verkeer 1-richting ingericht.' },
      { dagenGeleden: 60, tekst: 'Asfalt vervangen, structuur ingespect — gezond.' },
      { dagenGeleden: 45, tekst: 'Project afgerond, opgeleverd aan DC.' },
    ],
  },
  {
    district: 'WAN', ressort: 'WAN-houttuin',
    catCode: 'PRJ-SCHOOL',
    titel: 'Renovatie sanitair SBO Houttuin',
    beschrijving: 'Volledige renovatie toiletten basisschool, inclusief watertank.',
    status: 'GESTART',
    budgetIndicatief: 120_000,
    budgetWerkelijk: 45_000,
    startDagenGeleden: 21,
    duurDagen: 60,
    contractor: 'Schoolbouw Wanica',
    voortgang: [
      { dagenGeleden: 21, tekst: 'Start tijdens schoolvakantie. Sloop oude installatie afgerond.' },
      { dagenGeleden: 10, tekst: 'Nieuwe sanitair geleverd. Watertank wordt deze week geplaatst.' },
    ],
  },
  {
    district: 'PAR', ressort: 'PAR-centrum',
    catCode: 'PRJ-MARKT',
    titel: 'Modernisering Centrale Markt',
    beschrijving: 'Renovatie marktdaken, betere drainage, nieuwe elektrische installatie.',
    status: 'VERTRAAGD',
    budgetIndicatief: 850_000,
    budgetWerkelijk: 320_000,
    startDagenGeleden: 75,
    duurDagen: 180,
    contractor: 'Stadsbouw Paramaribo',
    voortgang: [
      { dagenGeleden: 75, tekst: 'Start. Marktactiviteit verschoven naar tijdelijke locatie.' },
      { dagenGeleden: 50, tekst: 'Dak-renovatie sectie A afgerond.' },
      { dagenGeleden: 20, tekst: 'VERTRAGING: tekorten aan kabel-leveringen, geschat 4-6 weken extra.' },
      { dagenGeleden: 5, tekst: 'Kabels alsnog binnen via alternatieve leverancier. Werk hervat.' },
    ],
  },
  {
    district: 'PAR', ressort: 'PAR-blauwgrond',
    catCode: 'PRJ-WATER',
    titel: 'Drainage Vondellaan-omgeving',
    beschrijving: 'Nieuwe pomp-installatie + drainage-buizen vervangen op 3 straten.',
    status: 'GOEDGEKEURD',
    budgetIndicatief: 290_000,
    voortgang: [
      { dagenGeleden: 5, tekst: 'DR-goedkeuring ontvangen. Wachten op offerte-procedure.' },
    ],
  },
  {
    district: 'PAR', ressort: 'PAR-flora',
    catCode: 'PRJ-BUURT',
    titel: 'Buurtcentrum Flora — uitbreiding',
    beschrijving: 'Toevoeging zaal voor 60 personen aan bestaand buurtcentrum.',
    status: 'IDEE',
    budgetIndicatief: 480_000,
    voortgang: [
      { dagenGeleden: 2, tekst: 'Initiatief vanuit ressortraad Flora. Eerst behoefte-onderzoek.' },
    ],
  },
  {
    district: 'NIC',
    catCode: 'PRJ-LANDBOUW',
    titel: 'Dijk-versterking Polder 12',
    beschrijving: 'Urgente dijk-versterking na scheur-detectie. Coördinatie met Ministerie OW.',
    status: 'GESTART',
    budgetIndicatief: 1_200_000,
    budgetWerkelijk: 380_000,
    startDagenGeleden: 14,
    duurDagen: 90,
    contractor: 'Waterbouw Nickerie',
    voortgang: [
      { dagenGeleden: 14, tekst: 'Spoedstart. Klei-aanvoer per truck dagelijks.' },
      { dagenGeleden: 7, tekst: 'Eerste 400m versterkt. Boeren tevreden over communicatie.' },
    ],
  },
  {
    district: 'COM', ressort: 'COM-nieuw-amsterdam',
    catCode: 'PRJ-BRUG',
    titel: 'Inspectie + reparatie Commewijne-brug',
    beschrijving: 'Diagonale scheur ontdekt — ingenieursinspectie + reparatie.',
    status: 'BUDGET_AANGEVRAAGD',
    budgetIndicatief: 220_000,
    voortgang: [
      { dagenGeleden: 8, tekst: 'Inspectierapport: structureel veilig met reparatie binnen 60 dagen.' },
      { dagenGeleden: 4, tekst: 'Budget aangevraagd via ministerie OW + districtsfonds.' },
    ],
  },
  {
    district: 'PAA', ressort: 'PAA-carolina',
    catCode: 'PRJ-WATER',
    titel: 'Waterpomp Carolina vervangen',
    beschrijving: 'Vervanging defecte waterpomp dorp Carolina, inclusief reserve-onderdelen voorraad.',
    status: 'AFGEROND',
    budgetIndicatief: 35_000,
    budgetWerkelijk: 34_200,
    startDagenGeleden: 28,
    duurDagen: 14,
    contractor: 'EBS Para',
    voortgang: [
      { dagenGeleden: 28, tekst: 'Nieuwe pomp besteld na crisis-melding.' },
      { dagenGeleden: 21, tekst: 'Pomp geleverd. Installatie 2 dagen.' },
      { dagenGeleden: 14, tekst: 'Werkend. Dorp heeft weer schoon water. Dank aan DC en buurtwacht.' },
    ],
  },
  {
    district: 'PAA', ressort: 'PAA-onverwacht',
    catCode: 'PRJ-SPORT',
    titel: 'Speeltuin Onverwacht-renovatie',
    beschrijving: 'Vervanging alle speeltoestellen, nieuwe veiligheidsmatten, hekwerk.',
    status: 'GOEDGEKEURD',
    budgetIndicatief: 95_000,
    voortgang: [
      { dagenGeleden: 5, tekst: 'Plan goedgekeurd door DR Para. Glas eerst weggehaald als spoed-actie.' },
    ],
  },
  {
    district: 'BRO', ressort: 'BRO-brownsweg',
    catCode: 'PRJ-BINNENLAND',
    titel: 'Drinkwater-systeem dorp Brownsweg',
    beschrijving: 'Aanleg pomp + leiding-netwerk voor 120 huishoudens. Onderdeel Bio-SWEET programma.',
    status: 'GESTART',
    budgetIndicatief: 680_000,
    budgetWerkelijk: 95_000,
    startDagenGeleden: 60,
    duurDagen: 240,
    contractor: 'Bio-SWEET Consortium',
    voortgang: [
      { dagenGeleden: 60, tekst: 'Start in samenwerking met IDB-programma. Materialen via Paramaribo.' },
      { dagenGeleden: 40, tekst: 'Pompput-locatie vastgesteld na geologisch onderzoek.' },
      { dagenGeleden: 15, tekst: 'Pompput-boring afgerond. Leidingen worden geleverd.' },
    ],
  },
];

// ─── Hoofd-script ─────────────────────────────────────────────────

async function cleanupDemo() {
  console.log('  ▸ Opruimen eerdere demo-data');
  // Volgorde belangrijk vanwege FK-relaties
  await prisma.districtsfondsUitgave.deleteMany({});
  await prisma.districtsfonds.deleteMany({});
  await prisma.projectUpdate.deleteMany({});
  await prisma.project.deleteMany({});
  await prisma.vergunningEvent.deleteMany({});
  await prisma.vergunningDocument.deleteMany({});
  await prisma.vergunning.deleteMany({});
  await prisma.meldingEvent.deleteMany({});
  await prisma.meldingBijlage.deleteMany({});
  await prisma.melding.deleteMany({});
  await prisma.districtsplanPrioriteit.deleteMany({});
  await prisma.districtsplan.deleteMany({});
  await prisma.ressortplanPrioriteit.deleteMany({});
  await prisma.ressortplan.deleteMany({});
}

async function seedMeldingen() {
  console.log('  ▸ Meldingen');
  const dcWanica = await prisma.gebruiker.findUnique({ where: { email: 'dc.wanica@sdp.local' } });
  const meldenWanica = await prisma.gebruiker.findUnique({ where: { email: 'meldingen.wanica@sdp.local' } });
  const dcPar = await prisma.gebruiker.findUnique({ where: { email: 'dc.paramaribo@sdp.local' } });

  let teller = 0;
  for (const m of MELDING_SJABLONEN) {
    const d = await prisma.district.findUnique({ where: { code: m.district } });
    if (!d) continue;
    const cat = await prisma.categorie.findUnique({ where: { code: m.catCode } });
    if (!cat) continue;
    let ressortId: number | undefined;
    if (m.ressort) {
      const r = await prisma.ressort.findFirst({
        where: { code: { equals: m.ressort, mode: 'insensitive' } },
      });
      ressortId = r?.id;
    }

    const dagen = randomInt(0, 30);
    const createdAt = daysAgo(dagen);

    // Realistisch verdeel statussen: 25% nieuw, 35% in behandeling, 10% extra info, 25% opgelost, 5% gesloten
    const statusKans = Math.random();
    let status: MeldingStatus = 'NIEUW';
    let toegewezenAanId: string | undefined;
    let toegewezenOp: Date | undefined;
    let geslotenOp: Date | undefined;

    if (m.urgentie === 'CRISIS') {
      status = 'IN_BEHANDELING';
      toegewezenAanId = (m.district === 'PAR' ? dcPar : dcWanica)?.id;
      toegewezenOp = daysAgo(Math.max(0, dagen - 1));
    } else if (statusKans < 0.25) {
      status = 'NIEUW';
    } else if (statusKans < 0.60) {
      status = 'IN_BEHANDELING';
      toegewezenAanId =
        m.district === 'WAN' ? meldenWanica?.id ?? dcWanica?.id : dcPar?.id;
      toegewezenOp = daysAgo(Math.max(0, dagen - randomInt(1, 5)));
    } else if (statusKans < 0.70) {
      status = 'EXTRA_INFO_NODIG';
      toegewezenAanId =
        m.district === 'WAN' ? meldenWanica?.id ?? dcWanica?.id : dcPar?.id;
      toegewezenOp = daysAgo(Math.max(0, dagen - 2));
    } else if (statusKans < 0.95) {
      status = 'OPGELOST';
      geslotenOp = daysAgo(Math.max(0, dagen - randomInt(3, 14)));
    } else {
      status = 'GESLOTEN';
      geslotenOp = daysAgo(Math.max(0, dagen - randomInt(7, 21)));
    }

    const melder = pick(SURINAAMSE_NAMEN_BURGER);
    const melding = await prisma.melding.create({
      data: {
        ticketNummer: `MLD-2026-${m.district}-${nanoMld()}`,
        districtId: d.id,
        ressortId,
        categorieId: cat.id,
        titel: m.titel,
        omschrijving: m.omschrijving,
        locatieOmschrijving: m.locatie,
        urgentie: m.urgentie,
        status,
        toegewezenAanId,
        toegewezenOp,
        geslotenOp,
        melderNaam: Math.random() > 0.3 ? melder : null,
        melderTelefoon: Math.random() > 0.5 ? `+597-${randomInt(8100000, 8999999)}` : null,
        melderEmail:
          Math.random() > 0.4
            ? melder.toLowerCase().replace(/[^a-z]+/g, '.').replace(/^\.|\.$/g, '') + '@example.com'
            : null,
        melderConsent: Math.random() > 0.3,
        createdAt,
        updatedAt: createdAt,
        events: {
          create: [
            {
              type: 'aangemaakt',
              payload: { via: 'publiek-formulier' },
              createdAt,
            },
            ...(toegewezenOp
              ? [
                  {
                    type: 'toegewezen',
                    actorId: toegewezenAanId,
                    payload: { via: 'auto' },
                    createdAt: toegewezenOp,
                  },
                ]
              : []),
            ...(geslotenOp
              ? [
                  {
                    type: 'status_gewijzigd',
                    actorId: toegewezenAanId,
                    payload: { naar: status, opmerking: 'Opgelost door wegenbouw-team' },
                    createdAt: geslotenOp,
                  },
                ]
              : []),
          ],
        },
      },
    });

    if (m.geom) {
      await prisma.$executeRawUnsafe(
        `UPDATE meldingen SET geom = ST_SetSRID(ST_MakePoint($1, $2), 4326)::geography WHERE id = $3`,
        m.geom[0],
        m.geom[1],
        melding.id,
      );
    }
    teller++;
  }
  console.log(`    ✓ ${teller} meldingen`);
}

async function seedVergunningen() {
  console.log('  ▸ Vergunningen');
  const dcWanica = await prisma.gebruiker.findUnique({ where: { email: 'dc.wanica@sdp.local' } });
  const dcPar = await prisma.gebruiker.findUnique({ where: { email: 'dc.paramaribo@sdp.local' } });

  let teller = 0;
  for (const v of VERGUNNING_SJABLONEN) {
    const d = await prisma.district.findUnique({ where: { code: v.district } });
    if (!d) continue;
    const cat = await prisma.categorie.findUnique({ where: { code: v.catCode } });
    if (!cat) continue;

    const ingediendOp = daysAgo(v.dagen_geleden_ingediend);
    const naam =
      v.aanvragerSoort === 'ONDERNEMING'
        ? pick(SURINAAMSE_BEDRIJVEN)
        : pick(SURINAAMSE_NAMEN_BURGER);
    const beslist = ['GOEDGEKEURD', 'AFGEWEZEN'].includes(v.status);
    const beslotenOp = beslist
      ? daysAgo(Math.max(0, v.dagen_geleden_ingediend - randomInt(7, 21)))
      : null;
    const besluitDoorId = beslist ? (v.district === 'PAR' ? dcPar?.id : dcWanica?.id) : null;

    const events: Array<{ type: string; actorId?: string; payload?: object; createdAt: Date }> = [
      { type: 'ingediend', payload: { via: 'publiek-formulier' }, createdAt: ingediendOp },
    ];
    if (v.status === 'IN_BEHANDELING' || v.status === 'EXTRA_INFO_NODIG' || beslist) {
      const inBehandelingOp = daysAgo(Math.max(0, v.dagen_geleden_ingediend - 2));
      events.push({
        type: 'status_gewijzigd',
        actorId: v.district === 'PAR' ? dcPar?.id : dcWanica?.id,
        payload: { van: 'INGEDIEND', naar: 'IN_BEHANDELING' },
        createdAt: inBehandelingOp,
      });
    }
    if (beslist && beslotenOp) {
      events.push({
        type: 'besluit',
        actorId: besluitDoorId ?? undefined,
        payload: { status: v.status, besluit: v.besluit },
        createdAt: beslotenOp,
      });
    }

    await prisma.vergunning.create({
      data: {
        referentie: `VRG-2026-${v.district}-${nanoVrg()}`,
        categorieId: cat.id,
        districtId: d.id,
        titel: v.titel,
        beschrijving: v.beschrijving,
        locatieOmschrijving: v.locatie,
        status: v.status,
        aanvragerSoort: v.aanvragerSoort,
        aanvragerNaam: naam,
        aanvragerTelefoon: `+597-${randomInt(8100000, 8999999)}`,
        aanvragerEmail: naam.toLowerCase().replace(/[^a-z]+/g, '.') + '@voorbeeld.sr',
        aanvragerKkfNummer: v.aanvragerSoort === 'ONDERNEMING' ? `KKF-${randomInt(10000, 99999)}` : null,
        ingediendOp,
        beslotenOp,
        besluit: v.besluit,
        besluitDoorId,
        createdAt: ingediendOp,
        updatedAt: beslotenOp ?? ingediendOp,
        events: { create: events },
      },
    });
    teller++;
  }
  console.log(`    ✓ ${teller} vergunningen`);
}

async function seedProjecten() {
  console.log('  ▸ Projecten');
  const dcWanica = await prisma.gebruiker.findUnique({ where: { email: 'dc.wanica@sdp.local' } });
  const dcPar = await prisma.gebruiker.findUnique({ where: { email: 'dc.paramaribo@sdp.local' } });

  let teller = 0;
  for (const p of PROJECT_SJABLONEN) {
    const d = await prisma.district.findUnique({ where: { code: p.district } });
    if (!d) continue;
    const cat = await prisma.categorie.findFirst({
      where: { code: p.catCode === 'PRJ-LICHT' ? 'PRJ-OVERIG' : p.catCode },
    });
    let ressortId: number | undefined;
    if (p.ressort) {
      const r = await prisma.ressort.findFirst({
        where: { code: { equals: p.ressort, mode: 'insensitive' } },
      });
      ressortId = r?.id;
    }
    const actor = p.district === 'PAR' ? dcPar : dcWanica;
    if (!actor) continue;

    const startDatum = p.startDagenGeleden ? daysAgo(p.startDagenGeleden) : null;
    const eindDatumPlan =
      p.startDagenGeleden && p.duurDagen
        ? daysAgo(p.startDagenGeleden - p.duurDagen)
        : null;
    const eindDatumWerkelijk = p.status === 'AFGEROND' ? daysAgo(Math.max(0, (p.startDagenGeleden ?? 0) - (p.duurDagen ?? 0))) : null;

    const project = await prisma.project.create({
      data: {
        referentie: `PRJ-2026-${p.district}-${nanoPrj()}`,
        titel: p.titel,
        beschrijving: p.beschrijving,
        status: p.status,
        categorieId: cat?.id,
        districtId: d.id,
        ressortId,
        budgetIndicatief: p.budgetIndicatief,
        budgetWerkelijk: p.budgetWerkelijk,
        valuta: 'SRD',
        startDatum,
        eindDatumPlan,
        eindDatumWerkelijk,
        contractor: p.contractor,
        createdAt: daysAgo((p.startDagenGeleden ?? 5) + 5),
        updates: {
          create: p.voortgang.map((v) => ({
            actorId: actor.id,
            body: v.tekst,
            createdAt: daysAgo(v.dagenGeleden),
          })),
        },
      },
    });
    teller++;
    void project;
  }
  console.log(`    ✓ ${teller} projecten met voortgangslogboeken`);
}

async function seedPlannen() {
  console.log('  ▸ Ressortplannen + districtsplannen');
  const rcLelydorp = await prisma.gebruiker.findUnique({ where: { email: 'rc.lelydorp@sdp.local' } });
  const dcWanica = await prisma.gebruiker.findUnique({ where: { email: 'dc.wanica@sdp.local' } });
  const dcPar = await prisma.gebruiker.findUnique({ where: { email: 'dc.paramaribo@sdp.local' } });
  if (!rcLelydorp || !dcWanica || !dcPar) return;

  const lelydorp = await prisma.ressort.findFirst({
    where: { code: { equals: 'WAN-lelydorp', mode: 'insensitive' } },
  });
  const kwatta = await prisma.ressort.findFirst({
    where: { code: { equals: 'WAN-kwatta', mode: 'insensitive' } },
  });
  const houttuin = await prisma.ressort.findFirst({
    where: { code: { equals: 'WAN-houttuin', mode: 'insensitive' } },
  });
  const parCentrum = await prisma.ressort.findFirst({
    where: { code: { equals: 'PAR-centrum', mode: 'insensitive' } },
  });
  if (!lelydorp || !kwatta || !houttuin || !parCentrum) return;

  // Ressortplan Lelydorp — GOEDGEKEURD
  await prisma.ressortplan.create({
    data: {
      ressortId: lelydorp.id,
      jaar: 2026,
      versie: 1,
      status: 'GOEDGEKEURD',
      titel: 'Ressortplan Lelydorp 2026 — infrastructuur en veiligheid',
      inleiding:
        'Plan opgesteld na 3 hoorzittingen met buurtbewoners (15/16/17 maart 2026). Sterke vraag naar betere wegen, drainage en straatverlichting. Door RR goedgekeurd op 12 april 2026 (7 voor, 1 tegen).',
      gemaaktDoorId: rcLelydorp.id,
      goedgekeurdOp: daysAgo(45),
      createdAt: daysAgo(75),
      prioriteiten: {
        create: [
          {
            volgorde: 0,
            titel: 'Renovatie Lelydorpweg Noord',
            onderbouwing:
              'Asfaltlaag is sinds 2018 niet meer onderhouden. Gaten veroorzaken schade aan voertuigen. ~3000 dagelijkse gebruikers waaronder schoolbussen.',
            urgentie: 'HOOG',
            kostenraming: 450_000,
            doelgroep: 'Alle weggebruikers Lelydorp Noord',
            verwachteImpact: 'Veiligere verkeerssituatie en lagere voertuigschade. Schoolbus-route betrouwbaar.',
          },
          {
            volgorde: 1,
            titel: 'Straatverlichting Saramaccastraat',
            onderbouwing:
              '32 lichtmasten defect. Stijging meldingen onveiligheid na zonsondergang sinds 2024.',
            urgentie: 'HOOG',
            kostenraming: 85_000,
            doelgroep: 'Bewoners + voetgangers Saramaccastraat e.o.',
            verwachteImpact: 'Verhoogd veiligheidsgevoel. Naar verwachting 30% afname avondmeldingen.',
          },
          {
            volgorde: 2,
            titel: 'Drainagesysteem omgeving markt',
            onderbouwing:
              'Marktterrein staat blank na elke regenbui. Hindert handel en bezoekers. Klacht-volume stijgt.',
            urgentie: 'MIDDEL',
            kostenraming: 220_000,
            doelgroep: 'Marktondernemers + bezoekers',
            verwachteImpact: 'Continuïteit marktactiviteit ook in regenseizoen.',
          },
        ],
      },
    },
  });

  // Ressortplan Kwatta — GOEDGEKEURD
  await prisma.ressortplan.create({
    data: {
      ressortId: kwatta.id,
      jaar: 2026,
      versie: 1,
      status: 'GOEDGEKEURD',
      titel: 'Ressortplan Kwatta 2026 — landbouw en infrastructuur',
      inleiding:
        'Focus op landbouwers en bruggen. Twee dorpsraadpleging-sessies gehouden in februari.',
      gemaaktDoorId: dcWanica.id,
      goedgekeurdOp: daysAgo(40),
      createdAt: daysAgo(70),
      prioriteiten: {
        create: [
          {
            volgorde: 0,
            titel: 'Brug-renovatie Kwattaweg',
            onderbouwing:
              'Losgeraakt asfalt op de brug over de Kwatta-kreek. Voetgangers omfietsen. Reparatie urgent.',
            urgentie: 'HOOG',
            kostenraming: 65_000,
            doelgroep: 'Weggebruikers + voetgangers',
            verwachteImpact: 'Veiligheid gewaarborgd, verkeer normale snelheid.',
          },
          {
            volgorde: 1,
            titel: 'Drainage verbeteren landbouwpolder',
            onderbouwing:
              'Bij springtij komen 4 landbouwerven onder water. Schade aan kassen.',
            urgentie: 'HOOG',
            kostenraming: 180_000,
            doelgroep: 'Landbouwers Kwatta-polder',
            verwachteImpact: 'Voorkomen jaarlijkse oogstverliezen.',
          },
        ],
      },
    },
  });

  // Ressortplan Houttuin — TER_GOEDKEURING_RR
  await prisma.ressortplan.create({
    data: {
      ressortId: houttuin.id,
      jaar: 2026,
      versie: 1,
      status: 'TER_GOEDKEURING_RR',
      titel: 'Ressortplan Houttuin 2026 — schoolomgeving en milieu',
      inleiding: 'Op verzoek van Houttuin-buurtraad ingebracht. RR-stemming gepland voor volgende vergadering.',
      gemaaktDoorId: dcWanica.id,
      createdAt: daysAgo(20),
      prioriteiten: {
        create: [
          {
            volgorde: 0,
            titel: 'Schoolzone-inrichting SBO Houttuin',
            onderbouwing: 'Verkeerschaos bij brengen/halen. Voorstel: zebrapad-stoplicht + verkeersregelaar.',
            urgentie: 'HOOG',
            kostenraming: 45_000,
            doelgroep: 'Schoolkinderen + ouders SBO Houttuin',
            verwachteImpact: 'Veiligere school-omgeving, voorkomen ongelukken.',
          },
          {
            volgorde: 1,
            titel: 'Aanpak illegale dumping',
            onderbouwing: 'Bouwafval-dumping bij schoolzone. Mogelijk asbest. Bewaakte container-locatie inrichten.',
            urgentie: 'HOOG',
            kostenraming: 28_000,
            verwachteImpact: 'Vermindering illegale dumping; schone leefomgeving.',
          },
        ],
      },
    },
  });

  // Ressortplan Paramaribo Centrum — CONCEPT
  await prisma.ressortplan.create({
    data: {
      ressortId: parCentrum.id,
      jaar: 2026,
      versie: 1,
      status: 'CONCEPT',
      titel: 'Ressortplan Paramaribo Centrum 2026 — historisch erfgoed & toerisme',
      inleiding:
        'Eerste concept. Hoorzittingen met winkeliers en horeca staan gepland.',
      gemaaktDoorId: dcPar.id,
      createdAt: daysAgo(7),
      prioriteiten: {
        create: [
          {
            volgorde: 0,
            titel: 'Bestrating Waterkant herstellen',
            onderbouwing: 'Losgekomen tegels bij oude Stadhuis. Toeristen vallen. Historisch beeld.',
            urgentie: 'HOOG',
            kostenraming: 320_000,
            doelgroep: 'Toeristen + omwonenden',
            verwachteImpact: 'Veiligheid + visitekaartje van Paramaribo behouden.',
          },
        ],
      },
    },
  });

  // Districtsplan Wanica — GOEDGEKEURD
  await prisma.districtsplan.create({
    data: {
      districtId: (await prisma.district.findUnique({ where: { code: 'WAN' } }))!.id,
      jaar: 2026,
      versie: 1,
      status: 'GOEDGEKEURD',
      titel: 'Districtsplan Wanica 2026',
      inleiding:
        'Geaggregeerd uit goedgekeurde ressortplannen Lelydorp en Kwatta, aangevuld met districts-brede prioriteiten. DR-stemming unaniem; goedgekeurd door RO 18 april.',
      gemaaktDoorId: dcWanica.id,
      goedgekeurdOp: daysAgo(20),
      createdAt: daysAgo(35),
      prioriteiten: {
        create: [
          {
            volgorde: 0,
            titel: '[Lelydorp] Renovatie Lelydorpweg Noord',
            onderbouwing: 'Overgenomen uit ressortplan Lelydorp. Reeds in uitvoering.',
            urgentie: 'HOOG',
            kostenraming: 450_000,
          },
          {
            volgorde: 1,
            titel: '[Lelydorp] Straatverlichting Saramaccastraat',
            onderbouwing: 'Overgenomen uit ressortplan Lelydorp. In budgetfase.',
            urgentie: 'HOOG',
            kostenraming: 85_000,
          },
          {
            volgorde: 2,
            titel: '[Kwatta] Drainage landbouwpolder',
            onderbouwing: 'Overgenomen uit ressortplan Kwatta.',
            urgentie: 'HOOG',
            kostenraming: 180_000,
          },
          {
            volgorde: 3,
            titel: 'Districtsbreed: vuilophaal-uitbreiding',
            onderbouwing: 'Toegevoegd door DC: knelpunt geconstateerd in alle ressorten op basis van melding-analyse.',
            urgentie: 'MIDDEL',
            kostenraming: 180_000,
          },
          {
            volgorde: 4,
            titel: 'Districtsbreed: digitalisering DC-loket (SDP-implementatie)',
            onderbouwing: 'Vermindering wachttijden, modernisering bestuurlijke processen.',
            urgentie: 'MIDDEL',
            kostenraming: 60_000,
          },
        ],
      },
    },
  });

  // Districtsplan Paramaribo — TER_GOEDKEURING_DC
  await prisma.districtsplan.create({
    data: {
      districtId: (await prisma.district.findUnique({ where: { code: 'PAR' } }))!.id,
      jaar: 2026,
      versie: 1,
      status: 'TER_GOEDKEURING_DC',
      titel: 'Districtsplan Paramaribo 2026',
      inleiding: 'Concept goedgekeurd door DR. Wacht op DC-akkoord voordat naar RO.',
      gemaaktDoorId: dcPar.id,
      createdAt: daysAgo(15),
      prioriteiten: {
        create: [
          {
            volgorde: 0,
            titel: 'Modernisering Centrale Markt — vervolgfase',
            onderbouwing: 'Lopend project, herzien budget na vertraging.',
            urgentie: 'HOOG',
            kostenraming: 850_000,
          },
          {
            volgorde: 1,
            titel: 'Drainage Vondellaan + zijstraten',
            onderbouwing: 'Sluit aan op melding-volume Blauwgrond. Voorbereiding afgerond.',
            urgentie: 'HOOG',
            kostenraming: 290_000,
          },
          {
            volgorde: 2,
            titel: 'Verlichting kritieke pleintjes (5 locaties)',
            onderbouwing: 'Veiligheidsverbetering meldzwaar gebied.',
            urgentie: 'MIDDEL',
            kostenraming: 65_000,
          },
        ],
      },
    },
  });
  console.log('    ✓ 4 ressortplannen + 2 districtsplannen');
}

async function seedDistrictsfonds() {
  console.log('  ▸ Districtsfonds Wanica + uitgaven');
  const wanica = await prisma.district.findUnique({ where: { code: 'WAN' } });
  const dcWanica = await prisma.gebruiker.findUnique({ where: { email: 'dc.wanica@sdp.local' } });
  const fmWanica = await prisma.gebruiker.findUnique({ where: { email: 'vergunningen.wanica@sdp.local' } });
  if (!wanica || !dcWanica) return;

  const fonds = await prisma.districtsfonds.create({
    data: {
      districtId: wanica.id,
      jaar: 2026,
      totaalBudget: 1_500_000,
      goedgekeurd: true,
    },
  });

  const projecten = await prisma.project.findMany({
    where: { districtId: wanica.id, budgetWerkelijk: { not: null } },
    take: 4,
  });

  for (const p of projecten) {
    await prisma.districtsfondsUitgave.create({
      data: {
        districtsfondsId: fonds.id,
        projectId: p.id,
        bedrag: p.budgetWerkelijk!,
        beschrijving: `Uitgave voor: ${p.titel}`,
        geboektDoorId: (fmWanica ?? dcWanica).id,
        geboektOp: daysAgo(randomInt(2, 30)),
      },
    });
  }

  // Niet-project uitgaven
  await prisma.districtsfondsUitgave.create({
    data: {
      districtsfondsId: fonds.id,
      bedrag: 12_500,
      beschrijving: 'Kantoorbenodigdheden DC-kantoor Q1',
      geboektDoorId: (fmWanica ?? dcWanica).id,
      geboektOp: daysAgo(45),
    },
  });
  await prisma.districtsfondsUitgave.create({
    data: {
      districtsfondsId: fonds.id,
      bedrag: 8_300,
      beschrijving: 'Catering RR/DR vergaderingen Q1+Q2',
      geboektDoorId: (fmWanica ?? dcWanica).id,
      geboektOp: daysAgo(28),
    },
  });

  console.log('    ✓ 1 fonds + 6 uitgaven');
}

async function main() {
  console.log('▶ SDP demo-data seeder');
  console.log('  Genereert realistische voorbeelden voor presentatie.');
  console.log('');

  await cleanupDemo();
  await seedMeldingen();
  await seedVergunningen();
  await seedProjecten();
  await seedPlannen();
  await seedDistrictsfonds();

  const counts = {
    meldingen: await prisma.melding.count(),
    vergunningen: await prisma.vergunning.count(),
    projecten: await prisma.project.count(),
    ressortplannen: await prisma.ressortplan.count(),
    districtsplannen: await prisma.districtsplan.count(),
    districtsfondsen: await prisma.districtsfonds.count(),
    fondsuitgaven: await prisma.districtsfondsUitgave.count(),
  };
  console.log('');
  console.log('✓ Demo-data klaar:');
  for (const [k, v] of Object.entries(counts)) {
    console.log(`    ${k.padEnd(20)} ${v}`);
  }
  console.log('');
  console.log('  Probeer: http://localhost:3000/login als dc.wanica@sdp.local / Welkom2026!');
}

void main()
  .catch((e) => {
    console.error('✗ Seed faalde:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
