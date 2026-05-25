'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDashboard } from '@/lib/dashboard-context';
import {
  api,
  type DistrictsplanLijst,
  type RessortplanLijst,
} from '@/lib/api';
import { planStatusKleur, statusLabel } from '@/lib/status-stijl';

export default function PlannenOverzichtPage() {
  const { sessie, activeDistrictId, activeRessortId, heeft } = useDashboard();
  const [jaar, setJaar] = useState(new Date().getFullYear());
  const [ressortplannen, setRessortplannen] = useState<RessortplanLijst[]>([]);
  const [districtsplannen, setDistrictsplannen] = useState<DistrictsplanLijst[]>([]);
  const [fout, setFout] = useState<string | null>(null);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    setLaden(true);
    setFout(null);
    Promise.all([
      api.ressortplanLijst(sessie.accessToken, {
        jaar,
        ressortId: activeRessortId,
      }),
      activeDistrictId
        ? api.districtsplanLijst(sessie.accessToken, {
            jaar,
            districtId: activeDistrictId,
          })
        : Promise.resolve([] as DistrictsplanLijst[]),
    ])
      .then(([rp, dp]) => {
        setRessortplannen(rp);
        setDistrictsplannen(dp);
      })
      .catch((e) => setFout(e instanceof Error ? e.message : 'fout'))
      .finally(() => setLaden(false));
  }, [sessie.accessToken, jaar, activeRessortId, activeDistrictId]);

  const kanRessortplanMaken = heeft('ressortplan.create');
  const kanDistrictsplanMaken = heeft('districtsplan.create');

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-sdp-groen">Plannen</h1>
          <p className="text-sm text-gray-600">
            WRO-cyclus: <em>ressortplan → districtsplan</em>. Ressortraden
            stellen prioriteiten vast; de DC aggregeert deze tot een
            districtsplan ter goedkeuring door DR en RO.
          </p>
        </div>
        <label className="text-sm">
          <span className="mr-2 text-gray-600">Jaar</span>
          <select
            value={jaar}
            onChange={(e) => setJaar(Number(e.target.value))}
            className="rounded border-gray-300"
          >
            {[2024, 2025, 2026, 2027, 2028, 2029, 2030].map((j) => (
              <option key={j} value={j}>
                {j}
              </option>
            ))}
          </select>
        </label>
      </header>

      {fout && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {fout}
        </div>
      )}

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Ressortplannen</h2>
          {kanRessortplanMaken && (
            <Link
              href="/dashboard/plannen/ressort/nieuw"
              className="rounded bg-sdp-groen px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-emerald-700"
            >
              + Nieuw ressortplan
            </Link>
          )}
        </div>
        <PlanTabel
          plannen={ressortplannen.map((p) => ({
            id: p.id,
            titel: p.titel,
            versie: p.versie,
            status: p.status,
            naam: p.ressort.naam,
            aantal: p._count.prioriteiten,
            href: `/dashboard/plannen/ressort/${p.id}`,
          }))}
          leeg="Geen ressortplannen voor dit jaar."
          laden={laden}
        />
      </section>

      <section>
        <div className="mb-3 flex items-baseline justify-between">
          <h2 className="text-lg font-semibold">Districtsplan</h2>
          {kanDistrictsplanMaken && (
            <Link
              href="/dashboard/plannen/district/nieuw"
              className="rounded bg-sdp-groen px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-emerald-700"
            >
              + Nieuw districtsplan
            </Link>
          )}
        </div>
        <PlanTabel
          plannen={districtsplannen.map((p) => ({
            id: p.id,
            titel: p.titel,
            versie: p.versie,
            status: p.status,
            naam: p.district.naam,
            aantal: p._count.prioriteiten,
            href: `/dashboard/plannen/district/${p.id}`,
          }))}
          leeg="Geen districtsplan voor dit jaar."
          laden={laden}
        />
      </section>

      <aside className="rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
        <strong>WRO-flow (Wet Regionale Organen S.B. 1989 nr. 44):</strong>
        <ol className="ml-5 mt-2 list-decimal space-y-1">
          <li>Ressortcoördinator stelt ressortplan op met prioriteiten</li>
          <li>Plan wordt ingediend ter goedkeuring Ressortraad (RR)</li>
          <li>Na goedkeuring vormt het plan input voor districtsplan</li>
          <li>DC aggregeert alle goedgekeurde ressortplannen → districtsplan</li>
          <li>Districtsraad (DR) → DC → Directeur Decentralisatie (RO) keuren goed</li>
        </ol>
      </aside>
    </div>
  );
}

type Plan = {
  id: number;
  titel: string;
  versie: number;
  status: string;
  naam: string;
  aantal: number;
  href: string;
};

function PlanTabel({
  plannen,
  leeg,
  laden,
}: {
  plannen: Plan[];
  leeg: string;
  laden: boolean;
}) {
  if (laden && plannen.length === 0)
    return <p className="text-sm text-gray-500">Laden…</p>;
  if (plannen.length === 0)
    return (
      <p className="rounded-lg bg-white p-5 text-sm text-gray-500 shadow-sm">
        {leeg}
      </p>
    );

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow-sm">
      <table className="w-full text-sm">
        <thead className="border-b bg-gray-50 text-left text-xs uppercase text-gray-500">
          <tr>
            <th className="px-4 py-3">Naam</th>
            <th className="px-4 py-3">Titel</th>
            <th className="px-4 py-3">Versie</th>
            <th className="px-4 py-3">Prioriteiten</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody>
          {plannen.map((p) => (
            <tr key={p.id} className="border-b last:border-0 hover:bg-gray-50">
              <td className="px-4 py-3">{p.naam}</td>
              <td className="px-4 py-3">
                <Link
                  href={p.href}
                  className="font-medium text-sdp-groen hover:underline"
                >
                  {p.titel}
                </Link>
              </td>
              <td className="px-4 py-3 font-mono text-gray-700">v{p.versie}</td>
              <td className="px-4 py-3 text-gray-700">{p.aantal}</td>
              <td className="px-4 py-3">
                <span
                  className={`rounded-full px-2 py-1 text-xs font-semibold ${
                    planStatusKleur[p.status] ?? 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {statusLabel(p.status)}
                </span>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
