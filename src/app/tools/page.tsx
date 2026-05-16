import SectionTitle from '@/components/SectionTitle';
import ToolsDirectory from '@/components/ToolsDirectory';
import { MeshGradient } from '@/components/BackgroundEffects';

export const metadata = {
  title: "AI Tools Directory | ToolGPT AI",
  description: "Browse our comprehensive collection of powerful, AI-driven utility tools designed for maximum productivity and privacy.",
};

export default function ToolsPage() {
  return (
    <div className="bg-[#030712] min-h-screen py-24 sm:py-32 relative overflow-hidden">
      {/* Background Glow */}
      <MeshGradient />
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <SectionTitle 
          title="Tools Directory" 
          subtitle="Explore our full collection of professional AI utilities. No signup required, zero cost during beta, and 100% privacy focused."
          centered
        />
        
        <div className="mt-20">
          <ToolsDirectory />
        </div>
      </div>
    </div>
  );
}
