"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Rocket, Sparkles } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { toolsData } from '@/data/tools';

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if (pathname && pathname.startsWith('/tools')) {
      const matchedTool = toolsData.find(tool => tool.href === pathname);
      if (matchedTool) {
        try {
          const key = 'recentlyUsedTools';
          const recent = JSON.parse(localStorage.getItem(key) || '[]');
          const updated = [matchedTool.id, ...recent.filter((id: string) => id !== matchedTool.id)].slice(0, 4);
          localStorage.setItem(key, JSON.stringify(updated));
        } catch (e) {
          console.error('Error saving recent tools:', e);
        }
      }
    }
  }, [pathname]);

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'All Tools', href: '/tools' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-500 ${
        isScrolled 
          ? 'glass border-b border-white/5 py-3' 
          : 'bg-transparent py-6'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-blue-600 text-white font-black text-2xl transition-all group-hover:scale-110 group-hover:rotate-3 shadow-[0_0_20px_rgba(37,99,235,0.4)] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent" />
              T
            </div>
            <span className="text-2xl font-black tracking-tighter text-white">
              ToolWala <span className="text-blue-500">AI</span>
            </span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/10 backdrop-blur-md">
          {navigation.map((item) => (
            <Link 
              key={item.name} 
              href={item.href} 
              className={`px-5 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${
                pathname === item.href 
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link 
            href="/tools" 
            className="group relative flex items-center gap-2 rounded-full bg-white px-7 py-3 text-sm font-black text-black hover:scale-105 active:scale-95 transition-all shadow-xl hover:shadow-white/10 overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-blue-100 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <Rocket className="w-4 h-4 relative z-10" suppressHydrationWarning />
            <span className="relative z-10">Start Free</span>
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            type="button"
            className="text-white hover:text-blue-400 focus:outline-none p-3 bg-white/5 rounded-2xl border border-white/10 backdrop-blur-md transition-all"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" suppressHydrationWarning />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" suppressHydrationWarning />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[80px] z-50 bg-[#030712]/98 backdrop-blur-2xl animate-fade-in border-t border-white/5">
          <div className="flex flex-col p-8 gap-5">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between p-5 rounded-2xl text-xl font-black transition-all ${
                  pathname === item.href 
                    ? 'bg-blue-600/10 text-blue-500 border border-blue-500/20' 
                    : 'text-white bg-white/5 border border-white/5'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
                <Sparkles className={`w-5 h-5 ${pathname === item.href ? 'text-blue-500' : 'text-transparent'}`} suppressHydrationWarning />
              </Link>
            ))}
            <div className="mt-8 pt-8 border-t border-white/5">
              <Link 
                href="/tools" 
                className="flex items-center justify-center gap-3 rounded-2xl bg-blue-600 p-5 text-xl font-black text-white shadow-2xl shadow-blue-500/20 active:scale-[0.98] transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Rocket className="w-6 h-6" suppressHydrationWarning />
                Get Started Free
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
