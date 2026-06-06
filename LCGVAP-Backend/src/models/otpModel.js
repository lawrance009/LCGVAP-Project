/**
 * otpModel.js
 * ============================================================
 * SECURITY MODEL:
 *
 *   HASHING:
 *     OTPs are bcrypt-hashed before being stored.
 *     Even if someone dumps the database, they cannot see
 *     or reuse active OTP codes.
 *
 *   ATTEMPT TRACKING:
 *     Each OTP token tracks how many wrong guesses have been
 *     made against it. After MAX_ATTEMPTS (3), the token is
 *     locked. A locked token cannot be verified even if the
 *     correct code is later submitted. The user must request
 *     a fresh OTP.
 *
 *   EXPIRY:
 *     Tokens expire in 5 minutes. An attacker has 5 minutes
 *     and 3 guesses — nowhere near enough to brute-force
 *     1,000,000 possible codes.
 * ============================================================
 */

const pool    = require('../config/db');
const bcrypt  = require('bcrypt');

/** Number of wrong attempts before the OTP is permanently locked */
const MAX_ATTEMPTS = 3;

/** bcrypt cost — low (6) because OTP is 6 digits and high speed is fine here */
const OTP_HASH_ROUNDS = 6;

// ── CREATE ────────────────────────────────────────────────────
/**
 * Hash the OTP and store the hash.
 * Returns the stored record (hashed otp, not the plain code).
 *
 * @param {string} email
 * @param {string} plainOtp   - the 6-digit code we generated
 * @param {Date}   expiresAt  - 5 minutes from now
 */
const createOtp = async (email, plainOtp, expiresAt) => {
  const hashedOtp = await bcrypt.hash(plainOtp, OTP_HASH_ROUNDS);

  const query = `
    INSERT INTO otp_tokens (email, otp, expires_at, attempts, is_locked)
    VALUES ($1, $2, $3, 0, FALSE)
    RETURNING *;
  `;
  const result = await pool.query(query, [email, hashedOtp, expiresAt]);
  return result.rows[0];
};

// ── FIND ──────────────────────────────────────────────────────
/**
 * Get the most recent active, non-locked, non-expired OTP for an email.
 * Returns undefined if none found — caller must treat this as "invalid".
 */
const findLatestOtp = async (email) => {
  const query = `
    SELECT * FROM otp_tokens
    WHERE email     = $1
      AND is_used   = FALSE
      AND is_locked = FALSE
      AND expires_at > NOW()
    ORDER BY created_at DESC
    LIMIT 1;
  `;
  const result = await pool.query(query, [email]);
  return result.rows[0];
};

// ── VERIFY ────────────────────────────────────────────────────
/**
 * Compare a submitted plain OTP against the stored hash.
 *
 * @param {string} submittedOtp  - what the user typed
 * @param {string} storedHash    - bcrypt hash from DB
 * @returns {boolean}
 */
const compareOtp = async (submittedOtp, storedHash) => {
  return bcrypt.compare(submittedOtp, storedHash);
};

// ── RECORD FAILED ATTEMPT ─────────────────────────────────────
/**
 * Increment the attempt counter.
 * If attempts reach MAX_ATTEMPTS, lock the token immediately.
 *
 * @param {number} id   - otp_tokens.id
 * @returns {object}    - updated row with new attempts count and is_locked state
 */
const recordFailedAttempt = async (id) => {
  const query = `
    UPDATE otp_tokens
    SET
      attempts  = attempts + 1,
      is_locked = CASE WHEN attempts + 1 >= $2 THEN TRUE ELSE is_locked END
    WHERE id = $1
    RETURNING id, attempts, is_locked;
  `;
  const result = await pool.query(query, [id, MAX_ATTEMPTS]);
  return result.rows[0];
};

// ── MARK USED ─────────────────────────────────────────────────
/**
 * Mark token as consumed after a successful verification.
 * A used token cannot be replayed even if it has not expired.
 */
const markOtpAsUsed = async (id) => {
  const query = `
    UPDATE otp_tokens
    SET is_used = TRUE
    WHERE id = $1
    RETURNING *;
  `;
  const result = await pool.query(query, [id]);
  return result.rows[0];
};

module.exports = {
  createOtp,
  findLatestOtp,
  compareOtp,
  recordFailedAttempt,
  markOtpAsUsed,
  MAX_ATTEMPTS,
};
