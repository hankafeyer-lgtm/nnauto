import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";

function normalizeConnectionString(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.includes("neon_owner:") && !trimmed.includes("neondb_owner:")) {
    return trimmed.replace("neon_owner:", "neondb_owner:");
  }
  return trimmed;
}

function shouldRequireSsl(connectionString: string): boolean {
  if (process.env.PGSSL_REQUIRE === "true") return true;
  if (connectionString.includes("sslmode=require")) return true;
  try {
    return new URL(connectionString).hostname.endsWith(".neon.tech");
  } catch {
    return false;
  }
}

const rawConnectionString =
  process.env.DATABASE_URL_POOLED ||
  process.env.PRODUCTION_DATABASE_URL ||
  process.env.DATABASE_URL;

if (!rawConnectionString) {
  throw new Error("DATABASE_URL must be set.");
}

const connectionString = normalizeConnectionString(rawConnectionString);
const rejectUnauthorized = process.env.PGSSL_REJECT_UNAUTHORIZED !== "false";
const ssl = shouldRequireSsl(connectionString)
  ? { rejectUnauthorized }
  : undefined;

const globalForDb = globalThis as unknown as { _pool?: Pool };

export const pool =
  globalForDb._pool ??
  new Pool({
    connectionString,
    max: 10,
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 20_000,
    ssl,
  });

if (process.env.NODE_ENV !== "production") {
  globalForDb._pool = pool;
}

export const db = drizzle(pool, { schema });
