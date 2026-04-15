import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { requireAuth } from "@lib/auth";
import { storage } from "@lib/storage";
import { uploadBuffer } from "@lib/r2Storage";

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const user = await requireAuth();
    const { id } = await params;

    if (user.id !== id) {
      return error("Forbidden", 403);
    }

    const body = await req.json();
    const avatarData: string | undefined = body?.avatarUrl || body?.avatar;
    if (!avatarData || typeof avatarData !== "string") {
      return error("avatarUrl is required", 400);
    }

    let buffer: Buffer;
    let contentType = "image/png";

    if (avatarData.startsWith("data:")) {
      const match = avatarData.match(/^data:(image\/\w+);base64,(.+)$/);
      if (!match) return error("Invalid base64 image data", 400);
      contentType = match[1];
      buffer = Buffer.from(match[2], "base64");
    } else {
      buffer = Buffer.from(avatarData, "base64");
    }

    const objectKey = await uploadBuffer(buffer, contentType, "avatars");

    const updatedUser = await storage.updateUser(id, { avatarUrl: objectKey });
    if (!updatedUser) {
      return error("User not found", 404);
    }

    const { password: _, ...userWithoutPassword } = updatedUser;
    return json({ user: userWithoutPassword });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
