import { NextRequest } from "next/server";
import { json, error, withAuth } from "@lib/api-helpers";
import { storage } from "@lib/storage";
import { updateUserSchema } from "@shared/schema";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const user = await storage.getUser(id);
    if (!user) return error("User not found", 404);

    const publicContactData = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      firstName: user.firstName,
      lastName: user.lastName,
    };
    return json(publicContactData);
  } catch (e: any) {
    return error(e.message, 500);
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withAuth(async (req, user) => {
    const { id } = await params;

    if (id !== user.id) {
      return error("Cannot update another user's profile", 403);
    }

    const body = await req.json();
    const updateData = updateUserSchema.parse(body);

    if (updateData.email) {
      const existing = await storage.getUserByEmail(updateData.email);
      if (existing && existing.id !== id) {
        return error("Email already in use", 400);
      }
    }

    if (updateData.username) {
      const existing = await storage.getUserByUsername(updateData.username);
      if (existing && existing.id !== id) {
        return error("Username already taken", 400);
      }
    }

    const updatedUser = await storage.updateUser(id, updateData);
    if (!updatedUser) return error("User not found", 404);

    const { password: _, ...userWithoutPassword } = updatedUser;
    return json({ user: userWithoutPassword });
  }, req);
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  return withAuth(async (_req, user) => {
    const { id } = await params;

    if (id !== user.id) {
      return error("Cannot delete another user's account", 403);
    }

    const deleted = await storage.deleteUser(id);
    if (!deleted) return error("User not found", 404);

    return json({ message: "Account deleted successfully" });
  }, req);
}
