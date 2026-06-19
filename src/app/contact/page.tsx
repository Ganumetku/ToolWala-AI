import { Metadata } from 'next';
import ContactClient from './ContactClient';

export async function generateMetadata(): Promise<Metadata> {
  let locale = "en";
  try {
    const { headers } = await import('next/headers');
    const headerList = await headers();
    locale = headerList.get('x-locale') || 'en';
  } catch (e) {}

  let title = "Contact Us | ToolWala AI";
  let description = "Get in touch with the ToolWala AI team for support, business inquiries, or legal matters.";

  if (locale === 'hi') {
    title = "हमसे संपर्क करें | टूलवाला AI";
    description = "सहायता, व्यावसायिक पूछताछ या कानूनी मामलों के लिए टूलवाला AI टीम से संपर्क करें।";
  } else if (locale === 'es') {
    title = "Contáctenos | ToolWala AI";
    description = "Póngase en contacto con el equipo de ToolWala AI para soporte, consultas comerciales o asuntos legales.";
  } else if (locale === 'pt') {
    title = "Fale Conosco | ToolWala AI";
    description = "Entre em contato com a equipe da ToolWala AI para suporte, consultas comerciais ou assuntos jurídicos.";
  } else if (locale === 'fr') {
    title = "Contactez-nous | ToolWala AI";
    description = "Contactez l'équipe de ToolWala AI pour obtenir de l'aide, des demandes commerciales ou des questions juridiques.";
  } else if (locale === 'de') {
    title = "Kontaktieren Sie uns | ToolWala AI";
    description = "Kontaktieren Sie das ToolWala AI-Team für Support, geschäftliche Anfragen oder rechtliche Angelegenheiten.";
  } else if (locale === 'id') {
    title = "Hubungi Kami | ToolWala AI";
    description = "Hubungi tim ToolWala AI untuk dukungan, pertanyaan bisnis, atau masalah hukum.";
  } else if (locale === 'ar') {
    title = "اتصل بنا | ToolWala AI";
    description = "اتصل بفريق ToolWala AI للحصول على الدعم، الاستفسارات التجارية، أو الأمور القانونية.";
  }

  return {
    title,
    description,
  };
}

export default function ContactPage() {
  return <ContactClient />;
}
