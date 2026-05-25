/**
 * Gedeelde stijlen voor statussen — meldingen, vergunningen, projecten,
 * plannen. Houdt UI consistent.
 */

export const meldingStatusKleur: Record<string, string> = {
  NIEUW: 'bg-blue-100 text-blue-800',
  IN_BEHANDELING: 'bg-amber-100 text-amber-800',
  EXTRA_INFO_NODIG: 'bg-orange-100 text-orange-800',
  OPGELOST: 'bg-emerald-100 text-emerald-800',
  GESLOTEN: 'bg-gray-200 text-gray-700',
  HEROPEND: 'bg-red-100 text-red-800',
};

export const vergunningStatusKleur: Record<string, string> = {
  CONCEPT: 'bg-gray-100 text-gray-700',
  INGEDIEND: 'bg-blue-100 text-blue-800',
  IN_BEHANDELING: 'bg-amber-100 text-amber-800',
  EXTRA_INFO_NODIG: 'bg-orange-100 text-orange-800',
  GOEDGEKEURD: 'bg-emerald-100 text-emerald-800',
  AFGEWEZEN: 'bg-red-100 text-red-800',
  INGETROKKEN: 'bg-gray-200 text-gray-700',
  BEZWAAR: 'bg-purple-100 text-purple-800',
};

export const projectStatusKleur: Record<string, string> = {
  IDEE: 'bg-gray-100 text-gray-700',
  GOEDGEKEURD: 'bg-blue-100 text-blue-800',
  BUDGET_AANGEVRAAGD: 'bg-indigo-100 text-indigo-800',
  GESTART: 'bg-emerald-100 text-emerald-800',
  VERTRAAGD: 'bg-amber-100 text-amber-800',
  AFGEROND: 'bg-emerald-700 text-white',
  GEEVALUEERD: 'bg-green-700 text-white',
  GEANNULEERD: 'bg-red-100 text-red-800',
};

export function srdFormat(bedrag: number | string | null | undefined): string {
  if (bedrag == null) return '—';
  const n = typeof bedrag === 'string' ? Number(bedrag) : bedrag;
  if (!Number.isFinite(n)) return '—';
  return `SRD ${n.toLocaleString('nl-NL', { maximumFractionDigits: 0 })}`;
}

export const planStatusKleur: Record<string, string> = {
  CONCEPT: 'bg-gray-100 text-gray-700',
  TER_GOEDKEURING_RR: 'bg-blue-100 text-blue-800',
  TER_GOEDKEURING_DR: 'bg-indigo-100 text-indigo-800',
  TER_GOEDKEURING_DC: 'bg-violet-100 text-violet-800',
  TER_GOEDKEURING_RO: 'bg-purple-100 text-purple-800',
  GOEDGEKEURD: 'bg-emerald-100 text-emerald-800',
  AFGEWEZEN: 'bg-red-100 text-red-800',
  HERZIENING_NODIG: 'bg-orange-100 text-orange-800',
  GEARCHIVEERD: 'bg-gray-200 text-gray-700',
};

export function statusLabel(status: string): string {
  return status.replace(/_/g, ' ').toLowerCase().replace(/^./, (c) => c.toUpperCase());
}
