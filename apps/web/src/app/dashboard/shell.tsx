'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { DashboardProvider, useDashboard } from '@/lib/dashboard-context';

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <DashboardProvider>
      <Innerlijk>{children}</Innerlijk>
    </DashboardProvider>
  );
}

function Innerlijk({ children }: { children: React.ReactNode }) {
  const { sessie, heeft, uitloggen } = useDashboard();
  const path = usePathname();

  type NavItem = { href: string; label: string; needs?: string };
  const items: NavItem[] = [
    { href: '/dashboard', label: 'Overzicht' },
    { href: '/dashboard/meldingen', label: 'Meldingen', needs: 'melding.read.district' },
    { href: '/dashboard/vergunningen', label: 'Vergunningen', needs: 'vergunning.read.district' },
    { href: '/dashboard/projecten', label: 'Projecten', needs: 'project.read.district' },
    { href: '/dashboard/plannen', label: 'Plannen' },
    { href: '/dashboard/financien', label: 'Districtsfonds', needs: 'fonds.read' },
  ];
  const zichtbaar = items.filter((i) => !i.needs || heeft(i.needs));

  return (
    <div className="grid gap-6 md:grid-cols-[220px_1fr]">
      <aside className="md:sticky md:top-6 md:self-start">
        <div className="rounded-lg bg-white p-4 shadow-sm">
          <p className="text-xs uppercase text-gray-500">Ingelogd</p>
          <p className="mt-1 font-medium">{sessie.user.naam}</p>
          <p className="text-xs text-gray-500">{sessie.user.email}</p>
          <p className="mt-2 text-xs text-gray-600">
            {sessie.user.rollen.map((r) => r.rol).join(', ') || '—'}
          </p>
          <button
            onClick={uitloggen}
            className="mt-3 text-xs text-gray-600 underline hover:text-gray-900"
          >
            Uitloggen
          </button>
        </div>

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
