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
      <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 sm:p-10 text-center space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-brand-800">
          Link niet geldig
        </h1>
        <p className="text-gray-700">
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
    <div className="max-w-xl mx-auto bg-white rounded-3xl p-6 sm:p-10 space-y-4">
      <h1 className="text-3xl font-bold tracking-tight text-brand-800">
        Wil je je afmelden?
      </h1>
      <p className="text-gray-700 leading-relaxed">
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
