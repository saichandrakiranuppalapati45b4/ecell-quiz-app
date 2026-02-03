-- Add columns to track performance details
ALTER TABLE participants ADD COLUMN IF NOT EXISTS wrong_attempts INTEGER DEFAULT 0;
ALTER TABLE participants ADD COLUMN IF NOT EXISTS questions_solved INTEGER DEFAULT 0;
