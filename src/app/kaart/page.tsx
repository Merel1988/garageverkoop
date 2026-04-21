import { prisma } from "@/lib/prisma";
import {
  eventDate,
  eventTimeRange,
  formatEventDate,
} from "@/lib/event";
import { MapClient } from "./MapClient";

export const dynamic = "force-dynamic";

export default async function KaartPage() {
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

  const date = eventDate();
  const time = eventTimeRange();

  return (
    <div className="space-y-6 print:space-y-3">
      <div className="print:hidden space-y-2">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-brand-800">
          Kaart
        </h1>
        <p className="text-gray-700 leading-relaxed">
          {registrations.length}{" "}
          {registrations.length === 1 ? "huis doet mee" : "huizen doen mee"}.
          Klik op een pin voor de routebeschrijving, of vink meerdere pins aan
          om een wandelroute langs verschillende garages samen te stellen.
        </p>
      </div>

      <div className="hidden print:block space-y-0.5">
        <h1 className="text-2xl font-bold text-black">
          Garageverkoop Sambeek
        </h1>
        {(date || time) && (
          <p className="text-sm text-black">
            {date && formatEventDate(date)}
            {date && time ? " · " : ""}
            {time}
          </p>
        )}
        <p className="text-sm text-black">
          {registrations.length} deelnemende huizen
        </p>
      </div>

      <MapClient registrations={registrations} />
    </div>
  );
}
