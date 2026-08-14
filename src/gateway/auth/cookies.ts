import { cookies } from "next/headers";
import { env } from "@/gateway/config/env";

/**
 * The Admin Gateway is a security guard, not a decision-maker, exactly
 * like the tenant-facing orbit-gateway: it stores whatever admin
 * session token the Kernel hands it and forwards it on the next
 * request. It never decodes or interprets the token itself - the
 * Kernel re-verifies it, fresh, on every call.
 */
export async function setAdminSessionCookie(token: string, expiresInSeconds: number): Promise<void> {
  const cookieStore = await cookies();
  const secure = env.nodeEnv === "production";

  cookieStore.set(env.sessionCookie, token, {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
    maxAge: expiresInSeconds,
  });
}

export async function clearAdminSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(env.sessionCookie);
}

export async function getAdminSessionToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get(env.sessionCookie)?.value ?? null;
}
