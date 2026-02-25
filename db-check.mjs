import { Client } from "pg";

const url = process.env.PRODUCTION_DATABASE_URL || process.env.DATABASE_URL;
if (!url) {
  console.error("Set PRODUCTION_DATABASE_URL or DATABASE_URL");
  process.exit(1);
}

const client = new Client({
  connectionString: url,
  ssl: { rejectUnauthorized: false }, // для neon
});

try {
  await client.connect();
  const r = await client.query("select now() as now, current_database() as db");
  console.log(r.rows[0]);

  const tables = await client.query(`
    select table_name
    from information_schema.tables
    where table_schema='public'
    order by table_name
  `);
  console.log(
    "tables:",
    tables.rows.map((x) => x.table_name)
  );
} catch (e) {
  console.error("DB error:", e.message);
  process.exit(1);
} finally {
  await client.end().catch(() => {});
}
