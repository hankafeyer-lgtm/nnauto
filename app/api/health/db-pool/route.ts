import { NextRequest, NextResponse } from "next/server";
import { json, error } from "@lib/api-helpers";
import { pool } from "@lib/db";

export async function GET(_req: NextRequest) {
  try {
    const max =
      Number.parseInt(process.env.PGPOOL_MAX || "", 10) ||
      (pool as any)?.options?.max ||
      null;
    const waitingCount = (pool as any)?.waitingCount ?? null;
    const idleCount = (pool as any)?.idleCount ?? null;
    const totalCount = (pool as any)?.totalCount ?? null;

    const resp = json({
      status: "ok",
      pool: {
        max,
        totalCount,
        idleCount,
        waitingCount,
        utilizationPct:
          typeof totalCount === "number" && typeof max === "number" && max > 0
            ? Math.round((totalCount / max) * 100)
            : null,
      },
    });
    resp.headers.set("Cache-Control", "no-store");
    return resp;
  } catch (e: any) {
    return error(e?.message || "pool health error", 500);
  }
}
