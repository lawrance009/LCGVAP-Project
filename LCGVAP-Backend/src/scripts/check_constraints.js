require('dotenv').config();
const pool = require('../config/db');

const checkConstraints = async () => {
    try {
        const res = await pool.query(`
            SELECT conname, pg_get_constraintdef(oid)
            FROM pg_constraint
            WHERE conname = 'users_degree_type_check'
        `);
        console.log(res.rows);
        process.exit(0);
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
};

checkConstraints();
