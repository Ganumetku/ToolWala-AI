-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  FIX: "Unauthorized. Admin access required." on login           ║
-- ║  Run this in Supabase SQL Editor AFTER user exists in Auth       ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- 1) Check auth user exists
SELECT id, email, created_at
FROM auth.users
WHERE email = 'developtechx@gmail.com';

-- 2) Check current profile (may be empty or role = 'user')
SELECT id, email, role, status
FROM profiles
WHERE email = 'developtechx@gmail.com';

-- 3) Force admin role (THIS FIXES LOGIN)
INSERT INTO profiles (id, email, role, status)
SELECT id, email, 'admin', 'active'
FROM auth.users
WHERE email = 'developtechx@gmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin', status = 'active', email = EXCLUDED.email;

-- 4) Verify — must show role = 'admin'
SELECT id, email, role, status
FROM profiles
WHERE email = 'developtechx@gmail.com';
