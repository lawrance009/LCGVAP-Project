require('dotenv').config({ path: '../../.env' });
const pool = require('../config/db');

const upgradeRoles = async () => {
    try {
        console.log('Starting Master Admin schema upgrade...');

        // 1. Delete all existing admins to start fresh
        console.log('Wiping existing admins...');
        const deleteRes = await pool.query("DELETE FROM users WHERE role = 'admin'");
        console.log(`Deleted ${deleteRes.rowCount} old admins.`);

        // 2. Update the check constraint
        console.log('Upgrading role check constraint...');
        
        // Drop the old constraint
        try {
            // Find the constraint name (usually users_role_check)
            await pool.query("ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;");
        } catch (e) {
            console.log('No existing constraint found or error dropping it:', e.message);
        }

        // Add the new constraint
        await pool.query(`
            ALTER TABLE users 
            ADD CONSTRAINT users_role_check 
            CHECK (role IN ('graduate', 'admin', 'master_admin'));
        `);
        console.log('Successfully upgraded role constraint to support master_admin.');

        process.exit(0);
    } catch (error) {
        console.error('Error upgrading schema:', error);
        process.exit(1);
    }
};

upgradeRoles();
