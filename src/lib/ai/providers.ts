const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

export type AIProvider = 'openai' | 'gemini';

export interface AIRequest {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  maxTokens?: number;
}

export interface AIResponse {
  output: string;
  tokens: number;
  latencyMs: number;
  provider: AIProvider;
}

export async function callOpenAI(req: AIRequest): Promise<AIResponse> {
  if (!OPENAI_API_KEY) throw new Error('OpenAI API key not configured');

  const start = Date.now();
  const model = req.model || 'gpt-4o-mini';

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages: [
        ...(req.systemPrompt
          ? [{ role: 'system', content: req.systemPrompt }]
          : []),
        { role: 'user', content: req.prompt },
      ],
      max_tokens: req.maxTokens || 1024,
      temperature: 0.7,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    throw new Error(`OpenAI error: ${err}`);
  }

  const data = await res.json();
  const output = data.choices?.[0]?.message?.content || '';
  const tokens = data.usage?.total_tokens || 0;

  return {
    output,
    tokens,
    latencyMs: Date.now() - start,
    provider: 'openai',
  };
}

export async function callGemini(req: AIRequest): Promise<AIResponse> {
  if (!GEMINI_API_KEY) throw new Error('Gemini API key not configured');

  const start = Date.now();
  const model = req.model || 'gemini-2.0-flash';

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts: [
              {
                text: req.systemPrompt
                  ? `${req.systemPrompt}\n\n${req.prompt}`
                  : req.prompt,
              },
            ],
          },
        ],
        generationConfig: {
          maxOutputTokens: req.maxTokens || 1024,
          temperature: 0.7,
        },
      }),
    }
  );

  if (!res.ok) {
    const errText = await res.text();
    try {
      const errJson = JSON.parse(errText);
      if (
        res.status === 429 ||
        errJson?.error?.code === 429 ||
        errJson?.error?.status === 'RESOURCE_EXHAUSTED'
      ) {
        throw new Error(
          'AI Service daily quota exceeded. Please try again in a few minutes or update API billing/key.'
        );
      }
      if (errJson?.error?.message) {
        throw new Error(`Gemini API Error: ${errJson.error.message}`);
      }
    } catch (parseErr: any) {
      if (
        parseErr?.message?.includes('AI Service') ||
        parseErr?.message?.includes('Gemini API Error')
      ) {
        throw parseErr;
      }
    }
    throw new Error(`Gemini error: ${errText}`);
  }

  const data = await res.json();
  const output =
    data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  const tokens = data.usageMetadata?.totalTokenCount || 0;

  return {
    output,
    tokens,
    latencyMs: Date.now() - start,
    provider: 'gemini',
  };
}

export function buildToolPrompt(
  slug: string,
  inputs: Record<string, unknown>,
  promptTemplate?: string
): string {
  if (promptTemplate) {
    return promptTemplate.replace(/\{\{(\w+)\}\}/g, (_, key) =>
      String(inputs[key] ?? '')
    );
  }

  const inputText = Object.entries(inputs)
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');

  const templates: Record<string, string> = {
    'caption-generator': `Generate 5 engaging social media captions for:\n${inputText}`,
    'cover-letter-generator': `Write a professional cover letter based on:\n${inputText}`,
    'text-humanizer': `Rewrite this text to sound more natural and human:\n${inputs.text || inputText}`,
    'voice-generator': `Generate a voice script based on:\n${inputText}`,
  };

  return templates[slug] || `Process the following inputs for tool "${slug}":\n${inputText}`;
}

export function selectProvider(slug: string, preferred?: string): AIProvider {
  if (preferred === 'gemini' && GEMINI_API_KEY) return 'gemini';
  if (preferred === 'openai' && OPENAI_API_KEY) return 'openai';
  if (OPENAI_API_KEY) return 'openai';
  if (GEMINI_API_KEY) return 'gemini';
  throw new Error('No AI provider configured');
}
