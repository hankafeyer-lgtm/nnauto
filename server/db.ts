import { Pool } from "pg";
import { drizzle } from "drizzle-orm/node-postgres";
import * as schema from "@shared/schema";


function normalizeConnectionString(raw: string): string {
  const trimmed = raw.trim();
  // Fix corrupted DATABASE_URL if it has wrong username
  if (trimmed.includes("neon_owner:") && !trimmed.includes("neondb_owner:")) {
    console.log("[DB] Fixed corrupted DATABASE_URL username");
    return trimmed.replace("neon_owner:", "neondb_owner:");
  }
  return trimmed;
}

function parseIntEnv(name: string, fallback: number): number {
  const raw = process.env[name];
  if (!raw) return fallback;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) ? n : fallback;
}

function shouldRequireSsl(connectionString: string): boolean {
  if (process.env.PGSSL_REQUIRE === "true") return true;
  if (connectionString.includes("sslmode=require")) return true;
  try {
    const u = new URL(connectionString);
    return u.hostname.endsWith(".neon.tech");
  } catch {
    return false;
  }
}

const rawConnectionString =
  process.env.DATABASE_URL_POOLED ||
  process.env.PRODUCTION_DATABASE_URL ||
  process.env.DATABASE_URL;

if (!rawConnectionString) {
  throw new Error("DATABASE_URL must be set. Did you forget to provision a database?");
}

const connectionString = normalizeConnectionString(rawConnectionString);

const poolMax = parseIntEnv("PGPOOL_MAX", 5);
const idleTimeoutMillis = parseIntEnv("PGPOOL_IDLE_TIMEOUT_MS", 30_000);
const connectionTimeoutMillis = parseIntEnv("PGPOOL_CONN_TIMEOUT_MS", 10_000);

const rejectUnauthorized = process.env.PGSSL_REJECT_UNAUTHORIZED !== "false";
const ssl = shouldRequireSsl(connectionString) ? { rejectUnauthorized } : undefined;

console.log("[DB] NODE_ENV:", process.env.NODE_ENV);
console.log("[DB] Pool config:", {
  max: poolMax,
  idleTimeoutMillis,
  connectionTimeoutMillis,
  ssl: ssl ? { rejectUnauthorized } : false,
});

export const pool = new Pool({
  connectionString,
  max: poolMax,
  idleTimeoutMillis,
  connectionTimeoutMillis,
  ssl,
});

pool.on("error", (err) => {
  console.error("[DB] Pool error:", err instanceof Error ? err.message : err);
});

export const db = drizzle(pool, { schema });
