import { NextRequest } from "next/server";
import { json } from "@lib/api-helpers";

export async function GET(_req: NextRequest) {
  return json({ status: "ok", timestamp: new Date().toISOString() });
}
