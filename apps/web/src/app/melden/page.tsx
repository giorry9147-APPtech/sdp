import { api } from '@/lib/api';
import { MeldFormulier } from './formulier';

export const revalidate = 300;

export default async function MeldenPage() {
  const [districten, categorieen] = await Promise.all([
    api.districten().catch(() => []),
    api.categorieen('melding').catch(() => []),
  ]);

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold text-sdp-groen">Meld een probleem</h1>
      <p className="mt-2 text-gray-700">
        Een drempel die ontbreekt, wateroverlast, een kapotte straatlantaarn,
        klacht over dienstverlening — meld het hier aan uw districtscommissariaat.
      </p>
      <p className="mt-1 text-sm text-gray-500">
        U heeft <strong>geen account nodig</strong>. U ontvangt een
        ticketnummer waarmee u de status kunt volgen.
      </p>

      <div className="mt-6 rounded-lg border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
        <strong>Wat dit platform niet doet:</strong> geen besluiten over
        grondenrechten, geen vervanging van kadaster of rechter. Wij geven uw
        melding door aan de juiste afdeling van het districtscommissariaat.
      </div>

      <MeldFormulier districten={districten} categorieen={categorieen} />
    </div>
  );
}
