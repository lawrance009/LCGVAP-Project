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
    {
      name: 'degrees table',
      sql: `
        CREATE TABLE IF NOT EXISTS degrees (
          id SERIAL PRIMARY KEY,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          degree_type VARCHAR(50) NOT NULL CHECK (
            degree_type IN ('BACHELOR', 'MASTER', 'PHD', 'POSTDOC', 'ASSOCIATE', 'DIPLOMA')
          ),
          university_id INTEGER REFERENCES universities(id) ON DELETE SET NULL,
          department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
          advisor_id INTEGER REFERENCES advisors(id) ON DELETE SET NULL,
          graduation_year INTEGER,
          field_of_study VARCHAR(255),
          degree_file VARCHAR(500),
          is_verified BOOLEAN DEFAULT FALSE,
          verified_at TIMESTAMP,
          verified_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
          rejection_reason TEXT,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_degrees_user_id ON degrees(user_id);
        CREATE INDEX IF NOT EXISTS idx_degrees_is_verified ON degrees(is_verified);
      `,
    },
    {
      name: 'degrees verification columns',
      sql: `
        ALTER TABLE degrees ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;
        ALTER TABLE degrees ADD COLUMN IF NOT EXISTS verified_by INTEGER REFERENCES users(id) ON DELETE SET NULL;
        ALTER TABLE degrees ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
        ALTER TABLE degrees ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;
        ALTER TABLE degrees ADD COLUMN IF NOT EXISTS degree_file VARCHAR(500);
        ALTER TABLE degrees ADD COLUMN IF NOT EXISTS field_of_study VARCHAR(255);
      `,
    },
    {
      name: 'badges table',
      sql: `
        CREATE TABLE IF NOT EXISTS badges (
          id SERIAL PRIMARY KEY,
          degree_id INTEGER NOT NULL UNIQUE REFERENCES degrees(id) ON DELETE CASCADE,
          name VARCHAR(255) NOT NULL,
          icon VARCHAR(100) NOT NULL,
          description TEXT,
          awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_badges_degree_id ON badges(degree_id);
      `,
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

  try {
    const degreeModel = require('../models/degreeModel');
    await degreeModel.backfillRegistrationDegrees();
    logger.info('Registration degree backfill completed');
  } catch (error) {
    logger.error('Registration degree backfill failed', { error: error.message });
    throw error;
  }
};

module.exports = { ensureDbSchema };
