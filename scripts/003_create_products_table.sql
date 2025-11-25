-- Create products table
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  branch_id UUID NOT NULL REFERENCES public.branches(id) ON DELETE CASCADE,
  name VARCHAR(300) NOT NULL,
  price INTEGER NOT NULL CHECK (price >= 0),
  moq INTEGER NOT NULL CHECK (moq > 0), -- Minimum Order Quantity
  stock INTEGER CHECK (stock >= 0), -- NULL means unlimited stock
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'closed', 'soldout')),
  image_url TEXT NOT NULL,
  images JSONB, -- Array of additional image URLs
  description TEXT,
  category VARCHAR(100),
  start_at TIMESTAMP WITH TIME ZONE NOT NULL,
  end_at TIMESTAMP WITH TIME ZONE NOT NULL,
  current_orders INTEGER DEFAULT 0 CHECK (current_orders >= 0), -- Calculated field
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_products_branch_id ON public.products(branch_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON public.products(status);
CREATE INDEX IF NOT EXISTS idx_products_category ON public.products(category);
CREATE INDEX IF NOT EXISTS idx_products_end_at ON public.products(end_at);

-- Enable Row Level Security
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- RLS Policies: products are public readable
CREATE POLICY "Enable read access for all users" ON public.products
  FOR SELECT
  USING (true);

-- Only authenticated users (admins) can modify products
CREATE POLICY "Enable insert for authenticated users" ON public.products
  FOR INSERT
  WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Enable update for authenticated users" ON public.products
  FOR UPDATE
  USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');

CREATE POLICY "Enable delete for authenticated users" ON public.products
  FOR DELETE
  USING (auth.role() = 'authenticated' OR auth.role() = 'service_role');
