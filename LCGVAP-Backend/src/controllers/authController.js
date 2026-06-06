/**
 * authController.js
 * ============================================================
 * SECURITY CHANGES IN THIS VERSION:
 *
 *  1. OTP expiry:    5 minutes (was 10)
 *  2. OTP attempts:  3 max → auto-lock after 3rd wrong guess
 *  3. OTP storage:   hashed with bcrypt (compareOtp used)
 *  4. JWT:           access token (10 min) + refresh token (7 day cookie)
 *  5. Refresh route: POST /auth/token/refresh — reads HttpOnly cookie
 *  6. Logout route:  POST /auth/logout — clears the cookie
 *  7. Admin reg:     protected by adminSecretMiddleware (added in routes)
 * ============================================================
 */

const otpModel          = require('../models/otpModel');
const userModel         = require('../models/userModel');
const refreshTokenModel = require('../models/refreshTokenModel');
const universityModel   = require('../models/universityModel');
const emailService      = require('../utils/emailService');
const jwtUtils          = require('../utils/jwtUtils');
const { sanitizeUserForClient } = require('../utils/sanitizeUser');
const bcrypt            = require('bcrypt');
const fs                = require('fs');
const { validateMagicBytes } = require('../middleware/uploadMiddleware');

// ── Helpers ───────────────────────────────────────────────────
const generateOtpCode = () =>
  Math.floor(100000 + Math.random() * 900000).toString();

/**
 * Build the standard token pair and set the refresh cookie.
 * Call this whenever we want to log a user in.
 */
const issueTokens = async (res, userPayload) => {
  const accessToken  = jwtUtils.generateAccessToken(userPayload);
  const refreshToken = jwtUtils.generateRefreshToken(userPayload);

  // Store hash of refresh token for revocation support
  await refreshTokenModel.storeRefreshToken(userPayload.id, refreshToken);

  // Set refresh token as HttpOnly cookie — JS cannot read this
  res.cookie('lcgvap_refresh', refreshToken, jwtUtils.REFRESH_COOKIE_OPTIONS);

  return accessToken;
};

// ── REQUEST OTP ───────────────────────────────────────────────
/**
 * POST /auth/otp/request
 * Validated by: requestOtpSchema (Zod — email format enforced)
 *
 * Generates a 6-digit OTP, hashes it, stores it,
 * and sends it to the user's email.
 * Expiry: 5 minutes (was 10).
 */
const requestOtp = async (req, res, next) => {
  try {
    const { email } = req.body; // already validated by Zod

    // ── Phase 3 Strict Logic ────────────────────────────────────
    const user = await userModel.findUserByEmail(email);

    // Rule 1: Must be Registered
    if (!user) {
      return res.status(404).json({ 
        error: 'Email not found in our records. Please register first.',
        code: 'NOT_FOUND'
      });
    }

    // STRICT ADMIN SEPARATION: Admins cannot use the OTP flow
    if (user.role === 'admin' || user.role === 'master_admin') {
      return res.status(403).json({ error: 'Admins cannot use the user login portal. Please use the patron entry.' });
    }

    // Rule 2: Must be Verified
    if (!user.is_verified) {
      return res.status(403).json({
        error: 'Your account is still pending verification by the administration. You will receive an email once approved.',
        code: 'PENDING_VERIFICATION'
      });
    }

    // Rule 3: Success — Generate and send OTP
    const plainOtp  = generateOtpCode();
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // ← 5 minutes

    // otpModel.createOtp will bcrypt-hash plainOtp before storing
    await otpModel.createOtp(email, plainOtp, expiresAt);

    const userName = user.first_name || 'Graduate';

    // Send the PLAIN OTP by email
    await emailService.sendOtpEmail(email, userName, plainOtp, 5);

    // IMPORTANT: do NOT return the OTP in the response
    res.status(200).json({ message: 'OTP sent to your email. It expires in 5 minutes.' });
  } catch (error) {
    next(error);
  }
};

// ── VERIFY OTP ────────────────────────────────────────────────
/**
 * POST /auth/otp/verify
 * Validated by: verifyOtpSchema
 *
 * Security flow:
 *  1. Find latest active, non-locked, non-expired OTP for email
 *  2. Compare submitted code with stored bcrypt hash
 *  3. On WRONG code → increment attempts → lock if ≥ 3
 *  4. On CORRECT code → mark used → issue access + refresh tokens
 */
