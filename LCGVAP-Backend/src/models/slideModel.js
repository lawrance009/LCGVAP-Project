const pool = require('../config/db');

const getAllSlides = async () => {
    const result = await pool.query('SELECT * FROM hero_slides ORDER BY slide_order ASC, created_at DESC');
    return result.rows;
};

const getActiveSlides = async () => {
    const result = await pool.query('SELECT * FROM hero_slides WHERE is_active = TRUE ORDER BY slide_order ASC, created_at DESC');
    return result.rows;
};

const addSlide = async (imageUrl, title, subtitle, slideOrder) => {
    const query = `
        INSERT INTO hero_slides (image_url, title, subtitle, slide_order)
        VALUES ($1, $2, $3, $4)
        RETURNING *;
    `;
    const result = await pool.query(query, [imageUrl, title, subtitle, slideOrder || 0]);
    return result.rows[0];
};

const updateSlide = async (id, title, subtitle, slideOrder, isActive) => {
    const query = `
        UPDATE hero_slides
        SET title = $1, subtitle = $2, slide_order = $3, is_active = $4
        WHERE id = $5
        RETURNING *;
    `;
    const result = await pool.query(query, [title, subtitle, slideOrder, isActive, id]);
    return result.rows[0];
};

const deleteSlide = async (id) => {
    const query = 'DELETE FROM hero_slides WHERE id = $1 RETURNING *;';
    const result = await pool.query(query, [id]);
    return result.rows[0];
};

module.exports = {
    getAllSlides,
    getActiveSlides,
    addSlide,
    updateSlide,
    deleteSlide
};
