import { Suspense } from 'react';
import { FeedbackForm } from './feedback-form';

export default function FeedbackPage({
  searchParams,
}: {
  searchParams: { token?: string };
}) {
  const token = searchParams.token ?? '';
  return (
    <div className="mx-auto max-w-xl">
      <h1 className="text-2xl font-bold text-sdp-groen">
        Is uw melding echt opgelost?
      </h1>
      <p className="mt-2 text-gray-700">
        Het districtscommissariaat heeft uw melding gemarkeerd als opgelost.
        Bevestig hieronder of het probleem ook echt verholpen is.
      </p>
      <Suspense>
        <FeedbackForm token={token} />
      </Suspense>
    </div>
  );
}
