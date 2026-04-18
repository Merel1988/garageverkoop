"use client";

import { useState, useTransition } from "react";
import { unsubscribe } from "./actions";

export function UnsubscribeForm({ token }: { token: string }) {
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  if (done) {
    return (
      <div className="bg-brand-50 border border-brand-200 rounded p-4">
        <p className="font-medium">Je bent afgemeld. Je pin is van de kaart verwijderd.</p>
      </div>
    );
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        setError("");
        startTransition(async () => {
          const result = await unsubscribe(token);
          if (result.ok) setDone(true);
          else setError(result.error ?? "Er ging iets mis.");
        });
      }}
      className="space-y-3"
    >
      {error && (
        <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded p-3">
          {error}
        </p>
      )}
      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-semibold px-5 py-3 rounded-md"
      >
        {isPending ? "Bezig..." : "Ja, afmelden"}
      </button>
    </form>
  );
}
