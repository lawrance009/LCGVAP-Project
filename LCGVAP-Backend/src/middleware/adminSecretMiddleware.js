/**
 * adminSecretMiddleware.js
 * ============================================================
 * Protects the admin registration endpoint.
 *
 * Two-layer protection — EITHER is sufficient to proceed:
 *
 *   LAYER 1 — Bootstrap secret (for creating the FIRST admin):
 *     Caller must include header:
 *       X-Admin-Secret: <value of ADMIN_CREATION_SECRET in .env>
 *     This allows a trusted operator to create the first admin
 *     account without any existing admin JWT.
 *
 *   LAYER 2 — Existing admin JWT:
 *     If the request already carries a valid admin Bearer token,
 *     the secret header is not required. Only admins can create
 *     other admins once the first one exists.
 *
 * If neither layer passes → 403 Forbidden.
 * ============================================================
 */

const { verifyAccessToken } = require('../utils/jwtUtils');
const db = require('../config/db');
const crypto = require('crypto');

const requireAdminSecret = async (req, res, next) => {
  // ── Layer 2: Existing master_admin JWT ──────────────────────
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token   = authHeader.split(' ')[1];
      const decoded = verifyAccessToken(token);
      if (decoded && decoded.role === 'master_admin') {
        req.user = decoded;
        return next(); // ← existing master admin — allow through
      }
    }
  } catch (_) {
    // Token invalid or expired — fall through to Layer 1 check
  }

  // ── Layer 1: Bootstrap secret header ───────────────────────
  const providedSecret = req.headers['x-admin-secret'];
  const expectedSecret = process.env.ADMIN_CREATION_SECRET;

  if (!expectedSecret) {
    console.error('CRITICAL: ADMIN_CREATION_SECRET is not set in .env');
    return res.status(503).json({ error: 'Admin registration is not configured.' });
  }

  const providedBuf = providedSecret ? Buffer.from(providedSecret, 'utf8') : null;
  const expectedBuf = Buffer.from(expectedSecret, 'utf8');
  const isSecretMatch =
    providedBuf &&
    providedBuf.length === expectedBuf.length &&
    crypto.timingSafeEqual(providedBuf, expectedBuf);

  if (!isSecretMatch) {
    return res.status(403).json({
      error: 'Forbidden: Admin registration requires a valid admin account or the admin creation secret.',
    });
  }

  // ── Cap check: max BOSS_ADMIN_MAX master_admins allowed ─────
  try {
    const max    = parseInt(process.env.BOSS_ADMIN_MAX || '3', 10);
    const result = await db.query("SELECT COUNT(*) FROM users WHERE role = 'master_admin'");
    const count  = parseInt(result.rows[0].count, 10);
    if (count >= max) {
      return res.status(403).json({
        error: `Maximum of ${max} Boss Admins already registered. Registration is closed.`,
        code:  'BOSS_ADMIN_CAP_REACHED',
      });
    }
  } catch (err) {
    console.error('Cap check failed:', err.message);
    return res.status(503).json({
      error: 'Unable to validate admin registration limits. Please try again.',
      code: 'ADMIN_CAP_CHECK_FAILED',
    });
  }

  next();
};

module.exports = requireAdminSecret;
