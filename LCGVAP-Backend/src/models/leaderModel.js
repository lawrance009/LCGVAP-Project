const db = require('../config/db');

/**
 * Get all leaders (Current and Past)
 */
const getAllLeaders = async () => {
    const query = `
        SELECT * FROM leaders
        ORDER BY is_current DESC, order_index ASC, start_date DESC;
    `;
    const result = await db.query(query);
    return result.rows;
};

/**
 * Create a new leader
 */
const createLeader = async (data) => {
    const { name, position, bio, image_url, start_date, end_date, is_current, order_index } = data;
    const query = `
        INSERT INTO leaders (name, position, bio, image_url, start_date, end_date, is_current, order_index)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *;
    `;
    const values = [name, position, bio, image_url, start_date, end_date, is_current || false, order_index || 0];
    const result = await db.query(query, values);
    return result.rows[0];
};

/**
 * Update a leader
 */
const updateLeader = async (id, data) => {
    const { name, position, bio, image_url, start_date, end_date, is_current, order_index } = data;
    let query = '';
    let values = [];

    if (image_url) {
        query = `
            UPDATE leaders
            SET name = $1, position = $2, bio = $3, image_url = $4, start_date = $5, end_date = $6, is_current = $7, order_index = $8, updated_at = CURRENT_TIMESTAMP
            WHERE id = $9
            RETURNING *;
        `;
        values = [name, position, bio, image_url, start_date, end_date, is_current, order_index, id];
    } else {
        query = `
            UPDATE leaders
            SET name = $1, position = $2, bio = $3, start_date = $4, end_date = $5, is_current = $6, order_index = $7, updated_at = CURRENT_TIMESTAMP
            WHERE id = $8
            RETURNING *;
        `;
        values = [name, position, bio, start_date, end_date, is_current, order_index, id];
    }

    const result = await db.query(query, values);
    return result.rows[0];
};

/**
 * Delete a leader
 */
const deleteLeader = async (id) => {
    const query = 'DELETE FROM leaders WHERE id = $1 RETURNING *;';
    const result = await db.query(query, [id]);
    return result.rows[0];
};

module.exports = {
    getAllLeaders,
    createLeader,
    updateLeader,
    deleteLeader
};
