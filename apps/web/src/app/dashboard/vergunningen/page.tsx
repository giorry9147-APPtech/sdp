'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDashboard } from '@/lib/dashboard-context';
import {
  api,
  type Vergunning,
  type VergunningStatus as Status,
} from '@/lib/api';
import { vergunningStatusKleur, statusLabel } from '@/lib/status-stijl';

const FILTERS: Array<{ label: string; status?: Status }> = [
  { label: 'Alles' },
  { label: 'Ingediend', status: 'INGEDIEND' },
  { label: 'In behandeling', status: 'IN_BEHANDELING' },
  { label: 'Extra info nodig', status: 'EXTRA_INFO_NODIG' },
  { label: 'Goedgekeurd', status: 'GOEDGEKEURD' },
  { label: 'Afgewezen', status: 'AFGEWEZEN' },
];

export default function VergunningenLijstPage() {
  const { sessie, activeDistrictId, effectiefSubregioId } = useDashboard();
  const [filter, setFilter] = useState<Status | undefined>('INGEDIEND');
  const [lijst, setLijst] = useState<Vergunning[]>([]);
  const [fout, setFout] = useState<string | null>(null);
  const [laden, setLaden] = useState(false);

  useEffect(() => {
    if (!activeDistrictId) return;
    setLaden(true);
    setFout(null);
    api
      .vergunningLijst(activeDistrictId, sessie.accessToken, {
        status: filter,
        subregioId: effectiefSubregioId,
      })
      .then(setLijst)
      .catch((e) => setFout(e instanceof Error ? e.message : 'fout'))
      .finally(() => setLaden(false));
  }, [filter, activeDistrictId, sessie.accessToken, effectiefSubregioId]);

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <h1 className="text-2xl font-bold text-sdp-groen">Vergunningen</h1>
        <p className="text-sm text-gray-500">{lijst.length} resultaten</p>
      </header>

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
          Geen vergunningen in deze categorie.
        </p>
      )}

      {lijst.length > 0 && (
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Referentie</th>
                <th className="px-4 py-3">Titel</th>
                <th className="px-4 py-3">Soort</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Ingediend</th>
              </tr>
            </thead>
            <tbody>
              {lijst.map((v) => (
                <tr key={v.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/vergunningen/${v.id}`}
                      className="font-mono text-sdp-groen underline-offset-2 hover:underline"
                    >
                      {v.referentie}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/vergunningen/${v.id}`}
                      className="font-medium hover:underline"
                    >
                      {v.titel}
                    </Link>
                    {v.aanvragerNaam && (
                      <div className="text-xs text-gray-500">{v.aanvragerNaam}</div>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-700">{v.categorie.naam}</td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        vergunningStatusKleur[v.status]
                      }`}
                    >
                      {statusLabel(v.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">
                    {v.ingediendOp
                      ? new Date(v.ingediendOp).toLocaleDateString('nl-NL')
                      : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
