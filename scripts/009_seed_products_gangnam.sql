-- Updating to use UUIDs for gangnam branch
-- Insert product data for gangnam branch
-- Branch UUID: 550e8400-e29b-41d4-a716-446655440002
INSERT INTO public.products (id, branch_id, name, price, image_url, images, moq, current_orders, stock, status, category, description, start_at, end_at) VALUES
  ('650e8400-e29b-41d4-a716-446655440101'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, '제주 감귤 10kg', 18000, 'https://loremflickr.com/800/600/orange,citrus',
   NULL, 120, 150, 200, 'closed', '그로서리',
   '<h3>제주 감귤 10kg</h3><p>달콤한 제주 감귤 대용량입니다.</p>',
   NOW() - INTERVAL '24 hours', NOW() + INTERVAL '72 hours'),
  
  ('650e8400-e29b-41d4-a716-446655440102'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, '유기농 샐러드 채소 세트', 9000, 'https://loremflickr.com/800/600/salad,vegetables',
   NULL, 40, 40, 0, 'soldout', '그로서리',
   '<h3>유기농 샐러드 채소 세트</h3><p>신선한 유기농 채소 모음입니다. 품절되었습니다.</p>',
   NOW() - INTERVAL '12 hours', NOW() + INTERVAL '12 hours'),
  
  ('650e8400-e29b-41d4-a716-446655440103'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, '프리미엄 망고 2kg', 25000, 'https://loremflickr.com/800/600/mango,fruit',
   NULL, 80, 73, 100, 'open', '그로서리',
   '<h3>프리미엄 망고 2kg</h3><p>달콤한 프리미엄 망고입니다.</p>',
   NOW() - INTERVAL '72 hours', NOW() + INTERVAL '24 hours'),
  
  -- Tuesday closing products (48 hours from now)
  ('650e8400-e29b-41d4-a716-446655440104'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, '프리미엄 체리 1kg', 32000, 'https://loremflickr.com/800/600/cherry,fruit',
   NULL, 70, 65, 120, 'open', '그로서리',
   '<h3>프리미엄 체리 1kg</h3><p>달콤한 프리미엄 체리입니다.</p>',
   NOW() - INTERVAL '24 hours', NOW() + INTERVAL '48 hours'),
  
  ('650e8400-e29b-41d4-a716-446655440105'::uuid, '550e8400-e29b-41d4-a716-446655440002'::uuid, '유기농 키위 2kg', 18000, 'https://loremflickr.com/800/600/kiwi,fruit',
   NULL, 60, 65, 100, 'open', '그로서리',
   '<h3>유기농 키위 2kg</h3><p>신선한 뉴질랜드 골드키위입니다.</p>',
   NOW() - INTERVAL '24 hours', NOW() + INTERVAL '48 hours')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  moq = EXCLUDED.moq,
  current_orders = EXCLUDED.current_orders,
  stock = EXCLUDED.stock,
  status = EXCLUDED.status;
