import { NextRequest, NextResponse } from 'next/server';
import { callGemini } from '@/lib/ai/providers';
import { isAdmin } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (!(await isAdmin(request))) {
    return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();
    const result = await callGemini({
      prompt: body.prompt,
      systemPrompt: body.systemPrompt,
      model: body.model,
      maxTokens: body.maxTokens,
    });

    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Gemini error';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
