'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useDashboard } from '@/lib/dashboard-context';
import { api } from '@/lib/api';
import { meldingStatusKleur, statusLabel } from '@/lib/status-stijl';

const FILTERS = [
  { label: 'Alles' },
  { label: 'Nieuw', status: 'NIEUW' },
  { label: 'In behandeling', status: 'IN_BEHANDELING' },
  { label: 'Extra info', status: 'EXTRA_INFO_NODIG' },
  { label: 'Opgelost', status: 'OPGELOST' },
];

const urgentieKleur: Record<string, string> = {
  LAAG: 'text-gray-600',
  MIDDEL: 'text-blue-700',
  HOOG: 'text-amber-700 font-bold',
  CRISIS: 'text-red-700 font-bold',
};

export default function MeldingenLijstPage() {
  const { sessie, activeDistrictId, effectiefSubregioId, gekozenRessortId } = useDashboard();
  const [filter, setFilter] = useState<string | undefined>();
  const [zoek, setZoek] = useState('');
  const [meldingen, setMeldingen] = useState<Awaited<ReturnType<typeof api.meldingenLijst>>>([]);
  const [laden, setLaden] = useState(true);
  const [fout, setFout] = useState<string | null>(null);

  useEffect(() => {
    if (!activeDistrictId) return;
    setLaden(true);
    setFout(null);
    api
      .meldingenLijst(activeDistrictId, sessie.accessToken, {
        status: filter,
        subregioId: effectiefSubregioId,
        ressortId: gekozenRessortId,
      })
      .then(setMeldingen)
      .catch((e) => setFout(e instanceof Error ? e.message : 'fout'))
      .finally(() => setLaden(false));
  }, [filter, activeDistrictId, sessie.accessToken, effectiefSubregioId, gekozenRessortId]);

  const gefilterd = useMemo(() => {
    if (!zoek) return meldingen;
    const q = zoek.toLowerCase();
    return meldingen.filter(
      (m) =>
        m.titel.toLowerCase().includes(q) ||
        m.ticketNummer.toLowerCase().includes(q) ||
        (m.locatieOmschrijving?.toLowerCase().includes(q) ?? false) ||
        (m.melderNaam?.toLowerCase().includes(q) ?? false),
    );
  }, [meldingen, zoek]);

  // KPI's voor de gefilterde set
  const stats = useMemo(() => {
    const crisis = meldingen.filter((m) => m.urgentie === 'CRISIS').length;
    const hoog = meldingen.filter((m) => m.urgentie === 'HOOG').length;
    const open = meldingen.filter((m) =>
      ['NIEUW', 'IN_BEHANDELING', 'EXTRA_INFO_NODIG'].includes(m.status),
    ).length;
    return { crisis, hoog, open };
  }, [meldingen]);

  return (
    <div className="space-y-4">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-sdp-groen">Meldingen</h1>
          <p className="text-sm text-gray-600">
            Burgermeldingen openbare ruimte — drainage, wegen, vuilophaal,
            verlichting, veiligheid. Open via ticketnummer of titel.
          </p>
        </div>
      </header>

      <div className="grid gap-3 sm:grid-cols-4">
        <KPI titel="Totaal" waarde={meldingen.length} />
        <KPI titel="Open" waarde={stats.open} accent="groen" />
        <KPI titel="Urgentie HOOG" waarde={stats.hoog} accent="amber" />
        <KPI titel="Crisis" waarde={stats.crisis} accent={stats.crisis > 0 ? 'rood' : 'grijs'} />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <input
          type="search"
          value={zoek}
          onChange={(e) => setZoek(e.target.value)}
          placeholder="Zoek op titel, ticket, locatie of melder…"
          className="flex-1 rounded border-gray-300 text-sm sm:max-w-md"
        />
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
      </div>

      {fout && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {fout}
        </div>
      )}
      {laden && <p className="text-sm text-gray-500">Laden…</p>}

      {!laden && gefilterd.length === 0 && (
        <p className="rounded-lg bg-white p-6 text-sm text-gray-500 shadow-sm">
          Geen meldingen gevonden.
        </p>
      )}

      {gefilterd.length > 0 && (
        <div className="overflow-hidden rounded-lg bg-white shadow-sm">
          <table className="w-full text-sm">
            <thead className="border-b bg-gray-50 text-left text-xs uppercase text-gray-500">
              <tr>
                <th className="px-4 py-3">Ticket</th>
                <th className="px-4 py-3">Titel</th>
                <th className="px-4 py-3">Categorie</th>
                <th className="px-4 py-3">Urgentie</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Ontvangen</th>
              </tr>
            </thead>
            <tbody>
              {gefilterd.map((m) => (
                <tr key={m.id} className="border-b last:border-0 hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/meldingen/${m.id}`}
                      className="font-mono text-xs text-sdp-groen hover:underline"
                    >
                      {m.ticketNummer}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/dashboard/meldingen/${m.id}`}
                      className="font-medium hover:underline"
                    >
                      {m.titel}
                    </Link>
                    <div className="text-xs text-gray-500">
                      {m.ressort?.naam ?? '—'}
                      {m.locatieOmschrijving && ` · ${m.locatieOmschrijving}`}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-700">
                    {m.categorie?.naam ?? '—'}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`text-xs ${urgentieKleur[m.urgentie]}`}>
                      {m.urgentie}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-semibold ${
                        meldingStatusKleur[m.status] ?? ''
                      }`}
                    >
                      {statusLabel(m.status)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-600">
                    {new Date(m.createdAt).toLocaleDateString('nl-NL')}
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

function KPI({
  titel,
  waarde,
  accent,
}: {
  titel: string;
  waarde: number;
  accent?: 'groen' | 'rood' | 'amber' | 'grijs';
}) {
  const kleur =
    accent === 'rood'
      ? 'text-sdp-rood'
      : accent === 'amber'
      ? 'text-amber-700'
      : accent === 'grijs'
      ? 'text-gray-700'
      : 'text-sdp-groen';
  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <p className="text-xs text-gray-500">{titel}</p>
      <p className={`mt-1 text-2xl font-bold ${kleur}`}>{waarde}</p>
    </div>
  );
}
