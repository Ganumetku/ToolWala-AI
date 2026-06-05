import { Metadata } from 'next';
import CategoriesIndexClient from './CategoriesIndexClient';

export const metadata: Metadata = {
  title: "Browse All Categories - 25+ local AI Utilities | ToolWala AI",
  description: "Browse categorized directories of 25+ browser-local design, PDF, AI, document, resume, and developer tools. Fast, secure, and GDPR compliant.",
  keywords: "tool categories, pdf tools, image tools, ai tools, document tools, resume tools, developer tools, social media tools",
  alternates: {
    canonical: "https://toolwala.co/categories",
  },
  openGraph: {
    title: "Browse All Categories - ToolWala AI",
    description: "Secure browser-local AI utilities. Browse categorized directories for fast document processing, image optimization, and content creations.",
    url: "https://toolwala.co/categories",
    type: "website"
  }
};

export default function CategoriesIndexPage() {
  return <CategoriesIndexClient />;
}
