import { NextResponse } from "next/server";
import { requireAdminToken } from "@/gateway/middleware/require-admin-token";
import { kernelAdminClient } from "@/gateway/kernel/kernel.client";
import { KernelError } from "@/gateway/kernel/kernel.errors";

export async function GET() {
  const guard = await requireAdminToken();
  if (guard instanceof NextResponse) return guard;

  try {
    const health = await kernelAdminClient.health(guard);
    return NextResponse.json(health, { status: health.status === "ok" ? 200 : 503 });
  } catch (err) {
    if (err instanceof KernelError) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: err.status },
      );
    }
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "Unexpected error" } },
      { status: 500 },
    );
  }
}
