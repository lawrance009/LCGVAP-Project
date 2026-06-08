/**
 * schemas.js
 * ============================================================
 * Zod validation schemas for all API request bodies.
 *
 * RULE: Every route that accepts user input has a schema here.
 * The validate() middleware (validate.js) applies these schemas
 * before the request reaches any controller.
 *
 * WHY ZOD?
 *   - Catches bad input types before they hit the DB
 *   - Returns clear, structured error messages
 *   - Keeps controllers clean — no more manual `if (!field)` checks
 *   - Single source of truth for what each route accepts
 * ============================================================
 */

const { z } = require('zod');

// ── SHARED ────────────────────────────────────────────────────
const emailSchema = z.string().email('Invalid email address').toLowerCase().trim();
const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');

// ── AUTH ──────────────────────────────────────────────────────
const requestOtpSchema = z.object({
  email: emailSchema,
});

const verifyOtpSchema = z.object({
  email: emailSchema,
  otp:   z.string().length(6, 'OTP must be exactly 6 digits').regex(/^\d{6}$/, 'OTP must be numeric'),
});

const adminLoginSchema = z
  .object({
    email:        emailSchema,
    password:     z.string().optional(),
    setup_token:  z.string().optional(),
  })
  .refine((data) => Boolean(data.password || data.setup_token), {
    message: 'Password or setup token is required',
    path:    ['password'],
  });

const adminRegisterSchema = z.object({
  first_name: z.string().min(1, 'First name is required').max(100).trim(),
  last_name:  z.string().min(1, 'Last name is required').max(100).trim(),
  email:      emailSchema,
  password:   passwordSchema,
  role:       z.enum(['admin', 'master_admin']).optional(),
});

// ── USER REGISTRATION ─────────────────────────────────────────
const registerSchema = z.object({
  email:           emailSchema,
  first_name:      z.string().min(1, 'First name is required').max(100).trim(),
  last_name:       z.string().min(1, 'Last name is required').max(100).trim(),
  passport_number: z.string().min(4, 'Passport number is required').max(100).trim(),
  date_of_birth:   z.string().refine(d => !isNaN(Date.parse(d)), { message: 'Invalid date of birth' }),
  university_id:   z.coerce.number().int().positive('University ID must be a positive integer'),
  department_id:   z.coerce.number().int().positive('Department ID must be a positive integer'),
  advisor_id:      z.coerce.number().int().positive('Advisor ID must be a positive integer').optional(),
  degree_type:     z.enum(['Bachelor', 'Master', 'PhD'], {
    errorMap: () => ({ message: 'degree_type must be Bachelor, Master, or PhD' }),
  }),
  graduation_year: z.coerce.number().int().min(1950).max(new Date().getFullYear() + 1).optional(),
  bio:             z.string().max(1000).optional(),
});

// ── PROFILE UPDATE ────────────────────────────────────────────
const updateProfileSchema = z.object({
  first_name: z.string().min(1).max(100).trim().optional(),
  last_name:  z.string().min(1).max(100).trim().optional(),
  bio:        z.string().max(1000).optional(),
}).refine(data => Object.keys(data).length > 0, {
  message: 'At least one field must be provided for update',
});

// ── DEGREE SUBMISSION ─────────────────────────────────────────
const VALID_DEGREE_TYPES = ['BACHELOR', 'MASTER', 'PHD', 'POSTDOC', 'ASSOCIATE', 'DIPLOMA'];

const addDegreeSchema = z.object({
  degree_type:     z.string().transform(v => v.toUpperCase()).pipe(
    z.enum(VALID_DEGREE_TYPES, {
      errorMap: () => ({ message: `degree_type must be one of: ${VALID_DEGREE_TYPES.join(', ')}` }),
    })
  ),
  university_id:   z.coerce.number().int().positive().optional(),
  department_id:   z.coerce.number().int().positive().optional(),
  advisor_id:      z.coerce.number().int().positive().optional(),
  graduation_year: z.coerce.number().int().min(1950).max(new Date().getFullYear() + 1).optional(),
  field_of_study:  z.string().max(255).trim().optional(),
});

// ── DEGREE VERIFICATION (Admin) ───────────────────────────────
const verifyDegreeSchema = z.object({
  badge_name:        z.string().max(255).trim().optional(),
  badge_icon:        z.string().max(10).trim().optional(),
  badge_description: z.string().max(500).trim().optional(),
});

const rejectDegreeSchema = z.object({
  reason: z.string().min(10, 'Rejection reason must be at least 10 characters').max(500).trim(),
});

// ── USER REJECTION (Admin) ────────────────────────────────────
const rejectUserSchema = z.object({
  reason: z.string().min(5, 'Rejection reason is required').max(500).trim(),
});

const changeAdminPasswordSchema = z.object({
  current_password: z.string().min(1, 'Current password is required'),
  new_password: passwordSchema,
});

// ── NEWS ──────────────────────────────────────────────────────
const createNewsSchema = z.object({
  title:    z.string().min(1, 'Title is required').max(255).trim(),
  subtitle: z.string().max(255).trim().optional(),
  content:  z.string().min(1, 'Content is required'),
});

module.exports = {
  requestOtpSchema,
  verifyOtpSchema,
  adminLoginSchema,
  adminRegisterSchema,
  registerSchema,
  updateProfileSchema,
  addDegreeSchema,
  verifyDegreeSchema,
  rejectDegreeSchema,
  rejectUserSchema,
  changeAdminPasswordSchema,
  createNewsSchema,
};
