-- ToolWala AI — Blog CMS Schema
-- Run after 001_initial_schema.sql

-- ---------------------------------------------------------------------------
-- Blog posts
-- ---------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS blog_posts (
  id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug                TEXT NOT NULL UNIQUE,
  title               TEXT NOT NULL,
  excerpt             TEXT NOT NULL DEFAULT '',
  content             TEXT NOT NULL DEFAULT '',
  thumbnail           TEXT,
  category            TEXT NOT NULL DEFAULT 'AI Tools',
  tags                TEXT[] NOT NULL DEFAULT '{}',
  featured            BOOLEAN NOT NULL DEFAULT false,
  trending            BOOLEAN NOT NULL DEFAULT false,
  status              TEXT NOT NULL DEFAULT 'draft'
                        CHECK (status IN ('draft', 'published')),
  published_at        TIMESTAMPTZ,
  author              JSONB NOT NULL DEFAULT '{"name": "ToolWala Editorial"}'::jsonb,
  seo_metadata        JSONB,
  faqs                JSONB NOT NULL DEFAULT '[]'::jsonb,
  related_tool_slugs  TEXT[] NOT NULL DEFAULT '{}',
  view_count          INTEGER NOT NULL DEFAULT 0,
  reading_time        TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX IF NOT EXISTS idx_blog_posts_status ON blog_posts(status);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published_at ON blog_posts(published_at DESC NULLS LAST);
CREATE INDEX IF NOT EXISTS idx_blog_posts_featured ON blog_posts(featured) WHERE featured = true;
CREATE INDEX IF NOT EXISTS idx_blog_posts_trending ON blog_posts(trending) WHERE trending = true;
CREATE INDEX IF NOT EXISTS idx_blog_posts_tags ON blog_posts USING GIN(tags);

DROP TRIGGER IF EXISTS blog_posts_updated_at ON blog_posts;
CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_published_blogs" ON blog_posts
  FOR SELECT USING (status = 'published');

CREATE POLICY "admin_all_blogs" ON blog_posts
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Service role bypasses RLS; anon key uses policies above.
