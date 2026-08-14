import { NextResponse } from "next/server";
import { getAdminSessionToken } from "@/gateway/auth/cookies";

/**
 * Security-guard duty only: checks a credential is present before
 * bothering to forward the request. Whether that credential is *valid*
 * is decided by the Kernel, which re-verifies it on every single call
 * (kernel/kernel_api/admin_security.py).
 */
export async function requireAdminToken(): Promise<string | NextResponse> {
  const token = await getAdminSessionToken();
  if (!token) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "No admin session presented" } },
      { status: 401 },
    );
  }
  return token;
}
