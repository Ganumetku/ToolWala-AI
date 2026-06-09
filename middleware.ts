import { NextResponse, type NextRequest } from 'next/server';
import { updateSession } from '@/lib/supabase/middleware';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

const PROTECTED_ADMIN_PREFIXES = ['/admin', '/api/admin'];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Redirect legacy admin login to /login
  if (pathname === '/admin/login' || pathname === '/admin/login/') {
    return NextResponse.redirect(new URL('/login', request.url));
  }

  const supabaseConfigured =
    !!process.env.NEXT_PUBLIC_SUPABASE_URL &&
    !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseConfigured) {
    // Dev fallback: allow access but warn in console
    if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin')) {
      console.warn('[ToolWala] Supabase not configured — admin routes are unprotected.');
    }
    return NextResponse.next();
  }

  const isProtected = PROTECTED_ADMIN_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  );

  if (!isProtected) {
    const { supabaseResponse } = await updateSession(request);
    return supabaseResponse;
  }

  const { supabaseResponse, user, supabase } = await updateSession(request);

  if (!user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Service role — bypasses RLS for reliable admin check
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
    // fallback to user client
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
    return NextResponse.redirect(loginUrl);
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/login'],
};
