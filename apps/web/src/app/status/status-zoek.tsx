'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type Resultaat =
  | { soort: 'idle' }
  | { soort: 'bezig' }
  | { soort: 'gevonden'; data: Awaited<ReturnType<typeof api.meldingStatus>> }
  | { soort: 'niet-gevonden' }
  | { soort: 'fout'; bericht: string };

export function StatusZoek({ initieleQuery }: { initieleQuery?: string }) {
  const [nr, setNr] = useState(initieleQuery ?? '');
  const [res, setRes] = useState<Resultaat>({ soort: 'idle' });

  useEffect(() => {
    if (initieleQuery) {
      void zoek(initieleQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function zoek(query: string) {
    if (!query.trim()) return;
    setRes({ soort: 'bezig' });
    try {
      const data = await api.meldingStatus(query.trim().toUpperCase());
      setRes({ soort: 'gevonden', data });
    } catch (e) {
      if (e instanceof Error && e.message.includes('404')) {
        setRes({ soort: 'niet-gevonden' });
      } else {
        setRes({ soort: 'fout', bericht: e instanceof Error ? e.message : 'fout' });
      }
    }
  }

  return (
    <div className="mt-6 space-y-6">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void zoek(nr);
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={nr}
          onChange={(e) => setNr(e.target.value)}
          placeholder="MLD-2026-WAN-XXXXXXXX"
          className="flex-1 rounded border-gray-300 font-mono"
        />
        <button
          type="submit"
          className="rounded-lg bg-sdp-groen px-5 py-2 font-semibold text-white shadow hover:bg-emerald-700"
        >
          Zoek
        </button>
      </form>

      {res.soort === 'bezig' && <p className="text-gray-600">Zoeken…</p>}
      {res.soort === 'niet-gevonden' && (
        <p className="rounded border border-amber-200 bg-amber-50 p-3 text-amber-800">
          Ticketnummer niet gevonden. Controleer de spelling.
        </p>
      )}
      {res.soort === 'fout' && (
        <p className="rounded border border-red-300 bg-red-50 p-3 text-red-800">
          Fout: {res.bericht}
        </p>
      )}

      {res.soort === 'gevonden' && (
        <article className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-baseline justify-between">
            <h2 className="text-xl font-bold">{res.data.titel}</h2>
            <StatusBadge status={res.data.status} />
          </div>
          <p className="mt-1 font-mono text-sm text-gray-500">
            {res.data.ticketNummer}
          </p>
          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <dt className="text-gray-500">District</dt>
            <dd>{res.data.district.naam}</dd>
            {res.data.ressort && (
              <>
                <dt className="text-gray-500">Ressort</dt>
                <dd>{res.data.ressort.naam}</dd>
              </>
            )}
            <dt className="text-gray-500">Categorie</dt>
            <dd>{res.data.categorie.naam}</dd>
            <dt className="text-gray-500">Ingediend</dt>
            <dd>{new Date(res.data.createdAt).toLocaleString('nl-NL')}</dd>
          </dl>

          <h3 className="mt-6 font-semibold">Tijdlijn</h3>
          <ol className="mt-2 space-y-2 border-l-2 border-sdp-groen pl-4">
            {res.data.events.map((ev, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[1.4rem] mt-1.5 h-2.5 w-2.5 rounded-full bg-sdp-groen" />
                <div className="text-sm font-medium">{ev.type}</div>
                <div className="text-xs text-gray-500">
                  {new Date(ev.createdAt).toLocaleString('nl-NL')}
                </div>
              </li>
            ))}
          </ol>
        </article>
      )}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    NIEUW: 'bg-blue-100 text-blue-800',
    IN_BEHANDELING: 'bg-amber-100 text-amber-800',
    EXTRA_INFO_NODIG: 'bg-orange-100 text-orange-800',
    OPGELOST: 'bg-emerald-100 text-emerald-800',
    GESLOTEN: 'bg-gray-200 text-gray-700',
    HEROPEND: 'bg-red-100 text-red-800',
  };
  return (
    <span
      className={`rounded-full px-3 py-1 text-xs font-semibold ${
        colors[status] ?? 'bg-gray-100 text-gray-700'
      }`}
    >
      {status}
    </span>
  );
}
