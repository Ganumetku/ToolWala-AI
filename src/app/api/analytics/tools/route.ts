import { NextRequest, NextResponse } from 'next/server';
import { isAdmin, createServiceClient } from '@/lib/supabase/server';
import { getPublicTools } from '@/lib/tools-server';

export const dynamic = 'force-dynamic';

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

    // 2. Fetch all raw page views and tool usage events
    const [
      { data: viewsData },
      { data: runsData }
    ] = await Promise.all([
      supabase.from('page_views').select('route'),
      supabase.from('tool_usage').select('tool_name')
    ]);

    const publicTools = await getPublicTools();

    // 3. Compile count indexes
    const toolViewsMap = new Map<string, number>();
    const toolRunsMap = new Map<string, number>();

    if (viewsData) {
      viewsData.forEach(v => {
        if (v.route && v.route.startsWith('/tools/')) {
          const slug = v.route.replace('/tools/', '').split('/')[0];
          if (slug) {
            toolViewsMap.set(slug, (toolViewsMap.get(slug) || 0) + 1);
          }
        }
      });
    }

    if (runsData) {
      runsData.forEach(r => {
        const toolMatch = publicTools.find(pt => pt.title === r.tool_name || pt.slug === r.tool_name);
        const slug = toolMatch ? toolMatch.slug : r.tool_name;
        if (slug) {
          toolRunsMap.set(slug, (toolRunsMap.get(slug) || 0) + 1);
        }
      });
    }

    // 4. Map and sort tools analytics
    const toolsAnalytics = publicTools.map(pt => {
      const views = toolViewsMap.get(pt.slug) || 0;
      const runs = toolRunsMap.get(pt.slug) || 0;
      const conversionRate = views > 0 ? Number(((runs / views) * 100).toFixed(1)) : 0;

      return {
        id: pt.id,
        title: pt.title,
        slug: pt.slug,
        category: pt.category,
        views,
        runs,
        conversionRate
      };
    }).sort((a, b) => b.runs - a.runs);

    return NextResponse.json({ success: true, tools: toolsAnalytics });
  } catch (error: any) {
    console.error('Error generating tools analytics:', error);
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
