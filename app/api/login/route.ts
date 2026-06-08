import { NextRequest } from "next/server";
import { createHash } from "crypto";
import { json, error } from "@lib/api-helpers";
import { getJwtSecret } from "@lib/jwtSecret";
import {
  isLoginBlocked,
  recordLoginFailure,
  recordLoginSuccess,
} from "@lib/loginThrottle";
import { securityLog } from "@lib/securityLog";
import { storage } from "@lib/storage";
import { verifyTurnstileToken } from "@lib/turnstile";
import { loginSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

function clientIp(req: NextRequest) {
  return (
    req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    req.headers.get("x-real-ip") ||
    "unknown"
  );
}

function ipHash(ip: string) {
  return createHash("sha256").update(ip).digest("hex").slice(0, 12);
}

function signToken(payload: { userId: string; email: string }) {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: "7d" });
}

export async function POST(req: NextRequest) {
  const ip = clientIp(req);
  try {
    const body = await req.json();
    const turnstile = await verifyTurnstileToken(body.turnstileToken);
    if (!turnstile.ok) {
      securityLog("login_failure", {
        reason: "turnstile",
        detail: turnstile.reason || "failed",
        ipHash: ipHash(ip),
      });
      return error("Security verification failed. Please try again.", 400);
    }
    if (turnstile.reason === "client_fallback" || turnstile.reason === "turnstile_api_unreachable") {
      securityLog("login_turnstile_bypass", {
        reason: turnstile.reason,
        ipHash: ipHash(ip),
      });
    }

    const { email, password } = loginSchema.parse(body);
    const emailTrim = String(email).trim();
    const emailNorm = emailTrim.toLowerCase();

    if (isLoginBlocked(ip, emailNorm)) {
      securityLog("login_failure", {
        reason: "locked",
        ipHash: ipHash(ip),
      });
      return error("Too many login attempts. Try again later.", 429);
    }

    const user =
      (await storage.getUserByEmail(emailTrim)) ||
      (await storage.getUserByEmail(emailNorm));
    const validPassword = user
      ? await bcrypt.compare(String(password), user.password)
      : false;

    if (!user || !validPassword) {
      recordLoginFailure(ip, emailNorm);
      securityLog("login_failure", {
        reason: "invalid_credentials",
        ipHash: ipHash(ip),
      });
      return error("Invalid credentials", 401);
    }

    recordLoginSuccess(ip, emailNorm);
    const token = signToken({ userId: user.id, email: user.email });
    securityLog("login_success", { userId: user.id, ipHash: ipHash(ip) });

    const { password: _, ...userWithoutPassword } = user;
    return json({ user: userWithoutPassword, token });
  } catch (err: unknown) {
    if (err && typeof err === "object" && (err as { name?: string }).name === "ZodError") {
      return error("Invalid credentials", 400);
    }
    const message = err instanceof Error ? err.message : "Server error";
    return error(message, 500);
  }
}
