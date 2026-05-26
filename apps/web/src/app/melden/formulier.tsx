'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { api, type Categorie, type District, type Ressort } from '@/lib/api';

const MAX_FOTOS = 5;
const MAX_FOTO_BYTES = 5 * 1024 * 1024; // 5 MB
const TOEGESTANE_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
  'image/heif',
  'application/pdf',
];

type FotoState = {
  bestand: File;
  status: 'wachtend' | 'bezig' | 'klaar' | 'fout';
  fout?: string;
};

type Bericht =
  | { soort: 'idle' }
  | { soort: 'bezig' }
  | {
      soort: 'gelukt';
      ticket: string;
      autoToegewezen: boolean;
      fotosGeupload: number;
      fotosTotaal: number;
      fouten: string[];
    }
  | { soort: 'fout'; bericht: string };

export function MeldFormulier({
  districten,
  categorieen,
}: {
  districten: District[];
  categorieen: Categorie[];
}) {
  const [districtId, setDistrictId] = useState<number | ''>('');
  const [ressorten, setRessorten] = useState<Ressort[]>([]);
  const [ressortId, setRessortId] = useState<number | ''>('');
  const [categorieId, setCategorieId] = useState<number | ''>('');
  const [titel, setTitel] = useState('');
  const [omschrijving, setOmschrijving] = useState('');
  const [locatie, setLocatie] = useState('');
  const [urgentie, setUrgentie] = useState<'LAAG' | 'MIDDEL' | 'HOOG' | 'CRISIS'>('MIDDEL');
  const [melderNaam, setMelderNaam] = useState('');
  const [melderTelefoon, setMelderTelefoon] = useState('');
  const [melderEmail, setMelderEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [geo, setGeo] = useState<{ lat: number; lon: number } | null>(null);
  const [geoBezig, setGeoBezig] = useState(false);
  const [geoFout, setGeoFout] = useState<string | null>(null);
  const [fotos, setFotos] = useState<FotoState[]>([]);
  const [bericht, setBericht] = useState<Bericht>({ soort: 'idle' });

  useEffect(() => {
    if (!districtId) {
      setRessorten([]);
      setRessortId('');
      return;
    }
    const code = districten.find((d) => d.id === districtId)?.code;
    if (!code) return;
    api.ressorten(code).then(setRessorten).catch(() => setRessorten([]));
    setRessortId('');
  }, [districtId, districten]);

  // B2 — vraag locatie zodra de gebruiker een district kiest. Dit is het
  // moment waarop GPS écht relevant wordt en de browser-toestemming
  // contextueel logisch is (in plaats van bij page-load, wat blocks geeft).
  useEffect(() => {
    if (!districtId || geo || geoFout || geoBezig) return;
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setGeoFout('Geen GPS beschikbaar in deze browser');
      return;
    }
    setGeoBezig(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setGeo({ lat: p.coords.latitude, lon: p.coords.longitude });
        setGeoBezig(false);
      },
      (err) => {
        setGeoBezig(false);
        setGeoFout(
          err.code === err.PERMISSION_DENIED
            ? 'Geen toestemming voor locatie — u kunt zelf een straatadres invullen'
            : 'Locatie kon niet bepaald worden',
        );
      },
      { enableHighAccuracy: true, timeout: 10_000, maximumAge: 60_000 },
    );
  }, [districtId, geo, geoFout, geoBezig]);

  const formulierGeldig = useMemo(
    () => Boolean(districtId && categorieId && titel.length >= 3 && omschrijving.length >= 10),
    [districtId, categorieId, titel, omschrijving],
  );

  function locatieOphalen() {
    setGeoFout(null);
    setGeoBezig(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setGeo({ lat: p.coords.latitude, lon: p.coords.longitude });
        setGeoBezig(false);
      },
      (err) => {
        setGeoBezig(false);
        setGeoFout(
          err.code === err.PERMISSION_DENIED
            ? 'Locatie geweigerd — vul straat/kruispunt in'
            : 'Locatie kon niet bepaald worden',
        );
      },
      { enableHighAccuracy: true, timeout: 10_000 },
    );
  }

  function fotosToevoegen(e: React.ChangeEvent<HTMLInputElement>) {
    const nieuw: FotoState[] = [];
    const fouten: string[] = [];
    for (const f of Array.from(e.target.files ?? [])) {
      if (fotos.length + nieuw.length >= MAX_FOTOS) {
        fouten.push(`Maximaal ${MAX_FOTOS} bestanden`);
        break;
      }
      if (!TOEGESTANE_TYPES.includes(f.type)) {
        fouten.push(`${f.name}: type ${f.type || 'onbekend'} niet toegestaan`);
        continue;
      }
      if (f.size > MAX_FOTO_BYTES) {
        fouten.push(`${f.name}: groter dan 5 MB`);
        continue;
      }
      nieuw.push({ bestand: f, status: 'wachtend' });
    }
    if (fouten.length) {
      alert(fouten.join('\n'));
    }
    setFotos((huidig) => [...huidig, ...nieuw]);
    e.target.value = '';
  }

  function fotoVerwijderen(i: number) {
    setFotos((huidig) => huidig.filter((_, idx) => idx !== i));
  }

  async function indien(e: React.FormEvent) {
    e.preventDefault();
    if (!formulierGeldig) return;
    setBericht({ soort: 'bezig' });

    try {
      const r = await api.meldingIndienen({
        districtId,
        ressortId: ressortId || undefined,
        categorieId,
        titel,
        omschrijving,
        locatieOmschrijving: locatie || undefined,
        urgentie,
        latitude: geo?.lat,
        longitude: geo?.lon,
        melderNaam: melderNaam || undefined,
        melderTelefoon: melderTelefoon || undefined,
        melderEmail: melderEmail || undefined,
        melderConsent: consent,
      });

      // Upload alle gekozen foto's na succesvolle melding-create
      let gelukt = 0;
      const uploadFouten: string[] = [];
      for (let i = 0; i < fotos.length; i++) {
        const foto = fotos[i];
        setFotos((huidig) =>
          huidig.map((f, idx) => (idx === i ? { ...f, status: 'bezig' } : f)),
        );
        try {
          const pre = await api.meldingBijlagePresign(r.ticketNummer, {
            bestandsnaam: foto.bestand.name,
            mimeType: foto.bestand.type,
            grootte: foto.bestand.size,
          });
          const put = await fetch(pre.uploadUrl, {
            method: 'PUT',
            body: foto.bestand,
            headers: { 'Content-Type': foto.bestand.type },
          });
          if (!put.ok) throw new Error(`upload HTTP ${put.status}`);
          await api.meldingBijlageRegistreer(r.ticketNummer, {
            fileKey: pre.fileKey,
            bestandsnaam: foto.bestand.name,
            mimeType: foto.bestand.type,
            grootte: foto.bestand.size,
          });
          gelukt++;
          setFotos((huidig) =>
            huidig.map((f, idx) => (idx === i ? { ...f, status: 'klaar' } : f)),
          );
        } catch (err) {
          const msg = err instanceof Error ? err.message : 'onbekend';
          uploadFouten.push(`${foto.bestand.name}: ${msg}`);
          setFotos((huidig) =>
            huidig.map((f, idx) =>
              idx === i ? { ...f, status: 'fout', fout: msg } : f,
            ),
          );
        }
      }

      setBericht({
        soort: 'gelukt',
        ticket: r.ticketNummer,
        autoToegewezen: r.autoToegewezen,
        fotosGeupload: gelukt,
        fotosTotaal: fotos.length,
        fouten: uploadFouten,
      });
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
          Bedankt. Uw melding is geregistreerd.
        </h2>
        <p className="mt-2 text-emerald-900">Uw ticketnummer:</p>
        <p className="mt-1 font-mono text-2xl font-bold text-emerald-700">
          {bericht.ticket}
        </p>
        <p className="mt-4 text-sm text-emerald-900">
          Bewaar dit nummer. U kunt de status volgen op de{' '}
          <Link
            href={`/status?nr=${encodeURIComponent(bericht.ticket)}`}
            className="font-medium underline"
          >
            statuspagina
          </Link>
          .
        </p>
        {bericht.autoToegewezen && (
          <p className="mt-3 text-sm text-emerald-900">
            ✓ Uw melding is automatisch toegewezen aan de juiste afdeling op
            basis van de gekozen categorie.
          </p>
        )}
        {bericht.fotosTotaal > 0 && (
          <p className="mt-3 text-sm text-emerald-900">
            Foto&apos;s geüpload: {bericht.fotosGeupload} / {bericht.fotosTotaal}
          </p>
        )}
        {bericht.fouten.length > 0 && (
          <div className="mt-3 rounded border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900">
            <p className="font-semibold">Bij sommige foto&apos;s ging iets mis:</p>
            <ul className="ml-4 list-disc">
              {bericht.fouten.map((f, i) => (
                <li key={i}>{f}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={indien} className="mt-6 space-y-5 rounded-lg bg-white p-6 shadow-sm">
      <fieldset className="space-y-4">
        <legend className="text-lg font-semibold">Waar speelt het?</legend>

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

        {ressorten.length > 0 && (
          <Veld label="Ressort">
            <select
              value={ressortId}
              onChange={(e) => setRessortId(e.target.value ? Number(e.target.value) : '')}
              className="w-full rounded border-gray-300"
            >
              <option value="">— optioneel: kies een ressort —</option>
              {ressorten.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.naam}
                </option>
              ))}
            </select>
          </Veld>
        )}

        <Veld label="Locatie-omschrijving (straat, kruispunt, etc.)">
          <input
            type="text"
            value={locatie}
            onChange={(e) => setLocatie(e.target.value)}
            className="w-full rounded border-gray-300"
            placeholder="bv. Kwattaweg t.h.v. nr. 121"
          />
        </Veld>

        <div className="rounded border border-sky-200 bg-sky-50 p-3 text-sm">
          {geo ? (
            <div className="flex items-center justify-between">
              <span className="text-sky-900">
                📍 Locatie gedeeld: {geo.lat.toFixed(5)}, {geo.lon.toFixed(5)}
              </span>
              <button
                type="button"
                onClick={() => setGeo(null)}
                className="text-xs text-sky-700 underline"
              >
                wissen
              </button>
            </div>
          ) : geoBezig ? (
            <span className="text-sky-900">📡 Locatie bepalen…</span>
          ) : (
            <div className="flex items-center justify-between">
              <span className="text-sky-900">
                {geoFout ?? 'GPS-locatie helpt de DC sneller te lokaliseren.'}
              </span>
              <button
                type="button"
                onClick={locatieOphalen}
                className="text-xs font-semibold text-sky-700 underline"
              >
                📍 Locatie delen
              </button>
            </div>
          )}
        </div>
      </fieldset>

      <fieldset className="space-y-4 border-t pt-5">
        <legend className="text-lg font-semibold">Wat is het probleem?</legend>

        <Veld label="Categorie" verplicht>
          <select
            required
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

        <Veld label="Korte titel" verplicht>
          <input
            type="text"
            required
            minLength={3}
            maxLength={200}
            value={titel}
            onChange={(e) => setTitel(e.target.value)}
            className="w-full rounded border-gray-300"
            placeholder="bv. Drainage verstopt sinds vorige week"
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
            placeholder="Wat is er aan de hand? Sinds wanneer? Hoeveel mensen heeft het probleem?"
          />
        </Veld>

        <Veld label="Urgentie">
          <select
            value={urgentie}
            onChange={(e) => setUrgentie(e.target.value as 'LAAG' | 'MIDDEL' | 'HOOG' | 'CRISIS')}
            className="w-full rounded border-gray-300"
          >
            <option value="LAAG">Laag — kan wachten</option>
            <option value="MIDDEL">Middel — graag binnenkort</option>
            <option value="HOOG">Hoog — vraagt om snelle actie</option>
            <option value="CRISIS">Crisis — direct gevaar</option>
          </select>
        </Veld>

        <div>
          <span className="mb-1 block text-sm font-medium text-gray-700">
            Foto&apos;s ({fotos.length}/{MAX_FOTOS})
          </span>
          <p className="mb-2 text-xs text-gray-500">
            Max 5 bestanden, 5 MB elk. JPG/PNG/WEBP/HEIC of PDF.
          </p>
          {fotos.length < MAX_FOTOS && (
            <input
              type="file"
              accept={TOEGESTANE_TYPES.join(',')}
              multiple
              onChange={fotosToevoegen}
              className="block w-full text-sm text-gray-700 file:mr-3 file:rounded file:border-0 file:bg-sdp-groen file:px-3 file:py-2 file:text-sm file:font-semibold file:text-white"
            />
          )}
          {fotos.length > 0 && (
            <ul className="mt-3 space-y-1 text-sm">
              {fotos.map((f, i) => (
                <li key={i} className="flex items-center justify-between rounded border border-gray-200 px-3 py-2">
                  <span className="truncate">
                    <span className="font-mono text-xs text-gray-500">
                      [{(f.bestand.size / 1024).toFixed(0)} KB]
                    </span>{' '}
                    {f.bestand.name}
                    {f.status === 'bezig' && <em className="ml-2 text-amber-700">uploaden…</em>}
                    {f.status === 'klaar' && <em className="ml-2 text-emerald-700">✓ geüpload</em>}
                    {f.status === 'fout' && (
                      <em className="ml-2 text-red-700">fout: {f.fout}</em>
                    )}
                  </span>
                  {f.status === 'wachtend' && (
                    <button
                      type="button"
                      onClick={() => fotoVerwijderen(i)}
                      className="ml-2 text-xs text-red-600 underline"
                    >
                      verwijderen
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </fieldset>

      <fieldset className="space-y-4 border-t pt-5">
        <legend className="text-lg font-semibold">
          Uw contactgegevens <span className="text-sm font-normal text-gray-500">(optioneel)</span>
        </legend>
        <p className="text-sm text-gray-600">
          Vul in als u op de hoogte gehouden wilt worden. U kunt ook anoniem
          melden — uw ticketnummer is dan uw enige toegang.
        </p>

        <div className="grid gap-3 sm:grid-cols-2">
          <Veld label="Naam">
            <input
              type="text"
              value={melderNaam}
              onChange={(e) => setMelderNaam(e.target.value)}
              className="w-full rounded border-gray-300"
            />
          </Veld>
          <Veld label="Telefoon (WhatsApp)">
            <input
              type="tel"
              value={melderTelefoon}
              onChange={(e) => setMelderTelefoon(e.target.value)}
              className="w-full rounded border-gray-300"
            />
          </Veld>
        </div>
        <Veld label="E-mail">
          <input
            type="email"
            value={melderEmail}
            onChange={(e) => setMelderEmail(e.target.value)}
            className="w-full rounded border-gray-300"
          />
        </Veld>

        <label className="flex items-start gap-2 text-sm text-gray-700">
          <input
            type="checkbox"
            checked={consent}
            onChange={(e) => setConsent(e.target.checked)}
            className="mt-0.5"
          />
          <span>
            Ik geef toestemming om te worden gecontacteerd over deze melding
            (uitsluitend over dit dossier).
          </span>
        </label>
      </fieldset>

      {bericht.soort === 'fout' && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          Indienen mislukt: {bericht.bericht}
        </div>
      )}

      <div className="flex items-center justify-end gap-3 border-t pt-5">
        <button
          type="submit"
          disabled={!formulierGeldig || bericht.soort === 'bezig'}
          className="rounded-lg bg-sdp-groen px-6 py-2.5 font-semibold text-white shadow hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {bericht.soort === 'bezig' ? 'Bezig…' : 'Melding indienen'}
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
