-- Create languages table
CREATE TABLE IF NOT EXISTS public.languages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  language_name VARCHAR(255) NOT NULL,
  language_code VARCHAR(10) UNIQUE NOT NULL,
  enabled BOOLEAN NOT NULL DEFAULT false,
  seo_enabled BOOLEAN NOT NULL DEFAULT false,
  display_order INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.languages ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public read access
CREATE POLICY "Allow public read access to languages" ON public.languages
  FOR SELECT USING (true);

-- Create policy to allow admins full control via service role
CREATE POLICY "Allow service_role full access to languages" ON public.languages
  TO service_role
  USING (true)
  WITH CHECK (true);
