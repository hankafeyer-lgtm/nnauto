import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "./auth";

export function json(
  data: unknown,
  status = 200,
  headers?: HeadersInit,
) {
  return NextResponse.json(data, { status, headers });
}

export function error(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function withAuth(
  handler: (
    req: NextRequest,
    user: Awaited<ReturnType<typeof getCurrentUser>> & {},
  ) => Promise<NextResponse>,
  req: NextRequest,
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);
  return handler(req, user);
}

export async function withAdmin(
  handler: (
    req: NextRequest,
    user: Awaited<ReturnType<typeof getCurrentUser>> & {},
  ) => Promise<NextResponse>,
  req: NextRequest,
) {
  const user = await getCurrentUser();
  if (!user) return error("Unauthorized", 401);
  if (!user.isAdmin) return error("Forbidden", 403);
  return handler(req, user);
}
