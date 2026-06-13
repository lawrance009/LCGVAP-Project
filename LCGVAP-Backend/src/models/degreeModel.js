/**
 * degreeModel.js
 * ---------------------------------------------------------------
 * Data-access layer for the `degrees` and `badges` tables.
 *
 * DESIGN PRINCIPLE:
 *   - Badges belong to degrees, NOT directly to users.
 *   - A degree becomes "badged" when an admin verifies it.
 *   - Badge data is always fetched via the degree it belongs to.
 * ---------------------------------------------------------------
 */

const pool = require('../config/db');

// ---------------------------------------------------------------
// BADGE ICON / NAME DEFAULTS
// When an admin verifies a degree without specifying badge info,
// we auto-assign sensible defaults from this map.
// ---------------------------------------------------------------
const DEGREE_BADGE_DEFAULTS = {
  BACHELOR: { name: "Bachelor Graduate",    icon: "🎓" },
  MASTER:   { name: "Master's Scholar",     icon: "🥇" },
  PHD:      { name: "Doctor of Philosophy", icon: "🏆" },
  POSTDOC:  { name: "Post-Doctoral Fellow", icon: "🔬" },
  ASSOCIATE:{ name: "Associate Graduate",   icon: "📜" },
  DIPLOMA:  { name: "Diploma Holder",       icon: "📋" },
};

const computeIsPremiumVeteran = (degreeTypes = []) => {
  const types = new Set(
    (Array.isArray(degreeTypes) ? degreeTypes : []).map((t) => String(t).toUpperCase())
  );
  return types.has('BACHELOR') && types.has('MASTER');
};

// ---------------------------------------------------------------
// CREATE DEGREE
// Called when a user submits a new credential for review.
// ---------------------------------------------------------------
const createDegree = async (degreeData) => {
  const {
    user_id, degree_type, university_id, department_id, advisor_id,
    graduation_year, field_of_study, degree_file
  } = degreeData;

  const query = `
    INSERT INTO degrees (
      user_id, degree_type, university_id, department_id, advisor_id,
      graduation_year, field_of_study, degree_file
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
    RETURNING *;
  `;

  const values = [
    user_id, degree_type.toUpperCase(), university_id, department_id, advisor_id,
    graduation_year, field_of_study, degree_file
  ];

  const result = await pool.query(query, values);
  return result.rows[0];
};

// ---------------------------------------------------------------
// GET DEGREES FOR A USER (with badges joined)
// Returns each degree with its badge (if verified).
// Used by: ProfilePage, PublicProfilePage
// ---------------------------------------------------------------
const getDegreesByUserId = async (userId) => {
  const query = `
    SELECT
      d.id,
      d.user_id,
      d.degree_type,
      d.graduation_year,
      d.field_of_study,
      d.degree_file,
      d.is_verified,
      d.verified_at,
      d.rejection_reason,
      d.created_at,
      uni.name  AS university_name,
      uni.country AS university_country,
      dept.name AS department_name,
      CASE
        WHEN d.is_verified = TRUE THEN
          json_build_object(
            'id',          b.id,
            'name',        b.name,
            'icon',        b.icon,
            'description', b.description,
            'awarded_at',  b.awarded_at
          )
        ELSE NULL
      END AS badge
    FROM degrees d
    LEFT JOIN universities uni  ON d.university_id = uni.id
    LEFT JOIN departments  dept ON d.department_id  = dept.id
    LEFT JOIN badges       b    ON b.degree_id      = d.id
    WHERE d.user_id = $1
    ORDER BY d.graduation_year DESC NULLS LAST, d.created_at DESC;
  `;

  const result = await pool.query(query, [userId]);
  return result.rows;
};

// ---------------------------------------------------------------
// GET SINGLE DEGREE BY ID
// ---------------------------------------------------------------
const getDegreeById = async (degreeId) => {
  const query = `
    SELECT
      d.*,
      uni.name  AS university_name,
      dept.name AS department_name,
      b.id        AS badge_id,
      b.name      AS badge_name,
      b.icon      AS badge_icon,
      b.description AS badge_description
    FROM degrees d
    LEFT JOIN universities uni  ON d.university_id = uni.id
    LEFT JOIN departments  dept ON d.department_id  = dept.id
    LEFT JOIN badges       b    ON b.degree_id      = d.id
    WHERE d.id = $1;
  `;
  const result = await pool.query(query, [degreeId]);
  return result.rows[0];
};

