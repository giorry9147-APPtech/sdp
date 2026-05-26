'use client';

import { useEffect, useMemo, useState } from 'react';
import { useDashboard } from '@/lib/dashboard-context';
import { api, type TrendData } from '@/lib/api';

const PERIODES = [
  { label: '30 dagen', dagen: 30 },
  { label: '90 dagen', dagen: 90 },
] as const;

/**
 * SVG-bar-chart, geen externe charting-lib nodig. Twee reeksen
 * (meldingen + vergunningen) gestaafd per dag, met X-as elke 7 dagen
 * gemarkeerd.
 */
export function TrendGrafiek() {
  const { activeDistrictId, sessie, effectiefSubregioId, gekozenRessortId } = useDashboard();
  const [dagen, setDagen] = useState<number>(30);
  const [data, setData] = useState<TrendData | null>(null);
  const [fout, setFout] = useState<string | null>(null);
  const [laden, setLaden] = useState(false);

  useEffect(() => {
    if (!activeDistrictId) return;
    setLaden(true);
    setFout(null);
    api
      .dashboardTrend(activeDistrictId, sessie.accessToken, {
        dagen,
        subregioId: effectiefSubregioId,
        ressortId: gekozenRessortId,
      })
      .then(setData)
      .catch((e) => setFout(e instanceof Error ? e.message : 'fout'))
      .finally(() => setLaden(false));
  }, [activeDistrictId, sessie.accessToken, dagen, effectiefSubregioId, gekozenRessortId]);

  const maxY = useMemo(() => {
    if (!data) return 1;
    let m = 0;
    for (const d of data.meldingen) m = Math.max(m, d.aantal);
    for (const d of data.vergunningen) m = Math.max(m, d.aantal);
    return Math.max(1, m);
  }, [data]);

  const totalen = useMemo(() => {
    if (!data) return { meldingen: 0, vergunningen: 0 };
    return {
      meldingen: data.meldingen.reduce((s, d) => s + d.aantal, 0),
      vergunningen: data.vergunningen.reduce((s, d) => s + d.aantal, 0),
    };
  }, [data]);

  return (
    <section className="rounded-lg bg-white p-5 shadow-sm">
      <header className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <h2 className="font-semibold">Instroom — laatste {dagen} dagen</h2>
          <p className="text-xs text-gray-500">
            {totalen.meldingen} meldingen · {totalen.vergunningen} vergunningen
          </p>
        </div>
        <div className="flex gap-1">
          {PERIODES.map((p) => (
            <button
              key={p.dagen}
              onClick={() => setDagen(p.dagen)}
              className={`rounded px-2 py-1 text-xs font-medium ${
                dagen === p.dagen
                  ? 'bg-sdp-groen text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </header>

      <div className="mt-3 flex gap-4 text-xs text-gray-600">
        <Legende kleur="#0c8d4f" label="Meldingen" />
        <Legende kleur="#1d4ed8" label="Vergunningen" />
      </div>

      {fout && (
        <div className="mt-3 rounded border border-red-300 bg-red-50 p-2 text-xs text-red-800">
          {fout}
        </div>
      )}

      {laden && !data && (
        <p className="mt-4 text-sm text-gray-500">Laden…</p>
      )}

      {data && (
        <ChartSvg
          meldingen={data.meldingen}
          vergunningen={data.vergunningen}
          maxY={maxY}
        />
      )}
    </section>
  );
}

function Legende({ kleur, label }: { kleur: string; label: string }) {
  return (
    <span className="flex items-center gap-1">
      <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: kleur }} />
      {label}
    </span>
  );
}

function ChartSvg({
  meldingen,
  vergunningen,
  maxY,
}: {
  meldingen: Array<{ datum: string; aantal: number }>;
  vergunningen: Array<{ datum: string; aantal: number }>;
  maxY: number;
}) {
  const dagen = meldingen.length;
  const W = 720;
  const H = 180;
  const padLeft = 30;
  const padBottom = 24;
  const padTop = 8;
  const chartW = W - padLeft - 8;
  const chartH = H - padBottom - padTop;
  const stepX = chartW / Math.max(1, dagen);
  const barW = Math.max(2, stepX * 0.35);

  const yScale = (v: number) => padTop + chartH - (v / maxY) * chartH;

  // Y-as labels (0, half, max)
  const yLabels = [0, Math.ceil(maxY / 2), maxY];

  // X-as: markeer iedere 7e dag of begin/eind
  const xTicks = meldingen
    .map((m, i) => ({ datum: m.datum, i }))
    .filter((t, idx, arr) =>
      idx === 0 || idx === arr.length - 1 || arr.length <= 14 || t.i % 7 === 0,
    );

  return (
    <div className="mt-3 overflow-x-auto">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="block w-full"
        preserveAspectRatio="none"
        role="img"
        aria-label="Trendgrafiek instroom meldingen en vergunningen"
      >
        {/* Y-grid */}
        {yLabels.map((v) => (
          <g key={v}>
            <line
              x1={padLeft}
              x2={W - 8}
              y1={yScale(v)}
              y2={yScale(v)}
              stroke="#e5e7eb"
              strokeDasharray="2,2"
            />
            <text
              x={padLeft - 4}
              y={yScale(v) + 3}
              fontSize="10"
              fill="#6b7280"
              textAnchor="end"
            >
              {v}
            </text>
          </g>
        ))}

        {/* Bars */}
        {meldingen.map((m, i) => {
          const v = vergunningen[i];
          const cx = padLeft + i * stepX + stepX / 2;
          const y1 = yScale(m.aantal);
          const y2 = yScale(v?.aantal ?? 0);
          return (
            <g key={m.datum}>
              <rect
                x={cx - barW}
                y={y1}
                width={barW - 1}
                height={padTop + chartH - y1}
                fill="#0c8d4f"
              />
              <rect
                x={cx + 1}
                y={y2}
                width={barW - 1}
                height={padTop + chartH - y2}
                fill="#1d4ed8"
              />
              <title>
                {m.datum} — {m.aantal} meldingen, {v?.aantal ?? 0} vergunningen
              </title>
            </g>
          );
        })}

        {/* X-axis */}
        <line
          x1={padLeft}
          x2={W - 8}
          y1={padTop + chartH}
          y2={padTop + chartH}
          stroke="#9ca3af"
        />
        {xTicks.map(({ datum, i }) => (
          <text
            key={datum}
            x={padLeft + i * stepX + stepX / 2}
            y={H - 6}
            fontSize="10"
            fill="#6b7280"
            textAnchor="middle"
          >
            {datum.slice(5)}
          </text>
        ))}
      </svg>
    </div>
  );
}
