import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q") ?? "";
  return json({ items: [] });
}