// ---------------------------------------------------------------
// VERIFY DEGREE (Admin)
// Sets is_verified = TRUE and auto-creates a badge for the degree.
// Badge name/icon are auto-assigned from DEGREE_BADGE_DEFAULTS
// unless the admin provides custom values.
// ---------------------------------------------------------------
const verifyDegree = async (degreeId, adminId, badgeOverride = {}) => {
  const client = await pool.connect(); // Use transaction

  try {
    await client.query('BEGIN');

    // 1. Mark degree as verified (only pending submissions)
    const degreeResult = await client.query(
      `UPDATE degrees
       SET is_verified = TRUE, verified_at = CURRENT_TIMESTAMP, verified_by = $2,
           rejection_reason = NULL, updated_at = CURRENT_TIMESTAMP
       WHERE id = $1
         AND is_verified = FALSE
         AND rejection_reason IS NULL
       RETURNING *;`,
      [degreeId, adminId]
    );
    const degree = degreeResult.rows[0];

    if (!degree) {
      await client.query('ROLLBACK');
      return null;
    }

    // 2. Determine badge attributes
    const defaults = DEGREE_BADGE_DEFAULTS[degree.degree_type] || {
      name: `${degree.degree_type} Graduate`,
      icon: "🎓"
    };

    const badgeName = badgeOverride.name || defaults.name;
    const badgeIcon = badgeOverride.icon || defaults.icon;
    const badgeDesc = badgeOverride.description || `Verified ${degree.degree_type.toLowerCase()} credential`;

    // 3. Upsert badge (ON CONFLICT since degree_id is UNIQUE in badges)
    const badgeResult = await client.query(
      `INSERT INTO badges (degree_id, name, icon, description)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (degree_id) DO UPDATE
         SET name = EXCLUDED.name,
             icon = EXCLUDED.icon,
             description = EXCLUDED.description,
             awarded_at = CURRENT_TIMESTAMP
       RETURNING *;`,
      [degreeId, badgeName, badgeIcon, badgeDesc]
    );

    await client.query('COMMIT');
    return { degree, badge: badgeResult.rows[0] };
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
};

// ---------------------------------------------------------------
// REJECT DEGREE (Admin)
// ---------------------------------------------------------------
const rejectDegree = async (degreeId, adminId, reason) => {
  const query = `
    UPDATE degrees
    SET is_verified = FALSE, rejection_reason = $2, verified_by = $3,
        updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING *;
  `;
  const result = await pool.query(query, [degreeId, reason, adminId]);
  return result.rows[0];
};

// ---------------------------------------------------------------
// GET ALL PENDING DEGREES (Admin)
// ---------------------------------------------------------------
const getPendingDegrees = async () => {
  const query = `
    SELECT
      d.id, d.user_id, d.degree_type, d.graduation_year,
      d.degree_file, d.field_of_study, d.created_at,
      u.first_name, u.last_name, u.email,
      uni.name AS university_name,
      dept.name AS department_name
    FROM degrees d
    JOIN users        u    ON d.user_id       = u.id
    LEFT JOIN universities uni  ON d.university_id = uni.id
    LEFT JOIN departments  dept ON d.department_id  = dept.id
    WHERE d.is_verified = FALSE AND d.rejection_reason IS NULL
    ORDER BY d.created_at ASC;
  `;
  const result = await pool.query(query);
  return result.rows;
};

// ---------------------------------------------------------------
// UPDATE DEGREE (user can update unverified degrees)
// ---------------------------------------------------------------
const updateDegree = async (degreeId, userId, updates) => {
  const allowed = ['graduation_year', 'field_of_study', 'degree_file', 'university_id', 'department_id', 'advisor_id'];
  const filtered = Object.fromEntries(
    Object.entries(updates).filter(([k]) => allowed.includes(k))
  );

  if (Object.keys(filtered).length === 0) return null;

  const keys = Object.keys(filtered);
  const values = Object.values(filtered);
  const setClause = keys.map((k, i) => `${k} = $${i + 1}`).join(', ');

  const query = `
    UPDATE degrees
    SET ${setClause}, updated_at = CURRENT_TIMESTAMP
    WHERE id = $${keys.length + 1} AND user_id = $${keys.length + 2} AND is_verified = FALSE
    RETURNING *;
  `;

  const result = await pool.query(query, [...values, degreeId, userId]);
  return result.rows[0];
};

// ---------------------------------------------------------------
// DELETE DEGREE (only if not verified)
// ---------------------------------------------------------------
const deleteDegree = async (degreeId, userId) => {
  const query = `
    DELETE FROM degrees
    WHERE id = $1 AND user_id = $2 AND is_verified = FALSE
    RETURNING *;
  `;
  const result = await pool.query(query, [degreeId, userId]);
  return result.rows[0];
};

// ---------------------------------------------------------------
// BADGE DEFAULTS export (used by controller for docs)
// ---------------------------------------------------------------
module.exports = {
  createDegree,
  getDegreesByUserId,
  getDegreeById,
  verifyDegree,
  rejectDegree,
  getPendingDegrees,
  updateDegree,
  deleteDegree,
  DEGREE_BADGE_DEFAULTS,
  computeIsPremiumVeteran,
};
