import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await requireAuth();
    const { id } = await params;
    return json({
      listingId: id,
      views: 0,
      contactClicks: 0,
      whatsappClicks: 0,
    });
  } catch (e: any) {
    if (e.message === "Unauthorized") return error("Unauthorized", 401);
    return error(e.message, 500);
  }
}
