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

  let url = typeof input === 'string' ? input : input.toString();
  const [path, query] = url.split('?');
  if (!path.endsWith('/') && !path.includes('.')) {
    url = path + '/' + (query ? '?' + query : '');
  }

  return fetch(url, {
    ...init,
    headers,
    credentials: 'include',
  });
}
