-- Disable RLS and drop policies on profiles (temporary troubleshooting)

DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;

ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
