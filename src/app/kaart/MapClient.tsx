"use client";

import dynamic from "next/dynamic";
import type { RegistrationPin } from "./types";

const SambeekMap = dynamic(() => import("./SambeekMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[70vh] min-h-[400px] bg-brand-50 rounded-lg border border-brand-100 flex items-center justify-center text-brand-700">
      Kaart laden...
    </div>
  ),
});

export function MapClient({ registrations }: { registrations: RegistrationPin[] }) {
  return <SambeekMap registrations={registrations} />;
}
