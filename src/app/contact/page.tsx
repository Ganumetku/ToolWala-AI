import SectionTitle from '@/components/SectionTitle';
import { Mail, MessageSquare, Globe, MapPin, Send, Clock, ShieldCheck, Sparkles } from 'lucide-react';

export const metadata = {
  title: "Contact Us | ToolGPT AI",
  description: "Get in touch with the ToolGPT AI team for support, business inquiries, or legal matters.",
};

export default function ContactPage() {
  return (
    <div className="bg-[#030712] min-h-screen py-24 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-full h-[500px] bg-blue-600/5 blur-[120px] -z-10" />
      
      <div className="mx-auto max-w-7xl px-6 lg:px-8 relative z-10">
        <SectionTitle 
          title="Get in Touch" 
          subtitle="Have questions or feedback? Our team is here to help you scale your productivity."
          centered
        />
        
        <div className="mt-20 grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Left Side: Contact Info */}
          <div className="lg:col-span-5 space-y-8">
            <div className="glass p-10 rounded-[3rem] border border-white/5 space-y-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-3xl -z-10" />
              
              <div className="space-y-6">
                <h3 className="text-2xl font-black text-white tracking-tight uppercase">Contact Channels</h3>
                <p className="text-gray-400 font-medium leading-relaxed">
                  We aim to respond to all inquiries within 24-48 business hours. For urgent technical support, please use the support email below.
                </p>
              </div>

              <div className="space-y-8">
                <ContactItem 
                  icon={<Mail />}
                  title="General Support"
                  value="developtechx@gmail.com"
                  desc="For help with tools and general questions."
                />
                <ContactItem 
                  icon={<Sparkles />}
                  title="Business Inquiries"
                  value="developtechx@gmail.com"
                  desc="For collaborations and API access."
                />
                <ContactItem 
                  icon={<ShieldCheck />}
                  title="Legal & Privacy"
                  value="developtechx@gmail.com"
                  desc="For data requests and legal matters."
                />
              </div>

              <div className="pt-8 border-t border-white/5 grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                    <Clock className="w-3 h-3" /> Response Time
                  </div>
                  <p className="text-white font-black text-sm">~24 Hours</p>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-gray-500 font-bold uppercase tracking-widest text-[10px]">
                    <Globe className="w-3 h-3" /> Availability
                  </div>
                  <p className="text-white font-black text-sm">Mon - Fri</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Contact Form */}
          <div className="lg:col-span-7">
            <div className="glass p-10 rounded-[3rem] border border-white/5 h-full">
              <form className="space-y-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Full Name</label>
                    <input 
                      type="text" 
                      placeholder="John Doe"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                    />
                  </div>
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Address</label>
                    <input 
                      type="email" 
                      placeholder="john@example.com"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Subject</label>
                  <select className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium appearance-none">
                    <option className="bg-[#0f172a]">General Inquiry</option>
                    <option className="bg-[#0f172a]">Technical Support</option>
                    <option className="bg-[#0f172a]">Bug Report</option>
                    <option className="bg-[#0f172a]">Business/Partnership</option>
                  </select>
                </div>

                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Message</label>
                  <textarea 
                    rows={6}
                    placeholder="Tell us how we can help..."
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4 text-white focus:outline-none focus:border-blue-500/50 transition-all font-medium resize-none"
                  />
                </div>

                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black uppercase tracking-widest py-5 rounded-2xl transition-all shadow-[0_0_30px_rgba(37,99,235,0.3)] flex items-center justify-center gap-3 active:scale-[0.98]"
                >
                  <Send className="w-5 h-5" />
                  Send Message
                </button>
              </form>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

function ContactItem({ icon, title, value, desc }: { icon: any; title: string; value: string; desc: string }) {
  return (
    <div className="flex gap-6 group">
      <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-blue-500 border border-white/10 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
        {icon}
      </div>
      <div className="space-y-1">
        <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{title}</h4>
        <p className="text-lg font-black text-white group-hover:text-blue-400 transition-colors">{value}</p>
        <p className="text-xs text-gray-600 font-medium">{desc}</p>
      </div>
    </div>
  );
}
