import SectionTitle from '@/components/SectionTitle';
import Link from 'next/link';

export const metadata = {
  title: "About Us | ToolWala AI",
  description: "Learn more about ToolWala AI and our mission to build powerful AI utility tools.",
};

export default function AboutPage() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl lg:mx-0">
          <SectionTitle 
            title="About ToolWala AI" 
            subtitle="We're on a mission to simplify everyday tasks using the power of Artificial Intelligence."
          />
          <div className="mt-10 max-w-xl text-base leading-7 text-gray-700 space-y-6">
            <p>
              ToolWala AI started with a simple idea: what if the most common utility tools you use every day could be made faster, smarter, and more secure using AI?
            </p>
            <p>
              From generating passport photos with precise dimensions to humanizing AI-generated text, we've built a comprehensive suite of utilities that run lightning-fast right in your browser. We believe that professional-grade tools shouldn't require expensive subscriptions or clunky software installations.
            </p>
            <h3 className="mt-8 text-2xl font-bold tracking-tight text-gray-900">Privacy First</h3>
            <p>
              In today's digital age, your privacy is paramount. That's why we've engineered ToolWala AI to process as much as possible directly on your device. For the tools that require server-side AI processing, we guarantee that your files and data are immediately deleted after the task is complete. We don't train models on your personal data.
            </p>
            <h3 className="mt-8 text-2xl font-bold tracking-tight text-gray-900">Built for Everyone</h3>
            <p>
              Whether you're a freelancer creating a quick invoice, a job seeker building an ATS-optimized resume, or a content creator compressing images for a blog, ToolWala AI is designed to be intuitive and accessible for everyone.
            </p>
          </div>
          <div className="mt-10 flex">
            <Link
              href="/tools"
              className="rounded-md bg-blue-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600"
            >
              Explore our tools
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
