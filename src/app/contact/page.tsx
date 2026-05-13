import SectionTitle from '@/components/SectionTitle';
import ContactForm from './ContactForm';

export const metadata = {
  title: "Contact Us | ToolWala AI",
  description: "Get in touch with the ToolWala AI team for support, feedback, or business inquiries.",
};

export default function ContactPage() {
  return (
    <div className="bg-white py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <SectionTitle 
            title="Contact Us" 
            subtitle="Have a question or need support? We're here to help."
            centered
          />
        </div>
        <div className="mx-auto mt-16 max-w-xl sm:mt-20">
          <ContactForm />
        </div>
      </div>
    </div>
  );
}
