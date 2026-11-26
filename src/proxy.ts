import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { landingPagesData } from '@/data/landingPages';

const PROTECTED_ADMIN_PREFIXES = ['/admin', '/api/admin'];
const LOCALES = ['hi', 'es', 'fr', 'de', 'pt', 'ar', 'id'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Apex to www 301 permanent redirect
  const hostHeader = (request.headers.get('host') || '').toLowerCase();
  const rawHost = hostHeader.split(':')[0];
  if (rawHost === 'toolwala.co') {
    const wwwUrl = new URL(request.nextUrl.pathname + request.nextUrl.search, 'https://www.toolwala.co');
    return NextResponse.redirect(wwwUrl, { status: 301 });
  }

  // 0. 301 redirect accidental nested full URLs (e.g. /https://toolwala.co/...)
  const decodedPath = decodeURIComponent(pathname);
  if (
    pathname.startsWith('/http:/') ||
    pathname.startsWith('/https:/') ||
    decodedPath.startsWith('/http:/') ||
    decodedPath.startsWith('/https:/') ||
    (decodedPath.includes('toolwala.co') && decodedPath !== '/toolwala.co')
  ) {
    const match = decodedPath.match(/https?:\/\/[^\/]+(\/.*)$/);
    if (match && match[1]) {
      const target = match[1].endsWith('/') ? match[1] : `${match[1]}/`;
      return NextResponse.redirect(new URL(target + request.nextUrl.search, request.url), { status: 301 });
    }
  }

  // Bypass proxy for all public API routes to preserve POST request bodies
  const isAdminApi = pathname.startsWith('/api/admin') || pathname.startsWith('/api/admin/');
  if (pathname.startsWith('/api') && !isAdminApi) {
    return NextResponse.next();
  }

  // Block & redirect standard /login and /admin/login to home / to hide login route from hackers
  if (pathname === '/login' || pathname === '/login/' || pathname === '/admin/login' || pathname === '/admin/login/') {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // 1. Detect if pathname starts with a locale prefix (e.g. /hi/, /es/)
  const pathnameParts = pathname.split('/');
  const localeCandidate = pathnameParts[1];
  const isLocalePrefix = LOCALES.includes(localeCandidate);
  const locale = isLocalePrefix ? localeCandidate : 'en';

  // Compute rewritten pathname (without the locale prefix if present)
  let rewrittenPathname = pathname;
  if (isLocalePrefix) {
    const { getEnabledLocales } = require('@/lib/languages');
    const enabledLocales = getEnabledLocales();
    
    // 301 Redirect to English equivalent if locale is disabled
    if (!enabledLocales.includes(localeCandidate)) {
      const targetPath = '/' + pathnameParts.slice(2).join('/');
      let redirectPath = targetPath;
      if (!redirectPath.startsWith('/')) {
        redirectPath = '/' + redirectPath;
      }
      if (pathname.endsWith('/') && !redirectPath.endsWith('/')) {
        redirectPath += '/';
      }
      const redirectUrl = new URL(redirectPath + request.nextUrl.search, request.url);
      const response = NextResponse.redirect(redirectUrl, { status: 301 });
      response.cookies.set('NEXT_LOCALE', 'en', { path: '/' });
      return response;
    }

    rewrittenPathname = '/' + pathnameParts.slice(2).join('/');
    if (!rewrittenPathname.endsWith('/') && request.nextUrl.pathname.endsWith('/')) {
      rewrittenPathname += '/';
    }
  }

  const normalizedRewritten = rewrittenPathname.endsWith('/') ? rewrittenPathname : rewrittenPathname + '/';

  // 301 redirect India-only tools and landing pages mistakenly requested with non-en/hi locales (e.g. /es/tools/ssc-photo-resize/ -> /tools/ssc-photo-resize/)
  const INDIA_ONLY_SLUGS_SET = new Set([
    'ssc-photo-resize',
    'upsc-photo-resize',
    'crop-aadhaar-card',
    'aadhaar-pdf-compressor',
    'aadhaar-masking-tool',
    'pan-card-resize',
    'income-tax-calculator',
    'gst-calculator',
    'exam-marks-calculator',
    'exam-photo-resizer',
    'gov-form-image-compressor',
    'gov-form-pdf-compressor',
    'photo-resize-to-20kb',
    'photo-resize-to-50kb',
    'photo-resize-to-100kb',
    'signature-resize-to-20kb',
    'signature-resize-to-50kb',
    'compress-image-to-20kb',
    'compress-image-to-50kb',
    'compress-pdf-to-100kb',
    'compress-pdf-to-200kb',
    'image-resize-in-kb',
    'compress-image-government-portals',
    'how-to-calculate-exam-percentage-easily',
  ]);

  if (isLocalePrefix && locale !== 'hi') {
    const slug = pathnameParts.filter(Boolean).pop();
    if (slug && INDIA_ONLY_SLUGS_SET.has(slug)) {
      const redirectUrl = new URL(normalizedRewritten + request.nextUrl.search, request.url);
      const response = NextResponse.redirect(redirectUrl, { status: 301 });
      response.cookies.set('NEXT_LOCALE', 'en', { path: '/' });
      return response;
    }
  }

  // 301 redirect legacy & duplicate tool routes
  const LEGACY_TOOL_REDIRECTS: Record<string, string> = {
    '/tools/aadhaar-photo-resizer/': '/tools/crop-aadhaar-card/',
    '/tools/aadhaar-photo-resize/': '/tools/crop-aadhaar-card/',
    '/tools/aadhar-card-cropper/': '/tools/crop-aadhaar-card/',
    '/tools/crop-aadhar-card/': '/tools/crop-aadhaar-card/',
    '/tools/pan-photo-tool/': '/tools/pan-card-resize/',
    '/tools/signature-crop-tool/': '/tools/signature-resize/',
    '/tools/pdf-tools/': '/categories/pdf-tools/',
    '/tools/pdf-tools/edit-pdf/': '/tools/edit-pdf/',
  };

  if (LEGACY_TOOL_REDIRECTS[normalizedRewritten]) {
    const targetBase = LEGACY_TOOL_REDIRECTS[normalizedRewritten];
    const targetPath = isLocalePrefix ? `/${locale}${targetBase}` : targetBase;
    return NextResponse.redirect(new URL(targetPath + request.nextUrl.search, request.url), { status: 301 });
  }

  // 301 redirect legacy blog post slugs to active replacements
  const LEGACY_BLOG_REDIRECTS: Record<string, string> = {
    'why-pan-card-document-upload-failed': '/blog/resize-photo-signature-pan-card-application/',
    'indian-government-scheme-document-sizes': '/blog/upload-documents-government-portals/',
    'nsdl-pan-card-document-specifications': '/blog/resize-photo-signature-pan-card-application/',
    'resize-upsc-signature-350x350-pixels': '/blog/upsc-photo-signature-resize-specifications/',
    'compress-image-government-portals': '/blog/upload-documents-government-portals/',
    'ibps-po-photo-signature-upload-requirements': '/blog/ibps-bank-exam-photo-signature-size-spec/',
    'ssc-cgl-photo-signature-specifications': '/blog/upload-photo-signature-ssc-application/',
    'neet-ug-photo-document-upload-specifications': '/blog/upload-documents-government-portals/',
    'railway-exam-photo-resize': '/blog/rrb-alp-photo-signature-size-guidelines/',
    'resize-photo-signature-rrb-group-d': '/blog/rrb-alp-photo-signature-size-guidelines/',
    'passport-photo-size-online': '/blog/passport-size-photo-maker-online-free/',
    'why-ssc-rejected-application-photo-solutions': '/blog/new-ssc-photo-guidelines-live-upload/',
    'image-resize-in-kb': '/blog/photo-resize-to-20kb/',
    'compress-jpg-images-kb-limit': '/blog/photo-resize-to-20kb/',
    'compress-pan-card-pdf-limit': '/blog/resize-photo-signature-pan-card-application/',
    'compress-passport-pdf-scans-1mb': '/blog/upload-passport-documents-seva-portal/',
    'pan-card-photo-resize': '/tools/pan-card-resize/',
    'aadhaar-photo-resize': '/tools/crop-aadhaar-card/',
  };

  // 301 redirect tool categories mistakenly accessed under /blog/category/
  if (rewrittenPathname.startsWith('/blog/category/')) {
    const parts = rewrittenPathname.split('/').filter(Boolean);
    const catSlug = parts[2];
    if (catSlug) {
      const cleanCatSlug = catSlug.replace(/-&-/g, '-');
      const toolCategories = [
        'resume-career',
        'calculator-tools',
        'developer-tools',
        'utility-tools',
        'financial-calculators',
        'social-media',
        'ai-tools',
        'image-tools',
        'pdf-tools',
      ];
      if (toolCategories.includes(cleanCatSlug)) {
        const targetPath = isLocalePrefix ? `/${locale}/categories/${cleanCatSlug}/` : `/categories/${cleanCatSlug}/`;
        return NextResponse.redirect(new URL(targetPath + request.nextUrl.search, request.url), { status: 301 });
      }
    }
  }

  if (rewrittenPathname.startsWith('/blog/')) {
    const parts = rewrittenPathname.split('/').filter(Boolean);
    const blogSlug = parts[1];
    if (blogSlug) {
      if (LEGACY_BLOG_REDIRECTS[blogSlug]) {
        const targetBase = LEGACY_BLOG_REDIRECTS[blogSlug];
        const targetPath = isLocalePrefix ? `/${locale}${targetBase}` : targetBase;
        return NextResponse.redirect(new URL(targetPath + request.nextUrl.search, request.url), { status: 301 });
      }
      // If a landing page was accessed as /blog/[slug]/, redirect to /landing/[slug]/
      if (landingPagesData.some((lp) => lp.slug === blogSlug)) {
        const targetPath = isLocalePrefix ? `/${locale}/landing/${blogSlug}/` : `/landing/${blogSlug}/`;
        return NextResponse.redirect(new URL(targetPath + request.nextUrl.search, request.url), { status: 301 });
      }
    }
  }

  // 301 redirect legacy tool category subpaths
  const CATEGORY_SLUGS = [
    'image-tools',
    'pdf-tools',
    'ai-tools',
    'resume-career',
    'financial-calculators',
    'document-tools',
    'developer-tools',
    'social-media',
  ];

  if (rewrittenPathname.startsWith('/tools/')) {
    const parts = rewrittenPathname.split('/').filter(Boolean);
    if (parts.length >= 3 && CATEGORY_SLUGS.includes(parts[1])) {
      const toolSlug = parts[2];
      const targetPath = isLocalePrefix ? `/${locale}/tools/${toolSlug}/` : `/tools/${toolSlug}/`;
      return NextResponse.redirect(new URL(targetPath + request.nextUrl.search, request.url), { status: 301 });
    }
  }

  // 301 redirect landing pages from /tools/[slug]/ to /landing/[slug]/
  if (rewrittenPathname.startsWith('/tools/')) {
    const parts = rewrittenPathname.split('/');
    const slug = parts[2];
    if (slug && landingPagesData.some(lp => lp.slug === slug)) {
      const targetPath = isLocalePrefix ? `/${locale}/landing/${slug}/` : `/landing/${slug}/`;
      return NextResponse.redirect(new URL(targetPath + request.nextUrl.search, request.url), { status: 301 });
    }
  }

  // 301 redirect raw Hindi translated routes
  const decodedPathname = decodeURIComponent(pathname);
  if (
    decodedPathname.startsWith('/टूल/') ||
    decodedPathname.startsWith('/टूल्स/') ||
    decodedPathname.startsWith('/ब्लॉग/')
  ) {
    let targetPath = '/hi/tools/';
    if (decodedPathname.startsWith('/टूल/') || decodedPathname.startsWith('/टूल्स/')) {
      const slug = decodedPathname.replace(/^\/(?:टूल|टूल्स)\//, '').replace(/\/$/, '');
      if (slug === 'प्रोटेक्ट-पीडीएफ') {
        targetPath = '/hi/tools/protect-pdf/';
      } else if (slug === 'पासपोर्ट-फोटो-मेकर') {
        targetPath = '/hi/tools/passport-photo-maker/';
      } else if (slug) {
        targetPath = `/hi/tools/${slug}/`;
      }
    } else if (decodedPathname.startsWith('/ब्लॉग/')) {
      const slug = decodedPathname.replace('/ब्लॉग/', '').replace(/\/$/, '');
      if (slug === 'आकार-फोटो-हस्ताक्षर-पैन-कार्ड-आवेदन') {
        targetPath = '/hi/blog/resize-photo-signature-pan-card-application/';
      } else if (slug) {
        targetPath = `/hi/blog/${slug}/`;
      } else {
        targetPath = '/hi/blog/';
      }
    }
    return NextResponse.redirect(new URL(targetPath + request.nextUrl.search, request.url), { status: 301 });
  }

  // 2. Handle saved language redirect on root "/"
  if (pathname === '/' && !isLocalePrefix) {
    const cookieLocale = request.cookies.get('NEXT_LOCALE')?.value;
    if (cookieLocale && cookieLocale !== 'en' && LOCALES.includes(cookieLocale)) {
      const { getEnabledLocales } = require('@/lib/languages');
      const enabledLocales = getEnabledLocales();
      if (enabledLocales.includes(cookieLocale)) {
        const userAgent = request.headers.get('user-agent') || '';
        const isBot = /bot|googlebot|crawler|spider|robot|crawling/i.test(userAgent);
        if (!isBot) {
          return NextResponse.redirect(new URL(`/${cookieLocale}/`, request.url));
        }
      }
    }
  }

  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-locale', locale);
  requestHeaders.set('x-original-pathname', pathname);

  const isProtected = PROTECTED_ADMIN_PREFIXES.some(
    (prefix) => rewrittenPathname === prefix || rewrittenPathname.startsWith(`${prefix}/`)
  );

  const supabaseConfigured =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  const allCookies = request.cookies.getAll();
  const hasAuthCookie = allCookies.some(c => c.name.startsWith('sb-') && (c.name.includes('token') || c.name.includes('auth')));

  // Protect preview / staging deployments (non-canonical domains) from search indexing
  const isProductionDomain =
    rawHost === 'www.toolwala.co' ||
    rawHost === 'localhost' ||
    rawHost === '127.0.0.1';

  const finalizeResponse = (res: NextResponse) => {
    if (!isProductionDomain) {
      res.headers.set('X-Robots-Tag', 'noindex, nofollow');
    }
    return res;
  };

  // Fast path for non-protected routes without auth cookies (drastically saves Vercel Fluid CPU)
  if (!isProtected && !hasAuthCookie) {
    let response: NextResponse;
    if (isLocalePrefix) {
      const rewriteUrl = new URL(rewrittenPathname + request.nextUrl.search, request.url);
      response = NextResponse.rewrite(rewriteUrl, {
        request: { headers: requestHeaders }
      });
    } else {
      response = NextResponse.rewrite(request.nextUrl, {
        request: { headers: requestHeaders }
      });
    }
    return finalizeResponse(response);
  }

  if (!supabaseConfigured) {
    let response: NextResponse;
    if (isLocalePrefix) {
      const rewriteUrl = new URL(rewrittenPathname + request.nextUrl.search, request.url);
      response = NextResponse.rewrite(rewriteUrl, {
        request: { headers: requestHeaders }
      });
    } else {
      response = NextResponse.rewrite(request.nextUrl, {
        request: { headers: requestHeaders }
      });
    }
    return finalizeResponse(response);
  }

  // Run Supabase session updates for logged-in or protected routes
  const { supabaseResponse, user } = await updateSession(request);

  if (!isProtected) {
    let response: NextResponse;
    if (isLocalePrefix) {
      const rewriteUrl = new URL(rewrittenPathname + request.nextUrl.search, request.url);
      response = NextResponse.rewrite(rewriteUrl, {
        request: { headers: requestHeaders }
      });
    } else {
      response = NextResponse.rewrite(request.nextUrl, {
        request: { headers: requestHeaders }
      });
    }
    
    // Sync Supabase cookies
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value);
    });
    return finalizeResponse(response);
  }

  // Admin protection logic: Redirect if unauthenticated
  if (!user) {
    const loginUrl = new URL('/control-access', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value);
    });
    return finalizeResponse(response);
  }

  // Authorized user accessing admin route - forward without Edge DB bottleneck
  let response: NextResponse;
  if (isLocalePrefix) {
    const rewriteUrl = new URL(rewrittenPathname + request.nextUrl.search, request.url);
    response = NextResponse.rewrite(rewriteUrl, {
      request: { headers: requestHeaders }
    });
  } else {
    response = NextResponse.next({
      request: { headers: requestHeaders }
    });
  }
  supabaseResponse.cookies.getAll().forEach((cookie) => {
    response.cookies.set(cookie.name, cookie.value);
  });
  return finalizeResponse(response);
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icon.png|icon-192.png|icon-512.png|apple-touch-icon.png|manifest.json|robots.txt|sitemap.xml).*)',
  ],
};
