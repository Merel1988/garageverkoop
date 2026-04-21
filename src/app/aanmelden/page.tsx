import Link from "next/link";
import { registrationsOpen } from "@/lib/event";
import { RegistrationForm } from "./RegistrationForm";

export const dynamic = "force-dynamic";

export default function AanmeldenPage() {
  if (!registrationsOpen()) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-3xl p-8 sm:p-10 text-center space-y-3">
        <h1 className="text-3xl font-bold tracking-tight text-brand-800">
          Aanmeldingen zijn gesloten
        </h1>
        <p className="text-gray-700">
          De termijn om je huis aan te melden is voorbij. Bekijk de{" "}
          <Link href="/kaart">kaart</Link> om te zien welke adressen meedoen.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="space-y-3">
        <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-brand-800">
          Meld je huis aan
        </h1>
        <p className="text-gray-700 leading-relaxed">
          Vul het formulier in. Je ontvangt een bevestigingsmail met een link om
          je aanmelding te bevestigen en pas daarna verschijnt jouw pin op de
          kaart. In diezelfde mail staat ook een afmeldlink, mocht je je
          bedenken.
        </p>
      </div>
      <RegistrationForm />
    </div>
  );
}
