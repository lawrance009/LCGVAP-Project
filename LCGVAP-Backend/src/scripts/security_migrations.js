require('dotenv').config({ path: '../../.env' });
const pool = require('../config/db');

const migrate = async () => {
    try {
        console.log('Adding admin lockout columns...');
        await pool.query(`
            ALTER TABLE users
            ADD COLUMN IF NOT EXISTS login_attempts  INTEGER   DEFAULT 0,
            ADD COLUMN IF NOT EXISTS locked_until    TIMESTAMP DEFAULT NULL;
        `);
        console.log('Done — login_attempts and locked_until columns added.');

        console.log('Creating refresh_tokens table...');
        await pool.query(`
            CREATE TABLE IF NOT EXISTS refresh_tokens (
                id          SERIAL PRIMARY KEY,
                user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
                token_hash  VARCHAR(64) NOT NULL UNIQUE,
                expires_at  TIMESTAMP NOT NULL,
                revoked     BOOLEAN NOT NULL DEFAULT FALSE,
                created_at  TIMESTAMP NOT NULL DEFAULT NOW()
            );
            CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash    ON refresh_tokens(token_hash);
            CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);
        `);
        console.log('Done — refresh_tokens table created.');

        process.exit(0);
    } catch (error) {
        console.error('Migration error:', error);
        process.exit(1);
    }
};

migrate();
