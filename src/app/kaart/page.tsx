import { prisma } from "@/lib/prisma";
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

  return (
    <div className="space-y-6">
      <div className="space-y-2">
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
      <MapClient registrations={registrations} />
    </div>
  );
}
