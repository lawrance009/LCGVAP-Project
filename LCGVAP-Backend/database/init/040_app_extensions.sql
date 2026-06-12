-- =============================================================================
-- App extensions aligned with LCGVAP-Backend models (runs once on fresh PG)
-- =============================================================================

-- --- Universities: admin UI extras ---
ALTER TABLE universities ADD COLUMN IF NOT EXISTS logo_url VARCHAR(500);
ALTER TABLE universities ADD COLUMN IF NOT EXISTS website_url VARCHAR(500);
ALTER TABLE universities ADD COLUMN IF NOT EXISTS short_description TEXT;
ALTER TABLE universities ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE universities ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- --- Users: auth / admin flows ---
ALTER TABLE users ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255);
ALTER TABLE users ADD COLUMN IF NOT EXISTS graduation_year INTEGER;
ALTER TABLE users ADD COLUMN IF NOT EXISTS status VARCHAR(50);
ALTER TABLE users ADD COLUMN IF NOT EXISTS login_attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN IF NOT EXISTS locked_until TIMESTAMP;
ALTER TABLE users ADD COLUMN IF NOT EXISTS rejection_reason TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS verified_at TIMESTAMP;

-- --- OTP hardening (bcrypt hashes + lockout columns) ---
ALTER TABLE otp_tokens ALTER COLUMN otp TYPE VARCHAR(255);
ALTER TABLE otp_tokens ADD COLUMN IF NOT EXISTS attempts INTEGER NOT NULL DEFAULT 0;
ALTER TABLE otp_tokens ADD COLUMN IF NOT EXISTS is_locked BOOLEAN NOT NULL DEFAULT FALSE;
ALTER TABLE otp_tokens DROP CONSTRAINT IF EXISTS otp_tokens_otp_check;
CREATE INDEX IF NOT EXISTS idx_otp_email_active ON otp_tokens(email, is_used, is_locked, expires_at);

ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check;
ALTER TABLE users ADD CONSTRAINT users_role_check CHECK (role IN ('graduate', 'admin', 'master_admin'));

-- --- JWT refresh persistence (jwtUtils.js + refreshTokenModel.js) ---
CREATE TABLE IF NOT EXISTS refresh_tokens (
    id          SERIAL PRIMARY KEY,
    user_id     INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    token_hash  VARCHAR(64) NOT NULL UNIQUE,
    expires_at  TIMESTAMP NOT NULL,
    revoked     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at  TIMESTAMP NOT NULL DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_hash ON refresh_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_refresh_tokens_user_id ON refresh_tokens(user_id);

-- --- Public FAQ ---
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

-- --- Homepage featured graduates showcase ---
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

-- --- Admin audit (soft-failure if missing in code paths) ---
CREATE TABLE IF NOT EXISTS audit_logs (
    id SERIAL PRIMARY KEY,
    admin_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    action VARCHAR(100) NOT NULL,
    target_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
    details TEXT,
    ip_address VARCHAR(45),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
