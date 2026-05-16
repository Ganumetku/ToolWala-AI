import Link from 'next/link';
import { Mail, ShieldCheck, Heart, ExternalLink, Sparkles } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-[#030712] border-t border-white/5 pt-32 pb-12 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-blue-900/10 to-transparent -z-10" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 lg:gap-12">
          
          {/* Brand Column */}
          <div className="space-y-8">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-600 text-white font-black text-2xl shadow-[0_0_20px_rgba(37,99,235,0.3)] transition-transform group-hover:scale-110">
                T
              </div>
              <span className="text-2xl font-black tracking-tighter text-white">
                ToolGPT <span className="text-blue-500">AI</span>
              </span>
            </Link>
            <p className="text-gray-400 leading-relaxed font-medium">
              The ultimate playground for AI-driven utility tools. Experience the power of artificial intelligence in your browser with 100% privacy and lightning speed.
            </p>
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-4 py-2 rounded-full border border-emerald-500/20">
                <ShieldCheck className="w-3.5 h-3.5" />
                Privacy First
              </div>
              <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 px-4 py-2 rounded-full border border-blue-500/20">
                <Sparkles className="w-3.5 h-3.5 fill-blue-400" />
                Free Beta
              </div>
            </div>
          </div>
          
          {/* Tools Column */}
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-8">AI Tools</h3>
            <ul className="space-y-5">
              <li>
                <Link href="/tools/bg-remover" className="text-gray-400 hover:text-white font-bold transition-all flex items-center gap-2 group">
                  Background Remover
                  <ArrowRightIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
              </li>
              <li>
                <Link href="/tools/text-humanizer" className="text-gray-400 hover:text-white font-bold transition-all flex items-center gap-2 group">
                  AI Text Humanizer
                  <ArrowRightIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
              </li>
              <li>
                <Link href="/tools/ai-logo-maker" className="text-gray-400 hover:text-white font-bold transition-all flex items-center gap-2 group">
                  AI Logo Maker
                  <ArrowRightIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
              </li>
              <li>
                <Link href="/tools/voice-generator" className="text-gray-400 hover:text-white font-bold transition-all flex items-center gap-2 group">
                  AI Voice Generator
                  <ArrowRightIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
              </li>
              <li>
                <Link href="/tools/qr-code-generator" className="text-gray-400 hover:text-white font-bold transition-all flex items-center gap-2 group">
                  QR Code Generator
                  <ArrowRightIcon className="w-3 h-3 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Company Column */}
          <div>
            <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-8">Navigation</h3>
            <ul className="space-y-5">
              <li><Link href="/" className="text-gray-400 hover:text-white font-bold transition-colors">Home</Link></li>
              <li><Link href="/tools" className="text-gray-400 hover:text-white font-bold transition-colors">All Tools</Link></li>
              <li><Link href="/pricing" className="text-gray-400 hover:text-white font-bold transition-colors">Pricing</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-white font-bold transition-colors">About ToolGPT</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white font-bold transition-colors">Contact Us</Link></li>
              <li><Link href="/disclaimer" className="text-gray-400 hover:text-white font-bold transition-colors">Disclaimer</Link></li>
            </ul>
          </div>
          
          {/* Newsletter Column */}
          <div className="space-y-10">
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6">Contact Support</h3>
              <a href="mailto:support@toolgpt.in" className="flex items-center gap-4 text-gray-300 hover:text-blue-400 font-black transition-all group">
                <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center border border-white/10 group-hover:bg-blue-600/10 group-hover:border-blue-600/20 transition-all">
                  <Mail className="w-5 h-5" />
                </div>
                support@toolgpt.in
              </a>
            </div>
            
            <div>
              <h3 className="text-xs font-black text-white uppercase tracking-[0.2em] mb-6">Social</h3>
              <div className="flex gap-4">
                <SocialLink href="#" icon={<TwitterIcon className="w-5 h-5" />} label="Twitter" />
                <SocialLink href="#" icon={<GithubIcon className="w-5 h-5" />} label="GitHub" />
                <SocialLink href="#" icon={<LinkedinIcon className="w-5 h-5" />} label="LinkedIn" />
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-24 pt-10 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left">
          <div className="space-y-2">
            <p className="text-sm text-gray-500 font-bold">
              &copy; {currentYear} ToolGPT AI. All rights reserved.
            </p>
            <div className="flex flex-wrap justify-center md:justify-start gap-6 text-xs font-bold text-gray-600">
              <Link href="/privacy-policy" className="hover:text-gray-400 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-gray-400 transition-colors">Terms of Service</Link>
              <Link href="/disclaimer" className="hover:text-gray-400 transition-colors">Disclaimer</Link>
              <Link href="/contact" className="hover:text-gray-400 transition-colors">Contact</Link>
            </div>
          </div>
          
          <p className="flex items-center gap-2 text-sm text-gray-500 font-bold">
            Made with <Heart className="w-4 h-4 fill-red-500 text-red-500 animate-pulse" /> for the AI community
          </p>
        </div>
      </div>
    </footer>
  );
}

function ArrowRightIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14"/><path d="m12 5 7 7-7 7"/>
    </svg>
  );
}

function TwitterIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"/>
    </svg>
  );
}

function GithubIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4"/><path d="M9 18c-4.51 2-5-2-7-2"/>
    </svg>
  );
}

function LinkedinIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"/><rect width="4" height="12" x="2" y="9"/><circle cx="4" cy="4" r="2"/>
    </svg>
  );
}

function SocialLink({ href, icon, label }: { href: string; icon: React.ReactNode; label: string }) {
  return (
    <a 
      href={href} 
      className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center text-gray-400 hover:text-white hover:bg-white/10 border border-white/5 transition-all active:scale-90"
      aria-label={label}
    >
      {icon}
    </a>
  );
}
