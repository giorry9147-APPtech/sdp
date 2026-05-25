'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDashboard } from '@/lib/dashboard-context';
import { api, type PlanStatus, type RessortplanDetail } from '@/lib/api';
import { planStatusKleur, statusLabel } from '@/lib/status-stijl';
import { PrioriteitLijst } from '../../_components/prioriteit-lijst';

export default function RessortplanDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  const { sessie, heeft } = useDashboard();
  const [plan, setPlan] = useState<RessortplanDetail | null>(null);
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);

  function herlaad() {
    api
      .ressortplanDetail(id, sessie.accessToken)
      .then((p) => {
        setPlan(p);
        setFout(null);
      })
      .catch((e) => setFout(e instanceof Error ? e.message : 'fout'));
  }

  useEffect(herlaad, [id, sessie.accessToken]);

  async function wijzig(naar: PlanStatus, opmerking?: string) {
    setBezig(true);
    setFout(null);
    try {
      await api.ressortplanStatus(id, { status: naar, opmerking }, sessie.accessToken);
      herlaad();
    } catch (e) {
      setFout(e instanceof Error ? e.message : 'fout');
    } finally {
      setBezig(false);
    }
  }

  if (!plan)
    return (
      <div>
        {fout ? (
          <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
            {fout}
          </div>
        ) : (
          <p className="text-gray-500">Laden…</p>
        )}
      </div>
    );

  const totaalKosten = plan.prioriteiten.reduce(
    (s, p) => s + (p.kostenraming != null ? Number(p.kostenraming) : 0),
    0,
  );

  return (
    <div className="space-y-6">
      <nav className="text-sm">
        <Link href="/dashboard/plannen" className="text-sdp-groen hover:underline">
          ← Plannen
        </Link>
      </nav>

      <header className="rounded-lg bg-white p-6 shadow-sm">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <p className="text-xs uppercase text-gray-500">
              Ressortplan · {plan.ressort.naam} · jaar {plan.jaar} · v{plan.versie}
            </p>
            <h1 className="mt-1 text-2xl font-bold">{plan.titel}</h1>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${
              planStatusKleur[plan.status] ?? 'bg-gray-100 text-gray-700'
            }`}
          >
            {statusLabel(plan.status)}
          </span>
        </div>

        {plan.inleiding && (
          <p className="mt-3 whitespace-pre-wrap text-sm text-gray-700">
            {plan.inleiding}
          </p>
        )}

        <dl className="mt-4 grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          <Rij label="Opsteller">{plan.gemaaktDoor.naam}</Rij>
          <Rij label="Aangemaakt">
            {new Date(plan.createdAt).toLocaleString('nl-NL')}
          </Rij>
          {plan.goedgekeurdOp && (
            <Rij label="Goedgekeurd op">
              {new Date(plan.goedgekeurdOp).toLocaleString('nl-NL')}
            </Rij>
          )}
          <Rij label="Totaal kostenraming">
            {totaalKosten > 0
              ? `SRD ${totaalKosten.toLocaleString('nl-NL')}`
              : '—'}
          </Rij>
        </dl>
      </header>

      <section>
        <h2 className="mb-3 text-lg font-semibold">
          Prioriteiten ({plan.prioriteiten.length})
        </h2>
        <PrioriteitLijst prioriteiten={plan.prioriteiten} />
      </section>

      {fout && (
        <div className="rounded border border-red-300 bg-red-50 p-3 text-sm text-red-800">
          {fout}
        </div>
      )}

      {/* Acties — afhankelijk van status + permissies */}
      <section className="space-y-3 rounded-lg bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Acties</h2>

        {plan.status === 'CONCEPT' && heeft('ressortplan.indienen') && (
          <ActieBlok
            titel="Indienen ter goedkeuring RR"
            beschrijving="Stuur het plan naar de Ressortraad voor goedkeuring. Daarna kunt u het niet meer wijzigen."
            knop="Indienen"
            bezig={bezig}
            kleur="groen"
            onAction={(opm) => wijzig('TER_GOEDKEURING_RR', opm)}
          />
        )}

        {plan.status === 'TER_GOEDKEURING_RR' && heeft('ressortplan.goedkeur_rr') && (
          <div className="grid gap-3 md:grid-cols-3">
            <ActieBlok
              titel="Goedkeuren (RR)"
              beschrijving="Namens de Ressortraad goedkeuren. Plan wordt input voor districtsplan."
              knop="Goedkeuren"
              bezig={bezig}
              kleur="groen"
              onAction={(opm) => wijzig('GOEDGEKEURD', opm)}
            />
            <ActieBlok
              titel="Herziening nodig"
              beschrijving="Plan terugsturen voor aanpassing. Opsteller maakt een nieuwe versie."
              knop="Herziening"
              bezig={bezig}
              kleur="amber"
              onAction={(opm) => wijzig('HERZIENING_NODIG', opm)}
            />
            <ActieBlok
              titel="Afwijzen"
              beschrijving="Definitief afwijzen. Opsteller kan opnieuw beginnen."
              knop="Afwijzen"
              bezig={bezig}
              kleur="rood"
              onAction={(opm) => wijzig('AFGEWEZEN', opm)}
            />
          </div>
        )}

        {(plan.status === 'HERZIENING_NODIG' || plan.status === 'AFGEWEZEN') &&
          heeft('ressortplan.create') && (
            <p className="text-sm text-gray-600">
              Plan vereist herziening. Maak een{' '}
              <Link
                href="/dashboard/plannen/ressort/nieuw"
                className="text-sdp-groen underline"
              >
                nieuwe versie
              </Link>
              .
            </p>
          )}

        {plan.status === 'GOEDGEKEURD' && (
          <p className="text-sm text-emerald-700">
            ✓ Goedgekeurd. Dit plan is nu input voor het districtsplan.
          </p>
        )}
      </section>
    </div>
  );
}

function Rij({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <>
      <dt className="text-gray-500">{label}</dt>
      <dd>{children}</dd>
    </>
  );
}

function ActieBlok({
  titel,
  beschrijving,
  knop,
  bezig,
  kleur,
  onAction,
}: {
  titel: string;
  beschrijving: string;
  knop: string;
  bezig: boolean;
  kleur: 'groen' | 'rood' | 'amber';
  onAction: (opmerking?: string) => void;
}) {
  const [opm, setOpm] = useState('');
  const kleuren = {
    groen: 'bg-emerald-600 hover:bg-emerald-700',
    rood: 'bg-red-600 hover:bg-red-700',
    amber: 'bg-amber-600 hover:bg-amber-700',
  } as const;

  return (
    <div className="rounded border border-gray-200 p-3">
      <h3 className="font-semibold text-sm">{titel}</h3>
      <p className="mt-1 text-xs text-gray-600">{beschrijving}</p>
      <textarea
        rows={2}
        maxLength={2000}
        value={opm}
        onChange={(e) => setOpm(e.target.value)}
        placeholder="Opmerking (optioneel)"
        className="mt-2 w-full rounded border-gray-300 text-sm"
      />
      <button
        type="button"
        disabled={bezig}
        onClick={() => {
          if (!confirm(`${titel}?`)) return;
          onAction(opm || undefined);
        }}
        className={`mt-2 w-full rounded px-3 py-2 text-sm font-semibold text-white disabled:opacity-50 ${kleuren[kleur]}`}
      >
        {knop}
      </button>
    </div>
  );
}
