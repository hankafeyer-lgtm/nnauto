import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { storage } from "@lib/storage";
import { db } from "@lib/db";
import { users } from "@shared/schema";
import { ilike } from "drizzle-orm";
import bcrypt from "bcrypt";
import { randomBytes } from "crypto";

const SUCCESS_MSG =
  "If the email is registered, recovery instructions have been sent";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawEmail = typeof body?.email === "string" ? body.email : "";
    const email = rawEmail.trim().toLowerCase();

    if (!email) {
      return error("Email is required");
    }

    const [user] = await db
      .select()
      .from(users)
      .where(ilike(users.email, email));

    if (!user) {
      console.log(
        "[INFO] Password reset requested for non-existent email:",
        email,
      );
      return json({ success: true, message: SUCCESS_MSG });
    }

    const newPassword = randomBytes(12)
      .toString("base64")
      .slice(0, 16)
      .replace(/[+/=]/g, (c) => ({ "+": "A", "/": "B", "=": "C" })[c] || c);

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await storage.updateUserPassword(user.id, hashedPassword);

    // TODO: integrate email sending (MailerSend) — for now just log
    console.log(
      "[INFO] Password reset successful for email:",
      email,
      "— new password NOT emailed yet (email integration pending)",
    );

    return json({ success: true, message: SUCCESS_MSG });
  } catch (err: any) {
    console.error("[ERROR] Forgot password error:", err);
    return error("An error occurred. Please try again later.", 500);
  }
}
