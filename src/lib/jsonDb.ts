import fs from 'fs';
import path from 'path';

const DATA_DIR = path.join(process.cwd(), 'src/data');

function getFilePath(filename: string): string {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
  return path.join(DATA_DIR, filename);
}

function readJSON<T>(filename: string, defaultValue: T): T {
  const filePath = getFilePath(filename);
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify(defaultValue, null, 2), 'utf-8');
      return defaultValue;
    }
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data) as T;
  } catch (err) {
    console.error(`Error reading json file ${filename}:`, err);
    return defaultValue;
  }
}

function writeJSON<T>(filename: string, data: T): void {
  const filePath = getFilePath(filename);
  try {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error(`Error writing json file ${filename}:`, err);
  }
}

// Interfaces matching Prisma schema structures
export interface LocalTool {
  id: string;
  slug: string;
  title: string;
  description: string;
  longDesc?: string | null;
  categoryName: string;
  categorySlug: string;
  isPopular: boolean;
  isFeatured: boolean;
  isTrending: boolean;
  published: boolean;
  isPublished?: boolean;
  publishDate?: string | null;
  status?: 'draft' | 'scheduled' | 'published' | 'archived';
  icon?: string | null;
  thumbnail?: string | null;
  apiType?: string; // openai, gemini, claude, custom
  apiTypeId?: string | null;
  promptTemplate?: string | null;
  ctaButtonText: string;
  toolType: string;
  inputs: LocalToolInput[];
  faqs: LocalToolFaq[];
  articles: LocalToolArticle[];
  seoMetadata?: LocalSeoMetadata | null;
  createdAt: string;
  updatedAt: string;
}

export interface LocalToolInput {
  id: string;
  name: string;
  label: string;
  placeholder?: string | null;
  type: string;
  required: boolean;
  defaultValue?: string | null;
  options?: string | null;
  helperText?: string | null;
  order: number;
}

export interface LocalToolFaq {
  id: string;
  question: string;
  answer: string;
  order: number;
}

export interface LocalToolArticle {
  id: string;
  title: string;
  content: string;
}

export interface LocalSeoMetadata {
  title?: string | null;
  description?: string | null;
  keywords?: string | null;
}

export interface LocalBlogPost {
  id: string;
  slug: string;
  title: string;
  content: string;
  published: boolean;
  seoMetadata?: LocalSeoMetadata | null;
  createdAt: string;
  updatedAt: string;
}

export interface LocalContactLead {
  id: string;
  name: string;
  email: string;
  message: string;
  status: string; // new, pending, resolved
  notes?: string | null;
  createdAt: string;
}

export interface LocalUser {
  id: string;
  email: string;
  role: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface LocalMedia {
  id: string;
  filename: string;
  url: string;
  mimeType: string;
  size: number;
  createdAt: string;
}

export interface LocalApiConfig {
  id: string;
  name: string;
  provider: string; // openai, gemini, claude, custom
  apiKey: string;
  baseUrl?: string | null;
  defaultModel?: string | null;
  createdAt: string;
}

export interface LocalGlobalSetting {
  id: string;
  key: string;
  value: string;
  createdAt: string;
}

export const jsonDb = {
  getTools: () => readJSON<LocalTool[]>('dynamic_tools.json', [
    {
      id: 'bg-remover',
      slug: 'bg-remover',
      title: 'AI Background Remover',
      description: 'Remove image backgrounds automatically in seconds.',
      longDesc: 'Our advanced background removal tool leverages neural networks to identify and segment foreground elements, producing transparent PNGs with crisp details and smooth edges.',
      categoryName: 'Creative & Design',
      categorySlug: 'creative-design',
      isPopular: true,
      isFeatured: true,
      isTrending: false,
      published: true,
      isPublished: true,
      publishDate: null,
      status: 'published',
      icon: '🖼️',
      toolType: 'AI Image Tool',
      ctaButtonText: 'Remove Background',
      inputs: [
        { id: '1-1', name: 'image', label: 'Upload Image', type: 'file', required: true, order: 0 }
      ],
      faqs: [
        { id: '1-f1', question: 'What image formats are supported?', answer: 'We support PNG, JPG, and WebP images up to 10MB in size.', order: 0 }
      ],
      articles: [
        { id: '1-a1', title: 'Why background removal matters', content: 'Clean cutouts are essential for commercial product photography, web layouts, and corporate profiles.' }
      ],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]),
  saveTools: (tools: LocalTool[]) => writeJSON('dynamic_tools.json', tools),

  getBlogs: () => readJSON<LocalBlogPost[]>('dynamic_blogs.json', [
    {
      id: '1',
      slug: 'why-local-ocr-is-the-future',
      title: 'Why Browser-Native OCR is the Future of Data Safety',
      content: 'Traditional optical character recognition uploads documents to cloud databases. This article outlines the transition to client-side WebAssembly rendering, protecting sensitive data locally.',
      published: true,
      seoMetadata: {
        title: 'Local OCR WebAssembly Data Safety | ToolWala',
        description: 'Learn why processing character recognition inside the browser context outperforms cloud databases.'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  ]),
  saveBlogs: (blogs: LocalBlogPost[]) => writeJSON('dynamic_blogs.json', blogs),

  getLeads: () => readJSON<LocalContactLead[]>('dynamic_leads.json', []),
  saveLeads: (leads: LocalContactLead[]) => writeJSON('dynamic_leads.json', leads),

  getUsers: () => readJSON<LocalUser[]>('dynamic_users.json', [
    { id: 'u1', email: 'user@example.com', role: 'user', status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() },
    { id: 'u2', email: 'pro_user@example.com', role: 'premium', status: 'active', createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
  ]),
  saveUsers: (users: LocalUser[]) => writeJSON('dynamic_users.json', users),

  getMedia: () => readJSON<LocalMedia[]>('dynamic_media.json', []),
  saveMedia: (media: LocalMedia[]) => writeJSON('dynamic_media.json', media),

  getApiConfigs: () => readJSON<LocalApiConfig[]>('dynamic_api_configs.json', [
    { id: 'default-openai', name: 'OpenAI GPT-4o', provider: 'openai', apiKey: 'sk-mock-key-value', defaultModel: 'gpt-4o', createdAt: new Date().toISOString() }
  ]),
  saveApiConfigs: (configs: LocalApiConfig[]) => writeJSON('dynamic_api_configs.json', configs),

  getSettings: () => readJSON<LocalGlobalSetting[]>('dynamic_settings.json', [
    { id: 's1', key: 'site_title', value: 'ToolWala - AI Tools Suite', createdAt: new Date().toISOString() },
    { id: 's2', key: 'seo_description', value: 'Discover the future of utility tools with our dynamic AI marketplace.', createdAt: new Date().toISOString() }
  ]),
  saveSettings: (settings: LocalGlobalSetting[]) => writeJSON('dynamic_settings.json', settings)
};
