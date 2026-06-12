const db = require('../config/db');
const logger = require('./logger');

/** Apply safe idempotent schema patches needed by runtime code. */
const ensureDbSchema = async () => {
  try {
    await db.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;
    `);
  } catch (error) {
    logger.error('Database schema patch failed (users.verified_at)', {
      error: error.message,
    });
    throw error;
  }
};

module.exports = { ensureDbSchema };
