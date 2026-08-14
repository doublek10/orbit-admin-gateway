export class KernelError extends Error {
  readonly status: number;
  readonly code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = "KernelError";
    this.status = status;
    this.code = code;
  }
}

/**
 * Kernel errors come back as FastAPI's default `{ detail: string }` for
 * unhandled exceptions/validation, or `{ detail: [...] }` for pydantic
 * validation errors. Normalize both into a KernelError with a stable
 * `code` the Admin Frontend can branch on.
 */
export function translateKernelError(status: number, payload: unknown): KernelError {
  if (status === 401) {
    return new KernelError(401, "UNAUTHENTICATED", extractMessage(payload) ?? "Not authenticated");
  }
  if (status === 403) {
    return new KernelError(403, "FORBIDDEN", extractMessage(payload) ?? "Not permitted");
  }
  if (status === 404) {
    return new KernelError(404, "NOT_FOUND", extractMessage(payload) ?? "Not found");
  }
  if (status === 501) {
    return new KernelError(501, "NOT_IMPLEMENTED", extractMessage(payload) ?? "Not implemented");
  }
  return new KernelError(status, "KERNEL_ERROR", extractMessage(payload) ?? "Kernel request failed");
}

function extractMessage(payload: unknown): string | null {
  if (typeof payload === "object" && payload !== null && "detail" in payload) {
    const detail = (payload as { detail: unknown }).detail;
    if (typeof detail === "string") return detail;
    if (Array.isArray(detail)) return detail.map((d) => JSON.stringify(d)).join("; ");
  }
  return null;
}
