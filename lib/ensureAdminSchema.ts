import { pool } from "./db";

/**
 * Idempotently ensure the Admin Dealer Management schema additions exist:
 *  - extra columns on `dealers` (plan, status, verification_status, xml feed,
 *    api key, last sync)
 *  - the `admin_audit_logs` table
 *
 * The deploy pipeline (.github/workflows/deploy-vps.yml) does not run
 * drizzle-kit migrate, so this guarantees the storage is ready the first time
 * an admin route is exercised in production. Mirrors lib/ensureMessagingSchema.ts.
 */
let ensured: Promise<void> | null = null;

const DDL = `
  ALTER TABLE dealers ADD COLUMN IF NOT EXISTS plan varchar(20) NOT NULL DEFAULT 'free';
  ALTER TABLE dealers ADD COLUMN IF NOT EXISTS status varchar(20) NOT NULL DEFAULT 'active';
  ALTER TABLE dealers ADD COLUMN IF NOT EXISTS verification_status varchar(20) NOT NULL DEFAULT 'none';
  ALTER TABLE dealers ADD COLUMN IF NOT EXISTS xml_feed_url text;
  ALTER TABLE dealers ADD COLUMN IF NOT EXISTS xml_feed_status varchar(20) NOT NULL DEFAULT 'none';
  ALTER TABLE dealers ADD COLUMN IF NOT EXISTS api_key varchar(80);
  ALTER TABLE dealers ADD COLUMN IF NOT EXISTS api_enabled boolean NOT NULL DEFAULT false;
  ALTER TABLE dealers ADD COLUMN IF NOT EXISTS last_sync_at timestamp;

  -- Backfill verification_status from the legacy is_verified boolean.
  UPDATE dealers SET verification_status = 'verified'
    WHERE is_verified = true AND verification_status = 'none';

  CREATE INDEX IF NOT EXISTS dealers_status_idx ON dealers (status);
  CREATE INDEX IF NOT EXISTS dealers_plan_idx ON dealers (plan);

  CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
    actor_user_id varchar NOT NULL,
    actor_email varchar,
    action varchar(64) NOT NULL,
    target_type varchar(32),
    target_id varchar,
    metadata jsonb,
    created_at timestamp NOT NULL DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS admin_audit_logs_created_at_idx
    ON admin_audit_logs (created_at);
  CREATE INDEX IF NOT EXISTS admin_audit_logs_target_idx
    ON admin_audit_logs (target_type, target_id);
`;

export function ensureAdminSchema(): Promise<void> {
  if (!ensured) {
    ensured = (async () => {
      try {
        await pool.query(DDL);
      } catch (e) {
        ensured = null;
        console.error("[ensureAdminSchema] Failed to ensure schema:", e);
        throw e;
      }
    })();
  }
  return ensured;
}

/** Plan → max listings mapping used as defaults when a plan is assigned. */
export const PLAN_LIMITS: Record<string, number> = {
  free: 5,
  basic: 20,
  pro: 100,
  premium: 500,
  enterprise: 1_000_000,
};

export const DEALER_PLANS = ["free", "basic", "pro", "premium", "enterprise"] as const;
export type DealerPlan = (typeof DEALER_PLANS)[number];

/** Write an entry to the admin audit log. Best-effort: never throws. */
export async function writeAdminAudit(entry: {
  actorUserId: string;
  actorEmail?: string | null;
  action: string;
  targetType?: string;
  targetId?: string;
  metadata?: unknown;
}): Promise<void> {
  try {
    await pool.query(
      `INSERT INTO admin_audit_logs (actor_user_id, actor_email, action, target_type, target_id, metadata)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [
        entry.actorUserId,
        entry.actorEmail ?? null,
        entry.action,
        entry.targetType ?? null,
        entry.targetId ?? null,
        entry.metadata != null ? JSON.stringify(entry.metadata) : null,
      ],
    );
  } catch (e) {
    console.error("[writeAdminAudit] Failed to write audit log:", e);
  }
}
