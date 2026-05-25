/**
 * Eenvoudige API-client voor de SDP backend.
 * Bewust géén dependency op react-query etc. in MVP — kan later.
 */

const BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:4000';

export type District = {
  id: number;
  code: string;
  naam: string;
  hoofdstad: string | null;
  _count?: { ressorten: number };
};

export type Ressort = {
  id: number;
  code: string;
  naam: string;
  districtId: number;
  district?: { code: string; naam: string };
};

export type Categorie = {
  id: number;
  code: string;
  naam: string;
  icoon?: string | null;
};

export type VergunningStatus =
  | 'CONCEPT'
  | 'INGEDIEND'
  | 'IN_BEHANDELING'
  | 'EXTRA_INFO_NODIG'
  | 'GOEDGEKEURD'
  | 'AFGEWEZEN'
  | 'INGETROKKEN'
  | 'BEZWAAR';

export type AanvragerSoort = 'BURGER' | 'ONDERNEMING';

export type Vergunning = {
  id: number;
  referentie: string;
  status: VergunningStatus;
  titel: string;
  beschrijving?: string | null;
  locatieOmschrijving?: string | null;
  aanvragerSoort?: AanvragerSoort | null;
  aanvragerNaam?: string | null;
  aanvragerEmail?: string | null;
  aanvragerTelefoon?: string | null;
  aanvragerKkfNummer?: string | null;
  ingediendOp?: string | null;
  beslotenOp?: string | null;
  besluit?: string | null;
  categorie: { id: number; naam: string };
  district?: { id: number; code: string; naam: string };
  events?: Array<{ type: string; payload: unknown; createdAt: string; actor?: { naam: string } | null }>;
};

export type VergunningStatusPubliek = {
  referentie: string;
  status: VergunningStatus;
  titel: string;
  beschrijving?: string | null;
  locatieOmschrijving?: string | null;
  ingediendOp?: string | null;
  beslotenOp?: string | null;
  besluit?: string | null;
  district: { naam: string };
  categorie: { naam: string };
  events: Array<{ type: string; payload: unknown; createdAt: string }>;
};

export type Urgentie = 'LAAG' | 'MIDDEL' | 'HOOG' | 'CRISIS';

export type ProjectStatus =
  | 'IDEE'
  | 'GOEDGEKEURD'
  | 'BUDGET_AANGEVRAAGD'
  | 'GESTART'
  | 'VERTRAAGD'
  | 'AFGEROND'
  | 'GEEVALUEERD'
  | 'GEANNULEERD';

export type ProjectLijst = {
  id: number;
  referentie: string;
  titel: string;
  status: ProjectStatus;
  budgetIndicatief?: string | number | null;
  budgetWerkelijk?: string | number | null;
  startDatum?: string | null;
  eindDatumPlan?: string | null;
  contractor?: string | null;
  ressort?: { id: number; naam: string } | null;
  categorie?: { naam: string } | null;
  _count: { updates: number };
  createdAt: string;
  updatedAt: string;
};

export type ProjectDetail = ProjectLijst & {
  beschrijving?: string | null;
  district: { id: number; code: string; naam: string };
  eindDatumWerkelijk?: string | null;
  updates: Array<{
    id: number;
    body: string;
    createdAt: string;
    actor: { id: string; naam: string };
  }>;
};

export type PlanStatus =
  | 'CONCEPT'
  | 'TER_GOEDKEURING_RR'
  | 'TER_GOEDKEURING_DR'
  | 'TER_GOEDKEURING_DC'
  | 'TER_GOEDKEURING_RO'
  | 'GOEDGEKEURD'
  | 'AFGEWEZEN'
  | 'HERZIENING_NODIG'
  | 'GEARCHIVEERD';

export type Prioriteit = {
  id?: number;
  volgorde?: number;
  titel: string;
  onderbouwing: string;
  urgentie?: Urgentie;
  kostenraming?: number | string | null;
  doelgroep?: string | null;
  verwachteImpact?: string | null;
};

export type RessortplanLijst = {
  id: number;
  jaar: number;
  versie: number;
  status: PlanStatus;
  titel: string;
  ressort: { id: number; naam: string; districtId: number };
  _count: { prioriteiten: number };
  createdAt: string;
  updatedAt: string;
  goedgekeurdOp?: string | null;
};

export type RessortplanDetail = Omit<RessortplanLijst, '_count'> & {
  inleiding?: string | null;
  prioriteiten: Prioriteit[];
  gemaaktDoor: { id: string; naam: string };
};

export type DistrictsplanLijst = {
  id: number;
  jaar: number;
  versie: number;
  status: PlanStatus;
  titel: string;
  district: { id: number; code: string; naam: string };
  _count: { prioriteiten: number };
  createdAt: string;
  updatedAt: string;
  goedgekeurdOp?: string | null;
};

