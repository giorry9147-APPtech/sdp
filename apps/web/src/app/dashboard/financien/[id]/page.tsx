'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useDashboard } from '@/lib/dashboard-context';
import { api, type FondsDetail, type ProjectLijst, type UitgaveStatus } from '@/lib/api';
import { srdFormat } from '@/lib/status-stijl';

export default function FondsDetailPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const { sessie, activeDistrictId, heeft } = useDashboard();
  const [f, setF] = useState<FondsDetail | null>(null);
  const [projecten, setProjecten] = useState<ProjectLijst[]>([]);
  const [fout, setFout] = useState<string | null>(null);

  // Aanvraag-form
  const [bedrag, setBedrag] = useState<number | ''>('');
  const [beschrijving, setBeschrijving] = useState('');
  const [projectId, setProjectId] = useState<number | ''>('');
  const [bezig, setBezig] = useState(false);
  const [waarschuwing, setWaarschuwing] = useState<string | null>(null);

  // Beslissings-UI: per-rij reden bij afkeuring
  const [redenPerId, setRedenPerId] = useState<Record<number, string>>({});
  const [beslissingBezig, setBeslissingBezig] = useState<number | null>(null);

  function herlaad() {
    api
      .fondsDetail(id, sessie.accessToken)
      .then((d) => {
        setF(d);
        setFout(null);
      })
      .catch((e) => setFout(e instanceof Error ? e.message : 'fout'));
  }

  useEffect(herlaad, [id, sessie.accessToken]);

  useEffect(() => {
    if (!activeDistrictId) return;
    api.projectLijst(activeDistrictId, sessie.accessToken).then(setProjecten).catch(() => {});
  }, [activeDistrictId, sessie.accessToken]);

  const projectKeuzes = useMemo(
    () =>
      projecten.filter((p) =>
        ['GOEDGEKEURD', 'BUDGET_AANGEVRAAGD', 'GESTART', 'VERTRAAGD', 'AFGEROND'].includes(p.status),
      ),
    [projecten],
  );

  async function boek(e: React.FormEvent) {
    e.preventDefault();
    if (!bedrag || beschrijving.length < 3) return;
    setBezig(true);
    setWaarschuwing(null);
    try {
      const r = await api.fondsBoekUitgave(
        id,
        {
          bedrag: Number(bedrag),
          beschrijving,
          projectId: projectId ? Number(projectId) : undefined,
        },
        sessie.accessToken,
      );
      if (r.budgetOverschrijding) {
        setWaarschuwing(
          '⚠️ Deze aanvraag zou bij goedkeuring het budget overschrijden. Audit-trail vastgelegd.',
        );
      }
      setBedrag('');
      setBeschrijving('');
      setProjectId('');
      herlaad();
    } catch (e) {
      setFout(e instanceof Error ? e.message : 'fout');
    } finally {
      setBezig(false);
    }
  }

  async function beslis(uitgaveId: number, actie: 'GOEDKEUREN' | 'AFKEUREN') {
    setBeslissingBezig(uitgaveId);
    setFout(null);
    try {
      const reden = actie === 'AFKEUREN' ? (redenPerId[uitgaveId] ?? '').trim() : undefined;
      if (actie === 'AFKEUREN' && (!reden || reden.length < 3)) {
        setFout('Reden van afkeuring is verplicht (min. 3 tekens)');
        return;
      }
      await api.fondsBeslisUitgave(uitgaveId, { actie, reden }, sessie.accessToken);
      setRedenPerId((r) => {
        const next = { ...r };
        delete next[uitgaveId];
        return next;
      });
      herlaad();
    } catch (e) {
      setFout(e instanceof Error ? e.message : 'fout');
    } finally {
      setBeslissingBezig(null);
    }
  }

  async function downloadCsv() {
    if (!f) return;
    try {
      const dl = api.fondsExportCsvUrl(id, sessie.accessToken);
      await dl.fetch(`districtsfonds-${f.district.code}-${f.jaar}-grootboek.csv`);
    } catch (e) {
      setFout(e instanceof Error ? e.message : 'fout');
    }
  }

  if (!f) {
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

  const budget = Number(f.totaalBudget);
  const pct = f.pctBesteed;

  return (
    <div className="space-y-6">
      <nav className="text-sm">
        <Link href="/dashboard/financien" className="text-sdp-groen hover:underline">
          ← Districtsfondsen
        </Link>
      </nav>

      <header className="rounded-lg bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="text-xs uppercase text-gray-500">
              Districtsfonds · {f.district.naam} · jaar {f.jaar}
            </p>
            <h1 className="mt-1 text-2xl font-bold">{srdFormat(budget)} budget</h1>
          </div>
          <div className="flex items-center gap-2">
            {f.goedgekeurd && (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                ✓ Goedgekeurd
              </span>
            )}
            <button
              onClick={downloadCsv}
              className="rounded border border-gray-300 bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-sm hover:bg-gray-50"
              title="Download grootboek als CSV voor CLAD/audit"
            >
              ⬇ CSV (audit)
            </button>
          </div>
        </div>

        <div className="mt-4 h-3 w-full rounded-full bg-gray-200">
          <div
            className={`h-3 rounded-full ${
              pct > 100 ? 'bg-red-500' : pct > 90 ? 'bg-amber-500' : 'bg-sdp-groen'
            }`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>

        <div className="mt-4 grid gap-3 text-sm sm:grid-cols-4">
          <div>
            <p className="text-xs text-gray-500">Totaal</p>
            <p className="text-xl font-bold">{srdFormat(budget)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Besteed (goedgekeurd)</p>
            <p className="text-xl font-bold">{srdFormat(f.besteed)}</p>
            <p className="text-xs text-gray-500">{pct}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Restant</p>
            <p className={`text-xl font-bold ${f.restant < 0 ? 'text-red-600' : 'text-sdp-groen'}`}>
              {srdFormat(f.restant)}
            </p>
          </div>
          <div>
            <p className="text-xs text-gray-500">In afwachting</p>
            <p className={`text-xl font-bold ${f.uitgavenInAfwachting > 0 ? 'text-amber-600' : 'text-gray-400'}`}>
              {srdFormat(f.aangevraagdBedrag)}
            </p>
            <p className="text-xs text-gray-500">
              {f.uitgavenInAfwachting} aanvragen
            </p>
          </div>
        </div>
      </header>

      {/* Verdeling kaart */}
      <section className="grid gap-4 md:grid-cols-2">
        <div className="rounded-lg bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Verdeling</h2>
          <div className="mt-3 space-y-2">
            <Verdeling
              label="Projecten"
              bedrag={f.verdeling.projecten}
              totaal={f.besteed}
              kleur="bg-sdp-groen"
            />
            <Verdeling
              label="Operationeel"
              bedrag={f.verdeling.operationeel}
              totaal={f.besteed}
              kleur="bg-blue-500"
            />
          </div>
        </div>

        <div className="rounded-lg bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Per project</h2>
          {f.perProject.length === 0 ? (
            <p className="mt-2 text-sm text-gray-500">Geen project-uitgaven.</p>
          ) : (
            <ul className="mt-3 space-y-2 text-sm">
              {f.perProject.map((p, i) => (
                <li key={i} className="flex items-baseline justify-between">
                  <Link
                    href={`/dashboard/projecten/${p.project?.id}`}
                    className="truncate text-sdp-groen hover:underline"
                  >
                    {p.project?.titel ?? '(onbekend)'}
                  </Link>
                  <span className="ml-2 shrink-0 font-mono font-semibold">
                    {srdFormat(p.bedrag)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      {/* Aanvraag-form (uitgave wordt AANGEVRAAGD; iemand met fonds.goedkeur moet 'm goedkeuren) */}
      {heeft('fonds.boek') && (
        <form onSubmit={boek} className="space-y-3 rounded-lg border-2 border-sdp-groen/30 bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Uitgave aanvragen</h2>
          <p className="text-xs text-gray-600">
            Wacht na indiening op goedkeuring door iemand met de rol DC of
            Directeur Decentralisatie (4-ogen-principe). Pas na goedkeuring
            telt deze uitgave mee in het besteed-totaal.
          </p>
          {waarschuwing && (
            <div className="rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
              {waarschuwing}
            </div>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Bedrag (SRD) <span className="text-red-600">*</span></span>
              <input
                type="number"
                required
                min={0}
                step={100}
                value={bedrag}
                onChange={(e) => setBedrag(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded border-gray-300"
              />
            </label>
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Project (optioneel)</span>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value ? Number(e.target.value) : '')}
                className="w-full rounded border-gray-300"
              >
                <option value="">— operationeel / niet aan project —</option>
                {projectKeuzes.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.titel}
                  </option>
                ))}
              </select>
            </label>
          </div>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Beschrijving <span className="text-red-600">*</span></span>
            <input
              type="text"
              required
              minLength={3}
              maxLength={500}
              value={beschrijving}
              onChange={(e) => setBeschrijving(e.target.value)}
              className="w-full rounded border-gray-300"
              placeholder="bv. Termijnbetaling renovatie Lelydorpweg — fase 1"
            />
          </label>
          <button
            type="submit"
            disabled={bezig || !bedrag || beschrijving.length < 3}
            className="rounded bg-sdp-groen px-5 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-50"
          >
            Aanvraag indienen
          </button>
        </form>
      )}

      {/* Wacht op goedkeuring — alleen voor fonds.goedkeur (DC, directeur) */}
      {heeft('fonds.goedkeur') &&
        f.uitgaven.some((u) => u.status === 'AANGEVRAAGD') && (
          <section className="space-y-3 rounded-lg border-2 border-amber-300 bg-amber-50 p-5 shadow-sm">
            <header className="flex items-baseline justify-between gap-3">
              <h2 className="font-semibold text-amber-900">
                Wacht op jouw goedkeuring ({f.uitgavenInAfwachting})
              </h2>
              <span className="text-xs text-amber-800">
                4-ogen: je mag niet je eigen aanvraag goedkeuren
              </span>
            </header>
            <ul className="space-y-3">
              {f.uitgaven
                .filter((u) => u.status === 'AANGEVRAAGD')
                .map((u) => {
                  const isEigen = u.geboektDoorId === sessie.user.id;
                  return (
                    <li
                      key={u.id}
                      className="rounded border border-amber-200 bg-white p-3"
                    >
                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                        <div>
                          <p className="font-medium">{u.beschrijving}</p>
                          <p className="text-xs text-gray-500">
                            Aangevraagd{' '}
                            {new Date(u.geboektOp).toLocaleDateString('nl-NL')}
                            {u.project ? ` · ${u.project.referentie} ${u.project.titel}` : ' · operationeel'}
                          </p>
                        </div>
                        <span className="font-mono text-lg font-bold">
                          {srdFormat(Number(u.bedrag))}
                        </span>
                      </div>
                      {isEigen ? (
                        <p className="mt-2 text-xs text-gray-500 italic">
                          Eigen aanvraag — kan niet door jou beslist worden.
                        </p>
                      ) : (
                        <div className="mt-3 flex flex-wrap items-center gap-2">
                          <button
                            onClick={() => beslis(u.id, 'GOEDKEUREN')}
                            disabled={beslissingBezig === u.id}
                            className="rounded bg-sdp-groen px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-50"
                          >
                            ✓ Goedkeuren
                          </button>
                          <input
                            type="text"
                            placeholder="Reden bij afkeuring (verplicht)"
                            value={redenPerId[u.id] ?? ''}
                            onChange={(e) =>
                              setRedenPerId((r) => ({ ...r, [u.id]: e.target.value }))
                            }
                            className="flex-1 rounded border-gray-300 text-xs"
                          />
                          <button
                            onClick={() => beslis(u.id, 'AFKEUREN')}
                            disabled={beslissingBezig === u.id}
                            className="rounded border border-red-400 bg-white px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50 disabled:opacity-50"
                          >
                            ✗ Afkeuren
                          </button>
                        </div>
                      )}
                    </li>
                  );
                })}
            </ul>
          </section>
        )}

      {fout && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {fout}
        </div>
      )}

      {/* Uitgaven-grootboek (alle statussen) */}
      <section className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 font-semibold">Grootboek ({f.uitgaven.length} regels)</h2>
        {f.uitgaven.length === 0 ? (
          <p className="text-sm text-gray-500">Nog geen uitgaven.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-left text-xs uppercase text-gray-500">
                <tr>
                  <th className="py-2 pr-3">Geboekt op</th>
                  <th className="py-2 pr-3">Status</th>
                  <th className="py-2 pr-3">Beschrijving</th>
                  <th className="py-2 pr-3">Project</th>
                  <th className="py-2 pr-3 text-right">Bedrag</th>
                </tr>
              </thead>
              <tbody>
                {f.uitgaven.map((u) => (
                  <tr
                    key={u.id}
                    className={`border-b last:border-0 ${
                      u.status === 'AFGEKEURD' ? 'opacity-50' : ''
                    }`}
                  >
                    <td className="py-2 pr-3 align-top text-xs text-gray-600">
                      {new Date(u.geboektOp).toLocaleDateString('nl-NL')}
                    </td>
                    <td className="py-2 pr-3 align-top">
                      <StatusBadge status={u.status} />
                    </td>
                    <td className="py-2 pr-3 align-top">
                      {u.beschrijving}
                      {u.status === 'AFGEKEURD' && u.afkeurReden && (
                        <p className="mt-0.5 text-xs italic text-red-700">
                          afgekeurd: {u.afkeurReden}
                        </p>
                      )}
                    </td>
                    <td className="py-2 pr-3 align-top">
                      {u.project ? (
                        <Link
                          href={`/dashboard/projecten/${u.project.id}`}
                          className="text-sdp-groen hover:underline"
                        >
                          {u.project.referentie}
                        </Link>
                      ) : (
                        <span className="text-xs text-gray-400">operationeel</span>
                      )}
                    </td>
                    <td
                      className={`py-2 pr-3 align-top text-right font-mono font-semibold ${
                        u.status === 'GOEDGEKEURD' ? '' : 'text-gray-400'
                      }`}
                    >
                      {srdFormat(Number(u.bedrag))}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-semibold">
                  <td colSpan={4} className="py-3 pr-3 text-right">
                    Totaal goedgekeurd:
                  </td>
                  <td className="py-3 pr-3 text-right font-mono">
                    {srdFormat(f.besteed)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}

function StatusBadge({ status }: { status: UitgaveStatus }) {
  const stijl: Record<UitgaveStatus, string> = {
    AANGEVRAAGD: 'bg-amber-100 text-amber-800',
    GOEDGEKEURD: 'bg-emerald-100 text-emerald-800',
    AFGEKEURD: 'bg-red-100 text-red-800',
  };
  const label: Record<UitgaveStatus, string> = {
    AANGEVRAAGD: 'wacht',
    GOEDGEKEURD: '✓ goedgekeurd',
    AFGEKEURD: '✗ afgekeurd',
  };
  return (
    <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${stijl[status]}`}>
      {label[status]}
    </span>
  );
}

function Verdeling({
  label,
  bedrag,
  totaal,
  kleur,
}: {
  label: string;
  bedrag: number;
  totaal: number;
  kleur: string;
}) {
  const pct = totaal > 0 ? Math.round((bedrag / totaal) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between text-sm">
        <span>{label}</span>
        <span className="font-mono">
          {srdFormat(bedrag)} <span className="text-gray-500">({pct}%)</span>
        </span>
      </div>
      <div className="mt-1 h-2 w-full rounded-full bg-gray-200">
        <div className={`h-2 rounded-full ${kleur}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}
