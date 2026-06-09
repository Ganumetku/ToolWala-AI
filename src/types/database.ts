export type ToolStatus = 'draft' | 'scheduled' | 'published' | 'archived';

export interface DbTool {
  id: string;
  name: string;
  slug: string;
  description: string;
  category: string;
  status: ToolStatus;
  is_visible: boolean;
  featured: boolean;
  popular: boolean;
  trending: boolean;
  publish_date: string | null;
  icon: string | null;
  href: string | null;
  tags: string[] | null;
  tool_type: string | null;
  long_desc: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbCategory {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  created_at: string;
  updated_at: string;
}

export interface DbProfile {
  id: string;
  email: string | null;
  role: 'user' | 'admin' | 'premium';
  status: 'active' | 'blocked';
  created_at: string;
  updated_at: string;
}

export interface DbToolAnalytics {
  id: string;
  tool_id: string | null;
  tool_slug: string | null;
  event_type: string;
  session_id: string | null;
  path: string | null;
  source: string | null;
  created_at: string;
}

export interface DbScheduledPublish {
  id: string;
  tool_id: string;
  scheduled_at: string;
  executed_at: string | null;
  created_at: string;
}
