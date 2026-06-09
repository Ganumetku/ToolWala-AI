import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from '@/lib/supabase-admin';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const accessToken = body.access_token as string;

    if (!accessToken) {
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
      return NextResponse.json({ success: false, error: 'Invalid session' }, { status: 401 });
    }

    const userId = userData.user.id;
    const email = userData.user.email;

    // Service role bypasses RLS — reliable profile lookup
    const admin = getSupabaseAdmin();

    let { data: profile, error: profileError } = await admin
      .from('profiles')
      .select('id, email, role, status')
      .eq('id', userId)
      .maybeSingle();

    // Auto-create + promote if missing (bootstrap first admin)
    if (!profile && email) {
      const { data: inserted, error: insertError } = await admin
        .from('profiles')
        .upsert(
          { id: userId, email, role: 'admin', status: 'active' },
          { onConflict: 'id' }
        )
        .select('id, email, role, status')
        .single();

      if (insertError) {
        console.error('[verify-admin] profile upsert failed:', insertError.message);
      } else {
        profile = inserted;
      }
    }

    if (profileError && !profile) {
      return NextResponse.json(
        { success: false, error: profileError.message },
        { status: 500 }
      );
    }

    if (!profile) {
      return NextResponse.json(
        {
          success: false,
          error: 'No profile found. Run supabase/RUN_THIS_FIX_ADMIN.sql in Supabase SQL Editor.',
        },
        { status: 403 }
      );
    }

    if (profile.role !== 'admin' || profile.status !== 'active') {
      // Auto-promote if this is the only user (bootstrap)
      const { count } = await admin
        .from('profiles')
        .select('*', { count: 'exact', head: true })
        .eq('role', 'admin');

      if ((count ?? 0) === 0 && email === 'developtechx@gmail.com') {
        const { data: promoted } = await admin
          .from('profiles')
          .update({ role: 'admin', status: 'active' })
          .eq('id', userId)
          .select('id, email, role, status')
          .single();

        if (promoted) {
          return NextResponse.json({ success: true, profile: promoted });
        }
      }

      return NextResponse.json(
        {
          success: false,
          error: `Role is "${profile.role}". Admin required. Run RUN_THIS_FIX_ADMIN.sql`,
          profile,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true, profile });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Verification failed';
    console.error('[verify-admin]', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
