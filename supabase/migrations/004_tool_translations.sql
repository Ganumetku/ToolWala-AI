-- Create tool_translations table
CREATE TABLE IF NOT EXISTS public.tool_translations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  tool_slug VARCHAR(255) NOT NULL,
  locale VARCHAR(10) NOT NULL,
  title VARCHAR(255) NOT NULL,
  description TEXT NOT NULL,
  faq JSONB DEFAULT '[]'::jsonb,
  seo_title VARCHAR(255),
  seo_description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(tool_slug, locale)
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.tool_translations ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access to tool_translations" ON public.tool_translations
  FOR SELECT USING (true);

-- Create policy to allow admins full control via service role
CREATE POLICY "Allow service_role full access to tool_translations" ON public.tool_translations
  TO service_role
  USING (true)
  WITH CHECK (true);
