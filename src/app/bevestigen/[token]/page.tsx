import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { siteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

type Props = { params: Promise<{ token: string }> };

export default async function BevestigenPage({ params }: Props) {
  const { token } = await params;

  const registration = await prisma.registration.findUnique({
    where: { confirmToken: token },
  });

  if (!registration) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 sm:p-10 text-center space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-brand-800">
          Link niet geldig
        </h1>
        <p className="text-gray-700">
          Deze bevestigingslink is niet bekend of al gebruikt. Als je al eerder
          op de link hebt geklikt, staat je pin al op de{" "}
          <Link href="/kaart">kaart</Link>.
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

  const unsubscribeUrl = `${siteUrl()}/afmelden/${registration.unsubscribeToken}`;

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="bg-white rounded-3xl p-8 sm:p-10 text-center space-y-4">
        <div className="text-5xl">🎉</div>
        <h1 className="text-3xl font-bold tracking-tight text-brand-800">
          Bedankt!
        </h1>
        <p className="text-gray-700 leading-relaxed">
          Je aanmelding is bevestigd. Jouw huis staat nu op de kaart van de
          garageverkoop in Sambeek.
        </p>
        <div className="pt-2">
          <Link
            href="/kaart"
            className="no-underline bg-brand-700 hover:bg-brand-800 text-white font-semibold px-6 py-3 rounded-full inline-block transition-colors"
          >
            Bekijk de kaart
          </Link>
        </div>
      </div>

      <div className="bg-accent-100 rounded-3xl p-6 sm:p-8 space-y-2">
        <h2 className="text-lg font-bold text-brand-800">
          Toch niet meer meedoen?
        </h2>
        <p className="text-sm text-gray-800 leading-relaxed">
          Geen probleem. Gebruik onderstaande afmeldlink — of dezelfde link uit
          de bevestigingsmail die je net ontvangen hebt — om je inschrijving
          ongedaan te maken. Je pin verdwijnt dan direct van de kaart en we
          verwijderen je gegevens.
        </p>
        <p>
          <Link
            href={`/afmelden/${registration.unsubscribeToken}`}
            className="no-underline bg-white text-brand-800 font-semibold px-4 py-2 rounded-full inline-block mt-2 hover:bg-brand-50 transition-colors"
          >
            Afmelden
          </Link>
        </p>
        <p className="text-xs text-gray-600 break-all pt-2">
          Bewaar deze link voor later:{" "}
          <a href={unsubscribeUrl}>{unsubscribeUrl}</a>
        </p>
      </div>
    </div>
  );
}
