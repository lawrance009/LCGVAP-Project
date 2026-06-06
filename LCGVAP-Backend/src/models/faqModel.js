const db = require('../config/db');

class FAQModel {
    // Get all published FAQs
    static async getAllPublished() {
        try {
            const result = await db.query(
                'SELECT * FROM faq_questions WHERE is_published = true AND is_answered = true ORDER BY helpful_count DESC'
            );
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    // Get all FAQs (for admin)
    static async getAll(filters = {}) {
        try {
            let query = 'SELECT * FROM faq_questions WHERE 1=1';
            const values = [];
            
            if (filters.is_answered !== undefined) {
                query += ` AND is_answered = $${values.length + 1}`;
                values.push(filters.is_answered);
            }
            
            if (filters.category) {
                query += ` AND category = $${values.length + 1}`;
                values.push(filters.category);
            }
            
            query += ' ORDER BY created_at DESC';
            
            const result = await db.query(query, values);
            return result.rows;
        } catch (error) {
            throw error;
        }
    }

    // Get single FAQ
    static async getById(id) {
        try {
            const result = await db.query(
                'SELECT * FROM faq_questions WHERE id = $1 AND is_published = true AND is_answered = true',
                [id]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    static async getByIdAdmin(id) {
        try {
            const result = await db.query(
                'SELECT * FROM faq_questions WHERE id = $1',
                [id]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Submit new FAQ question
    static async create(data) {
        const { question, category, submitted_by_email } = data;
        try {
            const result = await db.query(
                `INSERT INTO faq_questions (question, category, submitted_by_email) 
                VALUES ($1, $2, $3) 
                RETURNING *`,
                [question, category || 'General', submitted_by_email]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Update FAQ (admin - answer question)
    static async update(id, data) {
        const allowedColumns = new Set([
            'question',
            'answer',
            'category',
            'is_answered',
            'is_published',
            'admin_notes'
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
        const query = `UPDATE faq_questions SET ${updates.join(', ')}, updated_at = CURRENT_TIMESTAMP WHERE id = $${paramCount} RETURNING *`;
        
        try {
            const result = await db.query(query, values);
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Delete FAQ
    static async delete(id) {
        try {
            const result = await db.query(
                'DELETE FROM faq_questions WHERE id = $1 RETURNING *',
                [id]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }

    // Mark as helpful
    static async markHelpful(id) {
        try {
            const result = await db.query(
                'UPDATE faq_questions SET helpful_count = helpful_count + 1 WHERE id = $1 RETURNING *',
                [id]
            );
            return result.rows[0];
        } catch (error) {
            throw error;
        }
    }
}

module.exports = FAQModel;
