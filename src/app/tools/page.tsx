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
  } else if (locale === 'es') {
    title = "Directorio de herramientas de IA | ToolWala AI";
    description = "Examine nuestra colección completa de potentes herramientas de utilidad impulsadas por IA diseñadas para una máxima productividad y privacidad.";
  } else if (locale === 'pt') {
    title = "Diretório de Ferramentas de IA | ToolWala AI";
    description = "Navegue por nossa coleção abrangente de ferramentas utilitárias poderosas baseadas em IA projetadas para o máximo de produtividade e privacidade.";
  } else if (locale === 'fr') {
    title = "Annuaire d'outils d'IA | ToolWala AI";
    description = "Parcourez notre collection complète d'outils utilitaires puissants pilotés par l'IA, conçus pour une productivité et une confidentialité maximales.";
  } else if (locale === 'de') {
    title = "KI-Tools-Verzeichnis | ToolWala AI";
    description = "Durchsuchen Sie unsere umfassende Sammlung leistungsstarker, KI-gestützter Dienstprogramme, die für maximale Produktivität und Datenschutz entwickelt wurden.";
  } else if (locale === 'id') {
    title = "Diretori Alat AI | ToolWala AI";
    description = "Telusuri koleksi lengkap alat utilitas berbasis AI kami yang kuat yang dirancang untuk produktivitas dan privasi maksimal.";
  } else if (locale === 'ar') {
    title = "دليل أدوات الذكاء الاصطناعي | ToolWala AI";
    description = "تصفح مجموعتنا الشاملة من الأدوات البرمجية القوية القائمة على الذكاء الاصطناعي والمصممة لتحقيق أقصى قدر من الإنتاجية والخصوصية.";
  }

  return {
    title,
    description,
  };
}

export default function ToolsPage() {
  return <ToolsClient />;
}
