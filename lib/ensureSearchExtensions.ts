import { db } from "./db";
import { sql } from "drizzle-orm";

let done = false;

/**
 * Idempotently enables pg_trgm (trigram similarity) and creates a GIN
 * trigram index on the normalized brand+model text. Safe to call on
 * every request — after the first successful run it becomes a no-op.
 *
 * The index accelerates fuzzy fallback queries (similarity / %) without
 * touching existing tables or columns.
 */
export async function ensureSearchExtensions(): Promise<void> {
  if (done) return;
  try {
    await db.execute(sql`CREATE EXTENSION IF NOT EXISTS pg_trgm`);
    await db.execute(sql`
      CREATE INDEX IF NOT EXISTS listings_brand_model_trgm_idx
        ON listings
        USING gin (
          (lower(translate(brand || ' ' || model,
            'áčďéěíňóřšťúůýžÁČĎÉĚÍŇÓŘŠŤÚŮÝŽ',
            'acdeeinorstuuyzACDEEINORSTUUYZ')) )
          gin_trgm_ops
        )
    `);
    done = true;
  } catch (e) {
    console.warn("[ensureSearchExtensions] non-fatal:", e);
    done = true;
  }
}
