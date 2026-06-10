export interface BlogAuthor {
  name: string;
  avatar?: string;
  role?: string;
}

export interface BlogSeoMetadata {
  title?: string | null;
  description?: string | null;
  keywords?: string | null;
}

export interface BlogFaq {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export type BlogStatus = 'draft' | 'published';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  thumbnail: string;
  category: string;
  tags: string[];
  featured: boolean;
  trending: boolean;
  status: BlogStatus;
  publishedAt: string;
  createdAt: string;
  updatedAt: string;
  author: BlogAuthor;
  seoMetadata?: BlogSeoMetadata | null;
  faqs: BlogFaq[];
  relatedToolSlugs: string[];
  viewCount: number;
  readingTime: string;
}

export const BLOG_CATEGORIES = [
  'AI Tools',
  'PDF Tools',
  'Image Editing',
  'Productivity',
  'SEO',
  'Tutorials',
  'Online Utilities',
  'Document Tools',
] as const;

export type BlogCategory = (typeof BLOG_CATEGORIES)[number];

export const BLOG_PAGE_SIZE = 9;
