-- Dealer ↔ buyer messaging (unified inbox).
-- Mirrors shared/schema.ts and lib/ensureMessagingSchema.ts.
-- The runtime ensureMessagingSchema() helper creates these idempotently in
-- production (since deploy-vps.yml does not run drizzle-kit migrate); this
-- file exists for parity with drizzle-kit and local dev.

CREATE TABLE IF NOT EXISTS conversations (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_user_id varchar NOT NULL,
  dealer_id varchar,
  listing_id varchar NOT NULL,
  client_name text,
  client_email varchar,
  client_phone varchar,
  source varchar(16) NOT NULL DEFAULT 'chat',
  status varchar(16) NOT NULL DEFAULT 'new',
  unread_dealer_count integer NOT NULL DEFAULT 0,
  last_message_preview text,
  last_message_at timestamp,
  thread_key varchar(64),
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS conversations_dealer_user_id_idx
  ON conversations (dealer_user_id);
CREATE INDEX IF NOT EXISTS conversations_listing_id_idx
  ON conversations (listing_id);
CREATE INDEX IF NOT EXISTS conversations_status_idx
  ON conversations (status);
CREATE INDEX IF NOT EXISTS conversations_last_message_at_idx
  ON conversations (last_message_at);
CREATE UNIQUE INDEX IF NOT EXISTS conversations_thread_key_idx
  ON conversations (thread_key);

CREATE TABLE IF NOT EXISTS messages (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id varchar NOT NULL,
  sender varchar(16) NOT NULL,
  type varchar(16) NOT NULL DEFAULT 'text',
  content text NOT NULL,
  read boolean NOT NULL DEFAULT false,
  channel varchar(16) NOT NULL DEFAULT 'chat',
  external_id varchar(128),
  created_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS messages_conversation_id_created_at_idx
  ON messages (conversation_id, created_at);
CREATE INDEX IF NOT EXISTS messages_external_id_idx
  ON messages (external_id);

CREATE TABLE IF NOT EXISTS quick_replies (
  id varchar PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_user_id varchar NOT NULL,
  title text NOT NULL,
  message text NOT NULL,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamp NOT NULL DEFAULT now(),
  updated_at timestamp NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS quick_replies_dealer_user_id_idx
  ON quick_replies (dealer_user_id);
