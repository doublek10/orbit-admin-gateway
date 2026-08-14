import { NextRequest, NextResponse } from "next/server";
import { requireAdminToken } from "@/gateway/middleware/require-admin-token";
import { kernelAdminClient } from "@/gateway/kernel/kernel.client";
import { KernelError } from "@/gateway/kernel/kernel.errors";

export async function GET(req: NextRequest) {
  const guard = await requireAdminToken();
  if (guard instanceof NextResponse) return guard;

  const code = req.nextUrl.searchParams.get("code") ?? undefined;
  const limitParam = req.nextUrl.searchParams.get("limit");
  const limit = limitParam ? Number(limitParam) : undefined;

  try {
    const result = await kernelAdminClient.errors(guard, { code, limit });
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
