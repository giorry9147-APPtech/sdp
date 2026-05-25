'use client';

import { useEffect, useState } from 'react';
import { api, type VergunningStatusPubliek } from '@/lib/api';
import { vergunningStatusKleur, statusLabel } from '@/lib/status-stijl';

type Resultaat =
  | { soort: 'idle' }
  | { soort: 'bezig' }
  | { soort: 'gevonden'; data: VergunningStatusPubliek }
  | { soort: 'niet-gevonden' }
  | { soort: 'fout'; bericht: string };

export function StatusZoek({ initieleQuery }: { initieleQuery?: string }) {
  const [ref, setRef] = useState(initieleQuery ?? '');
  const [res, setRes] = useState<Resultaat>({ soort: 'idle' });

  useEffect(() => {
    if (initieleQuery) {
      void zoek(initieleQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function zoek(q: string) {
    if (!q.trim()) return;
    setRes({ soort: 'bezig' });
    try {
      const data = await api.vergunningStatus(q.trim());
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
          void zoek(ref);
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={ref}
          onChange={(e) => setRef(e.target.value)}
          placeholder="VRG-2026-WAN-XXXXXX"
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
          Referentienummer niet gevonden. Controleer de spelling.
        </p>
      )}
      {res.soort === 'fout' && (
        <p className="rounded border border-red-300 bg-red-50 p-3 text-red-800">
          Fout: {res.bericht}
        </p>
      )}

      {res.soort === 'gevonden' && (
        <article className="rounded-lg bg-white p-6 shadow-sm">
          <div className="flex items-baseline justify-between gap-3">
            <h2 className="text-xl font-bold">{res.data.titel}</h2>
            <span
              className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
                vergunningStatusKleur[res.data.status] ?? 'bg-gray-100 text-gray-700'
              }`}
            >
              {statusLabel(res.data.status)}
            </span>
          </div>
          <p className="mt-1 font-mono text-sm text-gray-500">
            {res.data.referentie}
          </p>

          <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
            <dt className="text-gray-500">District</dt>
            <dd>{res.data.district.naam}</dd>
            <dt className="text-gray-500">Soort</dt>
            <dd>{res.data.categorie.naam}</dd>
            {res.data.locatieOmschrijving && (
              <>
                <dt className="text-gray-500">Locatie</dt>
                <dd>{res.data.locatieOmschrijving}</dd>
              </>
            )}
            {res.data.ingediendOp && (
              <>
                <dt className="text-gray-500">Ingediend</dt>
                <dd>{new Date(res.data.ingediendOp).toLocaleString('nl-NL')}</dd>
              </>
            )}
            {res.data.beslotenOp && (
              <>
                <dt className="text-gray-500">Beslist</dt>
                <dd>{new Date(res.data.beslotenOp).toLocaleString('nl-NL')}</dd>
              </>
            )}
          </dl>

          {res.data.besluit && (
            <div
              className={`mt-4 rounded-lg border p-4 text-sm ${
                res.data.status === 'GOEDGEKEURD'
                  ? 'border-emerald-300 bg-emerald-50 text-emerald-900'
                  : 'border-red-300 bg-red-50 text-red-900'
              }`}
            >
              <strong>Besluit:</strong> {res.data.besluit}
            </div>
          )}

          <h3 className="mt-6 font-semibold">Tijdlijn</h3>
          <ol className="mt-2 space-y-2 border-l-2 border-sdp-groen pl-4">
            {res.data.events.map((ev, i) => (
              <li key={i} className="relative">
                <span className="absolute -left-[1.4rem] mt-1.5 h-2.5 w-2.5 rounded-full bg-sdp-groen" />
                <div className="text-sm font-medium">{statusLabel(ev.type)}</div>
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
