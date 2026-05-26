'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDashboard } from '@/lib/dashboard-context';
import { api, type RecentGesloten, type RecentGeslotenItem } from '@/lib/api';

/**
 * C5 — Recent gesloten dossiers: laatste 7 dagen aan afgesloten
 * meldingen + besloten vergunningen + afgeronde projecten. Geeft DC
 * een controlemoment ("wat is er afgelopen week afgesloten — klopt dat?").
 */
export function RecentGeslotenTegel() {
  const { sessie, activeDistrictId, effectiefSubregioId, gekozenRessortId } = useDashboard();
  const [data, setData] = useState<RecentGesloten | null>(null);
  const [dagen, setDagen] = useState<7 | 30>(7);

  useEffect(() => {
    if (!activeDistrictId) return;
    api
      .dashboardRecentGesloten(activeDistrictId, sessie.accessToken, {
        dagen,
        subregioId: effectiefSubregioId,
        ressortId: gekozenRessortId,
      })
      .then(setData)
      .catch(() => setData(null));
  }, [activeDistrictId, sessie.accessToken, dagen, effectiefSubregioId, gekozenRessortId]);

  const totaal =
    (data?.meldingen.length ?? 0) +
    (data?.vergunningen.length ?? 0) +
    (data?.projecten.length ?? 0);

  return (
    <section className="rounded-lg bg-white p-5 shadow-sm">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <h2 className="font-semibold">Recent afgesloten</h2>
        <div className="flex gap-1">
          {([7, 30] as const).map((d) => (
            <button
              key={d}
              onClick={() => setDagen(d)}
              className={`rounded px-2 py-1 text-xs font-medium ${
                dagen === d
                  ? 'bg-sdp-groen text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {d}d
            </button>
          ))}
        </div>
      </header>
      <p className="mt-1 text-xs text-gray-500">{totaal} dossier(s) afgesloten</p>

      {data && totaal === 0 && (
        <p className="mt-3 text-sm text-gray-500">Niets afgesloten in deze periode.</p>
      )}

      {data?.meldingen.length ? (
        <Sectie titel="Meldingen">
          {data.meldingen.map((m) => (
            <Regel key={`m-${m.id}`} href={`/dashboard/meldingen/${m.id}`} item={m} />
          ))}
        </Sectie>
      ) : null}

      {data?.vergunningen.length ? (
        <Sectie titel="Vergunningen">
          {data.vergunningen.map((v) => (
            <Regel key={`v-${v.id}`} href={`/dashboard/vergunningen/${v.id}`} item={v} />
          ))}
        </Sectie>
      ) : null}

      {data?.projecten.length ? (
        <Sectie titel="Projecten">
          {data.projecten.map((p) => (
            <Regel key={`p-${p.id}`} href={`/dashboard/projecten/${p.id}`} item={p} />
          ))}
        </Sectie>
      ) : null}
    </section>
  );
}

function Sectie({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <h3 className="text-xs font-semibold uppercase text-gray-500">{titel}</h3>
      <div className="mt-1 space-y-0.5">{children}</div>
    </div>
  );
}

function Regel({ href, item }: { href: string; item: RecentGeslotenItem }) {
  return (
    <Link
      href={href}
      className="flex items-baseline justify-between gap-2 rounded px-2 py-1.5 text-sm hover:bg-gray-50"
    >
      <span className="truncate">
        <span className="font-mono text-[10px] text-gray-500">{item.kenmerk}</span>{' '}
        {item.titel}
        {item.categorie && (
          <span className="ml-1 text-xs text-gray-500">· {item.categorie}</span>
        )}
      </span>
      <span className="shrink-0 text-xs text-gray-500">
        {item.afgesloten
          ? new Date(item.afgesloten).toLocaleDateString('nl-NL', {
              day: '2-digit',
              month: '2-digit',
            })
          : '—'}
      </span>
    </Link>
  );
}
