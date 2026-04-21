import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

const COLUMNS = [
  "Naam",
  "Email",
  "Straat",
  "Huisnummer",
  "Telefoon",
  "Latitude",
  "Longitude",
  "Bevestigd op",
  "Aangemeld op",
] as const;

function csvEscape(value: string): string {
  if (/[";\r\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function formatDate(date: Date | null): string {
  if (!date) return "";
  return date.toISOString();
}

export async function GET() {
  if (!(await isAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const rows = await prisma.registration.findMany({
    orderBy: { createdAt: "desc" },
  });

  const lines: string[] = [COLUMNS.join(";")];
  for (const r of rows) {
    lines.push(
      [
        r.name,
        r.email,
        r.street,
        r.houseNumber,
        r.phone ?? "",
        String(r.latitude),
        String(r.longitude),
        formatDate(r.confirmedAt),
        formatDate(r.createdAt),
      ]
        .map(csvEscape)
        .join(";"),
    );
  }

  const bom = "﻿";
  const body = bom + lines.join("\r\n") + "\r\n";

  const stamp = new Date().toISOString().slice(0, 10);
  return new NextResponse(body, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="garageverkoop-aanmeldingen-${stamp}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
