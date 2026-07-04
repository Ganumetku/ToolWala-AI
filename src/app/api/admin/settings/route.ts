import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/supabase/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { jsonDb } from '@/lib/jsonDb';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // 1. Attempt to fetch from Supabase table `global_settings`
    const { data: dbSettings, error } = await supabaseAdmin
      .from('global_settings')
      .select('*');

    const settingsObj: Record<string, string> = {};

    if (!error && dbSettings && dbSettings.length > 0) {
      dbSettings.forEach((row: any) => {
        settingsObj[row.key] = row.value;
      });
    } else {
      // 2. Fallback to jsonDb
      const localSettings = jsonDb.getSettings();
      localSettings.forEach((row: any) => {
        settingsObj[row.key] = row.value;
      });
    }

    return NextResponse.json({ success: true, settings: settingsObj });
  } catch (err) {
    console.error('Admin settings GET error:', err);
    try {
      const localSettings = jsonDb.getSettings();
      const settingsObj: Record<string, string> = {};
      localSettings.forEach((row: any) => {
        settingsObj[row.key] = row.value;
      });
      return NextResponse.json({ success: true, settings: settingsObj });
    } catch (fallbackErr) {
      return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
    }
  }
}

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { settings } = body; // Record<string, string>

    if (!settings || typeof settings !== 'object') {
      return NextResponse.json({ success: false, error: 'settings object required' }, { status: 400 });
    }

    // 1. Attempt to save to Supabase
    let dbSuccess = true;
    for (const [key, value] of Object.entries(settings)) {
      const { error } = await supabaseAdmin
        .from('global_settings')
        .upsert(
          { key, value, updated_at: new Date().toISOString() },
          { onConflict: 'key' }
        );
      if (error) {
        console.warn(`Failed to upsert setting ${key} in DB:`, error.message);
        dbSuccess = false;
      }
    }

    // 2. Always sync to jsonDb as fallback/local persistence
    const localSettings = jsonDb.getSettings();
    const now = new Date().toISOString();
    
    for (const [key, value] of Object.entries(settings)) {
      const idx = localSettings.findIndex(s => s.key === key);
      if (idx > -1) {
        localSettings[idx] = {
          ...localSettings[idx],
          value: String(value)
        };
      } else {
        localSettings.push({
          id: Math.random().toString(36).substring(2, 9),
          key,
          value: String(value),
          createdAt: now
        });
      }
    }
    jsonDb.saveSettings(localSettings);

    return NextResponse.json({ success: true, dbSynced: dbSuccess });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Server error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
