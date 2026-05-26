'use client';

import { useState } from 'react';
import { useDashboard } from '@/lib/dashboard-context';
import {
  api,
  type ProjectDetail,
  type ProjectRisico,
  type ProjectRisicoStatus,
} from '@/lib/api';

const STATUS_LABELS: Record<ProjectRisicoStatus, string> = {
  OPEN: 'Open',
  GEMITIGEERD: 'Gemitigeerd',
  GEESCALEERD: 'Geëscaleerd',
};

const STATUS_KLEUR: Record<ProjectRisicoStatus, string> = {
  OPEN: 'bg-amber-100 text-amber-900',
  GEMITIGEERD: 'bg-emerald-100 text-emerald-900',
  GEESCALEERD: 'bg-red-100 text-red-900',
};

/**
 * F1 — Risico-notities op een project. DC/projectmedewerker kan:
 *  - nieuwe risico's vastleggen (titel + beschrijving + optionele mitigatie)
 *  - bestaande risico's status wisselen (open → gemitigeerd / geëscaleerd)
 *  - mitigatie-tekst bijwerken
 */
export function RisicoCard({
  project,
  onUpdated,
}: {
  project: ProjectDetail;
  onUpdated: () => void;
}) {
  const { sessie, heeft } = useDashboard();
  const [nieuwOpen, setNieuwOpen] = useState(false);
  const [titel, setTitel] = useState('');
  const [beschrijving, setBeschrijving] = useState('');
  const [mitigatie, setMitigatie] = useState('');
  const [bezig, setBezig] = useState(false);
  const [fout, setFout] = useState<string | null>(null);

  const kanBewerken = heeft('project.update');

  const tellingen = project.risicos.reduce(
    (acc, r) => {
      acc[r.status] = (acc[r.status] ?? 0) + 1;
      return acc;
    },
    { OPEN: 0, GEMITIGEERD: 0, GEESCALEERD: 0 } as Record<ProjectRisicoStatus, number>,
  );

  async function risicoToevoegen() {
    if (titel.length < 3 || beschrijving.length < 10) {
      setFout('Titel ≥ 3 en beschrijving ≥ 10 tekens vereist');
      return;
    }
    setBezig(true);
    setFout(null);
    try {
      await api.projectRisicoMaak(
        project.id,
        {
          titel: titel.trim(),
          beschrijving: beschrijving.trim(),
          mitigatie: mitigatie.trim() || undefined,
        },
        sessie.accessToken,
      );
      setTitel('');
      setBeschrijving('');
      setMitigatie('');
      setNieuwOpen(false);
      onUpdated();
    } catch (e) {
      setFout(e instanceof Error ? e.message : 'fout');
    } finally {
      setBezig(false);
    }
  }

  return (
    <section className="rounded-lg bg-white p-5 shadow-sm">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="font-semibold">Risico's ({project.risicos.length})</h2>
          {project.risicos.length > 0 && (
            <p className="mt-1 text-xs text-gray-500">
              {tellingen.OPEN} open
              {tellingen.GEMITIGEERD > 0 && ` · ${tellingen.GEMITIGEERD} gemitigeerd`}
              {tellingen.GEESCALEERD > 0 && ` · ${tellingen.GEESCALEERD} geëscaleerd`}
            </p>
          )}
        </div>
        {kanBewerken && !nieuwOpen && (
          <button
            onClick={() => setNieuwOpen(true)}
            className="rounded bg-sdp-groen px-3 py-1 text-xs font-semibold text-white hover:bg-emerald-700"
          >
            + Risico
          </button>
        )}
      </header>

      {nieuwOpen && (
        <div className="mt-3 space-y-2 rounded border border-gray-200 p-3">
          <label className="block text-xs font-medium text-gray-700">
            Titel
            <input
              type="text"
              maxLength={200}
              value={titel}
              onChange={(e) => setTitel(e.target.value)}
              className="mt-1 w-full rounded border-gray-300 text-sm"
              placeholder="bv. Materiaalkosten lopen op"
            />
          </label>
          <label className="block text-xs font-medium text-gray-700">
            Beschrijving
            <textarea
              rows={3}
              maxLength={5000}
              value={beschrijving}
              onChange={(e) => setBeschrijving(e.target.value)}
              className="mt-1 w-full rounded border-gray-300 text-sm"
              placeholder="Wat is het probleem, hoe groot, welke impact?"
            />
          </label>
          <label className="block text-xs font-medium text-gray-700">
            Mitigatie (optioneel)
            <textarea
              rows={2}
              maxLength={5000}
              value={mitigatie}
              onChange={(e) => setMitigatie(e.target.value)}
              className="mt-1 w-full rounded border-gray-300 text-sm"
              placeholder="Welke maatregel wordt voorgesteld of genomen?"
            />
          </label>
          {fout && <p className="text-xs text-red-700">{fout}</p>}
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setNieuwOpen(false);
                setTitel('');
                setBeschrijving('');
                setMitigatie('');
                setFout(null);
              }}
              className="rounded px-3 py-1.5 text-xs text-gray-600 hover:bg-gray-100"
            >
              Annuleren
            </button>
            <button
              onClick={risicoToevoegen}
              disabled={bezig}
              className="rounded bg-sdp-groen px-3 py-1.5 text-xs font-semibold text-white shadow disabled:opacity-50"
            >
              {bezig ? 'Opslaan…' : 'Risico vastleggen'}
            </button>
          </div>
        </div>
      )}

      {project.risicos.length === 0 && !nieuwOpen && (
        <p className="mt-3 text-sm text-gray-500">Nog geen risico's geregistreerd.</p>
      )}

      {project.risicos.length > 0 && (
        <ul className="mt-3 space-y-2">
          {project.risicos.map((r) => (
            <RisicoItem
              key={r.id}
              projectId={project.id}
              risico={r}
              kanBewerken={kanBewerken}
              onUpdated={onUpdated}
            />
          ))}
        </ul>
      )}
    </section>
  );
}

