import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { ADMIN_COOKIE } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
  return NextResponse.redirect(new URL("/admin/login", request.url), {
    status: 303,
  });
}
