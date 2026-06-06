require('dotenv').config();
const pool = require('../config/db');

const fixConstraint = async () => {
    try {
        console.log('Fixing users_degree_type_check...');

        // 1. Drop existing constraint
        await pool.query('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_degree_type_check');

        // 2. Add correct constraint
        await pool.query(`
            ALTER TABLE users 
            ADD CONSTRAINT users_degree_type_check 
            CHECK (degree_type IN ('Bachelor', 'Master', 'PhD'))
        `);

        console.log('Successfully updated constraint.');
        process.exit(0);
    } catch (error) {
        console.error('Error altering schema:', error);
        process.exit(1);
    }
};

fixConstraint();
