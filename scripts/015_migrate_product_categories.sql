-- Migrate existing product categories to use category_id
-- This updates products to reference the new categories table

UPDATE public.products 
SET category_id = (
  SELECT id FROM public.categories WHERE name = products.category
)
WHERE category IS NOT NULL;

-- Optional: Remove the old category column after migration is complete
-- Uncomment the line below once you've verified the migration worked
-- ALTER TABLE public.products DROP COLUMN IF EXISTS category;
