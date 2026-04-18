"use server";

import { prisma } from "@/lib/prisma";

export async function unsubscribe(
  token: string,
): Promise<{ ok: boolean; error?: string }> {
  if (!token) return { ok: false, error: "Ongeldige link." };

  const existing = await prisma.registration.findUnique({
    where: { unsubscribeToken: token },
    select: { id: true },
  });
  if (!existing) return { ok: false, error: "Link niet gevonden." };

  await prisma.registration.delete({ where: { id: existing.id } });
  return { ok: true };
}
