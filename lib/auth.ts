import { cookies, headers } from "next/headers";
import { db } from "./db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";

function verifyJwt(token: string): { userId: string } | null {
  try {
    const jwt = require("jsonwebtoken");
    const secret = process.env.JWT_SECRET || process.env.SESSION_SECRET;
    if (!secret) return null;
    const payload = jwt.verify(token, secret) as { userId?: string };
    return payload?.userId ? { userId: payload.userId } : null;
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const headersList = await headers();
  const authHeader = headersList.get("authorization");
  let userId: string | null = null;

  if (authHeader?.startsWith("Bearer ")) {
    const payload = verifyJwt(authHeader.substring(7));
    if (payload) userId = payload.userId;
  }

  if (!userId) {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("connect.sid");
    if (sessionCookie) {
      // Session-based auth requires looking up the session in the DB session table
      // For Next.js migration, JWT is the primary auth mechanism
    }
  }

  if (!userId) return null;

  const [user] = await db.select().from(users).where(eq(users.id, userId));
  if (!user) return null;

  const { password: _, ...safeUser } = user;
  return safeUser;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (!user.isAdmin) throw new Error("Forbidden");
  return user;
}
