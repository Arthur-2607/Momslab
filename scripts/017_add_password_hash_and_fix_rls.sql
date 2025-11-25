-- Add password_hash column to customers table for direct authentication
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Make branch_id nullable and auth_user_id nullable (already nullable)
-- This allows customers to sign up without Supabase Auth

-- Add index for faster email lookups during login
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);

-- Update RLS policies to allow inserts without auth_user_id (for direct signup)
-- Drop old restrictive policies
DROP POLICY IF EXISTS "Users can insert their own customer data" ON public.customers;

-- Create new policy that allows inserts for signup
CREATE POLICY "Anyone can insert customer data for signup" ON public.customers
  FOR INSERT
  WITH CHECK (true);

-- Keep read/update restricted to own data or service role
-- (existing policies for SELECT and UPDATE are fine)

-- Comment explaining the column
COMMENT ON COLUMN public.customers.password_hash IS 'Hashed password for direct authentication (bcrypt). NULL if user signed up with OAuth only.';

