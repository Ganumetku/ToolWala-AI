"use client";

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { 
  Mic, Play, Square, Download, Settings, 
  AlertCircle, Sparkles, SlidersHorizontal, Volume2,
  Clock, Lock, Copy, CheckCircle, Headphones, FileText, RefreshCw
} from 'lucide-react';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';
import { motion, AnimatePresence } from 'framer-motion';

type VoicePreset = {
  id: string;
  name: string;
  desc: string;
  language: 'English' | 'Hindi' | 'Hinglish';
  gender: 'Male' | 'Female' | 'Neutral';
  style: string;
  pitch: number;
  speed: number;
  color: string;
};

const presets: VoicePreset[] = [
  { id: '1', name: 'Aarav', desc: 'Indian Male', language: 'Hindi', gender: 'Male', style: 'Storytelling', pitch: 0.9, speed: 0.95, color: 'bg-indigo-50 border-indigo-200 text-indigo-700' },
  { id: '2', name: 'Meera', desc: 'Indian Female', language: 'Hinglish', gender: 'Female', style: 'Natural', pitch: 1.1, speed: 1.0, color: 'bg-rose-50 border-rose-200 text-rose-700' },
  { id: '3', name: 'Alex', desc: 'English Male', language: 'English', gender: 'Male', style: 'Professional', pitch: 0.95, speed: 1.05, color: 'bg-blue-50 border-blue-200 text-blue-700' },
  { id: '4', name: 'Sophia', desc: 'English Female', language: 'English', gender: 'Female', style: 'Calm', pitch: 1.05, speed: 0.9, color: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
];

export default function VoiceGenerator() {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState<'English' | 'Hindi' | 'Hinglish'>('English');
  const [gender, setGender] = useState<'Male' | 'Female' | 'Neutral'>('Neutral');
  const [style, setStyle] = useState('Natural');
  const [speed, setSpeed] = useState(1.0);
  const [pitch, setPitch] = useState(1.0);
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  
  const [browserVoices, setBrowserVoices] = useState<SpeechSynthesisVoice[]>([]);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      synthRef.current = window.speechSynthesis;
      
      const loadVoices = () => {
        const voices = synthRef.current?.getVoices() || [];
        setBrowserVoices(voices);
      };
      
      loadVoices();
      if (synthRef.current.onvoiceschanged !== undefined) {
        synthRef.current.onvoiceschanged = loadVoices;
      }
      
      return () => {
        if (synthRef.current) synthRef.current.cancel();
      };
    } else {
      setError("Speech synthesis is not supported in this browser.");
    }
  }, []);

  const handlePresetSelect = (preset: VoicePreset) => {
    setSelectedPreset(preset.id);
    setLanguage(preset.language);
    setGender(preset.gender);
    setStyle(preset.style);
    setPitch(preset.pitch);
    setSpeed(preset.speed);
    setError(null);
  };

  const getBestVoice = () => {
    if (!browserVoices.length) return null;
    
    let targetLang = 'en-US';
    if (language === 'Hindi') targetLang = 'hi-IN';
    if (language === 'Hinglish') targetLang = 'en-IN';
    if (language === 'English' && gender === 'Male') targetLang = 'en-GB'; // Often deeper

    const langVoices = browserVoices.filter(v => v.lang.includes(targetLang) || v.lang.includes(targetLang.split('-')[0]));
    
    // Simplistic gender matching heuristic based on voice URI (often contains 'female' or 'male' in name or URI)
    let genderVoices = langVoices;
    if (gender !== 'Neutral') {
      const isFemale = gender === 'Female';
      const filtered = langVoices.filter(v => 
        (isFemale && (v.name.toLowerCase().includes('female') || v.name.toLowerCase().includes('zira') || v.name.toLowerCase().includes('samantha'))) ||
        (!isFemale && (v.name.toLowerCase().includes('male') || v.name.toLowerCase().includes('david') || v.name.toLowerCase().includes('daniel')))
      );
      if (filtered.length > 0) genderVoices = filtered;
    }

    return genderVoices.length > 0 ? genderVoices[0] : (langVoices[0] || browserVoices[0]);
  };

  const previewVoice = () => {
    if (!synthRef.current) {
      setError("Speech synthesis not available in your browser.");
      return;
    }
    if (text.length < 10) {
      setError("Please enter at least 10 characters to generate voice.");
      return;
    }
    if (text.length > 3000) {
      setError("Text exceeds maximum 3000 characters limit.");
      return;
    }

    setError(null);
    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    const voice = getBestVoice();
    if (voice) utterance.voice = voice;
    utterance.rate = speed;
    utterance.pitch = pitch;

    utterance.onstart = () => setIsPlaying(true);
    utterance.onend = () => setIsPlaying(false);
    utterance.onerror = (e) => {
      console.error(e);
      setIsPlaying(false);
      // Don't show error for intentional cancellations
      if (e.error !== 'interrupted' && e.error !== 'canceled') {
        setError("Playback failed. Please try again.");
      }
    };

    synthRef.current.speak(utterance);
  };

  const stopVoice = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
    }
  };

  const downloadVoice = () => {
    setIsDownloading(true);
    setError(null);
    setTimeout(() => {
      setIsDownloading(false);
      setError("MP3 download requires premium AI voice API. Coming soon.");
    }, 800);
  };

  const copyText = () => {
    if (!text.trim()) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetForm = () => {
    setText("");
    setSelectedPreset(null);
    setLanguage('English');
    setGender('Neutral');
    setStyle('Natural');
    setSpeed(1.0);
    setPitch(1.0);
    stopVoice();
    setError(null);
  };

  // Approx 150 words per minute average reading speed * rate adjustment
  const estWords = text.trim() ? text.trim().split(/\s+/).length : 0;
  const estSeconds = Math.round((estWords / (150 * speed)) * 60);
  const formattedDuration = `${Math.floor(estSeconds / 60)}:${(estSeconds % 60).toString().padStart(2, '0')}`;

  return (
    <div className="bg-[#030712] min-h-screen py-24 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/5 blur-[120px] -z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors mb-10 group">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Directory
        </Link>
        
        {/* HEADER */}
        <div className="glass rounded-[2.5rem] border border-white/5 p-8 sm:p-10 mb-10 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-600/5 blur-[80px] -z-10" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] border border-blue-400/20">
                <Mic className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tighter uppercase">AI Voice Generator</h1>
                <p className="text-gray-400 font-medium mt-1">Transform text into lifelike speech with premium AI voices.</p>
              </div>
            </div>
            <div className="flex gap-4 shrink-0">
              <button onClick={resetForm} className="px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:text-white transition-all active:scale-95">
                Reset Studio
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mt-8 bg-red-500/10 text-red-500 p-5 rounded-2xl flex items-start gap-4 border border-red-500/20 animate-fade-in shadow-2xl">
              <AlertCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
              <p className="text-sm font-bold leading-relaxed">{error}</p>
            </div>
          )}
        </div>
        
        <div className="flex flex-col xl:flex-row gap-10 relative">
          
          {/* LEFT: FORM AREA */}
          <div className="w-full xl:w-[55%] space-y-8">
            
            {/* Input Script */}
            <section className="glass p-8 rounded-[2.5rem] border border-white/5 shadow-2xl flex flex-col h-full relative overflow-hidden group">
              <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-focus-within:opacity-100 transition-opacity" />
              <div className="flex justify-between items-center mb-6 relative z-10">
                <h2 className="text-sm font-black text-white flex items-center gap-3 uppercase tracking-widest">
                  <Volume2 className="w-5 h-5 text-blue-500" />
                  Voice Script
                </h2>
                <div className="flex items-center gap-5">
                  <button 
                    onClick={copyText}
                    className="text-[10px] font-black text-gray-500 hover:text-blue-500 transition-colors flex items-center gap-2 uppercase tracking-widest"
                  >
                    {copied ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <span className={`text-[10px] font-black px-4 py-2 rounded-xl border ${text.length > 3000 ? 'bg-red-500/10 border-red-500/20 text-red-500' : 'bg-white/5 border-white/5 text-gray-500'}`}>
                    {text.length} / 3000
                  </span>
                </div>
              </div>
              
              <textarea 
                value={text} 
                onChange={e => setText(e.target.value)} 
                className="w-full flex-1 min-h-[300px] px-6 py-5 bg-white/5 border border-white/5 rounded-[2rem] focus:border-blue-500/50 outline-none text-lg font-medium text-white leading-relaxed resize-none custom-scrollbar transition-all placeholder:text-gray-700 relative z-10 shadow-inner" 
                placeholder="Type or paste the script you want the AI to speak...&#10;&#10;e.g. 'Welcome to ToolGPT! Today we are thrilled to announce our premium voice synthesis engine...'" 
              />
              
              {/* Voice Presets */}
              <div className="mt-8 relative z-10">
                <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-5 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-500" /> Premium Voice Clones
                </h3>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {presets.map(preset => (
                    <button 
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset)}
                      className={`p-5 rounded-[1.5rem] border-2 text-left transition-all group ${selectedPreset === preset.id ? `border-blue-600 bg-blue-600/10 shadow-[0_0_20px_rgba(37,99,235,0.2)]` : 'bg-white/5 border-white/5 hover:border-white/10 hover:bg-white/[0.08]'}`}
                    >
                      <h4 className="font-black text-sm text-white group-hover:text-blue-400 transition-colors">{preset.name}</h4>
                      <p className="text-[10px] text-gray-500 mt-1 font-black uppercase tracking-widest">{preset.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Voice Settings */}
            <section className="glass p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
              <div className="flex items-center gap-3 mb-10 pb-6 border-b border-white/5">
                <Settings className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-black text-white tracking-tight uppercase">Config Studio</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Language</label>
                  <select value={language} onChange={e => { setLanguage(e.target.value as any); setSelectedPreset(null); }} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-black text-white focus:border-blue-500/50 outline-none transition-all appearance-none cursor-pointer">
                    <option className="bg-slate-900">English</option>
                    <option className="bg-slate-900">Hindi</option>
                    <option className="bg-slate-900">Hinglish</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Gender</label>
                  <select value={gender} onChange={e => { setGender(e.target.value as any); setSelectedPreset(null); }} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-black text-white focus:border-blue-500/50 outline-none transition-all appearance-none cursor-pointer">
                    <option className="bg-slate-900">Male</option>
                    <option className="bg-slate-900">Female</option>
                    <option className="bg-slate-900">Neutral</option>
                  </select>
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Voice Style</label>
                  <select value={style} onChange={e => { setStyle(e.target.value); setSelectedPreset(null); }} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-black text-white focus:border-blue-500/50 outline-none transition-all appearance-none cursor-pointer">
                    <option className="bg-slate-900">Natural</option>
                    <option className="bg-slate-900">Professional</option>
                    <option className="bg-slate-900">Storytelling</option>
                    <option className="bg-slate-900">Energetic</option>
                    <option className="bg-slate-900">Calm</option>
                    <option className="bg-slate-900">Romantic</option>
                    <option className="bg-slate-900">News Reader</option>
                    <option className="bg-slate-900">YouTube Voice</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <SlidersHorizontal className="w-3.5 h-3.5" /> Narrator Speed
                    </label>
                    <span className="text-xs font-black text-blue-500 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">{speed.toFixed(2)}x</span>
                  </div>
                  <input type="range" min="0.5" max="1.5" step="0.05" value={speed} onChange={e => { setSpeed(parseFloat(e.target.value)); setSelectedPreset(null); }} className="w-full h-3 bg-white/5 rounded-full appearance-none cursor-pointer accent-blue-600" />
                  <div className="flex justify-between text-[10px] text-gray-600 font-black uppercase tracking-tighter px-1">
                    <span>Adagio</span>
                    <span>Andante</span>
                    <span>Presto</span>
                  </div>
                </div>

                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                      <SlidersHorizontal className="w-3.5 h-3.5" /> Vocal Pitch
                    </label>
                    <span className="text-xs font-black text-blue-500 bg-blue-500/10 px-3 py-1 rounded-lg border border-blue-500/20">{pitch.toFixed(2)}</span>
                  </div>
                  <input type="range" min="0.5" max="1.5" step="0.05" value={pitch} onChange={e => { setPitch(parseFloat(e.target.value)); setSelectedPreset(null); }} className="w-full h-3 bg-white/5 rounded-full appearance-none cursor-pointer accent-blue-600" />
                  <div className="flex justify-between text-[10px] text-gray-600 font-black uppercase tracking-tighter px-1">
                    <span>Baritone</span>
                    <span>Tenor</span>
                    <span>Soprano</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT: RESULT PANEL */}
          <div className="w-full xl:w-[45%] flex flex-col gap-8">
            
            {/* Player Interface */}
            <div className="glass p-8 rounded-[3rem] border border-white/5 shadow-2xl relative overflow-hidden flex flex-col">
              <div className="absolute top-0 right-0 p-8">
                <div className="bg-blue-600/10 text-blue-500 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border border-blue-500/20 flex items-center gap-2 backdrop-blur-md">
                  <Clock className="w-3.5 h-3.5" /> Est. {formattedDuration}
                </div>
              </div>

              <div className="mb-10">
                <h3 className="text-2xl font-black text-white tracking-tight uppercase">Preview Engine</h3>
                <p className="text-gray-500 font-medium mt-1">Listen to your generation in real-time.</p>
              </div>

              {/* Waveform Visualization */}
              <div className="h-32 bg-black/60 rounded-[2rem] mb-10 overflow-hidden relative flex items-center justify-center p-8 border border-white/5 shadow-inner">
                {isPlaying ? (
                  <div className="flex items-end justify-center gap-1.5 h-full w-full">
                    {[...Array(32)].map((_, i) => (
                      <div 
                        key={i} 
                        className="w-1.5 bg-blue-600 rounded-full animate-pulse" 
                        style={{ 
                          height: `${Math.max(15, Math.random() * 100)}%`,
                          animationDuration: `${0.2 + Math.random() * 0.4}s`,
                          animationDelay: `${Math.random() * 0.5}s`,
                          boxShadow: '0 0 20px rgba(37,99,235,0.4)'
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col items-center gap-4 text-gray-600">
                    <Headphones className="w-10 h-10 opacity-20" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Awaiting Playback</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-8">
                <button 
                  onClick={isPlaying ? stopVoice : previewVoice}
                  className={`flex items-center justify-center gap-4 px-8 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all shadow-2xl active:scale-95 ${isPlaying ? 'bg-red-500/10 text-red-500 border border-red-500/20 hover:bg-red-500/20' : 'bg-blue-600 text-white hover:bg-blue-500 shadow-[0_0_40px_rgba(37,99,235,0.4)]'}`}
                >
                  {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current ml-1" />}
                  {isPlaying ? 'Terminate Playback' : 'Listen Preview'}
                </button>
                <button 
                  onClick={downloadVoice}
                  disabled={isDownloading}
                  className="flex items-center justify-center gap-4 px-8 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest bg-white text-black hover:bg-gray-200 transition-all shadow-2xl disabled:opacity-20 active:scale-95"
                >
                  {isDownloading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Export MP3
                </button>
              </div>

              <div className="bg-amber-500/10 border border-amber-500/20 rounded-[1.5rem] p-6 flex items-start gap-5 shadow-inner">
                <AlertCircle className="w-6 h-6 text-amber-500 shrink-0 mt-0.5" />
                <p className="text-xs text-gray-400 font-bold leading-relaxed">
                  <span className="text-amber-500 uppercase tracking-widest text-[10px] block mb-2 font-black">Browser Engine Notice</span>
                  Free preview uses your local speech engine. High-fidelity human-like MP3 downloads require our Premium AI API (Coming Soon).
                </p>
              </div>
            </div>

            {/* Active Config */}
            <div className="glass p-8 rounded-[3rem] border border-white/5 shadow-2xl flex-1 flex flex-col relative overflow-hidden">
              <div className="absolute inset-0 bg-white/5 opacity-[0.02] pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
              <h3 className="text-[10px] font-black text-gray-500 mb-8 pb-5 border-b border-white/5 flex items-center gap-3 uppercase tracking-widest">
                <FileText className="w-4 h-4" /> Studio Log
              </h3>
              
              <div className="flex flex-wrap gap-3 mb-8">
                <span className="px-4 py-2 bg-blue-600/10 text-blue-400 text-[10px] font-black rounded-xl border border-blue-600/20 uppercase tracking-widest">{language}</span>
                <span className="px-4 py-2 bg-white/5 text-gray-400 text-[10px] font-black rounded-xl border border-white/5 uppercase tracking-widest">{gender}</span>
                <span className="px-4 py-2 bg-white/5 text-gray-400 text-[10px] font-black rounded-xl border border-white/5 uppercase tracking-widest">{style}</span>
              </div>

              <div className="flex-1 bg-black/40 rounded-[2rem] p-8 border border-white/5 overflow-y-auto max-h-[200px] custom-scrollbar shadow-inner relative z-10">
                <p className="text-lg font-medium text-gray-400 italic leading-relaxed">
                  {text ? `"${text}"` : "Input text to generate audio preview..."}
                </p>
              </div>
            </div>

            {/* Pro Upgrade Card */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-900 rounded-[3rem] p-10 shadow-[0_0_60px_rgba(37,99,235,0.4)] text-white relative overflow-hidden group">
              <div className="absolute -right-10 -top-10 w-64 h-64 bg-white/10 rounded-full blur-[80px] pointer-events-none group-hover:scale-150 transition-transform duration-1000"></div>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md">
                  <Lock className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-2xl font-black uppercase tracking-tight">Ultra Realistic AI</h3>
              </div>
              <p className="text-blue-100 font-medium mb-10 leading-relaxed">
                Unlock 11Labs-powered human clones with emotional intelligence. Join the waitlist for direct MP3 high-fidelity exports.
              </p>
              <button className="w-full py-5 bg-white text-blue-700 text-[10px] font-black uppercase tracking-widest rounded-2xl shadow-2xl hover:bg-gray-100 transition-all active:scale-95">
                Join Premium Waitlist
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* SEO Article Section */}
      <ToolArticle {...toolArticles['voice-generator']} />
    </div>
  );

}
