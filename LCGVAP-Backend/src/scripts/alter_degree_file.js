require('dotenv').config();
const pool = require('../config/db');

const fixSchema = async () => {
    try {
        console.log('Altering users table...');
        await pool.query('ALTER TABLE users ALTER COLUMN degree_file DROP NOT NULL');
        console.log('Successfully altered degree_file to be NULLABLE.');
        process.exit(0);
    } catch (error) {
        console.error('Error altering schema:', error);
        process.exit(1);
    }
};

fixSchema();
