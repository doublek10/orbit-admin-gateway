import { NextRequest, NextResponse } from "next/server";
import { setAdminSessionCookie } from "@/gateway/auth/cookies";
import { KernelError } from "@/gateway/kernel/kernel.errors";
import { kernelAdminClient } from "@/gateway/kernel/kernel.client";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);

  if (!body || typeof body.username !== "string" || typeof body.password !== "string") {
    return NextResponse.json(
      { error: { code: "INVALID_INPUT", message: "username and password are required" } },
      { status: 400 },
    );
  }

  try {
    const result = await kernelAdminClient.login({
      username: body.username,
      password: body.password,
    });
    await setAdminSessionCookie(result.token, result.expires_in);
    return NextResponse.json({ admin: result.admin });
  } catch (err) {
    if (err instanceof KernelError) {
      return NextResponse.json(
        { error: { code: err.code, message: err.message } },
        { status: err.status },
      );
    }
    return NextResponse.json(
      { error: { code: "INTERNAL", message: "Unexpected error during login" } },
      { status: 500 },
    );
  }
}
