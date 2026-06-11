-- ╔══════════════════════════════════════════════════════════════════╗
-- ║  STEP 3 — ANALYTICS MIGRATION (Supabase SQL Editor or db:setup) ║
-- ║  Creates analytics_events, tool_usage, page_views, and          ║
-- ║  visitor_sessions tables + RLS policies                         ║
-- ╚══════════════════════════════════════════════════════════════════╝

-- ---------------------------------------------------------------------------
-- 1. Visitor Sessions
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS visitor_sessions (
  session_id TEXT PRIMARY KEY,
  country TEXT,
  device TEXT,
  browser TEXT,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_visitor_sessions_created ON visitor_sessions(created_at);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_country ON visitor_sessions(country);
CREATE INDEX IF NOT EXISTS idx_visitor_sessions_device ON visitor_sessions(device);

-- ---------------------------------------------------------------------------
-- 2. Page Views
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS page_views (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT REFERENCES visitor_sessions(session_id) ON DELETE CASCADE,
  route TEXT NOT NULL,
  referrer TEXT,
  country TEXT,
  device TEXT,
  browser TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_page_views_created ON page_views(created_at);
CREATE INDEX IF NOT EXISTS idx_page_views_session ON page_views(session_id);
CREATE INDEX IF NOT EXISTS idx_page_views_route ON page_views(route);

-- ---------------------------------------------------------------------------
-- 3. Tool Usage
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tool_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT REFERENCES visitor_sessions(session_id) ON DELETE CASCADE,
  tool_name TEXT NOT NULL,
  category TEXT,
  route TEXT,
  country TEXT,
  device TEXT,
  browser TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_tool_usage_created ON tool_usage(created_at);
CREATE INDEX IF NOT EXISTS idx_tool_usage_tool ON tool_usage(tool_name);
CREATE INDEX IF NOT EXISTS idx_tool_usage_category ON tool_usage(category);

-- ---------------------------------------------------------------------------
-- 4. Analytics Events
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT REFERENCES visitor_sessions(session_id) ON DELETE CASCADE,
  event_name TEXT NOT NULL,
  tool_name TEXT,
  route TEXT,
  metadata JSONB,
  country TEXT,
  device TEXT,
  browser TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_analytics_events_created ON analytics_events(created_at);
CREATE INDEX IF NOT EXISTS idx_analytics_events_name ON analytics_events(event_name);
CREATE INDEX IF NOT EXISTS idx_analytics_events_tool ON analytics_events(tool_name);

-- ---------------------------------------------------------------------------
-- Row Level Security (RLS) Policies
-- ---------------------------------------------------------------------------
ALTER TABLE visitor_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE tool_usage ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Select/Insert policies for all users (public) to insert analytics
DROP POLICY IF EXISTS "public_insert_sessions" ON visitor_sessions;
CREATE POLICY "public_insert_sessions" ON visitor_sessions FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "public_update_sessions" ON visitor_sessions;
CREATE POLICY "public_update_sessions" ON visitor_sessions FOR UPDATE USING (true);

DROP POLICY IF EXISTS "public_select_sessions" ON visitor_sessions;
CREATE POLICY "public_select_sessions" ON visitor_sessions FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_insert_page_views" ON page_views;
CREATE POLICY "public_insert_page_views" ON page_views FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "public_select_page_views" ON page_views;
CREATE POLICY "public_select_page_views" ON page_views FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_insert_tool_usage" ON tool_usage;
CREATE POLICY "public_insert_tool_usage" ON tool_usage FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "public_select_tool_usage" ON tool_usage;
CREATE POLICY "public_select_tool_usage" ON tool_usage FOR SELECT USING (true);

DROP POLICY IF EXISTS "public_insert_events" ON analytics_events;
CREATE POLICY "public_insert_events" ON analytics_events FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "public_select_events" ON analytics_events;
CREATE POLICY "public_select_events" ON analytics_events FOR SELECT USING (true);

-- Admin control policies (authenticated admin user can modify or view anything)
DROP POLICY IF EXISTS "admin_all_sessions" ON visitor_sessions;
CREATE POLICY "admin_all_sessions" ON visitor_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "admin_all_page_views" ON page_views;
CREATE POLICY "admin_all_page_views" ON page_views
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "admin_all_tool_usage" ON tool_usage;
CREATE POLICY "admin_all_tool_usage" ON tool_usage
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "admin_all_events" ON analytics_events;
CREATE POLICY "admin_all_events" ON analytics_events
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );
