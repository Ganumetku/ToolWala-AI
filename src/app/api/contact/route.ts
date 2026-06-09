import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();
    if (supabase) {
      // Store in tool_analytics as contact event (leads table can be added later)
      await supabase.from('tool_analytics').insert({
        event_type: 'contact_lead',
        session_id: email,
        path: `/contact`,
        source: `${name}: ${message.slice(0, 200)}`,
      });
    }

    return NextResponse.json({ success: true, message: 'Message sent!' });
  } catch {
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
