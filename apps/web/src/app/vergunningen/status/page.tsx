import { Suspense } from 'react';
import { StatusZoek } from './status-zoek';

export default function VergunningStatusPage({
  searchParams,
}: {
  searchParams: { ref?: string };
}) {
  return (
    <div className="mx-auto max-w-2xl">
      <h1 className="text-2xl font-bold text-sdp-groen">Volg een vergunningaanvraag</h1>
      <p className="mt-2 text-gray-700">
        Voer uw referentienummer in om de status van uw vergunningaanvraag te
        bekijken.
      </p>
      <Suspense>
        <StatusZoek initieleQuery={searchParams.ref} />
      </Suspense>
    </div>
  );
}
