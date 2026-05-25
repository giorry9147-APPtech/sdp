'use client';

import type { Prioriteit } from '@/lib/api';

const urgentieKleur: Record<string, string> = {
  LAAG: 'bg-gray-100 text-gray-700',
  MIDDEL: 'bg-blue-100 text-blue-800',
  HOOG: 'bg-amber-100 text-amber-800',
  CRISIS: 'bg-red-100 text-red-800',
};

/** Read-only weergave van prioriteiten in een plan. */
export function PrioriteitLijst({ prioriteiten }: { prioriteiten: Prioriteit[] }) {
  if (prioriteiten.length === 0) {
    return <p className="text-sm text-gray-500">Geen prioriteiten.</p>;
  }
  return (
    <ol className="space-y-3">
      {prioriteiten.map((p, i) => (
        <li
          key={p.id ?? i}
          className="rounded-lg border border-gray-200 bg-white p-4"
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-baseline gap-2">
              <span className="rounded-full bg-sdp-groen px-2 py-0.5 text-xs font-semibold text-white">
                #{i + 1}
              </span>
              <h3 className="font-semibold">{p.titel}</h3>
            </div>
            {p.urgentie && (
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                  urgentieKleur[p.urgentie] ?? ''
                }`}
              >
                {p.urgentie}
              </span>
            )}
          </div>
          <p className="mt-2 whitespace-pre-wrap text-sm text-gray-700">
            {p.onderbouwing}
          </p>
          {(p.kostenraming || p.doelgroep || p.verwachteImpact) && (
            <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-1 text-xs sm:grid-cols-3">
              {p.kostenraming != null && (
                <>
                  <dt className="text-gray-500">Kostenraming</dt>
                  <dd className="sm:col-span-2">
                    SRD {Number(p.kostenraming).toLocaleString('nl-NL')}
                  </dd>
                </>
              )}
              {p.doelgroep && (
                <>
                  <dt className="text-gray-500">Doelgroep</dt>
                  <dd className="sm:col-span-2">{p.doelgroep}</dd>
                </>
              )}
              {p.verwachteImpact && (
                <>
                  <dt className="text-gray-500">Verwachte impact</dt>
                  <dd className="sm:col-span-2">{p.verwachteImpact}</dd>
                </>
              )}
            </dl>
          )}
        </li>
      ))}
    </ol>
  );
}
