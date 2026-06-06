require('dotenv').config({ path: '../../.env' });
const pool = require('../config/db');

const wipeGraduates = async () => {
    try {
        console.log('Wiping all test graduates...');
        const res = await pool.query("DELETE FROM users WHERE role = 'graduate'");
        console.log(`Deleted ${res.rowCount} graduate(s).`);
        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
};

wipeGraduates();