const verifyOtp = async (req, res, next) => {
  try {
    const { email, otp: submittedOtp } = req.body;

    // ── Step 1: Find token ──────────────────────────────────
    const otpRecord = await otpModel.findLatestOtp(email);

    if (!otpRecord) {
      // Either expired, locked, or never requested
      return res.status(400).json({
        error: 'Invalid or expired OTP. Please request a new code.',
        code:  'OTP_INVALID',
      });
    }

    // ── Step 2: Compare (timing-safe bcrypt compare) ────────
    const isMatch = await otpModel.compareOtp(submittedOtp, otpRecord.otp);

    if (!isMatch) {
      // ── Step 3: Record failed attempt ───────────────────
      const updated = await otpModel.recordFailedAttempt(otpRecord.id);
      const remaining = otpModel.MAX_ATTEMPTS - updated.attempts;

      if (updated.is_locked) {
        return res.status(429).json({
          error: 'Too many incorrect attempts. This OTP has been locked. Please request a new code.',
          code:  'OTP_LOCKED',
        });
      }

      return res.status(400).json({
        error: `Incorrect OTP. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.`,
        code:  'OTP_WRONG',
        attempts_remaining: remaining,
      });
    }

    // ── Step 4: Correct — mark as used ──────────────────────
    await otpModel.markOtpAsUsed(otpRecord.id);

    // Check if user exists
    const user      = await userModel.findUserByEmail(email);
    
    // STRICT ADMIN SEPARATION: Block admin login via OTP
    if (user && (user.role === 'admin' || user.role === 'master_admin')) {
      return res.status(403).json({ error: 'Admins cannot use the user login portal. Please use the patron entry.' });
    }
    if (!user || !user.is_verified || user.role !== 'graduate') {
      return res.status(403).json({
        error: 'Only verified graduate accounts can use OTP login.',
        code: 'OTP_ROLE_NOT_ALLOWED'
      });
    }
    
    const isNewUser = !user;

    const payload = {
      email,
      id:          user ? user.id   : null,
      is_verified: user ? user.is_verified : false,
      role:        user ? (user.role || 'graduate') : 'graduate',
    };

    // ── Issue dual tokens ────────────────────────────────────
    const accessToken = await issueTokens(res, payload);

    res.status(200).json({
      message:    'Authentication successful',
      token:      accessToken,  // Short-lived, use in Authorization header
      user:       sanitizeUserForClient(user),
      isNewUser,
      expires_in: '10m',
    });
  } catch (error) {
    next(error);
  }
};

// ── REFRESH ACCESS TOKEN ──────────────────────────────────────
/**
 * POST /auth/token/refresh
 * No body needed — reads the HttpOnly cookie.
 *
 * If the refresh token is valid → issue a new access token.
 * If it's expired/invalid → 401 (user must log in again).
 */
const refreshAccessToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies?.lcgvap_refresh;

    if (!refreshToken) {
      return res.status(401).json({
        error: 'No refresh token. Please log in.',
        code:  'NO_REFRESH_TOKEN',
      });
    }

    // Verify the token is valid (signature + expiry)
    const decoded = jwtUtils.verifyRefreshToken(refreshToken);

    // Check it exists in DB and is not revoked/expired
    const storedToken = await refreshTokenModel.findRefreshToken(refreshToken);
    const now = new Date();
    const tokenExpired = storedToken?.expires_at && new Date(storedToken.expires_at) < now;
    if (!storedToken || storedToken.revoked || tokenExpired) {
      res.clearCookie('lcgvap_refresh', jwtUtils.REFRESH_COOKIE_CLEAR_OPTIONS);
      return res.status(401).json({
        error: 'Session has expired or been revoked. Please log in again.',
        code:  'TOKEN_INVALID',
      });
    }

    // Confirm the user still exists
    const user = await userModel.findUserByEmail(decoded.email);
    if (!user) {
      res.clearCookie('lcgvap_refresh', jwtUtils.REFRESH_COOKIE_CLEAR_OPTIONS);
      return res.status(401).json({ error: 'User not found. Please log in again.' });
    }
    if (user.role === 'graduate' && !user.is_verified) {
      res.clearCookie('lcgvap_refresh', jwtUtils.REFRESH_COOKIE_CLEAR_OPTIONS);
      return res.status(403).json({
        error: 'Account is not verified. Please contact administration.',
        code: 'ACCOUNT_NOT_VERIFIED'
      });
    }

    const payload = {
      email:       user.email,
      id:          user.id,
      is_verified: user.is_verified,
      role:        user.role || 'graduate',
    };

    const newAccessToken = jwtUtils.generateAccessToken(payload);

    res.status(200).json({
      token:      newAccessToken,
      expires_in: '10m',
    });
  } catch (error) {
    next(error);
  }
};

