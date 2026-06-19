import { Metadata } from 'next';
import AboutClient from './AboutClient';

export async function generateMetadata(): Promise<Metadata> {
  let locale = "en";
  try {
    const { headers } = await import('next/headers');
    const headerList = await headers();
    locale = headerList.get('x-locale') || 'en';
  } catch (e) {}

  let title = "About Our Mission | ToolWala AI";
  let description = "Learn more about ToolWala AI and our mission to build powerful AI utility tools.";

  if (locale === 'hi') {
    title = "हमारा मिशन | टूलवाला AI";
    description = "टूलवाला AI और शक्तिशाली एआई उपयोगिता उपकरण बनाने के हमारे मिशन के बारे में अधिक जानें।";
  } else if (locale === 'es') {
    title = "Acerca de nuestra misión | ToolWala AI";
    description = "Conozca más sobre ToolWala AI y nuestra misión de crear potentes herramientas de utilidad de IA.";
  } else if (locale === 'pt') {
    title = "Sobre Nossa Missão | ToolWala AI";
    description = "Saiba mais sobre a ToolWala AI e nossa missão de criar ferramentas utilitárias de IA poderosas.";
  } else if (locale === 'fr') {
    title = "À propos de notre mission | ToolWala AI";
    description = "En savoir plus sur ToolWala AI et notre mission de créer des outils utilitaires d'IA puissants.";
  } else if (locale === 'de') {
    title = "Über unsere Mission | ToolWala AI";
    description = "Erfahren Sie mehr über ToolWala AI und unsere Mission, leistungsstarke KI-Dienstprogramme zu entwickeln.";
  } else if (locale === 'id') {
    title = "Tentang Misi Kami | ToolWala AI";
    description = "Pelajari lebih lanjut tentang ToolWala AI dan misi kami untuk membangun alat utilitas AI yang kuat.";
  } else if (locale === 'ar') {
    title = "حول مهمتنا | ToolWala AI";
    description = "تعرف على المزيد حول ToolWala AI ومهمتنا لبناء أدوات برمجية قوية تعتمد على الذكاء الاصطناعي.";
  }

  return {
    title,
    description,
  };
}

export default function AboutPage() {
  return <AboutClient />;
}
