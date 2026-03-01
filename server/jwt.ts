import jwt, { type SignOptions } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || process.env.SESSION_SECRET || 'nnauto-jwt-secret-key-2024';
const JWT_EXPIRES_IN: SignOptions["expiresIn"] =
  (process.env.JWT_EXPIRES_IN as SignOptions["expiresIn"]) || "24h";

export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

export function signToken(payload: { userId: string; email: string }): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.log('[JWT] Token verification failed:', error instanceof Error ? error.message : 'Unknown error');
    return null;
  }
}

export function extractTokenFromHeader(authHeader: string | undefined): string | null {
  if (!authHeader) return null;
  
  if (authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  return authHeader;
}
