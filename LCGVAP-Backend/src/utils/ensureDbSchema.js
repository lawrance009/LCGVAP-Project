const db = require('../config/db');
const logger = require('./logger');

/** Apply safe idempotent schema patches required by runtime code. */
const ensureDbSchema = async () => {
  const patches = [
    {
      name: 'users.verified_at',
      sql: `ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;`,
    },
    {
      name: 'otp_tokens.otp varchar(255)',
      sql: `ALTER TABLE otp_tokens ALTER COLUMN otp TYPE VARCHAR(255);`,
    },
    {
      name: 'otp_tokens.attempts',
      sql: `ALTER TABLE otp_tokens ADD COLUMN IF NOT EXISTS attempts INTEGER NOT NULL DEFAULT 0;`,
    },
    {
      name: 'otp_tokens.is_locked',
      sql: `ALTER TABLE otp_tokens ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT FALSE;`,
    },
    {
      name: 'otp_tokens drop 6-digit check',
      sql: `ALTER TABLE otp_tokens DROP CONSTRAINT IF EXISTS otp_tokens_otp_check;`,
    },
    {
      name: 'otp_tokens active index',
      sql: `CREATE INDEX IF NOT EXISTS idx_otp_email_active ON otp_tokens(email, is_used, is_locked, expires_at);`,
    },
  ];

  for (const patch of patches) {
    try {
      await db.query(patch.sql);
    } catch (error) {
      logger.error(`Database schema patch failed (${patch.name})`, {
        error: error.message,
      });
      throw error;
    }
  }

  logger.info('Database schema patches applied');
};

module.exports = { ensureDbSchema };
