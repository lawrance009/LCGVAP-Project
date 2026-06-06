-- ============================================================
-- Migration: Harden OTP tokens table
-- Adds attempt tracking + lockout capability
--
-- CHANGES:
--   1. attempts   INTEGER  — counts wrong guesses per OTP token
--   2. is_locked  BOOLEAN  — true after 3 failed attempts
--
-- SAFE TO RUN MULTIPLE TIMES (idempotent via IF NOT EXISTS / DO blocks)
-- ============================================================

DO $$
BEGIN
  -- Add 'attempts' column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'otp_tokens' AND column_name = 'attempts'
  ) THEN
    ALTER TABLE otp_tokens ADD COLUMN attempts INTEGER NOT NULL DEFAULT 0;
    RAISE NOTICE 'Column attempts added to otp_tokens';
  ELSE
    RAISE NOTICE 'Column attempts already exists — skipping';
  END IF;

  -- Add 'is_locked' column if it doesn't exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'otp_tokens' AND column_name = 'is_locked'
  ) THEN
    ALTER TABLE otp_tokens ADD COLUMN is_locked BOOLEAN NOT NULL DEFAULT FALSE;
    RAISE NOTICE 'Column is_locked added to otp_tokens';
  ELSE
    RAISE NOTICE 'Column is_locked already exists — skipping';
  END IF;
END
$$;

-- Index for fast lockout checks
CREATE INDEX IF NOT EXISTS idx_otp_email_active
  ON otp_tokens(email, is_used, is_locked, expires_at);
