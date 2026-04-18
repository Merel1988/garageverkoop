"use server";

import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/admin-auth";
import { prisma } from "@/lib/prisma";

export async function deleteRegistration(formData: FormData) {
  if (!(await isAdmin())) throw new Error("Unauthorized");
  const id = String(formData.get("id") ?? "");
  if (!id) return;
  await prisma.registration.delete({ where: { id } }).catch(() => {});
  revalidatePath("/admin");
  revalidatePath("/kaart");
}
