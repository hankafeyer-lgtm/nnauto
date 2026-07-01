import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireDealer } from "@lib/auth";
import { db } from "@lib/db";
import {
  dealers,
  listings,
  bulkImportJobs,
  insertListingSchema,
} from "@shared/schema";
import { eq, sql } from "drizzle-orm";
import {
  isDealerPackageRequiredError,
  requireActiveDealerPackage,
} from "@lib/dealerPackages";

export async function POST(req: NextRequest) {
  try {
    const user = await requireDealer();
    if (!user.dealerId) return error("Dealer not found", 404);

    await requireActiveDealerPackage(user.dealerId);

    const body = await req.json();
    const { listings: listingsData, fileName } = body;

    if (!Array.isArray(listingsData) || listingsData.length === 0) {
      return error("No listings data provided", 400);
    }
    if (listingsData.length > 50) {
      return error("Maximum 50 listings per import", 400);
    }

    const countResult = (await db.execute(sql`
      SELECT COUNT(*)::int AS total FROM listings WHERE user_id = ${user.id}
    `)) as any;
    const currentCount = countResult?.rows?.[0]?.total || 0;

    const [dealer] = await db
      .select()
      .from(dealers)
      .where(eq(dealers.id, user.dealerId));
    if (!dealer) return error("Dealer not found", 404);

    if (currentCount + listingsData.length > dealer.maxListings) {
      return error(
        `Exceeds listing limit. Current: ${currentCount}, Importing: ${listingsData.length}, Max: ${dealer.maxListings}`,
        400,
      );
    }

    const [job] = await db
      .insert(bulkImportJobs)
      .values({
        dealerId: user.dealerId,
        userId: user.id,
        totalRows: listingsData.length,
        fileName: fileName || "manual-import",
      })
      .returning();

    // Process in background (fire-and-forget)
    (async () => {
      let successCount = 0;
      let failCount = 0;
      const errors: Array<{ row: number; error: string }> = [];

      for (let i = 0; i < listingsData.length; i++) {
        try {
          const item = listingsData[i];
          const parsed = insertListingSchema.safeParse({
            ...item,
            userId: user.id,
            sellerType: "dealer",
          });
          if (!parsed.success) {
            const errorMsg = parsed.error.errors
              .map((e) => `${e.path.join(".")}: ${e.message}`)
              .join("; ");
            errors.push({ row: i + 1, error: errorMsg });
            failCount++;
          } else {
            await db.insert(listings).values(parsed.data);
            successCount++;
          }
        } catch (e: unknown) {
          const rowErr = e instanceof Error ? e.message : "Unknown error";
          errors.push({ row: i + 1, error: rowErr });
          failCount++;
        }

        await db
          .update(bulkImportJobs)
          .set({
            processedRows: i + 1,
            successRows: successCount,
            failedRows: failCount,
            status:
              i === listingsData.length - 1 ? "completed" : "processing",
            errors: errors.length > 0 ? errors : null,
            updatedAt: new Date(),
          })
          .where(eq(bulkImportJobs.id, job.id));
      }
    })();

    return json({
      job: { id: job.id, status: "processing", totalRows: listingsData.length },
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    if (isDealerPackageRequiredError(e)) {
      return error(
        "Pro import vozidel je nutné aktivní balíček START, BUSINESS nebo PRO.",
        402,
      );
    }
    return error(msg, 500);
  }
}
