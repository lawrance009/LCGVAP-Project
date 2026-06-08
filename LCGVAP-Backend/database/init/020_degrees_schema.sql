-- =============================================================
-- LCGVAP: Degrees & Badges Schema
-- Degrees belong to users. Badges belong to degrees.
-- A user can hold multiple degrees (Bachelor, Master, PhD, etc.)
-- =============================================================

-- Create Degrees Table
-- Each row is one academic credential for one user.
CREATE TABLE IF NOT EXISTS degrees (
    id SERIAL PRIMARY KEY,

    -- The graduate who owns this degree
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Degree classification
    degree_type VARCHAR(50) NOT NULL CHECK (
        degree_type IN ('BACHELOR', 'MASTER', 'PHD', 'POSTDOC', 'ASSOCIATE', 'DIPLOMA')
    ),

    -- Institution details
    university_id INTEGER REFERENCES universities(id) ON DELETE SET NULL,
    department_id INTEGER REFERENCES departments(id) ON DELETE SET NULL,
    advisor_id    INTEGER REFERENCES advisors(id) ON DELETE SET NULL,

    -- Academic metadata
    graduation_year INTEGER,
    field_of_study VARCHAR(255),

    -- Supporting document (uploaded by user, reviewed by admin)
    degree_file VARCHAR(500),

    -- Verification state — set by admin
    is_verified BOOLEAN DEFAULT FALSE,
    verified_at TIMESTAMP,
    verified_by INTEGER REFERENCES users(id) ON DELETE SET NULL, -- admin user id
    rejection_reason TEXT,

    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================
-- Badges Table
-- Each badge is scoped to exactly ONE degree (not the user).
-- Badge is auto-assigned when a degree is verified.
-- =============================================================
CREATE TABLE IF NOT EXISTS badges (
    id SERIAL PRIMARY KEY,

    -- The degree this badge certifies
    degree_id INTEGER NOT NULL UNIQUE REFERENCES degrees(id) ON DELETE CASCADE,

    -- Badge display properties (controlled by admin/system)
    name VARCHAR(255) NOT NULL,  -- e.g., "Bachelor Graduate", "Master's Scholar"
    icon VARCHAR(100) NOT NULL,  -- e.g., "🎓", "🥇", "🏆"
    description TEXT,

    awarded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================================
-- Indexes
-- =============================================================
CREATE INDEX IF NOT EXISTS idx_degrees_user_id     ON degrees(user_id);
CREATE INDEX IF NOT EXISTS idx_degrees_is_verified ON degrees(is_verified);
CREATE INDEX IF NOT EXISTS idx_badges_degree_id    ON badges(degree_id);
