'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useDashboard } from '@/lib/dashboard-context';
import { api, type DistrictsplanDetail, type PlanStatus } from '@/lib/api';
import { planStatusKleur, statusLabel } from '@/lib/status-stijl';
import { PrioriteitLijst } from '../../_components/prioriteit-lijst';

export default function DistrictsplanDetailPage({
  params,
}: {
  params: { id: string };
}) {
  const id = Number(params.id);
  const { sessie, heeft } = useDashboard();
  const [plan, setPlan] = useState<DistrictsplanDetail | null>(null);
  const [fout, setFout] = useState<string | null>(null);
  const [bezig, setBezig] = useState(false);

  function herlaad() {
    api
      .districtsplanDetail(id, sessie.accessToken)
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
      await api.districtsplanStatus(id, { status: naar, opmerking }, sessie.accessToken);
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
              Districtsplan · {plan.district.naam} · jaar {plan.jaar} · v{plan.versie}
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

      {/* Acties — districtsplan-flow: CONCEPT → DR → DC → RO → GOEDGEKEURD */}
      <section className="space-y-3 rounded-lg bg-white p-5 shadow-sm">
        <h2 className="text-lg font-semibold">Acties</h2>
        <FlowDiagram huidige={plan.status} />

        <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
          {plan.status === 'CONCEPT' && heeft('districtsplan.create') && (
            <ActieBlok
              titel="Indienen ter goedkeuring DR"
              beschrijving="Stuur naar Districtsraad voor stemming."
              knop="Indienen"
              bezig={bezig}
              kleur="groen"
              onAction={(opm) => wijzig('TER_GOEDKEURING_DR', opm)}
            />
          )}

          {plan.status === 'TER_GOEDKEURING_DR' && heeft('districtsplan.goedkeur_dr') && (
            <>
              <ActieBlok
                titel="DR goedkeuren → door naar DC"
                beschrijving="Districtsraad keurt het plan goed. Doorzetten naar de DC."
                knop="Goedkeuren"
                bezig={bezig}
                kleur="groen"
                onAction={(opm) => wijzig('TER_GOEDKEURING_DC', opm)}
              />
              <ActieBlok
                titel="Herziening nodig"
                beschrijving="Plan terugsturen voor aanpassing."
                knop="Herziening"
                bezig={bezig}
                kleur="amber"
                onAction={(opm) => wijzig('HERZIENING_NODIG', opm)}
              />
              <ActieBlok
                titel="Afwijzen"
                beschrijving="Definitief afwijzen."
                knop="Afwijzen"
                bezig={bezig}
                kleur="rood"
                onAction={(opm) => wijzig('AFGEWEZEN', opm)}
              />
            </>
          )}

          {plan.status === 'TER_GOEDKEURING_DC' && heeft('districtsplan.create') && (
            <>
              <ActieBlok
                titel="DC accordeert → naar RO"
                beschrijving="DC akkoord. Doorzetten naar Directeur Decentralisatie (RO)."
                knop="Door naar RO"
                bezig={bezig}
                kleur="groen"
                onAction={(opm) => wijzig('TER_GOEDKEURING_RO', opm)}
              />
              <ActieBlok
                titel="Herziening nodig"
                beschrijving="DC vindt herziening nodig."
                knop="Herziening"
                bezig={bezig}
                kleur="amber"
                onAction={(opm) => wijzig('HERZIENING_NODIG', opm)}
              />
            </>
          )}

          {plan.status === 'TER_GOEDKEURING_RO' && heeft('districtsplan.goedkeur_ro') && (
            <>
              <ActieBlok
                titel="RO definitief goedkeuren"
                beschrijving="Directeur Decentralisatie keurt het districtsplan definitief goed."
                knop="Goedkeuren"
                bezig={bezig}
                kleur="groen"
                onAction={(opm) => wijzig('GOEDGEKEURD', opm)}
              />
              <ActieBlok
                titel="Herziening nodig"
                beschrijving="RO vindt herziening nodig."
                knop="Herziening"
                bezig={bezig}
                kleur="amber"
                onAction={(opm) => wijzig('HERZIENING_NODIG', opm)}
              />
              <ActieBlok
                titel="Afwijzen"
                beschrijving="RO wijst het plan af."
                knop="Afwijzen"
                bezig={bezig}
                kleur="rood"
                onAction={(opm) => wijzig('AFGEWEZEN', opm)}
              />
            </>
          )}

          {(plan.status === 'HERZIENING_NODIG' || plan.status === 'AFGEWEZEN') &&
            heeft('districtsplan.create') && (
              <p className="text-sm text-gray-600">
                Plan vereist herziening. Maak een{' '}
                <Link
                  href="/dashboard/plannen/district/nieuw"
                  className="text-sdp-groen underline"
                >
                  nieuwe versie
                </Link>
                .
              </p>
            )}

          {plan.status === 'GOEDGEKEURD' && (
            <p className="text-sm font-medium text-emerald-700">
              ✓ Districtsplan {plan.jaar} is definitief goedgekeurd door RO.
              Vormt basis voor districtsbegroting (Fase 2).
            </p>
          )}
        </div>
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

function FlowDiagram({ huidige }: { huidige: PlanStatus }) {
  const stappen: Array<{ status: PlanStatus; label: string }> = [
    { status: 'CONCEPT', label: 'Concept' },
    { status: 'TER_GOEDKEURING_DR', label: 'DR' },
    { status: 'TER_GOEDKEURING_DC', label: 'DC' },
    { status: 'TER_GOEDKEURING_RO', label: 'RO' },
    { status: 'GOEDGEKEURD', label: '✓ Goedgekeurd' },
  ];
  const huidigeIdx = stappen.findIndex((s) => s.status === huidige);
  const afgewezen = huidige === 'AFGEWEZEN' || huidige === 'HERZIENING_NODIG';

  return (
    <div className="my-3 flex flex-wrap items-center gap-1 text-xs">
      {stappen.map((s, i) => (
        <div key={s.status} className="flex items-center gap-1">
          <span
            className={`rounded px-2 py-1 font-semibold ${
              afgewezen
                ? 'bg-red-100 text-red-800'
                : i < huidigeIdx
                ? 'bg-emerald-100 text-emerald-800'
                : i === huidigeIdx
                ? 'bg-sdp-groen text-white'
                : 'bg-gray-100 text-gray-500'
            }`}
          >
            {s.label}
          </span>
          {i < stappen.length - 1 && (
            <span className="text-gray-400">→</span>
          )}
        </div>
      ))}
      {afgewezen && (
        <span className="rounded bg-red-100 px-2 py-1 font-semibold text-red-800">
          {huidige === 'AFGEWEZEN' ? '✗ Afgewezen' : '↻ Herziening nodig'}
        </span>
      )}
    </div>
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
      <h3 className="text-sm font-semibold">{titel}</h3>
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
