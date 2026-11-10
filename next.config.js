/** @type {import('next').NextConfig} */
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' 'wasm-unsafe-eval' blob: https://www.googletagmanager.com https://www.google-analytics.com https://unpkg.com https://cdn.jsdelivr.net https://staticimgly.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https://*.supabase.co https://images.unsplash.com https://www.google-analytics.com https://www.googletagmanager.com https://staticimgly.com;
  font-src 'self' data: https://fonts.gstatic.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'self';
  frame-src 'self' https://editor.toolwala.co;
  worker-src 'self' blob: https://unpkg.com https://cdn.jsdelivr.net https://staticimgly.com;
  child-src 'self' blob: https://editor.toolwala.co;
  connect-src 'self' blob: data: https://unpkg.com https://cdn.jsdelivr.net https://*.supabase.co https://www.google-analytics.com https://stats.g.doubleclick.net https://vitals.vercel-insights.com https://staticimgly.com;
`.replace(/\s{2,}/g, ' ').trim();

const nextConfig = {
  trailingSlash: true,
  compress: true,
  poweredByHeader: false,
  images: {
    unoptimized: false,
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
  },
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Hybrid: static pages + API routes (no full static export)
  experimental: {
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts', 'sonner', 'fuse.js'],
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: cspHeader,
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
          },
          {
            key: 'Cross-Origin-Opener-Policy',
            value: 'same-origin',
          },
          {
            key: 'Cross-Origin-Embedder-Policy',
            value: 'credentialless',
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/tools/aadhaar-photo-resizer',
        destination: '/tools/crop-aadhaar-card/',
        permanent: true,
      },
      {
        source: '/:locale(hi|es|pt)/tools/aadhaar-photo-resizer',
        destination: '/:locale/tools/crop-aadhaar-card/',
        permanent: true,
      },
      {
        source: '/tools/aadhaar-photo-resize',
        destination: '/tools/crop-aadhaar-card/',
        permanent: true,
      },
      {
        source: '/:locale(hi|es|pt)/tools/aadhaar-photo-resize',
        destination: '/:locale/tools/crop-aadhaar-card/',
        permanent: true,
      },
      {
        source: '/tools/aadhar-card-cropper',
        destination: '/tools/crop-aadhaar-card/',
        permanent: true,
      },
      {
        source: '/:locale(hi|es|pt)/tools/aadhar-card-cropper',
        destination: '/:locale/tools/crop-aadhaar-card/',
        permanent: true,
      },
      {
        source: '/tools/crop-aadhar-card',
        destination: '/tools/crop-aadhaar-card/',
        permanent: true,
      },
      {
        source: '/:locale(hi|es|pt)/tools/crop-aadhar-card',
        destination: '/:locale/tools/crop-aadhaar-card/',
        permanent: true,
      },
      {
        source: '/tools/pan-photo-tool',
        destination: '/tools/pan-card-resize/',
        permanent: true,
      },
      {
        source: '/:locale(hi|es|pt)/tools/pan-photo-tool',
        destination: '/:locale/tools/pan-card-resize/',
        permanent: true,
      },
      {
        source: '/tools/signature-crop-tool',
        destination: '/tools/signature-resize/',
        permanent: true,
      },
      {
        source: '/:locale(hi|es|pt)/tools/signature-crop-tool',
        destination: '/:locale/tools/signature-resize/',
        permanent: true,
      },
      {
        source: '/tools/pdf-tools',
        destination: '/categories/pdf-tools/',
        permanent: true,
      },
      {
        source: '/:locale(hi|es|pt)/tools/pdf-tools',
        destination: '/:locale/categories/pdf-tools/',
        permanent: true,
      },
      {
        source: '/tools/pdf-tools/edit-pdf',
        destination: '/tools/edit-pdf/',
        permanent: true,
      },
      {
        source: '/:locale(hi|es|pt)/tools/pdf-tools/edit-pdf',
        destination: '/:locale/tools/edit-pdf/',
        permanent: true,
      },
      {
        source: '/hubs/pan-card-utilities',
        destination: '/tools/pan-card-resize/',
        permanent: true,
      },
      {
        source: '/:locale(hi|es|pt)/hubs/pan-card-utilities',
        destination: '/:locale/tools/pan-card-resize/',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
