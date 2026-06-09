import { NextRequest, NextResponse } from 'next/server';
import { callOpenAI } from '@/lib/ai/providers';
import { isAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  // Admin-only direct OpenAI proxy for testing in dashboard
  if (!(await isAdmin(request))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = await callOpenAI({
      prompt: body.prompt,
      systemPrompt: body.systemPrompt,
      model: body.model,
      maxTokens: body.maxTokens,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'OpenAI error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
