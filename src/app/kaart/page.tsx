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
    <div className="space-y-4">
      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h1 className="text-3xl font-bold text-brand-700">Kaart</h1>
        <p className="text-sm text-gray-600">
          {registrations.length} {registrations.length === 1 ? "aanmelding" : "aanmeldingen"}
        </p>
      </div>
      <p className="text-gray-700">
        Klik op een pin voor de routebeschrijving. Vink meerdere pins aan om een
        wandelroute samen te stellen.
      </p>
      <MapClient registrations={registrations} />
    </div>
  );
}
