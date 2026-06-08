/**
 * init-db.js — run database/init/*.sql against DATABASE_URL (local or Railway).
 *
 * Usage (one-time after creating Railway Postgres):
 *   set DATABASE_URL=postgresql://...   (Windows — use Railway Postgres → Connect → Public URL)
 *   npm run db:init
 */
/* eslint-disable no-console */

const onRailway = Boolean(
  process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID
);

if (!onRailway && process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const fs = require('fs');
const path = require('path');
const { Client } = require('pg');

const resolveInitDir = () => {
  const candidates = [
    path.resolve(__dirname, '../../database/init'), // LCGVAP-Backend/database/init (Railway deploy root)
    path.resolve(__dirname, '../../../database/init'), // monorepo database/init (local dev)
  ];

  for (const dir of candidates) {
    if (fs.existsSync(path.join(dir, '010_schema.sql'))) {
      return dir;
    }
  }

  return candidates[0];
};

const INIT_DIR = resolveInitDir();

const SQL_FILES = [
  '010_schema.sql',
  '020_degrees_schema.sql',
  '030_otp_hardening_migration.sql',
  '040_app_extensions.sql',
  '050_placeholder_fk_seed.sql',
];

const isValidPostgresUrl = (value) =>
  Boolean(value && /^postgres(ql)?:\/\//i.test(String(value).trim()));

const needsSsl = (url) =>
  /railway\.app|railway\.internal|sslmode=require|neon\.tech|supabase/i.test(url);

/** Same resolution as src/config/db.js (DATABASE_URL ref or PGHOST/PG* refs) */
const resolveDatabaseUrl = () => {
  const candidates = [
    process.env.DATABASE_URL,
    process.env.DATABASE_PRIVATE_URL,
    process.env.DATABASE_PUBLIC_URL,
  ]
    .map((v) => (v ? String(v).trim() : ''))
    .filter(Boolean);

  for (const url of candidates) {
    if (isValidPostgresUrl(url)) {
      return url;
    }
  }

  const host = process.env.PGHOST || process.env.DB_HOST;
  const port = process.env.PGPORT || process.env.DB_PORT || '5432';
  const user = process.env.PGUSER || process.env.DB_USER || 'postgres';
  const password = process.env.PGPASSWORD || process.env.DB_PASSWORD;
  const database = process.env.PGDATABASE || process.env.DB_NAME || 'railway';

  if (host) {
    const auth = password
      ? `${encodeURIComponent(user)}:${encodeURIComponent(password)}@`
      : `${encodeURIComponent(user)}@`;
    return `postgresql://${auth}${host}:${port}/${database}`;
  }

  return null;
};

async function main() {
  const connectionString = resolveDatabaseUrl();

  if (!connectionString) {
    console.error('No valid database URL found.');
    console.error('Railway backend: Reference → Postgres → DATABASE_URL (delete any typed value).');
    console.error('Or reference PGHOST, PGPORT, PGUSER, PGPASSWORD, PGDATABASE from Postgres.');
    console.error('Local PC: use Postgres → Connect → Public Network URL, then:');
    console.error('  set DATABASE_URL=postgresql://...');
    console.error('  npm run db:init');
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
