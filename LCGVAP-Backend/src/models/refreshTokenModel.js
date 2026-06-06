/**
 * refreshTokenModel.js
 * Handles storing, verifying, and revoking refresh tokens.
 */

const crypto = require('crypto');
const db     = require('../config/db');

/**
 * SHA-256 hash of the token — fast lookup, no bcrypt needed here
 */
const hashToken = (token) =>
    crypto.createHash('sha256').update(token).digest('hex');

/**
 * Store a new refresh token in the DB after issuing it
 */
const storeRefreshToken = async (userId, token, expiresInDays = 7) => {
    const hash      = hashToken(token);
    const expiresAt = new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000);
    await db.query(
        'INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)',
        [userId, hash, expiresAt]
    );
};

/**
 * Find a stored token record by its hash
 * Returns the record or undefined
 */
const findRefreshToken = async (token) => {
    const hash   = hashToken(token);
    const result = await db.query(
        'SELECT * FROM refresh_tokens WHERE token_hash = $1 LIMIT 1',
        [hash]
    );
    return result.rows[0];
};

/**
 * Revoke a specific refresh token (on logout)
 */
const revokeRefreshToken = async (token) => {
    const hash = hashToken(token);
    await db.query(
        'UPDATE refresh_tokens SET revoked = TRUE WHERE token_hash = $1',
        [hash]
    );
};

/**
 * Revoke ALL refresh tokens for a user (on password change / security reset)
 */
const revokeAllUserTokens = async (userId) => {
    await db.query(
        'UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1',
        [userId]
    );
};

/**
 * Clean up expired tokens — call this periodically
 */
const cleanupExpiredTokens = async () => {
    const result = await db.query(
        'DELETE FROM refresh_tokens WHERE expires_at < NOW()'
    );
    return result.rowCount;
};

module.exports = {
    storeRefreshToken,
    findRefreshToken,
    revokeRefreshToken,
    revokeAllUserTokens,
    cleanupExpiredTokens,
};
