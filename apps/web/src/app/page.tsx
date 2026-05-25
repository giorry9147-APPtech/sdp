import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="space-y-12">
      <section className="rounded-2xl bg-gradient-to-br from-sdp-groen to-emerald-700 p-8 text-white shadow-lg sm:p-12">
        <h1 className="text-3xl font-bold sm:text-4xl">
          Decentralisatie. Zichtbaar. Werkbaar.
        </h1>
        <p className="mt-3 max-w-2xl text-lg text-white/90">
          Het Suriname Decentralisatie Platform digitaliseert de bestuurlijke
          werking van districtscommissariaten — lokale meldingen, vergunningen,
          ressortplannen en districtsprojecten op één plek.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/melden"
            className="rounded-lg bg-sdp-geel px-5 py-3 font-semibold text-sdp-groen shadow hover:bg-yellow-400"
          >
            Meld een probleem
          </Link>
          <Link
            href="/vergunningen/aanvragen"
            className="rounded-lg bg-white px-5 py-3 font-semibold text-sdp-groen shadow hover:bg-gray-50"
          >
            Vraag een vergunning aan
          </Link>
          <Link
            href="/status"
            className="rounded-lg border-2 border-white/50 px-5 py-3 font-semibold hover:bg-white/10"
          >
            Volg een dossier
          </Link>
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">Waar is SDP voor?</h2>
        <div className="grid gap-4 sm:grid-cols-3">
          <Kaart
            titel="Voor burgers"
            tekst="Meld kapotte wegen, drainage, vuilophaal, straatverlichting of andere lokale problemen aan uw districtscommissariaat. Geen account nodig — alleen een ticketnummer om de status te volgen."
          />
          <Kaart
            titel="Voor districtscommissariaten"
            tekst="Eén scherm voor alle openstaande zaken in uw district. Meldingen, vergunningen, projecten en plannen. Met audit-trail vanaf dag 1."
          />
          <Kaart
            titel="Voor ressortraden"
            tekst="Stel ressortplannen op met prioriteiten van uw ressort. Aggregeer met andere ressorten tot een districtsplan. WRO-conform."
          />
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xl font-semibold">De 10 districten</h2>
        <p className="mb-4 text-gray-700">
          SDP werkt voor alle 10 districten van Suriname en hun ressorten,
          conform de Wet Regionale Organen.
        </p>
        <Link
          href="/districten"
          className="inline-block text-sdp-groen underline hover:text-emerald-700"
        >
          Bekijk districten →
        </Link>
      </section>
    </div>
  );
}

function Kaart({ titel, tekst }: { titel: string; tekst: string }) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
      <h3 className="mb-2 font-semibold text-sdp-groen">{titel}</h3>
      <p className="text-sm text-gray-700">{tekst}</p>
    </div>
  );
}
