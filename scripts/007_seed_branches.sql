-- Replacing text IDs with proper UUIDs to match schema
-- Insert branch data
INSERT INTO public.branches (id, name, slug, kakao_channel_id, notification_phone, status, website_url, theme_color, address) VALUES
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, '따뜻한자리 그로서리 범어점', 'beomeo', 'beomeo_channel', '053-123-4567', 'active', '/beomeo/products', '#10b981', '대구 수성구 범어로 123'),
  ('550e8400-e29b-41d4-a716-446655440002'::uuid, '강남점', 'gangnam', 'gangnam_channel', '02-1234-5678', 'active', '/gangnam/products', '#3b82f6', '서울 강남구 테헤란로 123'),
  ('550e8400-e29b-41d4-a716-446655440003'::uuid, '홍대점', 'hongdae', 'hongdae_channel', '02-3456-7890', 'active', '/hongdae/products', '#8b5cf6', '서울 마포구 홍대입구 456'),
  ('550e8400-e29b-41d4-a716-446655440004'::uuid, '잠실점', 'jamsil', 'jamsil_channel', '02-2345-6789', 'active', '/jamsil/products', '#f59e0b', '서울 송파구 잠실동 789')
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  kakao_channel_id = EXCLUDED.kakao_channel_id,
  notification_phone = EXCLUDED.notification_phone,
  status = EXCLUDED.status,
  website_url = EXCLUDED.website_url,
  theme_color = EXCLUDED.theme_color,
  address = EXCLUDED.address;
