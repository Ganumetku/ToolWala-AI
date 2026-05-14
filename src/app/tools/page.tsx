import SectionTitle from '@/components/SectionTitle';
import ToolsDirectory from '@/components/ToolsDirectory';

export const metadata = {
  title: "All Tools | ToolWala AI",
  description: "Browse all our powerful, AI-driven utility tools designed to make your life easier.",
};

export default function ToolsPage() {
  return (
    <div className="bg-gray-50 min-h-screen py-16 sm:py-24">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <SectionTitle 
          title="All Tools" 
          subtitle="Explore our full collection of powerful utility tools. Everything you need to get the job done, all in one place."
          centered
        />
        
        <div className="mt-12">
          <ToolsDirectory />
        </div>
      </div>
    </div>
  );
}
