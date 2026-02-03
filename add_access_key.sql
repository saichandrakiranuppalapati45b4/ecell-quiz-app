-- Run this command in your Supabase SQL Editor to fix the "Could not find access_key column" error.

ALTER TABLE quizzes ADD COLUMN IF NOT EXISTS access_key TEXT DEFAULT 'ecell2026';

-- Just to be safe, allow public update on quizzes if not already set (for authorized users)
-- (The existing policies might already cover this, but good to ensure)
