'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDashboard } from '@/lib/dashboard-context';
import { api, type MijnTaken } from '@/lib/api';
import { meldingStatusKleur, statusLabel } from '@/lib/status-stijl';

export function MijnTakenTegel() {
  const { sessie } = useDashboard();
  const [data, setData] = useState<MijnTaken | null>(null);
  const [fout, setFout] = useState<string | null>(null);

  useEffect(() => {
    api
      .dashboardMijnTaken(sessie.accessToken)
      .then(setData)
      .catch((e) => setFout(e instanceof Error ? e.message : 'fout'));
  }, [sessie.accessToken]);

  if (fout) {
    return (
      <section className="rounded-lg bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Mijn taken</h2>
        <p className="mt-2 text-xs text-red-700">{fout}</p>
      </section>
    );
  }

  if (!data) {
    return (
      <section className="rounded-lg bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Mijn taken</h2>
        <p className="mt-2 text-sm text-gray-500">Laden…</p>
      </section>
    );
  }

  return (
    <section className="rounded-lg bg-white p-5 shadow-sm">
      <header className="flex items-baseline justify-between">
        <h2 className="font-semibold">Mijn taken</h2>
        <span className="text-xs text-gray-500">{data.totaal} actief</span>
      </header>

      {data.totaal === 0 && (
        <p className="mt-3 text-sm text-gray-500">
          Geen openstaande taken. ✓
        </p>
      )}

      {data.meldingen.length > 0 && (
        <Groep titel="Meldingen aan mij toegewezen">
          {data.meldingen.map((m) => (
            <Link
              key={m.id}
              href={`/dashboard/meldingen/${m.id}`}
              className="flex items-baseline justify-between gap-2 rounded px-2 py-1.5 text-sm hover:bg-gray-50"
            >
              <span className="truncate">
                <span className="font-mono text-[10px] text-gray-500">{m.ticketNummer}</span>{' '}
                {m.titel}
              </span>
              <span className="flex shrink-0 items-center gap-1.5">
                {(m.urgentie === 'CRISIS' || m.urgentie === 'HOOG') && (
                  <span
                    className={`text-xs ${
                      m.urgentie === 'CRISIS' ? 'text-red-700 font-bold' : 'text-amber-700 font-semibold'
                    }`}
                  >
                    {m.urgentie}
                  </span>
                )}
                <span
                  className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                    meldingStatusKleur[m.status] ?? 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {statusLabel(m.status)}
                </span>
              </span>
            </Link>
          ))}
        </Groep>
      )}

      {data.vergunningen.length > 0 && (
        <Groep titel="Vergunningen — wachten op behandeling">
          {data.vergunningen.map((v) => (
            <Link
              key={v.id}
              href={`/dashboard/vergunningen/${v.id}`}
              className="flex items-baseline justify-between gap-2 rounded px-2 py-1.5 text-sm hover:bg-gray-50"
            >
              <span className="truncate">
                <span className="font-mono text-[10px] text-gray-500">{v.referentie}</span>{' '}
                {v.titel}
              </span>
              <span className="text-xs text-gray-500">{v.status}</span>
            </Link>
          ))}
        </Groep>
      )}

      {data.districtsplannen.length > 0 && (
        <Groep titel="Districtsplannen — wachten op uw goedkeuring">
          {data.districtsplannen.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/plannen/district/${p.id}`}
              className="flex items-baseline justify-between gap-2 rounded px-2 py-1.5 text-sm hover:bg-gray-50"
            >
              <span className="truncate">
                {p.titel} ({p.jaar})
              </span>
              <span className="text-xs text-gray-500">{p.district.naam}</span>
            </Link>
          ))}
        </Groep>
      )}

      {data.uitgaven.length > 0 && (
        <Groep titel="Uitgaven — 4-ogen goedkeuring nodig">
          {data.uitgaven.map((u) => (
            <Link
              key={u.id}
              href={u.fonds ? `/dashboard/financien/${u.fonds.id}` : '/dashboard/financien'}
              className="flex items-baseline justify-between gap-2 rounded px-2 py-1.5 text-sm hover:bg-gray-50"
            >
              <span className="truncate">{u.beschrijving}</span>
              <span className="font-mono text-xs text-gray-700">
                SRD {Number(u.bedrag).toLocaleString('nl-NL')}
              </span>
            </Link>
          ))}
        </Groep>
      )}

      {data.projecten.length > 0 && (
        <Groep titel="Projecten met vertraging">
          {data.projecten.map((p) => (
            <Link
              key={p.id}
              href={`/dashboard/projecten/${p.id}`}
              className="flex items-baseline justify-between gap-2 rounded px-2 py-1.5 text-sm hover:bg-gray-50"
            >
              <span className="truncate">
                <span className="font-mono text-[10px] text-gray-500">{p.referentie}</span>{' '}
                {p.titel}
              </span>
              <span className="text-xs text-amber-700 font-semibold">VERTRAAGD</span>
            </Link>
          ))}
        </Groep>
      )}
    </section>
  );
}

function Groep({ titel, children }: { titel: string; children: React.ReactNode }) {
  return (
    <div className="mt-3">
      <h3 className="text-xs font-semibold uppercase text-gray-500">{titel}</h3>
      <div className="mt-1 space-y-0.5">{children}</div>
    </div>
  );
}
