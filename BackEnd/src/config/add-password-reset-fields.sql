-- Migration: Add password reset fields to users table
-- Run this script to add password recovery functionality

-- Add reset token and expiry fields to users table
ALTER TABLE users ADD COLUMN reset_token TEXT;
ALTER TABLE users ADD COLUMN reset_token_expiry DATETIME;

-- Create index for reset token lookups
CREATE INDEX IF NOT EXISTS idx_users_reset_token ON users(reset_token);

-- Optional: Display users table structure to verify changes
-- PRAGMA table_info(users);