export type DistrictsplanDetail = Omit<DistrictsplanLijst, '_count'> & {
  inleiding?: string | null;
  prioriteiten: Prioriteit[];
  gemaaktDoor: { id: string; naam: string };
};

export type RessortAggregatie = {
  districtId: number;
  jaar: number;
  aantalRessorten: number;
  totaalPrioriteiten: number;
  perRessort: Array<{
    ressort: { id: number; naam: string };
    plan: { id: number; titel: string; versie: number };
    prioriteiten: Prioriteit[];
  }>;
};

export type DcDashboard = {
  district: District;
  meldingen: {
    open: number;
    crisis: number;
    topCategorieen30dagen: Array<{ categorie: string; aantal: number }>;
  };
  vergunningen: { open: number };
  projecten: { lopend: number };
  plannen: { concept: number; terGoedkeuring: number };
} | null;

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${BASE}/api${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...(init?.headers ?? {}) },
    cache: 'no-store',
  });
  if (!res.ok) {
    const txt = await res.text().catch(() => '');
    throw new Error(`API ${res.status}: ${txt || res.statusText}`);
  }
  return (await res.json()) as T;
}

export const api = {
  districten: () => request<District[]>('/districten'),
  district: (code: string) => request<District & { ressorten: Ressort[] }>(`/districten/${code}`),
  ressorten: (districtCode?: string) =>
    request<Ressort[]>(`/ressorten${districtCode ? `?district=${districtCode}` : ''}`),
  categorieen: (type: 'melding' | 'vergunning' | 'project') =>
    request<Categorie[]>(`/categorieen?type=${type}`),
  meldingIndienen: (payload: unknown) =>
    request<{
      ticketNummer: string;
      status: string;
      district: string;
      ressort?: string;
      categorie: string;
    }>('/meldingen', { method: 'POST', body: JSON.stringify(payload) }),

  meldingenLijst: (
    districtId: number,
    token: string,
    status?: string,
  ) => {
    const qs = new URLSearchParams({ districtId: String(districtId) });
    if (status) qs.set('status', status);
    return request<Array<{
      id: number;
      ticketNummer: string;
      titel: string;
      omschrijving: string;
      status: string;
      urgentie: string;
      locatieOmschrijving?: string | null;
      melderNaam?: string | null;
      createdAt: string;
      ressort?: { id: number; naam: string } | null;
      categorie?: { id: number; naam: string };
      toegewezenAan?: { id: string; naam: string } | null;
      _count?: { bijlages: number; events: number };
    }>>(`/meldingen?${qs.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  meldingDetail: (id: number, token: string) =>
    request<{
      id: number;
      ticketNummer: string;
      titel: string;
      omschrijving: string;
      status: string;
      urgentie: string;
      locatieOmschrijving?: string | null;
      melderNaam?: string | null;
      melderTelefoon?: string | null;
      melderEmail?: string | null;
      melderConsent: boolean;
      createdAt: string;
      district: { id: number; naam: string };
      ressort?: { id: number; naam: string } | null;
      categorie: { id: number; naam: string };
      toegewezenAan?: { id: string; naam: string; email: string | null } | null;
      events: Array<{ type: string; payload?: unknown; createdAt: string; actor?: { id: string; naam: string } | null }>;
    }>(`/meldingen/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  meldingStatusWijzigen: (
    id: number,
    payload: { status: string; opmerking?: string },
    token: string,
  ) =>
    request<{ id: number; status: string }>(`/meldingen/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
      headers: { Authorization: `Bearer ${token}` },
    }),

  meldingStatus: (ticket: string) =>
    request<{
      ticketNummer: string;
      status: string;
      titel: string;
      district: { naam: string };
      ressort: { naam: string } | null;
      categorie: { naam: string };
      createdAt: string;
      updatedAt: string;
      events: Array<{ type: string; payload: unknown; createdAt: string }>;
    }>(`/meldingen/ticket/${encodeURIComponent(ticket)}`),
  dcDashboard: (districtId: number, token: string) =>
    request<DcDashboard>(`/dashboards/district/${districtId}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  // ─── Vergunningen ────────────────────────────────────────────────
  vergunningAanvragen: (payload: unknown) =>
    request<{
      referentie: string;
      status: VergunningStatus;
      district: string;
      categorie: string;
      ingediendOp: string;
    }>('/vergunningen', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  vergunningStatus: (ref: string) =>
    request<VergunningStatusPubliek>(`/vergunningen/ref/${encodeURIComponent(ref)}`),

  vergunningLijst: (districtId: number, token: string, status?: VergunningStatus) =>
    request<Vergunning[]>(
      `/vergunningen?districtId=${districtId}${status ? `&status=${status}` : ''}`,
      { headers: { Authorization: `Bearer ${token}` } },
    ),

  vergunningDetail: (id: number, token: string) =>
    request<Vergunning>(`/vergunningen/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  vergunningStatusWijzigen: (
    id: number,
    payload: { status: VergunningStatus; opmerking?: string },
    token: string,
  ) =>
    request<Vergunning>(`/vergunningen/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
      headers: { Authorization: `Bearer ${token}` },
    }),

  vergunningBesluit: (
    id: number,
    payload: { status: 'GOEDGEKEURD' | 'AFGEWEZEN'; besluit: string },
    token: string,
  ) =>
    request<Vergunning>(`/vergunningen/${id}/besluit`, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { Authorization: `Bearer ${token}` },
    }),

  // ─── Ressortplannen ───────────────────────────────────────────────
  ressortplanLijst: (
    token: string,
    filter: { ressortId?: number; jaar?: number; status?: PlanStatus } = {},
  ) => {
    const qs = new URLSearchParams();
    if (filter.ressortId) qs.set('ressortId', String(filter.ressortId));
    if (filter.jaar) qs.set('jaar', String(filter.jaar));
    if (filter.status) qs.set('status', filter.status);
    return request<RessortplanLijst[]>(`/ressortplannen?${qs.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  ressortplanMaak: (
    payload: {
      ressortId: number;
      jaar: number;
      titel: string;
      inleiding?: string;
      prioriteiten: Prioriteit[];
    },
    token: string,
  ) =>
    request<RessortplanDetail>('/ressortplannen', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { Authorization: `Bearer ${token}` },
    }),

  ressortplanDetail: (id: number, token: string) =>
    request<RessortplanDetail>(`/ressortplannen/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  ressortplanStatus: (
    id: number,
    payload: { status: PlanStatus; opmerking?: string },
    token: string,
  ) =>
    request<RessortplanDetail>(`/ressortplannen/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
      headers: { Authorization: `Bearer ${token}` },
    }),

  // ─── Districtsplannen ─────────────────────────────────────────────
  districtsplanLijst: (
    token: string,
    filter: { districtId?: number; jaar?: number; status?: PlanStatus } = {},
  ) => {
    const qs = new URLSearchParams();
    if (filter.districtId) qs.set('districtId', String(filter.districtId));
    if (filter.jaar) qs.set('jaar', String(filter.jaar));
    if (filter.status) qs.set('status', filter.status);
    return request<DistrictsplanLijst[]>(`/districtsplannen?${qs.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  districtsplanMaak: (
    payload: {
      districtId: number;
      jaar: number;
      titel: string;
      inleiding?: string;
      prioriteiten: Prioriteit[];
    },
    token: string,
  ) =>
    request<DistrictsplanDetail>('/districtsplannen', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { Authorization: `Bearer ${token}` },
    }),

  districtsplanDetail: (id: number, token: string) =>
    request<DistrictsplanDetail>(`/districtsplannen/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  districtsplanStatus: (
    id: number,
    payload: { status: PlanStatus; opmerking?: string },
    token: string,
  ) =>
    request<DistrictsplanDetail>(`/districtsplannen/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
      headers: { Authorization: `Bearer ${token}` },
    }),

  // ─── Aggregatie: bottom-up van ressortplannen naar districtsplan ──
  ressortplanAggregatie: (districtId: number, jaar: number, token: string) =>
    request<RessortAggregatie>(
      `/districten/${districtId}/ressortplan-aggregatie?jaar=${jaar}`,
      { headers: { Authorization: `Bearer ${token}` } },
    ),

  // ─── Projecten ────────────────────────────────────────────────────
  projectLijst: (districtId: number, token: string, status?: ProjectStatus) => {
    const qs = new URLSearchParams({ districtId: String(districtId) });
    if (status) qs.set('status', status);
    return request<ProjectLijst[]>(`/projecten?${qs.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  projectDetail: (id: number, token: string) =>
    request<ProjectDetail>(`/projecten/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  projectMaak: (
    payload: {
      districtId: number;
      ressortId?: number;
      categorieId?: number;
      titel: string;
      beschrijving?: string;
      contractor?: string;
      budgetIndicatief?: number;
      startDatum?: string;
      eindDatumPlan?: string;
    },
    token: string,
  ) =>
    request<ProjectDetail>('/projecten', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { Authorization: `Bearer ${token}` },
    }),

  projectVoortgang: (
    id: number,
    payload: { body: string },
    token: string,
  ) =>
    request<{ id: number; body: string; createdAt: string; actor: { id: string; naam: string } }>(
      `/projecten/${id}/voortgang`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { Authorization: `Bearer ${token}` },
      },
    ),

  projectStatus: (
    id: number,
    payload: { status: ProjectStatus; opmerking?: string },
    token: string,
  ) =>
    request<ProjectDetail>(`/projecten/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(payload),
      headers: { Authorization: `Bearer ${token}` },
    }),

  // ─── Financiën — Districtsfonds ──────────────────────────────────
  fondsenLijst: (
    token: string,
    filter: { districtId?: number; jaar?: number } = {},
  ) => {
    const qs = new URLSearchParams();
    if (filter.districtId) qs.set('districtId', String(filter.districtId));
    if (filter.jaar) qs.set('jaar', String(filter.jaar));
    return request<FondsLijst[]>(`/financien/districtsfondsen?${qs.toString()}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
  },

  fondsDetail: (id: number, token: string) =>
    request<FondsDetail>(`/financien/districtsfondsen/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    }),

  fondsMaak: (
    payload: { districtId: number; jaar: number; totaalBudget: number; goedgekeurd?: boolean },
    token: string,
  ) =>
    request<FondsLijst>('/financien/districtsfondsen', {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { Authorization: `Bearer ${token}` },
    }),

  fondsBoekUitgave: (
    fondsId: number,
    payload: { bedrag: number; beschrijving: string; projectId?: number },
    token: string,
  ) =>
    request<{ id: number; bedrag: string; beschrijving: string; budgetOverschrijding: boolean }>(
      `/financien/districtsfondsen/${fondsId}/uitgaven`,
      {
        method: 'POST',
        body: JSON.stringify(payload),
        headers: { Authorization: `Bearer ${token}` },
      },
    ),

  fondsBeslisUitgave: (
    uitgaveId: number,
    payload: { actie: 'GOEDKEUREN' | 'AFKEUREN'; reden?: string },
    token: string,
  ) =>
    request<UitgaveLijst>(`/financien/uitgaven/${uitgaveId}/beslissing`, {
      method: 'POST',
      body: JSON.stringify(payload),
      headers: { Authorization: `Bearer ${token}` },
    }),

  fondsExportCsvUrl: (fondsId: number, token: string) => {
    // CSV-export gebeurt via een directe <a download> link in de UI.
    // Browser kan niet de Authorization header zetten op een gewone link, dus
    // we geven de URL én een fetch-functie zodat de caller met blob() kan
    // downloaden. Voor demo: download via fetch + blob is veilig + werkt cross-origin.
    return {
      url: `${BASE}/financien/districtsfondsen/${fondsId}/audit/csv`,
      fetch: async (filename: string) => {
        const res = await fetch(
          `${BASE}/financien/districtsfondsen/${fondsId}/audit/csv`,
          { headers: { Authorization: `Bearer ${token}` } },
        );
        if (!res.ok) throw new Error(`CSV-download mislukt: HTTP ${res.status}`);
        const blob = await res.blob();
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
      },
    };
  },
};

// ─── Financiën types ─────────────────────────────────────────────
export type UitgaveStatus = 'AANGEVRAAGD' | 'GOEDGEKEURD' | 'AFGEKEURD';

export type FondsLijst = {
  id: number;
  districtId: number;
  jaar: number;
  totaalBudget: string | number;
  valuta: string;
  goedgekeurd: boolean;
  besteed: number;
  restant: number;
  pctBesteed: number;
  uitgavenInAfwachting: number;
  district: { id: number; code: string; naam: string };
  _count: { uitgaven: number };
};

export type FondsDetail = FondsLijst & {
  aangevraagdBedrag: number;
  verdeling: { projecten: number; operationeel: number };
  perProject: Array<{
    project: { id: number; referentie: string; titel: string; status: ProjectStatus } | null;
    bedrag: number;
  }>;
  uitgaven: Array<{
    id: number;
    bedrag: string | number;
    beschrijving: string;
    geboektOp: string;
    status: UitgaveStatus;
    geboektDoorId: string | null;
    goedgekeurdDoorId: string | null;
    goedgekeurdOp: string | null;
    afkeurReden: string | null;
    project?: { id: number; referentie: string; titel: string; status: ProjectStatus } | null;
  }>;
};

export type UitgaveLijst = {
  id: number;
  bedrag: string | number;
  beschrijving: string;
  geboektOp: string;
  status: UitgaveStatus;
  geboektDoorId: string | null;
  goedgekeurdDoorId: string | null;
  goedgekeurdOp: string | null;
  afkeurReden: string | null;
  districtsfonds?: {
    id: number;
    jaar: number;
    district: { id: number; code: string; naam: string };
  };
  project?: { id: number; referentie: string; titel: string } | null;
};
