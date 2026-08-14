import { NextRequest, NextResponse } from "next/server";
import { requireAdminToken } from "@/gateway/middleware/require-admin-token";
import { kernelAdminClient } from "@/gateway/kernel/kernel.client";
import { KernelError } from "@/gateway/kernel/kernel.errors";

export async function GET(req: NextRequest) {
  const guard = await requireAdminToken();
  if (guard instanceof NextResponse) return guard;

  const sinceHours = Number(req.nextUrl.searchParams.get("since_hours") ?? "24");

  try {
    const overview = await kernelAdminClient.overview(guard, sinceHours);
    return NextResponse.json(overview);
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
