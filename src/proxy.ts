import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const PROTECTED_ADMIN_PREFIXES = ['/admin', '/api/admin'];
const LOCALES = ['hi', 'es', 'fr', 'de', 'pt', 'ar', 'id'];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  console.log(`[Proxy] Pathname: ${pathname}`);

  // Bypass proxy for all public API routes to preserve POST request bodies
  const isAdminApi = pathname.startsWith('/api/admin') || pathname.startsWith('/api/admin/');
  if (pathname.startsWith('/api') && !isAdminApi) {
    return NextResponse.next();
  }

  // Redirect legacy admin login to /login
  if (pathname === '/admin/login' || pathname === '/admin/login/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // 1. Detect if pathname starts with a locale prefix (e.g. /hi/, /es/)
  const pathnameParts = pathname.split('/');
  const localeCandidate = pathnameParts[1];
  const isLocalePrefix = LOCALES.includes(localeCandidate);
  const locale = isLocalePrefix ? localeCandidate : 'en';

  console.log(`[Proxy] localeCandidate: ${localeCandidate}, isLocalePrefix: ${isLocalePrefix}, locale: ${locale}`);

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
      console.log(`[Proxy] Locale "${localeCandidate}" is disabled. Redirecting 301 to English and resetting cookie: ${redirectUrl.toString()}`);
      const response = NextResponse.redirect(redirectUrl, { status: 301 });
      response.cookies.set('NEXT_LOCALE', 'en', { path: '/' });
      return response;
    }

    rewrittenPathname = '/' + pathnameParts.slice(2).join('/');
    console.log(`[Proxy] Raw rewrittenPathname: ${rewrittenPathname}`);
    if (!rewrittenPathname.endsWith('/') && request.nextUrl.pathname.endsWith('/')) {
      rewrittenPathname += '/';
    }
  }

  // 301 redirect duplicate tool /tools/pan-photo-tool/ to /tools/pan-card-resize/
  const normalizedRewritten = rewrittenPathname.endsWith('/') ? rewrittenPathname : rewrittenPathname + '/';
  if (normalizedRewritten === '/tools/pan-photo-tool/') {
    const targetPath = isLocalePrefix ? `/${locale}/tools/pan-card-resize/` : '/tools/pan-card-resize/';
    const redirectUrl = new URL(targetPath + request.nextUrl.search, request.url);
    console.log(`[Proxy] Redirecting 301 duplicate tool ${pathname} to ${redirectUrl.toString()}`);
    return NextResponse.redirect(redirectUrl, { status: 301 });
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

  const supabaseConfigured =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseConfigured) {
    if (rewrittenPathname.startsWith('/admin') || rewrittenPathname.startsWith('/api/admin')) {
      console.warn('[ToolWala] Supabase not configured — admin routes are unprotected.');
    }
    
    // Non-supabase development fallback rewrite/next
    let response: NextResponse;
    if (isLocalePrefix) {
      const rewriteUrl = new URL(rewrittenPathname + request.nextUrl.search, request.url);
      console.log(`[Proxy] (Non-Supabase) Rewriting ${pathname} to ${rewriteUrl.toString()} with locale ${locale}`);
      response = NextResponse.rewrite(rewriteUrl, {
        request: { headers: requestHeaders }
      });
    } else {
      response = NextResponse.next({
        request: { headers: requestHeaders }
      });
    }
    return response;
  }

  // Run Supabase session updates
  const { supabaseResponse, user, supabase } = await updateSession(request);

  const isProtected = PROTECTED_ADMIN_PREFIXES.some(
    (prefix) => rewrittenPathname === prefix || rewrittenPathname.startsWith(`${prefix}/`)
  );

  if (!isProtected) {
    let response: NextResponse;
    if (isLocalePrefix) {
      const rewriteUrl = new URL(rewrittenPathname + request.nextUrl.search, request.url);
      console.log(`[Proxy] (Supabase Enabled) Rewriting ${pathname} to ${rewriteUrl.toString()} with locale ${locale}`);
      response = NextResponse.rewrite(rewriteUrl, {
        request: { headers: requestHeaders }
      });
    } else {
      response = NextResponse.next({
        request: { headers: requestHeaders }
      });
    }
    
    // Sync Supabase cookies
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value);
    });
    return response;
  }

  // Admin protection logic
  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    const response = NextResponse.redirect(loginUrl);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value);
    });
    return response;
  }

  let profile: { role: string; status: string } | null = null;
  try {
    const admin = getSupabaseAdmin();
    const { data } = await admin
      .from('profiles')
      .select('role, status')
      .eq('id', user.id)
      .maybeSingle();
    profile = data;
  } catch {
    const { data } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', user.id)
      .maybeSingle();
    profile = data;
  }

  if (!profile || profile.role !== 'admin' || profile.status !== 'active') {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('error', 'unauthorized');
    const response = NextResponse.redirect(loginUrl);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      response.cookies.set(cookie.name, cookie.value);
    });
    return response;
  }

  // Authorized Admin access response
  let response: NextResponse;
  if (isLocalePrefix) {
    const rewriteUrl = new URL(rewrittenPathname + request.nextUrl.search, request.url);
    console.log(`[Proxy] (Supabase Enabled) Rewriting ${pathname} to ${rewriteUrl.toString()} with locale ${locale}`);
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
