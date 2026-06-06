const db = require('../config/db');

/**
 * Get all news posts with pagination
 */
const getAllNews = async (limit = 10, offset = 0) => {
    const query = `
        SELECT n.*, 
        u.first_name as author_first, u.last_name as author_last
        FROM news n
        LEFT JOIN users u ON n.author_id = u.id
        ORDER BY n.created_at DESC
        LIMIT $1 OFFSET $2;
    `;
    const result = await db.query(query, [limit, offset]);
    return result.rows;
};

/**
 * Get single news post
 */
const getNewsById = async (id) => {
    const query = `
        SELECT n.*, 
        u.first_name as author_first, u.last_name as author_last
        FROM news n
        LEFT JOIN users u ON n.author_id = u.id
        WHERE n.id = $1;
    `;
    const result = await db.query(query, [id]);
    return result.rows[0];
};

/**
 * Create news post
 */
const createNews = async (data) => {
    const { title, subtitle, content, image_url, author_id } = data;
    const query = `
        INSERT INTO news (title, subtitle, content, image_url, author_id)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *;
    `;
    const values = [title, subtitle, content, image_url, author_id];
    const result = await db.query(query, values);
    return result.rows[0];
};

/**
 * Delete news post
 */
const deleteNews = async (id) => {
    const query = 'DELETE FROM news WHERE id = $1 RETURNING *;';
    const result = await db.query(query, [id]);
    return result.rows[0];
};

/**
 * Update news post
 */
const updateNews = async (id, data) => {
    const { title, subtitle, content, image_url } = data;
    let query = '';
    let values = [];

    if (image_url) {
        query = `
            UPDATE news 
            SET title = $1, subtitle = $2, content = $3, image_url = $4, updated_at = CURRENT_TIMESTAMP
            WHERE id = $5
            RETURNING *;
        `;
        values = [title, subtitle, content, image_url, id];
    } else {
        query = `
            UPDATE news 
            SET title = $1, subtitle = $2, content = $3, updated_at = CURRENT_TIMESTAMP
            WHERE id = $4
            RETURNING *;
        `;
        values = [title, subtitle, content, id];
    }

    const result = await db.query(query, values);
    return result.rows[0];
};

/**
 * Get users with birthdays in the last N days
 */
const getRecentBirthdays = async (days = 5) => {
    const query = `
        SELECT first_name, last_name, profile_photo, date_of_birth
        FROM users
        WHERE 
            to_char(date_of_birth, 'MM-DD') BETWEEN 
            to_char(CURRENT_DATE - INTERVAL '${days} days', 'MM-DD') AND 
            to_char(CURRENT_DATE, 'MM-DD')
        AND role = 'graduate'
        AND is_verified = TRUE;
    `;

    const advancedQuery = `
         SELECT first_name, last_name, profile_photo, date_of_birth
         FROM users
         WHERE (
             EXTRACT(DOY FROM date_of_birth) BETWEEN 
             EXTRACT(DOY FROM CURRENT_DATE - INTERVAL '${days} days') AND 
             EXTRACT(DOY FROM CURRENT_DATE)
         )
         AND role = 'graduate'
         AND is_verified = TRUE;
    `;

    const result = await db.query(advancedQuery);
    return result.rows;
};

/**
 * Get users with birthday TODAY (for Cron Job)
 * Includes University Name
 */
const getTodaysBirthdays = async () => {
    const query = `
        SELECT u.*, uni.name as university_name
        FROM users u
        LEFT JOIN universities uni ON u.university_id = uni.id
        WHERE 
        EXTRACT(MONTH FROM u.date_of_birth) = EXTRACT(MONTH FROM CURRENT_DATE)
        AND EXTRACT(DAY FROM u.date_of_birth) = EXTRACT(DAY FROM CURRENT_DATE)
        AND u.is_verified = TRUE;
    `;
    const result = await db.query(query);
    return result.rows;
};

module.exports = {
    getAllNews,
    getNewsById,
    createNews,
    updateNews,
    deleteNews,
    getRecentBirthdays,
    getTodaysBirthdays
};
