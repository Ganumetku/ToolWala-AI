import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

// In-memory rate limiting store (IP -> { count: number, resetAt: number })
interface RateLimitEntry {
  count: number;
  resetAt: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();
const MAX_ATTEMPTS = 5;
const LOCKOUT_MS = 15 * 60 * 1000; // 15 Minutes Lockout

function getClientIp(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || 
         request.headers.get('cf-connecting-ip') || 
         '127.0.0.1';
}

export async function POST(request: NextRequest) {
  const clientIp = getClientIp(request);
  const now = Date.now();

  // 1. Rate Limit Lockout Check
  const currentRateLimit = rateLimitMap.get(clientIp);
  if (currentRateLimit) {
    if (now < currentRateLimit.resetAt) {
      if (currentRateLimit.count >= MAX_ATTEMPTS) {
        const remainingMins = Math.ceil((currentRateLimit.resetAt - now) / 60000);
        return NextResponse.json(
          {
            success: false,
            error: `Too many failed login attempts. Please try again in ${remainingMins} minute${remainingMins === 1 ? '' : 's'}.`,
          },
          { status: 429 }
        );
      }
    } else {
      // Lockout window expired, reset counter
      rateLimitMap.delete(clientIp);
    }
  }

  const recordFailedAttempt = () => {
    const entry = rateLimitMap.get(clientIp) || { count: 0, resetAt: now + LOCKOUT_MS };
    entry.count += 1;
    entry.resetAt = now + LOCKOUT_MS;
    rateLimitMap.set(clientIp, entry);
  };

  try {
    const body = await request.json();
    const accessToken = body.access_token as string;

    if (!accessToken) {
      recordFailedAttempt();
      return NextResponse.json({ success: false, error: 'Missing access token' }, { status: 400 });
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
    const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();

    if (!supabaseUrl || !supabaseAnon) {
      return NextResponse.json({ success: false, error: 'Supabase not configured' }, { status: 503 });
    }

    // Verify JWT and get user id
    const authClient = createClient(supabaseUrl, supabaseAnon, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: userData, error: userError } = await authClient.auth.getUser(accessToken);

    if (userError || !userData.user) {
      recordFailedAttempt();
      return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
    }

    const userId = userData.user.id;

    // Service role bypasses RLS — reliable profile lookup
    const admin = getSupabaseAdmin();

    const { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('id, email, role, status')
      .eq('id', userId)
      .maybeSingle();

    // NOTE: Do NOT auto-promote missing profiles to admin.
    // If a profile row is missing, fail closed.

    if (profileError && !profile) {
      recordFailedAttempt();
      return NextResponse.json(
        { success: false, error: 'Unable to verify admin profile.' },
        { status: 500 }
      );
    }

    if (!profile) {
      recordFailedAttempt();
      return NextResponse.json(
        {
          success: false,
          error: 'No profile found. Run RUN_THIS_FIX_ADMIN.sql in Supabase SQL Editor.',
        },
        { status: 403 }
      );
    }

    if (profile.role !== 'admin' || profile.status !== 'active') {
      recordFailedAttempt();
      return NextResponse.json(
        {
          success: false,
          error: 'Access denied. Admin privileges required.',
        },
        { status: 403 }
      );
    }

    // Success! Clear rate limit for this IP
    rateLimitMap.delete(clientIp);

    return NextResponse.json({ success: true, profile });
  } catch (err) {
    console.error('[verify-admin]', err instanceof Error ? err.message : err);
    return NextResponse.json({ success: false, error: 'Verification failed. Please try again.' }, { status: 500 });
  }
}
