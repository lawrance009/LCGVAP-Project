require('dotenv').config({ path: '../../.env' });
const pool = require('../config/db');

async function dropOtpConstraint() {
  try {
    console.log('Dropping otp check constraint from otp_tokens table...');
    
    // Drop the check constraint that enforces 6-digit length or numeric characters
    await pool.query(`
      ALTER TABLE otp_tokens 
      DROP CONSTRAINT IF EXISTS otp_tokens_otp_check;
    `);
    
    console.log('Successfully dropped otp_tokens_otp_check constraint. Bcrypt hashes can now be saved.');
  } catch (error) {
    console.error('Error dropping constraint:', error);
  } finally {
    pool.end();
  }
}

dropOtpConstraint();
