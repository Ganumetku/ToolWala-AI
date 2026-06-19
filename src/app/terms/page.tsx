import { Metadata } from 'next';
import TermsClient from './TermsClient';

export async function generateMetadata(): Promise<Metadata> {
  let locale = "en";
  try {
    const { headers } = await import('next/headers');
    const headerList = await headers();
    locale = headerList.get('x-locale') || 'en';
  } catch (e) {}

  let title = "Terms of Service | ToolWala AI";
  let description = "Terms and conditions for using ToolWala AI professional services, outlining usage rules and intellectual property rights.";

  if (locale === 'hi') {
    title = "सेवा की शर्तें | टूलवाला AI";
    description = "टूलवाला AI व्यावसायिक सेवाओं के उपयोग के लिए नियम और शर्तें, उपयोग के नियमों और बौद्धिक संपदा अधिकारों को रेखांकित करती हैं।";
  } else if (locale === 'es') {
    title = "Condiciones del servicio | ToolWala AI";
    description = "Términos y condiciones para el uso de los servicios profesionales de ToolWala AI, que describen las reglas de uso y los derechos de propiedad intelectual.";
  } else if (locale === 'pt') {
    title = "Termos de Serviço | ToolWala AI";
    description = "Termos e condições para uso dos serviços profissionais da ToolWala AI, descrevendo regras de uso e direitos de propriedade intelectual.";
  } else if (locale === 'fr') {
    title = "Conditions d'utilisation | ToolWala AI";
    description = "Conditions générales d'utilisation des services professionnels de ToolWala AI, décrivant les règles d'utilisation et les droits de propriété intellectuelle.";
  } else if (locale === 'de') {
    title = "Nutzungsbedingungen | ToolWala AI";
    description = "Allgemeine Geschäftsbedingungen für die Nutzung der professionellen Dienste von ToolWala AI, die Nutzungsregeln und Rechte an geistigem Eigentum beschreiben.";
  } else if (locale === 'id') {
    title = "Ketentuan Layanan | ToolWala AI";
    description = "Syarat dan ketentuan untuk menggunakan layanan profesional ToolWala AI, yang menguraikan aturan penggunaan dan hak kekayaan intelektual.";
  } else if (locale === 'ar') {
    title = "شروط الخدمة | ToolWala AI";
    description = "الشروط والأحكام الخاصة باستخدام خدمات ToolWala AI المهنية، وتحديد قواعد الاستخدام وحقوق الملكية الفكرية.";
  }

  return {
    title,
    description,
  };
}

export default function TermsPage() {
  return <TermsClient />;
}

