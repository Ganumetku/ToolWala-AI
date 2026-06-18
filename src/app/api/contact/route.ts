import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { jsonDb } from '@/lib/jsonDb';

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

    // Save in local jsonDb
    const leads = jsonDb.getLeads() || [];
    const newLead = {
      id: 'lead-' + Math.random().toString(36).substring(2, 9),
      name,
      email,
      message,
      status: 'new' as const,
      createdAt: new Date().toISOString()
    };
    leads.push(newLead);
    jsonDb.saveLeads(leads);

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
  } catch (err) {
    console.error('Contact submit error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}

