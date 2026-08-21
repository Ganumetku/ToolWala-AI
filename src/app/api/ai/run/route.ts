import { NextRequest, NextResponse } from 'next/server';
import {
  callOpenAI,
  callGemini,
  callGroq,
  buildToolPrompt,
  selectProvider,
  type AIProvider,
} from '@/lib/ai/providers';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { slug, toolId, inputs = {}, provider, promptTemplate, imageBase64: topImageBase64, mimeType: topMimeType } = body;
    const toolSlug = slug || toolId || '';

    if (!toolSlug) {
      return NextResponse.json(
        { success: false, error: 'Tool slug required' },
        { status: 400 }
      );
    }

    const imageBase64 = topImageBase64 || (inputs.imageBase64 as string | undefined);
    const mimeType = topMimeType || (inputs.mimeType as string | undefined);
    const hasImage = !!imageBase64;

    let selectedProvider: AIProvider;
    try {
      selectedProvider = selectProvider(toolSlug, provider, hasImage);
    } catch {
      return NextResponse.json(
        { success: false, error: 'No AI provider configured. Set GROQ_API_KEY, OPENAI_API_KEY or GEMINI_API_KEY.' },
        { status: 503 }
      );
    }

    const prompt = buildToolPrompt(toolSlug, inputs, promptTemplate);

    let result;
    const reqPayload = { prompt, imageBase64, mimeType };

    try {
      if (selectedProvider === 'gemini') {
        result = await callGemini(reqPayload);
      } else if (selectedProvider === 'openai') {
        result = await callOpenAI(reqPayload);
      } else {
        result = await callGroq({ prompt });
      }
    } catch (primaryErr: any) {
      console.warn(`Primary AI provider (${selectedProvider}) failed:`, primaryErr?.message);
      // Fallback attempts
      if (process.env.GEMINI_API_KEY && selectedProvider !== 'gemini') {
        try {
          result = await callGemini(reqPayload);
        } catch (e) {
          throw primaryErr;
        }
      } else if (process.env.OPENAI_API_KEY && selectedProvider !== 'openai') {
        try {
          result = await callOpenAI(reqPayload);
        } catch (e) {
          throw primaryErr;
        }
      } else if (process.env.GROQ_API_KEY && selectedProvider !== 'groq' && !hasImage) {
        try {
          result = await callGroq({ prompt });
        } catch (e) {
          throw primaryErr;
        }
      } else {
        throw primaryErr;
      }
    }

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
