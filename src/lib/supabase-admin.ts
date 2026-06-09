import {
  createClient as createSupabaseClient,
  type SupabaseClient,
} from '@supabase/supabase-js';

type SupabaseAdminEnv = {
  url: string;
  serviceRoleKey: string;
};

/**
 * SERVER ONLY — never import in client components ('use client').
 * Uses SUPABASE_SERVICE_ROLE_KEY which bypasses RLS.
 * Import only in API routes, Server Components, and server utilities.
 */

function assertServerContext(): void {
  if (typeof window !== 'undefined') {
    throw new Error(
      '[ToolWala] supabaseAdmin is server-only. ' +
        'Import @/lib/supabase in client components instead.'
    );
  }
}

function resolveSupabaseAdminEnv(): SupabaseAdminEnv {
  assertServerContext();

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();

  if (!url) {
    throw new Error(
      '[ToolWala] Missing NEXT_PUBLIC_SUPABASE_URL. ' +
        'Add it to .env.local — see .env.example.'
    );
  }

  if (!serviceRoleKey) {
    throw new Error(
      '[ToolWala] Missing SUPABASE_SERVICE_ROLE_KEY. ' +
        'Add your Supabase service role key to .env.local (server-only, never expose to the browser).'
    );
  }

  return { url, serviceRoleKey };
}

const globalForSupabaseAdmin = globalThis as typeof globalThis & {
  __toolwalaSupabaseAdmin?: SupabaseClient;
};

/**
 * Creates a Supabase admin client with the service role key.
 * Bypasses Row Level Security — use only in trusted server code.
 */
export function createAdminClient(): SupabaseClient {
  const { url, serviceRoleKey } = resolveSupabaseAdminEnv();

  return createSupabaseClient(url, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

/**
 * Returns a singleton admin client (reused across server requests in dev).
 */
export function getSupabaseAdmin(): SupabaseClient {
  assertServerContext();

  if (!globalForSupabaseAdmin.__toolwalaSupabaseAdmin) {
    globalForSupabaseAdmin.__toolwalaSupabaseAdmin = createAdminClient();
  }

  return globalForSupabaseAdmin.__toolwalaSupabaseAdmin;
}

/**
 * Secure server-side Supabase admin client.
 * Lazily initialized — safe for API routes and server utilities.
 *
 * @example
 * import { supabaseAdmin } from '@/lib/supabase-admin';
 * const { data, error } = await supabaseAdmin.from('tools').select('*');
 */
export const supabaseAdmin: SupabaseClient = new Proxy({} as SupabaseClient, {
  get(_target, prop) {
    const client = getSupabaseAdmin();
    const value = Reflect.get(client, prop, client);
    return typeof value === 'function' ? value.bind(client) : value;
  },
});
