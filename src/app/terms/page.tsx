import SectionTitle from '@/components/SectionTitle';

export const metadata = {
  title: "Terms of Service | ToolWala AI",
  description: "Terms and conditions for using ToolWala AI services.",
};

export default function TermsPage() {
  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <SectionTitle 
          title="Terms of Service" 
          subtitle="Last updated: May 13, 2026"
        />
        <div className="mt-10 prose prose-blue prose-lg max-w-none text-gray-600">
          <p>
            Welcome to ToolWala AI. By accessing or using our website and services, you agree to be bound by the following Terms of Service. Please read them carefully.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Acceptance of Terms</h3>
          <p>
            By accessing this website, you are agreeing to be bound by these Terms of Service, all applicable laws and regulations, and agree that you are responsible for compliance with any applicable local laws. If you do not agree with any of these terms, you are prohibited from using or accessing this site.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Use License</h3>
          <p>
            Permission is granted to temporarily use the tools provided on ToolWala AI's website for personal or commercial use, subject to the following restrictions:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4 mb-6">
            <li>You may not use the tools for any illegal or unauthorized purpose.</li>
            <li>You may not attempt to reverse engineer or extract the source code of the tools provided.</li>
            <li>You may not use our services to process illegal, copyrighted, or sensitive material for which you do not have authorization.</li>
            <li>You may not automate usage of our free tools (e.g., via bots or scripts) without explicit permission or an API license.</li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Disclaimer</h3>
          <p>
            The materials and tools on ToolWala AI's website are provided on an 'as is' basis. ToolWala AI makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Limitations</h3>
          <p>
            In no event shall ToolWala AI or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on ToolWala AI's website, even if ToolWala AI or a ToolWala AI authorized representative has been notified orally or in writing of the possibility of such damage.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">5. Revisions and Errata</h3>
          <p>
            The materials appearing on ToolWala AI's website could include technical, typographical, or photographic errors. ToolWala AI does not warrant that any of the materials on its website are accurate, complete or current. ToolWala AI may make changes to the materials contained on its website at any time without notice.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">6. Modifications</h3>
          <p>
            ToolWala AI may revise these terms of service for its website at any time without notice. By using this website you are agreeing to be bound by the then current version of these terms of service.
          </p>
        </div>
      </div>
    </div>
  );
}
