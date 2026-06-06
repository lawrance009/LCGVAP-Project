const pool = require('../config/db');

const getAllAdvisors = async (req, res, next) => {
    try {
        const query = `
            SELECT a.*, d.name as department_name, u.name as university_name
            FROM advisors a
            LEFT JOIN departments d ON a.department_id = d.id
            LEFT JOIN universities u ON d.university_id = u.id
            ORDER BY a.last_name ASC
        `;
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        next(error);
    }
};

const createAdvisor = async (req, res, next) => {
    try {
        const { first_name, last_name, email, department_id } = req.body;
        if (!first_name || !last_name || !email || !department_id) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const result = await pool.query(
            'INSERT INTO advisors (first_name, last_name, email, department_id) VALUES ($1, $2, $3, $4) RETURNING *',
            [first_name, last_name, email, department_id]
        );
        res.status(201).json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

const updateAdvisor = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { first_name, last_name, email, department_id } = req.body;

        const result = await pool.query(
            'UPDATE advisors SET first_name = $1, last_name = $2, email = $3, department_id = $4, updated_at = CURRENT_TIMESTAMP WHERE id = $5 RETURNING *',
            [first_name, last_name, email, department_id, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Advisor not found' });
        }
        res.json(result.rows[0]);
    } catch (error) {
        next(error);
    }
};

const deleteAdvisor = async (req, res, next) => {
    try {
        const { id } = req.params;
        const result = await pool.query('DELETE FROM advisors WHERE id = $1 RETURNING id', [id]);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: 'Advisor not found' });
        }
        res.json({ message: 'Advisor deleted successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getAllAdvisors,
    createAdvisor,
    updateAdvisor,
    deleteAdvisor
};
