"use client";

import dynamic from "next/dynamic";
import type { NumberedPin } from "./types";

const PrintMap = dynamic(() => import("./PrintMap"), {
  ssr: false,
  loading: () => (
    <div className="h-[420px] bg-brand-50 rounded-2xl flex items-center justify-center text-brand-700 print:hidden">
      Kaart laden...
    </div>
  ),
});

export function PrintMapClient({ pins }: { pins: NumberedPin[] }) {
  return <PrintMap pins={pins} />;
}
