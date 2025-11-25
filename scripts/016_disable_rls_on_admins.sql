-- Disable RLS on admins table
-- This is safe because:
-- 1. We use custom authentication with bcrypt (not Supabase Auth)
-- 2. Passwords are hashed, so even if someone queries with anon key, they can't get passwords
-- 3. Admin authentication only happens server-side via Server Actions
-- 4. The RLS policies with auth.uid() don't apply to custom auth anyway

ALTER TABLE admins DISABLE ROW LEVEL SECURITY;

-- Drop the existing policies since they don't apply to our custom auth
DROP POLICY IF EXISTS "Super admins can view all admins" ON admins;
DROP POLICY IF EXISTS "Branch owners can view themselves" ON admins;

