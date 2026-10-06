-- ============================================================================== 
-- V8__reset_identity_sequences.sql
-- Fix H2 identity collisions after seed scripts inserted explicit IDs.
-- This keeps future inserts from reusing 1 and failing with duplicate key errors.
-- ============================================================================== 

ALTER TABLE authors ALTER COLUMN id RESTART WITH 100;
ALTER TABLE categories ALTER COLUMN id RESTART WITH 100;
ALTER TABLE books ALTER COLUMN id RESTART WITH 100;
ALTER TABLE audit_logs ALTER COLUMN id RESTART WITH 100;