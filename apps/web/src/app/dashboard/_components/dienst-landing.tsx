'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import { useDashboard } from '@/lib/dashboard-context';
import { api, type VerzoekLijstItem } from '@/lib/api';

/**
 * EO8 — landing voor externe-dienst-gebruikers (scope ORGANISATIE).
 * Toont KPI's van de eigen organisatie + snelkoppeling naar nieuw verzoek.
 */
export function DienstLanding() {
  const { sessie, activeOrganisatieNaam } = useDashboard();
  const [lijst, setLijst] = useState<VerzoekLijstItem[]>([]);
  const [fout, setFout] = useState<string | null>(null);

  useEffect(() => {
    api
      .verzoekenMijn(sessie.accessToken)
      .then(setLijst)
      .catch((e) => setFout(e instanceof Error ? e.message : 'fout'));
  }, [sessie.accessToken]);

  const stats = useMemo(() => {
    const open = lijst.filter((v) => !v.afgehandeldOp && !v.ingetrokkenOp).length;
    const beantwoord = lijst.filter((v) => v.afgehandeldOp).length;
    const binnen7 = lijst.filter(
      (v) =>
        !v.afgehandeldOp &&
        !v.ingetrokkenOp &&
        v.deadline &&
        new Date(v.deadline).getTime() - Date.now() < 7 * 86_400_000,
    ).length;
    return { open, beantwoord, binnen7, totaal: lijst.length };
  }, [lijst]);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-baseline justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-sdp-groen">Overzicht</h1>
          <p className="text-sm text-gray-600">
            Welkom, {sessie.user.naam}
            {activeOrganisatieNaam && <> · {activeOrganisatieNaam}</>}.
          </p>
        </div>
        <Link
          href="/dashboard/verzoeken/nieuw"
          className="rounded bg-sdp-groen px-4 py-2 text-sm font-semibold text-white shadow hover:bg-emerald-700"
        >
          + Nieuw verzoek
        </Link>
      </header>

      {fout && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">{fout}</div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Tegel titel="Totaal verzoeken" waarde={stats.totaal} />
        <Tegel titel="Openstaand" waarde={stats.open} accent="groen" />
        <Tegel
          titel="Deadline < 7 dagen"
          waarde={stats.binnen7}
          accent={stats.binnen7 > 0 ? 'amber' : 'grijs'}
        />
        <Tegel titel="Beantwoord" waarde={stats.beantwoord} />
      </div>

      <section className="rounded-lg bg-white p-5 shadow-sm">
        <div className="flex items-baseline justify-between">
          <h2 className="font-semibold">Recente verzoeken</h2>
          <Link href="/dashboard/verzoeken" className="text-sm text-sdp-groen hover:underline">
            alle verzoeken →
          </Link>
        </div>
        {lijst.length === 0 ? (
          <p className="mt-3 text-sm text-gray-500">
            Nog geen verzoeken ingediend.{' '}
            <Link href="/dashboard/verzoeken/nieuw" className="text-sdp-groen underline">
              Dien er een in
            </Link>
            .
          </p>
        ) : (
          <ul className="mt-3 divide-y text-sm">
            {lijst.slice(0, 6).map((v) => (
              <li key={v.id} className="py-2">
                <Link
                  href={`/dashboard/verzoeken/${v.id}`}
                  className="flex items-baseline justify-between gap-2 hover:underline"
                >
                  <span className="truncate">
                    <span className="font-mono text-[10px] text-gray-500">{v.referentie}</span>{' '}
                    {v.onderwerp}
                  </span>
                  <span className="shrink-0 text-xs text-gray-500">
                    {v.district.naam} · {v.statusCode}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function Tegel({
  titel,
  waarde,
  accent,
}: {
  titel: string;
  waarde: number;
  accent?: 'groen' | 'amber' | 'grijs';
}) {
  const kleur =
    accent === 'amber' ? 'text-amber-700' : accent === 'grijs' ? 'text-gray-700' : 'text-sdp-groen';
  return (
    <div className="rounded-lg bg-white p-5 shadow-sm">
      <p className="text-sm text-gray-600">{titel}</p>
      <p className={`mt-1 text-3xl font-bold ${kleur}`}>{waarde}</p>
    </div>
  );
}
