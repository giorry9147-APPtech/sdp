'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useDashboard } from '@/lib/dashboard-context';
import { api, type ProjectLijst, type ProjectStatus } from '@/lib/api';
import { projectStatusKleur, srdFormat, statusLabel } from '@/lib/status-stijl';

const FILTERS: Array<{ label: string; status?: ProjectStatus }> = [
  { label: 'Alles' },
  { label: 'Idee', status: 'IDEE' },
  { label: 'Goedgekeurd', status: 'GOEDGEKEURD' },
  { label: 'Budget aangevraagd', status: 'BUDGET_AANGEVRAAGD' },
  { label: 'Gestart', status: 'GESTART' },
  { label: 'Vertraagd', status: 'VERTRAAGD' },
  { label: 'Afgerond', status: 'AFGEROND' },
];

export default function ProjectenLijstPage() {
  const { sessie, activeDistrictId, heeft, effectiefSubregioId } = useDashboard();
  const [filter, setFilter] = useState<ProjectStatus | undefined>();
  const [lijst, setLijst] = useState<ProjectLijst[]>([]);
  const [fout, setFout] = useState<string | null>(null);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    if (!activeDistrictId) return;
    setLaden(true);
    setFout(null);
    api
      .projectLijst(activeDistrictId, sessie.accessToken, {
        status: filter,
        subregioId: effectiefSubregioId,
      })
      .then(setLijst)
      .catch((e) => setFout(e instanceof Error ? e.message : 'fout'))
      .finally(() => setLaden(false));
  }, [filter, activeDistrictId, sessie.accessToken, effectiefSubregioId]);

  // KPI's
  const stats = useMemo(() => {
    const lopend = lijst.filter((p) =>
      ['GESTART', 'GOEDGEKEURD', 'BUDGET_AANGEVRAAGD', 'VERTRAAGD'].includes(p.status),
    ).length;
    const afgerond = lijst.filter((p) => p.status === 'AFGEROND' || p.status === 'GEEVALUEERD').length;
    const vertraagd = lijst.filter((p) => p.status === 'VERTRAAGD').length;
    const totaalBudget = lijst.reduce(
      (s, p) => s + Number(p.budgetIndicatief ?? 0),
      0,
    );
    const totaalBesteed = lijst.reduce(
      (s, p) => s + Number(p.budgetWerkelijk ?? 0),
      0,
    );
    return { lopend, afgerond, vertraagd, totaalBudget, totaalBesteed };
  }, [lijst]);

  const kanMaken = heeft('project.create');

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-sdp-groen">Projecten</h1>
          <p className="text-sm text-gray-600">
            Districtsprojecten — wegen, bruggen, scholen, sport, drainage,
            landbouw, binnenlandontwikkeling.
          </p>
        </div>
        {kanMaken && (
          <Link
            href="/dashboard/projecten/nieuw"
            className="rounded bg-sdp-groen px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
          >
            + Nieuw project
          </Link>
        )}
      </header>

      {/* KPI-tegels */}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        <KPI titel="Totaal" waarde={String(lijst.length)} />
        <KPI titel="Lopend" waarde={String(stats.lopend)} accent="groen" />
        <KPI titel="Vertraagd" waarde={String(stats.vertraagd)} accent={stats.vertraagd > 0 ? 'amber' : 'grijs'} />
        <KPI titel="Afgerond" waarde={String(stats.afgerond)} />
        <KPI
          titel="Budget besteed"
          waarde={`${Math.round((stats.totaalBesteed / Math.max(stats.totaalBudget, 1)) * 100)}%`}
          ondertekst={srdFormat(stats.totaalBesteed) + ' / ' + srdFormat(stats.totaalBudget)}
        />
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {FILTERS.map((f) => (
          <button
            key={f.label}
            onClick={() => setFilter(f.status)}
            className={`rounded-full px-3 py-1 text-sm ${
              filter === f.status
                ? 'bg-sdp-groen text-white'
                : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {fout && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {fout}
        </div>
      )}
      {laden && <p className="text-sm text-gray-500">Laden…</p>}

      {!laden && lijst.length === 0 && !fout && (
        <p className="rounded-lg bg-white p-6 text-sm text-gray-500 shadow-sm">
          Geen projecten in deze categorie.
        </p>
      )}

      {lijst.length > 0 && (
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Referentie</th>
                <th className="px-4 py-3">Titel</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Budget</th>
                <th className="px-4 py-3">Voortgang</th>
                <th className="px-4 py-3">Updates</th>
              </tr>
            </thead>
            <tbody>
              {lijst.map((p) => {
                const budget = Number(p.budgetIndicatief ?? 0);
                const besteed = Number(p.budgetWerkelijk ?? 0);
                const pct = budget > 0 ? Math.round((besteed / budget) * 100) : 0;
                return (
                  <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/projecten/${p.id}`}
                        className="font-mono text-xs text-sdp-groen hover:underline"
                      >
                        {p.referentie}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/projecten/${p.id}`}
                        className="font-medium hover:underline"
                      >
                        {p.titel}
                      </Link>
                      <div className="text-xs text-gray-500">
                        {p.ressort?.naam ?? 'districtsbreed'}
                        {p.categorie && ` · ${p.categorie.naam}`}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          projectStatusKleur[p.status]
                        }`}
                      >
                        {statusLabel(p.status)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700">
                      <div>{srdFormat(budget)}</div>
                      {besteed > 0 && (
                        <div className="text-gray-500">{srdFormat(besteed)} besteed</div>
                      )}
                    </td>
                    <td className="px-4 py-3" style={{ minWidth: 110 }}>
                      {budget > 0 ? (
                        <>
                          <div className="h-2 w-full rounded-full bg-gray-200">
                            <div
                              className={`h-2 rounded-full ${
                                pct > 100 ? 'bg-red-500' : 'bg-sdp-groen'
                              }`}
                              style={{ width: `${Math.min(pct, 100)}%` }}
                            />
                          </div>
                          <div className="mt-1 text-xs text-gray-600">{pct}%</div>
                        </>
                      ) : (
                        <span className="text-xs text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-gray-700">
                      {p._count.updates}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function KPI({
  titel,
  waarde,
  ondertekst,
  accent,
}: {
  titel: string;
  waarde: string;
  ondertekst?: string;
  accent?: 'groen' | 'amber' | 'grijs';
}) {
  const kleur =
    accent === 'amber'
      ? 'text-amber-700'
      : accent === 'grijs'
      ? 'text-gray-700'
      : 'text-sdp-groen';
  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <p className="text-xs text-gray-500">{titel}</p>
      <p className={`mt-1 text-2xl font-bold ${kleur}`}>{waarde}</p>
      {ondertekst && <p className="mt-1 text-xs text-gray-500">{ondertekst}</p>}
    </div>
  );
}
