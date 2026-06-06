require('dotenv').config();
const pool = require('../config/db');

const addRoleColumn = async () => {
    try {
        console.log('Adding role column to users table...');

        // Check if column exists first
        const checkQuery = "SELECT column_name FROM information_schema.columns WHERE table_name='users' AND column_name='role'";
        const checkRes = await pool.query(checkQuery);

        if (checkRes.rows.length === 0) {
            await pool.query(`
                ALTER TABLE users 
                ADD COLUMN role VARCHAR(20) DEFAULT 'graduate' CHECK (role IN ('graduate', 'admin'))
            `);
            console.log('Successfully added role column.');
        } else {
            console.log('Role column already exists.');
        }

        process.exit(0);
    } catch (error) {
        console.error('Error altering schema:', error);
        process.exit(1);
    }
};

addRoleColumn();
