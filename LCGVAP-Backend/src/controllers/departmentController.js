const pool = require('../config/db');

// Model Logic (Inline for simplicity or consistency with separate model file pattern)
// Ideally we should move this to a departmentModel.js, but userController is doing mixed things. 
// Let's create departmentModel first or use pool here.
// Going with direct pool usage for speed, refactor later if needed.

const normalizeName = (name = '') => String(name).trim().replace(/\s+/g, ' ');

const normalizeUniversityId = (value) => {
    if (value === undefined || value === null || value === '') return null;

    const parsed = Number(value);
    if (!Number.isInteger(parsed) || parsed <= 0) return NaN;
    return parsed;
};

const findOverlappingDepartment = async (name, universityId, excludeId = null) => {
    const values = [name, universityId];
    let excludeClause = '';

    if (excludeId) {
        values.push(excludeId);
        excludeClause = `AND d.id <> $${values.length}`;
    }

    const result = await pool.query(
        `
        SELECT d.*, u.name AS university_name
        FROM departments d
        LEFT JOIN universities u ON d.university_id = u.id
        WHERE LOWER(TRIM(d.name)) = LOWER(TRIM($1))
          ${excludeClause}
          AND (
            $2::int IS NULL
            OR d.university_id IS NULL
            OR d.university_id = $2::int
          )
        ORDER BY d.university_id NULLS FIRST, d.name ASC
        LIMIT 1
        `,
        values
    );

    return result.rows[0];
};

const getDepartmentReferenceCounts = async (client, departmentId) => {
    const result = await client.query(
        `
        SELECT
            (SELECT COUNT(*)::int FROM users WHERE department_id = $1) AS users,
            (SELECT COUNT(*)::int FROM degrees WHERE department_id = $1) AS degrees,
            (SELECT COUNT(*)::int FROM advisors WHERE department_id = $1) AS advisors
        `,
        [departmentId]
    );

    const counts = result.rows[0] || {};
    return {
        users: Number(counts.users || 0),
        degrees: Number(counts.degrees || 0),
        advisors: Number(counts.advisors || 0),
    };
};

const totalReferenceCount = (counts) => counts.users + counts.degrees + counts.advisors;

const findGlobalDepartmentByName = async (client, name, excludeId) => {
    const result = await client.query(
        `
        SELECT *
        FROM departments
        WHERE university_id IS NULL
          AND LOWER(TRIM(name)) = LOWER(TRIM($1))
          AND id <> $2
        ORDER BY id ASC
        LIMIT 1
        `,
        [name, excludeId]
    );

    return result.rows[0];
};

const createGlobalDepartment = async (client, name) => {
    const result = await client.query(
        `
        INSERT INTO departments (name, university_id)
        VALUES ($1, NULL)
        RETURNING *
        `,
        [normalizeName(name)]
    );

    return result.rows[0];
};

const getAllDepartments = async (req, res, next) => {
    try {
        const result = await pool.query(`
            SELECT d.*, u.name AS university_name
            FROM departments d
            LEFT JOIN universities u ON d.university_id = u.id
            ORDER BY d.name ASC, u.name ASC NULLS FIRST
        `);
        res.json(result.rows);
    } catch (error) {
        next(error);
    }
};

const createDepartment = async (req, res, next) => {
    try {
        const { name, university_id } = req.body;
        const normalizedName = normalizeName(name);
        const normalizedUniversityId = normalizeUniversityId(university_id);

        if (!normalizedName) {
            return res.status(400).json({ message: 'Department name is required' });
        }

        if (Number.isNaN(normalizedUniversityId)) {
            return res.status(400).json({ message: 'University ID must be a positive integer when provided' });
        }

        const existing = await findOverlappingDepartment(normalizedName, normalizedUniversityId);
        if (existing) {
            const scope = existing.university_id
                ? existing.university_name || 'that university'
                : 'all universities';

            return res.status(200).json({
                ...existing,
                already_exists: true,
                message: `${existing.name} is already available for ${scope}.`,
            });
        }

        const result = await pool.query(
            'INSERT INTO departments (name, university_id) VALUES ($1, $2) RETURNING *',
            [normalizedName, normalizedUniversityId]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

const updateDepartment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { name, university_id } = req.body;
        const normalizedName = normalizeName(name);
        const normalizedUniversityId = normalizeUniversityId(university_id);

        if (!normalizedName) {
            return res.status(400).json({ message: 'Department name is required' });
        }

        if (Number.isNaN(normalizedUniversityId)) {
            return res.status(400).json({ message: 'University ID must be a positive integer when provided' });
        }

        const existing = await findOverlappingDepartment(normalizedName, normalizedUniversityId, id);
        if (existing) {
            const scope = existing.university_id
                ? existing.university_name || 'that university'
                : 'all universities';

            return res.status(409).json({
                message: `${existing.name} is already available for ${scope}.`,
            });
        }

        const result = await pool.query(
            'UPDATE departments SET name = $1, university_id = $2 WHERE id = $3 RETURNING *',
            [normalizedName, normalizedUniversityId, id]
        );
        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Department not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

const deleteDepartment = async (req, res, next) => {
    const client = await pool.connect();

    try {
        const { id } = req.params;
        const departmentId = Number(id);

        if (!Number.isInteger(departmentId) || departmentId <= 0) {
            return res.status(400).json({ message: 'Invalid department ID' });
        }

        await client.query('BEGIN');

        const departmentResult = await client.query(
            'SELECT * FROM departments WHERE id = $1 FOR UPDATE',
            [departmentId]
        );
        const department = departmentResult.rows[0];

        if (!department) {
            await client.query('ROLLBACK');
            return res.status(404).json({ message: 'Department not found' });
        }

        const counts = await getDepartmentReferenceCounts(client, departmentId);
        const referenceCount = totalReferenceCount(counts);

        if (referenceCount === 0) {
            await client.query('DELETE FROM departments WHERE id = $1', [departmentId]);
            await client.query('COMMIT');
            return res.json({ message: 'Department deleted successfully' });
        }

        if (!department.university_id) {
            await client.query('ROLLBACK');
            return res.status(400).json({
                message: 'Cannot delete this global department because graduate, degree, or advisor records still use it. Reassign those records first.',
                references: counts,
            });
        }

        let replacement = await findGlobalDepartmentByName(client, department.name, departmentId);
        if (!replacement) {
            replacement = await createGlobalDepartment(client, department.name);
        }

        await client.query(
            'UPDATE users SET department_id = $1, updated_at = CURRENT_TIMESTAMP WHERE department_id = $2',
            [replacement.id, departmentId]
        );
        await client.query(
            'UPDATE degrees SET department_id = $1, updated_at = CURRENT_TIMESTAMP WHERE department_id = $2',
            [replacement.id, departmentId]
        );
        await client.query(
            'UPDATE advisors SET department_id = $1, updated_at = CURRENT_TIMESTAMP WHERE department_id = $2',
            [replacement.id, departmentId]
        );

        await client.query('DELETE FROM departments WHERE id = $1', [departmentId]);
        await client.query('COMMIT');

        return res.json({
            message: `${department.name} was merged into the global department and deleted from that university.`,
            replacement_department: replacement,
            references_moved: counts,
        });
    } catch (error) {
        await client.query('ROLLBACK').catch(() => {});

        if (error.code === '23503') { // Foreign key violation
            return res.status(400).json({
                message: 'Cannot delete department because records still reference it.'
            });
        }
        next(error);
    } finally {
        client.release();
    }
};

module.exports = {
    getAllDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment
};
