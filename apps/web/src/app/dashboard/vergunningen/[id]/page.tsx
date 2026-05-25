'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDashboard } from '@/lib/dashboard-context';
import { api, type Vergunning, type VergunningStatus } from '@/lib/api';
import { vergunningStatusKleur, statusLabel } from '@/lib/status-stijl';

export default function VergunningDetailPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const { sessie, heeft } = useDashboard();
  const [v, setV] = useState<Vergunning | null>(null);
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);

  // Acties
  const [tussenStatus, setTussenStatus] = useState<VergunningStatus>('IN_BEHANDELING');
  const [tussenOpmerking, setTussenOpmerking] = useState('');
  const [besluitKeuze, setBesluitKeuze] = useState<'GOEDGEKEURD' | 'AFGEWEZEN'>('GOEDGEKEURD');
  const [besluitTekst, setBesluitTekst] = useState('');

  function herlaad() {
    api
      .vergunningDetail(id, sessie.accessToken)
      .then((data) => {
        setV(data);
        setFout(null);
      })
      .catch((e) => setFout(e instanceof Error ? e.message : 'fout'));
  }

  useEffect(herlaad, [id, sessie.accessToken]);

  async function wijzigStatus(e: React.FormEvent) {
    e.preventDefault();
    setBezig(true);
    try {
      await api.vergunningStatusWijzigen(
        id,
        { status: tussenStatus, opmerking: tussenOpmerking || undefined },
        sessie.accessToken,
      );
      setTussenOpmerking('');
      herlaad();
    } catch (e) {
      setFout(e instanceof Error ? e.message : 'fout');
    } finally {
      setBezig(false);
    }
  }

  async function neemBesluit(e: React.FormEvent) {
    e.preventDefault();
    if (besluitTekst.length < 5) {
      setFout('Geef een onderbouwing van minimaal 5 tekens.');
      return;
    }
    if (!confirm(`Definitief ${besluitKeuze.toLowerCase()}? Dit kan niet ongedaan worden.`)) {
      return;
    }
    setBezig(true);
    try {
      await api.vergunningBesluit(
        id,
        { status: besluitKeuze, besluit: besluitTekst },
        sessie.accessToken,
      );
      setBesluitTekst('');
      herlaad();
    } catch (e) {
      setFout(e instanceof Error ? e.message : 'fout');
    } finally {
      setBezig(false);
    }
  }

  if (!v) {
    return (
      <div>
        {fout && (
          <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            {fout}
          </div>
        )}
        {!fout && <p className="text-gray-500">Laden…</p>}
      </div>
    );
  }

  const eindbesluitGenomen = v.status === 'GOEDGEKEURD' || v.status === 'AFGEWEZEN';

  return (
    <div className="space-y-6">
      <nav className="text-sm">
        <Link
          href="/dashboard/vergunningen"
          className="text-sdp-groen hover:underline"
        >
          ← Vergunningen
        </Link>
      </nav>

      <header className="rounded-lg bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold">{v.titel}</h1>
            <p className="mt-1 font-mono text-sm text-gray-500">{v.referentie}</p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              vergunningStatusKleur[v.status]
            }`}
          >
            {statusLabel(v.status)}
          </span>
        </div>

        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
          <Rij label="Soort">{v.categorie.naam}</Rij>
          {v.locatieOmschrijving && <Rij label="Locatie">{v.locatieOmschrijving}</Rij>}
          {v.ingediendOp && (
            <Rij label="Ingediend">
              {new Date(v.ingediendOp).toLocaleString('nl-NL')}
            </Rij>
          )}
          {v.beslotenOp && (
            <Rij label="Beslist">
              {new Date(v.beslotenOp).toLocaleString('nl-NL')}
            </Rij>
          )}
        </dl>
      </header>

      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="font-semibold">Aanvrager</h2>
        <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          {v.aanvragerSoort && <Rij label="Type">{v.aanvragerSoort}</Rij>}
          {v.aanvragerNaam && <Rij label="Naam">{v.aanvragerNaam}</Rij>}
          {v.aanvragerKkfNummer && (
            <Rij label="KKF-nummer">
              <span className="font-mono">{v.aanvragerKkfNummer}</span>
            </Rij>
          )}
          {v.aanvragerTelefoon && <Rij label="Telefoon">{v.aanvragerTelefoon}</Rij>}
          {v.aanvragerEmail && <Rij label="E-mail">{v.aanvragerEmail}</Rij>}
        </dl>
      </section>

      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="font-semibold">Omschrijving</h2>
        <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">
          {v.beschrijving}
        </p>
      </section>

      {v.besluit && (
        <section
          className={`rounded-lg border p-6 shadow-sm ${
            v.status === 'GOEDGEKEURD'
              ? 'border-emerald-300 bg-emerald-50'
              : 'border-red-300 bg-red-50'
          }`}
        >
          <h2 className="font-semibold">Besluit</h2>
          <p className="mt-2 whitespace-pre-wrap text-sm">{v.besluit}</p>
        </section>
      )}

      {fout && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {fout}
        </div>
      )}

      {/* Acties — alleen tonen als er nog geen eindbesluit is */}
      {!eindbesluitGenomen && (
        <div className="grid gap-4 md:grid-cols-2">
          {heeft('vergunning.behandel') && (
            <form
              onSubmit={wijzigStatus}
              className="space-y-3 rounded-lg bg-white p-5 shadow-sm"
            >
              <h2 className="font-semibold">Tussentijdse status</h2>
              <p className="text-xs text-gray-500">
                Voor eindbesluit (goedkeuren/afwijzen) gebruik je het andere
                formulier hiernaast.
              </p>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Status</span>
                <select
                  value={tussenStatus}
                  onChange={(e) => setTussenStatus(e.target.value as VergunningStatus)}
                  className="w-full rounded border-gray-300"
                >
                  <option value="IN_BEHANDELING">In behandeling</option>
                  <option value="EXTRA_INFO_NODIG">Extra info nodig</option>
                  <option value="BEZWAAR">Bezwaar</option>
                  <option value="INGETROKKEN">Ingetrokken</option>
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Opmerking</span>
                <textarea
                  rows={3}
                  value={tussenOpmerking}
                  onChange={(e) => setTussenOpmerking(e.target.value)}
                  className="w-full rounded border-gray-300"
                  placeholder="Optioneel — zichtbaar voor aanvrager in tijdlijn"
                />
              </label>
              <button
                type="submit"
                disabled={bezig}
                className="rounded bg-sdp-groen px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-50"
              >
                Status bijwerken
              </button>
            </form>
          )}

          {heeft('vergunning.goedkeur') && (
            <form
              onSubmit={neemBesluit}
              className="space-y-3 rounded-lg border-2 border-sdp-groen/30 bg-white p-5 shadow-sm"
            >
              <h2 className="font-semibold">Eindbesluit (DC)</h2>
              <p className="text-xs text-gray-500">
                Definitief. Wordt vastgelegd in audit-log. Aanvrager ontvangt
                de motivering te zien.
              </p>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">Besluit</span>
                <select
                  value={besluitKeuze}
                  onChange={(e) =>
                    setBesluitKeuze(e.target.value as 'GOEDGEKEURD' | 'AFGEWEZEN')
                  }
                  className="w-full rounded border-gray-300"
                >
                  <option value="GOEDGEKEURD">Goedkeuren</option>
                  <option value="AFGEWEZEN">Afwijzen</option>
                </select>
              </label>
              <label className="block text-sm">
                <span className="mb-1 block font-medium">
                  Motivering <span className="text-red-600">*</span>
                </span>
                <textarea
                  required
                  minLength={5}
                  rows={4}
                  value={besluitTekst}
                  onChange={(e) => setBesluitTekst(e.target.value)}
                  className="w-full rounded border-gray-300"
                  placeholder="Onderbouwing van het besluit"
                />
              </label>
              <button
                type="submit"
                disabled={bezig}
                className={`rounded px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-50 ${
                  besluitKeuze === 'GOEDGEKEURD'
                    ? 'bg-emerald-600 hover:bg-emerald-700'
                    : 'bg-red-600 hover:bg-red-700'
                }`}
              >
                {besluitKeuze === 'GOEDGEKEURD'
                  ? '✓ Definitief goedkeuren'
                  : '✗ Definitief afwijzen'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Tijdlijn */}
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="font-semibold">Tijdlijn</h2>
        <ol className="mt-3 space-y-2 border-l-2 border-sdp-groen pl-4">
          {(v.events ?? []).map((ev, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[1.4rem] mt-1.5 h-2.5 w-2.5 rounded-full bg-sdp-groen" />
              <div className="text-sm font-medium">{statusLabel(ev.type)}</div>
              <div className="text-xs text-gray-500">
                {new Date(ev.createdAt).toLocaleString('nl-NL')}
                {ev.actor && ` · ${ev.actor.naam}`}
              </div>
              {ev.payload != null && (
                <details className="mt-1">
                  <summary className="cursor-pointer text-xs text-gray-500">
                    detail
                  </summary>
                  <pre className="mt-1 max-w-full overflow-x-auto rounded bg-gray-50 p-2 text-xs">
                    {JSON.stringify(ev.payload, null, 2)}
                  </pre>
                </details>
              )}
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
