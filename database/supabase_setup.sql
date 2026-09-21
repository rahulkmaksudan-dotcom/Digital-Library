-- ==============================================================================
-- SUPABASE POSTGRESQL SETUP SCRIPT
-- Digital Library Management System
-- Institution: Thakur Shree DPS College of Engineering and Management
-- Project Team: Ashish Yadav, Rahul Yadav, Priyanshu Yadav
--
-- Instructions:
-- 1. Open your Supabase project dashboard: https://supabase.com/dashboard
-- 2. Navigate to "SQL Editor" -> "New query"
-- 3. Paste this entire script and click "Run"
-- 4. In Render or .env, configure:
--    DATABASE_URL=jdbc:postgresql://db.<PROJECT-REF>.supabase.co:5432/postgres?sslmode=require
--    DATABASE_USERNAME=postgres
--    DATABASE_PASSWORD=<YOUR-SUPABASE-DB-PASSWORD>
-- ==============================================================================

-- Include full schema and initial records
\i schema.sql
\i seed_data.sql

