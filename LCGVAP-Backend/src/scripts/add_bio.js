const db = require('../config/db');

const addBioColumn = async () => {
    try {
        console.log('Attempting to add bio column to users table...');
        await db.query(`
            ALTER TABLE users 
            ADD COLUMN IF NOT EXISTS bio TEXT;
        `);
        console.log('Successfully added bio column (or it already existed).');
    } catch (error) {
        console.error('Error adding bio column:', error);
    } finally {
        process.exit();
    }
};

addBioColumn();
