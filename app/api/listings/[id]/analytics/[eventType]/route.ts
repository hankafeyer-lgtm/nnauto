import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; eventType: string }> },
) {
  return json({ success: true });
}
