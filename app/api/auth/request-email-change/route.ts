import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { storage } from "@lib/storage";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const { newEmail: rawNewEmail } = await req.json();

    if (!rawNewEmail || typeof rawNewEmail !== "string") {
      return error("New email is required", 400);
    }

    const newEmail = rawNewEmail.trim();
    if (!newEmail) {
      return error("New email is required", 400);
    }

    const fullUser = await storage.getUser(user.id);
    if (!fullUser) return error("User not found", 404);

    const existingUser = await storage.getUserByEmail(newEmail);
    if (existingUser && existingUser.id !== user.id) {
      return error("This email is already in use", 400);
    }

    const crypto = await import("crypto");
    const code = crypto.randomInt(100000, 999999).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000);
    await storage.setVerificationCode(user.id, code, expiry, newEmail);

    let emailSent = false;
    try {
      const emailMod = await import("@lib/email");
      if (typeof emailMod.sendVerificationEmail === "function") {
        emailSent = await emailMod.sendVerificationEmail(newEmail, code);
      }
    } catch {
      /* optional email */
    }

    return json({
      success: true,
      message: emailSent
        ? "Verification code sent to new email address"
        : "Verification code generated (email service temporarily unavailable)",
      emailSent,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    return error(msg, 500);
  }
}
