import Link from "next/link";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }> };

export default async function BevestigenPage({ params }: Props) {
  const { token } = await params;

  const registration = await prisma.registration.findUnique({
    where: { confirmToken: token },
  });

  if (!registration) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-2xl p-8 shadow-sm ring-1 ring-brand-100 text-center space-y-3">
        <h1 className="text-2xl font-bold text-brand-700">Link niet geldig</h1>
        <p>
          Deze bevestigingslink is niet bekend of al gebruikt. Als je al eerder
          op de link hebt geklikt, staat je pin al op de <Link href="/kaart">kaart</Link>.
        </p>
      </div>
    );
  }

  if (!registration.confirmedAt) {
    await prisma.registration.update({
      where: { id: registration.id },
      data: { confirmedAt: new Date() },
    });
  }

  return (
    <div className="max-w-xl mx-auto bg-white rounded-2xl p-8 shadow-sm ring-1 ring-brand-100 text-center space-y-4">
      <div className="text-5xl">🎉</div>
      <h1 className="text-2xl font-bold text-brand-700">Bedankt!</h1>
      <p>
        Je aanmelding is bevestigd. Jouw huis staat nu op de kaart van de
        garageverkoop in Sambeek.
      </p>
      <div className="pt-2">
        <Link
          href="/kaart"
          className="no-underline bg-brand-700 hover:bg-brand-800 text-white font-semibold px-5 py-3 rounded-full shadow-md shadow-brand-700/20 transition-transform hover:-translate-y-0.5 inline-block"
        >
          Bekijk de kaart
        </Link>
      </div>
    </div>
  );
}
