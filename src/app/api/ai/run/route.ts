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

// Maximum request body size (1 MB) to prevent large base64 abuse
const MAX_BODY_BYTES = 1 * 1024 * 1024;

// Maximum base64 image size (600 KB encoded ≈ ~450 KB raw image)
const MAX_IMAGE_BASE64_LEN = 600 * 1024;

export async function POST(request: NextRequest) {
  try {
    // Enforce body size limit
    const contentLength = parseInt(request.headers.get('content-length') || '0', 10);
    if (contentLength > MAX_BODY_BYTES) {
      return NextResponse.json(
        { success: false, error: 'Request payload too large. Maximum 1 MB allowed.' },
        { status: 413 }
      );
    }

    const body = await request.json();
    const { slug, toolId, inputs = {}, provider, promptTemplate, imageBase64: topImageBase64, mimeType: topMimeType } = body;
    const toolSlug = slug || toolId || '';

    if (!toolSlug) {
      return NextResponse.json(
        { success: false, error: 'Tool slug required' },
        { status: 400 }
      );
    }

    // Reject overly long prompt templates supplied by the client (prompt injection guard)
    if (promptTemplate && typeof promptTemplate === 'string' && promptTemplate.length > 4000) {
      return NextResponse.json(
        { success: false, error: 'Invalid request parameters.' },
        { status: 400 }
      );
    }

    const imageBase64 = topImageBase64 || (inputs.imageBase64 as string | undefined);
    const mimeType = topMimeType || (inputs.mimeType as string | undefined);

    // Cap image size to prevent memory exhaustion
    if (imageBase64 && imageBase64.length > MAX_IMAGE_BASE64_LEN) {
      return NextResponse.json(
        { success: false, error: 'Image too large. Please use a smaller image (under ~450 KB).' },
        { status: 413 }
      );
    }

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
    console.error('AI run error:', err instanceof Error ? err.message : err);
    return NextResponse.json({ success: false, error: 'AI processing failed. Please try again.' }, { status: 500 });
  }
}
