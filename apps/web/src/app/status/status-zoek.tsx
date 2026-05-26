'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

type StatusData = Awaited<ReturnType<typeof api.meldingStatus>>;

type Resultaat =
  | { soort: 'idle' }
  | { soort: 'bezig' }
  | { soort: 'gevonden'; data: StatusData }
  | { soort: 'niet-gevonden' }
  | { soort: 'fout'; bericht: string };

export function StatusZoek({ initieleQuery }: { initieleQuery?: string }) {
  const [nr, setNr] = useState(initieleQuery ?? '');
  const [res, setRes] = useState<Resultaat>({ soort: 'idle' });
  const [heropenOpen, setHeropenOpen] = useState(false);
  const [heropenReden, setHeropenReden] = useState('');
  const [heropenBezig, setHeropenBezig] = useState(false);
  const [heropenFout, setHeropenFout] = useState<string | null>(null);

  useEffect(() => {
    if (initieleQuery) {
      void zoek(initieleQuery);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function zoek(query: string) {
    if (!query.trim()) return;
    setRes({ soort: 'bezig' });
    setHeropenOpen(false);
    setHeropenFout(null);
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

  async function heropen() {
    if (res.soort !== 'gevonden') return;
    if (heropenReden.trim().length < 5) {
      setHeropenFout('Geef minimaal 5 tekens toelichting');
      return;
    }
    setHeropenBezig(true);
    setHeropenFout(null);
    try {
      await api.meldingHeropen(res.data.ticketNummer, { reden: heropenReden.trim() });
      setHeropenOpen(false);
      setHeropenReden('');
      await zoek(res.data.ticketNummer);
    } catch (e) {
      setHeropenFout(e instanceof Error ? e.message : 'Heropenen mislukt');
    } finally {
      setHeropenBezig(false);
    }
  }

  const heropenbaar =
    res.soort === 'gevonden' &&
    ['OPGELOST', 'GESLOTEN', 'BEVESTIGD_DOOR_BURGER'].includes(res.data.status);

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
            {res.data.bijlages.length > 0 && (
              <>
                <dt className="text-gray-500">Bijlages</dt>
                <dd>{res.data.bijlages.length} bestand(en)</dd>
              </>
            )}
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

          {heropenbaar && (
            <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4">
              {!heropenOpen ? (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-amber-900">
                    Is het probleem terug? U kunt deze melding heropenen.
                  </p>
                  <button
                    type="button"
                    onClick={() => setHeropenOpen(true)}
                    className="rounded bg-amber-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-amber-700"
                  >
                    Heropenen
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-sm font-medium text-amber-900">
                    Waarom heropent u deze melding?
                  </label>
                  <textarea
                    rows={3}
                    minLength={5}
                    maxLength={2000}
                    value={heropenReden}
                    onChange={(e) => setHeropenReden(e.target.value)}
                    className="w-full rounded border-amber-300 text-sm"
                    placeholder="Bv. drainage is opnieuw verstopt sinds afgelopen weekend."
                  />
                  {heropenFout && (
                    <p className="text-sm text-red-700">{heropenFout}</p>
                  )}
                  <div className="flex justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setHeropenOpen(false);
                        setHeropenReden('');
                        setHeropenFout(null);
                      }}
                      className="rounded px-3 py-1.5 text-sm text-amber-900 hover:bg-amber-100"
                    >
                      Annuleren
                    </button>
                    <button
                      type="button"
                      disabled={heropenBezig}
                      onClick={heropen}
                      className="rounded bg-amber-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
                    >
                      {heropenBezig ? 'Bezig…' : 'Heropen melding'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
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
    BEVESTIGD_DOOR_BURGER: 'bg-emerald-200 text-emerald-900',
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
