import type { Metadata } from "next";
import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { MapClient } from "./MapClient";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Kaart met deelnemers",
  description:
    "Bekijk alle deelnemende adressen van de garageverkoop in Sambeek op de kaart. Klik op een pin om er heen te navigeren of stel een eigen wandelroute samen.",
  alternates: { canonical: "/kaart" },
};

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

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="space-y-2 flex-1 min-w-0">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-brand-800">
            Kaart
          </h1>
          <p className="text-gray-700 leading-relaxed">
            {registrations.length}{" "}
            {registrations.length === 1 ? "adres doet mee" : "adressen doen mee"}.
            Klik op een pin voor de routebeschrijving, of vink meerdere pins aan
            om een wandelroute langs verschillende garages samen te stellen.
          </p>
        </div>
        <Link
          href="/kaart/print"
          className="no-underline bg-accent-300 hover:bg-accent-400 text-brand-800 font-semibold px-4 py-2 rounded-full text-sm whitespace-nowrap"
        >
          Print kaart
        </Link>
      </div>
      <MapClient registrations={registrations} />
    </div>
  );
}
