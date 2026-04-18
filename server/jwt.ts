import jwt, { type SignOptions } from "jsonwebtoken";
import { getJwtSecret } from "../lib/jwtSecret";

const JWT_EXPIRES_IN: SignOptions["expiresIn"] =
  (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) || "7d";
const AUTH_DEBUG_LOGS = process.env.AUTH_DEBUG_LOGS === "true";

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export function signToken(payload: { userId: string; email: string }): string {
  return jwt.sign(payload, getJwtSecret(), { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, getJwtSecret()) as JWTPayload;
    return decoded;
  } catch (error) {
    if (AUTH_DEBUG_LOGS) {
      console.log(
        "[JWT] Token verification failed:",
        error instanceof Error ? error.message : "Unknown error",
      );
    }
    return null;
  }
}

export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) return null;

  if (authHeader.startsWith("Bearer ")) {
    return authHeader.substring(7);
  }

  return authHeader;
}
