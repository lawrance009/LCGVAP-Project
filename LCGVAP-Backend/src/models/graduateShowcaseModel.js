const db = require('../config/db');

class GraduateShowcaseModel {
    // Get all featured graduates
    static async getAllFeatured() {
        try {
            const result = await db.query(
                'SELECT * FROM verified_graduates_showcase WHERE is_featured = true ORDER BY display_order ASC'
            );
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    // Get all graduates (for admin)
    static async getAll() {
        try {
            const result = await db.query(
                'SELECT * FROM verified_graduates_showcase ORDER BY created_at DESC'
            );
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    // Get single graduate
    static async getById(id) {
        try {
            const result = await db.query(
                'SELECT * FROM verified_graduates_showcase WHERE id = $1',
                [id]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Create new showcase graduate
    static async create(data) {
        const { user_id, name, department, university, bio, photo_url, degree_type, graduation_year, featured_story, is_featured, display_order } = data;
        try {
            const result = await db.query(
                `INSERT INTO verified_graduates_showcase 
                (user_id, name, department, university, bio, photo_url, degree_type, graduation_year, featured_story, is_featured, display_order) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) 
                RETURNING *`,
                [user_id, name, department, university, bio, photo_url, degree_type, graduation_year, featured_story, is_featured, display_order]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Update graduate
    static async update(id, data) {
        const allowedColumns = new Set([
            'user_id',
            'name',
            'department',
            'university',
            'bio',
            'photo_url',
            'degree_type',
            'graduation_year',
            'featured_story',
            'is_featured',
            'display_order'
        ]);
        const updates = [];
        const values = [];
        let paramCount = 1;

        Object.keys(data).forEach(key => {
            if (allowedColumns.has(key) && data[key] !== undefined) {
                updates.push(`${key} = $${paramCount}`);
                values.push(data[key]);
                paramCount++;
            }
        });

        if (updates.length === 0) return null;

        values.push(id);
        const query = `UPDATE verified_graduates_showcase SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`;
        
        try {
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Delete graduate
    static async delete(id) {
        try {
            const result = await db.query(
                'DELETE FROM verified_graduates_showcase WHERE id = $1 RETURNING *',
                [id]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }
}

module.exports = GraduateShowcaseModel;
