import { NextRequest } from "next/server";
import { json } from "@lib/api-helpers";

export async function GET(_req: NextRequest) {
  return json({
    clarityProjectId: (process.env.CLARITY_PROJECT_ID || "").trim() || null,
  });
}
