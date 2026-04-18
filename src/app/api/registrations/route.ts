import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { registrationSchema } from "@/lib/validation";
import { geocodeAddress } from "@/lib/geocode";
import { generateToken } from "@/lib/tokens";
import { sendConfirmationEmail } from "@/lib/email";
import { registrationsOpen } from "@/lib/event";
import { siteUrl } from "@/lib/site-url";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!registrationsOpen()) {
    return NextResponse.json(
      { error: "Aanmeldingen zijn gesloten." },
      { status: 403 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Ongeldig verzoek." }, { status: 400 });
  }

  const parsed = registrationSchema.safeParse(payload);
  if (!parsed.success) {
    const firstIssue = parsed.error.issues[0];
    return NextResponse.json(
      { error: firstIssue?.message ?? "Formulier onvolledig." },
      { status: 400 },
    );
  }

  const { name, email, street, houseNumber, phone } = parsed.data;

  const geo = await geocodeAddress(street, houseNumber);
  if (!geo.ok) {
    const message =
      geo.reason === "not_in_sambeek"
        ? "Dit adres ligt niet in Sambeek. Alleen Sambeek-adressen kunnen meedoen."
        : geo.reason === "not_found"
          ? "We konden dit adres niet vinden. Controleer de spelling."
          : "Er ging iets mis bij het opzoeken van je adres. Probeer het nog eens.";
    return NextResponse.json({ error: message }, { status: 422 });
  }

  const confirmToken = generateToken();
  const unsubscribeToken = generateToken();

  await prisma.registration.create({
    data: {
      name,
      email,
      street,
      houseNumber,
      phone,
      latitude: geo.latitude,
      longitude: geo.longitude,
      confirmToken,
      unsubscribeToken,
    },
  });

  const base = siteUrl();
  try {
    await sendConfirmationEmail({
      to: email,
      name,
      confirmUrl: `${base}/bevestigen/${confirmToken}`,
      unsubscribeUrl: `${base}/afmelden/${unsubscribeToken}`,
    });
  } catch (err) {
    console.error("Email send failed", err);
    return NextResponse.json(
      {
        error:
          "Je aanmelding is opgeslagen maar de bevestigingsmail kon niet verstuurd worden. Neem contact op met de organisatie.",
      },
      { status: 500 },
    );
  }

  return NextResponse.json({ ok: true });
}
