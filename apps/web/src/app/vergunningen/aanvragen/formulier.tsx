'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { api, type Categorie, type District } from '@/lib/api';

type Bericht =
  | { soort: 'idle' }
  | { soort: 'bezig' }
  | { soort: 'gelukt'; ref: string }
  | { soort: 'fout'; bericht: string };

export function AanvraagFormulier({
  districten,
  categorieen,
}: {
  districten: District[];
  categorieen: Categorie[];
}) {
  const [districtId, setDistrictId] = useState<number | ''>('');
  const [categorieId, setCategorieId] = useState<number | ''>('');
  const [titel, setTitel] = useState('');
  const [beschrijving, setBeschrijving] = useState('');
  const [locatie, setLocatie] = useState('');
  const [aanvragerSoort, setAanvragerSoort] = useState<'BURGER' | 'ONDERNEMING'>('ONDERNEMING');
  const [aanvragerNaam, setAanvragerNaam] = useState('');
  const [aanvragerTelefoon, setAanvragerTelefoon] = useState('');
  const [aanvragerEmail, setAanvragerEmail] = useState('');
  const [aanvragerKkfNummer, setAanvragerKkfNummer] = useState('');
  const [bericht, setBericht] = useState<Bericht>({ soort: 'idle' });

  const geldig = useMemo(() => {
    if (!districtId || !categorieId) return false;
    if (titel.length < 3 || beschrijving.length < 10) return false;
    if (!aanvragerNaam || !aanvragerTelefoon || !aanvragerEmail) return false;
    if (aanvragerSoort === 'ONDERNEMING' && aanvragerKkfNummer.length < 3) return false;
    return true;
  }, [
    districtId,
    categorieId,
    titel,
    beschrijving,
    aanvragerNaam,
    aanvragerTelefoon,
    aanvragerEmail,
    aanvragerSoort,
    aanvragerKkfNummer,
  ]);

  async function dien(e: React.FormEvent) {
    e.preventDefault();
    if (!geldig) return;
    setBericht({ soort: 'bezig' });

    try {
      const r = await api.vergunningAanvragen({
        districtId,
        categorieId,
        titel,
        beschrijving,
        locatieOmschrijving: locatie || undefined,
        aanvragerSoort,
        aanvragerNaam,
        aanvragerTelefoon,
        aanvragerEmail,
        aanvragerKkfNummer:
          aanvragerSoort === 'ONDERNEMING' ? aanvragerKkfNummer : undefined,
      });
      setBericht({ soort: 'gelukt', ref: r.referentie });
    } catch (e) {
      setBericht({
        soort: 'fout',
        bericht: e instanceof Error ? e.message : 'Onbekende fout',
      });
    }
  }

  if (bericht.soort === 'gelukt') {
    return (
      <div className="mt-8 rounded-lg border border-emerald-300 bg-emerald-50 p-6">
        <h2 className="text-xl font-semibold text-emerald-900">
          Uw aanvraag is ontvangen.
        </h2>
        <p className="mt-2 text-emerald-900">Uw referentienummer:</p>
        <p className="mt-1 font-mono text-2xl font-bold text-emerald-700">
          {bericht.ref}
        </p>
        <p className="mt-4 text-sm text-emerald-900">
          Bewaar dit nummer. Volg de behandeling via{' '}
          <Link
            href={`/vergunningen/status?ref=${encodeURIComponent(bericht.ref)}`}
            className="font-medium underline"
          >
            statuspagina vergunningen
          </Link>
          .
        </p>
        <p className="mt-3 text-xs text-emerald-800">
          De DC behandelt aanvragen doorgaans binnen 14 dagen. Bij vragen
          neemt het districtscommissariaat contact op met u via het opgegeven
          e-mailadres of telefoonnummer.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={dien} className="mt-6 space-y-6 rounded-lg bg-white p-6 shadow-sm">
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">Wat is uw aanvraag?</legend>

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

        <Veld label="Soort vergunning" verplicht>
          <select
            required
            value={categorieId}
            onChange={(e) => setCategorieId(e.target.value ? Number(e.target.value) : '')}
            className="w-full rounded border-gray-300"
          >
            <option value="">— kies een soort vergunning —</option>
            {categorieen.map((c) => (
              <option key={c.id} value={c.id}>
                {c.naam}
              </option>
            ))}
          </select>
        </Veld>

        <Veld label="Korte titel" verplicht>
          <input
            type="text"
            required
            minLength={3}
            maxLength={200}
            value={titel}
            onChange={(e) => setTitel(e.target.value)}
            className="w-full rounded border-gray-300"
            placeholder="bv. Marktstand zaterdag 15 juni"
          />
        </Veld>

        <Veld label="Omschrijving" verplicht>
          <textarea
            required
            minLength={10}
            maxLength={5000}
            rows={5}
            value={beschrijving}
            onChange={(e) => setBeschrijving(e.target.value)}
            className="w-full rounded border-gray-300"
            placeholder="Wat wilt u doen? Wanneer? Hoe lang? Wat zijn de gevolgen voor de omgeving?"
          />
        </Veld>

        <Veld label="Locatie">
          <input
            type="text"
            value={locatie}
            onChange={(e) => setLocatie(e.target.value)}
            className="w-full rounded border-gray-300"
            placeholder="bv. Lelydorp markt, stand 4"
          />
        </Veld>
      </fieldset>

      <fieldset className="space-y-4 border-t pt-5">
        <legend className="text-lg font-semibold">Wie vraagt aan?</legend>

        <Veld label="Type aanvrager" verplicht>
          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="aanvragerSoort"
                checked={aanvragerSoort === 'BURGER'}
                onChange={() => setAanvragerSoort('BURGER')}
              />
              Burger / natuurlijk persoon
            </label>
            <label className="flex items-center gap-2">
              <input
                type="radio"
                name="aanvragerSoort"
                checked={aanvragerSoort === 'ONDERNEMING'}
                onChange={() => setAanvragerSoort('ONDERNEMING')}
              />
              Onderneming
            </label>
          </div>
        </Veld>

        <div className="grid gap-3 sm:grid-cols-2">
          <Veld
            label={aanvragerSoort === 'ONDERNEMING' ? 'Bedrijfsnaam' : 'Volledige naam'}
            verplicht
          >
            <input
              type="text"
              required
              value={aanvragerNaam}
              onChange={(e) => setAanvragerNaam(e.target.value)}
              className="w-full rounded border-gray-300"
            />
          </Veld>
          {aanvragerSoort === 'ONDERNEMING' && (
            <Veld label="KKF-inschrijfnummer" verplicht>
              <input
                type="text"
                required
                minLength={3}
                value={aanvragerKkfNummer}
                onChange={(e) => setAanvragerKkfNummer(e.target.value)}
                className="w-full rounded border-gray-300"
                placeholder="bv. KKF-12345"
              />
            </Veld>
          )}
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <Veld label="Telefoon (WhatsApp)" verplicht>
            <input
              type="tel"
              required
              value={aanvragerTelefoon}
              onChange={(e) => setAanvragerTelefoon(e.target.value)}
              className="w-full rounded border-gray-300"
            />
          </Veld>
          <Veld label="E-mail" verplicht>
            <input
              type="email"
              required
              value={aanvragerEmail}
              onChange={(e) => setAanvragerEmail(e.target.value)}
              className="w-full rounded border-gray-300"
            />
          </Veld>
        </div>
      </fieldset>

      <div className="rounded border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
        Bewijsdocumenten (KvK-uittreksel, plattegrond, geluidsmeting, etc.)
        kunt u na ontvangst van uw referentienummer per e-mail nasturen.
        Online upload komt in Fase 2.
      </div>

      {bericht.soort === 'fout' && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          Indienen mislukt: {bericht.bericht}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 border-t pt-5">
        <button
          type="submit"
          disabled={!geldig || bericht.soort === 'bezig'}
          className="rounded-lg bg-sdp-groen px-6 py-2.5 font-semibold text-white shadow hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {bericht.soort === 'bezig' ? 'Bezig…' : 'Aanvraag indienen'}
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
