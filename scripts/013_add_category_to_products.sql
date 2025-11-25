-- Add category_id column to products table
ALTER TABLE public.products 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES public.categories(id) ON DELETE SET NULL;

-- Create index on category_id
CREATE INDEX IF NOT EXISTS idx_products_category_id ON public.products(category_id);

-- Keep the old category column for migration purposes (will be removed later)
-- This allows gradual migration from string categories to category_id
