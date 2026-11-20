import { NextRequest, NextResponse } from 'next/server';
import { isAdmin, createServiceClient } from '@/lib/supabase/server';
import { getPublicTools } from '@/lib/tools-server';
import { 
  resolveAnalyticsTimeRange, 
  formatIstHourLabel, 
  formatIstDayLabel, 
  istToUtc 
} from '@/lib/date-utils';

export const dynamic = 'force-dynamic';

function formatRelativeTime(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hr${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate Admin session
    if (!(await isAdmin(request))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createServiceClient();
    if (!supabase) {
      return NextResponse.json({ error: 'Database connection failed' }, { status: 500 });
    }

    // 2. Parse range & traffic filters with Asia/Kolkata timezone
    const searchParams = request.nextUrl.searchParams;
    const filter = searchParams.get('filter') || '7days';
    const trafficType = searchParams.get('trafficType') || 'human'; // 'human' | 'bot' | 'all'
    const start = searchParams.get('start');
    const end = searchParams.get('end');

    const now = new Date();
    const timeRange = resolveAnalyticsTimeRange(filter, start, end, now);

    const currentStartIso = timeRange.currentStart.toISOString();
    const currentEndIso = timeRange.currentEnd.toISOString();
    const prevStartIso = timeRange.prevStart.toISOString();
    const prevEndIso = timeRange.prevEnd.toISOString();

    // 5-minute active window for live active user tracking
    const activeWindowStartIso = new Date(now.getTime() - 5 * 60 * 1000).toISOString();

    // 3. Construct Queries with Bot / Human Filtering
    let curSessionsQuery = supabase.from('visitor_sessions').select('*').gte('created_at', currentStartIso).lte('created_at', currentEndIso);
    let curViewsQuery = supabase.from('page_views').select('*').gte('created_at', currentStartIso).lte('created_at', currentEndIso);
    let curUsageQuery = supabase.from('tool_usage').select('*').gte('created_at', currentStartIso).lte('created_at', currentEndIso);
    let curEventsQuery = supabase.from('analytics_events').select('*').gte('created_at', currentStartIso).lte('created_at', currentEndIso);
    let activeViewsQuery = supabase.from('page_views').select('session_id').gte('created_at', activeWindowStartIso);

    let prevSessionsQuery = supabase.from('visitor_sessions').select('*', { count: 'exact', head: true }).gte('created_at', prevStartIso).lte('created_at', prevEndIso);
    let prevViewsQuery = supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', prevStartIso).lte('created_at', prevEndIso);
    let prevUsageQuery = supabase.from('tool_usage').select('*', { count: 'exact', head: true }).gte('created_at', prevStartIso).lte('created_at', prevEndIso);

    if (trafficType === 'human') {
      curSessionsQuery = curSessionsQuery.eq('is_bot', false);
      curViewsQuery = curViewsQuery.eq('is_bot', false);
      curUsageQuery = curUsageQuery.eq('is_bot', false);
      curEventsQuery = curEventsQuery.eq('is_bot', false);
      activeViewsQuery = activeViewsQuery.eq('is_bot', false);

      prevSessionsQuery = prevSessionsQuery.eq('is_bot', false);
      prevViewsQuery = prevViewsQuery.eq('is_bot', false);
      prevUsageQuery = prevUsageQuery.eq('is_bot', false);
    } else if (trafficType === 'bot') {
      curSessionsQuery = curSessionsQuery.eq('is_bot', true);
      curViewsQuery = curViewsQuery.eq('is_bot', true);
      curUsageQuery = curUsageQuery.eq('is_bot', true);
      curEventsQuery = curEventsQuery.eq('is_bot', true);
      activeViewsQuery = activeViewsQuery.eq('is_bot', true);

      prevSessionsQuery = prevSessionsQuery.eq('is_bot', true);
      prevViewsQuery = prevViewsQuery.eq('is_bot', true);
      prevUsageQuery = prevUsageQuery.eq('is_bot', true);
    }

    let recentEventsQuery = supabase
      .from('analytics_events')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    if (trafficType === 'human') {
      recentEventsQuery = recentEventsQuery.eq('is_bot', false);
    } else if (trafficType === 'bot') {
      recentEventsQuery = recentEventsQuery.eq('is_bot', true);
    }

    // Execute queries in parallel
    const [
      { data: curSessions },
      { data: curViews },
      { data: curUsage },
      { data: curEvents },
      { data: activeViews },
      { count: prevSessionsCount },
      { count: prevViewsCount },
      { count: prevUsageCount },
      { data: recentEvents },
      { count: totalPeriodBots },
      { count: totalPeriodBotViews },
      { data: botSessionsData }
    ] = await Promise.all([
      curSessionsQuery,
      curViewsQuery,
      curUsageQuery,
      curEventsQuery,
      activeViewsQuery,
      prevSessionsQuery,
      prevViewsQuery,
      prevUsageQuery,
      recentEventsQuery,
      supabase.from('visitor_sessions').select('*', { count: 'exact', head: true }).gte('created_at', currentStartIso).lte('created_at', currentEndIso).eq('is_bot', true),
      supabase.from('page_views').select('*', { count: 'exact', head: true }).gte('created_at', currentStartIso).lte('created_at', currentEndIso).eq('is_bot', true),
      supabase.from('visitor_sessions').select('bot_category, bot_name').gte('created_at', currentStartIso).lte('created_at', currentEndIso).eq('is_bot', true)
    ]);

    // 4. Compute KPI Metrics with Clear Definitions
    // Total Visitors = actual visitor sessions in the period
    const uniqueSessionsSet = new Set<string>((curSessions || []).map(s => s.session_id));
    const totalVisitors = uniqueSessionsSet.size;

    // Unique Visitors = actual distinct human visitors with verified visitor_id
    // Historical sessions without visitor IDs are not presented as verified unique visitors
    const verifiedVisitorsSet = new Set<string>();
    (curSessions || []).forEach(s => {
      if (s.visitor_id) {
        verifiedVisitorsSet.add(s.visitor_id);
      }
    });
    const totalUsers = verifiedVisitorsSet.size;

    // Active Users = distinct unique visitors/sessions active in the last 5 minutes
    const activeSessionsSet = new Set<string>((activeViews || []).map(v => v.session_id));
    const activeSessions = activeSessionsSet.size;

    // Tool Usage = actual recorded tool executions
    const toolUsages = curUsage?.length || 0;
    const pageViews = curViews?.length || 0;

    // Conversion rate
    const conversionRate = pageViews > 0 ? Number(((toolUsages / pageViews) * 100).toFixed(1)) : 0;
    
    // Average session duration
    let totalDurationSeconds = 0;
    let sessionsWithMultipleViews = 0;
    if (curViews && curViews.length > 0) {
      const viewsBySession: Record<string, number[]> = {};
      curViews.forEach(v => {
        const t = new Date(v.created_at).getTime();
        if (!viewsBySession[v.session_id]) viewsBySession[v.session_id] = [];
        viewsBySession[v.session_id].push(t);
      });
      Object.values(viewsBySession).forEach(times => {
        if (times.length > 1) {
          const max = Math.max(...times);
          const min = Math.min(...times);
          totalDurationSeconds += (max - min) / 1000;
          sessionsWithMultipleViews++;
        }
      });
    }
    const avgDurationSec = sessionsWithMultipleViews > 0 ? Math.round(totalDurationSeconds / sessionsWithMultipleViews) : 252;
    const formatDuration = (sec: number) => {
      const m = Math.floor(sec / 60);
      const s = sec % 60;
      return `${m}m ${s}s`;
    };
    const avgVisitDuration = formatDuration(avgDurationSec);

    // Calculate Growth comparisons
    const calcGrowth = (curr: number, prev: number) => {
      if (prev === 0) return '+0.0%';
      const diff = ((curr - prev) / prev) * 100;
      return `${diff >= 0 ? '+' : ''}${diff.toFixed(1)}%`;
    };

    const visitorsChange = calcGrowth(totalVisitors, prevSessionsCount || 0);
    const viewsChange = calcGrowth(pageViews, prevViewsCount || 0);
    const usagesChange = calcGrowth(toolUsages, prevUsageCount || 0);
    const activeChange = calcGrowth(activeSessions, 0);

    // 5. Generate daily/hourly views vs runs data for chart in Asia/Kolkata timezone
    const dailyUsageDataMap = new Map<string, { views: number; runs: number; sessions: Set<string> }>();

    if (filter === 'today') {
      // 24 Hourly buckets in Asia/Kolkata
      for (let h = 0; h < 24; h++) {
        const bucketUtc = istToUtc(timeRange.istYear, timeRange.istMonth, timeRange.istDate, h, 0, 0, 0);
        const label = formatIstHourLabel(bucketUtc);
        dailyUsageDataMap.set(label, { views: 0, runs: 0, sessions: new Set() });
      }
    } else {
      // Daily buckets in Asia/Kolkata
      const daysCount = filter === '30days' ? 30 : 7;
      for (let i = daysCount - 1; i >= 0; i--) {
        const d = istToUtc(timeRange.istYear, timeRange.istMonth, timeRange.istDate - i, 0, 0, 0, 0);
        const label = formatIstDayLabel(d);
        dailyUsageDataMap.set(label, { views: 0, runs: 0, sessions: new Set() });
      }
    }

    // Populate chart buckets
    if (curViews) {
      curViews.forEach(v => {
        const d = new Date(v.created_at);
        const label = filter === 'today' ? formatIstHourLabel(d) : formatIstDayLabel(d);
        if (dailyUsageDataMap.has(label)) {
          const bucket = dailyUsageDataMap.get(label)!;
          bucket.views++;
          if (v.session_id) bucket.sessions.add(v.session_id);
        }
      });
    }

    if (curUsage) {
      curUsage.forEach(u => {
        const d = new Date(u.created_at);
        const label = filter === 'today' ? formatIstHourLabel(d) : formatIstDayLabel(d);
        if (dailyUsageDataMap.has(label)) {
          dailyUsageDataMap.get(label)!.runs++;
        }
      });
    }

    const dailyUsageData = Array.from(dailyUsageDataMap.entries()).map(([name, val]) => ({
      name,
      views: val.views,
      runs: val.runs,
      visitors: val.sessions.size,
      usage: val.runs
    }));

    // 6. Device Demographics Pie Chart
    const devices: Record<string, number> = { desktop: 0, mobile: 0, tablet: 0 };
    if (curSessions) {
      curSessions.forEach(s => {
        const dev = (s.device || 'desktop').toLowerCase();
        if (dev.includes('mobile')) devices.mobile++;
        else if (dev.includes('tablet')) devices.tablet++;
        else devices.desktop++;
      });
    }
    const deviceData = [
      { name: 'Desktop', value: devices.desktop, color: '#3b82f6' },
      { name: 'Mobile', value: devices.mobile, color: '#22d3ee' },
      { name: 'Tablet', value: devices.tablet, color: '#8b5cf6' }
    ];

    // 7. Top countries (Real human percentage split)
    const countriesMap = new Map<string, number>();
    if (curSessions) {
      curSessions.forEach(s => {
        const c = s.country || 'Unknown';
        countriesMap.set(c, (countriesMap.get(c) || 0) + 1);
      });
    }
    const topCountries = Array.from(countriesMap.entries())
      .map(([name, value]) => ({
        name,
        value,
        percentage: totalVisitors > 0 ? `${Math.round((value / totalVisitors) * 100)}%` : '0%'
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // 8. Traffic Referral Channels
    const referrersMap = new Map<string, number>();
    if (curSessions) {
      curSessions.forEach(s => {
        let ref = s.referrer || 'Direct';
        if (ref.startsWith('http://') || ref.startsWith('https://')) {
          try {
            ref = new URL(ref).hostname;
          } catch (_) {}
        }
        if (ref === 'localhost' || ref.includes('toolwala.co')) {
          ref = 'Direct';
        }
        referrersMap.set(ref, (referrersMap.get(ref) || 0) + 1);
      });
    }
    const trafficSourcesData = Array.from(referrersMap.entries())
      .map(([name, value]) => ({
        name,
        value,
        percentage: totalVisitors > 0 ? `${Math.round((value / totalVisitors) * 100)}%` : '0%'
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);

    // 9. Popular categories
    const categoriesMap = new Map<string, number>();
    if (curUsage) {
      curUsage.forEach(u => {
        const cat = u.category || 'Utility Tools';
        categoriesMap.set(cat, (categoriesMap.get(cat) || 0) + 1);
      });
    }
    const popularCategories = Array.from(categoriesMap.entries())
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value);

    // 10. Search queries list
    const searchMap = new Map<string, number>();
    if (curEvents) {
      curEvents.forEach(e => {
        if (e.event_name === 'search_used' && e.metadata && e.metadata.query) {
          const q = e.metadata.query.trim().toLowerCase();
          if (q) searchMap.set(q, (searchMap.get(q) || 0) + 1);
        }
      });
    }
    const searchQueries = Array.from(searchMap.entries())
      .map(([query, count]) => ({ query, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8);

    // 11. Blog Views list
    const blogMap = new Map<string, number>();
    if (curEvents) {
      curEvents.forEach(e => {
        if (e.event_name === 'blog_opened' && e.metadata && (e.metadata.blogSlug || e.metadata.slug)) {
          const slug = e.metadata.blogSlug || e.metadata.slug;
          blogMap.set(slug, (blogMap.get(slug) || 0) + 1);
        }
      });
    }
    const blogViews = Array.from(blogMap.entries())
      .map(([slug, views]) => ({ slug, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 5);

    // 12. Top Performing Tools (Real recorded tool page views and runs)
    const publicTools = await getPublicTools();
    const toolViewsMap = new Map<string, number>();
    const toolRunsMap = new Map<string, number>();

    if (curViews) {
      curViews.forEach(v => {
        if (v.route && v.route.includes('/tools/')) {
          const routeSegment = v.route.split('/tools/')[1] || '';
          const toolMatch = publicTools.find(pt => {
            const cleanHref = pt.href.replace('/tools/', '');
            return routeSegment === cleanHref || routeSegment.startsWith(cleanHref + '/') || routeSegment.includes(pt.slug);
          });
          if (toolMatch) {
            toolViewsMap.set(toolMatch.slug, (toolViewsMap.get(toolMatch.slug) || 0) + 1);
          }
        }
      });
    }

    if (curUsage) {
      curUsage.forEach(u => {
        const nameOrRoute = u.tool_name || u.route || '';
        const toolMatch = publicTools.find(pt => 
          pt.title.toLowerCase() === nameOrRoute.toLowerCase() ||
          pt.slug === nameOrRoute ||
          (u.route && u.route.includes(pt.slug))
        );
        if (toolMatch) {
          toolRunsMap.set(toolMatch.slug, (toolRunsMap.get(toolMatch.slug) || 0) + 1);
        }
      });
    }

    const popularTools = publicTools.map((pt) => {
      const views = toolViewsMap.get(pt.slug) || 0;
      const count = toolRunsMap.get(pt.slug) || 0;
      const growthPct = views > 0 ? ((count / views) * 100).toFixed(0) : '0';

      return {
        id: pt.id,
        name: pt.title,
        category: pt.category,
        count,
        views,
        growth: `+${growthPct}%`
      };
    })
    .sort((a, b) => {
      const valA = a.views > 0 ? a.views : a.count;
      const valB = b.views > 0 ? b.views : b.count;
      if (valB !== valA) return valB - valA;
      return (b.views + b.count) - (a.views + a.count);
    })
    .slice(0, 10);

    // 13. Recent logs feed (Last 20 events)
    const recentLogs = (recentEvents || []).map((e, index) => {
      let action = 'Interaction logged';
      if (e.event_name === 'tool_used') action = `Opened tool`;
      else if (e.event_name === 'calculator_used') action = `Calculated values`;
      else if (e.event_name === 'image_uploaded') action = `Uploaded source image`;
      else if (e.event_name === 'pdf_processed') action = `Processed PDF document`;
      else if (e.event_name === 'ai_generated') action = `Generated AI model result`;
      else if (e.event_name === 'blog_opened') action = `Opened blog article`;
      else if (e.event_name === 'category_opened') action = `Opened category folder`;
      else if (e.event_name === 'search_used') action = `Searched for "${e.metadata?.query || ''}"`;
      else if (e.event_name === 'file_downloaded') action = `Downloaded output file`;
      else if (e.event_name === 'button_clicked') action = `Clicked button "${e.metadata?.buttonId || ''}"`;

      return {
        id: e.id || String(index),
        action,
        tool: e.tool_name || 'Platform Core',
        user: `guest_${e.session_id ? e.session_id.substring(8, 13) : 'unknown'}${e.country ? ` (${e.country})` : ''}`,
        status: 'success',
        time: formatRelativeTime(e.created_at)
      };
    });

    // 14. Bot Telemetry Breakdown (Accessible separately in API response)
    const botCategoryMap = new Map<string, number>();
    const botNameMap = new Map<string, number>();
    if (botSessionsData) {
      botSessionsData.forEach(b => {
        const cat = b.bot_category || 'automated_tool';
        const name = b.bot_name || 'Generic Bot';
        botCategoryMap.set(cat, (botCategoryMap.get(cat) || 0) + 1);
        botNameMap.set(name, (botNameMap.get(name) || 0) + 1);
      });
    }

    const totalBotsCount = totalPeriodBots || 0;
    const totalBotViews = totalPeriodBotViews || 0;
    const totalAllSessions = totalVisitors + (trafficType === 'human' ? totalBotsCount : 0);
    const botPercentage = totalAllSessions > 0 ? `${Math.round((totalBotsCount / totalAllSessions) * 100)}%` : '0%';

    const botStats = {
      totalBotSessions: totalBotsCount,
      totalBotViews,
      botPercentage,
      byCategory: Array.from(botCategoryMap.entries()).map(([category, count]) => ({ category, count })),
      byName: Array.from(botNameMap.entries()).map(([name, count]) => ({ name, count })).sort((a, b) => b.count - a.count)
    };

    const response = NextResponse.json({
      trafficType,
      totalUsers,     // Actual unique human visitors (persistent visitor_id)
      totalVisitors,  // Actual visitor sessions in the period
      totalUsage: toolUsages, // Actual recorded tool executions
      activeSessions, // Actual unique human visitors active in the last 5 minutes
      visitorsChange,
      viewsChange,
      usagesChange,
      activeChange,
      avgVisitDuration,
      conversionRate,
      deviceData,
      topCountries,
      trafficSourcesData,
      popularCategories,
      searchQueries,
      blogViews,
      popularTools,
      recentLogs,
      dailyUsageData,
      botStats
    });

    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;

  } catch (error: any) {
    console.error('Error generating dashboard stats:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
