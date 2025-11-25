-- Create branches table
CREATE TABLE IF NOT EXISTS public.branches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(200) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  kakao_channel_id VARCHAR(255) NOT NULL,
  notification_phone VARCHAR(20) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  website_url TEXT,
  theme_color VARCHAR(7), -- Hex color like #10b981
  address TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_branches_slug ON public.branches(slug);
CREATE INDEX IF NOT EXISTS idx_branches_status ON public.branches(status);

-- Enable Row Level Security
ALTER TABLE public.branches ENABLE ROW LEVEL SECURITY;

-- RLS Policies: branches are public readable
CREATE POLICY "Enable read access for all users" ON public.branches
  FOR SELECT
  USING (true);

-- Only service role can modify branches
CREATE POLICY "Enable insert for service role only" ON public.branches
  FOR INSERT
  WITH CHECK (auth.role() = 'service_role');

CREATE POLICY "Enable update for service role only" ON public.branches
  FOR UPDATE
  USING (auth.role() = 'service_role');

CREATE POLICY "Enable delete for service role only" ON public.branches
  FOR DELETE
  USING (auth.role() = 'service_role');

-- Insert seed data
INSERT INTO public.branches (id, name, slug, kakao_channel_id, notification_phone, status, website_url, theme_color, address) VALUES
  ('550e8400-e29b-41d4-a716-446655440001', '따뜻한자리 그로서리 범어점', 'beomeo', 'beomeo_channel', '053-123-4567', 'active', '/beomeo/products', '#10b981', '대구 수성구 범어로 123'),
  ('550e8400-e29b-41d4-a716-446655440002', '강남점', 'gangnam', 'gangnam_channel', '02-1234-5678', 'active', '/gangnam/products', '#3b82f6', '서울 강남구 테헤란로 123'),
  ('550e8400-e29b-41d4-a716-446655440003', '홍대점', 'hongdae', 'hongdae_channel', '02-3456-7890', 'active', '/hongdae/products', '#8b5cf6', '서울 마포구 홍대입구 456'),
  ('550e8400-e29b-41d4-a716-446655440004', '잠실점', 'jamsil', 'jamsil_channel', '02-2345-6789', 'active', '/jamsil/products', '#f59e0b', '서울 송파구 잠실동 789')
ON CONFLICT (id) DO NOTHING;
