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
    <div className="space-y-12 sm:space-y-16">
      <section className="space-y-5 py-4 relative">
        {date && <DateBadge date={date} />}
        <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight text-brand-800 leading-[0.95]">
          Garageverkoop
          <br />
          <span className="text-brand-500">Sambeek</span>
        </h1>
        <p className="text-lg sm:text-xl text-gray-700 max-w-2xl leading-relaxed">
          Op 1e pinksterdag verandert Sambeek weer in één grote markt.
          {date && (
            <>
              {" "}
              Op {formatEventDate(date)}
              {eventTimeRange() ? `, van ${eventTimeRange()}` : ""}, kun je
              snuffelen tussen kleding, boeken, speelgoed, gereedschap en nog
              veel meer.
            </>
          )}
        </p>
      </section>

      <section className="space-y-4">
        <div className="space-y-2">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#519872]">
            Deelnemende adressen
          </h2>
          <p className="text-gray-700 leading-relaxed">
            {registrations.length}{" "}
            {registrations.length === 1
              ? "adres doet mee"
              : "adressen doen mee"}
            . Klik op een pin voor de routebeschrijving, of vink meerdere pins
            aan om een wandelroute langs verschillende garages samen te
            stellen.
          </p>
        </div>
        <MapClient
          registrations={registrations}
          headerExtra={
            <Link
              href="/kaart/print"
              className="no-underline bg-accent-300 hover:bg-accent-400 text-brand-800 font-semibold px-4 py-2 rounded-full text-sm whitespace-nowrap"
            >
              Print kaart
            </Link>
          }
        />
      </section>

      <section className="bg-coral-100 rounded-3xl p-8 sm:p-12 space-y-3">
        <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-coral-500">
          Hoe herken je de deelnemers?
        </h2>
        <p className="text-gray-800 leading-relaxed">
          De deelnemende adressen zijn allemaal terug te vinden op de kaart, die
          je eventueel ook uit kan printen met de straatnaam en het huisnummer
          erbij. Gebruik daarvoor de printknop. <br></br>
          Voel je ook vrij om gewoon een rondje door het dorp te maken want de
          adressen zijn ook eenvoudig te herkennen aan versieringen zoals
          vlaggen, borden en ballonnen. Kom gerust struinen! We rekenen op een
          gezellige en drukbezochte dag.
        </p>
      </section>

      <div className="max-w-md sm:max-w-lg mx-auto">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/illustraties/tafel.svg"
          alt="Tafel met tweedehands spullen — boeken, theepot, lamp, knuffelbeer, bloem en lijstje — met prijskaartjes erbij"
          className="w-full h-auto block"
        />
      </div>

      {open && (
        <section className="bg-[#519872] text-white rounded-3xl p-8 sm:p-12 space-y-4 sm:flex sm:items-center sm:justify-between sm:space-y-0 sm:gap-8">
          <div className="space-y-2">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
              Zelf meedoen?
            </h2>
            <p className="text-white/90 leading-relaxed">
              Open je garage, geef je oude spullen een tweede leven en maak er
              samen een gezellige dag van.
            </p>
          </div>
          <Link
            href="/meedoen"
            className="inline-block no-underline bg-accent-300 hover:bg-accent-400 text-brand-800 font-semibold px-7 py-3.5 rounded-full text-base transition-colors whitespace-nowrap"
          >
            Meld je aan
          </Link>
        </section>
      )}
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
