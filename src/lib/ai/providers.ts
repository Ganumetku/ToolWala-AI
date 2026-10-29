const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const GROQ_API_KEY = process.env.GROQ_API_KEY;

export type AIProvider = 'openai' | 'gemini' | 'groq';

export interface AIRequest {
  prompt: string;
  systemPrompt?: string;
  model?: string;
  maxTokens?: number;
  imageBase64?: string;
  mimeType?: string;
  jsonMode?: boolean;
}

export interface AIResponse {
  output: string;
  tokens: number;
  latencyMs: number;
  provider: AIProvider;
}

export async function callGroq(req: AIRequest): Promise<AIResponse> {
  if (!GROQ_API_KEY) throw new Error('Groq API key not configured');

  const start = Date.now();
  const model = req.model || 'llama-3.3-70b-versatile';
  const isJson = req.jsonMode || req.prompt.includes('JSON') || req.prompt.includes('json');

  const bodyPayload: any = {
    model,
    messages: [
      ...(req.systemPrompt
        ? [{ role: 'system', content: req.systemPrompt }]
        : []),
      { role: 'user', content: req.prompt },
    ],
    max_tokens: req.maxTokens || 2048,
    temperature: isJson ? 0.3 : 0.7,
  };

  if (isJson) {
    bodyPayload.response_format = { type: 'json_object' };
  }

  const res = await fetch('https://api.groq.com/openai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify(bodyPayload),
  });

  if (!res.ok) {
    const errText = await res.text();
    throw new Error(`Groq error: ${errText}`);
  }

  const data = await res.json();
  const output = data.choices?.[0]?.message?.content || '';
  const tokens = data.usage?.total_tokens || 0;

  return {
    output,
    tokens,
    latencyMs: Date.now() - start,
    provider: 'groq',
  };
}

export async function callOpenAI(req: AIRequest): Promise<AIResponse> {
  if (!OPENAI_API_KEY) throw new Error('OpenAI API key not configured');

  const start = Date.now();
  const model = req.model || 'gpt-4o-mini';
  const isJson = req.jsonMode || req.prompt.includes('JSON') || req.prompt.includes('json');

  let userContent: any = req.prompt;
  if (req.imageBase64) {
    const dataUrl = req.imageBase64.startsWith('data:')
      ? req.imageBase64
      : `data:${req.mimeType || 'image/jpeg'};base64,${req.imageBase64}`;
    userContent = [
      { type: 'text', text: req.prompt },
      {
        type: 'image_url',
        image_url: { url: dataUrl },
      },
    ];
  }

  const bodyPayload: any = {
    model,
    messages: [
      ...(req.systemPrompt
        ? [{ role: 'system', content: req.systemPrompt }]
        : []),
      { role: 'user', content: userContent },
    ],
    max_tokens: req.maxTokens || 4000,
    temperature: isJson ? 0.3 : 0.7,
  };

  if (isJson) {
    bodyPayload.response_format = { type: 'json_object' };
  }

  const res = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify(bodyPayload),
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
  const model = req.model || 'gemini-2.5-flash';
  const isJson = req.jsonMode || req.prompt.includes('JSON') || req.prompt.includes('json');

  const parts: any[] = [];

  if (req.imageBase64) {
    let cleanBase64 = req.imageBase64;
    let mime = req.mimeType || 'image/jpeg';
    if (cleanBase64.includes(';base64,')) {
      const split = cleanBase64.split(';base64,');
      mime = split[0].replace('data:', '');
      cleanBase64 = split[1];
    }
    parts.push({
      inline_data: {
        mime_type: mime,
        data: cleanBase64,
      },
    });
  }

  parts.push({
    text: req.systemPrompt
      ? `${req.systemPrompt}\n\n${req.prompt}`
      : req.prompt,
  });

  const generationConfig: Record<string, any> = {
    maxOutputTokens: req.maxTokens || 4000,
    temperature: isJson ? 0.3 : 0.7,
  };

  if (isJson) {
    generationConfig.responseMimeType = 'application/json';
  }

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [
          {
            parts,
          },
        ],
        generationConfig,
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
    .filter(([k]) => k !== 'imageBase64' && k !== 'mimeType')
    .map(([k, v]) => `${k}: ${v}`)
    .join('\n');

  const templates: Record<string, string> = {
    'caption-generator': `Generate 5 engaging social media captions for:\n${inputText}`,
    'ai-image-describer': `Analyze the provided image in detail and describe what you see:\n${inputText}`,
    'cover-letter-generator': `You are an expert executive career writer and hiring consultant. Write a highly persuasive, tailored, and realistic cover letter based on these details:
${inputText}

Rules:
- Output ONLY the clean cover letter text (starting with the formal date/recipient, salutation, compelling opening hook, 2-3 body paragraphs connecting applicant achievements to company needs, and a confident closing call to action).
- Do NOT include any conversational preamble or meta-text (e.g. "Here is your letter:").
- Strictly reflect the requested tone and experience level.
- Ensure natural, engaging human phrasing that sounds genuine and authentic.`,
    'text-humanizer': `Rewrite this text to sound more natural and human:\n${inputs.text || inputText}`,
    'voice-generator': `Generate a voice script based on:\n${inputText}`,
  };

  return templates[slug] || `Process the following inputs for tool "${slug}":\n${inputText}`;
}

export function selectProvider(slug: string, preferred?: string, hasImage?: boolean): AIProvider {
  if (hasImage) {
    if (GEMINI_API_KEY) return 'gemini';
    if (OPENAI_API_KEY) return 'openai';
  }
  if (preferred === 'gemini' && GEMINI_API_KEY) return 'gemini';
  if (preferred === 'openai' && OPENAI_API_KEY) return 'openai';
  if (preferred === 'groq' && GROQ_API_KEY) return 'groq';
  if (GROQ_API_KEY) return 'groq';
  if (GEMINI_API_KEY) return 'gemini';
  if (OPENAI_API_KEY) return 'openai';
  throw new Error('No AI provider configured');
}
