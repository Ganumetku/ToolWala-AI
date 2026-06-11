import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { userAgent } from 'next/server';
import { toolsData } from '@/data/tools';

export const dynamic = 'force-dynamic';

const COUNTRY_NAMES: Record<string, string> = {
  'US': 'United States',
  'IN': 'India',
  'GB': 'United Kingdom',
  'CA': 'Canada',
  'DE': 'Germany',
  'AU': 'Australia',
  'FR': 'France',
  'JP': 'Japan',
  'BR': 'Brazil',
  'ZA': 'South Africa',
  'SG': 'Singapore',
  'AE': 'United Arab Emirates',
  'NL': 'Netherlands',
  'IT': 'Italy',
  'ES': 'Spain'
};

const DEV_COUNTRIES = ['US', 'IN', 'GB', 'CA', 'DE', 'AU', 'FR', 'BR', 'JP', 'ZA'];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { type, sessionId, eventName, toolId, toolName: bodyToolName, route: bodyRoute, referrer: bodyReferrer, metadata = {} } = body;

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Session ID is required' }, { status: 400 });
    }

    const supabase = createServiceClient();
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database client initialization failed' }, { status: 500 });
    }

    // 1. Resolve User Agent, Device, Browser
    const ua = userAgent(request);
    const userAgentStr = request.headers.get('user-agent') || 'Unknown';
    const browser = ua.browser.name || 'Unknown Browser';
    const device = ua.device.type || 'desktop';

    // 2. Resolve Referrer
    const referrer = bodyReferrer || request.headers.get('referer') || 'Direct';

    // 3. Resolve Country (including realistic dev emulation)
    let countryCode = request.headers.get('x-vercel-ip-country') || 
                      request.headers.get('cf-ipcountry') || 
                      request.headers.get('x-country-code') || 
                      '';

    const host = request.headers.get('host') || '';
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');

    if (!countryCode || countryCode === 'XX' || countryCode === '127.0.0.1') {
      if (isLocalhost) {
        // Distribute countries deterministically by sessionId so that a single session gets the same country code
        let sum = 0;
        for (let i = 0; i < sessionId.length; i++) sum += sessionId.charCodeAt(i);
        countryCode = DEV_COUNTRIES[sum % DEV_COUNTRIES.length];
      } else {
        countryCode = 'US';
      }
    }
    const country = COUNTRY_NAMES[countryCode.toUpperCase()] || countryCode;

    // 4. Resolve Tool metadata if applicable
    let resolvedToolName = bodyToolName || '';
    let resolvedCategory = metadata.category || '';
    let resolvedRoute = bodyRoute || '';

    const slug = toolId || metadata.toolSlug || '';
    if (slug) {
      const toolMatch = toolsData.find(t => t.slug === slug || t.id === slug);
      if (toolMatch) {
        resolvedToolName = toolMatch.title;
        resolvedCategory = toolMatch.category;
        resolvedRoute = toolMatch.href;
      }
    }

    if (!resolvedRoute && resolvedToolName) {
      const toolMatch = toolsData.find(t => t.title === resolvedToolName);
      if (toolMatch) {
        resolvedRoute = toolMatch.href;
        if (!resolvedCategory) resolvedCategory = toolMatch.category;
      }
    }

    // 5. Secure Session registration (Upsert visitor session)
    const { error: sessionError } = await supabase.from('visitor_sessions').upsert({
      session_id: sessionId,
      country,
      device,
      browser,
      user_agent: userAgentStr,
      referrer,
      created_at: new Date().toISOString()
    }, { onConflict: 'session_id' });

    if (sessionError) {
      console.error('Failed to upsert visitor session:', sessionError);
    }

    // 6. Route event to appropriate table
    if (type === 'visitor') {
      const { error: err } = await supabase.from('page_views').insert({
        session_id: sessionId,
        route: resolvedRoute || bodyRoute || '/',
        referrer,
        country,
        device,
        browser
      });
      if (err) console.error('Failed to insert page view:', err);

    } else if (type === 'tool_run') {
      const { error: err } = await supabase.from('tool_usage').insert({
        session_id: sessionId,
        tool_name: resolvedToolName || slug || 'Unknown Tool',
        category: resolvedCategory || 'Utility Tools',
        route: resolvedRoute || bodyRoute || '',
        country,
        device,
        browser
      });
      if (err) console.error('Failed to insert tool usage:', err);

      // Duplicate as analytics_events for comprehensive auditing logs
      await supabase.from('analytics_events').insert({
        session_id: sessionId,
        event_name: 'tool_used',
        tool_name: resolvedToolName || slug || 'Unknown Tool',
        route: resolvedRoute || bodyRoute || '',
        metadata: { ...metadata, resolvedCategory },
        country,
        device,
        browser
      });

    } else if (type === 'event') {
      const name = eventName || 'custom_event';
      const { error: err } = await supabase.from('analytics_events').insert({
        session_id: sessionId,
        event_name: name,
        tool_name: resolvedToolName || null,
        route: resolvedRoute || bodyRoute || '',
        metadata,
        country,
        device,
        browser
      });
      if (err) console.error('Failed to insert analytics event:', err);

      // If it's a calculator or major tool calculation trigger, also count it as a tool usage count!
      if (name === 'calculator_used' || name === 'image_uploaded' || name === 'pdf_processed' || name === 'ai_generated') {
        const { error: uerr } = await supabase.from('tool_usage').insert({
          session_id: sessionId,
          tool_name: resolvedToolName || 'Calculation Engine',
          category: resolvedCategory || 'Utility Tools',
          route: resolvedRoute || bodyRoute || '',
          country,
          device,
          browser
        });
        if (uerr) console.error('Failed to insert tool usage fallback:', uerr);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Error handling track POST request:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
