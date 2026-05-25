'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDashboard } from '@/lib/dashboard-context';
import { api } from '@/lib/api';
import { meldingStatusKleur, statusLabel } from '@/lib/status-stijl';

type MeldingDetail = Awaited<ReturnType<typeof api.meldingDetail>>;

export default function MeldingDetailPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const { sessie, heeft } = useDashboard();
  const [m, setM] = useState<MeldingDetail | null>(null);
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);

  const [nieuwStatus, setNieuwStatus] = useState('');
  const [opmerking, setOpmerking] = useState('');

  function herlaad() {
    api
      .meldingDetail(id, sessie.accessToken)
      .then((d) => {
        setM(d);
        setFout(null);
      })
      .catch((e) => setFout(e instanceof Error ? e.message : 'fout'));
  }

  useEffect(herlaad, [id, sessie.accessToken]);

  async function wijzigStatus(e: React.FormEvent) {
    e.preventDefault();
    if (!nieuwStatus) return;
    setBezig(true);
    try {
      await api.meldingStatusWijzigen(
        id,
        { status: nieuwStatus, opmerking: opmerking || undefined },
        sessie.accessToken,
      );
      setNieuwStatus('');
      setOpmerking('');
      herlaad();
    } catch (e) {
      setFout(e instanceof Error ? e.message : 'fout');
    } finally {
      setBezig(false);
    }
  }

  if (!m) {
    return (
      <div>
        {fout ? (
          <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            {fout}
          </div>
        ) : (
          <p className="text-gray-500">Laden…</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <nav className="text-sm">
        <Link href="/dashboard/meldingen" className="text-sdp-groen hover:underline">
          ← Meldingen
        </Link>
      </nav>

      <header className="rounded-lg bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="text-xs uppercase text-gray-500">
              Melding · {m.district.naam}
              {m.ressort && ` · ${m.ressort.naam}`}
            </p>
            <h1 className="mt-1 text-2xl font-bold">{m.titel}</h1>
            <p className="mt-1 font-mono text-sm text-gray-500">{m.ticketNummer}</p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                meldingStatusKleur[m.status]
              }`}
            >
              {statusLabel(m.status)}
            </span>
            <span
              className={`text-xs font-semibold ${
                m.urgentie === 'CRISIS' ? 'text-red-700' : m.urgentie === 'HOOG' ? 'text-amber-700' : 'text-gray-600'
              }`}
            >
              Urgentie: {m.urgentie}
            </span>
          </div>
        </div>

        <p className="mt-4 whitespace-pre-wrap text-sm text-gray-800">
          {m.omschrijving}
        </p>

        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <Rij label="Categorie">{m.categorie.naam}</Rij>
          {m.locatieOmschrijving && <Rij label="Locatie">{m.locatieOmschrijving}</Rij>}
          <Rij label="Ontvangen">
            {new Date(m.createdAt).toLocaleString('nl-NL')}
          </Rij>
          {m.toegewezenAan && (
            <Rij label="Toegewezen aan">{m.toegewezenAan.naam}</Rij>
          )}
        </dl>
      </header>

      {(m.melderNaam || m.melderTelefoon || m.melderEmail) && (
        <section className="rounded-lg bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Melder-contact</h2>
          {!m.melderConsent && (
            <p className="mt-1 text-xs text-amber-700">
              Geen toestemming voor contact gegeven door melder.
            </p>
          )}
          <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            {m.melderNaam && <Rij label="Naam">{m.melderNaam}</Rij>}
            {m.melderTelefoon && <Rij label="Telefoon">{m.melderTelefoon}</Rij>}
            {m.melderEmail && <Rij label="E-mail">{m.melderEmail}</Rij>}
          </dl>
        </section>
      )}

      {fout && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {fout}
        </div>
      )}

      {heeft('melding.behandel') && (
        <form onSubmit={wijzigStatus} className="space-y-3 rounded-lg bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Status wijzigen</h2>
          <select
            value={nieuwStatus}
            onChange={(e) => setNieuwStatus(e.target.value)}
            className="w-full rounded border-gray-300 text-sm"
          >
            <option value="">— kies nieuwe status —</option>
            <option value="IN_BEHANDELING">In behandeling</option>
            <option value="EXTRA_INFO_NODIG">Extra info nodig (contact melder)</option>
            <option value="OPGELOST">Opgelost</option>
            <option value="GESLOTEN">Gesloten</option>
            <option value="HEROPEND">Heropenen</option>
          </select>
          <textarea
            rows={3}
            maxLength={2000}
            value={opmerking}
            onChange={(e) => setOpmerking(e.target.value)}
            className="w-full rounded border-gray-300 text-sm"
            placeholder="Opmerking (zichtbaar in tijdlijn)"
          />
          <button
            type="submit"
            disabled={bezig || !nieuwStatus}
            className="rounded bg-sdp-groen px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-50"
          >
            Status bijwerken
          </button>
        </form>
      )}

      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold">Tijdlijn ({m.events.length})</h2>
        <ol className="space-y-3 border-l-2 border-sdp-groen pl-4">
          {m.events.map((ev, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[1.4rem] mt-1.5 h-2.5 w-2.5 rounded-full bg-sdp-groen" />
              <div className="text-sm font-medium">{statusLabel(ev.type)}</div>
              <div className="text-xs text-gray-500">
                {new Date(ev.createdAt).toLocaleString('nl-NL')}
                {ev.actor && ` · ${ev.actor.naam}`}
              </div>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}

function Rij({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-gray-500">{label}</dt>
      <dd>{children}</dd>
    </>
  );
}
