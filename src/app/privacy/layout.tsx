import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  let locale = "en";
  try {
    const { headers } = await import('next/headers');
    const headerList = await headers();
    locale = headerList.get('x-locale') || 'en';
  } catch (e) {}

  let title = "Privacy & Security Hub | ToolWala AI";
  let description = "Learn how ToolWala AI protects your sensitive files with browser-native WebAssembly processing. No cloud uploads, 100% on-device processing.";

  if (locale === 'hi') {
    title = "गोपनीयता और सुरक्षा हब | टूलवाला AI";
    description = "जानें कि टूलवाला AI आपके संवेदनशील दस्तावेजों को कैसे सुरक्षित रखता है। ब्राउज़र-देशी प्रसंस्करण के साथ 100% ऑन-डिवाइस कार्य।";
  } else if (locale === 'es') {
    title = "Centro de Privacidad y Seguridad | ToolWala AI";
    description = "Conozca cómo ToolWala AI protege sus archivos confidenciales con procesamiento WebAssembly nativo en el navegador.";
  } else if (locale === 'pt') {
    title = "Central de Privacidade e Segurança | ToolWala AI";
    description = "Saiba como o ToolWala AI protege seus arquivos confidenciais com processamento WebAssembly nativo do navegador.";
  } else if (locale === 'fr') {
    title = "Centre de Confidentialité et Sécurité | ToolWala AI";
    description = "Découvrez comment ToolWala AI protège vos fichiers confidentiels grâce au traitement WebAssembly natif du navigateur.";
  } else if (locale === 'de') {
    title = "Datenschutz- & Sicherheitszentrum | ToolWala AI";
    description = "Erfahren Sie, wie ToolWala AI Ihre vertraulichen Dateien mit browsernativem WebAssembly schützt.";
  } else if (locale === 'id') {
    title = "Pusat Privasi & Keamanan | ToolWala AI";
    description = "Pelajari bagaimana ToolWala AI melindungi file sensitif Anda dengan pemrosesan WebAssembly asli browser.";
  } else if (locale === 'ar') {
    title = "مركز الخصوصية والأمان | ToolWala AI";
    description = "تعرف على كيفية حماية ToolWala AI لملفاتك الحساسة من خلال معالجة WebAssembly المحلية بالكامل داخل متصفحك.";
  }

  return {
    title,
    description
  };
}

export default function PrivacyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