// ── LOGOUT ───────────────────────────────────────────────────

const logout = async (req, res) => {
  const refreshToken = req.cookies?.lcgvap_refresh;
  // Revoke the token in DB so it can never be reused
  if (refreshToken) {
    try { await refreshTokenModel.revokeRefreshToken(refreshToken); } catch (_) {}
  }
  res.clearCookie('lcgvap_refresh', jwtUtils.REFRESH_COOKIE_CLEAR_OPTIONS);
  res.status(200).json({ message: 'Logged out successfully.' });
};

// ── ADMIN LOGIN ───────────────────────────────────────────────
const loginAdmin = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findAdminByEmail(email);
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Check if account is locked
    if (user.locked_until && new Date(user.locked_until) > new Date()) {
      const minutesLeft = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
      return res.status(423).json({
        error: `Account locked due to too many failed attempts. Try again in ${minutesLeft} minute(s).`,
        code:  'ACCOUNT_LOCKED',
        locked_until: user.locked_until,
      });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      // Record the failed attempt
      await userModel.incrementAdminLoginAttempts(email);
      
      const attemptsLeft = Math.max(0, 2 - (user.login_attempts || 0));

      return res.status(401).json({ 
        error: attemptsLeft > 0 
          ? `Invalid credentials. ${attemptsLeft} attempt(s) remaining before lockout.`
          : 'Account locked for 30 minutes due to too many failed attempts.',
        code: 'AUTH_FAILED'
      });
    }

    // Success — clear lockout counter
    await userModel.resetAdminLoginAttempts(email);

    // Use the real role from the DB (admin or master_admin)
    const payload = { email: user.email, id: user.id, role: user.role };
    const accessToken = await issueTokens(res, payload);

    delete user.password_hash;
    delete user.passport_number;
    delete user.date_of_birth;

    res.status(200).json({
      message:    'Admin login successful',
      token:      accessToken,
      user,
      expires_in: '10m',
    });
  } catch (error) {
    next(error);
  }
};

// ── ADMIN REGISTER ────────────────────────────────────────────
/**
 * POST /auth/admin/register
 * Protected by: adminSecretMiddleware (requires X-Admin-Secret header
 * or existing admin JWT — see authRoutes.js)
 * Validated by: adminRegisterSchema
 */
