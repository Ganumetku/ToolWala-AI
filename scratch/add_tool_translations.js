const fs = require('fs');
const path = require('path');

const translationsPath = path.join(__dirname, '../src/data/tool_translations.json');
const translations = JSON.parse(fs.readFileSync(translationsPath, 'utf-8'));

// Check if already exists to prevent duplicate adding
const exists = translations.some(t => t.toolSlug === 'resume-bullet-generator');
if (exists) {
  console.log("Translations for resume-bullet-generator already exist!");
  process.exit(0);
}

const newEntries = [
  {
    "id": "trans-resume-bullet-generator-en",
    "toolSlug": "resume-bullet-generator",
    "locale": "en",
    "title": "Resume Bullet Generator",
    "description": "Generate professional, recruiter-approved, achievement-focused resume bullet points using local AI.",
    "faq": [
      {
        "question": "How does the Resume Bullet Generator work?",
        "answer": "Our generator uses advanced AI models to convert simple inputs (like a job title and raw tasks) into professional, recruiter-approved resume bullet points following the Google X-Y-Z formula: Accomplished [X], as measured by [Y], by doing [Z]."
      },
      {
        "question": "Are the generated bullets ATS-friendly?",
        "answer": "Yes, absolutely. The bullets start with strong action verbs, use standard professional vocabulary, and are structured to allow corporate Applicant Tracking Systems (ATS) to parse your achievements easily."
      },
      {
        "question": "Can I edit the generated bullets?",
        "answer": "Yes, you can edit them directly in the workspace, favorite them to save, or use the 'AI Improve' feature to refine any specific bullet point further."
      },
      {
        "question": "Can I generate bullets for freshers or interns?",
        "answer": "Yes. Simply select 'Intern' or 'Fresher' in the Experience Level selector, and our AI will adapt the achievements and results to match academic projects, internships, or volunteer work."
      },
      {
        "question": "Is this tool free and secure?",
        "answer": "Yes, the tool is 100% free with no limits. We respect your privacy: all calculations and outputs are processed securely and we never store your resume content or personal details on our servers."
      }
    ],
    "seoTitle": "Free ATS Resume Bullet Generator – Test Your Resume Score Online",
    "seoDescription": "Instantly generate ATS-friendly, recruiter-approved resume bullet points. Convert simple responsibilities into quantifiable results with action verbs.",
    "createdAt": "2026-07-08T11:24:00.000Z",
    "updatedAt": "2026-07-08T11:24:00.000Z"
  },
  {
    "id": "trans-resume-bullet-generator-hi",
    "toolSlug": "resume-bullet-generator",
    "locale": "hi",
    "title": "रिज्यूमे बुलेट जेनरेटर",
    "description": "स्थानीय AI का उपयोग करके पेशेवर, भर्तीकर्ता-अनुमोदित, उपलब्धि-केंद्रित रिज्यूमे बुलेट पॉइंट उत्पन्न करें।",
    "faq": [
      {
        "question": "रिज्यूमे बुलेट जेनरेटर कैसे काम करता है?",
        "answer": "हमारा जनरेटर आपके सरल इनपुट (जैसे कि नौकरी का शीर्षक और कच्चे काम) को गूगल X-Y-Z फॉर्मूला (Accomplished [X], as measured by [Y], by doing [Z]) के आधार पर पेशेवर, रिक्रूटर्स द्वारा स्वीकृत रिज्यूमे बुलेट पॉइंट्स में बदलने के लिए उन्नत AI का उपयोग करता है।"
      },
      {
        "question": "क्या उत्पन्न बुलेट पॉइंट ATS-अनुकूल हैं?",
        "answer": "हाँ, बिल्कुल। ये बुलेट पॉइंट मजबूत एक्शन वर्ब्स (क्रियाओं) से शुरू होते हैं और कॉर्पोरेट एप्लिकेंट ट्रैकिंग सिस्टम (ATS) द्वारा आसानी से पढ़े जा सकते हैं।"
      }
    ],
    "seoTitle": "फ्री ATS रिज्यूमे बुलेट जेनरेटर – ऑनलाइन रिज्यूमे स्कोर बढ़ाएं",
    "seoDescription": "ATS-अनुकूल, भर्तीकर्ता-अनुमोदित रिज्यूमे बुलेट पॉइंट तुरंत उत्पन्न करें। सरल जिम्मेदारियों को एक्शन वर्ब्स के साथ मापने योग्य परिणामों में बदलें।",
    "createdAt": "2026-07-08T11:24:00.000Z",
    "updatedAt": "2026-07-08T11:24:00.000Z"
  },
  {
    "id": "trans-resume-bullet-generator-es",
    "toolSlug": "resume-bullet-generator",
    "locale": "es",
    "title": "Generador de Viñetas de Currículum",
    "description": "Genere puntos clave de currículum profesionales, aprobados por reclutadores y enfocados en logros utilizando IA local.",
    "faq": [
      {
        "question": "¿Cómo funciona el Generador de Viñetas de Currículum?",
        "answer": "Nuestro generador utiliza IA avanzada para convertir entradas simples en viñetas profesionales aprobadas por reclutadores, siguiendo la fórmula X-Y-Z de Google."
      },
      {
        "question": "¿Las viñetas generadas son compatibles con ATS?",
        "answer": "Sí, absolutamente. Comienzan con verbos de acción fuertes y están estructuradas para permitir que los sistemas de seguimiento de candidatos (ATS) las analicen fácilmente."
      }
    ],
    "seoTitle": "Generador de Viñetas para Currículum ATS Gratis – ToolWala AI",
    "seoDescription": "Genere instantáneamente viñetas de currículum compatibles con ATS. Convierta responsabilidades simples en resultados cuantificables.",
    "createdAt": "2026-07-08T11:24:00.000Z",
    "updatedAt": "2026-07-08T11:24:00.000Z"
  },
  {
    "id": "trans-resume-bullet-generator-pt",
    "toolSlug": "resume-bullet-generator",
    "locale": "pt",
    "title": "Gerador de Tópicos de Currículo",
    "description": "Gere tópicos de currículo profissionais, aprovados por recrutadores e focados em conquistas usando IA local.",
    "faq": [
      {
        "question": "Como funciona o Gerador de Tópicos de Currículo?",
        "answer": "Nosso gerador usa IA avançada para converter tarefas simples em tópicos de currículo profissionais aprovados por recrutadores, seguindo a fórmula X-Y-Z do Google."
      },
      {
        "question": "Os tópicos gerados são compatíveis com ATS?",
        "answer": "Sim, absolutamente. Eles começam com verbos de ação fortes e são estruturados para permitir que os sistemas de rastreamento de candidatos (ATS) leiam facilmente."
      }
    ],
    "seoTitle": "Gerador de Tópicos de Currículo ATS Grátis – ToolWala AI",
    "seoDescription": "Gere tópicos de currículo compatíveis com ATS instantaneamente. Transforme tarefas diárias em conquistas mensuráveis.",
    "createdAt": "2026-07-08T11:24:00.000Z",
    "updatedAt": "2026-07-08T11:24:00.000Z"
  }
];

translations.push(...newEntries);

fs.writeFileSync(translationsPath, JSON.stringify(translations, null, 2), 'utf-8');
console.log("Successfully added resume-bullet-generator translations!");
