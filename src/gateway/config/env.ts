/**
 * Single source of truth for the Admin Gateway's environment
 * configuration. Nothing else in the codebase should read
 * `process.env` directly.
 */
export const env = {
  // The SAME Kernel the tenant-facing orbit-gateway talks to. Private
  // network only, never a public URL.
  kernelUrl: process.env.KERNEL_URL ?? "http://localhost:8000",

  // Must match the Kernel's ADMIN_GATEWAY_SHARED_SECRET exactly.
  // Deliberately distinct from the tenant Gateway's own shared secret.
  adminGatewaySharedSecret:
    process.env.ADMIN_GATEWAY_SHARED_SECRET ?? "changeme-admin-gateway-shared-secret",

  // Cookie name the Admin Gateway uses to carry the admin session token
  // between the browser and the Kernel. The Gateway does not decode or
  // interpret this token - it only stores and forwards it, exactly like
  // orbit-gateway does for Supabase tokens.
  sessionCookie: "orbit_admin_session",

  nodeEnv: process.env.NODE_ENV ?? "development",
};
