# ToolWala AI

Privacy-first AI utilities platform — 34+ browser-local tools for PDFs, images, calculators, resumes, and more.

**Live:** [toolwala.co](https://toolwala.co)

---

## Architecture

```
┌─────────────────────────────────────────────────────────┐
│  Next.js 16 (Hybrid Static + API Routes)                │
│  ├── Public pages (SSG / client-side, SEO-optimized)    │
│  ├── /api/tools/public   → live tool registry           │
│  ├── /api/admin/*        → protected admin APIs         │
│  └── /api/ai/*           → secure AI proxy (no keys)    │
├─────────────────────────────────────────────────────────┤
│  Supabase                                               │
│  ├── Auth (admin login)                                 │
│  ├── PostgreSQL (tools, categories, analytics)          │
│  └── Row Level Security                                 │
└─────────────────────────────────────────────────────────┘
```

### Design principles

- **Mostly static** public pages for SEO and speed
- **Real database** for tool publish state (not localStorage)
- **API routes** only where needed (auth, admin, AI proxy)
- **Existing tool pages unchanged** — each tool keeps its own React page

---

## Quick Start

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

Copy `.env.example` to `.env.local` and fill in values:

```bash
cp .env.example .env.local
```

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | Supabase anon key |
| `SUPABASE_SERVICE_ROLE_KEY` | Yes | Server-only service key |
| `NEXT_PUBLIC_SITE_URL` | Yes | `https://toolwala.co` |
| `OPENAI_API_KEY` | For AI tools | Server-side only |
| `GEMINI_API_KEY` | For AI tools | Server-side only |

### 3. Set up Supabase database

Run the migration in Supabase SQL Editor:

```
supabase/migrations/001_initial_schema.sql
```

### 4. Create admin user

1. Create a user in **Supabase Auth** (email + password)
2. Set their role to admin:

```sql
UPDATE profiles SET role = 'admin' WHERE email = 'your@email.com';
```

### 5. Seed static tools into database

After logging in as admin, call:

```bash
curl -X POST http://localhost:3000/api/admin/tools/seed \
  -H "Cookie: <your-session-cookie>"
```

Or use the admin dashboard after first login.

### 6. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

---

## Folder Structure

```
src/
├── app/
│   ├── page.tsx              # Homepage
│   ├── login/                # Admin login (Supabase Auth)
│   ├── admin/                # Protected admin dashboard
│   ├── tools/                # Individual tool pages (34+)
│   ├── api/
│   │   ├── tools/public/     # Public tool registry API
│   │   ├── admin/            # Protected admin APIs
│   │   └── ai/               # Secure AI proxy
│   ├── sitemap.ts            # Dynamic sitemap (published tools only)
│   └── robots.ts             # robots.txt
├── components/               # UI components
├── data/
│   ├── tools.ts              # Static tool seed data
│   └── categories.ts         # Category metadata
├── lib/
│   ├── tools.ts              # Client tool helpers
│   ├── tools-server.ts       # Server/DB tool helpers (single source of truth)
│   ├── seo.ts                # SEO metadata builders
│   ├── ai/providers.ts       # OpenAI + Gemini (server-only)
│   └── supabase/             # Supabase clients
├── types/database.ts         # DB types
supabase/migrations/          # SQL schema
tests/smoke/                  # Playwright smoke tests
middleware.ts                 # Admin route protection
```

---

## Admin Workflow

### Login

Navigate to `/login` (not `/admin/login`). Middleware protects all `/admin/*` routes.

### Tool Publish System

| Action | Result |
|--------|--------|
| **Publish** | `status: published`, `isVisible: true` |
| **Unpublish** | `status: draft`, `isVisible: false` |
| **Schedule** | `status: scheduled`, `publishDate` set |
| **Feature/Trending/Popular** | Toggle boolean flags |

**Live rule:** A tool is public only when:

```
status === "published" AND isVisible === true
```

Scheduled tools auto-publish when `publishDate` passes (checked on each API call).

### Admin pages

| Route | Purpose |
|-------|---------|
| `/admin` | Dashboard overview |
| `/admin/tools` | Tool registry (publish/schedule/feature) |
| `/admin/content` | CMS for dynamic AI tools |
| `/admin/guide` | Publishing playbook |

---

## Tool Registry (Single Source of Truth)

```
Static seed (src/data/tools.ts)
        ↓ seed/upsert
Supabase tools table
        ↓ merge on read
lib/tools-server.ts
        ↓
/api/tools/public  →  homepage, categories, sitemap
```

### Key functions

| Function | Location | Purpose |
|----------|----------|---------|
| `getPublicTools()` | `tools-server.ts` | Published + visible tools |
| `getAdminTools()` | `tools-server.ts` | All tools for admin |
| `getToolBySlug()` | `tools-server.ts` | Single tool lookup |
| `fetchPublicTools()` | `tools.ts` | Client-side API fetch |

---

## AI Tools

AI tools (caption generator, text humanizer, etc.) call `/api/ai/run` which proxies to OpenAI or Gemini server-side. API keys are **never** exposed to the browser.

```typescript
// Client calls:
POST /api/ai/run
{ slug: "caption-generator", inputs: { topic: "..." } }

// Server uses OPENAI_API_KEY or GEMINI_API_KEY from .env.local
```

---

## SEO System

- **Sitemap** (`/sitemap.xml`) — only published + visible tools
- **robots.txt** — blocks `/admin/`, `/api/`, `/login`
- **Per-page metadata** — OpenGraph, Twitter cards, canonical URLs
- **JSON-LD** — Organization, WebSite, SoftwareApplication schemas

---

## Deployment

### Vercel (recommended)

1. Connect GitHub repo
2. Set environment variables from `.env.example`
3. Deploy — Next.js handles API routes + static pages

### cPanel / Node.js

```bash
npm run build
npm run start
```

Use `server.js` with Phusion Passenger if needed. Update `.htaccess` for reverse proxy.

### Static export note

This project uses **hybrid mode** (not `output: 'export'`) to support API routes, middleware, and Supabase Auth. Public pages are still statically generated where possible.

---

## Testing

```bash
# Run all smoke tests
npm run test:smoke

# Run full test suite
npm test
```

Tests cover: homepage, critical tools (PDF, BG remover, OCR, calculators, AI), admin security, SEO.

---

## Security

- No hardcoded admin credentials
- Supabase Auth with middleware protection
- Admin API routes require authenticated admin session
- AI keys stored in `.env.local` only
- `robots.txt` blocks admin routes
- RLS policies on Supabase tables

---

## Tech Stack

- **Next.js 16** + **React 19** + **TypeScript**
- **Tailwind CSS 4** + **Framer Motion**
- **Supabase** (Auth, PostgreSQL, RLS)
- **OpenAI / Gemini** (server-side AI proxy)
- **Playwright** (smoke tests)

---

## License

Private — ToolWala AI © 2026
