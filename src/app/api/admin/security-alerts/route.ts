import { NextRequest, NextResponse } from "next/server";
import { requireAdminToken } from "@/gateway/middleware/require-admin-token";
import { kernelAdminClient } from "@/gateway/kernel/kernel.client";
import { KernelError } from "@/gateway/kernel/kernel.errors";

export async function GET(req: NextRequest) {
  const guard = await requireAdminToken();
  if (guard instanceof NextResponse) return guard;

  const resolvedParam = req.nextUrl.searchParams.get("resolved");
  const resolved = resolvedParam === null ? undefined : resolvedParam === "true";

  try {
    const result = await kernelAdminClient.securityAlerts(guard, resolved);
    return NextResponse.json(result);
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
