'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useDashboard } from '@/lib/dashboard-context';
import { api, type FondsDetail, type ProjectLijst } from '@/lib/api';
import { srdFormat } from '@/lib/status-stijl';

export default function FondsDetailPage({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const { sessie, activeDistrictId, heeft } = useDashboard();
  const [f, setF] = useState<FondsDetail | null>(null);
  const [projecten, setProjecten] = useState<ProjectLijst[]>([]);
  const [fout, setFout] = useState<string | null>(null);

  // Boek-form
  const [bedrag, setBedrag] = useState<number | ''>('');
  const [beschrijving, setBeschrijving] = useState('');
  const [projectId, setProjectId] = useState<number | ''>('');
  const [bezig, setBezig] = useState(false);
  const [waarschuwing, setWaarschuwing] = useState<string | null>(null);

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
        setWaarschuwing('⚠️ Deze uitgave veroorzaakt budget-overschrijding. Audit-trail vastgelegd.');
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
          {f.goedgekeurd && (
            <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
              ✓ Goedgekeurd
            </span>
          )}
        </div>

        <div className="mt-4 h-3 w-full rounded-full bg-gray-200">
          <div
            className={`h-3 rounded-full ${
              pct > 100 ? 'bg-red-500' : pct > 90 ? 'bg-amber-500' : 'bg-sdp-groen'
            }`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>

        <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
          <div>
            <p className="text-xs text-gray-500">Totaal</p>
            <p className="text-xl font-bold">{srdFormat(budget)}</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Besteed</p>
            <p className="text-xl font-bold">{srdFormat(f.besteed)}</p>
            <p className="text-xs text-gray-500">{pct}%</p>
          </div>
          <div>
            <p className="text-xs text-gray-500">Restant</p>
            <p className={`text-xl font-bold ${f.restant < 0 ? 'text-red-600' : 'text-sdp-groen'}`}>
              {srdFormat(f.restant)}
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

      {/* Boek-uitgave form */}
      {heeft('fonds.boek') && (
        <form onSubmit={boek} className="space-y-3 rounded-lg border-2 border-sdp-groen/30 bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Uitgave boeken</h2>
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
            Boek uitgave
          </button>
        </form>
      )}

      {fout && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {fout}
        </div>
      )}

      {/* Uitgaven-grootboek */}
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
                  <th className="py-2 pr-3">Beschrijving</th>
                  <th className="py-2 pr-3">Project</th>
                  <th className="py-2 pr-3 text-right">Bedrag</th>
                </tr>
              </thead>
              <tbody>
                {f.uitgaven.map((u) => (
                  <tr key={u.id} className="border-b last:border-0">
                    <td className="py-2 pr-3 text-xs text-gray-600">
                      {new Date(u.geboektOp).toLocaleDateString('nl-NL')}
                    </td>
                    <td className="py-2 pr-3">{u.beschrijving}</td>
                    <td className="py-2 pr-3">
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
                    <td className="py-2 pr-3 text-right font-mono font-semibold">
                      {srdFormat(Number(u.bedrag))}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 font-semibold">
                  <td colSpan={3} className="py-3 pr-3 text-right">
                    Totaal:
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
