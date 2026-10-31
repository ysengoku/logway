-- Remove trip_members table and associated policies

-- Drop policies if present
DROP POLICY IF EXISTS "trip_members_select" ON trip_members;
DROP POLICY IF EXISTS "trip_members_insert" ON trip_members;
DROP POLICY IF EXISTS "trip_members_delete" ON trip_members;

-- Drop table
DROP TABLE IF EXISTS trip_members CASCADE;
