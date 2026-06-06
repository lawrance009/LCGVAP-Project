const pool = require('../config/db');

// Model Logic (Inline for simplicity or consistency with separate model file pattern)
// Ideally we should move this to a departmentModel.js, but userController is doing mixed things. 
// Let's create departmentModel first or use pool here.
// Going with direct pool usage for speed, refactor later if needed.

const getAllDepartments = async (req, res, next) => {
    try {
        const result = await pool.query('SELECT * FROM departments ORDER BY name ASC');
        res.json(result.rows);
    } catch (error) {
        next(error);
    }
};

const createDepartment = async (req, res, next) => {
    try {
        const { name, university_id } = req.body;
        if (!name || !university_id) {
            return res.status(400).json({ message: 'Name and University ID are required' });
        }
        const result = await pool.query(
            'INSERT INTO departments (name, university_id) VALUES ($1, $2) RETURNING *',
            [name, university_id]
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
        const result = await pool.query(
            'UPDATE departments SET name = $1, university_id = $2 WHERE id = $3 RETURNING *',
            [name, university_id, id]
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
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM departments WHERE id = $1 RETURNING id', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Department not found' });
        }
        res.json({ message: 'Department deleted successfully' });
    } catch (error) {
        if (error.code === '23503') { // Foreign key violation
            return res.status(400).json({
                message: 'Cannot delete department. It has associated advisors or students.'
            });
        }
        next(error);
    }
};

module.exports = {
    getAllDepartments,
    createDepartment,
    updateDepartment,
    deleteDepartment
};
