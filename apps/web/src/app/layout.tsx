import './globals.css';
import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'SDP — Suriname Decentralisatie Platform',
  description:
    'Digitaal bestuurs- en decentralisatieplatform voor districtscommissariaten ' +
    'en regionale overheden in Suriname.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <body>
        <header className="bg-sdp-groen text-white shadow">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4">
            <Link href="/" className="flex items-center gap-3 font-semibold">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-sdp-geel text-sdp-groen font-bold">
                SR
              </div>
              <span className="hidden sm:inline">Suriname Decentralisatie Platform</span>
              <span className="sm:hidden">SDP</span>
            </Link>
            <nav className="flex flex-wrap gap-x-4 gap-y-2 text-sm">
              <Link href="/melden" className="hover:underline">Melden</Link>
              <Link href="/vergunningen/aanvragen" className="hover:underline">Vergunning</Link>
              <Link href="/status" className="hover:underline">Mijn melding</Link>
              <Link href="/vergunningen/status" className="hover:underline">Mijn vergunning</Link>
              <Link href="/districten" className="hover:underline">Districten</Link>
              <Link href="/login" className="rounded bg-white/15 px-3 py-1 hover:bg-white/25">
                Login
              </Link>
            </nav>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>

        <footer className="mt-12 border-t bg-white">
          <div className="mx-auto max-w-6xl px-4 py-6 text-sm text-gray-600">
            <p>
              SDP — pilot, in ontwikkeling. Geen besluiten over grondenrechten,
              kadaster of eigendom. Wij ondersteunen decentralisatie en
              bestuurlijke transparantie volgens de Wet Regionale Organen.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
