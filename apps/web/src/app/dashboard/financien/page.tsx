'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDashboard } from '@/lib/dashboard-context';
import { api, type FondsLijst } from '@/lib/api';
import { srdFormat } from '@/lib/status-stijl';

export default function FinancienPage() {
  const { sessie, activeDistrictId, heeft } = useDashboard();
  const [jaar, setJaar] = useState(new Date().getFullYear());
  const [fondsen, setFondsen] = useState<FondsLijst[]>([]);
  const [fout, setFout] = useState<string | null>(null);

  // Maak-fonds form
  const [tonenMaakForm, setTonenMaakForm] = useState(false);
  const [budget, setBudget] = useState<number | ''>('');
  const [bezig, setBezig] = useState(false);

  function herlaad() {
    api
      .fondsenLijst(sessie.accessToken, {
        districtId: heeft('fonds.read') && !heeft('dashboard.nationaal') ? activeDistrictId : undefined,
        jaar,
      })
      .then(setFondsen)
      .catch((e) => setFout(e instanceof Error ? e.message : 'fout'));
  }

  useEffect(herlaad, [jaar, sessie.accessToken, activeDistrictId, heeft]);

  async function maakFonds(e: React.FormEvent) {
    e.preventDefault();
    if (!budget || !activeDistrictId) return;
    setBezig(true);
    try {
      await api.fondsMaak(
        {
          districtId: activeDistrictId,
          jaar,
          totaalBudget: Number(budget),
          goedgekeurd: true,
        },
        sessie.accessToken,
      );
      setTonenMaakForm(false);
      setBudget('');
      herlaad();
    } catch (e) {
      setFout(e instanceof Error ? e.message : 'fout');
    } finally {
      setBezig(false);
    }
  }

  const totaalBudget = fondsen.reduce((s, f) => s + Number(f.totaalBudget), 0);
  const totaalBesteed = fondsen.reduce((s, f) => s + f.besteed, 0);
  const totaalRestant = totaalBudget - totaalBesteed;

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-sdp-groen">Districtsfonds</h1>
          <p className="text-sm text-gray-600">
            Wet Interim Financiële Decentralisatie (Wet Fid, art. 40) — begroting
            en uitgaven van het districtsfonds. Read-only voor de meeste rollen;
            DC en financieel medewerker boeken uitgaven.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <label className="text-sm">
            <span className="mr-2 text-gray-600">Jaar</span>
            <select
              value={jaar}
              onChange={(e) => setJaar(Number(e.target.value))}
              className="rounded border-gray-300"
            >
              {[2024, 2025, 2026, 2027].map((j) => (
                <option key={j} value={j}>
                  {j}
                </option>
              ))}
            </select>
          </label>
          {heeft('fonds.goedkeur') && fondsen.length === 0 && (
            <button
              onClick={() => setTonenMaakForm((t) => !t)}
              className="rounded bg-sdp-groen px-3 py-1.5 text-sm font-semibold text-white shadow hover:bg-emerald-700"
            >
              + Begroting aanmaken
            </button>
          )}
        </div>
      </header>

      {/* Pilot-banner */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
        <strong>Fase 2 module — in piloting.</strong> Geld dat hier geboekt
        wordt is administratief, niet transactioneel. CLAD-koppeling +
        4-ogen-principe voor uitgaven komen in vervolgsprint.
      </div>

      {/* Maak-form */}
      {tonenMaakForm && heeft('fonds.goedkeur') && (
        <form onSubmit={maakFonds} className="space-y-3 rounded-lg bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Nieuwe begroting voor {jaar}</h2>
          <label className="block text-sm">
            <span className="mb-1 block font-medium">Totaal budget (SRD)</span>
            <input
              type="number"
              required
              min={0}
              step={10000}
              value={budget}
              onChange={(e) => setBudget(e.target.value ? Number(e.target.value) : '')}
              className="w-full rounded border-gray-300 sm:w-64"
              placeholder="bv. 1500000"
            />
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              disabled={bezig || !budget}
              className="rounded bg-sdp-groen px-4 py-2 text-sm font-semibold text-white shadow disabled:opacity-50"
            >
              Aanmaken + goedkeuren
            </button>
            <button
              type="button"
              onClick={() => setTonenMaakForm(false)}
              className="rounded px-4 py-2 text-sm text-gray-700 hover:underline"
            >
              Annuleren
            </button>
          </div>
        </form>
      )}

      {fout && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {fout}
        </div>
      )}

      {fondsen.length === 0 && !fout && (
        <p className="rounded-lg bg-white p-6 text-sm text-gray-500 shadow-sm">
          Geen begroting voor {jaar}.
        </p>
      )}

      {fondsen.length > 1 && (
        <div className="grid gap-3 sm:grid-cols-3">
          <KPI titel="Totaal budget" waarde={srdFormat(totaalBudget)} />
          <KPI titel="Besteed" waarde={srdFormat(totaalBesteed)} />
          <KPI titel="Restant" waarde={srdFormat(totaalRestant)} accent={totaalRestant < 0 ? 'rood' : 'groen'} />
        </div>
      )}

      {fondsen.map((f) => (
        <Link
          key={f.id}
          href={`/dashboard/financien/${f.id}`}
          className="block rounded-lg bg-white p-6 shadow-sm transition hover:shadow"
        >
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-sdp-groen">
                Districtsfonds {f.district.naam} — {f.jaar}
              </h2>
              <p className="text-xs text-gray-500">
                {f._count.uitgaven} uitgaven geboekt
                {f.goedgekeurd ? ' · ✓ goedgekeurd' : ' · ⚠️ niet goedgekeurd'}
              </p>
            </div>
            <span
              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                f.pctBesteed > 90
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {f.pctBesteed}% besteed
            </span>
          </div>

          <div className="mt-4 h-3 w-full rounded-full bg-gray-200">
            <div
              className={`h-3 rounded-full ${
                f.pctBesteed > 100
                  ? 'bg-red-500'
                  : f.pctBesteed > 90
                  ? 'bg-amber-500'
                  : 'bg-sdp-groen'
              }`}
              style={{ width: `${Math.min(f.pctBesteed, 100)}%` }}
            />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 text-sm">
            <div>
              <p className="text-xs text-gray-500">Totaal</p>
              <p className="font-semibold">{srdFormat(Number(f.totaalBudget))}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Besteed</p>
              <p className="font-semibold">{srdFormat(f.besteed)}</p>
            </div>
            <div>
              <p className="text-xs text-gray-500">Restant</p>
              <p className={`font-semibold ${f.restant < 0 ? 'text-red-600' : 'text-sdp-groen'}`}>
                {srdFormat(f.restant)}
              </p>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}

function KPI({
  titel,
  waarde,
  accent,
}: {
  titel: string;
  waarde: string;
  accent?: 'groen' | 'rood';
}) {
  return (
    <div className="rounded-lg bg-white p-4 shadow-sm">
      <p className="text-xs text-gray-500">{titel}</p>
      <p
        className={`mt-1 text-xl font-bold ${
          accent === 'rood' ? 'text-sdp-rood' : 'text-sdp-groen'
        }`}
      >
        {waarde}
      </p>
    </div>
  );
}
