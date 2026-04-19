"use client";

import { useState } from "react";

type FormState = "idle" | "submitting" | "success" | "error";

export function RegistrationForm() {
  const [state, setState] = useState<FormState>("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);

    const payload = {
      name: String(data.get("name") ?? ""),
      email: String(data.get("email") ?? ""),
      street: String(data.get("street") ?? ""),
      houseNumber: String(data.get("houseNumber") ?? ""),
      phone: String(data.get("phone") ?? ""),
      consent: data.get("consent") === "on",
    };

    setState("submitting");
    setErrorMessage("");

    try {
      const res = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const body = (await res.json().catch(() => ({}))) as {
        ok?: boolean;
        error?: string;
      };

      if (!res.ok || !body.ok) {
        setState("error");
        setErrorMessage(body.error ?? "Er ging iets mis. Probeer het opnieuw.");
        return;
      }

      setState("success");
      form.reset();
    } catch {
      setState("error");
      setErrorMessage("Kon het formulier niet versturen. Probeer het opnieuw.");
    }
  }

  if (state === "success") {
    return (
      <div className="bg-white rounded-3xl p-6 sm:p-8 space-y-3">
        <div className="text-4xl">✉️</div>
        <h2 className="text-2xl font-bold tracking-tight text-brand-800">
          Check je inbox
        </h2>
        <p className="text-gray-700 leading-relaxed">
          We hebben je een bevestigingsmail gestuurd. Klik op de link in die
          mail om je aanmelding te bevestigen. Je pin verschijnt daarna
          automatisch op de kaart.
        </p>
        <p className="text-sm text-gray-600">
          Geen mail ontvangen? Check je spam-map. In dezelfde mail vind je ook
          een afmeldlink, handig voor als je je toch bedenkt.
        </p>
      </div>
    );
  }

  const submitting = state === "submitting";

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white rounded-3xl p-6 sm:p-8 space-y-5"
    >
      <Field label="Naam" name="name" required autoComplete="name" />
      <Field
        label="E-mailadres"
        name="email"
        type="email"
        required
        autoComplete="email"
      />
      <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 sm:gap-4">
        <Field
          label="Straat"
          name="street"
          required
          autoComplete="street-address"
        />
        <Field
          label="Huisnummer"
          name="houseNumber"
          required
          className="sm:w-32"
          autoComplete="off"
        />
      </div>
      <Field
        label="Telefoonnummer (optioneel)"
        name="phone"
        type="tel"
        autoComplete="tel"
        hint="Gebruiken we alleen bij vragen of wijzigingen. Niet zichtbaar op de kaart."
      />

      <label className="flex gap-3 items-start text-sm bg-brand-50 rounded-2xl p-4">
        <input
          type="checkbox"
          name="consent"
          required
          className="mt-1 h-4 w-4 accent-brand-700"
          disabled={submitting}
        />
        <span>
          Ik ga akkoord dat mijn straat en huisnummer op de openbare kaart
          worden getoond.
        </span>
      </label>

      {state === "error" && errorMessage && (
        <p className="text-sm text-red-700 bg-red-50 rounded-2xl p-4">
          {errorMessage}
        </p>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full bg-brand-700 hover:bg-brand-800 disabled:opacity-60 text-white font-semibold px-5 py-3.5 rounded-full transition-colors"
      >
        {submitting ? "Bezig..." : "Aanmelden"}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  autoComplete,
  hint,
  className,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  hint?: string;
  className?: string;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-ink mb-1.5">
        {label}
        {required && <span className="text-brand-500"> *</span>}
      </span>
      <input
        type={type}
        name={name}
        required={required}
        autoComplete={autoComplete}
        className={`w-full rounded-xl bg-brand-50 px-4 py-3 text-base focus:outline-none focus:bg-white focus:ring-2 focus:ring-brand-500 transition ${className ?? ""}`}
      />
      {hint && <span className="block text-xs text-gray-600 mt-1">{hint}</span>}
    </label>
  );
}
