const db = require('../config/db');

const alterUniversitiesTable = async () => {
    try {
        await db.query(`
            ALTER TABLE universities
            ADD COLUMN IF NOT EXISTS logo_url VARCHAR(255),
            ADD COLUMN IF NOT EXISTS website_url VARCHAR(255),
            ADD COLUMN IF NOT EXISTS short_description TEXT,
            ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE,
            ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;
        `);
        console.log('✅ Universities table updated successfully with new columns');
    } catch (error) {
        console.error('❌ Error altering table:', error);
    }
};

alterUniversitiesTable();
