"use client";

export function PrintButton() {
  return (
    <div className="print:hidden flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={() => window.print()}
        className="bg-brand-700 hover:bg-brand-800 text-white font-semibold px-5 py-2.5 rounded-full transition-colors"
      >
        Print kaart + lijst
      </button>
      <span className="text-xs text-gray-600">
        Tip: wacht tot de kaart is geladen voor je op Print klikt.
      </span>
    </div>
  );
}
