import { pool } from "./db";

/**
 * Idempotently ensure the leads CRM side-table exists.
 *
 * Leads are derived from `conversations` (every contact form / chat / inbound
 * e-mail already creates a conversation with the buyer's name / e-mail / phone).
 * The CRM status the dealer assigns is stored here, keyed by conversation id,
 * so it stays decoupled from the messaging status pipeline.
 *
 * The deploy pipeline does not run drizzle-kit migrate, so this guarantees the
 * storage is ready the first time the Leady tab is exercised in production.
 * Mirrors the pattern of lib/ensureMessagingSchema.ts.
 */
let ensured: Promise<void> | null = null;

const DDL = `
  CREATE TABLE IF NOT EXISTS lead_states (
    conversation_id varchar PRIMARY KEY,
    dealer_user_id varchar NOT NULL,
    status varchar(16) NOT NULL DEFAULT 'new',
    note text,
    updated_at timestamp NOT NULL DEFAULT now()
  );
  CREATE INDEX IF NOT EXISTS lead_states_dealer_user_id_idx
    ON lead_states (dealer_user_id);
`;

export function ensureLeadsSchema(): Promise<void> {
  if (!ensured) {
    ensured = (async () => {
      try {
        await pool.query(DDL);
      } catch (e) {
        ensured = null;
        console.error("[ensureLeadsSchema] Failed to ensure schema:", e);
        throw e;
      }
    })();
  }
  return ensured;
}
