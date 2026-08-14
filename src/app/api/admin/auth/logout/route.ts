import { NextResponse } from "next/server";
import { clearAdminSessionCookie } from "@/gateway/auth/cookies";

export async function POST() {
  // The Kernel's admin JWTs are short-lived and stateless - logout is
  // simply forgetting the cookie, exactly like the tenant Gateway's
  // Supabase token handling.
  await clearAdminSessionCookie();
  return NextResponse.json({ ok: true });
}
