import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { storage } from "@lib/storage";
import { insertUserSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";

const JWT_SECRET =
  process.env.JWT_SECRET || process.env.SESSION_SECRET || "dev-secret";

function signToken(payload: { userId: string; email: string }) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "24h" });
}

async function verifyTurnstileToken(token: string): Promise<boolean> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  if (!secretKey) return true;

  const response = await fetch(
    "https://challenges.cloudflare.com/turnstile/v0/siteverify",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret: secretKey, response: token }),
    },
  );

  const data = (await response.json()) as {
    success: boolean;
    "error-codes"?: string[];
  };

  if (!data.success) {
    console.log("[Turnstile] Verification failed:", data["error-codes"]);
  }
  return data.success;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { turnstileToken, ...userData } = body;

    if (turnstileToken) {
      const isValid = await verifyTurnstileToken(turnstileToken);
      if (!isValid) {
        return error("Security verification failed. Please try again.");
      }
    } else if (process.env.TURNSTILE_SECRET_KEY) {
      return error("Security verification required");
    }

    const { email, username, password, firstName, lastName, phone } =
      insertUserSchema.parse(userData);

    if (!phone || phone.trim() === "") {
      return error("Phone number is required");
    }

    const existingUserByEmail = await storage.getUserByEmail(email);
    if (existingUserByEmail) {
      return error("Email already registered");
    }

    const requestedUsername =
      typeof username === "string" ? username.trim() : "";

    const makeBaseUsername = (emailValue: string) => {
      const local = (emailValue.split("@")[0] || "user").toLowerCase();
      const cleaned = local
        .replace(/[^a-z0-9_]+/g, "_")
        .replace(/^_+|_+$/g, "");
      return cleaned || "user";
    };

    const generateUniqueUsername = async (base: string) => {
      const suffix = () => randomBytes(3).toString("hex");
      const candidates = [
        base,
        `${base}_${suffix()}`,
        `${base}_${suffix()}`,
        `${base}_${suffix()}`,
      ];
      for (const c of candidates) {
        const exists = await storage.getUserByUsername(c);
        if (!exists) return c;
      }
      return `${base}_${Date.now().toString(36)}_${suffix()}`;
    };

    let finalUsername = requestedUsername;
    if (!finalUsername) {
      finalUsername = await generateUniqueUsername(makeBaseUsername(email));
    } else {
      const existingUserByUsername =
        await storage.getUserByUsername(finalUsername);
      if (existingUserByUsername) {
        return error("Username already taken");
      }
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await storage.createUser({
      email,
      username: finalUsername,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
    });

    const token = signToken({ userId: user.id, email: user.email });
    console.log("[AUTH] Register - JWT token generated for user:", user.id);

    const { password: _, ...userWithoutPassword } = user;
    return json({ user: userWithoutPassword, token });
  } catch (err: any) {
    return error(err.message);
  }
}
