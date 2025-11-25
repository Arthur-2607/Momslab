-- Updating to use UUIDs and match customers table schema (kakao_user_id, default_branch_id)
-- Insert customer/user data
INSERT INTO public.customers (id, name, phone, email, kakao_user_id, default_branch_id, created_at) VALUES
  ('750e8400-e29b-41d4-a716-446655440001'::uuid, '홍길동', '010-1234-5678', 'hong@example.com', 'kakao-12345', '550e8400-e29b-41d4-a716-446655440002'::uuid, NOW() - INTERVAL '30 days'),
  ('750e8400-e29b-41d4-a716-446655440002'::uuid, '김영희', '010-9876-5432', 'kim@example.com', 'kakao-67890', '550e8400-e29b-41d4-a716-446655440001'::uuid, NOW() - INTERVAL '15 days'),
  ('750e8400-e29b-41d4-a716-446655440003'::uuid, '이철수', '010-1111-2222', 'lee@example.com', 'kakao-11111', '550e8400-e29b-41d4-a716-446655440003'::uuid, NOW() - INTERVAL '45 days')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  phone = EXCLUDED.phone,
  email = EXCLUDED.email;
