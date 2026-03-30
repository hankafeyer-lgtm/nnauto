-- Dealers table
CREATE TABLE IF NOT EXISTS dealers (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id VARCHAR NOT NULL,
  company_name TEXT NOT NULL,
  ico VARCHAR(20),
  dic VARCHAR(20),
  description TEXT,
  logo_url TEXT,
  website TEXT,
  phone VARCHAR,
  email VARCHAR,
  address TEXT,
  region TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  max_listings INTEGER NOT NULL DEFAULT 50,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS dealers_owner_id_idx ON dealers (owner_id);
CREATE INDEX IF NOT EXISTS dealers_region_idx ON dealers (region);

-- Add dealer fields to users
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_dealer BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE users ADD COLUMN IF NOT EXISTS dealer_id VARCHAR;

-- Bulk import jobs table
CREATE TABLE IF NOT EXISTS bulk_import_jobs (
  id VARCHAR PRIMARY KEY DEFAULT gen_random_uuid(),
  dealer_id VARCHAR NOT NULL,
  user_id VARCHAR NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  total_rows INTEGER NOT NULL DEFAULT 0,
  processed_rows INTEGER NOT NULL DEFAULT 0,
  success_rows INTEGER NOT NULL DEFAULT 0,
  failed_rows INTEGER NOT NULL DEFAULT 0,
  errors JSONB,
  file_name TEXT,
  created_at TIMESTAMP NOT NULL DEFAULT now(),
  updated_at TIMESTAMP NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS bulk_import_jobs_dealer_id_idx ON bulk_import_jobs (dealer_id);
CREATE INDEX IF NOT EXISTS bulk_import_jobs_status_idx ON bulk_import_jobs (status);
