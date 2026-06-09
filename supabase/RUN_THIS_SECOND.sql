-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  STEP 2 — YE TAB RUN KARO jab:                                   ║
-- ║  1. RUN_THIS_FIRST.sql success ho chuka ho                       ║
-- ║  2. Authentication → Users → developtechx@gmail.com add ho     ║
-- ╚══════════════════════════════════════════════════════════════════╝

INSERT INTO profiles (id, email, role, status)
SELECT id, email, 'admin', 'active'
FROM auth.users
WHERE email = 'developtechx@gmail.com'
ON CONFLICT (id) DO UPDATE
SET role = 'admin', status = 'active';

-- ✅ Ab login karo: http://localhost:3000/login/
