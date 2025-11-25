-- Create customers table (users who order products)
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  auth_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE, -- Link to Supabase Auth
  branch_id UUID REFERENCES public.branches(id) ON DELETE SET NULL,
  kakao_id VARCHAR(255) UNIQUE,
  name VARCHAR(200) NOT NULL,
  phone VARCHAR(20),
  email VARCHAR(255),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_customers_auth_user_id ON public.customers(auth_user_id);
CREATE INDEX IF NOT EXISTS idx_customers_branch_id ON public.customers(branch_id);
CREATE INDEX IF NOT EXISTS idx_customers_kakao_id ON public.customers(kakao_id);

-- Enable Row Level Security
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- Simplified RLS policies to avoid UUID/TEXT type conflicts
-- RLS Policies: users can read/write their own data, service role can do everything
CREATE POLICY "Enable all access for service role" ON public.customers
  FOR ALL
  USING (auth.role() = 'service_role');

CREATE POLICY "Users can view their own customer data" ON public.customers
  FOR SELECT
  USING (auth.uid() = auth_user_id);

CREATE POLICY "Users can insert their own customer data" ON public.customers
  FOR INSERT
  WITH CHECK (auth.uid() = auth_user_id);

CREATE POLICY "Users can update their own customer data" ON public.customers
  FOR UPDATE
  USING (auth.uid() = auth_user_id);
