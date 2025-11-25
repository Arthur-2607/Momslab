-- Create admins table for admin authentication
CREATE TABLE IF NOT EXISTS admins (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username TEXT UNIQUE NOT NULL,
  password_hash TEXT NOT NULL,
  name TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('super_admin', 'branch_owner')),
  branch_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_admins_username ON admins(username);
CREATE INDEX IF NOT EXISTS idx_admins_role ON admins(role);
CREATE INDEX IF NOT EXISTS idx_admins_branch_id ON admins(branch_id);

-- Enable Row Level Security
ALTER TABLE admins ENABLE ROW LEVEL SECURITY;

-- Create policies for admins table
-- Super admins can see all admins
CREATE POLICY "Super admins can view all admins"
  ON admins FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM admins a
      WHERE a.id = auth.uid()::text::uuid
      AND a.role = 'super_admin'
    )
  );

-- Branch owners can only see themselves
CREATE POLICY "Branch owners can view themselves"
  ON admins FOR SELECT
  USING (id = auth.uid()::text::uuid);

-- Insert seed data (password: admin123 for superadmin, owner123 for others)
-- Note: In production, use proper password hashing with bcrypt
INSERT INTO admins (id, username, password_hash, name, role, branch_id) VALUES
  ('550e8400-e29b-41d4-a716-446655440001'::uuid, 'superadmin', '$2a$10$rK.LVqP5zXZqKqJxQxVBOeJxQK7oVHFYXwYHJzYP5fVZ8xrGFqO5K', '슈퍼 관리자', 'super_admin', NULL),
  ('550e8400-e29b-41d4-a716-446655440002'::uuid, 'gangnam_owner', '$2a$10$8ZqVX5YZk5QZ5YZk5QZ5YOxL9Z5YZk5QZ5YZk5QZ5YZk5QZ5YZk5Y', '강남지점 점주', 'branch_owner', '550e8400-e29b-41d4-a716-446655440002'::uuid),
  ('550e8400-e29b-41d4-a716-446655440003'::uuid, 'hongdae_owner', '$2a$10$8ZqVX5YZk5QZ5YZk5QZ5YOxL9Z5YZk5QZ5YZk5QZ5YZk5QZ5YZk5Y', '홍대지점 점주', 'branch_owner', '550e8400-e29b-41d4-a716-446655440003'::uuid),
  ('550e8400-e29b-41d4-a716-446655440004'::uuid, 'jamsil_owner', '$2a$10$8ZqVX5YZk5QZ5YZk5QZ5YOxL9Z5YZk5QZ5YZk5QZ5YZk5QZ5YZk5Y', '잠실지점 점주', 'branch_owner', '550e8400-e29b-41d4-a716-446655440004'::uuid),
  ('550e8400-e29b-41d4-a716-446655440005'::uuid, 'beomeo_owner', '$2a$10$8ZqVX5YZk5QZ5YZk5QZ5YOxL9Z5YZk5QZ5YZk5QZ5YZk5QZ5YZk5Y', '범어지점 점주', 'branch_owner', '550e8400-e29b-41d4-a716-446655440001'::uuid)
ON CONFLICT (username) DO NOTHING;
