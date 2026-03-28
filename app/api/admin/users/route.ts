import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAdmin } from "@lib/auth";
import { storage } from "@lib/storage";

export async function GET(_req: NextRequest) {
  try {
    const _admin = await requireAdmin();
    const users = await storage.getAllUsers();
    const safe = users.map(({ password, ...rest }) => rest);
    return json(safe);
  } catch (e: any) {
    if (e.message === "Unauthorized") return error("Unauthorized", 401);
    if (e.message === "Forbidden") return error("Forbidden", 403);
    return error(e.message, 500);
  }
}
