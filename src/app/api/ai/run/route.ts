import { NextRequest, NextResponse } from 'next/server';
import {
  callOpenAI,
  callGemini,
  buildToolPrompt,
  selectProvider,
  type AIProvider,
} from '@/lib/ai/providers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, toolId, inputs = {}, provider, promptTemplate } = body;
    const toolSlug = slug || toolId || '';

    if (!toolSlug) {
      return NextResponse.json(
        { success: false, error: 'Tool slug required' },
        { status: 400 }
      );
    }

    let selectedProvider: AIProvider;
    try {
      selectedProvider = selectProvider(toolSlug, provider);
    } catch {
      return NextResponse.json(
        { success: false, error: 'No AI provider configured. Set OPENAI_API_KEY or GEMINI_API_KEY.' },
        { status: 503 }
      );
    }

    const prompt = buildToolPrompt(toolSlug, inputs, promptTemplate);

    const result =
      selectedProvider === 'gemini'
        ? await callGemini({ prompt })
        : await callOpenAI({ prompt });

    return NextResponse.json({
      success: true,
      output: result.output,
      latencyMs: result.latencyMs,
      tokens: result.tokens,
      provider: result.provider,
    });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'AI execution failed';
    console.error('AI run error:', message);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
