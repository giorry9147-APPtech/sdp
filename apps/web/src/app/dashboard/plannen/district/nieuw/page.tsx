'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useDashboard } from '@/lib/dashboard-context';
import {
  api,
  type Prioriteit,
  type RessortAggregatie,
} from '@/lib/api';
import { PrioriteitEditor } from '../../_components/prioriteit-editor';

export default function NieuwDistrictsplanPage() {
  const router = useRouter();
  const { sessie, activeDistrictId } = useDashboard();

  const [jaar, setJaar] = useState(new Date().getFullYear());
  const [titel, setTitel] = useState('');
  const [inleiding, setInleiding] = useState('');
  const [prioriteiten, setPrioriteiten] = useState<Prioriteit[]>([]);
  const [aggregatie, setAggregatie] = useState<RessortAggregatie | null>(null);
  const [aggrLaden, setAggrLaden] = useState(false);
  const [aggrFout, setAggrFout] = useState<string | null>(null);
  const [importGedaan, setImportGedaan] = useState<Set<string>>(new Set());

  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  // Aggregatie laden bij district + jaar verandering
  useEffect(() => {
    if (!activeDistrictId) return;
    setAggrLaden(true);
    setAggrFout(null);
    api
      .ressortplanAggregatie(activeDistrictId, jaar, sessie.accessToken)
      .then(setAggregatie)
      .catch((e) => setAggrFout(e instanceof Error ? e.message : 'fout'))
      .finally(() => setAggrLaden(false));
  }, [activeDistrictId, jaar, sessie.accessToken]);

  function importeerPrioriteit(ressortNaam: string, p: Prioriteit, idx: number) {
    const sleutel = `${ressortNaam}-${idx}`;
    if (importGedaan.has(sleutel)) return;

    setPrioriteiten([
      ...prioriteiten,
      {
        titel: `[${ressortNaam}] ${p.titel}`,
        onderbouwing: p.onderbouwing,
        urgentie: p.urgentie,
        kostenraming: p.kostenraming,
        doelgroep: p.doelgroep,
        verwachteImpact: p.verwachteImpact,
      },
    ]);
    setImportGedaan(new Set([...importGedaan, sleutel]));
  }

  function importeerAlleVanRessort(ressortNaam: string, lijst: Prioriteit[]) {
    const nieuwe = lijst
      .map((p, idx) => ({ p, sleutel: `${ressortNaam}-${idx}`, idx }))
      .filter((x) => !importGedaan.has(x.sleutel));

    setPrioriteiten([
      ...prioriteiten,
      ...nieuwe.map(({ p }) => ({
        titel: `[${ressortNaam}] ${p.titel}`,
        onderbouwing: p.onderbouwing,
        urgentie: p.urgentie,
        kostenraming: p.kostenraming,
        doelgroep: p.doelgroep,
        verwachteImpact: p.verwachteImpact,
      })),
    ]);
    setImportGedaan(
      new Set([...importGedaan, ...nieuwe.map((x) => x.sleutel)]),
    );
  }

  const geldig = useMemo(() => {
    if (!activeDistrictId) return false;
    if (titel.length < 3) return false;
    if (prioriteiten.length === 0) return false;
    return prioriteiten.every(
      (p) => p.titel.length >= 3 && p.onderbouwing.length >= 10,
    );
  }, [activeDistrictId, titel, prioriteiten]);

  async function opslaan(e: React.FormEvent) {
    e.preventDefault();
    if (!geldig) return;
    setBezig(true);
    setFout(null);
    try {
      const r = await api.districtsplanMaak(
        {
          districtId: activeDistrictId,
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
      router.push(`/dashboard/plannen/district/${r.id}`);
    } catch (e) {
      setFout(e instanceof Error ? e.message : 'fout');
      setBezig(false);
    }
  }

  return (
    <form onSubmit={opslaan} className="space-y-6">
      <nav className="text-sm">
        <Link href="/dashboard/plannen" className="text-sdp-groen hover:underline">
          ← Plannen
        </Link>
      </nav>

      <header>
        <h1 className="text-2xl font-bold text-sdp-groen">Nieuw districtsplan</h1>
        <p className="text-sm text-gray-600">
          Aggregeer de prioriteiten uit goedgekeurde ressortplannen tot één
          districtsplan ter goedkeuring door DR en RO.
        </p>
      </header>

      <section className="space-y-4 rounded-lg bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Plangegevens</h2>

        <Veld label="Jaar" verplicht>
          <input
            type="number"
            required
            min={2025}
            max={2099}
            value={jaar}
            onChange={(e) => setJaar(Number(e.target.value))}
            className="w-full rounded border-gray-300 sm:w-32"
          />
        </Veld>

        <Veld label="Titel" verplicht>
          <input
            type="text"
            required
            minLength={3}
            maxLength={200}
            value={titel}
            onChange={(e) => setTitel(e.target.value)}
            className="w-full rounded border-gray-300"
            placeholder={`bv. Districtsplan ${jaar} — integrale aanpak per ressort`}
          />
        </Veld>

        <Veld label="Inleiding (optioneel)">
          <textarea
            rows={3}
            maxLength={5000}
            value={inleiding}
            onChange={(e) => setInleiding(e.target.value)}
            className="w-full rounded border-gray-300"
          />
        </Veld>
      </section>

      {/* Aggregatie panel — kern van decentralisatie */}
      <section className="space-y-4 rounded-lg border-2 border-sdp-groen/30 bg-emerald-50/30 p-5">
        <header className="flex items-baseline justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold text-sdp-groen">
              Input van ressorten — bottom-up
            </h2>
            <p className="text-sm text-gray-700">
              Goedgekeurde ressortplannen voor jaar {jaar}. Importeer
              prioriteiten één voor één of per ressort.
            </p>
          </div>
        </header>

        {aggrLaden && <p className="text-sm text-gray-500">Aggregatie laden…</p>}
        {aggrFout && (
          <p className="rounded border border-red-300 bg-red-50 p-2 text-sm text-red-800">
            Aggregatie laden faalde: {aggrFout}
          </p>
        )}

        {aggregatie && aggregatie.perRessort.length === 0 && !aggrLaden && (
          <div className="rounded border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            Geen goedgekeurde ressortplannen voor {jaar}. Het districtsplan
            kan zonder aggregatie worden opgesteld, maar dat is bestuurlijk
            niet zoals WRO bedoeld is.
          </div>
        )}

        {aggregatie && aggregatie.perRessort.length > 0 && (
          <>
            <p className="text-xs text-gray-600">
              <strong>{aggregatie.aantalRessorten}</strong> ressort(en) ·{' '}
              <strong>{aggregatie.totaalPrioriteiten}</strong> prioriteiten
              beschikbaar
            </p>
            <div className="space-y-3">
              {aggregatie.perRessort.map((r) => (
                <details
                  key={r.ressort.id}
                  open
                  className="rounded border border-gray-200 bg-white"
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-3 p-3">
                    <div>
                      <span className="font-semibold">{r.ressort.naam}</span>
                      <span className="ml-2 text-xs text-gray-500">
                        {r.plan.titel} · v{r.plan.versie} ·{' '}
                        {r.prioriteiten.length} prioriteiten
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        importeerAlleVanRessort(r.ressort.naam, r.prioriteiten);
                      }}
                      className="rounded bg-sdp-groen px-2.5 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
                    >
                      Alles importeren
                    </button>
                  </summary>
                  <ul className="divide-y border-t">
                    {r.prioriteiten.map((p, idx) => {
                      const sleutel = `${r.ressort.naam}-${idx}`;
                      const gedaan = importGedaan.has(sleutel);
                      return (
                        <li
                          key={idx}
                          className="flex items-start justify-between gap-3 p-3 text-sm"
                        >
                          <div className="min-w-0 flex-1">
                            <div className="font-medium">{p.titel}</div>
                            <div className="mt-0.5 text-xs text-gray-600 line-clamp-2">
                              {p.onderbouwing}
                            </div>
                          </div>
                          <button
                            type="button"
                            disabled={gedaan}
                            onClick={() =>
                              importeerPrioriteit(r.ressort.naam, p, idx)
                            }
                            className={`shrink-0 rounded px-2 py-1 text-xs font-semibold ${
                              gedaan
                                ? 'bg-gray-100 text-gray-400'
                                : 'bg-sdp-groen text-white hover:bg-emerald-700'
                            }`}
                          >
                            {gedaan ? '✓ ' : '+'} importeer
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </details>
              ))}
            </div>
          </>
        )}
      </section>

      {/* Prioriteiten van het districtsplan zelf */}
      <section className="space-y-3 rounded-lg bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">
          Prioriteiten van het districtsplan ({prioriteiten.length})
        </h2>
        <p className="text-sm text-gray-600">
          Importeer uit ressortplannen of voeg eigen prioriteiten toe. U kunt
          tekst aanpassen na import.
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
          className="rounded-lg bg-sdp-groen px-6 py-2.5 font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-50"
        >
          {bezig ? 'Bezig…' : 'Districtsplan opslaan (concept)'}
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
