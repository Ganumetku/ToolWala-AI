-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  STEP 1 — PEHLE YE FILE RUN KARO (Supabase SQL Editor → Run)    ║
-- ║  Ye profiles, tools, categories tables banayegi                  ║
-- ║  Admin SQL TABHI chalega jab ye success ho jaye                  ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ---------------------------------------------------------------------------
-- Categories
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE,
  slug        TEXT NOT NULL UNIQUE,
  description TEXT,
  icon        TEXT DEFAULT '📁',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Tools (single source of truth)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tools (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name         TEXT NOT NULL,
  slug         TEXT NOT NULL UNIQUE,
  description  TEXT NOT NULL,
  category     TEXT NOT NULL,
  status       TEXT NOT NULL DEFAULT 'draft'
                 CHECK (status IN ('draft', 'scheduled', 'published', 'archived')),
  is_visible   BOOLEAN NOT NULL DEFAULT false,
  featured     BOOLEAN NOT NULL DEFAULT false,
  popular      BOOLEAN NOT NULL DEFAULT false,
  trending     BOOLEAN NOT NULL DEFAULT false,
  publish_date TIMESTAMPTZ,
  icon         TEXT DEFAULT '🔧',
  href         TEXT,
  tags         TEXT[] DEFAULT '{}',
  tool_type    TEXT,
  long_desc    TEXT,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tools_slug ON tools(slug);
CREATE INDEX IF NOT EXISTS idx_tools_status_visible ON tools(status, is_visible);
CREATE INDEX IF NOT EXISTS idx_tools_category ON tools(category);

-- ---------------------------------------------------------------------------
-- Scheduled publishes
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS scheduled_publishes (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id      UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,
  scheduled_at TIMESTAMPTZ NOT NULL,
  executed_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scheduled_pending
  ON scheduled_publishes(scheduled_at)
  WHERE executed_at IS NULL;

-- ---------------------------------------------------------------------------
-- Tool analytics
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tool_analytics (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_id    UUID REFERENCES tools(id) ON DELETE SET NULL,
  tool_slug  TEXT,
  event_type TEXT NOT NULL,
  session_id TEXT,
  path       TEXT,
  source     TEXT DEFAULT 'Direct',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_tool_slug ON tool_analytics(tool_slug);
CREATE INDEX IF NOT EXISTS idx_analytics_created ON tool_analytics(created_at);

-- ---------------------------------------------------------------------------
-- User profiles (extends Supabase Auth)
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS profiles (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email      TEXT,
  role       TEXT NOT NULL DEFAULT 'user'
               CHECK (role IN ('user', 'admin', 'premium')),
  status     TEXT NOT NULL DEFAULT 'active'
               CHECK (status IN ('active', 'blocked')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role)
  VALUES (NEW.id, NEW.email, 'user');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ---------------------------------------------------------------------------
-- updated_at trigger
-- ---------------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tools_updated_at ON tools;
CREATE TRIGGER tools_updated_at
  BEFORE UPDATE ON tools
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS categories_updated_at ON categories;
CREATE TRIGGER categories_updated_at
  BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE tools ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE scheduled_publishes ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "public_read_live_tools" ON tools;
CREATE POLICY "public_read_live_tools" ON tools
  FOR SELECT USING (
    status = 'published' AND is_visible = true
    OR (
      status = 'scheduled'
      AND is_visible = true
      AND publish_date IS NOT NULL
      AND publish_date <= now()
    )
  );

DROP POLICY IF EXISTS "admin_all_tools" ON tools;
CREATE POLICY "admin_all_tools" ON tools
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "public_read_categories" ON categories;
CREATE POLICY "public_read_categories" ON categories
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "admin_all_categories" ON categories;
CREATE POLICY "admin_all_categories" ON categories
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "public_insert_analytics" ON tool_analytics;
CREATE POLICY "public_insert_analytics" ON tool_analytics
  FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "admin_read_analytics" ON tool_analytics;
CREATE POLICY "admin_read_analytics" ON tool_analytics
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "users_read_own_profile" ON profiles;
CREATE POLICY "users_read_own_profile" ON profiles
  FOR SELECT USING (auth.uid() = id);

DROP POLICY IF EXISTS "admin_all_profiles" ON profiles;
CREATE POLICY "admin_all_profiles" ON profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles p
      WHERE p.id = auth.uid() AND p.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "admin_scheduled_publishes" ON scheduled_publishes;
CREATE POLICY "admin_scheduled_publishes" ON scheduled_publishes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- ---------------------------------------------------------------------------
-- Seed default categories
-- ---------------------------------------------------------------------------
INSERT INTO categories (name, slug, description, icon) VALUES
  ('AI Tools', 'ai-tools', 'AI-powered text and voice utilities', '🤖'),
  ('Image Tools', 'image-tools', 'Image editing and optimization', '🖼️'),
  ('PDF Tools', 'pdf-tools', 'PDF manipulation suite', '📄'),
  ('Calculator Tools', 'calculator-tools', 'Financial and utility calculators', '🧮'),
  ('Utility Tools', 'utility-tools', 'General purpose utilities', '🔧'),
  ('Social Media Tools', 'social-media-tools', 'Social media helpers', '📱'),
  ('Document Tools', 'document-tools', 'Document generation', '📝'),
  ('Resume & Career', 'resume-career', 'Career and resume tools', '💼'),
  ('Developer Tools', 'developer-tools', 'Developer utilities', '👨‍💻')
ON CONFLICT (slug) DO NOTHING;

-- ✅ DONE! Ab Authentication → Users → Add user karo
-- ✅ Phir RUN_THIS_SECOND.sql run karo
