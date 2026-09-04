import { NextRequest, NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase/server';
import { jsonDb } from '@/lib/jsonDb';

export const dynamic = 'force-dynamic';

// Basic email format check (not relying on client-side only)
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, message } = body;

    // Presence check
    if (!name || !email || !message) {
      return NextResponse.json(
        { success: false, error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Type check
    if (typeof name !== 'string' || typeof email !== 'string' || typeof message !== 'string') {
      return NextResponse.json({ success: false, error: 'Invalid field types' }, { status: 400 });
    }

    // Length limits to prevent DoS / storage abuse
    if (name.length > 100 || email.length > 254 || message.length > 2000) {
      return NextResponse.json(
        { success: false, error: 'One or more fields exceed maximum length.' },
        { status: 400 }
      );
    }

    // Email format validation
    if (!isValidEmail(email)) {
      return NextResponse.json({ success: false, error: 'Please enter a valid email address.' }, { status: 400 });
    }

    // Save in local jsonDb
    const leads = jsonDb.getLeads() || [];
    const newLead = {
      id: 'lead-' + Math.random().toString(36).substring(2, 9),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
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
        session_id: newLead.email,
        path: `/contact`,
        source: `${newLead.name}: ${newLead.message.slice(0, 200)}`,
      });
    }

    return NextResponse.json({ success: true, message: 'Message sent!' });
  } catch (err) {
    console.error('Contact submit error:', err);
    return NextResponse.json({ success: false, error: 'Server error' }, { status: 500 });
  }
}
