"use client";

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Sidebar from '@/components/admin/Sidebar';
import Header from '@/components/admin/Header';
import { Toaster } from 'sonner';

// ==========================================
// CLIENT-SIDE MOCK BACKEND INTERCEPTOR FOR STATIC HOSTING
// ==========================================
if (typeof window !== 'undefined') {
  if (!(window as any).__fetchMocked) {
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
            content: 'Traditional optical character recognition uploads documents to cloud databases. This article outlines the transition to client-side WebAssembly rendering, protecting sensitive data locally.',
            published: true,
            seoMetadata: {
              title: 'Local OCR WebAssembly Data Safety | ToolWala',
              description: 'Learn why processing character recognition inside the browser context outperforms cloud databases.'
            },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
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
          }
        ]);

        if (method === 'GET') {
          return new Response(JSON.stringify({ success: true, tools }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const body = init?.body ? JSON.parse(init.body as string) : {};

        if (method === 'POST') {
          const newTool = {
            ...body,
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
          tools = tools.map((t: any) => t.id === toolId || url.includes(t.id) ? { ...t, ...body, updatedAt: new Date().toISOString() } : t);
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
          outputText = `Here are some high-converting social media captions generated for your prompt:\n\n1. ✨ Ready to step up? Let's build together! #Mindset #Success\n2. The future is browser-native. No servers, absolute privacy. 🚀\n3. Small edits, massive impacts. What are you building today? 🛠️`;
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
}

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Simple, robust client-side session checker
  useEffect(() => {
    if (pathname === '/admin/login') {
      setIsLoading(false);
      return;
    }

    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.replace('/admin/login');
    } else {
      setIsLoading(false);
    }
  }, [pathname, router]);

  // If the path is login, bypass layout shell entirely
  if (pathname === '/admin/login') {
    return (
      <div className="bg-[#030712] min-h-screen text-white select-none">
        {children}
        <Toaster theme="dark" position="bottom-right" />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#030712] flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 border-t-2 border-r-2 border-blue-500 rounded-full animate-spin" />
          <span className="text-xs font-black uppercase tracking-widest text-gray-500 animate-pulse">
            Verifying Admin Session...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-[#030712] text-white flex"
      style={{ '--sidebar-width': isCollapsed ? '80px' : '256px' } as React.CSSProperties}
    >
      {/* Sidebar Navigation */}
      <div className={`hidden md:block transition-all duration-300 ${isCollapsed ? 'w-20' : 'w-64'}`}>
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      {/* Mobile Drawer Overlay */}
      {sidebarOpen && (
        <div 
          onClick={() => setSidebarOpen(false)}
          className="fixed inset-0 bg-black/60 z-20 md:hidden backdrop-blur-sm"
        />
      )}

      {/* Mobile Sidebar */}
      <div className={`fixed top-0 bottom-0 left-0 z-30 transition-transform duration-300 md:hidden w-64 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <Sidebar isCollapsed={false} setIsCollapsed={() => {}} />
      </div>

      {/* Main Page Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header 
          sidebarOpen={sidebarOpen} 
          setSidebarOpen={setSidebarOpen} 
          isCollapsed={isCollapsed}
        />
        
        {/* Page Inner Content Container */}
        <main className="flex-grow p-6 sm:p-10 transition-all duration-300 admin-main-content">
          {children}
        </main>
      </div>

      {/* sonner toast framework */}
      <Toaster theme="dark" position="bottom-right" />
    </div>
  );
}
