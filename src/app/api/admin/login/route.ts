import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import {
  ADMIN_COOKIE,
  checkPassword,
  cookieOptions,
  createToken,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const data = await request.formData();
  const password = String(data.get("password") ?? "");

  const base = new URL(request.url);
  if (!checkPassword(password)) {
    return NextResponse.redirect(new URL("/admin/login?error=1", base), {
      status: 303,
    });
  }

  const store = await cookies();
  store.set(ADMIN_COOKIE, createToken(), cookieOptions());

  return NextResponse.redirect(new URL("/admin", base), { status: 303 });
}
