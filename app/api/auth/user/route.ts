import { NextRequest } from "next/server";
import { json } from "@lib/api-helpers";
import { getCurrentUser } from "@lib/auth";

export async function GET(_req: NextRequest) {
  const user = await getCurrentUser();
  return json({ user: user ?? null });
}
