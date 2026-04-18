import Link from "next/link";
import { registrationsOpen } from "@/lib/event";
import { RegistrationForm } from "./RegistrationForm";

export const dynamic = "force-dynamic";

export default function AanmeldenPage() {
  if (!registrationsOpen()) {
    return (
      <div className="max-w-xl mx-auto bg-white rounded-2xl p-8 shadow-sm ring-1 ring-brand-100 text-center space-y-3">
        <h1 className="text-2xl font-bold text-brand-700">
          Aanmeldingen zijn gesloten
        </h1>
        <p className="text-gray-700">
          De termijn om je huis aan te melden is voorbij. Bekijk de{" "}
          <Link href="/kaart">kaart</Link> om te zien welke huizen meedoen.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div className="space-y-2">
        <h1 className="text-3xl sm:text-4xl font-bold text-brand-800 tracking-tight">
          Meld je huis aan
        </h1>
        <p className="text-gray-700">
          Vul het formulier in. Je ontvangt een bevestigingsmail met een link om
          je aanmelding te bevestigen. Pas daarna verschijnt jouw pin op de
          kaart.
        </p>
      </div>
      <RegistrationForm />
    </div>
  );
}
