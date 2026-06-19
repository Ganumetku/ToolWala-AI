import { Metadata } from 'next';
import CategoriesIndexClient from './CategoriesIndexClient';

export async function generateMetadata(): Promise<Metadata> {
  let locale = "en";
  try {
    const { headers } = await import('next/headers');
    const headerList = await headers();
    locale = headerList.get('x-locale') || 'en';
  } catch (e) {}

  let title = "Browse All Categories - 25+ local AI Utilities | ToolWala AI";
  let description = "Browse categorized directories of 25+ browser-local design, PDF, AI, document, resume, and developer tools. Fast, secure, and GDPR compliant.";
  let ogDescription = "Secure browser-local AI utilities. Browse categorized directories for fast document processing, image optimization, and content creations.";

  if (locale === 'hi') {
    title = "सभी श्रेणियां ब्राउज़ करें - 25+ स्थानीय एआई टूल्स | टूलवाला AI";
    description = "25+ ब्राउज़र-स्थानीय डिज़ाइन, पीडीएफ, एआई, दस्तावेज़, रिज्यूमे और डेवलपर टूल की वर्गीकृत निर्देशिकाएं ब्राउज़ करें। तेज़, सुरक्षित और जीडीपीआर अनुपालन।";
    ogDescription = "सुरक्षित ब्राउज़र-स्थानीय एआई उपयोगिताएँ। तेज़ दस्तावेज़ प्रसंस्करण, छवि अनुकूलन और सामग्री निर्माण के लिए वर्गीकृत निर्देशिकाएं ब्राउज़ करें।";
  } else if (locale === 'es') {
    title = "Explorar todas las categorías - Más de 25 utilidades locales de IA | ToolWala AI";
    description = "Explore directorios categorizados de más de 25 herramientas de diseño, PDF, IA, documentos, currículums y desarrollo locales en el navegador. Rápido, seguro y cumple con GDPR.";
    ogDescription = "Utilidades de IA seguras locales en el navegador. Explore directorios categorizados para un procesamiento rápido de documentos, optimización de imagens y creación de contenido.";
  } else if (locale === 'pt') {
    title = "Navegar por Todas as Categorias - Mais de 25 Utilitários de IA Locais | ToolWala AI";
    description = "Navegue por diretórios categorizados de mais de 25 ferramentas locais do navegador de design, PDF, IA, documentos, currículo e desenvolvedor. Rápido, seguro e em conformidade com o GDPR.";
    ogDescription = "Utilitários de IA locais e seguros no navegador. Navegue por diretórios categorizados para processamento rápido de documentos, otimização de imagens e criação de conteúdo.";
  } else if (locale === 'fr') {
    title = "Parcourir toutes les catégories - Plus de 25 utilitaires d'IA locaux | ToolWala AI";
    description = "Parcourez les répertoires catégorisés de plus de 25 outils locaux de conception, de PDF, d'IA, de documents, de CV et de développement. Rapide, sécurisé et conforme au RGPD.";
    ogDescription = "Utilitaires d'IA locaux et sécurisés sur le navigateur. Parcourez les répertoires catégorisés pour un traitement rapide des documents, l'optimisation des images et la création de contenu.";
  } else if (locale === 'de') {
    title = "Alle Kategorien durchsuchen - 25+ lokale KI-Tools | ToolWala AI";
    description = "Durchsuchen Sie kategorisierte Verzeichnisse mit über 25 browserlokalen Design-, PDF-, KI-, Dokumenten-, Lebenslauf- und Entwicklertools. Schnell, sicher und DSGVO-konform.";
    ogDescription = "Sichere browserlokale KI-Tools. Durchsuchen Sie kategorisierte Verzeichnisse für schnelle Dokumentenverarbeitung, Bildoptimierung und Inhaltserstellung.";
  } else if (locale === 'id') {
    title = "Telusuri Semua Kategori - 25+ Utilitas AI Lokal | ToolWala AI";
    description = "Telusuri direktori terkategori dari 25+ alat desain, PDF, AI, dokumen, resume, dan pengembang lokal browser. Cepat, aman, dan patuh GDPR.";
    ogDescription = "Utilitas AI lokal browser yang aman. Telusuri direktori terkategori untuk pemrosesan dokumen cepat, pengoptimalan gambar, dan pembuatan konten.";
  } else if (locale === 'ar') {
    title = "تصفح جميع الفئات - أكثر من 25 أداة ذكاء اصطناعي محلية | ToolWala AI";
    description = "تصفح الأدلة المصنفة لأكثر من 25 أداة تصميم، PDF، ذكاء اصطناعي، مستندات، سيرة ذاتية، وأدوات مطورين محلية بالكامل داخل المتصفح. سريعة وآمنة ومتوافقة مع GDPR.";
    ogDescription = "أدوات ذكاء اصطناعي آمنة ومحلية داخل المتصفح. تصفح الأدلة المصنفة لمعالجة المستندات السريعة، تحسين الصور، وإنشاء المحتوى.";
  }

  const { getAlternateLanguages, getLocalizedCanonicalUrl } = await import('@/lib/seo');
  const canonical = getLocalizedCanonicalUrl('/categories', locale);
  const languages = getAlternateLanguages('/categories');

  return {
    title,
    description,
    keywords: "tool categories, pdf tools, image tools, ai tools, document tools, resume tools, developer tools, social media tools",
    alternates: {
      canonical,
      languages
    },
    openGraph: {
      title,
      description: ogDescription,
      url: `https://toolwala.co/${locale === 'en' ? 'categories' : locale + '/categories'}/`,
      type: "website"
    }
  };
}

export default function CategoriesIndexPage() {
  return <CategoriesIndexClient />;
}
