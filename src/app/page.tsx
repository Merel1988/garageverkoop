import Link from "next/link";
import { prisma } from "@/lib/prisma";
import {
  eventDate,
  eventTimeRange,
  formatEventDate,
  registrationsOpen,
} from "@/lib/event";
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
        <section className="space-y-5 py-4">
          {date && <DateBadge date={date} />}
          <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-brand-800 leading-[0.95]">
            Garageverkoop
            <br />
            <span className="text-brand-500">Sambeek</span>
          </h1>
          <p className="text-lg text-gray-700 max-w-2xl leading-relaxed">
            {registrations.length} deelnemende huizen staan op de kaart. Klik op
            een pin om te navigeren of vink meerdere aan voor een wandelroute.
          </p>
        </section>
        <ShelfIllustration />
        <MapClient registrations={registrations} />
      </div>
    );
  }

  return (
    <div className="space-y-20 sm:space-y-28">
      <section className="space-y-6 py-4 sm:py-8">
        {date && <DateBadge date={date} />}
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-brand-800 leading-[0.95]">
          Garageverkoop
          <br />
          <span className="text-brand-500">Sambeek</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-700 max-w-2xl leading-relaxed">
          Het is alweer bijna tijd voor de jaarlijkse garageverkoop in Sambeek!
          Doe jij ook (weer) mee? Meld je huis aan en geef jouw oude spullen een
          tweede leven.
          {date && (
            <>
              <br />
              De garageverkoop vindt plaats op {formatEventDate(date)}
              {eventTimeRange() ? ` van ${eventTimeRange()}` : ""}.
            </>
          )}
        </p>
        <div className="flex gap-3 flex-wrap pt-2">
          <Link
            href="/aanmelden"
            className="no-underline bg-brand-700 hover:bg-brand-800 text-white font-semibold px-7 py-3.5 rounded-full text-base transition-colors"
          >
            Meld je aan
          </Link>
          <Link
            href="/kaart"
            className="no-underline bg-accent-300 hover:bg-accent-400 text-brand-800 font-semibold px-7 py-3.5 rounded-full text-base transition-colors"
          >
            Bekijk de kaart
          </Link>
        </div>
      </section>

      <ShelfIllustration />

      <section>
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-brand-800 mb-8 sm:mb-10">
          Hoe werkt het?
        </h2>
        <div className="grid sm:grid-cols-3 gap-8 sm:gap-10">
          <Step
            num="1"
            tone="blue"
            title="Meld je aan"
            body="Vul het korte formulier in met je naam, e-mailadres en adres in Sambeek."
          />
          <Step
            num="2"
            tone="coral"
            title="Bevestig per mail"
            body="Je ontvangt direct een bevestigingsmail. Klik op de link om je pin op de kaart te zetten."
          />
          <Step
            num="3"
            tone="yellow"
            title="Zet alles klaar"
            body="Op de dag zelf zorg je ervoor dat je om 10:00 uur klaar zit met je spulletjes. Bezoekers vinden je via de kaart en kunnen een route langs meerdere garages samenstellen. Versier je oprit extra feestelijk om meer bezoekers te trekken!"
          />
        </div>
      </section>

      <Sparkles />

      <section className="bg-coral-100 rounded-3xl p-8 sm:p-12 space-y-3">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-coral-500">
          Toch afmelden?
        </h2>
        <p className="text-gray-800 leading-relaxed">
          Geen probleem. Onderaan iedere mail die je van ons ontvangt staat een
          persoonlijke afmeldlink. Daarmee verdwijnt je pin direct van de kaart
          en worden je gegevens verwijderd.
        </p>
      </section>

      <section className="text-sm text-gray-600">
        <h3 className="font-semibold text-ink mb-2">Privacy</h3>
        <p className="leading-relaxed">
          Alleen je straat en huisnummer worden zichtbaar op de openbare kaart.
          Je naam, e-mailadres en telefoonnummer zijn alleen voor de organisatie
          en worden niet gedeeld.
        </p>
      </section>
    </div>
  );
}

function ShelfIllustration() {
  return (
    <div className="rounded-3xl overflow-hidden bg-[#fdf1c6]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/illustraties/garage-schap.png"
        alt="Plank met tweedehands spullen — boeken, theepot, lamp, knuffelbeer, bloem en lijstje — met prijskaartjes erbij"
        className="w-full h-auto block"
      />
    </div>
  );
}

function Sparkles() {
  return (
    <div className="-my-4 sm:-my-8 pointer-events-none select-none" aria-hidden="true">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/illustraties/sparkles.png"
        alt=""
        className="w-full max-w-2xl mx-auto h-auto block mix-blend-multiply"
      />
    </div>
  );
}

function DateBadge({ date }: { date: Date }) {
  const time = eventTimeRange();
  return (
    <p className="inline-flex flex-wrap items-center gap-x-2 gap-y-1 bg-accent-300 text-brand-800 font-bold px-4 py-1.5 rounded-full text-sm">
      <span className="uppercase tracking-wide">{formatEventDate(date)}</span>
      {time && (
        <>
          <span aria-hidden="true">·</span>
          <span>{time}</span>
        </>
      )}
    </p>
  );
}

function Step({
  num,
  title,
  body,
  tone = "blue",
}: {
  num: string;
  title: string;
  body: string;
  tone?: "blue" | "coral" | "yellow";
}) {
  const toneClass =
    tone === "coral"
      ? "bg-coral-400 text-white"
      : tone === "yellow"
        ? "bg-accent-300 text-brand-800"
        : "bg-brand-700 text-white";
  return (
    <div className="space-y-3">
      <div
        className={`w-14 h-14 rounded-2xl font-bold text-2xl flex items-center justify-center ${toneClass}`}
      >
        {num}
      </div>
      <h3 className="text-xl font-bold text-brand-800">{title}</h3>
      <p className="text-gray-700 leading-relaxed">{body}</p>
    </div>
  );
}
