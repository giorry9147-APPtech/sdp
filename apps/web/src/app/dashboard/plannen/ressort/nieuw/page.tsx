'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboard } from '@/lib/dashboard-context';
import { api, type Prioriteit, type Ressort } from '@/lib/api';
import { PrioriteitEditor } from '../../_components/prioriteit-editor';

export default function NieuwRessortplanPage() {
  const router = useRouter();
  const { sessie, activeDistrictId, activeRessortId } = useDashboard();

  const [ressortId, setRessortId] = useState<number | ''>(activeRessortId ?? '');
  const [ressorten, setRessorten] = useState<Ressort[]>([]);
  const [jaar, setJaar] = useState(new Date().getFullYear());
  const [titel, setTitel] = useState('');
  const [inleiding, setInleiding] = useState('');
  const [prioriteiten, setPrioriteiten] = useState<Prioriteit[]>([
    { titel: '', onderbouwing: '', urgentie: 'MIDDEL' },
  ]);
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  // RC heeft één ressort; DC/secretaris mag voor elk ressort in district plannen
  useEffect(() => {
    if (activeRessortId) return;
    if (!activeDistrictId) return;
    api
      .ressorten()
      .then((r) => setRessorten(r.filter((x) => x.districtId === activeDistrictId)))
      .catch(() => setRessorten([]));
  }, [activeDistrictId, activeRessortId]);

  const geldig = useMemo(() => {
    if (!ressortId) return false;
    if (titel.length < 3) return false;
    if (prioriteiten.length === 0) return false;
    return prioriteiten.every(
      (p) => p.titel.length >= 3 && p.onderbouwing.length >= 10,
    );
  }, [ressortId, titel, prioriteiten]);

  async function indien(e: React.FormEvent) {
    e.preventDefault();
    if (!geldig || !ressortId) return;
    setBezig(true);
    setFout(null);
    try {
      const r = await api.ressortplanMaak(
        {
          ressortId: Number(ressortId),
          jaar,
          titel,
          inleiding: inleiding || undefined,
          prioriteiten: prioriteiten.map((p) => ({
            titel: p.titel,
            onderbouwing: p.onderbouwing,
            urgentie: p.urgentie,
            kostenraming: p.kostenraming
              ? typeof p.kostenraming === 'string'
                ? Number(p.kostenraming)
                : p.kostenraming
              : undefined,
            doelgroep: p.doelgroep || undefined,
            verwachteImpact: p.verwachteImpact || undefined,
          })),
        },
        sessie.accessToken,
      );
      router.push(`/dashboard/plannen/ressort/${r.id}`);
    } catch (e) {
      setFout(e instanceof Error ? e.message : 'fout');
      setBezig(false);
    }
  }

  return (
    <form onSubmit={indien} className="space-y-6">
      <nav className="text-sm">
        <Link
          href="/dashboard/plannen"
          className="text-sdp-groen hover:underline"
        >
          ← Plannen
        </Link>
      </nav>

      <header>
        <h1 className="text-2xl font-bold text-sdp-groen">Nieuw ressortplan</h1>
        <p className="text-sm text-gray-600">
          Stel prioriteiten op vanuit uw ressort. Na voltooiing kunt u het
          plan indienen ter goedkeuring bij de ressortraad.
        </p>
      </header>

      <section className="space-y-4 rounded-lg bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Plangegevens</h2>

        <div className="grid gap-3 sm:grid-cols-2">
          {activeRessortId ? (
            <Veld label="Ressort">
              <div className="rounded border bg-gray-50 px-3 py-2 text-sm text-gray-700">
                Uw ressort (#{activeRessortId})
              </div>
            </Veld>
          ) : (
            <Veld label="Ressort" verplicht>
              <select
                required
                value={ressortId}
                onChange={(e) =>
                  setRessortId(e.target.value ? Number(e.target.value) : '')
                }
                className="w-full rounded border-gray-300"
              >
                <option value="">— kies een ressort —</option>
                {ressorten.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.naam}
                  </option>
                ))}
              </select>
            </Veld>
          )}

          <Veld label="Jaar" verplicht>
            <input
              type="number"
              required
              min={2025}
              max={2099}
              value={jaar}
              onChange={(e) => setJaar(Number(e.target.value))}
              className="w-full rounded border-gray-300"
            />
          </Veld>
        </div>

        <Veld label="Titel" verplicht>
          <input
            type="text"
            required
            minLength={3}
            maxLength={200}
            value={titel}
            onChange={(e) => setTitel(e.target.value)}
            className="w-full rounded border-gray-300"
            placeholder="bv. Ressortplan Lelydorp 2026 — prioriteiten infrastructuur en publieke voorzieningen"
          />
        </Veld>

        <Veld label="Inleiding (optioneel)">
          <textarea
            rows={3}
            maxLength={5000}
            value={inleiding}
            onChange={(e) => setInleiding(e.target.value)}
            className="w-full rounded border-gray-300"
            placeholder="Korte context: hoe is dit plan tot stand gekomen? Welke hoorzittingen/consultaties hebben plaatsgevonden?"
          />
        </Veld>
      </section>

      <section className="space-y-3 rounded-lg bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">
          Prioriteiten <span className="text-sm text-gray-500">({prioriteiten.length})</span>
        </h2>
        <p className="text-sm text-gray-600">
          Volgorde bepaalt de rangschikking. De DC ziet uw prioriteiten in
          deze volgorde bij het opstellen van het districtsplan.
        </p>
        <PrioriteitEditor
          prioriteiten={prioriteiten}
          setPrioriteiten={setPrioriteiten}
        />
      </section>

      {fout && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {fout}
        </div>
      )}

      <div className="flex items-center justify-end gap-3">
        <Link
          href="/dashboard/plannen"
          className="rounded px-4 py-2 text-sm text-gray-700 hover:underline"
        >
          Annuleren
        </Link>
        <button
          type="submit"
          disabled={!geldig || bezig}
          className="rounded-lg bg-sdp-groen px-6 py-2.5 font-semibold text-white shadow hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {bezig ? 'Bezig…' : 'Plan opslaan (concept)'}
        </button>
      </div>

      <p className="text-xs text-gray-500">
        Opslaan maakt een conceptversie. U kunt deze later openen om in te dienen
        ter goedkeuring bij de ressortraad.
      </p>
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
