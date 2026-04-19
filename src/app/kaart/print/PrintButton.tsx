"use client";

export function PrintButton() {
  return (
    <div className="print:hidden">
      <button
        type="button"
        onClick={() => window.print()}
        className="bg-brand-700 hover:bg-brand-800 text-white font-semibold px-5 py-2.5 rounded-full transition-colors"
      >
        Print deze lijst
      </button>
    </div>
  );
}
