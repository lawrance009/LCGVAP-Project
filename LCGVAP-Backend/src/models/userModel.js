const db = require('../config/db');

/**
 * Find a user by email
 * Used in:
 * - registration (check duplicates)
 * - OTP login
 * - authentication flow
 */
const findUserByEmail = async (email) => {
  const query = `
    SELECT *
    FROM users
    WHERE email = $1
    LIMIT 1;
  `;

  const result = await db.query(query, [email]);
  return result.rows[0]; // undefined if not found (this is intentional)
};

/**
 * Create a new user (graduate)
 * Assumes:
 * - university, department, advisor already validated
 * - email does not already exist
 */
const createUser = async (userData) => {
  const {
    first_name, last_name, email, passport_number, date_of_birth,
    university_id, department_id, advisor_id, degree_type, degree_file,
    profile_photo, bio, graduation_year, status, password_hash, role
  } = userData;

  const query = `
        INSERT INTO users (
            first_name, last_name, email, passport_number, date_of_birth,
            university_id, department_id, advisor_id, degree_type, degree_file,
            profile_photo, bio, graduation_year, status, password_hash, role
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)
        RETURNING *;
    `;

  const values = [
    first_name, last_name, email, passport_number, date_of_birth,
    university_id, department_id, advisor_id, degree_type, degree_file,
    profile_photo, bio, graduation_year, status || 'pending', password_hash || null, role || 'graduate'
  ];

  const result = await db.query(query, values);
  return result.rows[0];
};

const findAdminByEmail = async (email) => {
  const query = `
    SELECT * FROM users
    WHERE LOWER(email) = LOWER($1) AND role IN ('admin', 'master_admin')
    LIMIT 1
  `;
  const result = await db.query(query, [email]);
  return result.rows[0];
};

/**
 * Increment failed login counter; lock account for 30 min after 5 attempts
 */
const incrementAdminLoginAttempts = async (email) => {
  await db.query(`
    UPDATE users
    SET
      login_attempts = login_attempts + 1,
      locked_until   = CASE
                         WHEN login_attempts + 1 >= 3
                         THEN NOW() + INTERVAL '30 minutes'
                         ELSE locked_until
                       END
    WHERE email = $1
  `, [email]);
};

/**
 * Reset failed login counter on successful login
 */
const resetAdminLoginAttempts = async (email) => {
  await db.query(
    "UPDATE users SET login_attempts = 0, locked_until = NULL WHERE email = $1",
    [email]
  );
};

/**
 * Create an admin account — only inserts the minimal fields needed.
 * No graduate junk (passport, degree_file, university etc.)
 */
const createAdmin = async ({ first_name, last_name, email, password_hash, role }) => {
  // Admins need the NOT NULL FK columns. We use placeholder values
  // until a dedicated admins table is created in Phase 4.
  const query = `
    INSERT INTO users (
      first_name, last_name, email, password_hash, role,
      is_verified, status,
      passport_number, date_of_birth,
      university_id, department_id, advisor_id,
      degree_type, degree_file
    )
    VALUES ($1, $2, $3, $4, $5, TRUE, 'verified',
            $6, '1970-01-01', 1, 1, 1, 'PhD', 'admin_internal')
    RETURNING id, first_name, last_name, email, role, created_at;
  `;
  const result = await db.query(query, [
    first_name, last_name, email, password_hash, role,
    'ADMIN-' + Date.now()
  ]);
  return result.rows[0];
};


/**
 * Update editable profile fields
 * NOTE:
 * - DOB is NOT editable here
 * - passport_number is NOT editable
 */
const updateUserProfile = async (userId, data) => {
  const allowedColumns = new Set([
    'first_name',
    'last_name',
    'profile_photo',
    'degree_file',
    'bio',
  ]);

  const entries = Object.entries(data).filter(([key]) => allowedColumns.has(key));
  const keys = entries.map(([key]) => key);
  const values = entries.map(([, value]) => value);

  if (keys.length === 0) {
    return null;
  }

  // Build dynamic SET clause
  // e.g., "first_name = $1, last_name = $2"
  const setClause = keys.map((key, index) => `${key} = $${index + 1}`).join(', ');

  const query = `
    UPDATE users
    SET ${setClause}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${keys.length + 1}
    RETURNING *;
  `;

  // Add userId as the last parameter
  const queryValues = [...values, userId];

  const result = await db.query(query, queryValues);
  return result.rows[0];
};

/**
 * Find all verified users with optional filters
 * Used in: Public Directory
 */
