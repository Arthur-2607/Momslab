-- Add password_hash column to customers table for direct authentication
ALTER TABLE public.customers 
ADD COLUMN IF NOT EXISTS password_hash TEXT;

-- Add index for faster email lookups during login
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);

-- Comment explaining the column
COMMENT ON COLUMN public.customers.password_hash IS 'Hashed password for direct authentication (bcrypt). NULL if user signed up with OAuth only.';
