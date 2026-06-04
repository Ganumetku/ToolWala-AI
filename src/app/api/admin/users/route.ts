import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// GET all users
export async function GET() {
  try {
    if (prisma) {
      const users = await prisma.user.findMany({
        orderBy: { createdAt: 'desc' }
      });
      return NextResponse.json(users);
    }
  } catch (error) {
    console.error('Prisma Users GET error, falling back to simulation:', error);
  }

  // Simulated Database Fallback
  const mockUsers = [
    { id: '1', email: 'admin@toolwala.co', role: 'admin', status: 'active', createdAt: '2026-05-01T12:00:00Z' },
    { id: '2', email: 'akash@technicul.co', role: 'premium', status: 'active', createdAt: '2026-05-15T08:30:00Z' },
    { id: '3', email: 'sam@guestmail.com', role: 'user', status: 'active', createdAt: '2026-06-02T14:45:00Z' },
    { id: '4', email: 'spammer_bot@malicious.xyz', role: 'user', status: 'blocked', createdAt: '2026-06-03T18:22:00Z' }
  ];
  return NextResponse.json(mockUsers);
}

// PUT / UPDATE user role or status
export async function PUT(request: Request) {
  try {
    const { id, role, status } = await request.json();
    if (prisma) {
      const dataToUpdate: any = {};
      if (role) dataToUpdate.role = role;
      if (status) dataToUpdate.status = status;

      const updated = await prisma.user.update({
        where: { id },
        data: dataToUpdate
      });
      return NextResponse.json({ success: true, updated });
    }
    return NextResponse.json({ success: true, message: 'Simulated update completed' });
  } catch (error) {
    console.error('Prisma User UPDATE error:', error);
    return NextResponse.json({ success: false, error: 'Database update failed' }, { status: 500 });
  }
}
