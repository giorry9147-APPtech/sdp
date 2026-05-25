'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDashboard } from '@/lib/dashboard-context';
import { api, type ProjectDetail, type ProjectStatus } from '@/lib/api';
import { projectStatusKleur, srdFormat, statusLabel } from '@/lib/status-stijl';

export default function ProjectDetailPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const { sessie, heeft } = useDashboard();
  const [p, setP] = useState<ProjectDetail | null>(null);
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);

  // Voortgangsformulier
  const [voortgang, setVoortgang] = useState('');

  // Status-acties
  const [nieuwStatus, setNieuwStatus] = useState<ProjectStatus | ''>('');
  const [statusOpmerking, setStatusOpmerking] = useState('');

  function herlaad() {
    api
      .projectDetail(id, sessie.accessToken)
      .then((d) => {
        setP(d);
        setFout(null);
      })
      .catch((e) => setFout(e instanceof Error ? e.message : 'fout'));
  }

  useEffect(herlaad, [id, sessie.accessToken]);

  async function voortgangToevoegen(e: React.FormEvent) {
    e.preventDefault();
    if (voortgang.length < 3) return;
    setBezig(true);
    try {
      await api.projectVoortgang(id, { body: voortgang }, sessie.accessToken);
      setVoortgang('');
      herlaad();
    } catch (e) {
      setFout(e instanceof Error ? e.message : 'fout');
    } finally {
      setBezig(false);
    }
  }

  async function statusWijzigen(e: React.FormEvent) {
    e.preventDefault();
    if (!nieuwStatus) return;
    setBezig(true);
    try {
      await api.projectStatus(
        id,
        { status: nieuwStatus, opmerking: statusOpmerking || undefined },
        sessie.accessToken,
      );
      setNieuwStatus('');
      setStatusOpmerking('');
      herlaad();
    } catch (e) {
      setFout(e instanceof Error ? e.message : 'fout');
    } finally {
      setBezig(false);
    }
  }

  if (!p) {
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

  const budget = Number(p.budgetIndicatief ?? 0);
  const besteed = Number(p.budgetWerkelijk ?? 0);
  const pct = budget > 0 ? Math.round((besteed / budget) * 100) : 0;
  const dagenLopend =
    p.startDatum && !p.eindDatumWerkelijk
      ? Math.floor((Date.now() - new Date(p.startDatum).getTime()) / 86_400_000)
      : null;

  return (
    <div className="space-y-6">
      <nav className="text-sm">
        <Link href="/dashboard/projecten" className="text-sdp-groen hover:underline">
          ← Projecten
        </Link>
      </nav>

      <header className="rounded-lg bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="text-xs uppercase text-gray-500">
              Project · {p.district.naam}
              {p.ressort && ` · ${p.ressort.naam}`}
            </p>
            <h1 className="mt-1 text-2xl font-bold">{p.titel}</h1>
            <p className="mt-1 font-mono text-sm text-gray-500">{p.referentie}</p>
          </div>
          <span
            className={`shrink-0 rounded-full px-3 py-1 text-xs font-semibold ${
              projectStatusKleur[p.status]
            }`}
          >
            {statusLabel(p.status)}
          </span>
        </div>

        {p.beschrijving && (
          <p className="mt-4 whitespace-pre-wrap text-sm text-gray-700">
            {p.beschrijving}
          </p>
        )}

        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
          {p.categorie && <Rij label="Categorie">{p.categorie.naam}</Rij>}
          {p.contractor && <Rij label="Contractor">{p.contractor}</Rij>}
          {p.startDatum && (
            <Rij label="Start">
              {new Date(p.startDatum).toLocaleDateString('nl-NL')}
            </Rij>
          )}
          {p.eindDatumPlan && (
            <Rij label="Eind (plan)">
              {new Date(p.eindDatumPlan).toLocaleDateString('nl-NL')}
            </Rij>
          )}
          {p.eindDatumWerkelijk && (
            <Rij label="Eind (werkelijk)">
              {new Date(p.eindDatumWerkelijk).toLocaleDateString('nl-NL')}
            </Rij>
          )}
          {dagenLopend != null && (
            <Rij label="Looptijd">{dagenLopend} dagen lopend</Rij>
          )}
        </dl>
      </header>

      {/* Budget-card */}
      {budget > 0 && (
        <section className="rounded-lg bg-white p-5 shadow-sm">
          <div className="flex items-baseline justify-between">
            <h2 className="font-semibold">Budget</h2>
            <span className="text-sm text-gray-500">{pct}% besteed</span>
          </div>
          <div className="mt-3 h-3 w-full rounded-full bg-gray-200">
            <div
              className={`h-3 rounded-full ${pct > 100 ? 'bg-red-500' : pct > 80 ? 'bg-amber-500' : 'bg-sdp-groen'}`}
              style={{ width: `${Math.min(pct, 100)}%` }}
            />
          </div>
          <div className="mt-3 grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-500">Indicatief</p>
              <p className="font-semibold">{srdFormat(budget)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Besteed</p>
              <p className="font-semibold">{srdFormat(besteed)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Restant</p>
              <p className={`font-semibold ${budget - besteed < 0 ? 'text-red-600' : ''}`}>
                {srdFormat(budget - besteed)}
              </p>
            </div>
          </div>
        </section>
      )}

      {fout && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {fout}
        </div>
      )}

      {/* Acties */}
      {(heeft('project.update') || heeft('project.goedkeur')) && (
        <div className="grid gap-4 md:grid-cols-2">
          {heeft('project.update') && (
            <form
              onSubmit={voortgangToevoegen}
              className="space-y-3 rounded-lg bg-white p-5 shadow-sm"
            >
              <h2 className="font-semibold">Voortgangsupdate toevoegen</h2>
              <textarea
                rows={4}
                minLength={3}
                maxLength={5000}
                value={voortgang}
                onChange={(e) => setVoortgang(e.target.value)}
                className="w-full rounded border-gray-300"
                placeholder="Wat is er deze week gebeurd? Knelpunten? Volgende stappen?"
              />
              <button
                type="submit"
                disabled={bezig || voortgang.length < 3}
                className="rounded bg-sdp-groen px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-50"
              >
                Toevoegen
              </button>
            </form>
          )}

          {heeft('project.update') && (
            <form
              onSubmit={statusWijzigen}
              className="space-y-3 rounded-lg border-2 border-sdp-groen/30 bg-white p-5 shadow-sm"
            >
              <h2 className="font-semibold">Status wijzigen</h2>
              <select
                value={nieuwStatus}
                onChange={(e) => setNieuwStatus(e.target.value as ProjectStatus)}
                className="w-full rounded border-gray-300 text-sm"
              >
                <option value="">— kies nieuwe status —</option>
                <option value="IDEE">Idee</option>
                <option value="GOEDGEKEURD" disabled={!heeft('project.goedkeur')}>
                  Goedgekeurd {!heeft('project.goedkeur') && '(vereist DC)'}
                </option>
                <option value="BUDGET_AANGEVRAAGD">Budget aangevraagd</option>
                <option value="GESTART">Gestart</option>
                <option value="VERTRAAGD">Vertraagd</option>
                <option value="AFGEROND">Afgerond</option>
                <option value="GEEVALUEERD">Geëvalueerd</option>
                <option value="GEANNULEERD" disabled={!heeft('project.goedkeur')}>
                  Geannuleerd {!heeft('project.goedkeur') && '(vereist DC)'}
                </option>
              </select>
              <textarea
                rows={3}
                maxLength={2000}
                value={statusOpmerking}
                onChange={(e) => setStatusOpmerking(e.target.value)}
                className="w-full rounded border-gray-300 text-sm"
                placeholder="Opmerking (optioneel)"
              />
              <button
                type="submit"
                disabled={bezig || !nieuwStatus}
                className="rounded bg-sdp-groen px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-50"
              >
                Status bijwerken
              </button>
            </form>
          )}
        </div>
      )}

      {/* Voortgangslogboek */}
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold">
          Voortgangslogboek ({p.updates.length})
        </h2>
        {p.updates.length === 0 ? (
          <p className="text-sm text-gray-500">Nog geen updates.</p>
        ) : (
          <ol className="space-y-3 border-l-2 border-sdp-groen pl-4">
            {p.updates.map((u) => (
              <li key={u.id} className="relative">
                <span className="absolute -left-[1.4rem] mt-1.5 h-2.5 w-2.5 rounded-full bg-sdp-groen" />
                <div className="text-xs text-gray-500">
                  {new Date(u.createdAt).toLocaleString('nl-NL')} · {u.actor.naam}
                </div>
                <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">
                  {u.body}
                </p>
              </li>
            ))}
          </ol>
        )}
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
