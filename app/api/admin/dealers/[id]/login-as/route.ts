import { NextRequest } from "next/server";
import jwt from "jsonwebtoken";
import { eq } from "drizzle-orm";
import { json, error } from "@lib/api-helpers";
import { requireSuperAdmin } from "@lib/auth";
import { getJwtSecret } from "@lib/jwtSecret";
import { ensureAdminSchema, writeAdminAudit } from "@lib/ensureAdminSchema";
import { db } from "@lib/db";
import { dealers, users } from "@shared/schema";

/**
 * "Přihlásit se jako dealer" — issues a short-lived JWT for the dealer's owner
 * user so the super-admin can act as that dealer. Audited. Super-admin only.
 */
export async function POST(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const admin = await requireSuperAdmin();
    await ensureAdminSchema();
    const { id } = await params;

    const [dealer] = await db.select().from(dealers).where(eq(dealers.id, id));
    if (!dealer) return error("Dealer not found", 404);

    const [owner] = await db
      .select()
      .from(users)
      .where(eq(users.id, dealer.ownerId));
    if (!owner) return error("Dealer owner not found", 404);

    const token = jwt.sign(
      { userId: owner.id, email: owner.email, impersonatedBy: admin.id },
      getJwtSecret(),
      { expiresIn: "2h" },
    );

    await writeAdminAudit({
      actorUserId: admin.id,
      actorEmail: admin.email,
      action: "dealer.login_as",
      targetType: "dealer",
      targetId: id,
      metadata: { ownerId: owner.id, ownerEmail: owner.email },
    });

    const { password: _pw, ...safeUser } = owner;
    return json({ token, user: safeUser });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
