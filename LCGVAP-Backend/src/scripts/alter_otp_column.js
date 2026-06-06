require('dotenv').config({ path: '../../.env' });
const pool = require('../config/db');

async function updateOtpColumn() {
  try {
    console.log('Altering otp_tokens table...');
    
    // Change the 'otp' column type from VARCHAR(6) to VARCHAR(255) to accommodate bcrypt hashes
    await pool.query(`
      ALTER TABLE otp_tokens 
      ALTER COLUMN otp TYPE VARCHAR(255);
    `);
    
    console.log('Successfully altered otp_tokens table. The otp column can now store bcrypt hashes.');
  } catch (error) {
    console.error('Error altering table:', error);
  } finally {
    pool.end();
  }
}

updateOtpColumn();
