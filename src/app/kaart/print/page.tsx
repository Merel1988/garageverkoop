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
    <div className="max-w-4xl mx-auto space-y-6 print:space-y-3">
      <header className="space-y-1 print:space-y-0">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-800 print:text-black print:text-2xl">
          Garageverkoop Sambeek
        </h1>
        <p className="text-gray-700 print:text-black">
          {date && formatEventDate(date)}
          {date && time ? " · " : ""}
          {time}
        </p>
        <p className="text-sm text-gray-600 print:text-black">
          {numbered.length} deelnemende huizen
        </p>
      </header>

      <PrintButton />

      {numbered.length === 0 ? (
        <p className="text-gray-600 italic">
          Nog geen bevestigde aanmeldingen.
        </p>
      ) : (
        <>
          <PrintMapClient pins={numbered} />

          <ul className="print:columns-2 print:gap-8 space-y-1 break-before-auto">
            {numbered.map((r) => (
              <li
                key={r.id}
                className="text-base print:text-sm break-inside-avoid text-ink print:text-black"
              >
                <span className="font-medium">{r.street}</span> {r.houseNumber}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}

function numericHouseNumber(value: string): number {
  const m = value.match(/\d+/);
  return m ? Number.parseInt(m[0], 10) : 0;
}
