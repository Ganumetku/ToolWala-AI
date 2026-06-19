import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  let locale = "en";
  try {
    const { headers } = await import('next/headers');
    const headerList = await headers();
    locale = headerList.get('x-locale') || 'en';
  } catch (e) {}

  let title = "Pricing & Plans | ToolWala AI";
  let description = "ToolWala AI is currently in free beta. Access all AI tools for free during our early access period.";

  if (locale === 'hi') {
    title = "मूल्य निर्धारण और योजनाएं | टूलवाला AI";
    description = "टूलवाला AI वर्तमान में मुफ्त बीटा में है। हमारे शुरुआती एक्सेस अवधि के दौरान सभी एआई टूल्स का मुफ्त में उपयोग करें।";
  } else if (locale === 'es') {
    title = "Precios y Planes | ToolWala AI";
    description = "ToolWala AI se encuentra actualmente en fase beta gratuita. Acceda a todas las herramientas de IA de forma gratuita durante nuestro período de acceso anticipado.";
  } else if (locale === 'pt') {
    title = "Preços e Planos | ToolWala AI";
    description = "A ToolWala AI está atualmente em fase beta gratuita. Acesse todas as ferramentas de IA gratuitamente durante nosso período de acesso antecipado.";
  } else if (locale === 'fr') {
    title = "Tarifs et Plans | ToolWala AI";
    description = "ToolWala AI est actuellement en version bêta gratuite. Accédez gratuitement à tous les outils d'IA pendant notre période d'accès anticipé.";
  } else if (locale === 'de') {
    title = "Preise & Pläne | ToolWala AI";
    description = "ToolWala AI befindet sich derzeit in der kostenlosen Beta-Phase. Nutzen Sie während unserer Early-Access-Phase alle KI-Tools kostenlos.";
  } else if (locale === 'id') {
    title = "Harga & Paket | ToolWala AI";
    description = "ToolWala AI saat ini berada dalam versi beta gratis. Akses semua alat AI secara gratis selama periode akses awal kami.";
  } else if (locale === 'ar') {
    title = "الأسعار والخطط | ToolWala AI";
    description = "تتوفر منصة ToolWala AI حاليًا في مرحلة تجريبية مجانية. يمكنك الوصول إلى جميع أدوات الذكاء الاصطناعي مجانًا خلال فترة الوصول المبكر.";
  }

  return {
    title,
    description
  };
}

export default function PricingLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
