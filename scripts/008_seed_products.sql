-- Updating to use UUIDs and match products table schema (price, moq, status, start_at, end_at)
-- Insert product data (first batch - beomeo branch)
-- Branch UUID: 550e8400-e29b-41d4-a716-446655440001
INSERT INTO public.products (id, branch_id, name, price, image_url, images, moq, current_orders, stock, status, category, description, start_at, end_at) VALUES
  ('650e8400-e29b-41d4-a716-446655440001'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, '제주 한라봉 5kg', 12000, 'https://upload.wikimedia.org/wikipedia/commons/2/23/Dekopon.jpg', 
   '["https://upload.wikimedia.org/wikipedia/commons/2/23/Dekopon.jpg", "https://m.etlandmall.co.kr/nas/cdn/attach/product/2024/01/25/B0398685/B0398685_0_600.jpg"]'::jsonb,
   100, 95, 200, 'open', '그로서리', 
   '<h3>제주 한라봉 5kg</h3><p>달콤하고 신선한 제주 한라봉입니다. 비타민C가 풍부하여 건강에 좋습니다.</p><ul><li>원산지: 제주도</li><li>중량: 5kg (약 15-20개)</li><li>보관방법: 냉장보관</li></ul>',
   NOW() - INTERVAL '24 hours', NOW() + INTERVAL '24 hours'),
  
  ('650e8400-e29b-41d4-a716-446655440002'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, 'GAP 인증 사과 3kg', 8000, 'https://cdn.welfarehello.com/naver-blog/production/gnfeel/2024-09/223600978505/gnfeel_223600978505_9.jpg',
   '["https://ecimg.cafe24img.com/pg1981b47462396037/buksoemall/web/product/extra/big/20250912/2debc690d36c04715f57ef7caf74a143.jpg"]'::jsonb,
   50, 80, 100, 'soldout', '그로서리',
   '<h3>GAP 인증 사과 3kg</h3><p>안전하고 신선한 GAP 인증 사과입니다.</p><ul><li>원산지: 충주</li><li>중량: 3kg (약 10-12개)</li><li>인증: GAP 우수농산물</li></ul>',
   NOW() - INTERVAL '12 hours', NOW() + INTERVAL '12 hours'),
  
  ('650e8400-e29b-41d4-a716-446655440003'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, '국내산 딸기 2kg', 15000, 'https://oasisprodproduct.edge.naverncp.com/36936/detail/0_0ac0d01b-0c41-406d-9776-91773242bbed.jpg',
   NULL, 80, 95, 150, 'soldout', '그로서리',
   '<h3>국내산 딸기 2kg</h3><p>달콤한 국내산 딸기입니다.</p>',
   NOW() - INTERVAL '6 hours', NOW() + INTERVAL '6 hours'),
  
  ('650e8400-e29b-41d4-a716-446655440004'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, '무농약 방울토마토 1kg', 6000, 'https://image.8dogam.com/resized/product/asset/v1/upload/a1393cac7949472d98badd5b547aabe0.jpg',
   NULL, 60, 55, 100, 'open', '그로서리',
   '<h3>무농약 방울토마토 1kg</h3><p>안전한 무농약 방울토마토입니다.</p>',
   NOW() - INTERVAL '48 hours', NOW() + INTERVAL '48 hours'),
  
  ('650e8400-e29b-41d4-a716-446655440005'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, '한우 1등급 불고기용 1kg', 35000, 'https://oasisprodproduct.edge.naverncp.com/101938/detail/3_c2e25464-0b29-4a66-a50e-ed8a07af857a.jpg',
   NULL, 50, 50, 0, 'soldout', '정육',
   '<h3>한우 1등급 불고기용 1kg</h3><p>신선한 한우 1등급 불고기용입니다. 목표 수량 달성으로 마감되었습니다.</p>',
   NOW() - INTERVAL '36 hours', NOW() + INTERVAL '12 hours'),
  
  ('650e8400-e29b-41d4-a716-446655440006'::uuid, '550e8400-e29b-41d4-a716-446655440001'::uuid, '국내산 삼겹살 2kg', 28000, 'https://muanshop.com/web/product/big/202403/3eed00cdbad2bb94ea26fcc8cd48f44a.jpg',
   NULL, 60, 60, 0, 'closed', '정육',
   '<h3>국내산 삼겹살 2kg</h3><p>신선한 국내산 삼겹살입니다. 마감되었습니다.</p>',
   NOW() - INTERVAL '24 hours', NOW() + INTERVAL '24 hours')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  price = EXCLUDED.price,
  moq = EXCLUDED.moq,
  current_orders = EXCLUDED.current_orders,
  stock = EXCLUDED.stock,
  status = EXCLUDED.status;