const findAllVerifiedUsers = async (filters = {}) => {
  const { search, university_id, department_id, limit = 10, offset = 0 } = filters;

  let query = `
    SELECT 
      u.id, u.first_name, u.last_name, u.degree_type, u.profile_photo, u.bio,
      uni.name as university_name, 
      dept.name as department_name,
      u.created_at
    FROM users u
    LEFT JOIN universities uni ON u.university_id = uni.id
    LEFT JOIN departments dept ON u.department_id = dept.id
    WHERE u.is_verified = TRUE AND u.role = 'graduate'
  `;

  const values = [];
  let paramCount = 1;

  if (search) {
    query += ` AND (u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount})`;
    values.push(`%${search}%`);
    paramCount++;
  }

  if (university_id) {
    query += ` AND u.university_id = $${paramCount}`;
    values.push(university_id);
    paramCount++;
  }

  if (department_id) {
    query += ` AND u.department_id = $${paramCount}`;
    values.push(department_id);
    paramCount++;
  }

  query += ` ORDER BY u.created_at DESC LIMIT $${paramCount} OFFSET $${paramCount + 1}`;
  values.push(limit, offset);

  const result = await db.query(query, values);
  return result.rows;
};

/**
 * Count all verified users matching the same filters as findAllVerifiedUsers.
 * Used to build accurate pagination metadata (total / totalPages).
 */
const countAllVerifiedUsers = async (filters = {}) => {
  const { search, university_id, department_id } = filters;

  let query = `
    SELECT COUNT(*)::int AS total
    FROM users u
    WHERE u.is_verified = TRUE AND u.role = 'graduate'
  `;

  const values = [];
  let paramCount = 1;

  if (search) {
    query += ` AND (u.first_name ILIKE $${paramCount} OR u.last_name ILIKE $${paramCount})`;
    values.push(`%${search}%`);
    paramCount++;
  }

  if (university_id) {
    query += ` AND u.university_id = $${paramCount}`;
    values.push(university_id);
    paramCount++;
  }

  if (department_id) {
    query += ` AND u.department_id = $${paramCount}`;
    values.push(department_id);
    paramCount++;
  }

  const result = await db.query(query, values);
  return result.rows[0].total;
};

/**
 * Find ALL verified users with FULL details (Admin Only)
 */
const findAllVerifiedUsersAdmin = async () => {
  const query = `
    SELECT 
      u.id,
      u.first_name,
      u.last_name,
      u.email,
      u.status,
      u.is_verified,
      u.verified_at,
      u.degree_type,
      u.degree_file,
      u.profile_photo,
      u.bio,
      u.graduation_year,
      u.created_at,
      u.updated_at,
      uni.name as university_name, 
      dept.name as department_name,
      adv.first_name as advisor_first, adv.last_name as advisor_last
    FROM users u
    LEFT JOIN universities uni ON u.university_id = uni.id
    LEFT JOIN departments dept ON u.department_id = dept.id
    LEFT JOIN advisors adv ON u.advisor_id = adv.id
    WHERE u.is_verified = TRUE AND u.role = 'graduate'
    ORDER BY u.created_at DESC;
  `;
  const result = await db.query(query);
  return result.rows;
};

/**
 * Find public user details by ID
 */
const findPublicUserById = async (id) => {
  const query = `
    SELECT 
      u.id, u.first_name, u.last_name, u.degree_type, u.profile_photo, u.bio,
      uni.name as university_name, 
      dept.name as department_name,
            u.created_at,
      u.graduation_year
    FROM users u
    LEFT JOIN universities uni ON u.university_id = uni.id
    LEFT JOIN departments dept ON u.department_id = dept.id
    WHERE u.id = $1 AND u.is_verified = TRUE AND u.role = 'graduate'
  `;
  const result = await db.query(query, [id]);
  return result.rows[0];
};

/**
 * Find all pending users (unverified)
 */
const findPendingUsers = async () => {
  const query = `
    SELECT 
      u.id, u.first_name, u.last_name, u.email, u.degree_type, 
      u.degree_file, u.profile_photo,
      uni.name as university_name, 
      dept.name as department_name,
      adv.first_name as advisor_first, adv.last_name as advisor_last,
      u.created_at
    FROM users u
    LEFT JOIN universities uni ON u.university_id = uni.id
    LEFT JOIN departments dept ON u.department_id = dept.id
    LEFT JOIN advisors adv ON u.advisor_id = adv.id
    WHERE u.is_verified = FALSE AND u.role = 'graduate' AND (u.status IS NULL OR u.status = 'pending')
    ORDER BY u.created_at ASC;
  `;
  const result = await db.query(query);
  return result.rows;
};

/**
 * Verify a user
 */
const verifyUser = async (userId) => {
  const query = `
    UPDATE users
    SET is_verified = TRUE, status = 'verified', verified_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND role = 'graduate'
    RETURNING *;
  `;
  const result = await db.query(query, [userId]);
  return result.rows[0];
};

/**
 * Reject a user
 */
const rejectUser = async (userId, reason) => {
  const query = `
    UPDATE users
    SET is_verified = FALSE, status = 'rejected', rejection_reason = $2, updated_at = CURRENT_TIMESTAMP
    WHERE id = $1 AND role = 'graduate'
    RETURNING *;
  `;
  const result = await db.query(query, [userId, reason]);
  return result.rows[0];
};

