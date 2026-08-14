import { NextRequest, NextResponse } from "next/server";
import { requireAdminToken } from "@/gateway/middleware/require-admin-token";
import { kernelAdminClient } from "@/gateway/kernel/kernel.client";
import { KernelError } from "@/gateway/kernel/kernel.errors";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const guard = await requireAdminToken();
  if (guard instanceof NextResponse) return guard;

  const { id } = await params;
  const body = await req.json().catch(() => null);
  if (!body || typeof body.is_active !== "boolean") {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "is_active (boolean) is required" } },
      { status: 400 },
    );
  }

  try {
    const result = await kernelAdminClient.setCompanyStatus(guard, id, body.is_active);
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
