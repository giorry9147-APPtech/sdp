'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { useDashboard } from '@/lib/dashboard-context';
import { api, type District, type Zaaktype, type ZaaktypeDetail } from '@/lib/api';

/**
 * EO8 — "nieuw verzoek"-wizard voor externe diensten. Kies zaaktype →
 * district → onderwerp/omschrijving → zaaktype-specifieke velden
 * (dynamisch uit de catalogus, ZF2).
 */
export default function NieuwVerzoekPage() {
  const router = useRouter();
  const { sessie } = useDashboard();

  const [zaaktypen, setZaaktypen] = useState<Zaaktype[]>([]);
  const [districten, setDistricten] = useState<District[]>([]);
  const [zaaktypeCode, setZaaktypeCode] = useState('');
  const [detail, setDetail] = useState<ZaaktypeDetail | null>(null);
  const [districtId, setDistrictId] = useState<number | ''>('');
  const [onderwerp, setOnderwerp] = useState('');
  const [omschrijving, setOmschrijving] = useState('');
  const [externeReferentie, setExterneReferentie] = useState('');
  const [eigenschappen, setEigenschappen] = useState<Record<string, string>>({});
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  useEffect(() => {
    api.zaaktypen('G2G').then(setZaaktypen).catch(() => setZaaktypen([]));
    api.districten().then(setDistricten).catch(() => setDistricten([]));
  }, []);

  useEffect(() => {
    if (!zaaktypeCode) {
      setDetail(null);
      return;
    }
    api.zaaktypeDetail(zaaktypeCode).then(setDetail).catch(() => setDetail(null));
    setEigenschappen({});
  }, [zaaktypeCode]);

  const geldig = useMemo(
    () => Boolean(zaaktypeCode && districtId && onderwerp.length >= 3 && omschrijving.length >= 10),
    [zaaktypeCode, districtId, onderwerp, omschrijving],
  );

  async function indien(e: React.FormEvent) {
    e.preventDefault();
    if (!geldig) return;
    setBezig(true);
    setFout(null);
    try {
      const schoon: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(eigenschappen)) {
        if (v !== '') schoon[k] = v;
      }
      const r = await api.verzoekIndienen(
        {
          zaaktypeCode,
          districtId: Number(districtId),
          onderwerp,
          omschrijving,
          externeReferentie: externeReferentie || undefined,
          eigenschappen: Object.keys(schoon).length ? schoon : undefined,
        },
        sessie.accessToken,
      );
      router.push(`/dashboard/verzoeken?ingediend=${encodeURIComponent(r.referentie)}`);
    } catch (e) {
      setFout(e instanceof Error ? e.message : 'fout');
      setBezig(false);
    }
  }

  return (
    <form onSubmit={indien} className="space-y-6">
      <nav className="text-sm">
        <Link href="/dashboard/verzoeken" className="text-sdp-groen hover:underline">
          ← Verzoeken
        </Link>
      </nav>

      <header>
        <h1 className="text-2xl font-bold text-sdp-groen">Nieuw verzoek</h1>
        <p className="text-sm text-gray-600">
          Dien een verzoek of adviesverzoek in bij een districtscommissariaat.
        </p>
      </header>

      <section className="space-y-4 rounded-lg bg-white p-5 shadow-sm">
        <Veld label="Type verzoek" verplicht>
          <select
            required
            value={zaaktypeCode}
            onChange={(e) => setZaaktypeCode(e.target.value)}
            className="w-full rounded border-gray-300"
          >
            <option value="">— kies een type —</option>
            {zaaktypen.map((z) => (
              <option key={z.code} value={z.code}>
                {z.naam}
              </option>
            ))}
          </select>
        </Veld>

        {detail && (
          <div className="rounded border border-sky-200 bg-sky-50 p-3 text-xs text-sky-900">
            {detail.beschrijving && <p>{detail.beschrijving}</p>}
            <p className="mt-1">
              SLA: <strong>{detail.slaWerkdagen} werkdagen</strong>
              {detail.wettelijkeGrondslag && <> · grondslag: {detail.wettelijkeGrondslag}</>}
            </p>
          </div>
        )}

        <Veld label="District" verplicht>
          <select
            required
            value={districtId}
            onChange={(e) => setDistrictId(e.target.value ? Number(e.target.value) : '')}
            className="w-full rounded border-gray-300"
          >
            <option value="">— kies een district —</option>
            {districten.map((d) => (
              <option key={d.id} value={d.id}>
                {d.naam}
              </option>
            ))}
          </select>
        </Veld>

        <Veld label="Onderwerp" verplicht>
          <input
            type="text"
            required
            minLength={3}
            maxLength={200}
            value={onderwerp}
            onChange={(e) => setOnderwerp(e.target.value)}
            className="w-full rounded border-gray-300"
            placeholder="bv. Adviesverzoek gronduitgifte perceel Lelydorp"
          />
        </Veld>

        <Veld label="Omschrijving" verplicht>
          <textarea
            required
            minLength={10}
            maxLength={5000}
            rows={4}
            value={omschrijving}
            onChange={(e) => setOmschrijving(e.target.value)}
            className="w-full rounded border-gray-300"
            placeholder="Wat wordt er van het districtscommissariaat verwacht?"
          />
        </Veld>

        <Veld label="Externe referentie (uw dossiernr)">
          <input
            type="text"
            maxLength={120}
            value={externeReferentie}
            onChange={(e) => setExterneReferentie(e.target.value)}
            className="w-full rounded border-gray-300"
            placeholder="bv. DOM-2026-0451"
          />
        </Veld>
      </section>

      {detail && detail.eigenschappen.length > 0 && (
        <section className="space-y-4 rounded-lg bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold">Aanvullende gegevens</h2>
          {detail.eigenschappen.map((eig) => (
            <Veld key={eig.code} label={eig.label} verplicht={eig.verplicht}>
              {eig.type === 'KEUZE' ? (
                <select
                  value={eigenschappen[eig.code] ?? ''}
                  onChange={(e) =>
                    setEigenschappen((s) => ({ ...s, [eig.code]: e.target.value }))
                  }
                  className="w-full rounded border-gray-300"
                >
                  <option value="">— kies —</option>
                  {eig.opties.map((o) => (
                    <option key={o} value={o}>
                      {o}
                    </option>
                  ))}
                </select>
              ) : eig.type === 'JA_NEE' ? (
                <select
                  value={eigenschappen[eig.code] ?? ''}
                  onChange={(e) =>
                    setEigenschappen((s) => ({ ...s, [eig.code]: e.target.value }))
                  }
                  className="w-full rounded border-gray-300"
                >
                  <option value="">— kies —</option>
                  <option value="true">Ja</option>
                  <option value="false">Nee</option>
                </select>
              ) : (
                <input
                  type={eig.type === 'GETAL' ? 'number' : eig.type === 'DATUM' ? 'date' : 'text'}
                  value={eigenschappen[eig.code] ?? ''}
                  onChange={(e) =>
                    setEigenschappen((s) => ({ ...s, [eig.code]: e.target.value }))
                  }
                  className="w-full rounded border-gray-300"
                />
              )}
            </Veld>
          ))}
        </section>
      )}

      {fout && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">{fout}</div>
      )}

      <div className="flex items-center justify-end gap-3">
        <Link href="/dashboard/verzoeken" className="rounded px-4 py-2 text-sm text-gray-700 hover:underline">
          Annuleren
        </Link>
        <button
          type="submit"
          disabled={!geldig || bezig}
          className="rounded-lg bg-sdp-groen px-6 py-2.5 font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-50"
        >
          {bezig ? 'Bezig…' : 'Verzoek indienen'}
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
