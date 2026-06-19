import { Metadata } from 'next';
import PrivacyPolicyClient from './PrivacyPolicyClient';

export async function generateMetadata(): Promise<Metadata> {
  let locale = "en";
  try {
    const { headers } = await import('next/headers');
    const headerList = await headers();
    locale = headerList.get('x-locale') || 'en';
  } catch (e) {}

  let title = "Privacy Policy | ToolWala AI";
  let description = "Learn how ToolWala AI protects your privacy and handles your data with browser-first technology and secure processing.";

  if (locale === 'hi') {
    title = "गोपनीयता नीति | टूलवाला AI";
    description = "जानें कि टूलवाला AI आपकी गोपनीयता की रक्षा कैसे करता है और ब्राउज़र-प्रथम तकनीक और सुरक्षित प्रसंस्करण के साथ आपके डेटा को कैसे संभालता है।";
  } else if (locale === 'es') {
    title = "Política de privacidad | ToolWala AI";
    description = "Conozca cómo ToolWala AI protege su privacidad y gestiona sus datos con tecnología centrada en el navegador y procesamiento seguro.";
  } else if (locale === 'pt') {
    title = "Política de Privacidade | ToolWala AI";
    description = "Saiba como a ToolWala AI protege sua privacidade e lida com seus dados usando tecnologia focada no navegador e processamento seguro.";
  } else if (locale === 'fr') {
    title = "Politique de confidentialité | ToolWala AI";
    description = "Découvrez comment ToolWala AI protège votre vie privée et gère vos données grâce à une technologie axée sur le navigateur et un traitement sécurisé.";
  } else if (locale === 'de') {
    title = "Datenschutzrichtlinie | ToolWala AI";
    description = "Erfahren Sie, wie ToolWala AI Ihre Privatsphäre schützt und Ihre Daten mit browser-first Technologie und sicherer Verarbeitung verarbeitet.";
  } else if (locale === 'id') {
    title = "Kebijakan Privasi | ToolWala AI";
    description = "Pelajari bagaimana ToolWala AI melindungi privasi Anda dan menangani data Anda dengan teknologi yang mengutamakan browser dan pemrosesan yang aman.";
  } else if (locale === 'ar') {
    title = "سياسة الخصوصية | ToolWala AI";
    description = "تعرف على كيفية حماية ToolWala AI لخصوصيتك والتعامل مع بياناتك باستخدام تقنيات المتصفح أولاً والمعالجة الآمنة.";
  }

  return {
    title,
    description,
  };
}

export default function PrivacyPolicyPage() {
  return <PrivacyPolicyClient />;
}
