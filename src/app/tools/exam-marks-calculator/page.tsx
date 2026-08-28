"use client";

import { useState, useEffect, useMemo, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, Plus, Trash2, Copy, Printer, Share2, RefreshCw, 
  Settings, Award, CheckCircle, AlertTriangle, ArrowUp, ArrowDown, Sparkles, HelpCircle, GraduationCap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import { MeshGradient, FloatingParticles } from '@/components/BackgroundEffects';
import { useTranslation } from '@/components/I18nContext';
import RelatedTools from '@/components/tools/RelatedTools';

// Static translation sets to enforce exact strings
const TRANSLATIONS: Record<string, Record<string, string>> = {
  en: {
    title: "Exam Marks Calculator",
    subtitle: "Calculate your exam marks percentage, average, grades, and GPA with detailed statistics.",
    subjectName: "Subject Name (Optional)",
    obtainedMarks: "Obtained Marks",
    maxMarks: "Maximum Marks",
    addSubject: "Add Subject",
    reset: "Reset",
    duplicate: "Duplicate",
    delete: "Delete",
    moveUp: "Move Up",
    moveDown: "Move Down",
    passingPercentage: "Passing Percentage",
    gradeSystem: "Grading System Configuration",
    calculate: "Calculate",
    results: "Calculation Results",
    totalObtained: "Total Obtained",
    totalMax: "Total Maximum",
    percentage: "Percentage",
    average: "Average Marks",
    grade: "Grade",
    status: "Status",
    pass: "PASS",
    fail: "FAIL",
    subjectsCount: "Subjects",
    highestMarks: "Highest Score",
    lowestMarks: "Lowest Score",
    copyResult: "Copy Summary",
    downloadPdf: "Save as PDF",
    printResult: "Print Result",
    shareResult: "Share Result",
    invalidObtained: "Obtained marks cannot exceed maximum marks for ",
    invalidNegative: "Marks cannot be negative.",
    invalidEmpty: "Please fill in obtained and maximum marks fields.",
    successCalc: "Calculations updated successfully!",
    copied: "Summary copied to clipboard!",
    gradeThresholds: "Grade Thresholds",
    minPercentage: "Min %",
    gradeLabel: "Grade",
    tipsTitle: "Tips for Improving Your Exam Marks",
    formulaTitle: "How Percentage is Calculated",
    formulaText: "To calculate the exam marks percentage, add the obtained marks of all subjects, divide it by the sum of maximum marks, and multiply the result by 100.",
    formulaLabel: "Formula:",
    exampleTitle: "Worked Example:",
    exampleText: "Suppose you scored 85 in Math, 90 in Science, and 75 in English (each out of 100):\nTotal Obtained = 85 + 90 + 75 = 250\nTotal Maximum = 100 + 100 + 100 = 300\nPercentage = (250 / 300) * 100 = 83.33%",
    faqTitle: "Frequently Asked Questions",
    navBack: "Back to Directory",
    secureProcess: "Secure Processing",
    deviceOnly: "100% On-Device",
    faqQ1: "Is this calculator free to use?",
    faqA1: "Yes, our calculator is 100% free with no registration requirements or hidden limits.",
    faqQ2: "Are my student marks uploaded to any server?",
    faqA2: "No. Your data is calculated inside active browser memory on your device. We respect privacy and never upload marks.",
    faqQ3: "Can I print or save this as a PDF report?",
    faqA3: "Yes! Click the 'Save as PDF' or 'Print Result' button to export a professionally formatted report card page layout.",
    tip1: "💡 Create a structured study schedule and stick to it daily.",
    tip2: "💡 Solve previous years' question papers to understand exam patterns.",
    tip3: "💡 Focus on weak subjects first and clarify doubts with teachers early.",
    tip4: "💡 Maintain good health, eat nutritious meals, and ensure 8 hours of sleep."
  },
  hi: {
    title: "परीक्षा अंक कैलकुलेटर",
    subtitle: "विस्तृत आँकड़ों के साथ अपने परीक्षा अंकों के प्रतिशत, औसत, ग्रेड और जीपीए की गणना करें।",
    subjectName: "विषय का नाम (वैकल्पिक)",
    obtainedMarks: "प्राप्त अंक",
    maxMarks: "अधिकतम अंक",
    addSubject: "विषय जोड़ें",
    reset: "रीसेट",
    duplicate: "डुप्लिकेट",
    delete: "हटाएं",
    moveUp: "ऊपर ले जाएं",
    moveDown: "नीचे ले जाएं",
    passingPercentage: "उत्तीर्ण प्रतिशत",
    gradeSystem: "ग्रेडिंग प्रणाली कॉन्फ़िगरेशन",
    calculate: "गणना करें",
    results: "गणना के परिणाम",
    totalObtained: "कुल प्राप्त अंक",
    totalMax: "कुल अधिकतम अंक",
    percentage: "प्रतिशत",
    average: "औसत अंक",
    grade: "ग्रेड",
    status: "स्थिति",
    pass: "उत्तीर्ण (PASS)",
    fail: "अनुत्तीर्ण (FAIL)",
    subjectsCount: "कुल विषय",
    highestMarks: "अधिकतम अंक",
    lowestMarks: "न्यूनतम अंक",
    copyResult: "सारांश कॉपी करें",
    downloadPdf: "पीडीएफ में सहेजें",
    printResult: "परिणाम प्रिंट करें",
    shareResult: "परिणाम साझा करें",
    invalidObtained: "प्राप्त अंक अधिकतम अंकों से अधिक नहीं हो सकते: ",
    invalidNegative: "अंक नकारात्मक नहीं हो सकते।",
    invalidEmpty: "कृपया प्राप्त अंक और अधिकतम अंक के फ़ील्ड भरें।",
    successCalc: "गणना सफलतापूर्वक अपडेट हो गई!",
    copied: "सारांश क्लिपबोर्ड पर कॉपी किया गया!",
    gradeThresholds: "ग्रेड सीमाएं",
    minPercentage: "न्यूनतम %",
    gradeLabel: "ग्रेड",
    tipsTitle: "परीक्षा अंक सुधारने के लिए टिप्स",
    formulaTitle: "प्रतिशत की गणना कैसे की जाती है",
    formulaText: "परीक्षा अंकों के प्रतिशत की गणना करने के लिए, सभी विषयों के प्राप्त अंकों को जोड़ें, उसे कुल अधिकतम अंकों के योग से विभाजित करें, और परिणाम को 100 से गुणा करें।",
    formulaLabel: "सूत्र (Formula):",
    exampleTitle: "उदाहरण:",
    exampleText: "मान लीजिए आपने गणित में 85, विज्ञान में 90 और अंग्रेजी में 75 अंक प्राप्त किए (प्रत्येक 100 में से):\nकुल प्राप्त अंक = 85 + 90 + 75 = 250\nकुल अधिकतम अंक = 100 + 100 + 100 = 300\nप्रतिशत = (250 / 300) * 100 = 83.33%",
    faqTitle: "अक्सर पूछे जाने वाले प्रश्न",
    navBack: "निर्देशिका पर वापस जाएं",
    secureProcess: "सुरक्षित प्रोसेसिंग",
    deviceOnly: "100% डिवाइस पर",
    faqQ1: "क्या यह कैलकुलेटर उपयोग करने के लिए मुफ़्त है?",
    faqA1: "हाँ, हमारा कैलकुलेटर बिना किसी पंजीकरण आवश्यकताओं या छिपी हुई सीमाओं के 100% मुफ़्त है।",
    faqQ2: "क्या मेरे छात्रों के अंक किसी सर्वर पर अपलोड किए जाते हैं?",
    faqA2: "नहीं। आपका डेटा आपके डिवाइस पर सक्रिय ब्राउज़र मेमोरी के अंदर परिकलित होता है। हम गोपनीयता का सम्मान करते हैं।",
    faqQ3: "क्या मैं इसे प्रिंट या पीडीएफ रिपोर्ट के रूप में सहेज सकता हूं?",
    faqA3: "हाँ! एक पेशेवर रूप से स्वरूपित रिपोर्ट कार्ड पृष्ठ लेआउट निर्यात करने के लिए 'पीडीएफ में सहेजें' या 'परिणाम प्रिंट करें' बटन पर क्लिक करें।",
    tip1: "💡 एक अध्ययन समय सारिणी बनाएं और उसका दैनिक पालन करें।",
    tip2: "💡 परीक्षा पैटर्न को समझने के लिए पिछले वर्षों के प्रश्न पत्र हल करें।",
    tip3: "💡 कमजोर विषयों पर पहले ध्यान दें और शिक्षकों के साथ संदेह दूर करें।",
    tip4: "💡 अच्छे स्वास्थ्य को बनाए रखें, पौष्टिक भोजन लें और 8 घंटे की नींद लें।"
  }
};

interface Subject {
  id: string;
  name: string;
  obtained: string;
  max: string;
}

interface GradeThreshold {
  grade: string;
  min: number;
}

export default function ExamMarksCalculator() {
  const router = useRouter();
  const { locale, localizeHref } = useTranslation();
  const [mounted, setMounted] = useState(false);

  // Localized dictionary resolution
  const tStrings = useMemo(() => {
    const lang = locale === 'hi' ? 'hi' : 'en';
    return TRANSLATIONS[lang];
  }, [locale]);

  // States
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [passingPercent, setPassingPercent] = useState<number>(35);
  const [grades, setGrades] = useState<GradeThreshold[]>([
    { grade: 'A+', min: 90 },
    { grade: 'A', min: 80 },
    { grade: 'B+', min: 70 },
    { grade: 'B', min: 60 },
    { grade: 'C', min: 50 },
    { grade: 'D', min: 35 }
  ]);

  const [validationErrors, setValidationErrors] = useState<string | null>(null);
  const [showConfig, setShowConfig] = useState(false);
  const [successCelebration, setSuccessCelebration] = useState(false);
  const [focusedRowIndex, setFocusedRowIndex] = useState<number | null>(null);

  // Input references for keyboard enter navigation
  const inputRefs = useRef<HTMLInputElement[][]>([]);

  // Redirection guard to restrict locales to English and Hindi only
  useEffect(() => {
    if (locale !== 'en' && locale !== 'hi') {
      router.replace('/tools/exam-marks-calculator/');
    } else {
      setMounted(true);
    }
  }, [locale, router]);

  // Populate initial rows on mount/locale changes
  useEffect(() => {
    if (locale === 'hi') {
      setSubjects([
        { id: '1', name: 'गणित', obtained: '85', max: '100' },
        { id: '2', name: 'विज्ञान', obtained: '90', max: '100' },
        { id: '3', name: 'अंग्रेजी', obtained: '88', max: '100' },
        { id: '4', name: 'इतिहास', obtained: '82', max: '100' },
        { id: '5', name: 'भूगोल', obtained: '80', max: '100' }
      ]);
    } else {
      setSubjects([
        { id: '1', name: 'Mathematics', obtained: '85', max: '100' },
        { id: '2', name: 'Science', obtained: '90', max: '100' },
        { id: '3', name: 'English', obtained: '88', max: '100' },
        { id: '4', name: 'History', obtained: '82', max: '100' },
        { id: '5', name: 'Geography', obtained: '80', max: '100' }
      ]);
    }
  }, [locale]);

  // Subject Handlers
  const handleAddSubject = () => {
    const defaultName = locale === 'hi' ? `विषय ${subjects.length + 1}` : `Subject ${subjects.length + 1}`;
    setSubjects([
      ...subjects,
      { id: Math.random().toString(36).substring(2, 9), name: defaultName, obtained: '', max: '100' }
    ]);
  };

  const handleRemoveSubject = (id: string) => {
    if (subjects.length <= 1) {
      toast.error(locale === 'hi' ? 'कम से कम एक विषय होना आवश्यक है।' : 'At least one subject is required.');
      return;
    }
    setSubjects(subjects.filter(s => s.id !== id));
  };

  const handleDuplicateSubject = (id: string) => {
    const target = subjects.find(s => s.id === id);
    if (!target) return;
    const duplicated: Subject = {
      id: Math.random().toString(36).substring(2, 9),
      name: `${target.name} (${locale === 'hi' ? 'कॉपी' : 'Copy'})`,
      obtained: target.obtained,
      max: target.max
    };
    const index = subjects.findIndex(s => s.id === id);
    const newSubjects = [...subjects];
    newSubjects.splice(index + 1, 0, duplicated);
    setSubjects(newSubjects);
    toast.success(locale === 'hi' ? 'विषय डुप्लिकेट किया गया' : 'Subject duplicated');
  };

  const handleRowChange = (id: string, field: 'name' | 'obtained' | 'max', value: string) => {
    setSubjects(subjects.map(s => {
      if (s.id !== id) return s;
      return { ...s, [field]: value };
    }));
  };

  // Keyboard navigation & order handlers
  const moveRow = (index: number, direction: 'up' | 'down') => {
    const nextIndex = direction === 'up' ? index - 1 : index + 1;
    if (nextIndex < 0 || nextIndex >= subjects.length) return;
    const list = [...subjects];
    const item = list[index];
    list[index] = list[nextIndex];
    list[nextIndex] = item;
    setSubjects(list);
  };

  // Calculations
  const stats = useMemo(() => {
    let totalObtained = 0;
    let totalMax = 0;
    let validCount = 0;
    let errors: string[] = [];
    let highest = -Infinity;
    let lowest = Infinity;
    let highestSubject = '';
    let lowestSubject = '';

    subjects.forEach((s) => {
      const obtNum = parseFloat(s.obtained);
      const maxNum = parseFloat(s.max);
      const name = s.name.trim() || `Subject (ID: ${s.id})`;

      if (isNaN(obtNum) || isNaN(maxNum)) {
        return; // Skip incomplete fields from aggregations but keep valid ones
      }

      validCount++;

      if (obtNum < 0 || maxNum < 0) {
        errors.push(tStrings.invalidNegative);
        return;
      }

      if (obtNum > maxNum) {
        errors.push(`${tStrings.invalidObtained} "${name}"`);
        return;
      }

      totalObtained += obtNum;
      totalMax += maxNum;

      if (obtNum > highest) {
        highest = obtNum;
        highestSubject = name;
      }
      if (obtNum < lowest) {
        lowest = obtNum;
        lowestSubject = name;
      }
    });

    if (errors.length > 0) {
      return { hasErrors: true, errorMsg: errors[0], totalObtained: 0, totalMax: 0, percentage: 0, average: 0, grade: 'Fail', isPassed: false, highest: 0, lowest: 0, highestSubject: '', lowestSubject: '' };
    }

    if (validCount === 0 || totalMax === 0) {
      return { hasErrors: false, errorMsg: null, totalObtained: 0, totalMax: 0, percentage: 0, average: 0, grade: '-', isPassed: false, highest: 0, lowest: 0, highestSubject: '', lowestSubject: '' };
    }

    const percentage = (totalObtained / totalMax) * 100;
    const average = totalObtained / validCount;
    const isPassed = percentage >= passingPercent;

    // Resolve Letter Grade
    let activeGrade = 'Fail';
    if (isPassed) {
      const sortedGrades = [...grades].sort((a, b) => b.min - a.min);
      const matched = sortedGrades.find(g => percentage >= g.min);
      activeGrade = matched ? matched.grade : 'D';
    }

    return {
      hasErrors: false,
      errorMsg: null,
      totalObtained,
      totalMax,
      percentage,
      average,
      grade: isPassed ? activeGrade : 'Fail',
      isPassed,
      highest: highest === -Infinity ? 0 : highest,
      lowest: lowest === Infinity ? 0 : lowest,
      highestSubject,
      lowestSubject
    };
  }, [subjects, grades, passingPercent, tStrings]);

  // Actions
  const handleReset = () => {
    setSubjects(getInitialSubjects(locale));
    setValidationErrors(null);
    setSuccessCelebration(false);
    toast.success(locale === 'hi' ? 'रीसेट सफल' : 'Reset complete');
  };

  const getInitialSubjects = (loc: string) => {
    if (loc === 'hi') {
      return [
        { id: '1', name: 'गणित', obtained: '', max: '100' },
        { id: '2', name: 'विज्ञान', obtained: '', max: '100' },
        { id: '3', name: 'अंग्रेजी', obtained: '', max: '100' }
      ];
    }
    return [
      { id: '1', name: 'Mathematics', obtained: '', max: '100' },
      { id: '2', name: 'Science', obtained: '', max: '100' },
      { id: '3', name: 'English', obtained: '', max: '100' }
    ];
  };

  const handleCalculate = () => {
    if (stats.hasErrors && stats.errorMsg) {
      setValidationErrors(stats.errorMsg);
      toast.error(stats.errorMsg);
      return;
    }

    const incomplete = subjects.some(s => s.obtained === '' || s.max === '');
    if (incomplete) {
      setValidationErrors(tStrings.invalidEmpty);
      toast.error(tStrings.invalidEmpty);
      return;
    }

    setValidationErrors(null);
    setSuccessCelebration(true);
    toast.success(tStrings.successCalc);
    
    // De-escalate celebration banner after a delay
    setTimeout(() => {
      setSuccessCelebration(false);
    }, 4000);
  };

  const handleCopyResult = () => {
    if (stats.totalMax === 0) {
      toast.error(locale === 'hi' ? 'कॉपी करने के लिए पहले गणना करें।' : 'Calculate results first to copy.');
      return;
    }
    const reportStr = `🎓 ${tStrings.title} Summary:
------------------------------------------
📊 ${tStrings.percentage}: ${stats.percentage.toFixed(2)}%
🏆 ${tStrings.grade}: ${stats.grade}
✅ ${tStrings.status}: ${stats.isPassed ? tStrings.pass : tStrings.fail}
📝 ${tStrings.totalObtained}: ${stats.totalObtained.toFixed(1)} / ${stats.totalMax.toFixed(1)}
📈 ${tStrings.average}: ${stats.average.toFixed(2)}
🔥 ${tStrings.highestMarks}: ${stats.highest.toFixed(1)} (${stats.highestSubject})
❄️ ${tStrings.lowestMarks}: ${stats.lowest.toFixed(1)} (${stats.lowestSubject})
------------------------------------------
Calculate yours at: https://toolwala.co/tools/exam-marks-calculator/`;

    navigator.clipboard.writeText(reportStr);
    toast.success(tStrings.copied);
  };

  const handleShareResult = async () => {
    if (stats.totalMax === 0) {
      toast.error(locale === 'hi' ? 'साझा करने के लिए पहले गणना करें।' : 'Calculate results first to share.');
      return;
    }
    const shareData = {
      title: tStrings.title,
      text: `${tStrings.title} - I scored ${stats.percentage.toFixed(2)}% (Grade: ${stats.grade})!`,
      url: 'https://toolwala.co/tools/exam-marks-calculator/'
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (err) {
        handleCopyResult();
      }
    } else {
      handleCopyResult();
    }
  };

  // Printing triggers
  const handlePrint = () => {
    window.print();
  };

  // Grade customizer helpers
  const handleGradeMinChange = (grade: string, val: string) => {
    const valNum = parseFloat(val) || 0;
    setGrades(grades.map(g => {
      if (g.grade !== grade) return g;
      return { ...g, min: valNum };
    }));
  };

  // Keyboard autofocus navigation inside layout grids
  const handleKeyDown = (e: React.KeyboardEvent, rowIndex: number, fieldCol: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Auto move down to the next row of inputs
      const nextRow = rowIndex + 1;
      if (nextRow < subjects.length && inputRefs.current[nextRow]) {
        const nextInput = inputRefs.current[nextRow][fieldCol];
        if (nextInput) nextInput.focus();
      } else if (nextRow === subjects.length) {
        // At the last row, execute calculate
        handleCalculate();
      }
    }
  };

  if (!mounted) {
    return (
      <div className="bg-[#F6F8FC] dark:bg-[#030712] min-h-screen flex items-center justify-center relative overflow-hidden transition-colors duration-250 font-sans">
        <MeshGradient />
        <div className="flex flex-col items-center gap-4 text-white z-10">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="text-xs font-black uppercase tracking-widest text-gray-500 animate-pulse">Initializing Interface...</span>
        </div>
      </div>
    );
  }

  // SVG circular properties
  const radius = 70;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (Math.min(100, Math.max(0, stats.percentage)) / 100) * circumference;

  return (
    <div className="bg-[#F6F8FC] dark:bg-[#030712] min-h-screen py-24 relative overflow-hidden font-sans print:bg-white print:py-4 transition-colors duration-250 font-sans">
      <MeshGradient />
      <FloatingParticles />
      
      {/* Decorative Glow Grid */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none z-0" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10 print:px-0">
        
        {/* Navigation Link */}
        <Link 
          href={localizeHref('/tools')} 
          className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors mb-10 group cursor-pointer print:hidden"
        >
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          {tStrings.navBack}
        </Link>
        
        {/* Main Header Banner */}
        <div className="bg-[#FBFCFE] dark:bg-white/[0.02] border border-[#E6ECF5] dark:border-white/5 rounded-3xl overflow-hidden shadow-2xl mb-12 print:border-none print:shadow-none print:bg-transparent">
          
          <div className="p-8 sm:p-12 border-b border-[#E6ECF5] dark:border-white/5 bg-[#FBFCFE] dark:bg-white/[0.02] print:border-b-2 print:border-black print:p-0 print:pb-6 print:bg-transparent">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
              <div className="flex items-center gap-6">
                <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-blue-600 text-white shadow-[0_4px_20px_rgba(37,99,235,0.35)] text-2xl font-bold print:hidden">
                  🎓
                </div>
                <div>
                  <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tighter uppercase print:text-black print:text-4xl">
                    {tStrings.title}
                  </h1>
                  <p className="text-slate-600 dark:text-gray-400 font-medium mt-1 font-sans print:text-gray-700">
                    {tStrings.subtitle}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 print:hidden">
                <div className="flex flex-col items-end">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500">{tStrings.secureProcess}</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-500">{tStrings.deviceOnly}</span>
                </div>
                <GraduationCap className="w-8 h-8 text-emerald-600/50 dark:text-emerald-500/50" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 print:flex print:flex-col">
            
            {/* Input workspace: 7 columns */}
            <div className="lg:col-span-7 p-8 sm:p-12 bg-[#FBFCFE] dark:bg-black/[0.15] border-r border-[#E6ECF5] dark:border-white/5 space-y-8 print:p-0 print:border-none print:bg-transparent">
              
              {/* Settings Trigger Panel */}
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#E6ECF5] dark:border-white/5 pb-6 print:hidden">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black uppercase text-slate-500 dark:text-gray-400">{tStrings.passingPercentage}:</span>
                  <div className="flex bg-slate-100 dark:bg-black/40 rounded-xl p-1 border border-slate-200 dark:border-white/10">
                    {[30, 33, 35, 40, 50].map((num) => (
                      <button
                        key={num}
                        onClick={() => setPassingPercent(num)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                          passingPercent === num 
                            ? 'bg-blue-600 text-white shadow-sm' 
                            : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                        }`}
                      >
                        {num}%
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  onClick={() => setShowConfig(!showConfig)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200/70 dark:hover:bg-white/10 text-xs font-bold text-slate-700 dark:text-gray-300 transition-all cursor-pointer shadow-sm"
                >
                  <Settings className={`w-4 h-4 ${showConfig ? 'rotate-90' : ''} transition-transform duration-300`} />
                  {showConfig ? (locale === 'hi' ? 'स्केल छिपाएं' : 'Hide Scale') : (locale === 'hi' ? 'स्केल बदलें' : 'Configure Scale')}
                </button>
              </div>

              {/* Collapsible Grade Config Card */}
              <AnimatePresence>
                {showConfig && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden border border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-white/[0.02] rounded-2xl p-6 space-y-4 print:hidden shadow-sm"
                  >
                    <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      {tStrings.gradeSystem}
                    </h3>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {grades.map((g) => (
                        <div key={g.grade} className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-wider">
                            {tStrings.gradeLabel} {g.grade} ({tStrings.minPercentage})
                          </label>
                          <input
                            type="number"
                            min="0"
                            max="100"
                            value={g.min}
                            onChange={(e) => handleGradeMinChange(g.grade, e.target.value)}
                            className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-3 py-2 text-slate-900 dark:text-white font-semibold text-xs focus:outline-none focus:border-blue-500 shadow-sm"
                          />
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Validation Warning Area */}
              {validationErrors && (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400 text-xs font-semibold print:hidden">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <span>{validationErrors}</span>
                </div>
              )}

              {/* Interactive Dynamic Subjects Table */}
              <div className="space-y-4">
                <AnimatePresence initial={false}>
                  {subjects.map((s, idx) => (
                    <motion.div
                      key={s.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      className="grid grid-cols-12 gap-3 items-center bg-slate-50/70 dark:bg-white/[0.02] hover:bg-slate-100/70 dark:hover:bg-white/[0.04] p-4 rounded-2xl border border-slate-200/80 dark:border-white/5 transition-all print:border-none print:border-b print:border-gray-200 print:bg-transparent print:p-2"
                    >
                      {/* Drag & Move order handles */}
                      <div className="col-span-12 sm:col-span-1 flex items-center justify-start gap-1 print:hidden">
                        <button
                          disabled={idx === 0}
                          onClick={() => moveRow(idx, 'up')}
                          className="p-1 hover:text-blue-600 dark:hover:text-blue-400 text-slate-400 dark:text-gray-600 disabled:opacity-20 cursor-pointer"
                          aria-label={tStrings.moveUp}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          disabled={idx === subjects.length - 1}
                          onClick={() => moveRow(idx, 'down')}
                          className="p-1 hover:text-blue-600 dark:hover:text-blue-400 text-slate-400 dark:text-gray-600 disabled:opacity-20 cursor-pointer"
                          aria-label={tStrings.moveDown}
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Subject Name Column */}
                      <div className="col-span-12 sm:col-span-4 print:col-span-6">
                        <span className="text-[9px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest block pl-1 mb-1 sm:hidden print:hidden">
                          {tStrings.subjectName}
                        </span>
                        <input
                          type="text"
                          placeholder={tStrings.subjectName}
                          value={s.name}
                          onChange={(e) => handleRowChange(s.id, 'name', e.target.value)}
                          className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:border-blue-500 transition-colors shadow-sm print:bg-transparent print:border-none print:text-black print:p-0 print:font-bold placeholder:text-slate-400 dark:placeholder:text-gray-600"
                          aria-label={`Subject Name Row ${idx + 1}`}
                        />
                      </div>

                      {/* Obtained Marks Column */}
                      <div className="col-span-6 sm:col-span-3 print:col-span-3">
                        <span className="text-[9px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest block pl-1 mb-1 sm:hidden print:hidden">
                          {tStrings.obtainedMarks}
                        </span>
                        <input
                          type="number"
                          step="any"
                          min="0"
                          placeholder="Obtained"
                          value={s.obtained}
                          onChange={(e) => handleRowChange(s.id, 'obtained', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, idx, 0)}
                          ref={(el) => {
                            if (!inputRefs.current[idx]) inputRefs.current[idx] = [];
                            if (el) inputRefs.current[idx][0] = el;
                          }}
                          className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:border-blue-500 transition-colors shadow-sm print:bg-transparent print:border-none print:text-black print:p-0 placeholder:text-slate-400 dark:placeholder:text-gray-600"
                          aria-label={`Obtained Marks Row ${idx + 1}`}
                        />
                      </div>

                      {/* Maximum Marks Column */}
                      <div className="col-span-6 sm:col-span-2 print:col-span-3">
                        <span className="text-[9px] font-bold text-slate-500 dark:text-gray-500 uppercase tracking-widest block pl-1 mb-1 sm:hidden print:hidden">
                          {tStrings.maxMarks}
                        </span>
                        <input
                          type="number"
                          step="any"
                          min="1"
                          placeholder="Max"
                          value={s.max}
                          onChange={(e) => handleRowChange(s.id, 'max', e.target.value)}
                          onKeyDown={(e) => handleKeyDown(e, idx, 1)}
                          ref={(el) => {
                            if (!inputRefs.current[idx]) inputRefs.current[idx] = [];
                            if (el) inputRefs.current[idx][1] = el;
                          }}
                          className="w-full bg-white dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl px-4 py-3 text-slate-900 dark:text-white font-semibold text-sm focus:outline-none focus:border-blue-500 transition-colors shadow-sm print:bg-transparent print:border-none print:text-black print:p-0 placeholder:text-slate-400 dark:placeholder:text-gray-600"
                          aria-label={`Maximum Marks Row ${idx + 1}`}
                        />
                      </div>

                      {/* Delete / Duplicate Controls */}
                      <div className="col-span-12 sm:col-span-2 flex items-center justify-end gap-2 print:hidden">
                        <button
                          onClick={() => handleDuplicateSubject(s.id)}
                          className="p-2.5 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200 dark:border-white/10 hover:bg-slate-200/80 dark:hover:bg-white/10 hover:border-blue-500/50 text-slate-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-all cursor-pointer shadow-sm"
                          title={tStrings.duplicate}
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleRemoveSubject(s.id)}
                          className="p-2.5 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-400 transition-all cursor-pointer shadow-sm"
                          title={tStrings.delete}
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Call-to-action triggers */}
              <div className="flex flex-wrap gap-4 pt-4 print:hidden">
                <button
                  onClick={handleAddSubject}
                  className="px-6 py-4 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-800 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 dark:text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all cursor-pointer hover:scale-105 active:scale-95 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  {tStrings.addSubject}
                </button>

                <button
                  onClick={handleCalculate}
                  className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all shadow-[0_4px_20px_rgba(37,99,235,0.3)] cursor-pointer hover:scale-105 active:scale-95 ml-auto"
                >
                  <Sparkles className="w-4 h-4" />
                  {tStrings.calculate}
                </button>

                <button
                  onClick={handleReset}
                  className="px-6 py-4 bg-red-50 hover:bg-red-100 border border-red-200 text-red-600 dark:bg-red-500/10 dark:hover:bg-red-500/20 dark:border-red-500/20 dark:text-red-400 rounded-2xl text-xs font-black uppercase tracking-[0.2em] flex items-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <RefreshCw className="w-4 h-4" />
                  {tStrings.reset}
                </button>
              </div>
            </div>

            {/* Calculations display panel: 5 columns */}
            <div className="lg:col-span-5 p-8 sm:p-12 bg-[#FBFCFE] dark:bg-white/[0.01] flex flex-col justify-between space-y-8 print:p-0 print:border-none print:bg-transparent">
              
              <div className="space-y-8">
                <h2 className="text-xl font-black text-slate-900 dark:text-white uppercase tracking-wider border-b border-[#E6ECF5] dark:border-white/5 pb-4 print:text-black print:border-black">
                  {tStrings.results}
                </h2>

                {/* Celebration Sparkles Banner */}
                <AnimatePresence>
                  {successCelebration && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 flex items-center gap-3 text-emerald-700 dark:text-emerald-400 text-xs font-bold print:hidden shadow-sm"
                    >
                      <CheckCircle className="w-5 h-5 animate-bounce shrink-0" />
                      <span>{tStrings.successCalc}</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Ring Gauge & Big Status Cards */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-8 bg-slate-100/90 dark:bg-black/40 border border-slate-200 dark:border-white/5 p-6 rounded-3xl print:bg-transparent print:border-none print:p-0 shadow-sm">
                  
                  {/* Gauge Ring */}
                  <div className="relative h-40 w-40 flex items-center justify-center">
                    <svg className="absolute w-full h-full transform -rotate-90">
                      <circle
                        cx="80"
                        cy="80"
                        r={radius}
                        className="stroke-slate-200 dark:stroke-white/5 fill-none"
                        strokeWidth="10"
                      />
                      <motion.circle
                        cx="80"
                        cy="80"
                        r={radius}
                        className="stroke-blue-500 fill-none print:stroke-black"
                        strokeWidth="10"
                        strokeDasharray={circumference}
                        initial={{ strokeDashoffset: circumference }}
                        animate={{ strokeDashoffset }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                        strokeLinecap="round"
                      />
                    </svg>
                    
                    {/* Ring Percentage Inner Label */}
                    <div className="text-center">
                      <motion.span 
                        className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter block print:text-black"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                      >
                        {stats.percentage.toFixed(1)}%
                      </motion.span>
                      <span className="text-[9px] font-black uppercase text-slate-500 dark:text-gray-500 block tracking-widest mt-0.5">
                        {tStrings.percentage}
                      </span>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex flex-col gap-3 justify-center text-center sm:text-left">
                    <div className="space-y-1">
                      <span className="text-[9px] font-black uppercase text-slate-500 dark:text-gray-500 tracking-widest">{tStrings.grade}</span>
                      <div className="text-3xl font-black text-slate-900 dark:text-white print:text-black uppercase">
                        {stats.grade}
                      </div>
                    </div>
                    
                    <div className="pt-2">
                      {stats.totalMax > 0 && (
                        <div className={`inline-flex items-center px-4 py-2 rounded-xl text-xs font-black uppercase tracking-[0.2em] border ${
                          stats.isPassed 
                            ? 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-400 print:text-black print:border-black' 
                            : 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 text-red-700 dark:text-red-400 print:text-black print:border-black'
                        }`}>
                          {stats.isPassed ? tStrings.pass : tStrings.fail}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Aggregate Summary Mini Cards */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm print:bg-transparent print:border-none print:border-b print:border-gray-200">
                    <span className="text-[9px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest block mb-1">
                      {tStrings.totalObtained}
                    </span>
                    <div className="text-xl font-black text-slate-900 dark:text-white print:text-black">
                      {stats.totalObtained.toFixed(1)} / {stats.totalMax.toFixed(1)}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm print:bg-transparent print:border-none print:border-b print:border-gray-200">
                    <span className="text-[9px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest block mb-1">
                      {tStrings.average}
                    </span>
                    <div className="text-xl font-black text-slate-900 dark:text-white print:text-black">
                      {stats.average.toFixed(2)}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm print:bg-transparent print:border-none print:border-b print:border-gray-200">
                    <span className="text-[9px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest block mb-1">
                      {tStrings.highestMarks}
                    </span>
                    <div className="text-sm font-black text-slate-900 dark:text-white print:text-black line-clamp-1">
                      {stats.highest > -Infinity ? `${stats.highest.toFixed(1)} (${stats.highestSubject})` : '-'}
                    </div>
                  </div>

                  <div className="bg-white dark:bg-white/[0.02] border border-slate-200 dark:border-white/5 rounded-2xl p-4 shadow-sm print:bg-transparent print:border-none print:border-b print:border-gray-200">
                    <span className="text-[9px] font-black text-slate-500 dark:text-gray-500 uppercase tracking-widest block mb-1">
                      {tStrings.lowestMarks}
                    </span>
                    <div className="text-sm font-black text-slate-900 dark:text-white print:text-black line-clamp-1">
                      {stats.lowest < Infinity ? `${stats.lowest.toFixed(1)} (${stats.lowestSubject})` : '-'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Utility Exports Section */}
              <div className="flex flex-wrap gap-3 pt-6 border-t border-[#E6ECF5] dark:border-white/5 print:hidden">
                <button
                  onClick={handleCopyResult}
                  className="flex-1 min-w-[120px] px-4 py-3 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 dark:text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <Copy className="w-3.5 h-3.5" />
                  {tStrings.copyResult}
                </button>

                <button
                  onClick={handlePrint}
                  className="flex-1 min-w-[120px] px-4 py-3 bg-slate-100 hover:bg-slate-200/80 border border-slate-200 text-slate-700 dark:bg-white/5 dark:hover:bg-white/10 dark:border-white/10 dark:text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <Printer className="w-3.5 h-3.5" />
                  {tStrings.printResult}
                </button>

                <button
                  onClick={handleShareResult}
                  className="flex-1 min-w-[120px] px-4 py-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-600 dark:bg-blue-600/10 dark:hover:bg-blue-600/20 dark:border-blue-600/20 dark:text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  {tStrings.shareResult}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Educational Content Deck: Formula, worked examples, faq */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16 print:hidden">
          
          {/* Formula & examples card */}
          <div className="bg-[#FBFCFE] dark:bg-white/[0.01] rounded-3xl border border-[#E6ECF5] dark:border-white/5 p-8 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-4 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {tStrings.formulaTitle}
            </h3>
            
            <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed mb-6">
              {tStrings.formulaText}
            </p>

            <div className="bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/5 rounded-xl p-4 font-mono text-xs text-blue-600 dark:text-blue-400 mb-6 shadow-sm">
              <span className="text-slate-500 dark:text-gray-500 font-bold block mb-1">{tStrings.formulaLabel}</span>
              Percentage = (Total Obtained Marks / Total Maximum Marks) * 100
            </div>

            <h4 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white mb-2">
              {tStrings.exampleTitle}
            </h4>
            <p className="text-slate-600 dark:text-gray-400 text-xs leading-relaxed whitespace-pre-line">
              {tStrings.exampleText}
            </p>
          </div>

          {/* Exam Tips card */}
          <div className="bg-[#FBFCFE] dark:bg-white/[0.01] rounded-3xl border border-[#E6ECF5] dark:border-white/5 p-8 shadow-sm">
            <h3 className="text-lg font-black text-slate-900 dark:text-white uppercase tracking-tight mb-6 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              {tStrings.tipsTitle}
            </h3>
            <ul className="space-y-4 text-sm text-slate-600 dark:text-gray-400">
              <li className="p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors">{tStrings.tip1}</li>
              <li className="p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors">{tStrings.tip2}</li>
              <li className="p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors">{tStrings.tip3}</li>
              <li className="p-3 bg-slate-50 dark:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 rounded-xl hover:bg-slate-100 dark:hover:bg-white/[0.04] transition-colors">{tStrings.tip4}</li>
            </ul>
          </div>
        </div>

        {/* FAQs section */}
        <div className="bg-[#FBFCFE] dark:bg-white/[0.01] rounded-3xl border border-[#E6ECF5] dark:border-white/5 p-8 sm:p-12 mb-16 shadow-sm print:hidden">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tighter mb-8 flex items-center gap-3">
            <HelpCircle className="w-6 h-6 text-blue-600 dark:text-blue-400" />
            {tStrings.faqTitle}
          </h3>

          <div className="space-y-6">
            <div className="border-b border-[#E6ECF5] dark:border-white/5 pb-6">
              <h4 className="text-base font-black text-slate-900 dark:text-white mb-2">{tStrings.faqQ1}</h4>
              <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed">{tStrings.faqA1}</p>
            </div>
            <div className="border-b border-[#E6ECF5] dark:border-white/5 pb-6">
              <h4 className="text-base font-black text-slate-900 dark:text-white mb-2">{tStrings.faqQ2}</h4>
              <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed">{tStrings.faqA2}</p>
            </div>
            <div>
              <h4 className="text-base font-black text-slate-900 dark:text-white mb-2">{tStrings.faqQ3}</h4>
              <p className="text-slate-600 dark:text-gray-400 text-sm leading-relaxed">{tStrings.faqA3}</p>
            </div>
          </div>
        </div>

        {/* Related tools widget */}
        <div className="print:hidden">
          <RelatedTools currentSlug="exam-marks-calculator" maxTools={3} />
        </div>
      </div>
    </div>
  );
}
