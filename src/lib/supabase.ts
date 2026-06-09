import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

type SupabaseEnv = {
  url: string;
  anonKey: string;
};

function resolveSupabaseEnv(): SupabaseEnv {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

  if (!url) {
    throw new Error(
      '[ToolWala] Missing NEXT_PUBLIC_SUPABASE_URL. ' +
        'Copy .env.example to .env.local and set your Supabase project URL.'
    );
  }

  if (!anonKey) {
    throw new Error(
      '[ToolWala] Missing NEXT_PUBLIC_SUPABASE_ANON_KEY. ' +
        'Copy .env.example to .env.local and set your Supabase anon key.'
    );
  }

  return { url, anonKey };
}

const globalForSupabase = globalThis as typeof globalThis & {
  __toolwalaSupabase?: SupabaseClient;
};

/**
 * Browser Supabase client — stores session in cookies (works with middleware).
 */
export function createClient(): SupabaseClient {
  const { url, anonKey } = resolveSupabaseEnv();
  return createBrowserClient(url, anonKey);
}

export function getSupabaseClient(): SupabaseClient {
  if (typeof window === 'undefined') {
    return createClient();
  }

  if (!globalForSupabase.__toolwalaSupabase) {
    globalForSupabase.__toolwalaSupabase = createClient();
  }

  return globalForSupabase.__toolwalaSupabase;
}

export const supabase: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseClient();
    const value = Reflect.get(client, prop, client);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
