import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/** Validate that a redirect value is a safe same-origin relative path. */
function sanitizeRedirect(redirect: string | null): string {
  const fallback = '/admin';
  if (!redirect) return fallback;
  // Must start with '/' but NOT '//' (protocol-relative) and no scheme
  if (!redirect.startsWith('/') || redirect.startsWith('//')) return fallback;
  if (/^\/[a-z]+:/i.test(redirect)) return fallback; // reject /javascript:, /http:, etc.
  return redirect;
}

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const redirect = sanitizeRedirect(searchParams.get('redirect'));

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);
    if (!error) {
      return NextResponse.redirect(`${origin}${redirect}`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
