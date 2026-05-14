import Link from 'next/link';
import { Mail, ShieldCheck, Heart, ExternalLink } from 'lucide-react';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white border-t border-gray-100 pt-24 pb-12 relative overflow-hidden">
      {/* Subtle background elements */}
      <div className="absolute bottom-0 left-0 w-full h-1/2 bg-gradient-to-t from-gray-50 to-transparent -z-10" />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          
          {/* Brand Column */}
          <div className="space-y-6">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 text-white font-bold text-2xl shadow-lg shadow-blue-100">
                T
              </div>
              <span className="text-xl font-black tracking-tight text-gray-900">
                ToolWala <span className="text-blue-600">AI</span>
              </span>
            </Link>
            <p className="text-gray-500 leading-relaxed max-w-sm">
              Your comprehensive platform for powerful, AI-driven utility tools. Simplifying complex tasks with the power of artificial intelligence.
            </p>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-2 rounded-full border border-emerald-100">
                <ShieldCheck className="w-4 h-4" />
                Privacy Focused
              </div>
              <div className="flex items-center gap-2 text-xs font-bold text-blue-700 bg-blue-50 px-3 py-2 rounded-full border border-blue-100">
                <Heart className="w-4 h-4 fill-blue-600" />
                Free for Beta
              </div>
            </div>
          </div>
          
          {/* Tools Column */}
          <div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">AI Tools</h3>
            <ul className="space-y-4">
              <li>
                <Link href="/tools/passport-photo-maker" className="text-gray-600 hover:text-blue-600 font-medium transition-colors flex items-center gap-1 group">
                  Passport Photo Maker
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/tools/resume-builder" className="text-gray-600 hover:text-blue-600 font-medium transition-colors flex items-center gap-1 group">
                  AI Resume Builder
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/tools/cover-letter-generator" className="text-gray-600 hover:text-blue-600 font-medium transition-colors flex items-center gap-1 group">
                  Cover Letter AI
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/tools/voice-generator" className="text-gray-600 hover:text-blue-600 font-medium transition-colors flex items-center gap-1 group">
                  AI Voice Generator
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
              <li>
                <Link href="/tools/text-humanizer" className="text-gray-600 hover:text-blue-600 font-medium transition-colors flex items-center gap-1 group">
                  AI Text Humanizer
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </Link>
              </li>
            </ul>
          </div>
          
          {/* Company Column */}
          <div>
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-6">Company</h3>
            <ul className="space-y-4">
              <li><Link href="/" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Home</Link></li>
              <li><Link href="/tools" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Directory</Link></li>
              <li><Link href="/pricing" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Pricing</Link></li>
              <li><Link href="/about" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">About Us</Link></li>
              <li><Link href="/contact" className="text-gray-600 hover:text-gray-900 font-medium transition-colors">Contact</Link></li>
            </ul>
          </div>
          
          {/* Newsletter/Legal Column */}
          <div className="space-y-8">
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Contact Support</h3>
              <a href="mailto:support@toolwala.ai" className="flex items-center gap-3 text-gray-600 hover:text-blue-600 font-bold transition-colors">
                <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center border border-gray-100">
                  <Mail className="w-5 h-5" />
                </div>
                support@toolwala.ai
              </a>
            </div>
            
            <div>
              <h3 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">Legal</h3>
              <div className="flex flex-wrap gap-x-6 gap-y-2">
                <Link href="/privacy-policy" className="text-sm text-gray-500 hover:text-gray-900 font-medium">Privacy</Link>
                <Link href="/terms" className="text-sm text-gray-500 hover:text-gray-900 font-medium">Terms</Link>
              </div>
            </div>
          </div>
        </div>
        
        {/* Bottom Bar */}
        <div className="mt-20 pt-8 border-t border-gray-100 flex flex-col md:flex-row items-center justify-between gap-6">
          <p className="text-sm text-gray-500 font-medium">
            &copy; {currentYear} ToolWala AI. Built with AI for everyone.
          </p>
          
          <div className="flex items-center gap-6">
            <a href="#" className="text-gray-400 hover:text-blue-600 transition-all hover:scale-110" aria-label="Twitter">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723c-.951.555-2.005.959-3.127 1.184a4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.84 4.996 4.996 0 01-2.212.085 4.936 4.936 0 004.604 3.417 9.867 9.867 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/></svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-gray-900 transition-all hover:scale-110" aria-label="GitHub">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"/></svg>
            </a>
            <a href="#" className="text-gray-400 hover:text-blue-700 transition-all hover:scale-110" aria-label="LinkedIn">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
