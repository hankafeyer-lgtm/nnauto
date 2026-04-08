import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { storage } from "@lib/storage";

export async function POST(_req: NextRequest) {
  try {
    const user = await requireAuth();
    const fullUser = await storage.getUser(user.id);
    if (!fullUser) return error("User not found", 404);
    if (fullUser.emailVerified) return error("Email already verified", 400);

    const crypto = await import("crypto");
    const code = crypto.randomInt(100000, 999999).toString();
    const expiry = new Date(Date.now() + 15 * 60 * 1000);
    await storage.setVerificationCode(user.id, code, expiry);

    let emailSent = false;
    let hasSender = false;
    try {
      const emailMod = await import("@lib/email");
      if (typeof emailMod.sendVerificationEmail === "function") {
        hasSender = true;
        emailSent = await emailMod.sendVerificationEmail(fullUser.email, code);
      }
    } catch {
      /* module missing or load failure — treat as no sender */
    }

    if (!hasSender) {
      return json({
        success: true,
        message: "Verification code sent",
        emailSent: false,
      });
    }
    if (!emailSent) return error("Failed to send verification email", 500);
    return json({
      success: true,
      message: "Verification code sent",
      emailSent: true,
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    return error(msg, 500);
  }
}
