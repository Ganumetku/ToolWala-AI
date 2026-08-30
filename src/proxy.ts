import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { landingPagesData } from '@/data/landingPages';

const PROTECTED_ADMIN_PREFIXES = ['/admin', '/api/admin'];
const LOCALES = ['hi', 'es', 'fr', 'de', 'pt', 'ar', 'id'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

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

  // 301 redirect duplicate tool /tools/pan-photo-tool/ to /tools/pan-card-resize/
  if (normalizedRewritten === '/tools/pan-photo-tool/') {
    const targetPath = isLocalePrefix ? `/${locale}/tools/pan-card-resize/` : '/tools/pan-card-resize/';
    return NextResponse.redirect(new URL(targetPath + request.nextUrl.search, request.url), { status: 301 });
  }

  // 301 redirect legacy tool /tools/signature-crop-tool/ to /tools/signature-resize/
  if (normalizedRewritten === '/tools/signature-crop-tool/') {
    const targetPath = isLocalePrefix ? `/${locale}/tools/signature-resize/` : '/tools/signature-resize/';
    return NextResponse.redirect(new URL(targetPath + request.nextUrl.search, request.url), { status: 301 });
  }

  // 301 redirect legacy blog post slugs to active replacements
  const LEGACY_BLOG_REDIRECTS: Record<string, string> = {
    'why-pan-card-document-upload-failed': '/blog/resize-photo-signature-pan-card-application/',
    'indian-government-scheme-document-sizes': '/blog/upload-documents-government-portals/',
    'nsdl-pan-card-document-specifications': '/blog/resize-photo-signature-pan-card-application/',
    'resize-upsc-signature-350x350-pixels': '/blog/upsc-photo-signature-resize-specifications/',
  };

  if (rewrittenPathname.startsWith('/blog/')) {
    const parts = rewrittenPathname.split('/').filter(Boolean);
    const blogSlug = parts[1];
    if (blogSlug && LEGACY_BLOG_REDIRECTS[blogSlug]) {
      const targetBase = LEGACY_BLOG_REDIRECTS[blogSlug];
      const targetPath = isLocalePrefix ? `/${locale}${targetBase}` : targetBase;
      return NextResponse.redirect(new URL(targetPath + request.nextUrl.search, request.url), { status: 301 });
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
      if (parts[1] === 'pdf-tools' && parts[2] === 'edit-pdf') {
        // Valid route, do not redirect
      } else {
        const toolSlug = parts[2];
        const targetPath = isLocalePrefix ? `/${locale}/tools/${toolSlug}/` : `/tools/${toolSlug}/`;
        return NextResponse.redirect(new URL(targetPath + request.nextUrl.search, request.url), { status: 301 });
      }
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
  if (decodedPathname.startsWith('/टूल/') || decodedPathname.startsWith('/ब्लॉग/')) {
    let targetPath = '/hi/tools/';
    if (decodedPathname.startsWith('/टूल/')) {
      const slug = decodedPathname.replace('/टूल/', '').replace(/\/$/, '');
      if (slug === 'प्रोटेक्ट-पीडीएफ') {
        targetPath = '/hi/tools/protect-pdf/';
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
    return response;
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
    return response;
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
    return response;
  }

  // Admin protection logic: Redirect if unauthenticated
  if (!user) {
    const loginUrl = new URL('/control-access', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value);
    });
    return response;
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
  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|icon.png|icon-192.png|icon-512.png|apple-touch-icon.png|manifest.json|robots.txt|sitemap.xml).*)',
  ],
};
