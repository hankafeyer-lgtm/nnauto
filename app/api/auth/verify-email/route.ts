import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { storage } from "@lib/storage";

export async function POST(req: NextRequest) {
  try {
    const user = await requireAuth();
    const body = await req.json();
    const { code } = body;

    if (!code) {
      return error("Verification code is required", 400);
    }

    const fullUser = await storage.getUser(user.id);
    if (!fullUser) return error("User not found", 404);

    if (fullUser.emailVerified) {
      await storage.clearVerificationCode(user.id);
      return error("Email already verified", 400);
    }

    if (!fullUser.verificationCode || !fullUser.verificationCodeExpiry) {
      return error(
        "No verification code found. Please request a new code.",
        400,
      );
    }

    const expiryDate = new Date(fullUser.verificationCodeExpiry);
    if (
      !expiryDate ||
      Number.isNaN(expiryDate.getTime()) ||
      new Date() > expiryDate
    ) {
      await storage.clearVerificationCode(user.id);
      return error(
        "Verification code expired. Please request a new code.",
        400,
      );
    }

    const storedCode = String(fullUser.verificationCode).trim();
    const submittedCode = String(code).trim();
    if (storedCode !== submittedCode) {
      return error("Invalid verification code", 400);
    }

    const updatedUser = await storage.verifyUserEmail(user.id);
    if (updatedUser) {
      const { password: _, ...safeUser } = updatedUser;
      return json({ success: true, user: safeUser });
    }

    return json({ success: true });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    return error(msg, 500);
  }
}