const rejectAndPurgeGraduate = async (userId, reason) => {
  const client = await db.connect();
  try {
    await client.query('BEGIN');

    const targetRes = await client.query(
      `SELECT id, first_name, last_name, email, role
       FROM users
       WHERE id = $1 AND role = 'graduate'
       LIMIT 1`,
      [userId]
    );
    const target = targetRes.rows[0];
    if (!target) {
      await client.query('ROLLBACK');
      return null;
    }

    // Revoke all sessions for the rejected graduate.
    await client.query(
      `UPDATE refresh_tokens
       SET revoked = TRUE
       WHERE user_id = $1`,
      [userId]
    );

    // Delete the graduate record so they can register again with the same email/passport.
    await client.query(
      `DELETE FROM users
       WHERE id = $1 AND role = 'graduate'`,
      [userId]
    );

    await client.query('COMMIT');
    return { ...target, rejection_reason: reason };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

/**
 * Log Admin Action
 */
const logAuditEvent = async (adminId, action, targetUserId, details, ipAddress) => {
  try {
    const query = `
      INSERT INTO audit_logs (admin_id, action, target_user_id, details, ip_address)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const result = await db.query(query, [adminId, action, targetUserId, details, ipAddress]);
    return result.rows[0];
  } catch (error) {
    console.warn('Audit logging failed (table may not exist):', error.message);
    return null;
  }
};

/**
 * Find a user by ID
 */
const findUserById = async (id) => {
  const result = await db.query('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
  return result.rows[0];
};

/**
 * Delete a graduate by ID (only if role = 'graduate')
 */
const deleteGraduate = async (id) => {
  const result = await db.query(
    "DELETE FROM users WHERE id = $1 AND role = 'graduate' RETURNING id",
    [id]
  );
  return result.rows[0] || null;
};

/**
 * Delete any user by ID
 */
const deleteUserById = async (id) => {
  await db.query('DELETE FROM users WHERE id = $1', [id]);
};

/**
 * Find all regular admins (for Boss Admin management panel)
 */
const findAllAdmins = async () => {
  const result = await db.query(
    "SELECT id, first_name, last_name, email, role, created_at FROM users WHERE role = 'admin' ORDER BY created_at DESC"
  );
  return result.rows;
};

const logFileAccessEvent = async (actorId, action, targetUserId, details, ipAddress) => {
  try {
    const query = `
      INSERT INTO audit_logs (admin_id, action, target_user_id, details, ip_address)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *;
    `;
    const result = await db.query(query, [actorId || null, action, targetUserId || null, details, ipAddress || null]);
    return result.rows[0];
  } catch (error) {
    console.warn('File access audit logging failed:', error.message);
    return null;
  }
};

/**
 * Get Dashboard Stats
 */
const getDashboardStats = async () => {
  // We can do this in one query or parallel queries
  const totalQuery = 'SELECT COUNT(*) FROM users WHERE role = \'graduate\'';
  const pendingQuery = 'SELECT COUNT(*) FROM users WHERE role = \'graduate\' AND is_verified = FALSE';
  const verifiedQuery = 'SELECT COUNT(*) FROM users WHERE role = \'graduate\' AND is_verified = TRUE';
  const uniQuery = 'SELECT COUNT(*) FROM universities';
  const deptQuery = 'SELECT COUNT(*) FROM departments';

  const [totalRes, pendingRes, verifiedRes, uniRes, deptRes] = await Promise.all([
    db.query(totalQuery),
    db.query(pendingQuery),
    db.query(verifiedQuery),
    db.query(uniQuery),
    db.query(deptQuery)
  ]);

  return {
    total: parseInt(totalRes.rows[0].count),
    pending: parseInt(pendingRes.rows[0].count),
    verified: parseInt(verifiedRes.rows[0].count),
    universities: parseInt(uniRes.rows[0].count),
    departments: parseInt(deptRes.rows[0].count)
  };
};

/**
 * Get PUBLIC-safe site statistics for the homepage.
 * Exposes only non-sensitive aggregate counts (no pending/internal numbers).
 */
const getPublicStats = async () => {
  const statsQuery = `
    SELECT
      (SELECT COUNT(*) FROM users WHERE role = 'graduate' AND is_verified = TRUE)::int AS verified,
      (SELECT COUNT(*) FROM universities)::int AS universities,
      (SELECT COUNT(*) FROM departments)::int AS departments
  `;

  const result = await db.query(statsQuery);
  const row = result.rows[0] || {};

  return {
    verified: Number(row.verified || 0),
    universities: Number(row.universities || 0),
    departments: Number(row.departments || 0)
  };
};

module.exports = {
  findUserByEmail,
  findAdminByEmail,
  findUserById,
  createUser,
  createAdmin,
  updateUserProfile,
  findAllVerifiedUsers,
  countAllVerifiedUsers,
  findAllVerifiedUsersAdmin,
  findPublicUserById,
  findPendingUsers,
  verifyUser,
  rejectUser,
  rejectAndPurgeGraduate,
  deleteGraduate,
  deleteUserById,
  findAllAdmins,
  incrementAdminLoginAttempts,
  resetAdminLoginAttempts,
  logAuditEvent,
  logFileAccessEvent,
  getDashboardStats,
  getPublicStats
};
