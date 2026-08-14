import { NextRequest, NextResponse } from "next/server";
import { requireAdminToken } from "@/gateway/middleware/require-admin-token";
import { kernelAdminClient } from "@/gateway/kernel/kernel.client";
import { KernelError } from "@/gateway/kernel/kernel.errors";

export async function POST(req: NextRequest) {
  const guard = await requireAdminToken();
  if (guard instanceof NextResponse) return guard;

  const body = await req.json().catch(() => null);
  if (!body || typeof body.new_password !== "string") {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "new_password is required" } },
      { status: 400 },
    );
  }

  try {
    const result = await kernelAdminClient.changePassword(guard, body.new_password);
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
