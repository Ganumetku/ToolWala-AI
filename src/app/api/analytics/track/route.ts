import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { userAgent } from 'next/server';
import { toolsData } from '@/data/tools';
import { classifyVisitor } from '@/lib/bot-detection';
import { resolveCountryName } from '@/lib/geo';

export const dynamic = 'force-dynamic';

const DEV_COUNTRIES = ['US', 'IN', 'GB', 'CA', 'DE', 'AU', 'FR', 'BR', 'JP', 'ZA'];

export async function POST(request: NextRequest) {
  try {
    const bodyText = await request.text();
    if (!bodyText.trim()) {
      return NextResponse.json({ success: false, error: 'Request body is empty' }, { status: 400 });
    }
    const body = JSON.parse(bodyText);
    const { 
      type, 
      sessionId, 
      visitorId,
      isNewSession = true,
      eventName, 
      toolId, 
      toolName: bodyToolName, 
      route: bodyRoute, 
      referrer: bodyReferrer, 
      metadata = {},
      isWebDriver = false
    } = body;

    if (!sessionId) {
      return NextResponse.json({ success: false, error: 'Session ID is required' }, { status: 400 });
    }

    const resolvedVisitorId = visitorId || sessionId;

    const supabase = createServiceClient();
    if (!supabase) {
      return NextResponse.json({ success: false, error: 'Database client initialization failed' }, { status: 500 });
    }

    // 1. Resolve User Agent, Device, Browser
    const ua = userAgent(request);
    const userAgentStr = request.headers.get('user-agent') || 'Unknown';
    const browser = ua.browser.name || 'Unknown Browser';
    const device = ua.device.type || 'desktop';

    // 2. Classify Visitor (Human vs Bot)
    const { isBot, botCategory, botName } = classifyVisitor(userAgentStr, Boolean(isWebDriver));

    // 3. Resolve Referrer
    const referrer = bodyReferrer || request.headers.get('referer') || 'Direct';

    // 4. Resolve Country (No hardcoded US fallback; clean ISO-3166 resolution)
    let countryCode = request.headers.get('x-vercel-ip-country') || 
                      request.headers.get('cf-ipcountry') || 
                      request.headers.get('x-country-code') || 
                      '';

    const host = request.headers.get('host') || '';
    const isLocalhost = host.includes('localhost') || host.includes('127.0.0.1');

    if (!countryCode || countryCode === 'XX' || countryCode === '127.0.0.1') {
      if (isLocalhost) {
        // Distribute countries deterministically by sessionId for local dev emulation
        let sum = 0;
        for (let i = 0; i < sessionId.length; i++) sum += sessionId.charCodeAt(i);
        countryCode = DEV_COUNTRIES[sum % DEV_COUNTRIES.length];
      } else {
        // Missing or unknown IP headers in production -> resolve as Unknown, NOT US
        countryCode = '';
      }
    }
    const country = resolveCountryName(countryCode);

    // 5. Resolve Tool metadata if applicable
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

    // 6. Secure Session registration (Upsert visitor session with bot classification)
    // Optimize for Supabase Free tier: only upsert if new session or first visit
    if (isNewSession) {
      const { error: sessionError } = await supabase.from('visitor_sessions').upsert({
        session_id: sessionId,
        visitor_id: resolvedVisitorId,
        country,
        device,
        browser,
        user_agent: userAgentStr,
        referrer,
        is_bot: isBot,
        bot_category: botCategory,
        bot_name: botName,
        created_at: new Date().toISOString()
      }, { onConflict: 'session_id' });

      if (sessionError) {
        console.error('Failed to upsert visitor session:', sessionError);
      }
    }

    // 7. Route event to appropriate table
    if (type === 'visitor') {
      const { error: err } = await supabase.from('page_views').insert({
        session_id: sessionId,
        visitor_id: resolvedVisitorId,
        route: resolvedRoute || bodyRoute || '/',
        referrer,
        country,
        device,
        browser,
        is_bot: isBot,
        bot_category: botCategory,
        bot_name: botName
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
        browser,
        is_bot: isBot,
        bot_category: botCategory,
        bot_name: botName
      });
      if (err) console.error('Failed to insert tool usage:', err);

      // Audit log event
      await supabase.from('analytics_events').insert({
        session_id: sessionId,
        event_name: 'tool_used',
        tool_name: resolvedToolName || slug || 'Unknown Tool',
        route: resolvedRoute || bodyRoute || '',
        metadata: { ...metadata, resolvedCategory },
        country,
        device,
        browser,
        is_bot: isBot,
        bot_category: botCategory,
        bot_name: botName
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
        browser,
        is_bot: isBot,
        bot_category: botCategory,
        bot_name: botName
      });
      if (err) console.error('Failed to insert analytics event:', err);

      // If it's a calculator or major tool calculation trigger, also record tool usage
      if (name === 'calculator_used' || name === 'image_uploaded' || name === 'pdf_processed' || name === 'ai_generated') {
        const { error: uerr } = await supabase.from('tool_usage').insert({
          session_id: sessionId,
          tool_name: resolvedToolName || 'Calculation Engine',
          category: resolvedCategory || 'Utility Tools',
          route: resolvedRoute || bodyRoute || '',
          country,
          device,
          browser,
          is_bot: isBot,
          bot_category: botCategory,
          bot_name: botName
        });
        if (uerr) console.error('Failed to insert tool usage fallback:', uerr);
      }
    }

    return NextResponse.json({ success: true, isBot, botName });
  } catch (error: any) {
    console.error('Error handling track POST request:', error);
    return NextResponse.json({ success: false, error: 'Tracking failed' }, { status: 500 });
  }
}
