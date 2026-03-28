import { NextRequest } from "next/server";
import { json, error, withAuth } from "@lib/api-helpers";
import { storage } from "@lib/storage";
import { changePasswordSchema } from "@shared/schema";
import bcrypt from "bcrypt";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withAuth(async (req, user) => {
    const { id } = await params;

    if (id !== user.id) {
      return error("Cannot change another user's password", 403);
    }

    const body = await req.json();
    const { currentPassword, newPassword } = changePasswordSchema.parse(body);

    const fullUser = await storage.getUser(id);
    if (!fullUser) return error("User not found", 404);

    const isValid = await bcrypt.compare(currentPassword, fullUser.password);
    if (!isValid) return error("Current password is incorrect", 401);

    const isSame = await bcrypt.compare(newPassword, fullUser.password);
    if (isSame) {
      return error(
        "New password must be different from current password",
        400,
      );
    }

    const hashed = await bcrypt.hash(newPassword, 10);
    await storage.updateUserPassword(id, hashed);

    return json({
      message: "Password changed successfully. Please log in again.",
    });
  }, req);
}
