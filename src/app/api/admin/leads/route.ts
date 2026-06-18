import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/supabase/server';
import { jsonDb } from '@/lib/jsonDb';

export const dynamic = 'force-dynamic';

// GET all leads
export async function GET(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const leads = jsonDb.getLeads() || [];
    // Sort leads by date descending (newest first)
    const sortedLeads = [...leads].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    return NextResponse.json(sortedLeads);
  } catch (err) {
    console.error('Failed to get leads:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// PUT to update lead status
export async function PUT(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { id, status } = body;

    if (!id || !status) {
      return NextResponse.json({ error: 'ID and Status are required' }, { status: 400 });
    }

    const leads = jsonDb.getLeads() || [];
    const leadIndex = leads.findIndex(l => l.id === id);

    if (leadIndex === -1) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    leads[leadIndex] = {
      ...leads[leadIndex],
      status,
      updatedAt: new Date().toISOString()
    } as any;

    jsonDb.saveLeads(leads);
    return NextResponse.json({ success: true, lead: leads[leadIndex] });
  } catch (err) {
    console.error('Failed to update lead status:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// DELETE a lead
export async function DELETE(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 });
    }

    const leads = jsonDb.getLeads() || [];
    const filteredLeads = leads.filter(l => l.id !== id);

    if (leads.length === filteredLeads.length) {
      return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
    }

    jsonDb.saveLeads(filteredLeads);
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Failed to delete lead:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
