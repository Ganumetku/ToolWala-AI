import SectionTitle from '@/components/SectionTitle';
import ContactForm from './ContactForm';
import { MeshGradient } from '@/components/BackgroundEffects';

export const metadata = {
  title: "Contact Support | ToolWala AI",
  description: "Get in touch with the ToolWala AI team for support, feedback, or business inquiries.",
};

export default function ContactPage() {
  return (
    <div className="bg-[#030712] min-h-screen py-24 sm:py-32 relative overflow-hidden">
      <MeshGradient />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionTitle 
          title="Get in Touch" 
          subtitle="Have a question, feedback, or a feature request? Our team is ready to help you build better with AI."
          centered
        />
        
        <div className="mx-auto mt-16 max-w-2xl">
          <div className="glass rounded-[3rem] p-1 border border-white/5 shadow-2xl overflow-hidden">
            <ContactForm />
          </div>
        </div>
      </div>
    </div>
  );
}
