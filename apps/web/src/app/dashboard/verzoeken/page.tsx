'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDashboard } from '@/lib/dashboard-context';
import { api, type VerzoekLijstItem } from '@/lib/api';
import { verzoekStatusBadge } from './_status';

export default function VerzoekenLijstPage() {
  const { sessie, heeft, activeDistrictId } = useDashboard();
  const isDc = heeft('verzoek.read.district');
  const [lijst, setLijst] = useState<VerzoekLijstItem[]>([]);
  const [toon, setToon] = useState<'open' | 'alle'>('open');
  const [fout, setFout] = useState<string | null>(null);
  const [laden, setLaden] = useState(true);

  useEffect(() => {
    setLaden(true);
    setFout(null);
    const afgehandeld = toon === 'open' ? false : undefined;
    const p = isDc
      ? api.verzoekenInbox(activeDistrictId, sessie.accessToken, { afgehandeld })
      : api.verzoekenMijn(sessie.accessToken, { afgehandeld });
    p.then(setLijst)
      .catch((e) => setFout(e instanceof Error ? e.message : 'fout'))
      .finally(() => setLaden(false));
  }, [isDc, activeDistrictId, sessie.accessToken, toon]);

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-sdp-groen">
            {isDc ? 'Inkomende verzoeken' : 'Mijn verzoeken'}
          </h1>
          <p className="text-sm text-gray-600">
            {isDc
              ? 'Adviesverzoeken van externe diensten (GBB, SBB, TCT, EZ) aan dit district.'
              : 'Verzoeken die uw organisatie heeft ingediend bij districtscommissariaten.'}
          </p>
        </div>
        {!isDc && (
          <Link
            href="/dashboard/verzoeken/nieuw"
            className="rounded bg-sdp-groen px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
          >
            + Nieuw verzoek
          </Link>
        )}
      </header>

      <div className="flex gap-2">
        {(['open', 'alle'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setToon(t)}
            className={`rounded-full px-3 py-1 text-sm ${
              toon === t ? 'bg-sdp-groen text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            {t === 'open' ? 'Openstaand' : 'Alle'}
          </button>
        ))}
      </div>

      {fout && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">{fout}</div>
      )}
      {laden && <p className="text-sm text-gray-500">Laden…</p>}
      {!laden && lijst.length === 0 && (
        <p className="rounded-lg bg-white p-6 text-sm text-gray-500 shadow-sm">Geen verzoeken.</p>
      )}

      {lijst.length > 0 && (
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Referentie</th>
                <th className="px-4 py-3">Onderwerp</th>
                <th className="px-4 py-3">Zaaktype</th>
                {isDc && <th className="px-4 py-3">Dienst</th>}
                {!isDc && <th className="px-4 py-3">District</th>}
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Deadline</th>
              </tr>
            </thead>
            <tbody>
              {lijst.map((v) => {
                const badge = verzoekStatusBadge(v);
                return (
                  <tr key={v.id} className="border-b last:border-0 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <Link
                        href={`/dashboard/verzoeken/${v.id}`}
                        className="font-mono text-xs text-sdp-groen hover:underline"
                      >
                        {v.referentie}
                      </Link>
                    </td>
                    <td className="px-4 py-3">
                      <Link href={`/dashboard/verzoeken/${v.id}`} className="font-medium hover:underline">
                        {v.onderwerp}
                      </Link>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-700">{v.zaaktype.naam}</td>
                    {isDc && (
                      <td className="px-4 py-3 text-xs text-gray-700">
                        {v.bronOrganisatie?.korteNaam ?? v.bronOrganisatie?.code ?? '—'}
                      </td>
                    )}
                    {!isDc && <td className="px-4 py-3 text-xs text-gray-700">{v.district.naam}</td>}
                    <td className="px-4 py-3">
                      <span className={`rounded-full px-2 py-1 text-xs font-semibold ${badge.kleur}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-gray-600">
                      {v.deadline ? new Date(v.deadline).toLocaleDateString('nl-NL') : '—'}
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
