import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAdmin } from "@lib/auth";
import { storage } from "@lib/storage";
import { db } from "@lib/db";
import { users } from "@shared/schema";
import { inArray } from "drizzle-orm";

export async function GET(_req: NextRequest) {
  try {
    const _admin = await requireAdmin();

    const reports = await storage.getAllCebiaReports();

    // Resolve registered buyers (non-guest user ids) so we can show whether the
    // purchase came from a registered account or an unregistered guest.
    const registeredIds = Array.from(
      new Set(
        reports
          .map((r) => r.userId)
          .filter(
            (id): id is string =>
              !!id && !String(id).startsWith("guest:"),
          ),
      ),
    );
    const userMap = new Map<string, { email: string; name: string }>();
    if (registeredIds.length) {
      const rows = await db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          username: users.username,
        })
        .from(users)
        .where(inArray(users.id, registeredIds));
      for (const u of rows) {
        const name =
          [u.firstName, u.lastName].filter(Boolean).join(" ").trim() ||
          u.username ||
          "";
        userMap.set(u.id, { email: u.email || "", name });
      }
    }

    const items = reports.map((r) => {
      const rr: any =
        r.rawResponse && typeof r.rawResponse === "object" && !Array.isArray(r.rawResponse)
          ? r.rawResponse
          : {};
      const isGuest = String(r.userId || "").startsWith("guest:");
      const reg = !isGuest && r.userId ? userMap.get(r.userId) : undefined;
      const email =
        (r.email && r.email.trim()) ||
        (typeof rr.customerEmail === "string" ? rr.customerEmail.trim() : "") ||
        reg?.email ||
        "";
      return {
        id: r.id,
        createdAt: new Date(r.createdAt as any).toISOString(),
        updatedAt: new Date(r.updatedAt as any).toISOString(),
        userId: r.userId ?? null,
        listingId: r.listingId ?? null,
        vin: r.vin,
        status: r.status,
        priceCents: r.priceCents ?? null,
        currency: r.currency ?? null,
        stripeSessionId: r.stripeSessionId ?? null,
        stripePaymentIntentId: r.stripePaymentIntentId ?? null,
        customerEmail: email,
        isGuest,
        accountType: isGuest ? "guest" : "registered",
        userName: reg?.name || "",
        hasPdf: !!r.pdfBase64,
        adminPdfUrl: `/api/admin/cebia/reports/${encodeURIComponent(r.id)}/pdf`,
      };
    });

    const paidOnly = items
      .filter((item) => !!item.stripeSessionId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return json({ count: paidOnly.length, items: paidOnly });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
