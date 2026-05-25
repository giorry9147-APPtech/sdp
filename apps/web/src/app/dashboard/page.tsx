'use client';

import { useEffect, useState } from 'react';
import { useDashboard } from '@/lib/dashboard-context';
import { api, type DcDashboard } from '@/lib/api';

export default function DashboardPage() {
  const { sessie, activeDistrictId } = useDashboard();
  const [data, setData] = useState<DcDashboard>(null);
  const [fout, setFout] = useState<string | null>(null);

  useEffect(() => {
    if (!activeDistrictId) {
      setFout('Geen district aan uw rol gekoppeld.');
      return;
    }
    api
      .dcDashboard(activeDistrictId, sessie.accessToken)
      .then(setData)
      .catch((e) => setFout(e instanceof Error ? e.message : 'fout'));
  }, [activeDistrictId, sessie.accessToken]);

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-2xl font-bold text-sdp-groen">Overzicht</h1>
        <p className="text-sm text-gray-600">
          Welkom, {sessie.user.naam}.
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

          <section className="rounded-lg bg-white p-5 shadow-sm">
            <h2 className="font-semibold">Top categorieën meldingen — laatste 30 dagen</h2>
            {data.meldingen.topCategorieen30dagen.length === 0 ? (
              <p className="mt-2 text-sm text-gray-500">Nog geen meldingen</p>
            ) : (
              <ul className="mt-3 space-y-1.5 text-sm">
                {data.meldingen.topCategorieen30dagen.map((c, i) => (
                  <li key={i} className="flex items-baseline justify-between">
                    <span>{c.categorie}</span>
                    <span className="font-mono font-semibold">{c.aantal}</span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </div>
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
