import SectionTitle from '@/components/SectionTitle';
import { FileText, Scale, AlertCircle, RefreshCcw, ShieldAlert, Cpu, UserCheck, Gavel } from 'lucide-react';

export const metadata = {
  title: "Terms of Service | ToolWala AI",
  description: "Terms and conditions for using ToolWala AI professional services, outlining usage rules and intellectual property rights.",
};

export default function TermsPage() {
  return (
    <div className="bg-[#030712] min-h-screen py-24 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/5 blur-[120px] -z-10" />
      
      <div className="mx-auto max-w-5xl px-6 lg:px-8 relative z-10">
        <SectionTitle 
          title="Terms of Service" 
          subtitle="Last updated: May 16, 2026"
          centered
        />
        
        <div className="mt-20 space-y-16">
          {/* Agreement Summary */}
          <div className="glass p-10 rounded-[3rem] border border-white/5 bg-white/[0.01]">
            <div className="flex items-center gap-4 mb-8">
              <Gavel className="w-10 h-10 text-blue-500" />
              <h3 className="text-2xl font-black text-white tracking-tight uppercase">User Agreement</h3>
            </div>
            <p className="text-gray-400 font-medium leading-relaxed text-lg">
              By accessing or using **ToolWala AI**, you signify your agreement to be bound by these Terms of Service. If you do not agree to these terms, please do not use our services. We provide a platform for AI-powered productivity, and these rules ensure it remains safe and effective for everyone.
            </p>
          </div>

          {/* Key Terms Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <TermCard 
              icon={<Cpu />}
              title="Usage License"
              desc="We grant you a personal, non-exclusive, non-transferable license to use our tools. Commercial use is permitted for outputs generated (e.g., resumes, logos), but redistribution of our underlying software or API access is strictly prohibited."
            />
            <TermCard 
              icon={<ShieldAlert />}
              title="Prohibited Conduct"
              desc="You agree not to use our tools for any illegal purposes, including the generation of harmful, deceptive, or infringing content. Automated scraping or bot-driven requests to our platform are strictly forbidden."
            />
            <TermCard 
              icon={<UserCheck />}
              title="Content Ownership"
              desc="You retain 100% of the intellectual property rights to the content you generate using our tools. ToolWala AI does not claim ownership or license over your original creations or processed data."
            />
            <TermCard 
              icon={<RefreshCcw />}
              title="Service Modifications"
              desc="As a platform in continuous development, we reserve the right to modify, suspend, or discontinue any feature or tool without prior notice. We strive for stability but do not guarantee 100% uptime."
            />
          </div>

          {/* Detailed Clauses */}
          <div className="space-y-12">
            <DetailedClause 
              icon={<AlertCircle />}
              title="AI Output Accuracy"
              content="ToolWala AI leverages advanced artificial intelligence. While we aim for high accuracy, AI models can produce incorrect or biased information. Users are responsible for verifying all outputs before use in professional or legal contexts."
            />

            <DetailedClause 
              icon={<Scale />}
              title="Limitation of Liability"
              content="ToolWala AI and its creators shall not be liable for any indirect, incidental, or consequential damages resulting from the use or inability to use our tools, including loss of data or business interruption."
            />

            <DetailedClause 
              icon={<FileText />}
              title="Beta Features"
              content="Some tools are marked as 'Beta'. These are provided for testing purposes and may contain bugs. Use of beta features is at the user's own risk."
            />
          </div>

          {/* Termination & Contact */}
          <div className="glass p-10 rounded-[3rem] border border-white/5 space-y-6 text-gray-400 font-medium">
             <h4 className="text-white font-black uppercase tracking-widest text-sm">Governing Law</h4>
             <p className="text-sm">These terms are governed by and construed in accordance with international digital service standards. Any disputes shall be handled through arbitration before legal proceedings.</p>
             <p className="pt-4 border-t border-white/5">Questions about these terms? Contact us at <span className="text-blue-500">developtechx@gmail.com</span></p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TermCard({ icon, title, desc }: { icon: any; title: string; desc: string }) {
  return (
    <div className="glass p-10 rounded-[2.5rem] border border-white/5 space-y-6 hover:border-blue-500/30 transition-all group">
      <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-blue-500 border border-white/10 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
        {icon}
      </div>
      <h4 className="text-xl font-black text-white uppercase tracking-tight">{title}</h4>
      <p className="text-gray-500 leading-relaxed font-medium">{desc}</p>
    </div>
  );
}

function DetailedClause({ icon, title, content }: { icon: any; title: string; content: string }) {
  return (
    <div className="flex gap-8 group">
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-gray-500 border border-white/10 group-hover:text-blue-500 group-hover:border-blue-500/50 transition-all">
        {icon}
      </div>
      <div className="space-y-4 text-left">
        <h4 className="text-lg font-black text-white uppercase tracking-wider">{title}</h4>
        <p className="text-gray-400 font-medium leading-relaxed">{content}</p>
      </div>
    </div>
  );
}
