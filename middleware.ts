import { NextRequest, NextResponse } from "next/server";
import { env } from "@/gateway/config/env";

/**
 * The security guard's front-door check: is there even a credential
 * presented? Does NOT decide validity - that's the Kernel's job, on
 * every request, with no exceptions.
 */

const PUBLIC_PATHS = ["/api/admin/auth/login"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    return NextResponse.next();
  }

  const hasToken = req.cookies.has(env.sessionCookie);
  if (!hasToken) {
    return NextResponse.json(
      { error: { code: "UNAUTHENTICATED", message: "No admin session presented" } },
      { status: 401 },
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: "/api/:path*",
};
