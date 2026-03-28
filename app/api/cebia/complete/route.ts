import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";

export async function POST(req: NextRequest) {
  try {
    await requireAuth();
    return error("Not implemented yet", 501);
  } catch (e: any) {
    if (e.message === "Unauthorized") return error("Unauthorized", 401);
    return error(e.message, 500);
  }
}
