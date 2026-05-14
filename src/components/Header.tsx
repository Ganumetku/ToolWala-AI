"use client";

import Link from 'next/link';
import { useState, useEffect } from 'react';
import { Menu, X, Rocket } from 'lucide-react';
import { usePathname } from 'next/navigation';

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

  const navigation = [
    { name: 'Home', href: '/' },
    { name: 'All Tools', href: '/tools' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'About', href: '/about' },
    { name: 'Contact', href: '/contact' },
  ];

  return (
    <header 
      className={`sticky top-0 z-50 w-full transition-all duration-300 ${
        isScrolled 
          ? 'glass-header border-b border-gray-200/50 shadow-sm py-2' 
          : 'bg-white/0 py-4'
      }`}
    >
      <div className="container mx-auto flex items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-2xl transition-transform group-hover:scale-110 group-hover:rotate-3 shadow-lg shadow-blue-200">
              T
            </div>
            <span className="text-xl font-black tracking-tight text-gray-900">
              ToolWala <span className="text-blue-600">AI</span>
            </span>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1 bg-gray-100/50 p-1 rounded-full border border-gray-200/50 backdrop-blur-sm">
          {navigation.map((item) => (
            <Link 
              key={item.name} 
              href={item.href} 
              className={`px-4 py-1.5 rounded-full text-sm font-bold transition-all ${
                pathname === item.href 
                  ? 'bg-white text-blue-600 shadow-sm' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-white/50'
              }`}
            >
              {item.name}
            </Link>
          ))}
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link 
            href="/tools" 
            className="flex items-center gap-2 rounded-full bg-gray-900 px-6 py-2.5 text-sm font-bold text-white hover:bg-blue-600 transition-all hover:scale-105 active:scale-95 shadow-lg shadow-gray-200"
          >
            <Rocket className="w-4 h-4" />
            Start Free
          </Link>
        </div>

        {/* Mobile menu button */}
        <div className="md:hidden flex items-center">
          <button
            type="button"
            className="text-gray-600 hover:text-gray-900 focus:outline-none p-2 bg-gray-100 rounded-xl"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" aria-hidden="true" />
            ) : (
              <Menu className="h-6 w-6" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="md:hidden fixed inset-0 top-[60px] z-50 bg-white/95 backdrop-blur-xl animate-fade-in">
          <div className="flex flex-col p-6 gap-4">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center justify-between p-4 rounded-2xl text-lg font-bold transition-all ${
                  pathname === item.href 
                    ? 'bg-blue-50 text-blue-600 border border-blue-100' 
                    : 'text-gray-900 bg-gray-50 border border-transparent'
                }`}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                {item.name}
                <div className={`w-2 h-2 rounded-full ${pathname === item.href ? 'bg-blue-600' : 'bg-transparent'}`} />
              </Link>
            ))}
            <div className="mt-4 pt-4 border-t border-gray-100">
              <Link 
                href="/tools" 
                className="flex items-center justify-center gap-2 rounded-2xl bg-blue-600 p-4 text-lg font-bold text-white shadow-xl shadow-blue-100"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Rocket className="w-5 h-5" />
                Start Free Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
