import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET all contact leads
export async function GET() {
  try {
    if (prisma) {
      const messages = await prisma.contactLead.findMany({
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json(messages);
    }
  } catch (error) {
    console.error('Prisma Leads GET error, falling back to simulation:', error);
  }

  // Simulated Database Fallback
  const mockLeads = [
    { id: '1', name: 'John Doe', email: 'john@example.com', message: 'Hello, I would love to integrate your background remover into our corporate HR toolkit. Do you offer custom API pricing tiers?', status: 'new', createdAt: '2026-06-03T14:24:00Z' },
    { id: '2', name: 'Jane Smith', email: 'jane@startup.co', message: 'The OCR engine failed on a vertical text screenshot. Is vertical Japanese character detection supported?', status: 'pending', createdAt: '2026-06-02T09:12:00Z' },
    { id: '3', name: 'Mark Wilson', email: 'mark@designagency.net', message: 'I loved using the passport photo maker. Extremely clean cuts on hair edges! Shared with 10 teammates.', status: 'resolved', createdAt: '2026-06-01T17:40:00Z' },
    { id: '4', name: 'Sarah Connor', email: 'sarah@resistance.org', message: 'AI cost calculations seem off. Is it calculated dynamically based on input tokens?', status: 'new', createdAt: '2026-06-01T08:05:00Z' }
  ];
  return NextResponse.json(mockLeads);
}

// PUT / UPDATE lead status
export async function PUT(request: Request) {
  try {
    const { id, status } = await request.json();
    if (prisma) {
      const updated = await prisma.contactLead.update({
        where: { id },
        data: { status }
      });
      return NextResponse.json({ success: true, updated });
    }
    return NextResponse.json({ success: true, message: 'Simulated update completed' });
  } catch (error) {
    console.error('Prisma Leads UPDATE error:', error);
    return NextResponse.json({ success: false, error: 'Database update failed' }, { status: 500 });
  }
}

// DELETE a lead
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, error: 'ID parameter required' }, { status: 400 });
    }

    if (prisma) {
      await prisma.contactLead.delete({
        where: { id }
      });
      return NextResponse.json({ success: true });
    }
    return NextResponse.json({ success: true, message: 'Simulated delete completed' });
  } catch (error) {
    console.error('Prisma Leads DELETE error:', error);
    return NextResponse.json({ success: false, error: 'Database delete failed' }, { status: 500 });
  }
}
