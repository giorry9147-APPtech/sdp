'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDashboard } from '@/lib/dashboard-context';
import { api, type VerzoekDetail } from '@/lib/api';
import { verzoekStatusBadge } from '../_status';

export default function VerzoekDetailPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const { sessie, heeft } = useDashboard();
  const [v, setV] = useState<VerzoekDetail | null>(null);
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);

  // DC-acties
  const [nieuwStatus, setNieuwStatus] = useState('');
  const [resultaatCode, setResultaatCode] = useState('');
  const [antwoord, setAntwoord] = useState('');

  function herlaad() {
    api
      .verzoekDetail(id, sessie.accessToken)
      .then((d) => {
        setV(d);
        setFout(null);
      })
      .catch((e) => setFout(e instanceof Error ? e.message : 'fout'));
  }
  useEffect(herlaad, [id, sessie.accessToken]);

  const kanBehandelen = heeft('verzoek.behandel');
  const kanBeantwoorden = heeft('verzoek.beantwoord');
  const kanIntrekken = heeft('verzoek.intrekken');

  async function doeStatus(e: React.FormEvent) {
    e.preventDefault();
    if (!nieuwStatus) return;
    setBezig(true);
    try {
      await api.verzoekStatus(id, { statusCode: nieuwStatus }, sessie.accessToken);
      setNieuwStatus('');
      herlaad();
    } catch (e) {
      setFout(e instanceof Error ? e.message : 'fout');
    } finally {
      setBezig(false);
    }
  }

  async function doeBeantwoord(e: React.FormEvent) {
    e.preventDefault();
    if (!resultaatCode || antwoord.length < 5) return;
    setBezig(true);
    try {
      await api.verzoekBeantwoord(id, { resultaatCode, antwoord }, sessie.accessToken);
      setResultaatCode('');
      setAntwoord('');
      herlaad();
    } catch (e) {
      setFout(e instanceof Error ? e.message : 'fout');
    } finally {
      setBezig(false);
    }
  }

  async function doeIntrekken() {
    if (!confirm('Verzoek intrekken? Dit kan niet ongedaan worden gemaakt.')) return;
    setBezig(true);
    try {
      await api.verzoekIntrekken(id, {}, sessie.accessToken);
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
        {fout ? (
          <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">{fout}</div>
        ) : (
          <p className="text-gray-500">Laden…</p>
        )}
      </div>
    );
  }

  const badge = verzoekStatusBadge(v);
  const afgesloten = Boolean(v.afgehandeldOp || v.ingetrokkenOp);
  const tussenStatussen = v.zaaktype.statustypen.filter((s) => !s.isEind);

  return (
    <div className="space-y-6">
      <nav className="text-sm">
        <Link href="/dashboard/verzoeken" className="text-sdp-groen hover:underline">
          ← Verzoeken
        </Link>
      </nav>

      <header className="rounded-lg bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="text-xs uppercase text-gray-500">
              {v.zaaktype.naam} · {v.district.naam}
              {v.ressort && ` · ${v.ressort.naam}`}
            </p>
            <h1 className="mt-1 text-2xl font-bold">{v.onderwerp}</h1>
            <p className="mt-1 font-mono text-sm text-gray-500">{v.referentie}</p>
          </div>
          <span className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${badge.kleur}`}>
            {badge.label}
          </span>
        </div>

        <p className="mt-4 whitespace-pre-wrap text-sm text-gray-800">{v.omschrijving}</p>

        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-3">
          <Rij label="Indienende dienst">{v.bronOrganisatie.korteNaam ?? v.bronOrganisatie.naam}</Rij>
          {v.externeReferentie && <Rij label="Externe ref.">{v.externeReferentie}</Rij>}
          <Rij label="Vertrouwelijkheid">{v.vertrouwelijkheid}</Rij>
          {v.deadline && (
            <Rij label="Deadline">{new Date(v.deadline).toLocaleDateString('nl-NL')}</Rij>
          )}
          <Rij label="Ingediend">{new Date(v.createdAt).toLocaleString('nl-NL')}</Rij>
          {v.ingediendDoor && <Rij label="Door">{v.ingediendDoor.naam}</Rij>}
        </dl>

        {/* Zaaktype-specifieke velden (ZF2) */}
        {v.eigenschappen && Object.keys(v.eigenschappen).length > 0 && (
          <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 border-t pt-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
            {v.zaaktype.eigenschappen.map((eig) => {
              const w = (v.eigenschappen ?? {})[eig.code];
              if (w === undefined || w === null || w === '') return null;
              return (
                <Rij key={eig.code} label={eig.label}>
                  {String(w)}
                </Rij>
              );
            })}
          </dl>
        )}
      </header>

      {/* Antwoord van de DC (zichtbaar voor beide partijen) */}
      {v.resultaatCode && (
        <section className="rounded-lg border border-emerald-200 bg-emerald-50 p-5 shadow-sm">
          <h2 className="font-semibold text-emerald-900">Advies / besluit</h2>
          <p className="mt-1 text-sm font-semibold text-emerald-800">
            {v.zaaktype.resultaattypen.find((r) => r.code === v.resultaatCode)?.naam ?? v.resultaatCode}
          </p>
          {v.antwoord && <p className="mt-2 whitespace-pre-wrap text-sm text-emerald-900">{v.antwoord}</p>}
          <p className="mt-2 text-xs text-emerald-700">
            {v.beantwoordDoor?.naam}
            {v.beantwoordOp && ` · ${new Date(v.beantwoordOp).toLocaleString('nl-NL')}`}
          </p>
        </section>
      )}

      {fout && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">{fout}</div>
      )}

      {/* DC-acties */}
      {kanBehandelen && !afgesloten && (
        <div className="grid gap-4 md:grid-cols-2">
          <form onSubmit={doeStatus} className="space-y-3 rounded-lg bg-white p-5 shadow-sm">
            <h2 className="font-semibold">Status bijwerken</h2>
            <select
              value={nieuwStatus}
              onChange={(e) => setNieuwStatus(e.target.value)}
              className="w-full rounded border-gray-300 text-sm"
            >
              <option value="">— kies status —</option>
              {tussenStatussen.map((s) => (
                <option key={s.code} value={s.code} disabled={s.code === v.statusCode}>
                  {s.naam}
                  {s.code === v.statusCode ? ' (huidig)' : ''}
                </option>
              ))}
            </select>
            <button
              type="submit"
              disabled={bezig || !nieuwStatus}
              className="rounded bg-sdp-groen px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-50"
            >
              Status bijwerken
            </button>
          </form>

          {kanBeantwoorden && (
            <form
              onSubmit={doeBeantwoord}
              className="space-y-3 rounded-lg border-2 border-sdp-groen/30 bg-white p-5 shadow-sm"
            >
              <h2 className="font-semibold">Beantwoorden (advies/besluit)</h2>
              <select
                value={resultaatCode}
                onChange={(e) => setResultaatCode(e.target.value)}
                className="w-full rounded border-gray-300 text-sm"
              >
                <option value="">— kies resultaat —</option>
                {v.zaaktype.resultaattypen.map((r) => (
                  <option key={r.code} value={r.code}>
                    {r.naam}
                  </option>
                ))}
              </select>
              <textarea
                rows={3}
                minLength={5}
                maxLength={5000}
                value={antwoord}
                onChange={(e) => setAntwoord(e.target.value)}
                className="w-full rounded border-gray-300 text-sm"
                placeholder="Motivatie van het advies / besluit"
              />
              <button
                type="submit"
                disabled={bezig || !resultaatCode || antwoord.length < 5}
                className="rounded bg-sdp-groen px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-50"
              >
                Verstuur antwoord
              </button>
            </form>
          )}
        </div>
      )}

      {/* Dienst-actie: intrekken */}
      {kanIntrekken && !afgesloten && (
        <div className="rounded-lg bg-white p-5 shadow-sm">
          <button
            onClick={doeIntrekken}
            disabled={bezig}
            className="rounded border border-red-300 px-4 py-2 text-sm font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
          >
            Verzoek intrekken
          </button>
        </div>
      )}

      {/* Bijlages */}
      {v.bijlages.length > 0 && (
        <section className="rounded-lg bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Bijlages ({v.bijlages.length})</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {v.bijlages.map((b) => (
              <li
                key={b.id}
                className="flex items-center justify-between rounded border border-gray-200 px-3 py-2"
              >
                <span className="truncate">
                  <span className="font-mono text-xs text-gray-500">
                    [{(b.grootte / 1024).toFixed(0)} KB · {b.vertrouwelijkheid}]
                  </span>{' '}
                  {b.bestandsnaam}
                </span>
                <button
                  type="button"
                  onClick={async () => {
                    try {
                      const dl = await api.verzoekBijlageDownloadUrl(id, b.id, sessie.accessToken);
                      window.open(dl.url, '_blank', 'noopener,noreferrer');
                    } catch {
                      setFout('Download mislukt');
                    }
                  }}
                  className="ml-2 text-xs font-semibold text-sdp-groen underline"
                >
                  download
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* Tijdlijn */}
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold">Tijdlijn ({v.events.length})</h2>
        <ol className="space-y-3 border-l-2 border-sdp-groen pl-4">
          {v.events.map((ev, i) => (
            <li key={i} className="relative">
              <span className="absolute -left-[1.4rem] mt-1.5 h-2.5 w-2.5 rounded-full bg-sdp-groen" />
              <div className="text-sm font-medium">{ev.type.replace(/_/g, ' ')}</div>
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
