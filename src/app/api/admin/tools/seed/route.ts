import { NextRequest, NextResponse } from 'next/server';
import { isAdmin } from '@/lib/supabase/server';
import { seedStaticToolsAdmin } from '@/lib/tool-service-admin';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  const result = await seedStaticToolsAdmin();
  return NextResponse.json({ success: true, ...result });
}
