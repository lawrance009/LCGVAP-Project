/**
 * jwtUtils.js
 * ============================================================
 * Dual-token JWT system:
 *
 *   ACCESS TOKEN
 *   - Signed with JWT_ACCESS_SECRET
 *   - Short-lived: 10 minutes
 *   - Sent in response body, stored in memory (not localStorage)
 *   - Used on every authenticated API request
 *
 *   REFRESH TOKEN
 *   - Signed with JWT_REFRESH_SECRET (DIFFERENT secret)
 *   - Long-lived: 7 days
 *   - Set as HttpOnly, Secure, SameSite=Strict cookie
 *   - JavaScript CANNOT read it — XSS-proof
 *   - Used ONLY to silently obtain a new access token
 *
 * WHY TWO SECRETS?
 *   If only one secret is used, a stolen access token could be
 *   used to forge a refresh token (or vice versa). Two separate
 *   secrets mean a leaked access token cannot be escalated.
 * ============================================================
 */

const jwt = require('jsonwebtoken');

// ── Helpers ──────────────────────────────────────────────────
const getSecret = (key) => {
  const secret = process.env[key];
  if (!secret) {
    throw new Error(`Missing environment variable: ${key}. Check your .env file.`);
  }
  return secret;
};

// ── Access Token (10 min) ─────────────────────────────────────
const generateAccessToken = (payload) => {
  return jwt.sign(payload, getSecret('JWT_ACCESS_SECRET'), {
    expiresIn: process.env.JWT_ACCESS_EXPIRES || '10m',
  });
};

const verifyAccessToken = (token) => {
  try {
    return jwt.verify(token, getSecret('JWT_ACCESS_SECRET'));
  } catch (err) {
    // Distinguish expired vs invalid — helps frontend decide whether to refresh
    if (err.name === 'TokenExpiredError') {
      const e = new Error('Access token expired');
      e.code  = 'TOKEN_EXPIRED';
      throw e;
    }
    const e = new Error('Invalid access token');
    e.code = 'TOKEN_INVALID';
    throw e;
  }
};

// ── Refresh Token (7 days) ────────────────────────────────────
const generateRefreshToken = (payload) => {
  // Only embed the minimum — id + role. No sensitive data in cookie.
  const minimalPayload = { id: payload.id, role: payload.role, email: payload.email };
  return jwt.sign(minimalPayload, getSecret('JWT_REFRESH_SECRET'), {
    expiresIn: process.env.JWT_REFRESH_EXPIRES || '7d',
  });
};

const verifyRefreshToken = (token) => {
  try {
    return jwt.verify(token, getSecret('JWT_REFRESH_SECRET'));
  } catch (err) {
    const e = new Error('Refresh token invalid or expired. Please log in again.');
    e.code = 'REFRESH_INVALID';
    throw e;
  }
};

// ── Cookie options for the refresh token ─────────────────────
// These settings make the cookie as secure as possible:
//   httpOnly  → JS cannot read it (XSS-proof)
//   secure    → only sent over HTTPS (in production)
//   sameSite  → not sent on cross-site requests (CSRF-proof)
//   maxAge    → 7 days in milliseconds
// Cross-origin deploy (e.g. Netlify frontend + Railway API) needs sameSite: 'none'
// so the HttpOnly refresh cookie is sent on API requests (withCredentials).
const refreshSameSite = process.env.NODE_ENV === 'production' ? 'none' : 'lax';

const REFRESH_COOKIE_OPTIONS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: refreshSameSite,
  maxAge:   7 * 24 * 60 * 60 * 1000, // 7 days in ms
  path:     '/',     // send on all requests so refresh endpoint receives it reliably
};

// Used to clear the cookie on logout
const REFRESH_COOKIE_CLEAR_OPTIONS = {
  httpOnly: true,
  secure:   process.env.NODE_ENV === 'production',
  sameSite: refreshSameSite,
  path:     '/',
};

module.exports = {
  generateAccessToken,
  verifyAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
  REFRESH_COOKIE_OPTIONS,
  REFRESH_COOKIE_CLEAR_OPTIONS,
};
