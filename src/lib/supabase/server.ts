import { createServerClient } from '@supabase/ssr';
import { createClient as createSupabaseJsClient, type User } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component — safe to ignore
          }
        },
      },
    }
  );
}

/**
 * Service-role client for admin API routes — never expose to browser.
 * @deprecated Prefer `supabaseAdmin` from `@/lib/supabase-admin`.
 */
export function createServiceClient() {
  try {
    return getSupabaseAdmin();
  } catch {
    return null;
  }
}

export { supabaseAdmin, createAdminClient, getSupabaseAdmin } from '@/lib/supabase-admin';

async function getUserFromBearerToken(request: Request): Promise<User | null> {
  const authHeader = request.headers.get('authorization');
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;
  if (!token) return null;

  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !anonKey) return null;

  const authClient = createSupabaseJsClient(url, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const { data, error } = await authClient.auth.getUser(token);
  return error ? null : data.user;
}

export async function getAuthUser(request?: Request): Promise<User | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (user) return user;

  if (request) {
    return getUserFromBearerToken(request);
  }

  return null;
}

export async function getSession() {
  return getAuthUser();
}

async function checkAdminProfile(userId: string): Promise<boolean> {
  try {
    const admin = getSupabaseAdmin();
    const { data: profile } = await admin
      .from('profiles')
      .select('role, status')
      .eq('id', userId)
      .maybeSingle();

    return profile?.role === 'admin' && profile?.status === 'active';
  } catch {
    const supabase = await createClient();
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, status')
      .eq('id', userId)
      .maybeSingle();

    return profile?.role === 'admin' && profile?.status === 'active';
  }
}

export async function isAdmin(request?: Request): Promise<boolean> {
  const user = await getAuthUser(request);
  if (!user) return false;
  return checkAdminProfile(user.id);
}
