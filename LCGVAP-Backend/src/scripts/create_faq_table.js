const db = require('../config/db');

const createFaqTable = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS faq_questions (
                id SERIAL PRIMARY KEY,
                question TEXT NOT NULL,
                answer TEXT,
                category VARCHAR(100),
                submitted_by_email VARCHAR(255),
                is_answered BOOLEAN DEFAULT FALSE,
                is_published BOOLEAN DEFAULT FALSE,
                views_count INTEGER DEFAULT 0,
                helpful_count INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ faq_questions table created successfully');
    } catch (error) {
        console.error('❌ Error creating table:', error);
    }
};

createFaqTable();
