import SectionTitle from '@/components/SectionTitle';

export const metadata = {
  title: "Privacy Policy | ToolWala AI",
  description: "Learn how ToolWala AI protects your privacy and handles your data.",
};

export default function PrivacyPolicyPage() {
  return (
    <div className="bg-white py-16 sm:py-24">
      <div className="mx-auto max-w-4xl px-6 lg:px-8">
        <SectionTitle 
          title="Privacy Policy" 
          subtitle="Last updated: May 13, 2026"
        />
        <div className="mt-10 prose prose-blue prose-lg max-w-none text-gray-600">
          <p>
            At ToolWala AI, your privacy is our top priority. This Privacy Policy outlines how we handle the information and files you process using our tools.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">1. Client-Side Processing</h3>
          <p>
            Many of our tools, such as the PDF Tools and Image Compressor, operate entirely within your web browser. This means your files never leave your device, and they are not uploaded to our servers. For these tools, your privacy is 100% guaranteed by design.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">2. Server-Side Processing</h3>
          <p>
            For tools that require advanced AI models (like the Background Remover or AI Logo Maker), your files are temporarily uploaded to our secure servers. We strictly adhere to the following rules for server-processed files:
          </p>
          <ul className="list-disc pl-6 space-y-2 mt-4 mb-6">
            <li>Files are kept in memory only for the duration of the processing task.</li>
            <li>Files are automatically and permanently deleted from our servers immediately after the resulting file is returned to you.</li>
            <li>We do not view, analyze, or back up your files.</li>
            <li>We do not use your files or data to train our AI models.</li>
          </ul>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">3. Data Collection</h3>
          <p>
            We collect minimal usage data (such as page views and tool usage counters) using privacy-friendly analytics tools to help us improve the website. We do not collect personally identifiable information unless you explicitly provide it (e.g., when signing up for an account or subscribing to our newsletter).
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">4. Cookies</h3>
          <p>
            We use essential cookies to maintain your session and preferences. We do not use third-party tracking cookies for targeted advertising.
          </p>

          <h3 className="text-xl font-bold text-gray-900 mt-8 mb-4">5. Contact Us</h3>
          <p>
            If you have any questions or concerns about our Privacy Policy, please contact us via our Contact page.
          </p>
        </div>
      </div>
    </div>
  );
}
