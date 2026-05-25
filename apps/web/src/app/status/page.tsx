import { Suspense } from 'react';
import { StatusZoek } from './status-zoek';

export default function StatusPage({
  searchParams,
}: {
  searchParams: { nr?: string };
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-sdp-groen">Volg een melding</h1>
      <p className="mt-2 text-gray-700">
        Voer uw ticketnummer in om de status van uw melding te zien.
      </p>
      <Suspense>
        <StatusZoek initieleQuery={searchParams.nr} />
      </Suspense>
    </div>
  );
}
