import { Metadata } from 'next';
import DisclaimerClient from './DisclaimerClient';

export async function generateMetadata(): Promise<Metadata> {
  let locale = "en";
  try {
    const { headers } = await import('next/headers');
    const headerList = await headers();
    locale = headerList.get('x-locale') || 'en';
  } catch (e) {}

  let title = "Disclaimer | ToolWala AI";
  let description = "Legal disclaimer regarding AI accuracy, tool usage, and service limitations of the ToolWala AI platform.";

  if (locale === 'hi') {
    title = "अस्वीकरण | टूलवाला AI";
    description = "टूलवाला AI प्लेटफॉर्म की एआई सटीकता, टूल उपयोग और सेवा सीमाओं के संबंध में कानूनी अस्वीकरण।";
  } else if (locale === 'es') {
    title = "Descargo de responsabilidad | ToolWala AI";
    description = "Descargo de responsabilidad legal con respecto a la precisión de la IA, el uso de las herramientas y las limitaciones del servicio de la plataforma ToolWala AI.";
  } else if (locale === 'pt') {
    title = "Isenção de Responsabilidade | ToolWala AI";
    description = "Aviso legal sobre a precisão da IA, uso das ferramentas e limitações de serviço da plataforma ToolWala AI.";
  } else if (locale === 'fr') {
    title = "Clause de non-responsabilité | ToolWala AI";
    description = "Clause de non-responsabilité légale concernant l'exactitude de l'IA, l'utilisation des outils et les limites de service de la plateforme ToolWala AI.";
  } else if (locale === 'de') {
    title = "Haftungsausschluss | ToolWala AI";
    description = "Rechtlicher Haftungsausschluss bezüglich der KI-Genauigkeit, der Tool-Nutzung und der Servicebeschränkungen der ToolWala AI-Plattform.";
  } else if (locale === 'id') {
    title = "Penafian | ToolWala AI";
    description = "Penafian hukum mengenai keakuratan AI, penggunaan alat, dan batasan layanan platform ToolWala AI.";
  } else if (locale === 'ar') {
    title = "إخلاء المسؤولية | ToolWala AI";
    description = "إخلاء مسؤولية قانوني يتعلق بدقة الذاء الاصطناعي، استخدام الأدوات، وحدود الخدمة الخاصة بمنصة ToolWala AI.";
  }

  return {
    title,
    description,
  };
}

export default function DisclaimerPage() {
  return <DisclaimerClient />;
}

