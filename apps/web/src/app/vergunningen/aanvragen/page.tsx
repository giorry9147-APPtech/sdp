import { api } from '@/lib/api';
import { AanvraagFormulier } from './formulier';

export const revalidate = 300;

export default async function VergunningAanvragenPage() {
  const [districten, categorieen] = await Promise.all([
    api.districten().catch(() => []),
    api.categorieen('vergunning').catch(() => []),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-sdp-groen">Vergunning aanvragen</h1>
      <p className="mt-2 text-gray-700">
        Aanvragen voor vergunningen die door de districtscommissaris worden
        behandeld: hinderwet, marktstand, evenement, geluidsontheffing,
        kapvergunning.
      </p>
      <p className="mt-1 text-sm text-gray-500">
        Geen account nodig. U ontvangt een referentienummer waarmee u de
        behandeling kunt volgen.
      </p>

      <div className="mt-6 rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
        <strong>Welke vergunningen vraagt u hier níet aan?</strong>
        <ul className="mt-1 list-inside list-disc">
          <li>Bouwvergunning — ministerie OW (komt in Fase 2)</li>
          <li>Grondaanvragen — Ministerie van Grondbeleid (buiten DC-mandaat)</li>
          <li>Rijbewijs / paspoort — KPS / CBB</li>
        </ul>
      </div>

      <AanvraagFormulier districten={districten} categorieen={categorieen} />
    </div>
  );
}