const registerAdmin = async (req, res, next) => {
  try {
    const { first_name, last_name, email, password } = req.body;

    // ── Determine what role the new account should get ──────────
    // If the caller is already a master_admin (Layer 2 JWT), they
    // can create either 'admin' or 'master_admin' — default is 'admin'.
    // If the caller used the bootstrap secret (Layer 1), they always
    // get 'master_admin' — this is the initial Boss Admin bootstrap.
    let assignedRole;
    if (req.user && req.user.role === 'master_admin') {
      // Existing boss admin is creating another account.
      // Allow them to pass a role in the body, default to 'admin'.
      assignedRole = req.body.role === 'master_admin' ? 'master_admin' : 'admin';
    } else {
      // Bootstrap via secret header — this person becomes a boss.
      assignedRole = 'master_admin';
    }

    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    const password_hash = await bcrypt.hash(password, 12);

    const newUser = await userModel.createAdmin({
      first_name,
      last_name,
      email,
      password_hash,
      role: assignedRole,
    });


    // Don't issue a token here — the new admin must log in themselves
    res.status(201).json({
      message: `${assignedRole === 'master_admin' ? 'Boss Admin' : 'Admin'} account created successfully. Share credentials with the new admin so they can log in.`,
      user:    newUser,
    });
  } catch (error) {
    if (error.code === '23505') {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    next(error);
  }
};

// ── GRADUATE REGISTER ─────────────────────────────────────────
/**
 * POST /auth/register
 * Validated by: registerSchema
 */
const register = async (req, res, next) => {
  try {
    const {
      email, passport_number, university_id, department_id, advisor_id,
      degree_type, graduation_year
    } = req.body;

    // Handle file uploads (Multer populates req.files)
    let degree_file   = null;
    let profile_photo = null;

    if (req.files) {
      if (req.files['degree_file'])   degree_file   = `${req.app.locals.baseUrl}/private/${req.files['degree_file'][0].filename}`;
      if (req.files['profile_photo']) profile_photo = `${req.app.locals.baseUrl}/uploads/${req.files['profile_photo'][0].filename}`;
    }

    if (!degree_file) {
      return res.status(400).json({ error: 'Degree document is required.' });
    }

    // Magic bytes validation — confirm file contents match the claimed type
    if (req.files['degree_file']) {
      const f = req.files['degree_file'][0];
      if (!validateMagicBytes(f.path, f.mimetype)) {
        fs.unlinkSync(f.path); // delete the suspicious file
        return res.status(400).json({ error: 'Degree file content does not match its extension. Please upload a genuine PDF.' });
      }
    }
    if (req.files['profile_photo']) {
      const f = req.files['profile_photo'][0];
      if (!validateMagicBytes(f.path, f.mimetype)) {
        fs.unlinkSync(f.path);
        return res.status(400).json({ error: 'Profile photo content does not match its extension. Please upload a genuine image.' });
      }
    }

    // Validate academic chain integrity (Uni → Dept)
    const chainValidation = await universityModel.validateAcademicChain(
      university_id, department_id
    );
    if (!chainValidation.valid) {
      return res.status(400).json({ error: chainValidation.message });
    }

    // Advisor is no longer required at registration time.
    // Keep DB compatibility by falling back to a neutral advisor slot.
    const resolvedAdvisorId = advisor_id || 1;

    // Prevent duplicate email
    const existingUser = await userModel.findUserByEmail(email);
    if (existingUser) {
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }

    // Create the user
    const newUser = await userModel.createUser({
      ...req.body,
      advisor_id: resolvedAdvisorId,
      degree_file,
      profile_photo,
      status: 'pending',
    });

    // Acknowledgement email
    await emailService.sendRegistrationAckEmail(
      newUser.email,
      `${newUser.first_name} ${newUser.last_name}`
    );

    delete newUser.password_hash;
    delete newUser.passport_number;
    delete newUser.date_of_birth;

    res.status(201).json({
      message:    'Registration successful. Your credentials are under review.',
      user:       newUser,
    });
  } catch (error) {
    if (error.code === '23505') {
      if (error.detail?.includes('passport_number')) {
        return res.status(409).json({ error: 'This passport number is already registered.' });
      }
      return res.status(409).json({ error: 'An account with this email already exists.' });
    }
    next(error);
  }
};

// ── ADMIN REGISTRATION STATUS ────────────────────────────────
/**
 * GET /auth/admin/registration-status
 * Returns whether Boss Admin registration is still open.
 * Open = current master_admin count < BOSS_ADMIN_MAX (default 3)
 */
const adminRegistrationStatus = async (req, res, next) => {
  try {
    const max    = parseInt(process.env.BOSS_ADMIN_MAX || '3', 10);
    const result = await require('../config/db').query(
      "SELECT COUNT(*) FROM users WHERE role = 'master_admin'"
    );
    const count  = parseInt(result.rows[0].count, 10);
    res.json({
      open:   count < max,
      count,
      max,
      reason: count >= max ? `Maximum of ${max} Boss Admins already registered.` : null,
    });
  } catch (error) {
    next(error);
  }
};

// ── ADMIN CHANGE PASSWORD ─────────────────────────────────────
/**
 * PUT /auth/admin/change-password
 * Requires: authenticate + isAdmin middleware
 */
const changeAdminPassword = async (req, res, next) => {
  try {
    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'current_password and new_password are required.' });
    }
    if (new_password.length < 8) {
      return res.status(400).json({ error: 'New password must be at least 8 characters.' });
    }

    const user = await userModel.findAdminByEmail(req.user.email);
    if (!user) return res.status(404).json({ error: 'Admin not found.' });

    const isMatch = await bcrypt.compare(current_password, user.password_hash);
    if (!isMatch) return res.status(401).json({ error: 'Current password is incorrect.' });

    const new_hash = await bcrypt.hash(new_password, 12);
    await require('../config/db').query(
      'UPDATE users SET password_hash = $1 WHERE id = $2',
      [new_hash, user.id]
    );

    // Revoke all existing refresh tokens — force re-login on all devices
    await refreshTokenModel.revokeAllUserTokens(user.id);
    res.clearCookie('lcgvap_refresh', jwtUtils.REFRESH_COOKIE_CLEAR_OPTIONS);

    res.json({ message: 'Password changed successfully. Please log in again.' });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  requestOtp,
  verifyOtp,
  refreshAccessToken,
  logout,
  loginAdmin,
  registerAdmin,
  register,
  adminRegistrationStatus,
  changeAdminPassword,
};
