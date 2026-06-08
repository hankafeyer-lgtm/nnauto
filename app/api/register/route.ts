import { NextRequest } from "next/server";
import { createHash } from "crypto";
import { json, error } from "@lib/api-helpers";
import { getJwtSecret } from "@lib/jwtSecret";
import { isRegisterBlocked, recordRegistration } from "@lib/registerThrottle";
import { securityLog } from "@lib/securityLog";
import { storage } from "@lib/storage";
import { verifyTurnstileToken } from "@lib/turnstile";
import { insertUserSchema } from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { randomBytes } from "crypto";

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
    const isFallback =
      turnstile.reason === "client_fallback" ||
      turnstile.reason === "turnstile_api_unreachable";

    if (!turnstile.ok) {
      securityLog("register_failure", {
        reason: "turnstile",
        detail: turnstile.reason || "failed",
        ipHash: ipHash(ip),
      });
      return error("Security verification failed. Please try again.", 400);
    }

    if (isRegisterBlocked(ip, isFallback)) {
      securityLog("register_failure", {
        reason: "rate_limit",
        fallback: isFallback,
        ipHash: ipHash(ip),
      });
      return error(
        "Too many registration attempts. Please try again later.",
        429,
      );
    }

    if (isFallback) {
      securityLog("register_turnstile_bypass", {
        reason: turnstile.reason!,
        ipHash: ipHash(ip),
      });
    }

    const { turnstileToken: _turnstile, ...userPayload } = body as Record<
      string,
      unknown
    >;
    const { email, username, password, firstName, lastName, phone } =
      insertUserSchema.parse(userPayload);

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
    recordRegistration(ip);
    securityLog("register_success", { userId: user.id, ipHash: ipHash(ip) });

    const { password: _, ...userWithoutPassword } = user;
    return json({ user: userWithoutPassword, token });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Bad request";
    return error(message);
  }
}
