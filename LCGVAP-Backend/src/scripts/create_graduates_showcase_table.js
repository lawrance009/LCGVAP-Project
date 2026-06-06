const db = require('../config/db');

const createGraduatesShowcaseTable = async () => {
    try {
        await db.query(`
            CREATE TABLE IF NOT EXISTS verified_graduates_showcase (
                id SERIAL PRIMARY KEY,
                user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
                name VARCHAR(255) NOT NULL,
                department VARCHAR(255),
                university VARCHAR(255),
                bio TEXT,
                photo_url VARCHAR(255),
                degree_type VARCHAR(50),
                graduation_year INTEGER,
                featured_story TEXT,
                is_featured BOOLEAN DEFAULT FALSE,
                display_order INTEGER DEFAULT 0,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        `);
        console.log('✅ verified_graduates_showcase table created successfully');
    } catch (error) {
        console.error('❌ Error creating table:', error);
    }
};

createGraduatesShowcaseTable();
