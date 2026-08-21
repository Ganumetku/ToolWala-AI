"use client";

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { 
  Eye, Sparkles, Upload, Copy, CheckCircle, 
  Trash2, RefreshCw, Volume2, VolumeX, ShieldCheck, 
  Tag, Compass, Image as ImageIcon, ChevronLeft, 
  SlidersHorizontal, Globe, FileText, Share2, Layers, AlertCircle
} from 'lucide-react';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

type AnalysisMode = 'comprehensive' | 'social' | 'seo_alt' | 'ai_prompt' | 'ecommerce';
type OutputLanguage = 'English' | 'Hindi' | 'Hinglish' | 'Spanish' | 'French' | 'German' | 'Arabic' | 'Indonesian';

interface AnalysisResult {
  title: string;
  detailedDescription: string;
  conciseSummary: string;
  detectedElements: {
    subjects: string[];
    apparel_and_objects: string[];
    colors: string[];
    setting_and_environment: string[];
  };
  seoAltText: string;
  aiPrompt: string;
  socialCaptions: string[];
  hashtags: string[];
  moodAndLighting: string;
}

export default function AiImageDescriber() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [analysisMode, setAnalysisMode] = useState<AnalysisMode>('comprehensive');
  const [language, setLanguage] = useState<OutputLanguage>('English');
  const [customFocus, setCustomFocus] = useState<string>('');
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [activeTab, setActiveTab] = useState<'detailed' | 'seo' | 'prompt' | 'social'>('detailed');

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dropZoneRef = useRef<HTMLDivElement>(null);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        window.speechSynthesis.cancel();
      }
    };
  }, []);

  const handleImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file (JPEG, PNG, WebP).');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('Image size should be less than 10MB.');
      return;
    }

    setError(null);
    setImageFile(file);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleImageFile(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file) handleImageFile(file);
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.startsWith('image/')) {
        const file = items[i].getAsFile();
        if (file) {
          handleImageFile(file);
          break;
        }
      }
    }
  };

  const clearImage = () => {
    setImageFile(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsPlayingAudio(false);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Copied to clipboard!');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const toggleSpeech = (text: string) => {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      toast.error('Text-to-speech is not supported on this browser.');
      return;
    }

    if (isPlayingAudio) {
      window.speechSynthesis.cancel();
      setIsPlayingAudio(false);
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    if (language === 'Hindi') utterance.lang = 'hi-IN';
    else if (language === 'Spanish') utterance.lang = 'es-ES';
    else if (language === 'French') utterance.lang = 'fr-FR';
    else if (language === 'German') utterance.lang = 'de-DE';
    else utterance.lang = 'en-US';

    utterance.onend = () => setIsPlayingAudio(false);
    utterance.onerror = () => setIsPlayingAudio(false);

    setIsPlayingAudio(true);
    window.speechSynthesis.speak(utterance);
  };

  const handleAnalyze = async () => {
    if (!imagePreview) {
      setError('Please upload or paste an image first.');
      return;
    }

    setError(null);
    setIsAnalyzing(true);
    setResult(null);

    try {
      const promptTemplate = `You are a world-class AI Computer Vision and Scene Analysis Expert.
Analyze the attached image thoroughly and generate structured scene insights according to these parameters:

Preferred Mode: ${analysisMode}
Output Language: ${language} (Note: If language is Hinglish, write natural Latin-script Hindi mixed with English)
Custom User Note / Focus: ${customFocus.trim() || 'General detailed visual breakdown'}

Respond STRICTLY with a valid JSON object matching this exact JSON schema (without markdown fences or extra text):
{
  "title": "Short descriptive title of the image (e.g. Young Man in Pink Checkered Shirt Outdoors)",
  "detailedDescription": "A rich, comprehensive narrative describing what is in the photo, including subjects, their actions, clothing/apparel, specific patterns, background objects, greenery/buildings, colors, lighting, and overall atmosphere.",
  "conciseSummary": "A punchy 1-2 sentence executive summary of the image.",
  "detectedElements": {
    "subjects": ["Person / Object 1", "Subject 2"],
    "apparel_and_objects": ["Pink Checkered Button-down Shirt", "Light Blue Denim Jeans", "Walkway", "Trees", "Commercial Building"],
    "colors": ["Pink", "White", "Denim Blue", "Green", "Urban Grey"],
    "setting_and_environment": ["Outdoor pedestrian street", "Daylight", "Urban park backdrop"]
  },
  "seoAltText": "Accurate, SEO-friendly HTML image alt text (e.g. Young man in pink checkered shirt and blue jeans standing outdoors).",
  "aiPrompt": "Highly descriptive text-to-image prompt (Midjourney/Flux style) with photographic lighting and composition tags to recreate this scene.",
  "socialCaptions": [
    "Viral caption 1 with emojis...",
    "Aesthetic caption 2...",
    "Engaging question caption 3..."
  ],
  "hashtags": ["#outfit", "#streetstyle", "#portrait", "#vibes", "#dailylook", "#fashion"],
  "moodAndLighting": "Bright natural daylight, relaxed casual mood, soft background depth-of-field."
}`;

      const res = await fetch('/api/ai/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          slug: 'ai-image-describer',
          imageBase64: imagePreview,
          inputs: {
            mode: analysisMode,
            language: language,
            customFocus: customFocus.trim()
          },
          promptTemplate
        })
      });

      if (!res.ok) {
        throw new Error('AI Vision request failed');
      }

      const resData = await res.json();
      if (!resData.success || !resData.output) {
        throw new Error(resData.error || 'Failed to analyze image');
      }

      const parsed = parseVisionJson(resData.output);
      setResult(parsed);
      toast.success('Image analyzed successfully!');
    } catch (err: any) {
      console.error('Vision analysis error:', err);
      setError(err?.message || 'Failed to analyze image. Please try again.');
      toast.error('AI Vision error. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  function parseVisionJson(rawText: string): AnalysisResult {
    let cleaned = rawText.trim();
    
    // 1. Remove markdown codeblocks if present
    if (cleaned.includes('```')) {
      const match = cleaned.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (match && match[1]) {
        cleaned = match[1].trim();
      } else {
        cleaned = cleaned.replace(/^```[a-zA-Z]*\n?/, '').replace(/\n?```$/, '').trim();
      }
    }

    // 2. Try standard JSON.parse
    try {
      const parsed = JSON.parse(cleaned);
      return normalizeResult(parsed, cleaned);
    } catch (e1) {
      // 3. Try to extract JSON object between outer brackets
      const firstIdx = cleaned.indexOf('{');
      const lastIdx = cleaned.lastIndexOf('}');
      if (firstIdx !== -1 && lastIdx > firstIdx) {
        try {
          const sliced = cleaned.slice(firstIdx, lastIdx + 1);
          const parsed = JSON.parse(sliced);
          return normalizeResult(parsed, cleaned);
        } catch (e2) {
          // Fall through to regex extraction
        }
      }

      // 4. Regex extraction for resilient partial JSON recovery
      const extractString = (field: string): string => {
        const regex = new RegExp(`"${field}"\\s*:\\s*"((?:[^"\\\\]|\\\\.)*)"`, 's');
        const m = cleaned.match(regex);
        return m ? m[1].replace(/\\n/g, '\n').replace(/\\"/g, '"').trim() : '';
      };

      const extractArray = (field: string): string[] => {
        const regex = new RegExp(`"${field}"\\s*:\\s*\\[([^\\]]*)\\]`, 's');
        const m = cleaned.match(regex);
        if (!m) return [];
        return m[1]
          .split(',')
          .map((s) => s.replace(/["'\r\n\t]/g, '').trim())
          .filter(Boolean);
      };

      const title = extractString('title') || 'Scene Visual Analysis';
      const detailedDescription = extractString('detailedDescription') || cleaned.replace(/[{}[\]"]/g, '').trim();
      const conciseSummary = extractString('conciseSummary') || (detailedDescription ? detailedDescription.slice(0, 140) : '');
      const seoAltText = extractString('seoAltText') || title;
      const aiPrompt = extractString('aiPrompt') || title;
      const moodAndLighting = extractString('moodAndLighting') || 'Natural daylight';

      return {
        title,
        detailedDescription: detailedDescription || 'Visual analysis completed.',
        conciseSummary: conciseSummary || detailedDescription.slice(0, 120),
        detectedElements: {
          subjects: extractArray('subjects').length > 0 ? extractArray('subjects') : ['Detected Subject'],
          apparel_and_objects: extractArray('apparel_and_objects'),
          colors: extractArray('colors'),
          setting_and_environment: extractArray('setting_and_environment')
        },
        seoAltText: seoAltText || title,
        aiPrompt: aiPrompt || title,
        socialCaptions: extractArray('socialCaptions').length > 0 ? extractArray('socialCaptions') : [detailedDescription.slice(0, 100)],
        hashtags: extractArray('hashtags').length > 0 ? extractArray('hashtags') : ['#photo', '#vibe', '#portrait', '#ai'],
        moodAndLighting
      };
    }
  }

  function normalizeResult(raw: any, fallbackText: string): AnalysisResult {
    return {
      title: raw.title || 'Scene Visual Analysis',
      detailedDescription: raw.detailedDescription || fallbackText || 'Image analyzed.',
      conciseSummary: raw.conciseSummary || (raw.detailedDescription ? String(raw.detailedDescription).slice(0, 140) : ''),
      detectedElements: {
        subjects: Array.isArray(raw.detectedElements?.subjects) ? raw.detectedElements.subjects : [],
        apparel_and_objects: Array.isArray(raw.detectedElements?.apparel_and_objects) ? raw.detectedElements.apparel_and_objects : [],
        colors: Array.isArray(raw.detectedElements?.colors) ? raw.detectedElements.colors : [],
        setting_and_environment: Array.isArray(raw.detectedElements?.setting_and_environment) ? raw.detectedElements.setting_and_environment : []
      },
      seoAltText: raw.seoAltText || raw.title || 'Image description',
      aiPrompt: raw.aiPrompt || raw.title || 'Photographic portrait',
      socialCaptions: Array.isArray(raw.socialCaptions) ? raw.socialCaptions : [],
      hashtags: Array.isArray(raw.hashtags) ? raw.hashtags : [],
      moodAndLighting: raw.moodAndLighting || 'Natural lighting'
    };
  }

  return (
    <div className="min-h-screen bg-[#F7F8FC] dark:bg-[#030712] text-[#0F172A] dark:text-white py-8 sm:py-12 transition-colors duration-250" onPaste={handlePaste}>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        
        {/* Navigation Breadcrumb */}
        <div className="mb-6 flex items-center gap-2 text-xs font-semibold text-gray-500 dark:text-gray-400">
          <Link href="/tools" className="hover:text-blue-600 dark:hover:text-blue-400 flex items-center gap-1 transition-colors">
            <ChevronLeft className="w-4 h-4" /> All Tools
          </Link>
          <span>/</span>
          <span className="text-gray-900 dark:text-white">AI Image Describer</span>
        </div>

        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 dark:bg-purple-500/10 text-purple-600 dark:text-purple-400 text-xs font-black uppercase tracking-widest border border-purple-200 dark:border-purple-500/20 mb-4 shadow-sm">
            <Eye className="w-3.5 h-3.5" />
            AI Computer Vision & Scene Detection
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-gray-900 dark:text-white mb-4">
            AI Image Describer & Scene Analyzer
          </h1>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 font-medium leading-relaxed">
            Upload any image to automatically detect subjects, clothing, objects, scene environment, SEO alt-text, and viral captions in seconds.
          </p>
        </div>

        {/* Main Interactive Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          
          {/* Left Column: Image Input & Settings (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Upload Zone Card */}
            <div className="p-6 rounded-3xl bg-white dark:bg-[#090d16] border border-[#E8ECF4] dark:border-white/5 shadow-sm space-y-5">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  Source Image
                </h3>
                {imagePreview && (
                  <button
                    onClick={clearImage}
                    className="text-[11px] font-bold text-red-500 hover:text-red-600 flex items-center gap-1 cursor-pointer transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove
                  </button>
                )}
              </div>

              {/* Dropzone */}
              {!imagePreview ? (
                <div
                  ref={dropZoneRef}
                  onDragOver={handleDragOver}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-300 dark:border-white/10 hover:border-blue-500 dark:hover:border-blue-500/50 rounded-2xl p-8 text-center cursor-pointer transition-all duration-200 bg-gray-50/50 dark:bg-white/[0.01] hover:bg-blue-50/30 dark:hover:bg-blue-900/10 group"
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleFileChange}
                  />
                  <div className="w-14 h-14 rounded-2xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white mb-1">
                    Click to upload or drag & drop photo
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    JPEG, PNG, WebP up to 10MB • Or press <kbd className="px-1.5 py-0.5 rounded bg-gray-200 dark:bg-white/10 text-[10px] font-mono">Ctrl+V</kbd> to paste
                  </p>
                </div>
              ) : (
                <div className="relative rounded-2xl overflow-hidden border border-gray-200 dark:border-white/10 bg-black/5 dark:bg-black/40 group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={imagePreview}
                    alt="Uploaded preview"
                    className="w-full max-h-[340px] object-contain mx-auto"
                  />
                </div>
              )}

              {/* Analysis Settings */}
              <div className="space-y-4 pt-2 border-t border-gray-100 dark:border-white/5">
                
                {/* Mode Selector */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                    Analysis Focus
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: 'comprehensive', label: 'Full Breakdown', icon: Compass },
                      { id: 'social', label: 'Social & Captions', icon: Sparkles },
                      { id: 'seo_alt', label: 'SEO Alt-Text', icon: Globe },
                      { id: 'ai_prompt', label: 'AI Art Prompt', icon: Layers }
                    ].map((m) => {
                      const Icon = m.icon;
                      return (
                        <button
                          key={m.id}
                          type="button"
                          onClick={() => setAnalysisMode(m.id as AnalysisMode)}
                          className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-bold transition-all text-left ${
                            analysisMode === m.id
                              ? 'bg-blue-50 dark:bg-blue-600/20 border-blue-500 text-blue-600 dark:text-blue-400 shadow-sm'
                              : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/5 text-gray-700 dark:text-gray-400 hover:border-gray-300 dark:hover:border-white/10'
                          }`}
                        >
                          <Icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{m.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Language Selector */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                    Output Language
                  </label>
                  <select
                    value={language}
                    onChange={(e) => setLanguage(e.target.value as OutputLanguage)}
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-3 text-xs font-bold text-gray-900 dark:text-white outline-none focus:border-blue-500"
                  >
                    <option value="English">English</option>
                    <option value="Hinglish">Hinglish (Hindi in English Script)</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="Spanish">Spanish (Español)</option>
                    <option value="French">French (Français)</option>
                    <option value="German">German (Deutsch)</option>
                    <option value="Arabic">Arabic (العربية)</option>
                    <option value="Indonesian">Indonesian (Bahasa)</option>
                  </select>
                </div>

                {/* Optional Custom Note */}
                <div>
                  <label className="block text-[11px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
                    Specific Focus / Question (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Focus on the shirt details, background, or brand logo..."
                    value={customFocus}
                    onChange={(e) => setCustomFocus(e.target.value)}
                    className="w-full rounded-xl border border-gray-200 dark:border-white/10 bg-gray-50 dark:bg-white/5 p-3 text-xs font-medium text-gray-900 dark:text-white placeholder:text-gray-400 outline-none focus:border-blue-500"
                  />
                </div>

                {/* Error Banner */}
                {error && (
                  <div className="p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-xs font-bold text-red-600 dark:text-red-400 flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                {/* Submit Action Button */}
                <button
                  type="button"
                  onClick={handleAnalyze}
                  disabled={isAnalyzing || !imagePreview}
                  className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest text-white shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer ${
                    isAnalyzing || !imagePreview
                      ? 'bg-gray-400 dark:bg-gray-700 cursor-not-allowed opacity-60'
                      : 'bg-gradient-to-r from-[#2563EB] to-[#7C3AED] hover:from-blue-600 hover:to-purple-700 active:scale-[0.99] shadow-blue-500/20 hover:shadow-blue-500/40'
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Analyzing with Vision AI...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      Analyze Image with AI
                    </>
                  )}
                </button>

                {/* Privacy Badge */}
                <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-gray-500 dark:text-gray-400 text-center pt-1">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Secure In-Memory Vision • Zero Storage Retention</span>
                </div>

              </div>
            </div>

          </div>

          {/* Right Column: Results & Breakdown (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {result ? (
              <div className="space-y-6 animate-fade-in">
                
                {/* Result Title & Tab Bar */}
                <div className="p-6 rounded-3xl bg-white dark:bg-[#090d16] border border-[#E8ECF4] dark:border-white/5 shadow-sm space-y-5">
                  
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100 dark:border-white/5">
                    <div>
                      <span className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400">
                        Scene Title
                      </span>
                      <h2 className="text-lg sm:text-xl font-black text-gray-900 dark:text-white mt-0.5">
                        {result.title}
                      </h2>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleSpeech(result.detailedDescription)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                          isPlayingAudio
                            ? 'bg-red-50 dark:bg-red-500/10 border-red-300 text-red-600 dark:text-red-400'
                            : 'bg-gray-50 dark:bg-white/5 border-gray-200 dark:border-white/10 hover:border-blue-500 text-gray-700 dark:text-gray-300'
                        }`}
                        title="Listen to description"
                      >
                        {isPlayingAudio ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5" />}
                        <span>{isPlayingAudio ? 'Stop Audio' : 'Listen'}</span>
                      </button>

                      <button
                        onClick={() => copyToClipboard(result.detailedDescription, 'main_desc')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 hover:border-blue-500 bg-gray-50 dark:bg-white/5 text-xs font-bold text-gray-700 dark:text-gray-300 transition-all cursor-pointer"
                      >
                        {copiedKey === 'main_desc' ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        <span>{copiedKey === 'main_desc' ? 'Copied' : 'Copy'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Navigation Tabs */}
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'detailed', label: 'Detailed Description' },
                      { id: 'seo', label: 'SEO Alt-Text' },
                      { id: 'prompt', label: 'AI Art Prompt' },
                      { id: 'social', label: 'Social Captions' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as any)}
                        className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                          activeTab === tab.id
                            ? 'bg-blue-600 text-white shadow-md'
                            : 'bg-gray-100 dark:bg-white/5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  {/* Tab Content */}
                  <div className="pt-2">
                    {activeTab === 'detailed' && (
                      <div className="space-y-4">
                        <div className="p-4.5 rounded-2xl bg-slate-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 text-sm sm:text-base leading-relaxed text-gray-800 dark:text-gray-200 font-medium">
                          {result.detailedDescription}
                        </div>

                        {result.conciseSummary && (
                          <div className="p-3.5 rounded-xl bg-blue-50/50 dark:bg-blue-600/10 border border-blue-100 dark:border-blue-500/20 text-xs font-medium text-blue-900 dark:text-blue-300">
                            <span className="font-bold uppercase tracking-wider text-[10px] block text-blue-600 dark:text-blue-400 mb-1">
                              Quick Summary:
                            </span>
                            {result.conciseSummary}
                          </div>
                        )}
                      </div>
                    )}

                    {activeTab === 'seo' && (
                      <div className="space-y-3">
                        <div className="p-4 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-gray-500">
                              HTML Alt Tag
                            </span>
                            <button
                              onClick={() => copyToClipboard(result.seoAltText, 'alt_text')}
                              className="text-xs text-blue-600 dark:text-blue-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              {copiedKey === 'alt_text' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              Copy Alt Tag
                            </button>
                          </div>
                          <code className="block p-3 rounded-xl bg-white dark:bg-black/30 border border-gray-200 dark:border-white/10 text-xs font-mono text-gray-900 dark:text-white select-all">
                            alt=&quot;{result.seoAltText}&quot;
                          </code>
                          <p className="text-xs text-gray-500 dark:text-gray-400 font-semibold">
                            Use this alt tag in your HTML, WordPress, Shopify, or blog images for optimal SEO and WCAG screen reader accessibility.
                          </p>
                        </div>
                      </div>
                    )}

                    {activeTab === 'prompt' && (
                      <div className="space-y-3">
                        <div className="p-4 rounded-2xl bg-purple-50/50 dark:bg-purple-950/10 border border-purple-100 dark:border-purple-500/20 space-y-3">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                              Reverse AI Generation Prompt (Midjourney / Flux / DALL-E)
                            </span>
                            <button
                              onClick={() => copyToClipboard(result.aiPrompt, 'prompt_copy')}
                              className="text-xs text-purple-600 dark:text-purple-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              {copiedKey === 'prompt_copy' ? <CheckCircle className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                              Copy Prompt
                            </button>
                          </div>
                          <p className="text-xs sm:text-sm font-mono text-gray-800 dark:text-gray-200 leading-relaxed bg-white dark:bg-black/30 p-3 rounded-xl border border-purple-200 dark:border-purple-500/20 select-all">
                            {result.aiPrompt}
                          </p>
                        </div>
                      </div>
                    )}

                    {activeTab === 'social' && (
                      <div className="space-y-3">
                        {result.socialCaptions?.map((caption, idx) => (
                          <div
                            key={idx}
                            className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/[0.02] border border-gray-200 dark:border-white/10 flex items-start justify-between gap-3 group hover:border-blue-500/40 transition-all"
                          >
                            <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 font-medium whitespace-pre-line flex-1">
                              {caption}
                            </p>
                            <button
                              onClick={() => copyToClipboard(caption, `caption_${idx}`)}
                              className="p-1.5 rounded-lg text-gray-400 hover:text-blue-600 dark:hover:text-white transition-colors cursor-pointer shrink-0"
                            >
                              {copiedKey === `caption_${idx}` ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                </div>

                {/* Detected Objects & Elements Card */}
                {result.detectedElements && (
                  <div className="p-6 rounded-3xl bg-white dark:bg-[#090d16] border border-[#E8ECF4] dark:border-white/5 shadow-sm space-y-4">
                    <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 dark:text-white flex items-center gap-2">
                      <Tag className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                      Detected Objects, Apparel & Elements
                    </h3>

                    <div className="space-y-3">
                      {/* Apparel & Objects */}
                      {result.detectedElements.apparel_and_objects?.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1.5">
                            Apparel & Items
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {result.detectedElements.apparel_and_objects.map((item, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-lg bg-pink-50 dark:bg-pink-500/10 border border-pink-200 dark:border-pink-500/20 text-pink-700 dark:text-pink-300 text-[11px] font-bold"
                              >
                                👔 {item}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Colors */}
                      {result.detectedElements.colors?.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1.5">
                            Dominant Colors
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {result.detectedElements.colors.map((color, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-700 dark:text-blue-300 text-[11px] font-bold"
                              >
                                🎨 {color}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Setting & Environment */}
                      {result.detectedElements.setting_and_environment?.length > 0 && (
                        <div>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 block mb-1.5">
                            Setting & Scene
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {result.detectedElements.setting_and_environment.map((env, idx) => (
                              <span
                                key={idx}
                                className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-[11px] font-bold"
                              >
                                🌳 {env}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Mood & Lighting Note */}
                    {result.moodAndLighting && (
                      <div className="pt-3 border-t border-gray-100 dark:border-white/5 text-xs text-gray-600 dark:text-gray-400 font-semibold flex items-center gap-2">
                        <span className="text-amber-500">☀️</span>
                        <span>{result.moodAndLighting}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Hashtags Section */}
                {result.hashtags?.length > 0 && (
                  <div className="p-4.5 rounded-2xl bg-white dark:bg-[#090d16] border border-[#E8ECF4] dark:border-white/5 shadow-sm flex items-center justify-between gap-4">
                    <div className="overflow-hidden">
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-500 block mb-1">
                        Hashtags
                      </span>
                      <p className="text-xs text-blue-600 dark:text-blue-400 font-bold truncate">
                        {result.hashtags.join(' ')}
                      </p>
                    </div>
                    <button
                      onClick={() => copyToClipboard(result.hashtags.join(' '), 'hashtags_copy')}
                      className="px-3 py-1.5 rounded-xl border border-gray-200 dark:border-white/10 hover:border-blue-500 text-xs font-bold text-gray-700 dark:text-gray-300 transition-all shrink-0 cursor-pointer"
                    >
                      {copiedKey === 'hashtags_copy' ? 'Copied' : 'Copy All'}
                    </button>
                  </div>
                )}

              </div>
            ) : (
              /* Empty State / How it works */
              <div className="p-8 rounded-3xl bg-white dark:bg-[#090d16] border border-[#E8ECF4] dark:border-white/5 shadow-sm text-center space-y-6">
                <div className="w-16 h-16 rounded-3xl bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mx-auto shadow-sm">
                  <Eye className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900 dark:text-white uppercase tracking-tight mb-2">
                    Instant AI Visual Recognition
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 font-medium max-w-md mx-auto leading-relaxed">
                    Upload any photo of a person, landscape, product, or document. Our vision model will inspect clothing, background, colors, and objects to generate complete descriptions.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left pt-4 border-t border-gray-100 dark:border-white/5">
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                    <span className="text-lg block mb-1">👔</span>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">Apparel & People</h4>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Detects outfits, colors, patterns, and poses.</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                    <span className="text-lg block mb-1">🔍</span>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">SEO Alt-Text</h4>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Generates accessibility tags for bloggers & websites.</p>
                  </div>
                  <div className="p-3.5 rounded-2xl bg-gray-50 dark:bg-white/[0.02] border border-gray-100 dark:border-white/5">
                    <span className="text-lg block mb-1">🎨</span>
                    <h4 className="text-xs font-bold text-gray-900 dark:text-white mb-0.5">AI Art Prompts</h4>
                    <p className="text-[10px] text-gray-500 dark:text-gray-400 font-medium">Converts image to prompt for Midjourney & Flux.</p>
                  </div>
                </div>
              </div>
            )}

          </div>

        </div>

        {/* SEO Article & FAQs */}
        {toolArticles['ai-image-describer'] && (
          <ToolArticle {...toolArticles['ai-image-describer']} />
        )}

      </div>
    </div>
  );
}
