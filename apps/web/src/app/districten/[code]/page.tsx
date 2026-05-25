import Link from 'next/link';
import { notFound } from 'next/navigation';
import { api } from '@/lib/api';

export const revalidate = 60;

export default async function DistrictDetail({
  params,
}: {
  params: { code: string };
}) {
  let district;
  try {
    district = await api.district(params.code);
  } catch {
    notFound();
  }

  return (
    <div>
      <nav className="mb-4 text-sm">
        <Link href="/districten" className="text-sdp-groen hover:underline">
          ← Alle districten
        </Link>
      </nav>

      <header className="mb-8 rounded-lg bg-white p-6 shadow-sm">
        <h1 className="text-3xl font-bold text-sdp-groen">{district.naam}</h1>
        <p className="mt-1 text-gray-600">
          Hoofdstad: {district.hoofdstad ?? '—'} · Code: <code>{district.code}</code>
        </p>
      </header>

      <h2 className="mb-3 text-xl font-semibold">
        Ressorten ({district.ressorten.length})
      </h2>
      <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
        {district.ressorten.map((r) => (
          <li
            key={r.id}
            className="rounded border border-gray-200 bg-white px-4 py-3 text-sm shadow-sm"
          >
            <div className="font-medium">{r.naam}</div>
            <div className="font-mono text-xs text-gray-500">{r.code}</div>
          </li>
        ))}
      </ul>

      <div className="mt-8 rounded-lg border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800">
        <strong>Let op:</strong> ressortnamen zijn werknamen op basis van openbare bronnen
        en moeten gevalideerd worden tegen Decreet Ressortenindeling S.B. 1987 No. 67.
      </div>
    </div>
  );
}
