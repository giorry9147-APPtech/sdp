'use client';

import { useEffect, useState } from 'react';
import { useDashboard } from '@/lib/dashboard-context';
import { api, type DcNotitie } from '@/lib/api';

/**
 * C4 — Twee directe acties op het dashboard:
 *  1. Dag-notitie schrijven (DcNotitie). Verschijnt onderaan als lijst.
 *  2. Bulk-escalatie van open CRISIS-meldingen naar RO. Pakt
 *     automatisch alle CRISIS-urgentie open meldingen in dit district
 *     en escaleert ze met een reden.
 */
export function QuickActions() {
  const { sessie, activeDistrictId, effectiefSubregioId, gekozenRessortId, heeft } = useDashboard();
  const [notitieOpen, setNotitieOpen] = useState(false);
  const [notitieBody, setNotitieBody] = useState('');
  const [notitieBezig, setNotitieBezig] = useState(false);
  const [escOpen, setEscOpen] = useState(false);
  const [escReden, setEscReden] = useState('');
  const [escBezig, setEscBezig] = useState(false);
  const [bericht, setBericht] = useState<string | null>(null);
  const [fout, setFout] = useState<string | null>(null);

  const [notities, setNotities] = useState<DcNotitie[]>([]);
  const [crisisAantal, setCrisisAantal] = useState<number>(0);

  function herlaadNotities() {
    if (!activeDistrictId) return;
    api
      .dcNotitiesLijst(activeDistrictId, sessie.accessToken, 10)
      .then(setNotities)
      .catch(() => setNotities([]));
  }

  function herlaadCrisis() {
    if (!activeDistrictId) return;
    api
      .meldingenLijst(activeDistrictId, sessie.accessToken, {
        subregioId: effectiefSubregioId,
        ressortId: gekozenRessortId,
      })
      .then((lst) =>
        setCrisisAantal(
          lst.filter(
            (m) =>
              m.urgentie === 'CRISIS' &&
              !['GESLOTEN', 'OPGELOST', 'BEVESTIGD_DOOR_BURGER'].includes(m.status),
          ).length,
        ),
      )
      .catch(() => setCrisisAantal(0));
  }

  useEffect(() => {
    herlaadNotities();
    herlaadCrisis();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeDistrictId, sessie.accessToken, effectiefSubregioId, gekozenRessortId]);

  async function notitieOpslaan() {
    if (notitieBody.trim().length < 2) {
      setFout('Notitie te kort');
      return;
    }
    setNotitieBezig(true);
    setFout(null);
    try {
      await api.dcNotitieMaak(
        { districtId: activeDistrictId, body: notitieBody.trim() },
        sessie.accessToken,
      );
      setNotitieBody('');
      setNotitieOpen(false);
      setBericht('Notitie opgeslagen');
      setTimeout(() => setBericht(null), 3000);
      herlaadNotities();
    } catch (e) {
      setFout(e instanceof Error ? e.message : 'fout');
    } finally {
      setNotitieBezig(false);
    }
  }

  async function escaleerCrisis() {
    if (escReden.trim().length < 5) {
      setFout('Geef minimaal 5 tekens reden');
      return;
    }
    setEscBezig(true);
    setFout(null);
    try {
      const lst = await api.meldingenLijst(activeDistrictId, sessie.accessToken, {
        subregioId: effectiefSubregioId,
        ressortId: gekozenRessortId,
      });
      const crisis = lst.filter(
        (m) =>
          m.urgentie === 'CRISIS' &&
          !['GESLOTEN', 'OPGELOST', 'BEVESTIGD_DOOR_BURGER'].includes(m.status),
      );
      let gelukt = 0;
      for (const m of crisis) {
        try {
          await api.meldingEscaleer(m.id, { reden: escReden.trim() }, sessie.accessToken);
          gelukt++;
        } catch {
          // skip
        }
      }
      setEscReden('');
      setEscOpen(false);
      setBericht(`${gelukt} crisis-melding(en) geëscaleerd naar RO`);
      setTimeout(() => setBericht(null), 4000);
      herlaadCrisis();
    } catch (e) {
      setFout(e instanceof Error ? e.message : 'fout');
    } finally {
      setEscBezig(false);
    }
  }

  const kanNotitie = heeft('dashboard.district');
  const kanEscaleren = heeft('melding.behandel');

  if (!kanNotitie && !kanEscaleren) return null;

  return (
    <section className="rounded-lg bg-white p-5 shadow-sm">
      <h2 className="font-semibold">Snelle acties</h2>

      {bericht && (
        <div className="mt-2 rounded border border-emerald-300 bg-emerald-50 p-2 text-xs text-emerald-900">
          {bericht}
        </div>
      )}
      {fout && (
        <div className="mt-2 rounded border border-red-300 bg-red-50 p-2 text-xs text-red-800">
          {fout}
        </div>
      )}

      <div className="mt-3 flex flex-wrap gap-2">
        {kanNotitie && !notitieOpen && (
          <button
            onClick={() => setNotitieOpen(true)}
            className="rounded bg-sdp-groen px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-emerald-700"
          >
            + Dag-notitie
          </button>
        )}
        {kanEscaleren && !escOpen && (
          <button
            onClick={() => setEscOpen(true)}
            disabled={crisisAantal === 0}
            className="rounded bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow hover:bg-amber-700 disabled:opacity-50"
            title={
              crisisAantal === 0
                ? 'Geen open crisis-meldingen — geen escalatie nodig'
                : undefined
            }
          >
            ⚠ Escaleer {crisisAantal} crisis-melding(en) naar RO
          </button>
        )}
      </div>

      {notitieOpen && (
        <div className="mt-3 space-y-2 rounded border border-gray-200 p-3">
          <p className="text-xs font-semibold text-gray-700">Nieuwe dag-notitie</p>
          <textarea
            rows={3}
            maxLength={4000}
            value={notitieBody}
            onChange={(e) => setNotitieBody(e.target.value)}
            className="w-full rounded border-gray-300 text-sm"
            placeholder="Korte aantekening — besluit, observatie, afspraak met RR/RO…"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setNotitieOpen(false);
                setNotitieBody('');
              }}
              className="rounded px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100"
            >
              Annuleren
            </button>
            <button
              onClick={notitieOpslaan}
              disabled={notitieBezig}
              className="rounded bg-sdp-groen px-3 py-1.5 text-xs font-semibold text-white shadow disabled:opacity-50"
            >
              {notitieBezig ? 'Opslaan…' : 'Opslaan'}
            </button>
          </div>
        </div>
      )}

      {escOpen && (
        <div className="mt-3 space-y-2 rounded border border-amber-200 bg-amber-50 p-3">
          <p className="text-xs font-semibold text-amber-900">
            Alle {crisisAantal} open crisis-melding(en) escaleren naar RO
          </p>
          <textarea
            rows={3}
            maxLength={2000}
            value={escReden}
            onChange={(e) => setEscReden(e.target.value)}
            className="w-full rounded border-amber-300 text-sm"
            placeholder="Reden — bijv. capaciteit overschreden, regio-overstijgend probleem"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setEscOpen(false);
                setEscReden('');
              }}
              className="rounded px-3 py-1.5 text-xs text-amber-900 hover:bg-amber-100"
            >
              Annuleren
            </button>
            <button
              onClick={escaleerCrisis}
              disabled={escBezig}
              className="rounded bg-amber-600 px-3 py-1.5 text-xs font-semibold text-white shadow disabled:opacity-50"
            >
              {escBezig ? 'Escaleren…' : `Escaleer ${crisisAantal}`}
            </button>
          </div>
        </div>
      )}

      {notities.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xs font-semibold uppercase text-gray-500">
            Recente notities
          </h3>
          <ul className="mt-2 space-y-2">
            {notities.map((n) => (
              <li key={n.id} className="rounded border border-gray-200 p-2 text-sm">
                <p className="text-xs text-gray-500">
                  {new Date(n.createdAt).toLocaleString('nl-NL')} ·{' '}
                  {n.actor.naam}
                </p>
                <p className="mt-1 whitespace-pre-wrap text-gray-800">{n.body}</p>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
