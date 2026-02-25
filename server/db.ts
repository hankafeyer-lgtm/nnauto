import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

// Use PRODUCTION_DATABASE_URL if set, otherwise use DATABASE_URL with fixes
let connectionString = process.env.PRODUCTION_DATABASE_URL || process.env.DATABASE_URL;

// Fix corrupted DATABASE_URL if it has wrong username
if (connectionString.includes('neon_owner:') && !connectionString.includes('neondb_owner:')) {
  connectionString = connectionString.replace('neon_owner:', 'neondb_owner:');
  console.log('[DB] Fixed corrupted DATABASE_URL username');
}

console.log('[DB] Using database:', connectionString.includes('ep-raspy-dust') ? 'production' : 'development');

export const pool = new Pool({ connectionString });
export const db = drizzle({ client: pool, schema });
