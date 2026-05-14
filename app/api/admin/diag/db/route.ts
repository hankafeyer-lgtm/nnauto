import { NextRequest } from "next/server";
import { error, json } from "@lib/api-helpers";
import { requireAdmin } from "@lib/auth";
import { db, pool } from "@lib/db";
import { sql } from "drizzle-orm";

/**
 * Admin-only database diagnostic.
 *
 *   GET /api/admin/diag/db
 *
 * Returns the host / db / user the running Next.js process is actually
 * connected to (NEVER the password), what env var supplied it, the
 * detected provider (Neon vs other), the Postgres server version, plus
 * row counts and the latest `createdAt` for the core business tables so
 * we can confirm fresh writes are landing in this database.
 *
 * Gated by requireAdmin — anyone else gets 401/403.
 */
export async function GET(_req: NextRequest) {
  try {
    await requireAdmin();

    // Pick the same env var precedence as lib/db.ts so this report
    // matches the live connection (the pool itself was built from one
    // of these on boot).
    const sourceEnv =
      (process.env.DATABASE_URL_POOLED && "DATABASE_URL_POOLED") ||
      (process.env.PRODUCTION_DATABASE_URL && "PRODUCTION_DATABASE_URL") ||
      (process.env.DATABASE_URL && "DATABASE_URL") ||
      null;
    const rawUrl =
      process.env.DATABASE_URL_POOLED ||
      process.env.PRODUCTION_DATABASE_URL ||
      process.env.DATABASE_URL ||
      "";

    let host: string | null = null;
    let port: string | null = null;
    let database: string | null = null;
    let username: string | null = null;
    let provider: "neon" | "supabase" | "render" | "amazon-rds" | "localhost" | "unknown" = "unknown";
    let sslmode: string | null = null;
    try {
      const u = new URL(rawUrl);
      host = u.hostname || null;
      port = u.port || null;
      database = u.pathname?.replace(/^\//, "") || null;
      username = u.username || null;
      sslmode = u.searchParams.get("sslmode");
      if (host) {
        if (host.endsWith(".neon.tech")) provider = "neon";
        else if (host.endsWith(".supabase.co") || host.includes("supabase")) provider = "supabase";
        else if (host.endsWith(".rds.amazonaws.com")) provider = "amazon-rds";
        else if (host.includes("render.com")) provider = "render";
        else if (host === "localhost" || host === "127.0.0.1") provider = "localhost";
      }
    } catch {
      /* malformed url — fields stay null */
    }

    // Live server identity check, independent of how the URL was parsed.
    const versionRow = await db.execute(sql`SELECT version() AS version`);
    const serverVersion =
      (versionRow as unknown as { rows?: Array<{ version?: string }> })?.rows?.[0]?.version ??
      null;
    const dbNameRow = await db.execute(sql`SELECT current_database() AS db, current_user AS usr`);
    const liveIdentity =
      (dbNameRow as unknown as { rows?: Array<{ db?: string; usr?: string }> })?.rows?.[0] ??
      {};

    // Row counts + latest createdAt timestamps for the core tables so
    // the admin can confirm fresh writes are landing here. Each query is
    // wrapped in try/catch so a missing table on a fresh / partial db
    // doesn't blow up the whole report.
    const TABLES = [
      "users",
      "listings",
      "deleted_listings",
      "conversations",
      "messages",
      "payments",
      "cebia_reports",
      "dealers",
      "password_reset_tokens",
      "sessions",
    ] as const;

    const tableStats: Record<
      string,
      { count: number | null; latestCreatedAt: string | null; error?: string }
    > = {};

    for (const table of TABLES) {
      try {
        const countRow = await db.execute(
          sql`SELECT COUNT(*)::int AS c FROM ${sql.identifier(table)}`,
        );
        const c =
          (countRow as unknown as { rows?: Array<{ c?: number }> })?.rows?.[0]?.c ?? null;

        // Not every table has a created_at column — guard with information_schema.
        const colRow = await db.execute(sql`
          SELECT 1
          FROM information_schema.columns
          WHERE table_schema = 'public'
            AND table_name = ${table}
            AND column_name = 'created_at'
          LIMIT 1
        `);
        const hasCreatedAt =
          ((colRow as unknown as { rows?: unknown[] })?.rows?.length ?? 0) > 0;

        let latest: string | null = null;
        if (hasCreatedAt) {
          const latestRow = await db.execute(
            sql`SELECT MAX(created_at)::text AS t FROM ${sql.identifier(table)}`,
          );
          latest =
            (latestRow as unknown as { rows?: Array<{ t?: string | null }> })?.rows?.[0]?.t ??
            null;
        }
        tableStats[table] = { count: c, latestCreatedAt: latest };
      } catch (e) {
        tableStats[table] = {
          count: null,
          latestCreatedAt: null,
          error: e instanceof Error ? e.message : "query failed",
        };
      }
    }

    // pg.Pool exposes simple internal counters — useful to confirm the
    // pool is alive and not starved.
    const poolStats = {
      totalCount: (pool as unknown as { totalCount?: number })?.totalCount ?? null,
      idleCount: (pool as unknown as { idleCount?: number })?.idleCount ?? null,
      waitingCount: (pool as unknown as { waitingCount?: number })?.waitingCount ?? null,
    };

    return json({
      ok: true,
      sourceEnv,
      provider,
      connection: {
        host: host ?? null,
        port: port || "5432",
        database: liveIdentity.db ?? database ?? null,
        user: liveIdentity.usr ?? username ?? null,
        sslmode: sslmode ?? null,
        sslEnabled: process.env.PGSSL_REQUIRE === "true" || sslmode === "require" || host?.endsWith(".neon.tech") || false,
      },
      serverVersion,
      tableStats,
      poolStats,
      checkedAt: new Date().toISOString(),
    });
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : "Server error";
    if (msg === "Unauthorized") return error("Unauthorized", 401);
    if (msg === "Forbidden") return error("Forbidden", 403);
    return error(msg, 500);
  }
}
