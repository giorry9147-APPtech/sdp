'use client';

import { useEffect, useState } from 'react';
import { useDashboard } from '@/lib/dashboard-context';
import { api, type CategorieTop, type DcDashboard } from '@/lib/api';
import { TrendGrafiek } from './_components/trend-grafiek';
import { MijnTakenTegel } from './_components/mijn-taken';
import { QuickActions } from './_components/quick-actions';
import { RecentGeslotenTegel } from './_components/recent-gesloten';

const TOP5_PERIODES = [
  { label: '30d', dagen: 30 },
  { label: '90d', dagen: 90 },
] as const;

export default function DashboardPage() {
  const { sessie, activeDistrictId, effectiefSubregioId, gekozenRessortId, activeSubregioNaam } =
    useDashboard();
  const [data, setData] = useState<DcDashboard>(null);
  const [fout, setFout] = useState<string | null>(null);

  // C2 — top-5 als eigen state zodat we periode kunnen togglen
  const [top5Dagen, setTop5Dagen] = useState<number>(30);
  const [top5, setTop5] = useState<CategorieTop>([]);

  useEffect(() => {
    if (!activeDistrictId) {
      setFout('Geen district aan uw rol gekoppeld.');
      return;
    }
    api
      .dcDashboard(activeDistrictId, sessie.accessToken, {
        subregioId: effectiefSubregioId,
        ressortId: gekozenRessortId,
      })
      .then(setData)
      .catch((e) => setFout(e instanceof Error ? e.message : 'fout'));
  }, [activeDistrictId, sessie.accessToken, effectiefSubregioId, gekozenRessortId]);

  useEffect(() => {
    if (!activeDistrictId) return;
    api
      .dashboardCategorieTop5(activeDistrictId, sessie.accessToken, {
        dagen: top5Dagen,
        subregioId: effectiefSubregioId,
        ressortId: gekozenRessortId,
      })
      .then(setTop5)
      .catch(() => setTop5([]));
  }, [activeDistrictId, sessie.accessToken, top5Dagen, effectiefSubregioId, gekozenRessortId]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-sdp-groen">Overzicht</h1>
        <p className="text-sm text-gray-600">
          Welkom, {sessie.user.naam}.
          {effectiefSubregioId && activeSubregioNaam && (
            <> · Filter: {activeSubregioNaam}</>
          )}
          {gekozenRessortId && <> · Ressort-filter actief</>}
        </p>
      </header>

      {fout && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {fout}
        </div>
      )}

      {data && (
        <>
          <div className="rounded-lg bg-white p-5 shadow-sm">
            <h2 className="text-lg font-semibold">{data.district.naam}</h2>
            <p className="text-sm text-gray-600">
              {data.district._count?.ressorten} ressorten · hoofdstad{' '}
              {data.district.hoofdstad ?? '—'}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <Tegel
              titel="Open meldingen"
              waarde={data.meldingen.open}
              accent={data.meldingen.crisis > 0 ? 'rood' : 'groen'}
              ondertekst={
                data.meldingen.crisis > 0
                  ? `${data.meldingen.crisis} crisis-melding(en)`
                  : 'geen crisis'
              }
              href="/dashboard/meldingen"
            />
            <Tegel
              titel="Open vergunningen"
              waarde={data.vergunningen.open}
              accent="groen"
              href="/dashboard/vergunningen"
            />
            <Tegel
              titel="Lopende projecten"
              waarde={data.projecten.lopend}
              accent="groen"
              href="/dashboard/projecten"
            />
            <Tegel
              titel="Plannen in behandeling"
              waarde={data.plannen.terGoedkeuring}
              accent="groen"
              ondertekst={`${data.plannen.concept} in concept`}
              href="/dashboard/plannen"
            />
          </div>

          <MijnTakenTegel />

          <TrendGrafiek />

          <div className="grid gap-4 lg:grid-cols-2">
            <section className="rounded-lg bg-white p-5 shadow-sm">
              <header className="flex flex-wrap items-baseline justify-between gap-2">
                <h2 className="font-semibold">Top categorieën meldingen</h2>
                <div className="flex gap-1">
                  {TOP5_PERIODES.map((p) => (
                    <button
                      key={p.dagen}
                      onClick={() => setTop5Dagen(p.dagen)}
                      className={`rounded px-2 py-1 text-xs font-medium ${
                        top5Dagen === p.dagen
                          ? 'bg-sdp-groen text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </header>
              {top5.length === 0 ? (
                <p className="mt-3 text-sm text-gray-500">
                  Nog geen meldingen in deze periode.
                </p>
              ) : (
                <ul className="mt-3 space-y-2 text-sm">
                  {top5.map((c, i) => (
                    <CategorieRegel
                      key={i}
                      naam={c.categorie}
                      aantal={c.aantal}
                      maxAantal={top5[0].aantal}
                    />
                  ))}
                </ul>
              )}
            </section>

            <RecentGeslotenTegel />
          </div>

          <QuickActions />
        </>
      )}
    </div>
  );
}

function CategorieRegel({
  naam,
  aantal,
  maxAantal,
}: {
  naam: string;
  aantal: number;
  maxAantal: number;
}) {
  const pct = maxAantal > 0 ? (aantal / maxAantal) * 100 : 0;
  return (
    <li>
      <div className="flex items-baseline justify-between">
        <span className="truncate">{naam}</span>
        <span className="font-mono font-semibold">{aantal}</span>
      </div>
      <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-gray-100">
        <div
          className="h-full rounded-full bg-sdp-groen"
          style={{ width: `${pct}%` }}
        />
      </div>
    </li>
  );
}

function Tegel({
  titel,
  waarde,
  accent,
  ondertekst,
  href,
}: {
  titel: string;
  waarde: number;
  accent: 'groen' | 'rood';
  ondertekst?: string;
  href?: string;
}) {
  const inner = (
    <div className="rounded-lg bg-white p-5 shadow-sm transition hover:shadow">
      <p className="text-sm text-gray-600">{titel}</p>
      <p
        className={`mt-1 text-3xl font-bold ${
          accent === 'rood' ? 'text-sdp-rood' : 'text-sdp-groen'
        }`}
      >
        {waarde}
      </p>
      {ondertekst && <p className="mt-1 text-xs text-gray-500">{ondertekst}</p>}
    </div>
  );
  if (href) {
    return (
      <a href={href} className="block">
        {inner}
      </a>
    );
  }
  return inner;
}
