require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
    user: process.env.DB_USER || 'postgres',
    host: process.env.DB_HOST || 'localhost',
    database: process.env.DB_NAME || 'lcgvap_db',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 5432,
});

const checkBio = async () => {
    try {
        console.log('Connecting to DB...');
        const client = await pool.connect();
        console.log('Connected!');

        console.log('Checking for bio column...');
        const res = await client.query(`
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name='users' AND column_name='bio';
        `);

        if (res.rows.length > 0) {
            console.log('✅ Bio column exists!');
        } else {
            console.log('❌ Bio column MISSING! Adding it now...');
            await client.query('ALTER TABLE users ADD COLUMN bio TEXT;');
            console.log('✅ Bio column added successfully.');
        }

        client.release();
    } catch (err) {
        console.error('❌ DB Error:', err);
    } finally {
        pool.end();
    }
};

checkBio();
