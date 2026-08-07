/** @type {import('next').NextConfig} */
const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com;
  style-src 'self' 'unsafe-inline' https://fonts.googleapis.com;
  img-src 'self' blob: data: https://*.supabase.co https://images.unsplash.com https://www.google-analytics.com https://www.googletagmanager.com;
  font-src 'self' data: https://fonts.gstatic.com;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'self';
  worker-src 'self' blob:;
  child-src 'self' blob:;
  connect-src 'self' https://*.supabase.co https://www.google-analytics.com https://stats.g.doubleclick.net https://vitals.vercel-insights.com;
  upgrade-insecure-requests;
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
    optimizePackageImports: ['lucide-react', 'framer-motion', 'recharts'],
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
            value: 'origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), payment=(), usb=()',
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
        source: '/tools/aadhaar-photo-resize',
        destination: '/tools/crop-aadhaar-card/',
        permanent: true,
      },
      {
        source: '/tools/aadhar-card-cropper',
        destination: '/tools/crop-aadhaar-card/',
        permanent: true,
      },
      {
        source: '/tools/crop-aadhar-card',
        destination: '/tools/crop-aadhaar-card/',
        permanent: true,
      },
    ];
  },
};

module.exports = nextConfig;
