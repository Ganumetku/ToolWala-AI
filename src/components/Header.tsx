"use client";

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Menu, X, Rocket, Sparkles, Globe, ChevronDown, ShieldCheck, Mail, ArrowRight } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { toolsData } from '@/data/tools';
import { useTranslation } from '@/components/I18nContext';
import ThemeToggle from '@/components/ThemeToggle';
import ToolIcon from '@/components/ToolIcon';

const LANGUAGES = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'hi', name: 'हिन्दी', flag: '🇮🇳' },
  { code: 'es', name: 'Español', flag: '🇪🇸' },
  { code: 'fr', name: 'Français', flag: '🇫🇷' },
  { code: 'de', name: 'Deutsch', flag: '🇩🇪' },
  { code: 'pt', name: 'Português', flag: '🇵🇹' },
  { code: 'ar', name: 'العربية', flag: '🇸🇦' },
  { code: 'id', name: 'Bahasa Indonesia', flag: '🇮🇩' },
];

export default function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  const langDropdownRef = useRef<HTMLDivElement>(null);
  
  const pathname = usePathname();
  const { t, locale, enabledLocales, localizeHref } = useTranslation();

  // Filter languages to only show the enabled ones in priority order
  const activeLanguages = enabledLocales
    .map(code => LANGUAGES.find(lang => lang.code === code))
    .filter((lang): lang is typeof LANGUAGES[0] => !!lang);
  const currentLanguage = LANGUAGES.find(lang => lang.code === locale) || LANGUAGES[0];

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (pathname && pathname.includes('/tools')) {
      const parts = pathname.split('/');
      const ALL_LANG_CODES = ['hi', 'es', 'fr', 'de', 'pt', 'ar', 'id'];
      const cleanHref = ALL_LANG_CODES.includes(parts[1])
        ? '/' + parts.slice(2).join('/')
        : pathname;

      const matchedTool = toolsData.find(tool => tool.href === cleanHref || tool.href + '/' === cleanHref);
      if (matchedTool) {
        try {
          const key = 'recentlyUsedTools';
          const recent = JSON.parse(localStorage.getItem(key) || '[]');
          const updated = [matchedTool.id, ...recent.filter((id: string) => id !== matchedTool.id)].slice(0, 4);
          localStorage.setItem(key, JSON.stringify(updated));
        } catch (e) {
          console.error('Error saving recent tools:', e);
        }
      }
    }
  }, [pathname]);

  const handleLanguageChange = (newLocale: string) => {
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000; SameSite=Lax`;
    localStorage.setItem('preferredLocale', newLocale);

    // Compute the new pathname
    const currentPathname = window.location.pathname;
    const pathnameParts = currentPathname.split('/');
    
    // Check if first segment is a supported locale (excluding English)
    const currentLocalePrefix = pathnameParts[1];
    const ALL_LOCALES = ['hi', 'es', 'fr', 'de', 'pt', 'ar', 'id'];
    const isCurrentLocalePrefixed = ALL_LOCALES.includes(currentLocalePrefix);

    let newPathname = currentPathname;
    if (newLocale === 'en') {
      if (isCurrentLocalePrefixed) {
        newPathname = '/' + pathnameParts.slice(2).join('/');
      }
    } else {
      if (isCurrentLocalePrefixed) {
        pathnameParts[1] = newLocale;
        newPathname = pathnameParts.join('/');
      } else {
        newPathname = `/${newLocale}${currentPathname}`;
      }
    }
    // Maintain trailing slash config (trailingSlash: true)
    if (!newPathname.endsWith('/') && currentPathname.endsWith('/')) {
      newPathname += '/';
    }
    if (newPathname.endsWith('/') && !currentPathname.endsWith('/')) {
      newPathname = newPathname.slice(0, -1);
    }
    if (newPathname === '') {
      newPathname = '/';
    }

    const search = window.location.search;
    window.location.href = newPathname + search;
  };

  const convertPdfTools = {
    toPdf: [
      { 
        name: 'JPG to PDF', 
        href: '/tools/jpg-to-pdf', 
        badge: 'JPG',
        badgeColor: 'bg-amber-50/80 dark:bg-amber-500/10 text-amber-600/90 dark:text-amber-400/90 border border-amber-200/50 dark:border-amber-500/15',
        desc: 'Convert JPG, PNG to PDF' 
      },
      { 
        name: 'Word to PDF', 
        href: '/tools/word-to-pdf-converter', 
        badge: 'DOC',
        badgeColor: 'bg-blue-50/80 dark:bg-blue-500/10 text-blue-600/90 dark:text-blue-400/90 border border-blue-200/50 dark:border-blue-500/15',
        desc: 'Convert DOC, DOCX to PDF' 
      },
      { 
        name: 'PowerPoint to PDF', 
        href: '/tools/powerpoint-to-pdf', 
        badge: 'PPT',
        badgeColor: 'bg-rose-50/80 dark:bg-rose-500/10 text-rose-600/90 dark:text-rose-400/90 border border-rose-200/50 dark:border-rose-500/15',
        desc: 'Convert PPTX to PDF' 
      },
      { 
        name: 'Excel to PDF', 
        href: '/tools/excel-to-pdf-converter', 
        badge: 'XLS',
        badgeColor: 'bg-emerald-50/80 dark:bg-emerald-500/10 text-emerald-600/90 dark:text-emerald-400/90 border border-emerald-200/50 dark:border-emerald-500/15',
        desc: 'Spreadsheet to PDF' 
      },
      { 
        name: 'HEIC to PDF', 
        href: '/tools/heic-to-jpg-png-converter', 
        badge: 'HEIC',
        badgeColor: 'bg-purple-50/80 dark:bg-purple-500/10 text-purple-600/90 dark:text-purple-400/90 border border-purple-200/50 dark:border-purple-500/15',
        desc: 'Apple photos to PDF' 
      },
    ],
    fromPdf: [
      { 
        name: 'PDF to JPG', 
        href: '/tools/pdf-to-jpg', 
        badge: 'JPG',
        badgeColor: 'bg-amber-50/80 dark:bg-amber-500/10 text-amber-600/90 dark:text-amber-400/90 border border-amber-200/50 dark:border-amber-500/15',
        desc: 'Extract pages as JPG' 
      },
      { 
        name: 'PDF to Word', 
        href: '/tools/pdf-to-word-converter', 
        badge: 'DOC',
        badgeColor: 'bg-blue-50/80 dark:bg-blue-500/10 text-blue-600/90 dark:text-blue-400/90 border border-blue-200/50 dark:border-blue-500/15',
        desc: 'Convert to editable DOCX' 
      },
      { 
        name: 'PDF to PowerPoint', 
        href: '/tools/pdf-to-powerpoint', 
        badge: 'PPT',
        badgeColor: 'bg-rose-50/80 dark:bg-rose-500/10 text-rose-600/90 dark:text-rose-400/90 border border-rose-200/50 dark:border-rose-500/15',
        desc: 'Convert PDF to PPTX' 
      },
      { 
        name: 'PDF to Excel', 
        href: '/tools/pdf-to-excel-converter', 
        badge: 'XLS',
        badgeColor: 'bg-emerald-50/80 dark:bg-emerald-500/10 text-emerald-600/90 dark:text-emerald-400/90 border border-emerald-200/50 dark:border-emerald-500/15',
        desc: 'Extract tables to Excel' 
      },
      { 
        name: 'PDF to Text / OCR', 
        href: '/tools/pdf-ocr', 
        badge: 'OCR',
        badgeColor: 'bg-indigo-50/80 dark:bg-indigo-500/10 text-indigo-600/90 dark:text-indigo-400/90 border border-indigo-200/50 dark:border-indigo-500/15',
        desc: 'Extract selectable text' 
      },
    ]
  };

  const allPdfCategories = [
    {
      id: 'organize',
      label: 'Organize & Pages',
      icon: 'LayoutGrid',
      accentColor: 'text-blue-500 dark:text-blue-400',
      theme: {
        iconBox: 'bg-blue-50/90 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/20',
        indicator: 'bg-blue-500/80',
        hoverBg: 'hover:bg-blue-50/40 dark:hover:bg-blue-500/5',
        toolHoverText: 'group-hover:text-blue-600 dark:group-hover:text-blue-400',
      },
      tools: [
        { name: 'Merge PDF', href: '/tools/merge-pdf', icon: 'Merge', badge: 'Combine', desc: 'Join multiple files into one' },
        { name: 'Split PDF', href: '/tools/split-pdf', icon: 'SplitSquareHorizontal', badge: 'Extract', desc: 'Extract pages to separate files' },
        { name: 'Organize PDF', href: '/tools/organize-pdf', icon: 'LayoutGrid', badge: 'Sort', desc: 'Reorder, rotate & delete pages' },
        { name: 'Remove Pages', href: '/tools/remove-pages', icon: 'FileMinus', badge: 'Delete', desc: 'Delete unwanted pages' },
        { name: 'Add Page Numbers', href: '/tools/add-page-numbers-to-pdf', icon: 'Hash', badge: 'Number', desc: 'Custom numbering' },
      ]
    },
    {
      id: 'convert',
      label: 'Convert PDF',
      icon: 'FileOutput',
      accentColor: 'text-emerald-500 dark:text-emerald-400',
      theme: {
        iconBox: 'bg-emerald-50/90 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20',
        indicator: 'bg-emerald-500/80',
        hoverBg: 'hover:bg-emerald-50/40 dark:hover:bg-emerald-500/5',
        toolHoverText: 'group-hover:text-emerald-600 dark:group-hover:text-emerald-400',
      },
      tools: [
        { name: 'Word to PDF', href: '/tools/word-to-pdf-converter', icon: 'FileOutput', badge: 'DOC', badgeColor: 'bg-blue-50/80 dark:bg-blue-500/10 text-blue-600/90 dark:text-blue-400/90 border border-blue-200/50 dark:border-blue-500/15', desc: 'DOCX to clean PDF' },
        { name: 'PDF to Word', href: '/tools/pdf-to-word-converter', icon: 'FileText', badge: 'DOC', badgeColor: 'bg-blue-50/80 dark:bg-blue-500/10 text-blue-600/90 dark:text-blue-400/90 border border-blue-200/50 dark:border-blue-500/15', desc: 'PDF to editable DOCX' },
        { name: 'Excel to PDF', href: '/tools/excel-to-pdf-converter', icon: 'FileSpreadsheet', badge: 'XLS', badgeColor: 'bg-emerald-50/80 dark:bg-emerald-500/10 text-emerald-600/90 dark:text-emerald-400/90 border border-emerald-200/50 dark:border-emerald-500/15', desc: 'Spreadsheet to PDF' },
        { name: 'PDF to Excel', href: '/tools/pdf-to-excel-converter', icon: 'FileSpreadsheet', badge: 'XLS', badgeColor: 'bg-emerald-50/80 dark:bg-emerald-500/10 text-emerald-600/90 dark:text-emerald-400/90 border border-emerald-200/50 dark:border-emerald-500/15', desc: 'Extract table data' },
        { name: 'PowerPoint to PDF', href: '/tools/powerpoint-to-pdf', icon: 'Presentation', badge: 'PPT', badgeColor: 'bg-rose-50/80 dark:bg-rose-500/10 text-rose-600/90 dark:text-rose-400/90 border border-rose-200/50 dark:border-rose-500/15', desc: 'PPTX to PDF slides' },
        { name: 'PDF to PowerPoint', href: '/tools/pdf-to-powerpoint', icon: 'Presentation', badge: 'PPT', badgeColor: 'bg-rose-50/80 dark:bg-rose-500/10 text-rose-600/90 dark:text-rose-400/90 border border-rose-200/50 dark:border-rose-500/15', desc: 'PDF to PPTX slides' },
        { name: 'JPG to PDF', href: '/tools/jpg-to-pdf', icon: 'Image', badge: 'JPG', badgeColor: 'bg-amber-50/80 dark:bg-amber-500/10 text-amber-600/90 dark:text-amber-400/90 border border-amber-200/50 dark:border-amber-500/15', desc: 'Images to single PDF' },
        { name: 'PDF to JPG', href: '/tools/pdf-to-jpg', icon: 'FileImage', badge: 'JPG', badgeColor: 'bg-amber-50/80 dark:bg-amber-500/10 text-amber-600/90 dark:text-amber-400/90 border border-amber-200/50 dark:border-amber-500/15', desc: 'Extract high-res JPG' },
      ]
    },
    {
      id: 'edit',
      label: 'Edit & Sign',
      icon: 'FilePenLine',
      accentColor: 'text-violet-500 dark:text-violet-400',
      theme: {
        iconBox: 'bg-purple-50/90 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-200/50 dark:border-purple-500/20',
        indicator: 'bg-purple-500/80',
        hoverBg: 'hover:bg-purple-50/40 dark:hover:bg-purple-500/5',
        toolHoverText: 'group-hover:text-purple-600 dark:group-hover:text-purple-400',
      },
      tools: [
        { name: 'Edit PDF', href: '/tools/pdf-tools/edit-pdf', icon: 'FilePenLine', badge: 'POPULAR', badgeColor: 'bg-blue-50/80 dark:bg-blue-500/10 text-blue-600/90 dark:text-blue-400/90 border border-blue-200/50 dark:border-blue-500/15', desc: 'Add text, forms & draw' },
        { name: 'Sign PDF', href: '/tools/sign-pdf', icon: 'PenTool', badge: 'E-SIGN', badgeColor: 'bg-purple-50/80 dark:bg-purple-500/10 text-purple-600/90 dark:text-purple-400/90 border border-purple-200/50 dark:border-purple-500/15', desc: 'Draw, type signature' },
        { name: 'Crop PDF', href: '/tools/crop-pdf', icon: 'Crop', badge: 'Trim', desc: 'Trim page margins' },
        { name: 'Rotate PDF', href: '/tools/rotate-pdf', icon: 'RotateCw', badge: 'Turn', desc: 'Rotate 90° or 180°' },
        { name: 'Watermark PDF', href: '/tools/watermark-pdf', icon: 'Droplets', badge: 'Stamp', desc: 'Stamp text or image' },
      ]
    },
    {
      id: 'security',
      label: 'Security & Optimize',
      icon: 'Lock',
      accentColor: 'text-amber-500 dark:text-amber-400',
      theme: {
        iconBox: 'bg-amber-50/90 dark:bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-500/20',
        indicator: 'bg-amber-500/80',
        hoverBg: 'hover:bg-amber-50/40 dark:hover:bg-amber-500/5',
        toolHoverText: 'group-hover:text-amber-600 dark:group-hover:text-amber-400',
      },
      tools: [
        { name: 'Compress PDF', href: '/tools/compress-pdf', icon: 'Shrink', badge: 'FAST', badgeColor: 'bg-emerald-50/80 dark:bg-emerald-500/10 text-emerald-600/90 dark:text-emerald-400/90 border border-emerald-200/50 dark:border-emerald-500/15', desc: 'Shrink MB size' },
        { name: 'Protect PDF', href: '/tools/protect-pdf', icon: 'Lock', badge: 'Lock', desc: 'Add password encryption' },
        { name: 'Unlock PDF', href: '/tools/unlock-pdf', icon: 'LockOpen', badge: 'Unlock', desc: 'Remove password' },
        { name: 'Aadhaar Masking', href: '/tools/aadhaar-masking-tool', icon: 'EyeOff', badge: 'PRIVACY', badgeColor: 'bg-rose-50/80 dark:bg-rose-500/10 text-rose-600/90 dark:text-rose-400/90 border border-rose-200/50 dark:border-rose-500/15', desc: 'Mask first 8 digits' },
        { name: 'Aadhaar 300KB', href: '/tools/aadhaar-pdf-compressor', icon: 'Shrink', badge: '300KB', badgeColor: 'bg-blue-50/80 dark:bg-blue-500/10 text-blue-600/90 dark:text-blue-400/90 border border-blue-200/50 dark:border-blue-500/15', desc: 'UIDAI portal limit' },
        { name: 'Govt Form PDF', href: '/tools/gov-form-pdf-compressor', icon: 'FileMinus', badge: 'GOVT', badgeColor: 'bg-amber-50/80 dark:bg-amber-500/10 text-amber-600/90 dark:text-amber-400/90 border border-amber-200/50 dark:border-amber-500/15', desc: 'UPSC / SSC forms' },
      ]
    },
    {
      id: 'intelligence',
      label: 'AI & Smart Tools',
      icon: 'Sparkles',
      accentColor: 'text-purple-500 dark:text-purple-400',
      theme: {
        iconBox: 'bg-violet-50/90 dark:bg-violet-500/10 text-violet-600 dark:text-violet-400 border border-violet-200/50 dark:border-violet-500/20',
        indicator: 'bg-violet-500/80',
        hoverBg: 'hover:bg-violet-50/40 dark:hover:bg-violet-500/5',
        toolHoverText: 'group-hover:text-violet-600 dark:group-hover:text-violet-400',
      },
      tools: [
        { name: 'AI PDF Summarizer', href: '/tools/pdf-summarizer', icon: 'Sparkles', badge: 'AI LAB', badgeColor: 'bg-purple-50/80 dark:bg-purple-500/10 text-purple-600/90 dark:text-purple-400/90 border border-purple-200/50 dark:border-purple-500/15', desc: 'Client-side summary' },
        { name: 'PDF OCR Scanner', href: '/tools/pdf-ocr', icon: 'ScanText', badge: 'OCR', badgeColor: 'bg-indigo-50/80 dark:bg-indigo-500/10 text-indigo-600/90 dark:text-indigo-400/90 border border-indigo-200/50 dark:border-indigo-500/15', desc: 'Scan & extract text' },
        { name: 'All PDF Directory', href: '/categories/pdf-tools', icon: 'ArrowRight', badge: '26 TOOLS', badgeColor: 'bg-blue-50/80 dark:bg-blue-500/10 text-blue-600/90 dark:text-blue-400/90 border border-blue-200/50 dark:border-blue-500/15', desc: 'View all category tools' },
      ]
    }
  ];

  const navigation = [
    { name: t('nav.home', 'Home'), href: '/' },
    { 
      name: t('nav.convert_pdf', 'Convert PDF'), 
      href: '#', 
      isConvert: true 
    },
    { 
      name: t('nav.all_pdf_tools', 'All PDF Tools'), 
      href: '#', 
      isAllPdf: true 
    },
    { name: t('nav.tools', 'All Tools'), href: '/tools' },
    { name: t('nav.categories', 'Categories'), href: '/categories' },
    { name: t('nav.pricing', 'Pricing'), href: '/pricing' },
    { name: t('nav.blog', 'Blog'), href: '/blog' },
  ];

  const secondaryNavigation = [
    { name: t('nav.privacy', 'Privacy Hub'), href: '/privacy', icon: 'ShieldCheck' },
    { name: t('nav.about', 'About'), href: '/about', icon: 'Sparkles' },
    { name: t('nav.contact', 'Contact Us'), href: '/contact', icon: 'Mail' },
  ];

  const [isPdfDropdownOpen, setIsPdfDropdownOpen] = useState(false);
  const [isConvertDropdownOpen, setIsConvertDropdownOpen] = useState(false);
  const [isMobilePdfOpen, setIsMobilePdfOpen] = useState(false);
  const [isMobileConvertOpen, setIsMobileConvertOpen] = useState(false);
  const [pdfActiveFilter, setPdfActiveFilter] = useState<'all' | 'organize' | 'convert' | 'edit' | 'security' | 'intelligence'>('all');
  const pdfDropdownRef = useRef<HTMLDivElement>(null);
  const convertDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (langDropdownRef.current && !langDropdownRef.current.contains(event.target as Node)) {
        setIsLangDropdownOpen(false);
      }
      if (pdfDropdownRef.current && !pdfDropdownRef.current.contains(event.target as Node)) {
        setIsPdfDropdownOpen(false);
      }
      if (convertDropdownRef.current && !convertDropdownRef.current.contains(event.target as Node)) {
        setIsConvertDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  return (
    <header 
      className={`sticky top-0 z-[9999] w-full h-[60px] transition-all duration-200 ${
        isMobileMenuOpen
          ? 'bg-white dark:bg-[#030712] border-b border-slate-200/80 dark:border-white/5'
          : isScrolled 
            ? 'bg-white/95 dark:bg-[#030712]/90 backdrop-blur-md border-b border-slate-200/80 dark:border-white/5 shadow-sm' 
            : 'bg-white/90 dark:bg-[#030712]/85 backdrop-blur-md border-b border-slate-200/60 dark:border-white/5'
      }`}
    >
      <div className="w-full max-w-[1720px] mx-auto h-full flex items-center justify-between px-4 sm:px-6 lg:px-6 xl:px-8 2xl:px-10 gap-3 xl:gap-4">
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          <Link href={localizeHref('/')} translate="no" data-no-translate className="flex items-center gap-2.5 group whitespace-nowrap shrink-0 no-translate notranslate">
            <div className="flex h-8 w-8 sm:h-9 sm:w-9 items-center justify-center rounded-xl bg-blue-600 text-white font-black text-lg sm:text-xl transition-all group-hover:scale-105 shadow-sm shadow-blue-600/20 relative overflow-hidden no-translate notranslate" translate="no" data-no-translate>
              T
            </div>
            <div className="flex flex-col">
              <span translate="no" data-no-translate className="text-base sm:text-lg font-extrabold tracking-tight text-gray-900 dark:text-white whitespace-nowrap no-translate notranslate leading-none">
                ToolWala <span translate="no" data-no-translate className="text-blue-600 dark:text-blue-500 font-black no-translate notranslate">AI</span>
              </span>
              <span className="hidden sm:block text-[8px] sm:text-[8.5px] font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase mt-0.5 leading-none">
                Your Files • Your Privacy
              </span>
            </div>
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center h-10 gap-0.5 min-[1200px]:gap-1 bg-slate-100/60 dark:bg-white/[0.04] p-1 rounded-full border border-slate-200/70 dark:border-white/10 backdrop-blur-md">
          {navigation.map((item) => {
            if (item.isConvert) {
              const allConvertHrefs = [
                ...convertPdfTools.toPdf.map(t => t.href),
                ...convertPdfTools.fromPdf.map(t => t.href)
              ];
              const hasActiveConvert = allConvertHrefs.some(href => pathname === localizeHref(href));
              return (
                <div className="relative" key={item.name} ref={convertDropdownRef}>
                  <button
                    onClick={() => {
                      setIsConvertDropdownOpen(!isConvertDropdownOpen);
                      setIsPdfDropdownOpen(false);
                    }}
                    className={`h-8 px-2.5 min-[1150px]:px-3 xl:px-3.5 rounded-full text-[11px] min-[1200px]:text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer select-none ${
                      isConvertDropdownOpen || hasActiveConvert
                        ? 'bg-[#2563EB] text-white shadow-sm' 
                        : 'text-slate-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white hover:bg-white dark:hover:bg-white/5'
                    }`}
                  >
                    {item.name}
                    <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isConvertDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isConvertDropdownOpen && (
                    <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2.5 w-[580px] min-[1250px]:w-[620px] rounded-3xl border border-gray-200/90 dark:border-white/10 bg-white dark:bg-[#090d16]/98 p-6 shadow-2xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.85)] backdrop-blur-xl animate-fade-in z-50">
                      {/* Top Triangle Caret Pointer */}
                      <div className="absolute -top-1.5 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45 bg-white dark:bg-[#090d16] border-t border-l border-gray-200/90 dark:border-white/10" />

                      {/* Top subtle glow */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[1px] w-28 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

                      <div className="grid grid-cols-2 gap-6 relative z-10">
                        {/* Column 1: CONVERT TO PDF */}
                        <div>
                          <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-100 dark:border-white/5 px-1 relative">
                            <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 bg-blue-50/90 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/20">
                              <ToolIcon icon="FileOutput" className="w-3 h-3" />
                            </div>
                            <span className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 truncate">
                              {t('nav.convert_to_pdf', 'Convert to PDF')}
                            </span>
                            <div className="absolute -bottom-px left-0 w-6 h-[1.5px] rounded-full bg-blue-500/80" />
                          </div>
                          <div className="space-y-0.5">
                            {convertPdfTools.toPdf.map((sub) => (
                              <Link
                                key={sub.href}
                                href={localizeHref(sub.href)}
                                onClick={() => setIsConvertDropdownOpen(false)}
                                className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors group select-none"
                              >
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-medium text-[8.5px] shrink-0 group-hover:scale-105 transition-transform ${sub.badgeColor}`}>
                                  {sub.badge}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[11.5px] font-medium text-slate-700 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors tracking-tight truncate">
                                    {sub.name}
                                  </span>
                                  <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-normal leading-tight truncate">
                                    {sub.desc}
                                  </span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>

                        {/* Column 2: CONVERT FROM PDF */}
                        <div>
                          <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-100 dark:border-white/5 px-1 relative">
                            <div className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 bg-emerald-50/90 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20">
                              <ToolIcon icon="FileInput" className="w-3 h-3" />
                            </div>
                            <span className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 truncate">
                              {t('nav.convert_from_pdf', 'Convert from PDF')}
                            </span>
                            <div className="absolute -bottom-px left-0 w-6 h-[1.5px] rounded-full bg-emerald-500/80" />
                          </div>
                          <div className="space-y-0.5">
                            {convertPdfTools.fromPdf.map((sub) => (
                              <Link
                                key={sub.href}
                                href={localizeHref(sub.href)}
                                onClick={() => setIsConvertDropdownOpen(false)}
                                className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-white/[0.04] transition-colors group select-none"
                              >
                                <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-medium text-[8.5px] shrink-0 group-hover:scale-105 transition-transform ${sub.badgeColor}`}>
                                  {sub.badge}
                                </div>
                                <div className="flex flex-col min-w-0">
                                  <span className="text-[11.5px] font-medium text-slate-700 dark:text-slate-200 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors tracking-tight truncate">
                                    {sub.name}
                                  </span>
                                  <span className="text-[9.5px] text-slate-400 dark:text-slate-500 font-normal leading-tight truncate">
                                    {sub.desc}
                                  </span>
                                </div>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Bottom strip */}
                      <div className="mt-3.5 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between px-2 text-[11px]">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 font-normal text-[10.5px]">
                          <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400 shrink-0" />
                          <span>Image Converters:</span>
                          <Link 
                            href={localizeHref('/tools/heic-to-jpg-png-converter')} 
                            onClick={() => setIsConvertDropdownOpen(false)}
                            className="font-medium text-slate-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            HEIC
                          </Link>
                          <span>•</span>
                          <Link 
                            href={localizeHref('/tools/webp-to-jpg-png-converter')} 
                            onClick={() => setIsConvertDropdownOpen(false)}
                            className="font-medium text-slate-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400"
                          >
                            WebP
                          </Link>
                        </div>
                        <Link 
                          href={localizeHref('/categories/pdf-tools')} 
                          onClick={() => setIsConvertDropdownOpen(false)}
                          className="font-medium text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                        >
                          <span>All PDF Tools</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            if (item.isAllPdf) {
              const allPdfHrefs = allPdfCategories.flatMap(c => c.tools.map(t => t.href));
              const hasActiveSub = allPdfHrefs.some(href => pathname === localizeHref(href));
              return (
                <div className="relative" key={item.name} ref={pdfDropdownRef}>
                  <button
                    onClick={() => {
                      setIsPdfDropdownOpen(!isPdfDropdownOpen);
                      setIsConvertDropdownOpen(false);
                    }}
                    className={`h-8 px-2.5 min-[1150px]:px-3 xl:px-3.5 rounded-full text-[11px] min-[1200px]:text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap flex items-center gap-1 cursor-pointer select-none ${
                      isPdfDropdownOpen || hasActiveSub
                        ? 'bg-[#2563EB] text-white shadow-sm' 
                        : 'text-slate-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white hover:bg-white dark:hover:bg-white/5'
                    }`}
                  >
                    {item.name}
                    <ChevronDown className={`w-3 h-3 transition-transform duration-300 ${isPdfDropdownOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isPdfDropdownOpen && (
                    <div className="absolute left-1/2 -translate-x-[36%] min-[1350px]:-translate-x-1/2 top-full mt-2.5 w-[920px] min-[1300px]:w-[980px] max-w-[96vw] max-h-[85vh] overflow-y-auto rounded-3xl border border-gray-200/90 dark:border-white/10 bg-white dark:bg-[#090d16]/98 p-5 sm:p-6 shadow-2xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.85)] backdrop-blur-xl animate-fade-in z-50">
                      {/* Top Triangle Caret Pointer */}
                      <div className="absolute -top-1.5 left-[36%] min-[1350px]:left-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45 bg-white dark:bg-[#090d16] border-t border-l border-gray-200/90 dark:border-white/10" />

                      {/* Top subtle glow */}
                      <div className="absolute top-0 left-1/2 -translate-x-1/2 h-[1.5px] w-48 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />

                      {/* Top Bar: Brand, Counts & In-Browser Privacy Badge */}
                      <div className="flex flex-wrap items-center justify-between gap-3 pb-3.5 border-b border-gray-100 dark:border-white/5 relative z-10">
                        <div className="flex items-center gap-2.5">
                          <div className="w-7 h-7 rounded-xl bg-blue-600/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center font-black">
                            <Sparkles className="w-4 h-4" />
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-black tracking-tight text-gray-900 dark:text-white uppercase">
                              ToolWala PDF Studio
                            </span>
                            <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                              26 WASM Tools
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 dark:bg-emerald-500/15 border border-emerald-500/20 text-emerald-700 dark:text-emerald-400 text-[11px] font-bold">
                          <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                          <span>100% In-Browser Engine • Zero File Uploads</span>
                        </div>
                      </div>

                      {/* Interactive Category Filter Pills */}
                      <div className="flex items-center gap-1.5 py-3 border-b border-gray-100 dark:border-white/5 overflow-x-auto no-scrollbar relative z-10">
                        {[
                          { id: 'all', label: 'All Tools', count: 26 },
                          { id: 'organize', label: 'Organize', count: 5 },
                          { id: 'convert', label: 'Convert', count: 8 },
                          { id: 'edit', label: 'Edit & Sign', count: 5 },
                          { id: 'security', label: 'Security & Size', count: 6 },
                          { id: 'intelligence', label: 'AI & Smart', count: 3 },
                        ].map((tab) => (
                          <button
                            key={tab.id}
                            onClick={() => setPdfActiveFilter(tab.id as any)}
                            className={`px-3 py-1 rounded-full text-[10px] min-[1200px]:text-[11px] font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                              pdfActiveFilter === tab.id
                                ? 'bg-blue-600 text-white shadow-sm'
                                : 'bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-gray-400 hover:bg-slate-200 dark:hover:bg-white/10'
                            }`}
                          >
                            <span>{tab.label}</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded-full ${
                              pdfActiveFilter === tab.id
                                ? 'bg-white/20 text-white'
                                : 'bg-black/5 dark:bg-white/10 text-slate-500 dark:text-gray-400'
                            }`}>
                              {tab.count}
                            </span>
                          </button>
                        ))}
                      </div>

                      {/* Main Category Grid */}
                      {pdfActiveFilter === 'all' ? (
                        <div className="grid grid-cols-5 gap-3.5 min-[1350px]:gap-5 pt-3.5 relative z-10">
                          {allPdfCategories.map((cat) => (
                            <div key={cat.id} className="flex flex-col min-w-0">
                              <div className="flex items-center gap-1.5 pb-2 mb-2 border-b border-slate-100 dark:border-white/5 relative">
                                <div className={`w-5 h-5 rounded-md flex items-center justify-center shrink-0 ${cat.theme.iconBox}`}>
                                  <ToolIcon icon={cat.icon} className="w-3 h-3" />
                                </div>
                                <span className="text-[10.5px] font-semibold uppercase tracking-wider text-slate-600 dark:text-slate-300 truncate">
                                  {cat.label}
                                </span>
                                <div className={`absolute -bottom-px left-0 w-6 h-[1.5px] rounded-full ${cat.theme.indicator}`} />
                              </div>
                              <div className="space-y-0.5">
                                {cat.tools.map((sub) => {
                                  const isCurrent = pathname === localizeHref(sub.href);
                                  return (
                                    <Link
                                      key={sub.href}
                                      href={localizeHref(sub.href)}
                                      onClick={() => setIsPdfDropdownOpen(false)}
                                      className={`flex items-center justify-between px-1.5 py-1 rounded-lg ${cat.theme.hoverBg} transition-colors group select-none min-h-[28px] ${
                                        isCurrent ? 'bg-blue-50/70 dark:bg-blue-500/10 font-semibold' : ''
                                      }`}
                                    >
                                      <div className="flex items-center gap-1.5 min-w-0">
                                        <div className="w-5 h-5 rounded-md bg-slate-50 dark:bg-white/5 flex items-center justify-center shrink-0 border border-slate-100/80 dark:border-white/5 group-hover:border-slate-200 dark:group-hover:border-white/10 group-hover:scale-105 transition-all">
                                          <ToolIcon icon={sub.icon} className={`w-3 h-3 text-slate-400 dark:text-slate-500 ${cat.theme.toolHoverText} transition-colors`} />
                                        </div>
                                        <span className={`text-[11px] font-medium text-slate-700 dark:text-slate-200 ${cat.theme.toolHoverText} transition-colors truncate`}>
                                          {sub.name}
                                        </span>
                                      </div>
                                      {sub.badge && (
                                        <span className={`text-[8px] font-medium px-1.5 py-[1px] rounded uppercase tracking-wide shrink-0 ml-1 select-none transition-colors ${sub.badgeColor || 'bg-slate-100/80 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-white/5'}`}>
                                          {sub.badge}
                                        </span>
                                      )}
                                    </Link>
                                  );
                                })}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="pt-3.5 relative z-10">
                          {allPdfCategories
                            .filter((c) => c.id === pdfActiveFilter)
                            .map((cat) => (
                              <div key={cat.id}>
                                <div className="flex items-center justify-between mb-3 px-1">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${cat.theme.iconBox}`}>
                                      <ToolIcon icon={cat.icon} className="w-3.5 h-3.5" />
                                    </div>
                                    <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                                      {cat.label} ({cat.tools.length} Tools)
                                    </h4>
                                  </div>
                                  <button
                                    onClick={() => setPdfActiveFilter('all')}
                                    className="text-[11px] font-medium text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                                  >
                                    ← View All Categories
                                  </button>
                                </div>
                                <div className="grid grid-cols-2 min-[1250px]:grid-cols-3 gap-2.5">
                                  {cat.tools.map((sub) => (
                                    <Link
                                      key={sub.href}
                                      href={localizeHref(sub.href)}
                                      onClick={() => setIsPdfDropdownOpen(false)}
                                      className={`flex items-start gap-3 p-2.5 rounded-xl bg-slate-50/60 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 ${cat.theme.hoverBg} hover:bg-white dark:hover:bg-white/[0.05] transition-all group`}
                                    >
                                      <div className="w-7 h-7 rounded-lg bg-slate-100 dark:bg-white/5 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform mt-0.5">
                                        <ToolIcon icon={sub.icon} className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 ${cat.theme.toolHoverText} transition-colors`} />
                                      </div>
                                      <div className="flex flex-col min-w-0">
                                        <div className="flex items-center gap-1.5">
                                          <span className={`text-xs font-medium text-slate-700 dark:text-slate-200 ${cat.theme.toolHoverText} transition-colors truncate`}>
                                            {sub.name}
                                          </span>
                                          {sub.badge && (
                                            <span className={`text-[8px] font-medium px-1.5 py-[1px] rounded uppercase shrink-0 ${sub.badgeColor || 'bg-slate-100/80 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-white/5'}`}>
                                              {sub.badge}
                                            </span>
                                          )}
                                        </div>
                                        {sub.desc && (
                                          <span className="text-[10px] text-slate-500 dark:text-gray-400 mt-0.5">
                                            {sub.desc}
                                          </span>
                                        )}
                                      </div>
                                    </Link>
                                  ))}
                                </div>
                              </div>
                            ))}
                        </div>
                      )}

                      {/* Bottom Strip: Privacy Guarantee & Category Directory Link */}
                      <div className="mt-4 pt-3.5 border-t border-slate-100 dark:border-white/5 flex items-center justify-between px-1 text-[11px] relative z-10">
                        <div className="flex items-center gap-2 text-slate-500 dark:text-gray-400 font-medium text-[10.5px]">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                          <span>Client-Side Sandbox: Files stay 100% on your machine & never upload to any cloud.</span>
                        </div>
                        <Link 
                          href={localizeHref('/categories/pdf-tools')} 
                          onClick={() => setIsPdfDropdownOpen(false)}
                          className="font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 shrink-0 ml-2"
                        >
                          <span>Explore PDF Category</span>
                          <ArrowRight className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              );
            }

            const localizedHrefValue = localizeHref(item.href);
            const isActive = pathname === localizedHrefValue || 
              (item.href !== '/' && pathname?.startsWith(localizedHrefValue));
            return (
              <Link 
                key={item.name} 
                href={localizedHrefValue} 
                className={`h-8 flex items-center px-2.5 min-[1150px]:px-3 xl:px-3.5 rounded-full text-[11px] min-[1200px]:text-xs font-semibold uppercase tracking-wider transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-[#2563EB] text-white shadow-sm' 
                    : 'text-slate-700 dark:text-gray-300 hover:text-blue-600 dark:hover:text-white hover:bg-white dark:hover:bg-white/5'
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="hidden lg:flex items-center gap-1.5 xl:gap-2.5 shrink-0">
          {/* Theme Toggle Button */}
          <ThemeToggle />

          {/* Custom Premium Language Dropdown */}
          <div className="relative" ref={langDropdownRef}>
            <button
              onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
              className="h-9 flex items-center gap-1 xl:gap-1.5 px-2.5 xl:px-3 rounded-full bg-slate-100/80 dark:bg-white/5 hover:bg-slate-200/80 dark:hover:bg-white/10 text-[11px] min-[1100px]:text-xs font-bold text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white border border-slate-200/80 dark:border-white/10 hover:border-blue-500/30 transition-all select-none cursor-pointer whitespace-nowrap shrink-0"
            >
              <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-500" />
              <span translate="no" className="whitespace-nowrap">{currentLanguage.flag} {currentLanguage.name}</span>
              <ChevronDown className={`w-3 h-3 text-gray-500 transition-transform duration-300 ${isLangDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {isLangDropdownOpen && (
              <div className="absolute right-0 top-full mt-2 w-56 rounded-2xl border border-gray-200 dark:border-white/10 bg-white dark:bg-[#090d16]/98 p-2.5 shadow-xl dark:shadow-[0_10px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl animate-fade-in z-50">
                <div className="absolute top-0 right-8 h-[1px] w-12 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
                <div className="text-[9px] font-black uppercase tracking-widest text-gray-500 px-3.5 py-2">{t('nav.select_language', 'Select Language')}</div>
                <div className="space-y-1">
                  {activeLanguages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        handleLanguageChange(lang.code);
                        setIsLangDropdownOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        locale === lang.code
                          ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20'
                          : 'text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white hover:bg-black/5 dark:hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <span className="flex items-center gap-2.5">
                        <span className="text-base leading-none">{lang.flag}</span>
                        <span translate="no">{lang.name}</span>
                      </span>
                      {locale === lang.code && <span className="h-1.5 w-1.5 rounded-full bg-blue-600 dark:bg-blue-500" />}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <Link 
            href={localizeHref('/tools')} 
            className="h-9 group relative flex items-center gap-1.5 rounded-full bg-blue-600 text-white hover:bg-blue-700 dark:bg-white dark:text-black dark:hover:bg-gray-100 px-3.5 xl:px-5 text-xs xl:text-[13px] font-bold shadow-sm hover:brightness-105 active:scale-95 transition-all duration-150 overflow-hidden whitespace-nowrap shrink-0"
          >
            <Rocket className="w-3.5 h-3.5 relative z-10" suppressHydrationWarning />
            <span className="relative z-10 whitespace-nowrap">{t('nav.start_free', 'Start Free')}</span>
          </Link>
        </div>
 
        {/* Mobile menu button */}
        <div className="lg:hidden flex items-center gap-2">
          {/* Theme Toggle Button for Mobile */}
          <ThemeToggle />

          {/* Quick Lang Indicator for mobile */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 text-sm leading-none shrink-0"
          >
            {currentLanguage.flag}
          </button>
          
          <button
            type="button"
            className="text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 focus:outline-none p-2 bg-black/5 dark:bg-white/5 rounded-lg border border-black/10 dark:border-white/10 backdrop-blur-md transition-all h-9 w-9 flex items-center justify-center shrink-0"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            <span className="sr-only">Open main menu</span>
            {isMobileMenuOpen ? (
              <X className="h-4 w-4" aria-hidden="true" suppressHydrationWarning />
            ) : (
              <Menu className="h-4 w-4" aria-hidden="true" suppressHydrationWarning />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Navigation */}
      {isMobileMenuOpen && (
        <div className="lg:hidden fixed inset-x-0 top-[60px] bottom-0 z-[9999] bg-white dark:bg-[#030712] border-t border-gray-200 dark:border-white/5 overflow-y-auto pb-20 animate-fade-in">
          <div className="flex flex-col p-6 gap-4">
            {navigation.map((item) => {
              if (item.isConvert) {
                return (
                  <div className="space-y-2" key={item.name}>
                    <button
                      onClick={() => setIsMobileConvertOpen(!isMobileConvertOpen)}
                      className="w-full flex items-center justify-between p-4.5 rounded-2xl text-lg font-black bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-gray-900 dark:text-white"
                    >
                      <span>{item.name}</span>
                      <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isMobileConvertOpen ? 'rotate-180 text-blue-600 dark:text-blue-500' : ''}`} />
                    </button>
                    {isMobileConvertOpen && (
                      <div className="space-y-4 p-3.5 bg-black/5 dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-2xl animate-fade-in">
                        <div>
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 px-1">
                            <div className="w-4 h-4 rounded flex items-center justify-center shrink-0 bg-blue-50/90 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-500/20">
                              <ToolIcon icon="FileOutput" className="w-2.5 h-2.5" />
                            </div>
                            <span>{t('nav.convert_to_pdf', 'Convert to PDF')}</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {convertPdfTools.toPdf.map((sub) => (
                              <Link
                                key={sub.href}
                                href={localizeHref(sub.href)}
                                onClick={() => {
                                  setIsMobileMenuOpen(false);
                                  setIsMobileConvertOpen(false);
                                }}
                                className="flex items-center gap-2.5 p-2 rounded-xl bg-black/[0.03] dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 transition-all"
                              >
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-medium text-[8px] shrink-0 ${sub.badgeColor}`}>
                                  {sub.badge}
                                </div>
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                                  {sub.name}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>

                        <div className="pt-2 border-t border-black/5 dark:border-white/5">
                          <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 px-1">
                            <div className="w-4 h-4 rounded flex items-center justify-center shrink-0 bg-emerald-50/90 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-500/20">
                              <ToolIcon icon="FileInput" className="w-2.5 h-2.5" />
                            </div>
                            <span>{t('nav.convert_from_pdf', 'Convert from PDF')}</span>
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {convertPdfTools.fromPdf.map((sub) => (
                              <Link
                                key={sub.href}
                                href={localizeHref(sub.href)}
                                onClick={() => {
                                  setIsMobileMenuOpen(false);
                                  setIsMobileConvertOpen(false);
                                }}
                                className="flex items-center gap-2.5 p-2 rounded-xl bg-black/[0.03] dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 transition-all"
                              >
                                <div className={`w-6 h-6 rounded-lg flex items-center justify-center font-medium text-[8px] shrink-0 ${sub.badgeColor}`}>
                                  {sub.badge}
                                </div>
                                <span className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                                  {sub.name}
                                </span>
                              </Link>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              }
              if (item.isAllPdf) {
                return (
                  <div className="space-y-2" key={item.name}>
                    <button
                      onClick={() => setIsMobilePdfOpen(!isMobilePdfOpen)}
                      className="w-full flex items-center justify-between p-4.5 rounded-2xl text-lg font-black bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 text-gray-900 dark:text-white"
                    >
                      <div className="flex items-center gap-2">
                        <span>{item.name}</span>
                        <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          26 Tools
                        </span>
                      </div>
                      <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform ${isMobilePdfOpen ? 'rotate-180 text-blue-600 dark:text-blue-500' : ''}`} />
                    </button>
                    {isMobilePdfOpen && (
                      <div className="space-y-4 p-3.5 bg-black/5 dark:bg-black/20 border border-black/5 dark:border-white/5 rounded-2xl animate-fade-in">
                        {allPdfCategories.map((cat) => (
                          <div key={cat.id}>
                            <div className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-2 px-1">
                              <div className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${cat.theme.iconBox}`}>
                                <ToolIcon icon={cat.icon} className="w-2.5 h-2.5" />
                              </div>
                              <span>{cat.label}</span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                              {cat.tools.map((sub) => (
                                <Link
                                  key={sub.href}
                                  href={localizeHref(sub.href)}
                                  onClick={() => {
                                    setIsMobileMenuOpen(false);
                                    setIsMobilePdfOpen(false);
                                  }}
                                  className="flex items-center justify-between p-2 rounded-xl bg-black/[0.03] dark:bg-white/5 hover:bg-black/5 dark:hover:bg-white/10 transition-all"
                                >
                                  <div className="flex items-center gap-2 min-w-0">
                                    <ToolIcon icon={sub.icon} className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 shrink-0" />
                                    <span className="text-xs font-medium text-slate-700 dark:text-slate-200 truncate">
                                      {sub.name}
                                    </span>
                                  </div>
                                  {sub.badge && (
                                    <span className={`text-[8px] font-medium px-1.5 py-[1px] rounded uppercase shrink-0 ${sub.badgeColor || 'bg-slate-100/80 dark:bg-white/5 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-white/5'}`}>
                                      {sub.badge}
                                    </span>
                                  )}
                                </Link>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              }

              const localizedHrefValue = localizeHref(item.href);
              const isActive = pathname === localizedHrefValue || 
                (item.href !== '/' && pathname?.startsWith(localizedHrefValue));
              return (
                <Link
                  key={item.name}
                  href={localizedHrefValue}
                  className={`flex items-center justify-between p-4.5 rounded-2xl text-lg font-black transition-all ${
                    isActive
                      ? 'bg-blue-600/10 text-blue-600 dark:text-blue-500 border border-blue-500/20' 
                      : 'text-gray-900 dark:text-white bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5'
                  }`}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  {item.name}
                  <Sparkles className={`w-4 h-4 ${isActive ? 'text-blue-600 dark:text-blue-500' : 'text-transparent'}`} suppressHydrationWarning />
                </Link>
              );
            })}

            {/* Mobile Company & Trust Links (Privacy Hub, About, Contact) */}
            <div className="mt-2 pt-3 border-t border-gray-200/80 dark:border-white/5 space-y-2">
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 px-1">
                {t('nav.company_and_trust', 'Company & Trust')}
              </div>
              <div className="grid grid-cols-1 gap-2">
                {secondaryNavigation.map((sec) => {
                  const localizedHrefValue = localizeHref(sec.href);
                  const isActive = pathname === localizedHrefValue || 
                    (sec.href !== '/' && pathname?.startsWith(localizedHrefValue));
                  return (
                    <Link
                      key={sec.name}
                      href={localizedHrefValue}
                      className={`flex items-center justify-between p-3.5 rounded-2xl font-bold text-sm transition-all ${
                        isActive
                          ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 border border-blue-500/20' 
                          : 'text-gray-800 dark:text-gray-200 bg-black/5 dark:bg-white/5 border border-black/5 dark:border-white/5 hover:border-blue-500/30'
                      }`}
                      onClick={() => setIsMobileMenuOpen(false)}
                    >
                      <div className="flex items-center gap-2.5">
                        {sec.icon === 'ShieldCheck' && <ShieldCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                        {sec.icon === 'Sparkles' && <Sparkles className="w-4 h-4 text-amber-500" />}
                        {sec.icon === 'Mail' && <Mail className="w-4 h-4 text-emerald-500" />}
                        <span>{sec.name}</span>
                      </div>
                      {sec.href === '/privacy' && (
                        <span className="text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20">
                          100% In-Browser
                        </span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </div>

            {/* Mobile Language Selector Grid */}
            <div className="mt-4 p-5 rounded-2xl bg-black/5 dark:bg-white/[0.01] border border-black/5 dark:border-white/5 space-y-4">
              <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-blue-600 dark:text-blue-500" /> {t('nav.select_language', 'Select Language')}
              </div>
              <div className="grid grid-cols-2 gap-2">
                {activeLanguages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => {
                      handleLanguageChange(lang.code);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`flex items-center gap-2 p-3 rounded-xl text-xs font-bold transition-all cursor-pointer border ${
                      locale === lang.code
                        ? 'bg-blue-600/10 text-blue-600 dark:text-blue-400 border-blue-500/20 shadow-sm'
                        : 'bg-black/5 dark:bg-white/5 text-gray-600 dark:text-gray-400 border-transparent hover:text-gray-900 dark:hover:text-white'
                    }`}
                  >
                    <span className="text-base leading-none">{lang.flag}</span>
                    <span className="truncate" translate="no">{lang.name}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-white/5">
              <Link 
                href={localizeHref('/tools')} 
                className="flex items-center justify-center gap-3 rounded-2xl bg-blue-600 p-4.5 text-lg font-black text-white shadow-lg active:scale-[0.98] transition-all"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <Rocket className="w-5 h-5" suppressHydrationWarning />
                {t('nav.get_started_free', 'Get Started Free')}
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

