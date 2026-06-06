/**
 * authRoutes.js
 * ============================================================
 * All authentication routes.
 * Each route is protected by:
 *   1. Rate limiter (defined in app.js)
 *   2. Zod schema validation (via validate middleware)
 *   3. Admin secret guard (on admin register only)
 * ============================================================
 */

const express            = require('express');
const router             = express.Router();
const authController     = require('../controllers/authController');
const upload             = require('../middleware/uploadMiddleware');
const validate           = require('../middleware/validate');
const requireAdminSecret = require('../middleware/adminSecretMiddleware');
const authenticate       = require('../middleware/authMiddleware');
const isAdmin            = require('../middleware/adminMiddleware');

const {
  requestOtpSchema,
  verifyOtpSchema,
  adminLoginSchema,
  adminRegisterSchema,
  registerSchema,
  changeAdminPasswordSchema,
} = require('../validation/schemas');

// ── OTP Flow ──────────────────────────────────────────────────
router.post(
  '/otp/request',
  validate(requestOtpSchema),
  authController.requestOtp
);

router.post(
  '/otp/verify',
  validate(verifyOtpSchema),
  authController.verifyOtp
);

// ── Token Refresh & Logout ────────────────────────────────────
// Reads the HttpOnly cookie — no body or auth header needed
router.post('/token/refresh', authController.refreshAccessToken);
router.post('/logout',        authController.logout);

// ── Admin Auth ────────────────────────────────────────────────
router.post(
  '/admin/register',
  requireAdminSecret,           // ← Must provide X-Admin-Secret or existing admin JWT
  validate(adminRegisterSchema),
  authController.registerAdmin
);

router.post(
  '/admin/login',
  validate(adminLoginSchema),
  authController.loginAdmin
);

// ── Admin Registration Status (public — checked by /boss-entry page on load) ──
router.get('/admin/registration-status', authController.adminRegistrationStatus);

// ── Admin Change Password (requires active admin session) ────
router.put(
  '/admin/change-password',
  authenticate,
  isAdmin,
  validate(changeAdminPasswordSchema),
  authController.changeAdminPassword
);

// ── Graduate Registration ─────────────────────────────────────
router.post(
  '/register',
  upload.fields([
    { name: 'degree_file',   maxCount: 1 },
    { name: 'profile_photo', maxCount: 1 },
  ]),
  upload.optimizeImages,
  validate(registerSchema),
  authController.register
);

module.exports = router;
