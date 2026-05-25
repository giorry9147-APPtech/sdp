'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboard } from '@/lib/dashboard-context';
import { api, type Categorie, type Ressort } from '@/lib/api';

export default function NieuwProjectPage() {
  const router = useRouter();
  const { sessie, activeDistrictId } = useDashboard();

  const [ressorten, setRessorten] = useState<Ressort[]>([]);
  const [categorieen, setCategorieen] = useState<Categorie[]>([]);

  const [titel, setTitel] = useState('');
  const [beschrijving, setBeschrijving] = useState('');
  const [ressortId, setRessortId] = useState<number | ''>('');
  const [categorieId, setCategorieId] = useState<number | ''>('');
  const [contractor, setContractor] = useState('');
  const [budget, setBudget] = useState<number | ''>('');
  const [startDatum, setStartDatum] = useState('');
  const [eindDatumPlan, setEindDatumPlan] = useState('');

  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  useEffect(() => {
    if (!activeDistrictId) return;
    api
      .ressorten()
      .then((r) => setRessorten(r.filter((x) => x.districtId === activeDistrictId)))
      .catch(() => setRessorten([]));
    api.categorieen('project').then(setCategorieen).catch(() => setCategorieen([]));
  }, [activeDistrictId]);

  const geldig = useMemo(() => {
    if (!activeDistrictId) return false;
    if (titel.length < 3) return false;
    return true;
  }, [activeDistrictId, titel]);

  async function opslaan(e: React.FormEvent) {
    e.preventDefault();
    if (!geldig) return;
    setBezig(true);
    setFout(null);
    try {
      const p = await api.projectMaak(
        {
          districtId: activeDistrictId,
          ressortId: ressortId ? Number(ressortId) : undefined,
          categorieId: categorieId ? Number(categorieId) : undefined,
          titel,
          beschrijving: beschrijving || undefined,
          contractor: contractor || undefined,
          budgetIndicatief: budget ? Number(budget) : undefined,
          startDatum: startDatum || undefined,
          eindDatumPlan: eindDatumPlan || undefined,
        },
        sessie.accessToken,
      );
      router.push(`/dashboard/projecten/${p.id}`);
    } catch (e) {
      setFout(e instanceof Error ? e.message : 'fout');
      setBezig(false);
    }
  }

  return (
    <form onSubmit={opslaan} className="space-y-6">
      <nav className="text-sm">
        <Link href="/dashboard/projecten" className="text-sdp-groen hover:underline">
          ← Projecten
        </Link>
      </nav>

      <header>
        <h1 className="text-2xl font-bold text-sdp-groen">Nieuw project</h1>
        <p className="text-sm text-gray-600">
          Districtsproject aanmaken. Start als &quot;Idee&quot; — DC keurt later goed.
          Voortgangslogboek wordt automatisch bijgehouden.
        </p>
      </header>

      <section className="space-y-4 rounded-lg bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Projectgegevens</h2>

        <Veld label="Titel" verplicht>
          <input
            type="text"
            required
            minLength={3}
            maxLength={200}
            value={titel}
            onChange={(e) => setTitel(e.target.value)}
            className="w-full rounded border-gray-300"
            placeholder="bv. Renovatie Lelydorpweg Noord"
          />
        </Veld>

        <Veld label="Beschrijving">
          <textarea
            rows={4}
            maxLength={5000}
            value={beschrijving}
            onChange={(e) => setBeschrijving(e.target.value)}
            className="w-full rounded border-gray-300"
            placeholder="Wat omvat het project? Omvang, doel, doelgroep."
          />
        </Veld>

        <div className="grid gap-3 sm:grid-cols-2">
          <Veld label="Ressort (optioneel — districtsbreed indien leeg)">
            <select
              value={ressortId}
              onChange={(e) => setRessortId(e.target.value ? Number(e.target.value) : '')}
              className="w-full rounded border-gray-300"
            >
              <option value="">— districtsbreed —</option>
              {ressorten.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.naam}
                </option>
              ))}
            </select>
          </Veld>

          <Veld label="Categorie">
            <select
              value={categorieId}
              onChange={(e) => setCategorieId(e.target.value ? Number(e.target.value) : '')}
              className="w-full rounded border-gray-300"
            >
              <option value="">— kies een categorie —</option>
              {categorieen.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.naam}
                </option>
              ))}
            </select>
          </Veld>
        </div>
      </section>

      <section className="space-y-4 rounded-lg bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Planning & budget</h2>

        <div className="grid gap-3 sm:grid-cols-3">
          <Veld label="Budget indicatief (SRD)">
            <input
              type="number"
              min={0}
              step={1000}
              value={budget}
              onChange={(e) => setBudget(e.target.value ? Number(e.target.value) : '')}
              className="w-full rounded border-gray-300"
              placeholder="0"
            />
          </Veld>

          <Veld label="Startdatum (plan)">
            <input
              type="date"
              value={startDatum}
              onChange={(e) => setStartDatum(e.target.value)}
              className="w-full rounded border-gray-300"
            />
          </Veld>

          <Veld label="Einddatum (plan)">
            <input
              type="date"
              value={eindDatumPlan}
              onChange={(e) => setEindDatumPlan(e.target.value)}
              className="w-full rounded border-gray-300"
            />
          </Veld>
        </div>

        <Veld label="Contractor">
          <input
            type="text"
            maxLength={200}
            value={contractor}
            onChange={(e) => setContractor(e.target.value)}
            className="w-full rounded border-gray-300"
            placeholder="bv. Wanica Wegenbouw N.V."
          />
        </Veld>
      </section>

      {fout && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {fout}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <Link
          href="/dashboard/projecten"
          className="rounded px-4 py-2 text-sm text-gray-700 hover:underline"
        >
          Annuleren
        </Link>
        <button
          type="submit"
          disabled={!geldig || bezig}
          className="rounded-lg bg-sdp-groen px-6 py-2.5 font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-50"
        >
          {bezig ? 'Bezig…' : 'Project aanmaken'}
        </button>
      </div>
    </form>
  );
}

function Veld({
  label,
  verplicht,
  children,
}: {
  label: string;
  verplicht?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1 block text-sm font-medium text-gray-700">
        {label}
        {verplicht && <span className="ml-1 text-red-600">*</span>}
      </span>
      {children}
    </label>
  );
}
