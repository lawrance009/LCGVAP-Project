/**
 * Clear admin login lockout (failed attempts / 30-min lock).
 *
 * Railway backend Console:
 *   node src/scripts/unlock-admin.js your-admin@email.com
 *
 * Local (with DATABASE_URL set):
 *   npm run admin:unlock -- your-admin@email.com
 */
/* eslint-disable no-console */

const email = process.argv[2]?.trim();

if (!email) {
  console.error('Usage: node src/scripts/unlock-admin.js <admin-email>');
  process.exit(1);
}

if (!process.env.RAILWAY_ENVIRONMENT && !process.env.RAILWAY_PROJECT_ID && process.env.NODE_ENV !== 'production') {
  require('dotenv').config();
}

const db = require('../config/db');

async function main() {
  const result = await db.query(
    `UPDATE users
     SET login_attempts = 0, locked_until = NULL
     WHERE LOWER(email) = LOWER($1) AND role IN ('admin', 'master_admin')
     RETURNING id, email, role`,
    [email]
  );

  if (!result.rows.length) {
    console.error(`No admin account found for: ${email}`);
    process.exit(1);
  }

  console.log('Unlocked:', result.rows[0]);
  await db.end();
}

main().catch((err) => {
  console.error('Unlock failed:', err.message);
  process.exit(1);
});
