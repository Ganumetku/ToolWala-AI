'use client';

import { supabase } from '@/lib/supabase';

/**
 * Fetch wrapper for admin API routes — attaches Supabase access token
 * so server routes can authenticate when cookies are unavailable.
 */
export async function adminFetch(
  input: RequestInfo | URL,
  init: RequestInit = {}
): Promise<Response> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers = new Headers(init.headers);

  if (session?.access_token) {
    headers.set('Authorization', `Bearer ${session.access_token}`);
  }

  return fetch(input, {
    ...init,
    headers,
    credentials: 'include',
  });
}
