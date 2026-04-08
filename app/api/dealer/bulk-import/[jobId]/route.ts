import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireDealer } from "@lib/auth";
import { db } from "@lib/db";
import { bulkImportJobs } from "@shared/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ jobId: string }> },
) {
  try {
    const user = await requireDealer();
    const { jobId } = await params;

    const [job] = await db
      .select()
      .from(bulkImportJobs)
      .where(eq(bulkImportJobs.id, jobId));
    if (!job) return error("Job not found", 404);
    if (job.userId !== user.id) return error("Forbidden", 403);

    return json({ job });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