function RisicoItem({
  projectId,
  risico,
  kanBewerken,
  onUpdated,
}: {
  projectId: number;
  risico: ProjectRisico;
  kanBewerken: boolean;
  onUpdated: () => void;
}) {
  const { sessie } = useDashboard();
  const [bewerk, setBewerk] = useState(false);
  const [mitigatie, setMitigatie] = useState(risico.mitigatie ?? '');
  const [bezig, setBezig] = useState(false);

  async function wijzigStatus(status: ProjectRisicoStatus) {
    setBezig(true);
    try {
      await api.projectRisicoWijzig(
        projectId,
        risico.id,
        { status },
        sessie.accessToken,
      );
      onUpdated();
    } finally {
      setBezig(false);
    }
  }

  async function mitigatieOpslaan() {
    setBezig(true);
    try {
      await api.projectRisicoWijzig(
        projectId,
        risico.id,
        { mitigatie: mitigatie.trim() || undefined },
        sessie.accessToken,
      );
      setBewerk(false);
      onUpdated();
    } finally {
      setBezig(false);
    }
  }

  return (
    <li className="rounded border border-gray-200 p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold">{risico.titel}</p>
          <p className="text-xs text-gray-500">
            {new Date(risico.createdAt).toLocaleString('nl-NL')} · {risico.actor.naam}
          </p>
        </div>
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_KLEUR[risico.status]}`}
        >
          {STATUS_LABELS[risico.status]}
        </span>
      </div>

      <p className="mt-2 whitespace-pre-wrap text-sm text-gray-800">{risico.beschrijving}</p>

      {!bewerk && risico.mitigatie && (
        <div className="mt-2 rounded bg-gray-50 p-2 text-xs">
          <p className="font-semibold text-gray-700">Mitigatie:</p>
          <p className="whitespace-pre-wrap text-gray-800">{risico.mitigatie}</p>
        </div>
      )}

      {bewerk && (
        <div className="mt-2 space-y-2">
          <textarea
            rows={2}
            maxLength={5000}
            value={mitigatie}
            onChange={(e) => setMitigatie(e.target.value)}
            className="w-full rounded border-gray-300 text-sm"
            placeholder="Mitigatie-tekst"
          />
          <div className="flex justify-end gap-2">
            <button
              onClick={() => {
                setBewerk(false);
                setMitigatie(risico.mitigatie ?? '');
              }}
              className="rounded px-2 py-1 text-xs text-gray-600 hover:bg-gray-100"
            >
              Annuleren
            </button>
            <button
              onClick={mitigatieOpslaan}
              disabled={bezig}
              className="rounded bg-sdp-groen px-2 py-1 text-xs font-semibold text-white disabled:opacity-50"
            >
              Opslaan
            </button>
          </div>
        </div>
      )}

      {kanBewerken && !bewerk && (
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <button
            onClick={() => setBewerk(true)}
            className="text-xs text-sdp-groen underline"
          >
            {risico.mitigatie ? 'Mitigatie aanpassen' : '+ Mitigatie'}
          </button>
          {risico.status !== 'GEMITIGEERD' && (
            <button
              onClick={() => wijzigStatus('GEMITIGEERD')}
              disabled={bezig}
              className="rounded bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-900 hover:bg-emerald-200 disabled:opacity-50"
            >
              Markeer gemitigeerd
            </button>
          )}
          {risico.status !== 'GEESCALEERD' && (
            <button
              onClick={() => wijzigStatus('GEESCALEERD')}
              disabled={bezig}
              className="rounded bg-red-100 px-2 py-0.5 text-xs font-medium text-red-900 hover:bg-red-200 disabled:opacity-50"
            >
              Escaleer
            </button>
          )}
          {risico.status !== 'OPEN' && (
            <button
              onClick={() => wijzigStatus('OPEN')}
              disabled={bezig}
              className="rounded bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-900 hover:bg-amber-200 disabled:opacity-50"
            >
              Heropen
            </button>
          )}
        </div>
      )}
    </li>
  );
}
