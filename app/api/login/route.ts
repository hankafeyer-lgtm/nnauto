import { NextRequest } from "next/server";
import { json, error } from "@lib/api-helpers";
import { storage } from "@lib/storage";
import { loginSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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
    const { turnstileToken, ...loginData } = body;

    if (turnstileToken) {
      const isValid = await verifyTurnstileToken(turnstileToken);
      if (!isValid) {
        return error("Security verification failed. Please try again.");
      }
    } else if (process.env.TURNSTILE_SECRET_KEY) {
      return error("Security verification required");
    }

    const { email, password } = loginSchema.parse(loginData);

    const user = await storage.getUserByEmail(email);
    if (!user) {
      return error("Invalid credentials", 401);
    }

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return error("Invalid credentials", 401);
    }

    const token = signToken({ userId: user.id, email: user.email });
    console.log("[AUTH] Login - JWT token generated for user:", user.id);

    const { password: _, ...userWithoutPassword } = user;
    return json({ user: userWithoutPassword, token });
  } catch (err: any) {
    if (err.name === "ZodError") {
      return error("Invalid email or password format");
    }
    return error(err.message, 500);
  }
}
