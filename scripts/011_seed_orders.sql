-- Seed orders data matching the orders table schema
-- Note: The orders table has product_id and quantity directly, not a separate order_items table
-- Updated all product_ids to match actual products from seed files

INSERT INTO public.orders (
  id, 
  order_number, 
  customer_id, 
  branch_id, 
  product_id,
  quantity,
  total_amount, 
  payment_status,
  fulfillment_status,
  payment_method,
  created_at,
  paid_at
) VALUES
  -- Order 1: Pending payment - 홍길동 orders 한라봉 from Gangnam
  ('850e8400-e29b-41d4-a716-446655440001'::uuid, 
   'ORD20250119001', 
   '750e8400-e29b-41d4-a716-446655440001'::uuid, 
   '550e8400-e29b-41d4-a716-446655440002'::uuid,
   '650e8400-e29b-41d4-a716-446655440001'::uuid,
   5,
   60000, 
   'pending',
   'payment_completed',
   'card',
   NOW() - INTERVAL '1 hour',
   NULL),
   
  -- Order 2: Paid and preparing - 홍길동 orders 사과 from Gangnam
  ('850e8400-e29b-41d4-a716-446655440002'::uuid, 
   'ORD20250119002', 
   '750e8400-e29b-41d4-a716-446655440001'::uuid, 
   '550e8400-e29b-41d4-a716-446655440002'::uuid,
   '650e8400-e29b-41d4-a716-446655440002'::uuid,
   3,
   24000, 
   'paid',
   'preparing',
   'kakao_pay',
   NOW() - INTERVAL '2 hours',
   NOW() - INTERVAL '2 hours'),
   
  -- Order 3: Ready for pickup - 홍길동 orders 딸기 from Gangnam
  ('850e8400-e29b-41d4-a716-446655440003'::uuid, 
   'ORD20250118001', 
   '750e8400-e29b-41d4-a716-446655440001'::uuid, 
   '550e8400-e29b-41d4-a716-446655440002'::uuid,
   '650e8400-e29b-41d4-a716-446655440003'::uuid,
   2,
   30000, 
   'paid',
   'ready_for_pickup',
   'card',
   NOW() - INTERVAL '4 hours',
   NOW() - INTERVAL '4 hours'),
   
  -- Order 4: Picked up - 홍길동 orders 방울토마토 from Gangnam
  ('850e8400-e29b-41d4-a716-446655440004'::uuid, 
   'ORD20250118002', 
   '750e8400-e29b-41d4-a716-446655440001'::uuid, 
   '550e8400-e29b-41d4-a716-446655440002'::uuid,
   '650e8400-e29b-41d4-a716-446655440004'::uuid,
   4,
   24000, 
   'paid',
   'picked_up',
   'naver_pay',
   NOW() - INTERVAL '1 day',
   NOW() - INTERVAL '1 day'),
   
  -- Order 5: Cancelled - 김영희 orders 한우 불고기 from Beomeo
  ('850e8400-e29b-41d4-a716-446655440005'::uuid, 
   'ORD20250117001', 
   '750e8400-e29b-41d4-a716-446655440002'::uuid, 
   '550e8400-e29b-41d4-a716-446655440001'::uuid,
   '650e8400-e29b-41d4-a716-446655440005'::uuid,
   1,
   35000, 
   'cancelled',
   'payment_completed',
   'card',
   NOW() - INTERVAL '2 days',
   NULL),
   
  -- Order 6: Completed - 김영희 orders 한라봉 from Beomeo
  ('850e8400-e29b-41d4-a716-446655440006'::uuid, 
   'ORD20250117002', 
   '750e8400-e29b-41d4-a716-446655440002'::uuid, 
   '550e8400-e29b-41d4-a716-446655440001'::uuid,
   '650e8400-e29b-41d4-a716-446655440001'::uuid,
   2,
   24000, 
   'paid',
   'picked_up',
   'kakao_pay',
   NOW() - INTERVAL '3 days',
   NOW() - INTERVAL '3 days')
   
ON CONFLICT (id) DO NOTHING;
