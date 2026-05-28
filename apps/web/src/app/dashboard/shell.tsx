'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { DashboardProvider, useDashboard } from '@/lib/dashboard-context';
import { api, type Ressort } from '@/lib/api';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <Innerlijk>{children}</Innerlijk>
    </DashboardProvider>
  );
}

function Innerlijk({ children }: { children: React.ReactNode }) {
  const {
    sessie,
    heeft,
    uitloggen,
    activeDistrictId,
    activeSubregioNaam,
    activeSubregioCode,
    filterEigenSubregio,
    setFilterEigenSubregio,
    gekozenRessortId,
    setGekozenRessortId,
    isExtern,
    activeOrganisatieNaam,
  } = useDashboard();
  const path = usePathname();
  const [ressorten, setRessorten] = useState<Ressort[]>([]);

  useEffect(() => {
    if (!activeDistrictId) return;
    api
      .ressorten()
      .then((alle) => setRessorten(alle.filter((r) => r.districtId === activeDistrictId)))
      .catch(() => setRessorten([]));
  }, [activeDistrictId]);

  type NavItem = { href: string; label: string; needs?: string };
  const items: NavItem[] = isExtern
    ? [
        { href: '/dashboard', label: 'Overzicht' },
        { href: '/dashboard/verzoeken', label: 'Mijn verzoeken', needs: 'verzoek.read.eigen_organisatie' },
      ]
    : [
        { href: '/dashboard', label: 'Overzicht' },
        { href: '/dashboard/meldingen', label: 'Meldingen', needs: 'melding.read.district' },
        { href: '/dashboard/vergunningen', label: 'Vergunningen', needs: 'vergunning.read.district' },
        { href: '/dashboard/verzoeken', label: 'Verzoeken', needs: 'verzoek.read.district' },
        { href: '/dashboard/projecten', label: 'Projecten', needs: 'project.read.district' },
        { href: '/dashboard/plannen', label: 'Plannen' },
        { href: '/dashboard/financien', label: 'Districtsfonds', needs: 'fonds.read' },
      ];
  const zichtbaar = items.filter((i) => !i.needs || heeft(i.needs));

  return (
    <div className="grid gap-6 md:grid-cols-[240px_1fr]">
      <aside className="md:sticky md:top-6 md:self-start">
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-gray-500">Ingelogd</p>
          <p className="mt-1 font-medium">{sessie.user.naam}</p>
          <p className="text-xs text-gray-500">{sessie.user.email}</p>
          <p className="mt-2 text-xs text-gray-600">
            {sessie.user.rollen.map((r) => r.rol).join(', ') || '—'}
          </p>
          {activeSubregioNaam && (
            <p className="mt-1 text-xs">
              <span className="rounded-full bg-sdp-groen/10 px-2 py-0.5 text-sdp-groen">
                {activeSubregioCode} · {activeSubregioNaam}
              </span>
            </p>
          )}
          {isExtern && activeOrganisatieNaam && (
            <p className="mt-1 text-xs">
              <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-indigo-800">
                Externe dienst · {activeOrganisatieNaam}
              </span>
            </p>
          )}
          <button
            onClick={uitloggen}
            className="mt-3 text-xs text-gray-600 underline hover:text-gray-900"
          >
            Uitloggen
          </button>
        </div>

        {(activeSubregioNaam || ressorten.length > 0) && (
          <div className="mt-4 space-y-3 rounded-lg bg-white p-3 shadow-sm">
            <p className="text-xs font-semibold uppercase text-gray-500">Filters</p>

            {activeSubregioNaam && (
              <label className="flex cursor-pointer items-start gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={filterEigenSubregio}
                  onChange={(e) => setFilterEigenSubregio(e.target.checked)}
                  className="mt-0.5 rounded text-sdp-groen focus:ring-sdp-groen"
                />
                <span>
                  <span className="font-medium">Alleen mijn subregio</span>
                  <span className="block text-gray-500">
                    {filterEigenSubregio
                      ? `Toon alleen ${activeSubregioNaam}.`
                      : 'Toon het hele district.'}
                  </span>
                </span>
              </label>
            )}

            {ressorten.length > 0 && (
              <label className="block text-xs">
                <span className="mb-1 block font-medium text-gray-700">Ressort</span>
                <select
                  value={gekozenRessortId ?? ''}
                  onChange={(e) =>
                    setGekozenRessortId(e.target.value ? Number(e.target.value) : undefined)
                  }
                  className="w-full rounded border-gray-300 text-xs"
                >
                  <option value="">Alle ressorten</option>
                  {ressorten.map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.naam}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>
        )}

        <nav className="mt-4 rounded-lg bg-white p-2 shadow-sm">
          {zichtbaar.map((i) => {
            const actief = path === i.href || path.startsWith(`${i.href}/`);
            return (
              <Link
                key={i.href}
                href={i.href}
                className={`block rounded px-3 py-2 text-sm ${
                  actief
                    ? 'bg-sdp-groen text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                {i.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      <section>{children}</section>
    </div>
  );
}
