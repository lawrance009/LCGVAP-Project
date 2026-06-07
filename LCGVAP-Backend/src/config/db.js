const { Pool } = require('pg');
const logger = require('../utils/logger');

const onRailway = Boolean(
  process.env.RAILWAY_ENVIRONMENT || process.env.RAILWAY_PROJECT_ID
);

const isValidPostgresUrl = (value) =>
  Boolean(value && /^postgres(ql)?:\/\//i.test(String(value).trim()));

const needsSsl = (url) =>
  /railway\.app|railway\.internal|sslmode=require|neon\.tech|supabase/i.test(url || '');

/** Resolve Postgres URL from Railway / Render / local env */
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
    if (url) {
      logger.warn(
        'Ignoring invalid DATABASE_URL value — must start with postgresql://. Use Reference → Postgres → DATABASE_URL on Railway.'
      );
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

const connectionString = resolveDatabaseUrl();

if (onRailway) {
  logger.info('Railway Postgres config', {
    hasDatabaseUrl: Boolean(process.env.DATABASE_URL),
    hasDatabasePrivateUrl: Boolean(process.env.DATABASE_PRIVATE_URL),
    hasPgHost: Boolean(process.env.PGHOST),
    resolved: connectionString ? 'ok' : 'missing',
  });
}

if (!connectionString) {
  logger.error(
    'No valid DATABASE_URL. On Railway backend: delete any typed DATABASE_URL, then Add Reference → Postgres → DATABASE_URL, then redeploy.'
  );
}

const poolConfig = connectionString
  ? {
      connectionString,
      ssl: needsSsl(connectionString) ? { rejectUnauthorized: false } : undefined,
      max: parseInt(process.env.DB_POOL_MAX || '10', 10),
      min: parseInt(process.env.DB_POOL_MIN || '2', 10),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS || '30000', 10),
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECT_TIMEOUT_MS || '5000', 10),
      statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT_MS || '7000', 10),
      query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT_MS || '7000', 10),
      keepAlive: true,
    }
  : {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT,
      database: process.env.DB_NAME,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      max: parseInt(process.env.DB_POOL_MAX || '10', 10),
      min: parseInt(process.env.DB_POOL_MIN || '2', 10),
      idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT_MS || '30000', 10),
      connectionTimeoutMillis: parseInt(process.env.DB_CONNECT_TIMEOUT_MS || '5000', 10),
      statement_timeout: parseInt(process.env.DB_STATEMENT_TIMEOUT_MS || '7000', 10),
      query_timeout: parseInt(process.env.DB_QUERY_TIMEOUT_MS || '7000', 10),
      keepAlive: true,
    };

const pool = new Pool(poolConfig);

pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client', err.message);
});

module.exports = pool;
