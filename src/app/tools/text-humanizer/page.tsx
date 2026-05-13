"use client";

import Link from 'next/link';
import { useState } from 'react';
import { 
  FileText, Sparkles, RefreshCw, Copy, CheckCircle, 
  AlertCircle, Settings, UserCheck, SlidersHorizontal, BookOpen
} from 'lucide-react';

type HumanizerData = {
  inputText: string;
  tone: 'Natural' | 'Professional' | 'Friendly' | 'Simple' | 'Academic' | 'Creative';
  style: 'Shorter' | 'Same length' | 'More detailed';
  language: 'English' | 'Hindi' | 'Hinglish';
  creativity: number;
};

const initialData: HumanizerData = {
  inputText: "",
  tone: "Natural",
  style: "Same length",
  language: "English",
  creativity: 50
};

type GeneratedResult = {
  outputText: string;
  inputWordCount: number;
  outputWordCount: number;
  readabilityScore: number;
  improvements: string[];
};

export default function TextHumanizer() {
  const [data, setData] = useState<HumanizerData>(initialData);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setData({ ...data, creativity: parseInt(e.target.value) });
  };

  const resetForm = () => {
    setData(initialData);
    setResult(null);
    setError(null);
  };

  const copyToClipboard = () => {
    if (!result?.outputText) return;
    navigator.clipboard.writeText(result.outputText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const calculateWordCount = (text: string) => {
    return text.trim() ? text.trim().split(/\s+/).length : 0;
  };

  // Basic mock humanization logic
  const generateMockContent = (d: HumanizerData): GeneratedResult => {
    const isHindi = d.language === 'Hindi';
    const isHinglish = d.language === 'Hinglish';
    const isProf = d.tone === 'Professional';
    const isFriendly = d.tone === 'Friendly';
    
    const inputWords = calculateWordCount(d.inputText);
    
    // Replace typical AI phrasing with natural alternatives
    let out = d.inputText
      .replace(/Moreover,/g, "Also,")
      .replace(/Furthermore,/g, "Plus,")
      .replace(/Additionally,/g, "On top of that,")
      .replace(/In conclusion,/g, "To wrap up,")
      .replace(/It is crucial to note that/g, "It's important to know that")
      .replace(/delve into/g, "explore")
      .replace(/utilize/g, "use")
      .replace(/facilitate/g, "help")
      .replace(/endeavor/g, "try")
      .replace(/leverage/g, "use");

    // Adjust for tone and language
    if (isHinglish) {
      out = `Sahi baat toh yeh hai ki, ${out.substring(0, Math.floor(out.length / 2))} matlab basically, ${out.substring(Math.floor(out.length / 2))}`;
    } else if (isHindi) {
      out = `सच्चाई यह है कि, ${out} यह समझना बहुत आसान है।`;
    } else if (isFriendly) {
      out = `Hey there! Just wanted to share that ${out.toLowerCase()} Hope that makes sense! 😊`;
    } else if (isProf) {
      out = `To summarize the key points: ${out} We remain committed to optimizing these workflows.`;
    }
    
    // Adjust for length
    if (d.style === 'Shorter') {
      out = out.split('.').slice(0, Math.max(1, Math.floor(out.split('.').length / 2))).join('.') + '.';
    } else if (d.style === 'More detailed') {
      out = `${out} For example, when applying this in real-world scenarios, it significantly improves efficiency and user experience.`;
    }
    
    // Fallback if empty logic
    if (out.trim().length < 5) out = d.inputText;

    const outputWords = calculateWordCount(out);
    
    // Calculate dummy readability (1-100)
    let readability = 75 + Math.floor(Math.random() * 20); 
    if (isProf) readability -= 15;
    if (d.tone === 'Simple') readability += 15;
    
    // Generate improvements
    const improvements = [
      "More natural conversational tone",
      "Better sentence flow and pacing",
      "Reduced robotic repetition"
    ];
    if (inputWords > 50) improvements.push("Clearer wording in complex sentences");
    if (d.creativity > 70) improvements.push("Added creative flair and transitions");

    return {
      outputText: out,
      inputWordCount: inputWords,
      outputWordCount: outputWords,
      readabilityScore: Math.min(100, Math.max(0, readability)),
      improvements
    };
  };

  const handleGenerate = () => {
    if (!data.inputText.trim()) {
      setError("Please paste some text to humanize.");
      return;
    }
    
    if (calculateWordCount(data.inputText) < 5) {
      setError("Please enter at least 5 words for better results.");
      return;
    }
    
    setError(null);
    setIsGenerating(true);
    
    setTimeout(() => {
      setResult(generateMockContent(data));
      setIsGenerating(false);
    }, 1500);
  };

  return (
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <Link href="/tools" className="text-sm font-medium text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to all tools
        </Link>
        
        {/* HEADER */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex items-center gap-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-600 shrink-0">
                <UserCheck className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Text Humanizer</h1>
                <p className="text-sm text-gray-500 mt-1">Make AI text sound more natural, clear, and human-friendly.</p>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <button onClick={resetForm} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Clear All
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mt-6 bg-red-50 text-red-700 p-4 rounded-xl flex items-start gap-3 border border-red-100 animate-fade-in">
              <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </div>
        
        <div className="flex flex-col xl:flex-row gap-8 relative">
          
          {/* LEFT: FORM AREA */}
          <div className="w-full xl:w-[45%] space-y-6">
            
            {/* Input */}
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full">
              <div className="flex items-center justify-between mb-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h2 className="text-lg font-bold text-gray-900">Original Text</h2>
                </div>
                <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-md">
                  {calculateWordCount(data.inputText)} words
                </span>
              </div>
              
              <div className="flex-1 flex flex-col">
                <textarea 
                  name="inputText"
                  value={data.inputText} 
                  onChange={handleChange} 
                  className="w-full flex-1 min-h-[250px] px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none text-[15px] leading-relaxed resize-none custom-scrollbar" 
                  placeholder="Paste your AI-generated text here...&#10;&#10;e.g. 'Furthermore, it is crucial to leverage synergistic paradigms to facilitate optimal outcomes.'" 
                />
              </div>

              {/* Customization Options inline below textarea */}
              <div className="mt-6 space-y-5 bg-gray-50 p-4 rounded-xl border border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                  <Settings className="w-4 h-4 text-gray-700" />
                  <h3 className="text-sm font-bold text-gray-900">Humanize Settings</h3>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Tone</label>
                    <select name="tone" value={data.tone} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white outline-none text-sm font-medium text-gray-800">
                      <option>Natural</option>
                      <option>Professional</option>
                      <option>Friendly</option>
                      <option>Simple</option>
                      <option>Academic</option>
                      <option>Creative</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Language</label>
                    <select name="language" value={data.language} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white outline-none text-sm font-medium text-gray-800">
                      <option>English</option>
                      <option>Hindi</option>
                      <option>Hinglish</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Output Style</label>
                    <select name="style" value={data.style} onChange={handleChange} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white outline-none text-sm font-medium text-gray-800">
                      <option>Same length</option>
                      <option>Shorter</option>
                      <option>More detailed</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <div className="flex justify-between items-center mb-2">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <SlidersHorizontal className="w-3.5 h-3.5" /> Creativity
                    </label>
                    <span className="text-xs font-bold text-blue-600">{data.creativity}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="100" 
                    value={data.creativity} 
                    onChange={handleSliderChange}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-[10px] text-gray-500 mt-1 font-medium px-1">
                    <span>Direct</span>
                    <span>Balanced</span>
                    <span>Creative</span>
                  </div>
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-md"
              >
                {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {isGenerating ? 'Humanizing text...' : 'Humanize Text'}
              </button>
            </section>
          </div>

          {/* RIGHT: GENERATED CONTENT */}
          <div className="w-full xl:w-[55%] flex flex-col gap-6">
            
            {!result && !isGenerating && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm h-full flex flex-col items-center justify-center p-12 text-center min-h-[500px]">
                <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                  <UserCheck className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Sound more human</h3>
                <p className="text-gray-500 max-w-sm">Paste your text on the left and hit generate to transform robotic language into a clear, natural, and relatable message.</p>
              </div>
            )}

            {isGenerating && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm h-full flex flex-col items-center justify-center p-12 text-center min-h-[500px]">
                <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <h3 className="text-xl font-bold text-gray-900">Rewriting text...</h3>
                <p className="text-gray-500 mt-2">Removing robotic patterns and improving sentence flow.</p>
              </div>
            )}

            {result && !isGenerating && (
              <div className="h-full flex flex-col gap-6">
                
                {/* Stats Row */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center shrink-0">
                      <BookOpen className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Readability</p>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-2xl font-black text-gray-900">{result.readabilityScore}</span>
                        <span className="text-sm font-semibold text-gray-500">/ 100</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                      <FileText className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-gray-500 uppercase tracking-wide">Word Count</p>
                      <div className="flex items-baseline gap-1 mt-0.5">
                        <span className="text-2xl font-black text-gray-900">{result.outputWordCount}</span>
                        <span className="text-xs font-semibold text-gray-400">({result.outputWordCount > result.inputWordCount ? '+' : ''}{result.outputWordCount - result.inputWordCount})</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Output Area */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex-1 flex flex-col relative group">
                  <div className="flex justify-between items-center mb-4 pb-4 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-emerald-500" />
                      <h3 className="text-lg font-bold text-gray-900">Humanized Result</h3>
                    </div>
                    <button 
                      onClick={copyToClipboard}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-gray-900 rounded-lg hover:bg-gray-800 transition-colors shadow-sm"
                    >
                      {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy Text'}
                    </button>
                  </div>
                  
                  <div className="flex-1 bg-gray-50/50 rounded-xl p-4 border border-gray-100 min-h-[200px]">
                    <p className="text-[15px] text-gray-800 leading-relaxed whitespace-pre-wrap">
                      {result.outputText}
                    </p>
                  </div>

                  {/* Improvements List */}
                  <div className="mt-6 bg-emerald-50/50 p-4 rounded-xl border border-emerald-100">
                    <h4 className="text-xs font-bold text-emerald-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4" /> Improvement Notes
                    </h4>
                    <ul className="text-sm text-emerald-700 space-y-2 font-medium">
                      {result.improvements.map((imp, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-500 font-black mt-0.5">•</span> 
                          <span>{imp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                </div>

              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
