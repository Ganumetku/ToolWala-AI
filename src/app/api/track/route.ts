import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const supabase = createServiceClient();

    if (supabase) {
      const eventType =
        body.type === 'visitor'
          ? 'visitor'
          : body.type === 'tool_run'
            ? 'tool_run'
            : 'event';

      await supabase.from('tool_analytics').insert({
        tool_slug: body.toolId || body.toolSlug || null,
        event_type: eventType,
        session_id: body.sessionId || null,
        path: body.path || null,
        source: body.source || 'Direct',
      });
    }

    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ success: true });
  }
}
