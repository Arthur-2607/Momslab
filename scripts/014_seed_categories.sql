-- Seed categories based on mock data
INSERT INTO public.categories (id, name, slug, description, icon, display_order, status) VALUES
  ('850e8400-e29b-41d4-a716-446655440001'::uuid, '그로서리', 'grocery', '신선한 과일, 채소 등 그로서리 상품', '🥬', 1, 'active'),
  ('850e8400-e29b-41d4-a716-446655440002'::uuid, '정육', 'meat', '신선한 육류 상품', '🥩', 2, 'active'),
  ('850e8400-e29b-41d4-a716-446655440003'::uuid, '수산', 'seafood', '신선한 수산물', '🐟', 3, 'active'),
  ('850e8400-e29b-41d4-a716-446655440004'::uuid, '생필품', 'daily-necessities', '일상 생활용품', '🧴', 4, 'active')
ON CONFLICT (slug) DO NOTHING;
