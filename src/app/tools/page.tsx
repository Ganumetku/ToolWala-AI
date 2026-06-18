import { Metadata } from 'next';
import ToolsClient from './ToolsClient';

export async function generateMetadata(): Promise<Metadata> {
  let locale = "en";
  try {
    const { headers } = await import('next/headers');
    const headerList = await headers();
    locale = headerList.get('x-locale') || 'en';
  } catch (e) {}

  let title = "AI Tools Directory | ToolWala AI";
  let description = "Browse our comprehensive collection of powerful, AI-driven utility tools designed for maximum productivity and privacy.";

  if (locale === 'hi') {
    title = "एआई टूल्स निर्देशिका | टूलवाला AI";
    description = "अधिकतम उत्पादकता और गोपनीयता के लिए डिज़ाइन किए गए शक्तिशाली, एआई-संचालित उपयोगिता उपकरणों के हमारे व्यापक संग्रह को ब्राउज़ करें।";
  }

  return {
    title,
    description,
  };
}

export default function ToolsPage() {
  return <ToolsClient />;
}
