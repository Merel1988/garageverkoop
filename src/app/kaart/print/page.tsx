import { prisma } from "@/lib/prisma";
import {
  eventDate,
  eventTimeRange,
  formatEventDate,
} from "@/lib/event";
import { PrintButton } from "./PrintButton";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Printlijst · Garageverkoop Sambeek",
};

export default async function PrintPage() {
  const registrations = await prisma.registration.findMany({
    where: { confirmedAt: { not: null } },
    select: { street: true, houseNumber: true },
  });

  const sorted = [...registrations].sort((a, b) => {
    const byStreet = a.street.localeCompare(b.street, "nl", {
      sensitivity: "base",
    });
    if (byStreet !== 0) return byStreet;
    return numericHouseNumber(a.houseNumber) - numericHouseNumber(b.houseNumber);
  });

  const date = eventDate();
  const time = eventTimeRange();

  return (
    <div className="max-w-3xl mx-auto space-y-6 print:space-y-4">
      <header className="space-y-1 print:space-y-0.5">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-brand-800 print:text-black">
          Garageverkoop Sambeek
        </h1>
        <p className="text-gray-700 print:text-black">
          {date && formatEventDate(date)}
          {date && time ? " · " : ""}
          {time}
        </p>
        <p className="text-sm text-gray-600 print:text-black">
          {sorted.length} deelnemende huizen
        </p>
      </header>

      <PrintButton />

      <ol className="print:columns-2 print:gap-8 space-y-1 list-decimal list-inside marker:text-brand-800 marker:font-bold print:marker:text-black">
        {sorted.map((r, idx) => (
          <li
            key={`${r.street}-${r.houseNumber}-${idx}`}
            className="text-base print:text-sm break-inside-avoid"
          >
            <span className="font-medium">{r.street}</span> {r.houseNumber}
          </li>
        ))}
      </ol>

      {sorted.length === 0 && (
        <p className="text-gray-600 italic">
          Nog geen bevestigde aanmeldingen.
        </p>
      )}
    </div>
  );
}

function numericHouseNumber(value: string): number {
  const m = value.match(/\d+/);
  return m ? Number.parseInt(m[0], 10) : 0;
}
