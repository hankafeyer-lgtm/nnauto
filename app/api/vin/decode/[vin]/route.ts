import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ vin: string }> },
) {
  const { vin } = await params;
  return json({ vin, found: false });
}
