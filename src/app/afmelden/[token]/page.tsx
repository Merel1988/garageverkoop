import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { UnsubscribeForm } from "./UnsubscribeForm";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }> };

export default async function AfmeldenPage({ params }: Props) {
  const { token } = await params;

  const registration = await prisma.registration.findUnique({
    where: { unsubscribeToken: token },
    select: { id: true, name: true, street: true, houseNumber: true },
  });

  if (!registration) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-2xl p-8 shadow-sm ring-1 ring-brand-100 text-center space-y-3">
        <h1 className="text-2xl font-bold text-brand-700">
          Link niet geldig
        </h1>
        <p>
          Deze afmeldlink is niet bekend. Misschien ben je al afgemeld, of is
          de link niet compleet gekopieerd.
        </p>
        <p>
          <Link href="/">Terug naar home</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl p-6 sm:p-8 shadow-sm ring-1 ring-brand-100 space-y-4">
      <h1 className="text-2xl font-bold text-brand-700">Wil je je afmelden?</h1>
      <p>
        Je staat ingeschreven met{" "}
        <strong>
          {registration.street} {registration.houseNumber}
        </strong>{" "}
        (op naam van {registration.name}). Als je bevestigt wordt je pin
        verwijderd van de kaart en worden je gegevens gewist.
      </p>
      <UnsubscribeForm token={token} />
    </div>
  );
}
