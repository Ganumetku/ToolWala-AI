"use client";

import Link from 'next/link';
import { useState } from 'react';
import { Mail, ShieldCheck, Heart, Sparkles, Send, Globe, Map } from 'lucide-react';
import { toast } from 'sonner';

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const [email, setEmail] = useState("");

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    toast.success("Subscribed successfully! Welcome to the ToolWala community ⚡");
    setEmail("");
  };

  const categories = [
    { name: "AI Tools", href: "/categories/ai-tools/" },
    { name: "Image Tools", href: "/categories/image-tools/" },
    { name: "PDF Tools", href: "/categories/pdf-tools/" },
    { name: "Calculator Tools", href: "/categories/calculator-tools/" },
    { name: "Developer Tools", href: "/categories/developer-tools/" },
    { name: "Utility Tools", href: "/categories/utility-tools/" }
  ];

  const topTools = [
    { name: "Aadhaar Masking Tool", href: "/tools/aadhaar-masking-tool/" },
    { name: "Aadhaar Photo Resizer", href: "/tools/aadhaar-photo-resizer/" },
    { name: "Background Remover", href: "/tools/bg-remover/" },
    { name: "Image Compressor", href: "/tools/image-compressor/" },
    { name: "Passport Photo Maker", href: "/tools/passport-photo-maker/" },
    { name: "AI Resume Builder", href: "/tools/resume-builder/" }
  ];

  const sitemap = [
    { name: "All Utilities", href: "/tools/" },
    { name: "Browse Folders", href: "/categories/" },
    { name: "Pricing Beta", href: "/pricing/" },
    { name: "Insights Blog", href: "/blog/" },
    { name: "Platform Guide", href: "/about/" }
  ];

  return (
    <footer className="bg-[#030712] border-t border-white/5 pt-24 pb-12 relative overflow-hidden">
      {/* Visual background enhancements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-500/30 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-950/10 to-transparent -z-10 pointer-events-none" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-16 lg:gap-12">
          
          {/* Column 1: Branding & Pitch (Col span 4) */}
          <div className="lg:col-span-4 space-y-8">
            <Link href="/" className="flex items-center gap-3 group select-none">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white font-black text-2xl shadow-[0_0_20px_rgba(37,99,235,0.4)] transition-transform group-hover:scale-110 group-hover:rotate-3">
                T
              </div>
              <span className="text-2xl font-black tracking-tighter text-white">
                ToolWala <span className="text-blue-500">AI</span>
              </span>
            </Link>
            
            <p className="text-gray-400 leading-relaxed font-medium text-sm">
              Free AI utilities that run 100% locally in your browser. No registration, no latency, no server uploads. Experience privacy-first processing.
            </p>

            {/* Newsletter Subscription */}
            <div className="space-y-3">
              <h4 className="text-xs font-black uppercase tracking-wider text-white">Subscribe to Releases</h4>
              <form onSubmit={handleSubscribe} className="flex max-w-sm rounded-xl overflow-hidden bg-white/5 border border-white/10 p-1.5 focus-within:border-blue-500/50 transition-colors">
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@email.com"
                  className="bg-transparent text-xs outline-none border-none py-2 px-3 flex-1 text-white placeholder-gray-600 focus:ring-0"
                />
                <button 
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 p-2 rounded-lg text-white transition-colors flex items-center justify-center cursor-pointer"
                  aria-label="Subscribe"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </form>
            </div>
            
            <div className="flex flex-wrap gap-2.5">
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                Browser-Native
              </div>
              <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">
                <Sparkles className="w-3.5 h-3.5 fill-blue-400" />
                GDPR Compliant
              </div>
            </div>
          </div>
          
          {/* Column 2: Categories (Col span 2) */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Categories</h3>
            <ul className="space-y-4">
              {categories.map((cat) => (
                <li key={cat.name}>
                  <Link 
                    href={cat.href} 
                    className="text-gray-400 hover:text-white text-xs font-bold transition-colors block"
                  >
                    {cat.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Column 3: Top Tools (Col span 2) */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Top Tools</h3>
            <ul className="space-y-4">
              {topTools.map((tool) => (
                <li key={tool.name}>
                  <Link 
                    href={tool.href} 
                    className="text-gray-400 hover:text-white text-xs font-bold transition-colors block"
                  >
                    {tool.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Column 4: Navigation (Col span 2) */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Sitemap</h3>
            <ul className="space-y-4">
              {sitemap.map((item) => (
                <li key={item.name}>
                  <Link 
                    href={item.href} 
                    className="text-gray-400 hover:text-white text-xs font-bold transition-colors block"
                  >
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
          
          {/* Column 5: Support & Info (Col span 2) */}
          <div className="lg:col-span-2 space-y-6">
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em]">Contact</h3>
            <a href="mailto:developtechx@gmail.com" className="flex items-center gap-2 text-gray-300 hover:text-blue-400 text-xs font-black transition-all group">
              <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-blue-600/10 group-hover:border-blue-600/20 transition-all shrink-0">
                <Mail className="w-4 h-4" />
              </div>
              <span className="truncate">developtechx@gmail.com</span>
            </a>

            <div className="space-y-3.5 pt-4">
              <h4 className="text-[10px] font-black uppercase tracking-wider text-gray-500">Social Connect</h4>
              <div className="flex gap-2">
                <SocialLink href="#" icon={<TwitterIcon className="w-4 h-4" />} label="Twitter" />
                <SocialLink href="#" icon={<GithubIcon className="w-4 h-4" />} label="GitHub" />
                <SocialLink href="#" icon={<LinkedinIcon className="w-4 h-4" />} label="LinkedIn" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-20 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left select-none">
          <div className="space-y-2">
            <p className="text-xs text-gray-500 font-bold">
              &copy; {currentYear} ToolWala AI. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-4.5 text-[10px] font-black uppercase tracking-wider text-gray-600">
              <Link href="/privacy-policy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms of Service</Link>
              <Link href="/disclaimer" className="hover:text-gray-400 transition-colors">Disclaimer</Link>
              <Link href="/contact" className="hover:text-gray-400 transition-colors">Contact Support</Link>
            </div>
          </div>
          
          <p className="flex items-center gap-2 text-xs text-gray-500 font-bold">
            Made with <Heart className="w-3.5 h-3.5 fill-red-500 text-red-500 animate-pulse" /> for the AI community
          </p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a 
      href={href} 
      className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 border border-white/5 transition-all active:scale-90"
      aria-label={label}
    >
      {icon}
    </a>
  );
}

// Inline SVGs for brand icons
function TwitterIcon(props: any) {
  return (
    <svg {...props} suppressHydrationWarning xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
    </svg>
  );
}

function GithubIcon(props: any) {
  return (
    <svg {...props} suppressHydrationWarning xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>
    </svg>
  );
}

function LinkedinIcon(props: any) {
  return (
    <svg {...props} suppressHydrationWarning xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
    </svg>
  );
}
