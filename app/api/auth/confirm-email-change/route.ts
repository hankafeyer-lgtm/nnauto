import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { storage } from "@lib/storage";
import { verifyEmailSchema } from "@shared/schema";

export async function POST(req: NextRequest) {
  let userId: string | undefined;
  try {
    const user = await requireAuth();
    userId = user.id;
    const { code } = verifyEmailSchema.parse(await req.json());

    const fullUser = await storage.getUser(user.id);
    if (!fullUser) return error("User not found", 404);

    if (
      !fullUser.verificationCode ||
      !fullUser.verificationCodeExpiry ||
      !fullUser.pendingEmail
    ) {
      await storage.clearVerificationCode(user.id);
      return error(
        "No pending email change found. Please request a new code.",
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

    const newEmail = fullUser.pendingEmail;

    const existingUser = await storage.getUserByEmail(newEmail);
    if (existingUser && existingUser.id !== user.id) {
      await storage.clearVerificationCode(user.id);
      return error("This email is already in use", 400);
    }

    const updatedUser = await storage.updateUser(user.id, { email: newEmail });
    if (!updatedUser) {
      return error("Failed to change email", 500);
    }

    const verified = await storage.verifyUserEmail(updatedUser.id);
    if (verified) {
      const { password: _, ...safeUser } = verified;
      return json({ success: true, user: safeUser });
    }

    return json({ success: true });
  } catch (e: unknown) {
    if (userId) {
      await storage.clearVerificationCode(userId).catch(() => {});
    }
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    return error(msg, 500);
  }
}
