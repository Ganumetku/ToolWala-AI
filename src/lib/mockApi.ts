// Client-side mock backend interceptor for static export environment

export function initMockApi() {
  if (typeof window === 'undefined') return;
  if ((window as any).__fetchMocked) return;

  (window as any).__fetchMocked = true;
  const originalFetch = window.fetch;

  const getLocalData = (key: string, defaultValue: any) => {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (e) {
      return defaultValue;
    }
  };

  const setLocalData = (key: string, value: any) => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {}
  };

  window.fetch = async function (input, init) {
    const url = typeof input === 'string' ? input : (input instanceof URL ? input.toString() : input.url);
    const method = init?.method?.toUpperCase() || 'GET';

    // 1. Mock stats API
    if (url.includes('/api/admin/stats')) {
      const tools = getLocalData('dynamic_tools', []);
      const blogs = getLocalData('dynamic_blogs', []);
      const leads = getLocalData('dynamic_leads', []);
      const visitorsCount = getLocalData('visitors_count', 48250);

      const responseData = {
        totalUsers: 12480,
        totalVisitors: visitorsCount,
        totalUsage: 85920 + tools.length * 10,
        activeSessions: 248,
        popularTools: [
          { name: 'AI Color Palette Generator', count: 34120, category: 'Creative & Design', growth: '+24%' },
          { name: 'AI Resume Builder', count: 22180, category: 'Career Studio', growth: '+18%' },
          { name: 'OCR Image to Text', count: 11170, category: 'Document & PDF', growth: '+8%' }
        ],
        recentLogs: leads.map((l: any) => ({
          id: l.id,
          action: 'Form Submitted',
          tool: 'Contact Lead',
          user: l.name,
          status: 'success',
          time: 'Recent'
        })).concat([
          { id: '1', action: 'Background Removed', tool: 'AI Background Remover', user: 'guest_84920', status: 'success', time: '2 mins ago' },
          { id: '2', action: 'Text Extracted (eng)', tool: 'OCR Image to Text', user: 'premium_akash', status: 'success', time: '8 mins ago' },
          { id: '3', action: 'PDF Merged', tool: 'PDF Tools', user: 'guest_10482', status: 'success', time: '14 mins ago' }
        ])
      };

      return new Response(JSON.stringify(responseData), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 2. Mock blogs API
    if (url.includes('/api/admin/blogs')) {
      let blogs = getLocalData('dynamic_blogs', [
        {
          id: '1',
          slug: 'why-local-ocr-is-the-future',
          title: 'Why Browser-Native OCR is the Future of Data Safety',
          excerpt: 'Traditional optical character recognition uploads documents to cloud databases. This article outlines the transition to client-side WebAssembly rendering, protecting sensitive data locally.',
          content: 'Traditional optical character recognition (OCR) uploads documents to cloud databases. This article outlines the transition to client-side WebAssembly rendering, protecting sensitive data locally.\n\n### The Problem with Cloud OCR\nEvery time you upload a receipt, ID card, or invoice to a remote OCR server, you risk exposing sensitive information. Cloud services process your file, extract the text, and store it. In many cases, these files are saved for training models or analytics, which could violate privacy standards like GDPR.\n\n### Enter Client-Side WebAssembly\nWith advancements in WebAssembly (WASM), we can run powerful neural network models directly inside the browser. ToolWala AI uses Tesseract.js running locally in your browser sandbox. Your files never leave your computer, ensuring absolute privacy.\n\n### Benefits of Local Processing\n- **100% Privacy:** Your files are processed entirely in memory, with no network uploads.\n- **Zero Server Costs:** Since the user\'s browser does the computation, the service remains free and scaleable.\n- **Offline Capability:** Once the models are cached in the browser, you can scan images offline.',
          thumbnail: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
          category: 'PDF Tools',
          tags: ['Security', 'OCR', 'WebAssembly'],
          featured: true,
          status: 'published',
          publishedAt: '2026-06-04T05:54:22.719Z',
          createdAt: '2026-06-04T05:54:22.719Z',
          updatedAt: '2026-06-04T05:54:22.719Z',
          author: {
            name: 'ToolWala Editorial',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
            role: 'Tech Writer'
          },
          seoMetadata: {
            title: 'Local OCR WebAssembly Data Safety | ToolWala AI',
            description: 'Learn why processing character recognition inside the browser context outperforms cloud databases.'
          },
          readingTime: '3 min read'
        },
        {
          id: '2',
          slug: 'mastering-image-compression-balancing-size-and-quality',
          title: 'Mastering Image Compression: Hitting the Perfect Balance',
          excerpt: 'How to reduce file size up to 90% without compromising visual clarity. An in-depth guide on modern image formats and client-side optimization algorithms.',
          content: 'Optimizing image file sizes is critical for fast page speeds and professional SEO indexing. However, finding the right compression ratio can be challenging. Let\'s break down how modern compression works.\n\n### Lossy vs. Lossless Compression\nLossy compression reduces file sizes by permanently removing less important pixel data. Lossless compression, on the other hand, reorganizes file metadata without dropping any visual accuracy.\n\n### The Rise of WebP and AVIF\nTraditional formats like JPEG and PNG are being outpaced by next-generation web image formats:\n- **WebP:** Offers 26% smaller sizes compared to PNG, and 30% smaller sizes compared to JPEG.\n- **AVIF:** Delivers even better quality-to-size performance, though browser rendering is still maturing.\n\n### Doing it Locally\nOur browser image compressor utilizes canvas scaling and output rendering variables inside client threads to save you bandwidth and securely shrink assets without database tracking.',
          thumbnail: 'https://images.unsplash.com/photo-1542831371-29b0f74f9713?auto=format&fit=crop&w=800&q=80',
          category: 'Image Editing',
          tags: ['Image Compression', 'WebPerformance', 'SEO'],
          featured: false,
          status: 'published',
          publishedAt: '2026-06-05T10:15:00.000Z',
          createdAt: '2026-06-05T10:15:00.000Z',
          updatedAt: '2026-06-05T10:15:00.000Z',
          author: {
            name: 'Akash Sharma',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
            role: 'Creator of ToolWala'
          },
          seoMetadata: {
            title: 'Mastering Image Compression & Optimization | ToolWala AI',
            description: 'Learn how to optimize web layouts by compressing images. Hitting the perfect balance between quality and speed.'
          },
          readingTime: '4 min read'
        },
        {
          id: '3',
          slug: 'the-rise-of-edge-ai-local-models',
          title: 'The Rise of Edge AI: Running Models Directly in Your Web Browser',
          excerpt: 'Edge AI is revolutionizing web apps. Learn how next-generation browser applications run machine learning models client-side with full confidentiality.',
          content: 'AI computation is shifting from massive centralized data centers down to the user\'s device. This paradigm shift, known as Edge AI, brings unparalleled privacy, reduced latency, and cost-efficiency to web applications.\n\n### How Web-Native AI Works\nModern browser platforms utilize WebGL, WebGPU, and WebAssembly (WASM) to run compiled model configurations. Frameworks like ONNX Runtime Web and TensorFlow.js make it easy to deploy deep learning models directly on client hardware.\n\n### What Tools Can We Run Locally?\n- **Background Removal:** Extracting backgrounds from images using edge segmentation models.\n- **Face Detection:** Cropping passport photos automatically.\n- **Voice Synthesis:** Synthesizing professional voiceovers in-browser.\n- **Text Classification:** Analyzing and humanizing content context layouts locally.\n\nAt ToolWala AI, we are committed to making these edge models accessible to everyone, ensuring your privacy remains intact.',
          thumbnail: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?auto=format&fit=crop&w=800&q=80',
          category: 'AI Tools',
          tags: ['Artificial Intelligence', 'EdgeComputing', 'WebDev'],
          featured: true,
          status: 'published',
          publishedAt: '2026-06-06T08:00:00.000Z',
          createdAt: '2026-06-06T08:00:00.000Z',
          updatedAt: '2026-06-06T08:00:00.000Z',
          author: {
            name: 'ToolWala Editorial',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
            role: 'Tech Writer'
          },
          seoMetadata: {
            title: 'Rise of Edge AI: Running Models Locally in Browser | ToolWala AI',
            description: 'Discover how browser-native AI architectures run background removers and voice synthesizers locally without cloud servers.'
          },
          readingTime: '5 min read'
        },
        {
          id: '4',
          slug: 'ats-resume-optimization-secrets',
          title: 'ATS Resume Optimization: Secrets to Passing the Automated Screen',
          excerpt: 'Most resumes are discarded by Applicant Tracking Systems before a recruiter even reads them. Learn the secrets of keyword mapping, structural formatting, and templates.',
          content: 'Preparing resumes for corporate applications can feel like throwing documents into a black hole. Modern HR departments rely heavily on Applicant Tracking Systems (ATS) to scan, filter, and score candidates.\n\n### The Role of ATS Scanners\nATS software acts as an automated gatekeeper. It reads the text structure of your PDF, extracts metadata like job titles and contact info, and matches your skills against the job description.\n\n### Optimization Tips\n- **Simple Formatting:** Avoid multi-column layouts, tables, and graphic elements that parse incorrectly.\n- **Keywords Alignment:** Tailor your experience to use the exact terms from the job posting.\n- **Standard Headings:** Use standard section labels like Experience, Education, and Skills.\n\nOur ATS CV Builder generates compliant layouts to bypass scanner roadblocks automatically.',
          thumbnail: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?auto=format&fit=crop&w=800&q=80',
          category: 'Document Tools',
          tags: ['Resume', 'Career', 'ATS'],
          featured: false,
          status: 'draft',
          publishedAt: '',
          createdAt: '2026-06-06T09:25:00.000Z',
          updatedAt: '2026-06-06T09:25:00.000Z',
          author: {
            name: 'Akash Sharma',
            avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=150&q=80',
            role: 'Creator of ToolWala'
          },
          seoMetadata: {
            title: 'ATS Resume Optimization Secrets | ToolWala AI',
            description: 'Bypass corporate Applicant Tracking Systems with our guide to parsing optimization and keywords.'
          },
          readingTime: '3 min read'
        },
        {
          id: '5',
          slug: 'maximizing-ai-productivity-for-developers',
          title: 'Maximizing AI Productivity: Practical Prompt Engineering for Developers',
          excerpt: 'Go beyond basic prompts. Discover how developers leverage structured prompts, system instructions, and sandbox configurations to automate code writing.',
          content: 'Generative AI is changing how software is built. However, generic queries lead to generic code outputs. To maximize developer velocity, you need a structured prompt engineering methodology.\n\n### Structured Prompting Pattern\nProvide clear context, input values, guidelines, and expected output formats. For instance, define system instructions and constraints clearly before execution.\n\n### Browser-Native Testing\nRunning lightweight models locally allows testing prompts without risking API leaks or incurring usage fees. ToolWala AI is building an integrated prompt studio workspace for offline debugging.',
          thumbnail: 'https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=800&q=80',
          category: 'AI Tools',
          tags: ['Productivity', 'AI', 'PromptEngineering'],
          featured: false,
          status: 'draft',
          publishedAt: '',
          createdAt: '2026-06-06T09:25:00.000Z',
          updatedAt: '2026-06-06T09:25:00.000Z',
          author: {
            name: 'ToolWala Editorial',
            avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80',
            role: 'Tech Writer'
          },
          seoMetadata: {
            title: 'Practical Developer Prompt Engineering Guide | ToolWala AI',
            description: 'Learn prompt engineering structures to accelerate coding tasks and build browser integrations.'
          },
          readingTime: '4 min read'
        }
      ]);

      if (method === 'GET') {
        return new Response(JSON.stringify({ success: true, blogs }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const body = init?.body ? JSON.parse(init.body as string) : {};

      if (method === 'POST') {
        const newBlog = {
          ...body,
          id: 'blog_' + Date.now(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        blogs.push(newBlog);
        setLocalData('dynamic_blogs', blogs);
        return new Response(JSON.stringify({ success: true, blog: newBlog }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      // PUT & DELETE support
      const parts = url.split('/');
      const blogId = parts[parts.length - 1].split('?')[0];

      if (method === 'PUT') {
        blogs = blogs.map((b: any) => b.id === blogId || url.includes(b.id) ? { ...b, ...body, updatedAt: new Date().toISOString() } : b);
        setLocalData('dynamic_blogs', blogs);
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (method === 'DELETE') {
        blogs = blogs.filter((b: any) => b.id !== blogId && !url.includes(b.id));
        setLocalData('dynamic_blogs', blogs);
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 3. Mock tools API
    if (url.includes('/api/admin/tools')) {
      let tools = getLocalData('dynamic_tools', [
        {
          id: 'bg-remover',
          slug: 'bg-remover',
          title: 'AI Background Remover',
          description: 'Remove image backgrounds automatically in seconds.',
          longDesc: 'Our advanced background removal tool leverages neural networks to identify and segment foreground elements, producing transparent PNGs with crisp details and smooth edges.',
          categoryName: 'Creative & Design',
          categorySlug: 'creative-design',
          isPopular: true,
          isFeatured: true,
          isTrending: false,
          published: true,
          isPublished: true,
          publishDate: null,
          status: 'published',
          icon: '🖼️',
          toolType: 'AI Image Tool',
          ctaButtonText: 'Remove Background',
          inputs: [
            { id: '1-1', name: 'image', label: 'Upload Image', type: 'file', required: true, order: 0 }
          ],
          faqs: [
            { id: '1-f1', question: 'What image formats are supported?', answer: 'We support PNG, JPG, and WebP images up to 10MB in size.', order: 0 }
          ],
          articles: [
            { id: '1-a1', title: 'Why background removal matters', content: 'Clean cutouts are essential for commercial product photography, web layouts, and corporate profiles.' }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'pdf-to-word-converter',
          slug: 'pdf-to-word-converter',
          title: 'PDF to Word Converter',
          description: 'Convert PDF files into editable Word documents online.',
          longDesc: 'ToolWala AI PDF to Word Converter extracts text structures, headings, and paragraphs locally to build editable DOCX files.',
          categoryName: 'Document & PDF',
          categorySlug: 'pdf-tools',
          isPopular: true,
          isFeatured: true,
          isTrending: true,
          published: true,
          isPublished: true,
          publishDate: null,
          status: 'published',
          icon: '📝',
          toolType: 'PDF Tool',
          ctaButtonText: 'Convert to Word',
          inputs: [
            { id: 'pdf-upload', name: 'pdf', label: 'Upload PDF', type: 'file', required: true, order: 0 }
          ],
          faqs: [
            { id: 'pdf-faq-1', question: 'Is it free?', answer: 'Yes, 100% free online.', order: 0 }
          ],
          articles: [
            { id: 'pdf-art-1', title: 'Editable Word Docs from PDF', content: 'Extract text layout locally.' }
          ],
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ]);

      // Normalize dynamic tools schema values on read
      const normalizedTools = tools.map((t: any) => {
        const isPublished = t.isPublished !== undefined ? t.isPublished : (t.published !== undefined ? t.published : true);
        const status = t.status || (isPublished ? 'published' : 'draft');
        return {
          ...t,
          isPublished,
          published: isPublished,
          publishDate: t.publishDate || null,
          status,
          createdAt: t.createdAt || new Date().toISOString(),
          updatedAt: t.updatedAt || new Date().toISOString()
        };
      });

      if (method === 'GET') {
        return new Response(JSON.stringify({ success: true, tools: normalizedTools }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const body = init?.body ? JSON.parse(init.body as string) : {};

      if (method === 'POST') {
        const status = body.status || (body.isPublished ? 'published' : 'draft');
        const isPublished = body.isPublished !== undefined ? body.isPublished : (status === 'published' || status === 'scheduled');
        const publishDate = body.publishDate || null;
        
        const newTool = {
          ...body,
          status,
          isPublished,
          published: isPublished,
          publishDate,
          id: 'tool_' + Date.now(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };
        tools.push(newTool);
        setLocalData('dynamic_tools', tools);
        return new Response(JSON.stringify({ success: true, tool: newTool }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const parts = url.split('/');
      const toolId = parts[parts.length - 1].split('?')[0];

      if (method === 'PUT') {
        const status = body.status || (body.isPublished ? 'published' : 'draft');
        const isPublished = body.isPublished !== undefined ? body.isPublished : (status === 'published' || status === 'scheduled');
        const publishDate = body.publishDate || null;

        tools = tools.map((t: any) => t.id === toolId || url.includes(t.id) ? { 
          ...t, 
          ...body, 
          status,
          isPublished,
          published: isPublished,
          publishDate,
          updatedAt: new Date().toISOString() 
        } : t);
        setLocalData('dynamic_tools', tools);
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (method === 'DELETE') {
        tools = tools.filter((t: any) => t.id !== toolId && !url.includes(t.id));
        setLocalData('dynamic_tools', tools);
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 4. Mock users API
    if (url.includes('/api/admin/users')) {
      let users = getLocalData('dynamic_users', [
        { id: '1', email: 'admin@toolwala.co', role: 'admin', status: 'active', createdAt: '2026-05-01T12:00:00Z' },
        { id: '2', email: 'akash@technicul.co', role: 'premium', status: 'active', createdAt: '2026-05-15T08:30:00Z' },
        { id: '3', email: 'sam@guestmail.com', role: 'user', status: 'active', createdAt: '2026-06-02T14:45:00Z' },
        { id: '4', email: 'spammer_bot@malicious.xyz', role: 'user', status: 'blocked', createdAt: '2026-06-03T18:22:00Z' }
      ]);

      if (method === 'GET') {
        return new Response(JSON.stringify(users), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const body = init?.body ? JSON.parse(init.body as string) : {};

      if (method === 'PUT') {
        users = users.map((u: any) => u.id === body.id ? { ...u, ...body } : u);
        setLocalData('dynamic_users', users);
        return new Response(JSON.stringify({ success: true, updated: body }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 5. Mock leads API
    if (url.includes('/api/admin/leads')) {
      let leads = getLocalData('dynamic_leads', [
        { id: '1', name: 'Ganesh Kumar', email: 'ganesh@gmail.com', message: 'Hello! I am looking for a white-label version of your background removal tool. Please contact me.', status: 'new', createdAt: new Date().toISOString() },
        { id: '2', name: 'John Doe', email: 'john@doe.com', message: 'Do you plan to release a resume templates store?', status: 'resolved', createdAt: new Date().toISOString() }
      ]);

      if (method === 'GET') {
        return new Response(JSON.stringify(leads), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const body = init?.body ? JSON.parse(init.body as string) : {};

      if (method === 'PUT') {
        leads = leads.map((l: any) => l.id === body.id ? { ...l, ...body } : l);
        setLocalData('dynamic_leads', leads);
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (method === 'DELETE') {
        const id = url.includes('?') ? new URLSearchParams(url.split('?')[1]).get('id') : '';
        leads = leads.filter((l: any) => l.id !== id);
        setLocalData('dynamic_leads', leads);
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 6. Mock settings API
    if (url.includes('/api/admin/settings')) {
      const settings = getLocalData('dynamic_settings', {
        site_title: 'ToolWala - AI Tools Suite',
        seo_description: 'Discover the future of utility tools with our dynamic AI marketplace.',
        openai_api_key: '',
        gemini_api_key: '',
        claude_api_key: '',
        smtp_host: '',
        smtp_port: '',
        smtp_user: '',
        smtp_password: '',
        social_twitter: '',
        social_github: ''
      });

      if (method === 'GET') {
        return new Response(JSON.stringify({ success: true, settings }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      const body = init?.body ? JSON.parse(init.body as string) : {};
      if (method === 'POST') {
        setLocalData('dynamic_settings', body.settings);
        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // 7. Mock media API
    if (url.includes('/api/admin/media')) {
      return new Response(JSON.stringify({
        success: true,
        url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
        filename: 'mock-uploaded-file.jpg'
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 8. Mock run tool API
    if (url.includes('/api/run-tool')) {
      const body = init?.body ? JSON.parse(init.body as string) : {};
      const toolId = body.toolId || body.slug || '';
      const inputs = body.inputs || {};
      
      let outputText = 'Executing standard AI compilation...';
      
      if (toolId.includes('caption-generator')) {
        outputText = `Here are some high-converting social media captions generated for your prompt:\n\n1. ✨ Ready to step up? Let's build together! #Mindset #Success\n2. The future is browser-native. No servers, absolute privacy. 🚀\n3. Small edits, massive impacts. What are you building today? 🛠\n`;
      } else if (toolId.includes('cover-letter-generator')) {
        outputText = `Dear Hiring Team,\n\nI am writing to express my enthusiastic interest in the role you listed. With my background in technology and execution, I am confident I can contribute value from day one. Thank you for your consideration.\n\nSincerely,\nCandidate`;
      } else if (toolId.includes('text-humanizer')) {
        outputText = `Here is the humanized version of your text, optimized for readability and natural flow:\n\n"${inputs.text || 'We are dedicated to improving client workflows with secure client-side work.'}"`;
      } else {
        outputText = `Result for ${toolId.toUpperCase()} with inputs:\n${JSON.stringify(inputs, null, 2)}`;
      }

      return new Response(JSON.stringify({
        success: true,
        output: outputText,
        latencyMs: 340,
        tokens: 120
      }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // 9. Mock contact API
    if (url.includes('/api/contact')) {
      const body = init?.body ? JSON.parse(init.body as string) : {};
      const leads = getLocalData('dynamic_leads', []);
      leads.push({
        id: 'lead_' + Date.now(),
        name: body.name || 'Anonymous User',
        email: body.email || 'no-email@contact.com',
        message: body.message || 'No message provided.',
        status: 'new',
        createdAt: new Date().toISOString()
      });
      setLocalData('dynamic_leads', leads);
      return new Response(JSON.stringify({ success: true, message: 'Message sent!' }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    return originalFetch(input, init);
  };
}
