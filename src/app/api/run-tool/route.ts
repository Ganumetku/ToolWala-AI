import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { jsonDb } from '@/lib/jsonDb';

export async function POST(request: Request) {
  let toolId = '';
  let slug = '';
  try {
    const body = await request.json();
    const { toolId: bodyToolId, slug: bodySlug, inputs = {} } = body;
    toolId = bodyToolId;
    slug = bodySlug;

    // 1. Resolve Tool Config (DB or JSON)
    let tool: any = null;
    let apiConfig: any = null;

    if (prisma) {
      tool = await prisma.tool.findFirst({
        where: {
          OR: [
            { id: toolId || undefined },
            { slug: slug || undefined }
          ]
        },
        include: { apiConfig: true }
      });
      if (tool) {
        apiConfig = tool.apiConfig;
      }
    } else {
      const tools = jsonDb.getTools();
      tool = tools.find(t => t.id === toolId || t.slug === slug);
      if (tool && tool.apiTypeId) {
        const configs = jsonDb.getApiConfigs();
        apiConfig = configs.find(c => c.id === tool.apiTypeId);
      }
    }

    if (!tool) {
      return NextResponse.json({ success: false, error: 'AI Tool profile not found' }, { status: 404 });
    }

    // 2. Fetch API key fallbacks from env or settings if not connected to tool
    let provider = apiConfig?.provider || tool.apiType || 'openai';
    let apiKey = apiConfig?.apiKey || '';
    let baseUrl = apiConfig?.baseUrl || '';
    let modelName = apiConfig?.defaultModel || '';

    // Load fallbacks from environment if empty
    if (!apiKey) {
      if (provider === 'openai') {
        apiKey = process.env.OPENAI_API_KEY || '';
      } else if (provider === 'gemini') {
        apiKey = process.env.GEMINI_API_KEY || '';
      } else if (provider === 'claude') {
        apiKey = process.env.CLAUDE_API_KEY || '';
      }
    }

    // Load from Global Settings if still empty
    if (!apiKey) {
      let settingsObj: Record<string, string> = {};
      if (prisma) {
        const dbSettings = await prisma.globalSetting.findMany();
        dbSettings.forEach(s => { settingsObj[s.key] = s.value; });
      } else {
        const localSettings = jsonDb.getSettings();
        localSettings.forEach(s => { settingsObj[s.key] = s.value; });
      }
      
      if (provider === 'openai') apiKey = settingsObj['openai_api_key'] || '';
      if (provider === 'gemini') apiKey = settingsObj['gemini_api_key'] || '';
      if (provider === 'claude') apiKey = settingsObj['claude_api_key'] || '';
    }

    // 3. Render prompt template
    const template = tool.promptTemplate || '{{input}}';
    const compiledPrompt = template.replace(/\{\{(\w+)\}\}/g, (match: string, key: string) => {
      return inputs[key] !== undefined ? String(inputs[key]) : '';
    });


    let generatedOutput = '';
    let tokensUsed = 0;
    const startTime = Date.now();

    // 4. API Dispatcher
    if (provider === 'openai') {
      const endpoint = baseUrl || 'https://api.openai.com/v1/chat/completions';
      if (!apiKey) {
        throw new Error('OpenAI API key is missing. Configure it in Admin settings.');
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: modelName || 'gpt-4o-mini',
          messages: [{ role: 'user', content: compiledPrompt }],
          temperature: 0.7
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`OpenAI API failed: ${res.statusText} - ${errText}`);
      }

      const data = await res.json();
      generatedOutput = data.choices?.[0]?.message?.content || '';
      tokensUsed = data.usage?.total_tokens || 0;

    } else if (provider === 'gemini') {
      const model = modelName || 'gemini-1.5-flash';
      const endpoint = baseUrl || `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
      
      if (!apiKey) {
        throw new Error('Gemini API key is missing. Configure it in Admin settings.');
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: compiledPrompt }] }]
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Gemini API failed: ${res.statusText} - ${errText}`);
      }

      const data = await res.json();
      generatedOutput = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
      tokensUsed = Math.ceil(compiledPrompt.length / 4) + Math.ceil(generatedOutput.length / 4); // Estimator

    } else if (provider === 'claude') {
      const endpoint = baseUrl || 'https://api.anthropic.com/v1/messages';
      if (!apiKey) {
        throw new Error('Claude API key is missing. Configure it in Admin settings.');
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
          model: modelName || 'claude-3-5-haiku-20241022',
          max_tokens: 1024,
          messages: [{ role: 'user', content: compiledPrompt }]
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Claude API failed: ${res.statusText} - ${errText}`);
      }

      const data = await res.json();
      generatedOutput = data.content?.[0]?.text || '';
      tokensUsed = (data.usage?.input_tokens || 0) + (data.usage?.output_tokens || 0);

    } else if (provider === 'custom') {
      if (!baseUrl) {
        throw new Error('Custom execution requires a microservice Endpoint URL config.');
      }

      const res = await fetch(baseUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': apiKey ? `Bearer ${apiKey}` : ''
        },
        body: JSON.stringify({
          prompt: compiledPrompt,
          inputs: inputs
        })
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Custom tool endpoint failed: ${res.statusText} - ${errText}`);
      }

      const data = await res.json();
      generatedOutput = typeof data === 'string' ? data : (data.output || data.result || JSON.stringify(data));
      tokensUsed = 0;
    } else {
      throw new Error(`Unknown model execution type: ${provider}`);
    }

    const latency = Date.now() - startTime;

    // 5. Save Telemetry Log
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '127.0.0.1';
    const country = request.headers.get('x-vercel-ip-country') || 'Unknown';
    const device = request.headers.get('user-agent')?.includes('Mobile') ? 'Mobile' : 'Desktop';

    if (prisma) {
      await prisma.toolUsage.create({
        data: {
          toolId: tool.id,
          ipAddress: ip,
          country,
          device,
          tokensUsed,
          costEst: tokensUsed * 0.0000015, // Blended estimate
          isAiSuccess: true
        }
      });
    }

    return NextResponse.json({
      success: true,
      output: generatedOutput,
      latencyMs: latency,
      tokens: tokensUsed
    });

  } catch (error: any) {
    console.error('Execution API Error:', error);
    
    // Log failed execution if we have Prisma
    if (prisma && toolId) {
      try {
        await prisma.toolUsage.create({
          data: {
            toolId,
            isAiSuccess: false,
            country: 'Unknown',
            device: 'Desktop'
          }
        });
      } catch (err) {
        console.error('Failed to log failure event:', err);
      }
    }

    return NextResponse.json({
      success: false,
      error: error.message || 'Execution processor encounted a remote LLM error.'
    }, { status: 500 });
  }
}
