'use client';

import { useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

type Resultaat =
  | { soort: 'idle' }
  | { soort: 'bezig' }
  | {
      soort: 'verzonden';
      oordeel: 'BEVESTIGD' | 'NIET_OPGELOST';
      ticketNummer: string;
    }
  | { soort: 'fout'; bericht: string };

export function FeedbackForm({ token }: { token: string }) {
  const [tokenWaarde, setTokenWaarde] = useState(token);
  const [opmerking, setOpmerking] = useState('');
  const [res, setRes] = useState<Resultaat>({ soort: 'idle' });

  async function verzend(oordeel: 'BEVESTIGD' | 'NIET_OPGELOST') {
    if (!tokenWaarde.trim()) {
      setRes({ soort: 'fout', bericht: 'Token ontbreekt' });
      return;
    }
    setRes({ soort: 'bezig' });
    try {
      const r = await api.meldingFeedback(tokenWaarde.trim(), {
        oordeel,
        opmerking: opmerking.trim() || undefined,
      });
      setRes({ soort: 'verzonden', oordeel, ticketNummer: r.ticketNummer });
    } catch (e) {
      setRes({ soort: 'fout', bericht: e instanceof Error ? e.message : 'fout' });
    }
  }

  if (res.soort === 'verzonden') {
    return (
      <div className="mt-6 rounded-lg border border-emerald-300 bg-emerald-50 p-6">
        <h2 className="text-lg font-semibold text-emerald-900">
          {res.oordeel === 'BEVESTIGD' ? 'Bedankt voor uw bevestiging.' : 'Uw melding gaat terug in behandeling.'}
        </h2>
        <p className="mt-2 text-sm text-emerald-900">
          {res.oordeel === 'BEVESTIGD'
            ? 'De melding is gemarkeerd als bevestigd-door-burger en wordt gesloten.'
            : 'Het districtscommissariaat is gevraagd om de melding opnieuw op te pakken.'}
        </p>
        <Link
          href={`/status?nr=${encodeURIComponent(res.ticketNummer)}`}
          className="mt-4 inline-block text-sm font-medium text-emerald-700 underline"
        >
          Bekijk de actuele status
        </Link>
      </div>
    );
  }

  return (
    <div className="mt-6 space-y-4 rounded-lg bg-white p-6 shadow-sm">
      {!token && (
        <label className="block">
          <span className="mb-1 block text-sm font-medium text-gray-700">
            Plak hier de feedback-link of token uit uw bericht
          </span>
          <input
            type="text"
            value={tokenWaarde}
            onChange={(e) => setTokenWaarde(e.target.value)}
            className="w-full rounded border-gray-300 font-mono text-sm"
            placeholder="bv. ABCD…"
          />
        </label>
      )}

      <label className="block">
        <span className="mb-1 block text-sm font-medium text-gray-700">
          Toelichting (optioneel)
        </span>
        <textarea
          rows={3}
          maxLength={2000}
          value={opmerking}
          onChange={(e) => setOpmerking(e.target.value)}
          className="w-full rounded border-gray-300 text-sm"
          placeholder="bv. drainage is helemaal vrijgemaakt — bedankt!"
        />
      </label>

      {res.soort === 'fout' && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {res.bericht}
        </div>
      )}

      <div className="flex flex-col gap-3 sm:flex-row">
        <button
          type="button"
          disabled={res.soort === 'bezig'}
          onClick={() => verzend('BEVESTIGD')}
          className="flex-1 rounded-lg bg-sdp-groen px-4 py-3 font-semibold text-white shadow hover:bg-emerald-700 disabled:opacity-50"
        >
          ✓ Ja, probleem is opgelost
        </button>
        <button
          type="button"
          disabled={res.soort === 'bezig'}
          onClick={() => verzend('NIET_OPGELOST')}
          className="flex-1 rounded-lg border border-amber-600 bg-white px-4 py-3 font-semibold text-amber-700 shadow hover:bg-amber-50 disabled:opacity-50"
        >
          ✗ Nee, probleem speelt nog
        </button>
      </div>
    </div>
  );
}
