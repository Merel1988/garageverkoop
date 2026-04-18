import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { eventDate, formatEventDate, registrationsOpen } from "@/lib/event";
import { MapClient } from "./kaart/MapClient";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const date = eventDate();
  const open = registrationsOpen();

  if (!open) {
    const registrations = await prisma.registration.findMany({
      where: { confirmedAt: { not: null } },
      select: {
        id: true,
        name: true,
        street: true,
        houseNumber: true,
        latitude: true,
        longitude: true,
      },
      orderBy: { createdAt: "asc" },
    });

    return (
      <div className="space-y-8">
        <Hero date={date} subtitle={`Hieronder vind je alle ${registrations.length} deelnemende huizen in Sambeek. Klik op een pin om te navigeren, of vink meerdere pins aan voor een wandelroute.`} />
        <MapClient registrations={registrations} />
      </div>
    );
  }

  return (
    <div className="space-y-16">
      <Hero
        date={date}
        subtitle="Zet jouw garage, schuur of oprit op de kaart. Opruimen, weggeven of verkopen — alle buurtgenoten zijn welkom om langs te komen."
        actions={
          <>
            <Link
              href="/aanmelden"
              className="no-underline bg-brand-700 hover:bg-brand-800 text-white font-semibold px-6 py-3 rounded-full shadow-md shadow-brand-700/20 transition-transform hover:-translate-y-0.5"
            >
              Meld mijn huis aan
            </Link>
            <Link
              href="/kaart"
              className="no-underline bg-white border-2 border-brand-700 text-brand-700 font-semibold px-6 py-3 rounded-full hover:bg-brand-50 transition-colors"
            >
              Bekijk de kaart
            </Link>
          </>
        }
      />

      <section className="grid sm:grid-cols-3 gap-4 sm:gap-6">
        <Card
          step="1"
          title="Meld je aan"
          body="Vul het korte formulier in met je naam, e-mailadres en adres in Sambeek."
        />
        <Card
          step="2"
          title="Bevestig per mail"
          body="Je ontvangt een bevestigingsmail. Klik op de link om je pin op de kaart te zetten."
        />
        <Card
          step="3"
          title="Zet alles klaar"
          body="Zorg dat je spullen op de dag zelf klaarstaan. Bezoekers kunnen je huis op de kaart vinden en een route samenstellen langs meerdere garages."
        />
      </section>

      <section className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 sm:p-8 shadow-sm ring-1 ring-brand-100 space-y-3">
        <h2 className="text-xl sm:text-2xl font-semibold text-brand-700">
          Hoe werkt het?
        </h2>
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

      <section className="text-sm text-gray-600 border-t border-brand-100 pt-6 pb-2">
        <h3 className="font-semibold text-ink mb-2">Privacy</h3>
        <p>
          Je naam en adres worden getoond op de openbare kaart. Je e-mailadres
          en eventuele telefoonnummer worden alleen gebruikt voor communicatie
          over de garageverkoop en zijn niet zichtbaar voor bezoekers.
        </p>
      </section>
    </div>
  );
}

function Hero({
  date,
  subtitle,
  actions,
}: {
  date: Date | null;
  subtitle: string;
  actions?: React.ReactNode;
}) {
  return (
    <section className="relative isolate overflow-hidden rounded-3xl bg-gradient-to-br from-brand-50 via-white to-accent-50 px-6 sm:px-10 py-10 sm:py-16 shadow-sm ring-1 ring-brand-100">
      <div
        aria-hidden="true"
        className="absolute -top-16 -right-16 h-48 w-48 rounded-full bg-accent-200/60 blur-3xl"
      />
      <div
        aria-hidden="true"
        className="absolute -bottom-20 -left-12 h-56 w-56 rounded-full bg-brand-200/50 blur-3xl"
      />
      <div className="relative text-center space-y-5 max-w-2xl mx-auto">
        {date && (
          <p className="inline-flex items-center gap-2 bg-white/80 backdrop-blur-sm text-brand-800 font-semibold px-4 py-1.5 rounded-full ring-1 ring-brand-100 text-sm">
            📅 {formatEventDate(date)}
          </p>
        )}
        <h1 className="text-4xl sm:text-5xl font-bold text-brand-800 tracking-tight">
          Garageverkoop <span className="text-accent-500">Sambeek</span>
        </h1>
        <p className="text-base sm:text-lg text-gray-700">{subtitle}</p>
        {actions && (
          <div className="flex gap-3 justify-center pt-2 flex-wrap">
            {actions}
          </div>
        )}
      </div>
    </section>
  );
}

function Card({
  step,
  title,
  body,
}: {
  step: string;
  title: string;
  body: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm ring-1 ring-brand-100 hover:shadow-md hover:-translate-y-0.5 transition-all">
      <div className="flex items-center gap-3 mb-2">
        <span className="flex items-center justify-center w-9 h-9 rounded-full bg-accent-300 text-brand-800 font-bold">
          {step}
        </span>
        <h3 className="font-semibold text-brand-700">{title}</h3>
      </div>
      <p className="text-sm text-gray-700 leading-relaxed">{body}</p>
    </div>
  );
}
