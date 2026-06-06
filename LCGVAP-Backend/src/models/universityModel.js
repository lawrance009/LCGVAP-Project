const pool = require('../config/db');

// --- Universities ---

const getAllUniversities = async () => {
    const result = await pool.query('SELECT * FROM universities ORDER BY name ASC');
    return result.rows;
};

const getFeaturedUniversities = async () => {
    const result = await pool.query(
        'SELECT id, name, acronym, logo_url, website_url, short_description, is_featured, display_order FROM universities WHERE is_featured = true ORDER BY display_order ASC'
    );
    return result.rows;
};

const getUniversityById = async (id) => {
    const result = await pool.query('SELECT * FROM universities WHERE id = $1', [id]);
    return result.rows[0];
};

const createUniversity = async (name, acronym, country, logo_url, website_url, short_description, is_featured, display_order) => {
    const query = `
        INSERT INTO universities (name, acronym, country, logo_url, website_url, short_description, is_featured, display_order)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
    `;
    const result = await pool.query(query, [name, acronym, country, logo_url, website_url, short_description, is_featured || false, display_order || 0]);
    return result.rows[0];
};

const updateUniversity = async (id, data) => {
    const updates = [];
    const values = [];
    let paramCount = 1;

    const fields = ['name', 'acronym', 'country', 'logo_url', 'website_url', 'short_description', 'is_featured', 'display_order'];
    
    fields.forEach(field => {
        if (data[field] !== undefined) {
            updates.push(`${field} = $${paramCount}`);
            values.push(data[field]);
            paramCount++;
        }
    });

    if (updates.length === 0) return null;

    values.push(id);
    const query = `UPDATE universities SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`;
    
    const result = await pool.query(query, values);
    return result.rows[0];
};

const deleteUniversity = async (id) => {
    const query = 'DELETE FROM universities WHERE id = $1 RETURNING id;';
    const result = await pool.query(query, [id]);
    return result.rowCount > 0;
};

// --- Departments ---

const getDepartmentsByUniversity = async (universityId) => {
    const query = `
    SELECT * FROM departments
    WHERE university_id = $1
    ORDER BY name ASC;
  `;
    const result = await pool.query(query, [universityId]);
    return result.rows;
};

const getDepartmentById = async (id) => {
    const result = await pool.query('SELECT * FROM departments WHERE id = $1', [id]);
    return result.rows[0];
};

// --- Advisors ---

const getAdvisorsByDepartment = async (departmentId) => {
    const query = `
      SELECT id, first_name, last_name, email 
      FROM advisors
      WHERE department_id = $1
      ORDER BY last_name ASC;
    `;
    const result = await pool.query(query, [departmentId]);
    return result.rows;
};

const getAdvisorById = async (id) => {
    const result = await pool.query('SELECT * FROM advisors WHERE id = $1', [id]);
    return result.rows[0];
};

/**
 * Validates the academic identity chain
 * Ensures: Department belongs to University
 */
const validateAcademicChain = async (universityId, departmentId) => {
    // Check if Department belongs to University
    const deptQuery = 'SELECT id FROM departments WHERE id = $1 AND university_id = $2';
    const deptResult = await pool.query(deptQuery, [departmentId, universityId]);

    if (deptResult.rows.length === 0) {
        return { valid: false, message: 'Department does not belong to the selected University' };
    }

    return { valid: true };
};

module.exports = {
    getAllUniversities,
    getFeaturedUniversities,
    getUniversityById,
    getDepartmentsByUniversity,
    getDepartmentById,
    getAdvisorsByDepartment,
    getAdvisorById,
    validateAcademicChain,
    createUniversity,
    updateUniversity,
    deleteUniversity
};
