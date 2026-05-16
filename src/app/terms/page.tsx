import SectionTitle from '@/components/SectionTitle';
import { FileText, Scale, AlertCircle, RefreshCcw } from 'lucide-react';

export const metadata = {
  title: "Terms of Service | ToolGPT AI",
  description: "Terms and conditions for using ToolGPT AI professional services.",
};

export default function TermsPage() {
  return (
    <div className="bg-[#030712] min-h-screen py-24 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/5 blur-[120px] -z-10" />
      
      <div className="mx-auto max-w-4xl px-6 lg:px-8 relative z-10">
        <SectionTitle 
          title="Terms of Service" 
          subtitle="Last updated: May 15, 2026"
          centered
        />
        
        <div className="mt-20 space-y-12">
          <div className="glass p-10 rounded-[3rem] border border-white/5">
            <div className="flex items-center gap-4 mb-8">
              <FileText className="w-8 h-8 text-blue-500" />
              <h3 className="text-2xl font-black text-white tracking-tight uppercase">Agreement</h3>
            </div>
            <p className="text-gray-400 font-medium leading-relaxed">
              By accessing ToolGPT AI, you agree to these terms. Our mission is to provide powerful AI tools, and in return, we ask for responsible usage that respects our systems and other users.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <TermCard 
              icon={<Scale />}
              title="Usage License"
              desc="You are granted a non-exclusive license to use our tools for personal and commercial projects. Redistribution of our engine code is prohibited."
            />
            <TermCard 
              icon={<AlertCircle />}
              title="Fair Use"
              desc="Automated scraping or bot-driven usage of our tools is strictly forbidden to ensure fair access for all human users."
            />
            <TermCard 
              icon={<RefreshCcw />}
              title="Service Changes"
              desc="We evolve daily. We reserve the right to modify, pause, or discontinue any tool without prior notice during our beta phase."
            />
            <TermCard 
              icon={<FileText />}
              title="Content Ownership"
              desc="You retain 100% ownership of any content you generate or process using ToolGPT AI. We claim no rights over your outputs."
            />
          </div>

          <div className="glass p-10 rounded-[3rem] border border-white/5 space-y-6 text-gray-400 font-medium">
             <h4 className="text-white font-black uppercase tracking-widest text-sm">Disclaimers</h4>
             <p className="text-sm">ToolGPT AI provides tools "as-is". While we strive for perfection, we are not liable for any inaccuracies in AI-generated outputs or service interruptions.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TermCard({ icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="glass p-8 rounded-[2.5rem] border border-white/5 space-y-4">
      <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-blue-500 border border-white/10">
        {icon}
      </div>
      <h4 className="text-lg font-black text-white uppercase tracking-tight">{title}</h4>
      <p className="text-sm text-gray-500 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}
