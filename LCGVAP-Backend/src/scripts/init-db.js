/**
 * init-db.js — run database/init/*.sql against DATABASE_URL (local or Railway).
 *
 * Usage (one-time after creating Railway Postgres):
 *   set DATABASE_URL=postgresql://...   (Windows — use Railway Postgres → Connect → Public URL)
 *   npm run db:init
 */
/* eslint-disable no-console */

require('dotenv').config();

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const INIT_DIR = path.resolve(__dirname, '../../../database/init');

const SQL_FILES = [
  '010_schema.sql',
  '020_degrees_schema.sql',
  '030_otp_hardening_migration.sql',
  '040_app_extensions.sql',
  '050_placeholder_fk_seed.sql',
];

const needsSsl = (url) =>
  /railway\.app|railway\.internal|sslmode=require|neon\.tech|supabase/i.test(url);

async function main() {
  const connectionString = process.env.DATABASE_URL?.trim();

  if (!connectionString) {
    console.error('DATABASE_URL is required.');
    console.error('Copy the Public URL from Railway → Postgres → Connect, then:');
    console.error('  set DATABASE_URL=postgresql://...');
    console.error('  npm run db:init');
    process.exit(1);
  }

  if (!/^postgres(ql)?:\/\//i.test(connectionString)) {
    console.error('DATABASE_URL must start with postgresql:// or postgres://');
    process.exit(1);
  }

  const client = new Client({
    connectionString,
    ssl: needsSsl(connectionString) ? { rejectUnauthorized: false } : undefined,
  });

  console.log('Connecting to database...');
  await client.connect();
  console.log('Connected.\n');

  for (const file of SQL_FILES) {
    const filePath = path.join(INIT_DIR, file);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Missing SQL file: ${filePath}`);
    }

    const sql = fs.readFileSync(filePath, 'utf8');
    console.log(`Running ${file}...`);
    await client.query(sql);
    console.log(`  ✓ ${file}`);
  }

  await client.end();
  console.log('\nDatabase init complete — all tables created.');
}

main().catch((err) => {
  console.error('\nDatabase init failed:', err.message);
  process.exit(1);
});
