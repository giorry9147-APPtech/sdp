import Link from 'next/link';
import { api } from '@/lib/api';

export const revalidate = 60;

export default async function DistrictenPage() {
  let districten;
  try {
    districten = await api.districten();
  } catch (e) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
        <p className="font-semibold">API niet bereikbaar.</p>
        <p className="text-sm">Start de backend met <code>pnpm --filter @sdp/api dev</code>.</p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">De 10 districten van Suriname</h1>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {districten.map((d) => (
          <Link
            key={d.id}
            href={`/districten/${d.code}`}
            className="group rounded-lg border border-gray-200 bg-white p-5 shadow-sm transition hover:border-sdp-groen hover:shadow"
          >
            <div className="flex items-baseline justify-between">
              <h2 className="text-lg font-semibold text-sdp-groen group-hover:underline">
                {d.naam}
              </h2>
              <span className="text-xs font-mono text-gray-500">{d.code}</span>
            </div>
            <p className="mt-1 text-sm text-gray-600">
              Hoofdstad: {d.hoofdstad ?? '—'}
            </p>
            <p className="mt-2 text-sm text-gray-500">
              {d._count?.ressorten ?? 0} ressorten
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
