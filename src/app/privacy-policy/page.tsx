import SectionTitle from '@/components/SectionTitle';
import { ShieldCheck, Lock, Trash2, EyeOff } from 'lucide-react';

export const metadata = {
  title: "Privacy Policy | ToolGPT AI",
  description: "Learn how ToolGPT AI protects your privacy and handles your data with browser-first technology.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-[#030712] min-h-screen py-24 sm:py-32 relative overflow-hidden">
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/5 blur-[120px] -z-10" />
      
      <div className="mx-auto max-w-4xl px-6 lg:px-8 relative z-10">
        <SectionTitle 
          title="Privacy Policy" 
          subtitle="Last updated: May 15, 2026"
          centered
        />
        
        <div className="mt-20 space-y-12">
          <div className="glass p-10 rounded-[3rem] border border-white/5">
            <div className="flex items-center gap-4 mb-8">
              <ShieldCheck className="w-8 h-8 text-blue-500" />
              <h3 className="text-2xl font-black text-white tracking-tight uppercase">Privacy by Design</h3>
            </div>
            <p className="text-gray-400 font-medium leading-relaxed">
              At ToolGPT AI, we believe privacy isn't a feature—it's a fundamental requirement. Our platform is engineered to minimize data collection and maximize local processing.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <PolicyCard 
              icon={<Lock />}
              title="Browser Processing"
              desc="Most of our tools operate entirely on your device using WebAssembly. Your files never leave your browser."
            />
            <PolicyCard 
              icon={<Trash2 />}
              title="Auto-Deletion"
              desc="For tools requiring cloud AI, files are processed in-memory and immediately deleted. We store zero user content."
            />
            <PolicyCard 
              icon={<EyeOff />}
              title="No Training"
              desc="We never use your data, files, or prompts to train our AI models. Your intellectual property remains yours."
            />
            <PolicyCard 
              icon={<ShieldCheck />}
              title="No Trackers"
              desc="We don't use invasive third-party tracking or advertising cookies. Our analytics are 100% privacy-compliant."
            />
          </div>

          <div className="glass p-10 rounded-[3rem] border border-white/5 space-y-6 text-gray-400 font-medium">
             <h4 className="text-white font-black uppercase tracking-widest text-sm">Contact Privacy Team</h4>
             <p>If you have questions regarding your data or our processing methods, please reach out to <span className="text-blue-500">privacy@toolgpt.in</span>.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function PolicyCard({ icon, title, desc }: { icon: any; title: string; desc: string }) {
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
