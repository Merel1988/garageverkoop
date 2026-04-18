import Link from "next/link";
import { eventDate, formatEventDate, registrationsOpen } from "@/lib/event";

export default function HomePage() {
  const date = eventDate();
  const open = registrationsOpen();

  return (
    <div className="space-y-12">
      <section className="text-center space-y-4 pt-4">
        <h1 className="text-4xl sm:text-5xl font-bold text-brand-700">
          Garageverkoop <span className="text-accent-500">Sambeek</span>
        </h1>
        <p className="text-lg text-gray-700 max-w-2xl mx-auto">
          Zet jouw garage, schuur of oprit op de kaart. Opruimen, weggeven of
          verkopen — alle buurtgenoten zijn welkom om langs te komen.
        </p>
        {date && (
          <p className="inline-block bg-accent-200 text-brand-800 font-semibold px-4 py-1 rounded-full">
            📅 {formatEventDate(date)}
          </p>
        )}
        <div className="flex gap-3 justify-center pt-2 flex-wrap">
          {open ? (
            <Link
              href="/aanmelden"
              className="no-underline bg-brand-700 hover:bg-brand-800 text-white font-semibold px-6 py-3 rounded-md"
            >
              Meld mijn huis aan
            </Link>
          ) : (
            <span className="bg-gray-200 text-gray-600 font-semibold px-6 py-3 rounded-md">
              Aanmeldingen zijn gesloten
            </span>
          )}
          <Link
            href="/kaart"
            className="no-underline border-2 border-brand-700 text-brand-700 font-semibold px-6 py-3 rounded-md hover:bg-brand-50"
          >
            Bekijk de kaart
          </Link>
        </div>
      </section>

      <section className="grid sm:grid-cols-3 gap-6">
        <Card title="1. Meld je aan" body="Vul het korte formulier in met je naam, e-mailadres en adres in Sambeek." />
        <Card title="2. Bevestig per mail" body="Je ontvangt een bevestigingsmail. Klik op de link om je pin op de kaart te zetten." />
        <Card title="3. Zet alles klaar" body="Zorg dat je spullen op de dag zelf klaarstaan. Bezoekers kunnen je huis op de kaart vinden en een route langs meerdere garages plannen." />
      </section>

      <section className="bg-white border border-brand-100 rounded-lg p-6 space-y-3 border-l-4 border-l-accent-400">
        <h2 className="text-xl font-semibold text-brand-700">Hoe werkt het?</h2>
        <p>
          Wil je meedoen? Meld je <Link href="/aanmelden">hier aan</Link>. Zodra
          je de bevestigingslink in je mail aanklikt, verschijnt jouw huis
          automatisch als pin op de <Link href="/kaart">kaart</Link>.
        </p>
        <p>
          Op de dag zelf kunnen bezoekers op elke pin klikken om direct naar
          jouw adres te navigeren, of ze vinken meerdere pins aan om een
          wandelroute langs verschillende garages te maken.
        </p>
        <p>
          Wil je je weer afmelden? Dat kan altijd via de afmeldlink in de mail
          die je ontving bij het aanmelden.
        </p>
      </section>

      <section className="text-sm text-gray-600 border-t border-brand-100 pt-6">
        <h3 className="font-semibold text-gray-800 mb-2">Privacy</h3>
        <p>
          Je naam en adres worden getoond op de openbare kaart. Je e-mailadres
          en eventuele telefoonnummer worden alleen gebruikt voor communicatie
          over de garageverkoop en zijn niet zichtbaar voor bezoekers.
        </p>
      </section>
    </div>
  );
}

function Card({ title, body }: { title: string; body: string }) {
  return (
    <div className="bg-white border border-brand-100 rounded-lg p-5 space-y-2 border-t-4 border-t-accent-400">
      <h3 className="font-semibold text-brand-700">{title}</h3>
      <p className="text-sm text-gray-700">{body}</p>
    </div>
  );
}
