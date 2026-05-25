'use client';

import { useState } from 'react';
import type { Prioriteit, Urgentie } from '@/lib/api';

/**
 * Dynamische editor voor plan-prioriteiten.
 * Gebruikt door zowel ressortplan- als districtsplan-builders.
 */
export function PrioriteitEditor({
  prioriteiten,
  setPrioriteiten,
}: {
  prioriteiten: Prioriteit[];
  setPrioriteiten: (p: Prioriteit[]) => void;
}) {
  function update(i: number, patch: Partial<Prioriteit>) {
    setPrioriteiten(prioriteiten.map((p, idx) => (idx === i ? { ...p, ...patch } : p)));
  }
  function verwijder(i: number) {
    setPrioriteiten(prioriteiten.filter((_, idx) => idx !== i));
  }
  function omhoog(i: number) {
    if (i === 0) return;
    const c = [...prioriteiten];
    [c[i - 1], c[i]] = [c[i], c[i - 1]];
    setPrioriteiten(c);
  }
  function omlaag(i: number) {
    if (i === prioriteiten.length - 1) return;
    const c = [...prioriteiten];
    [c[i], c[i + 1]] = [c[i + 1], c[i]];
    setPrioriteiten(c);
  }
  function voegToe() {
    setPrioriteiten([
      ...prioriteiten,
      { titel: '', onderbouwing: '', urgentie: 'MIDDEL' as Urgentie },
    ]);
  }

  return (
    <div className="space-y-3">
      {prioriteiten.length === 0 && (
        <p className="rounded border border-dashed border-gray-300 p-4 text-center text-sm text-gray-500">
          Nog geen prioriteiten. Klik op &quot;Prioriteit toevoegen&quot; om te beginnen.
        </p>
      )}

      {prioriteiten.map((p, i) => (
        <div
          key={i}
          className="space-y-3 rounded-lg border-2 border-gray-200 bg-white p-4"
        >
          <div className="flex items-center justify-between gap-2">
            <span className="rounded-full bg-sdp-groen px-2 py-0.5 text-xs font-semibold text-white">
              #{i + 1}
            </span>
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => omhoog(i)}
                disabled={i === 0}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                aria-label="Omhoog"
              >
                ↑
              </button>
              <button
                type="button"
                onClick={() => omlaag(i)}
                disabled={i === prioriteiten.length - 1}
                className="rounded p-1 text-gray-500 hover:bg-gray-100 disabled:opacity-30"
                aria-label="Omlaag"
              >
                ↓
              </button>
              <button
                type="button"
                onClick={() => verwijder(i)}
                className="rounded px-2 py-1 text-xs text-red-600 hover:bg-red-50"
              >
                Verwijder
              </button>
            </div>
          </div>

          <label className="block text-sm">
            <span className="mb-1 block font-medium">Titel</span>
            <input
              type="text"
              required
              minLength={3}
              maxLength={200}
              value={p.titel}
              onChange={(e) => update(i, { titel: e.target.value })}
              className="w-full rounded border-gray-300"
              placeholder="bv. Wegonderhoud Lelydorpweg Noord"
            />
          </label>

          <label className="block text-sm">
            <span className="mb-1 block font-medium">Onderbouwing</span>
            <textarea
              required
              minLength={10}
              maxLength={5000}
              rows={3}
              value={p.onderbouwing}
              onChange={(e) => update(i, { onderbouwing: e.target.value })}
              className="w-full rounded border-gray-300"
              placeholder="Wat is het probleem? Hoeveel mensen geraakt? Wat is de gewenste aanpak?"
            />
          </label>

          <div className="grid gap-3 sm:grid-cols-3">
            <label className="block text-sm">
              <span className="mb-1 block font-medium">Urgentie</span>
              <select
                value={p.urgentie ?? 'MIDDEL'}
                onChange={(e) => update(i, { urgentie: e.target.value as Urgentie })}
                className="w-full rounded border-gray-300"
              >
                <option value="LAAG">Laag</option>
                <option value="MIDDEL">Middel</option>
                <option value="HOOG">Hoog</option>
                <option value="CRISIS">Crisis</option>
              </select>
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium">Kostenraming (SRD)</span>
              <input
                type="number"
                min={0}
                step={1000}
                value={p.kostenraming ?? ''}
                onChange={(e) =>
                  update(i, {
                    kostenraming: e.target.value ? Number(e.target.value) : null,
                  })
                }
                className="w-full rounded border-gray-300"
                placeholder="0"
              />
            </label>

            <label className="block text-sm">
              <span className="mb-1 block font-medium">Doelgroep</span>
              <input
                type="text"
                maxLength={200}
                value={p.doelgroep ?? ''}
                onChange={(e) => update(i, { doelgroep: e.target.value || null })}
                className="w-full rounded border-gray-300"
                placeholder="bv. weggebruikers"
              />
            </label>
          </div>

          <label className="block text-sm">
            <span className="mb-1 block font-medium">Verwachte impact</span>
            <textarea
              rows={2}
              maxLength={2000}
              value={p.verwachteImpact ?? ''}
              onChange={(e) => update(i, { verwachteImpact: e.target.value || null })}
              className="w-full rounded border-gray-300"
              placeholder="Wat verbetert er als deze prioriteit wordt uitgevoerd?"
            />
          </label>
        </div>
      ))}

      <button
        type="button"
        onClick={voegToe}
        className="w-full rounded-lg border-2 border-dashed border-sdp-groen/40 px-4 py-3 text-sm font-medium text-sdp-groen hover:bg-emerald-50"
      >
        + Prioriteit toevoegen
      </button>
    </div>
  );
}
