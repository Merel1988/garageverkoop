import { prisma } from "@/lib/prisma";
import { eventDate, eventTimeRange, formatEventDate } from "@/lib/event";
import { PrintButton } from "./PrintButton";
import { PrintMapClient } from "./PrintMapClient";
import type { NumberedPin } from "./types";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Printversie · Garageverkoop Sambeek",
};

export default async function PrintPage() {
  const registrations = await prisma.registration.findMany({
    where: { confirmedAt: { not: null } },
    select: {
      id: true,
      street: true,
      houseNumber: true,
      latitude: true,
      longitude: true,
    },
  });

  const sorted = [...registrations].sort((a, b) => {
    const byStreet = a.street.localeCompare(b.street, "nl", {
      sensitivity: "base",
    });
    if (byStreet !== 0) return byStreet;
    return numericHouseNumber(a.houseNumber) - numericHouseNumber(b.houseNumber);
  });

  const numbered: NumberedPin[] = sorted.map((r, i) => ({
    ...r,
    number: i + 1,
  }));

  const date = eventDate();
  const time = eventTimeRange();

  return (
    <div className="max-w-4xl mx-auto space-y-6 print:space-y-2 print:max-w-none print:h-screen print:flex print:flex-col">
      <header className="space-y-1 print:space-y-0 print:shrink-0">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-800 print:text-black print:text-lg">
          Garageverkoop Sambeek
        </h1>
        <p className="text-gray-700 print:text-black print:text-xs">
          {date && formatEventDate(date)}
          {date && time ? " · " : ""}
          {time}
        </p>
        <p className="text-sm text-gray-600 print:text-black print:text-xs">
          {numbered.length} deelnemende huizen
        </p>
      </header>

      <PrintButton />

      {numbered.length === 0 ? (
        <p className="text-gray-600 italic">
          Nog geen bevestigde aanmeldingen.
        </p>
      ) : (
        <div className="print:flex-1 print:min-h-0">
          <PrintMapClient pins={numbered} />
        </div>
      )}
    </div>
  );
}

function numericHouseNumber(value: string): number {
  const m = value.match(/\d+/);
  return m ? Number.parseInt(m[0], 10) : 0;
}
