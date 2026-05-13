"use client";

import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { 
  Mic, Play, Square, Download, Settings, 
  AlertCircle, Sparkles, SlidersHorizontal, Volume2,
  Clock, Lock, Copy, CheckCircle, Headphones, FileText, RefreshCw
} from 'lucide-react';

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
                <Mic className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Voice Generator</h1>
                <p className="text-sm text-gray-500 mt-1">Transform text into lifelike speech with premium AI voices.</p>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <button onClick={resetForm} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Reset
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
          <div className="w-full xl:w-[55%] space-y-6">
            
            {/* Input Script */}
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex flex-col h-full">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <Volume2 className="w-5 h-5 text-blue-600" />
                  Voice Script
                </h2>
                <div className="flex items-center gap-3">
                  <button 
                    onClick={copyText}
                    className="text-xs font-semibold text-gray-500 hover:text-gray-700 transition-colors flex items-center gap-1"
                  >
                    {copied ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                  <span className={`text-xs font-semibold px-2 py-1 rounded-md ${text.length > 3000 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-600'}`}>
                    {text.length} / 3000
                  </span>
                </div>
              </div>
              
              <textarea 
                value={text} 
                onChange={e => setText(e.target.value)} 
                className="w-full flex-1 min-h-[200px] px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none text-[15px] leading-relaxed resize-none custom-scrollbar" 
                placeholder="Type or paste the script you want the AI to speak...&#10;&#10;e.g. 'Welcome to our latest update! Today we are thrilled to announce some highly requested features...'" 
              />
              
              {/* Voice Presets */}
              <div className="mt-6">
                <h3 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-blue-500" /> Premium Voice Clones
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {presets.map(preset => (
                    <button 
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset)}
                      className={`p-3 rounded-xl border text-left transition-all ${selectedPreset === preset.id ? `ring-2 ring-blue-500 shadow-md ${preset.color}` : 'bg-white border-gray-200 hover:border-blue-300 hover:shadow-sm'}`}
                    >
                      <h4 className="font-bold text-sm text-gray-900">{preset.name}</h4>
                      <p className="text-[11px] text-gray-500 mt-0.5 font-medium">{preset.desc}</p>
                    </button>
                  ))}
                </div>
              </div>
            </section>

            {/* Voice Settings */}
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-6 pb-4 border-b border-gray-100">
                <Settings className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Voice Settings</h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-6">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Language</label>
                  <select value={language} onChange={e => { setLanguage(e.target.value as any); setSelectedPreset(null); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white outline-none text-sm font-medium">
                    <option>English</option>
                    <option>Hindi</option>
                    <option>Hinglish</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Gender</label>
                  <select value={gender} onChange={e => { setGender(e.target.value as any); setSelectedPreset(null); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white outline-none text-sm font-medium">
                    <option>Male</option>
                    <option>Female</option>
                    <option>Neutral</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1.5">Voice Style</label>
                  <select value={style} onChange={e => { setStyle(e.target.value); setSelectedPreset(null); }} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white outline-none text-sm font-medium">
                    <option>Natural</option>
                    <option>Professional</option>
                    <option>Storytelling</option>
                    <option>Energetic</option>
                    <option>Calm</option>
                    <option>Romantic</option>
                    <option>News Reader</option>
                    <option>YouTube Voice</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <SlidersHorizontal className="w-3.5 h-3.5" /> Speed
                    </label>
                    <span className="text-xs font-bold text-blue-600">{speed.toFixed(2)}x</span>
                  </div>
                  <input type="range" min="0.5" max="1.5" step="0.05" value={speed} onChange={e => { setSpeed(parseFloat(e.target.value)); setSelectedPreset(null); }} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                  <div className="flex justify-between text-[10px] text-gray-500 mt-1.5 font-medium px-1">
                    <span>Slow</span>
                    <span>Normal</span>
                    <span>Fast</span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <label className="flex items-center gap-1.5 text-xs font-semibold text-gray-700 uppercase tracking-wider">
                      <SlidersHorizontal className="w-3.5 h-3.5" /> Pitch
                    </label>
                    <span className="text-xs font-bold text-blue-600">{pitch.toFixed(2)}</span>
                  </div>
                  <input type="range" min="0.5" max="1.5" step="0.05" value={pitch} onChange={e => { setPitch(parseFloat(e.target.value)); setSelectedPreset(null); }} className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600" />
                  <div className="flex justify-between text-[10px] text-gray-500 mt-1.5 font-medium px-1">
                    <span>Deep</span>
                    <span>Flat</span>
                    <span>High</span>
                  </div>
                </div>
              </div>
            </section>
          </div>

          {/* RIGHT: RESULT PANEL */}
          <div className="w-full xl:w-[45%] flex flex-col gap-6">
            
            {/* Player Interface */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex justify-between items-start mb-6">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Preview Studio</h3>
                  <p className="text-xs text-gray-500 font-medium">Test your script and settings.</p>
                </div>
                <div className="bg-blue-50 text-blue-700 text-xs font-bold px-2.5 py-1 rounded-md border border-blue-100 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" /> {formattedDuration}
                </div>
              </div>

              {/* Waveform Visualization (CSS Animation) */}
              <div className="h-24 bg-gray-900 rounded-xl mb-6 overflow-hidden relative flex items-center justify-center p-4">
                {isPlaying ? (
                  <div className="flex items-end justify-center gap-1 h-full w-full">
                    {[...Array(24)].map((_, i) => (
                      <div 
                        key={i} 
                        className="w-2 bg-blue-500 rounded-t-sm animate-pulse" 
                        style={{ 
                          height: `${Math.max(10, Math.random() * 100)}%`,
                          animationDuration: `${0.3 + Math.random() * 0.5}s`,
                          animationDelay: `${Math.random() * 0.5}s`
                        }}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-gray-500">
                    <Headphones className="w-6 h-6 opacity-50" />
                    <span className="text-sm font-semibold opacity-80">Ready to play</span>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <button 
                  onClick={isPlaying ? stopVoice : previewVoice}
                  className={`flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm transition-all shadow-sm ${isPlaying ? 'bg-red-50 text-red-600 border border-red-200 hover:bg-red-100' : 'bg-gray-900 text-white hover:bg-gray-800'}`}
                >
                  {isPlaying ? <Square className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                  {isPlaying ? 'Stop Playback' : 'Preview Voice'}
                </button>
                <button 
                  onClick={downloadVoice}
                  disabled={isDownloading}
                  className="flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-sm bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 transition-all shadow-sm disabled:opacity-50"
                >
                  {isDownloading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                  Download MP3
                </button>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <p className="text-[11px] text-amber-800 font-medium leading-relaxed">
                  <strong>Browser Preview Notice:</strong> The free preview relies on your device's built-in speech engine, which may sound robotic. High-fidelity human-like MP3 downloads will require the upcoming Premium Voice API.
                </p>
              </div>
            </div>

            {/* Generated Script Summary */}
            <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm flex-1 flex flex-col">
              <h3 className="text-sm font-bold text-gray-900 mb-4 border-b border-gray-100 pb-3 flex items-center gap-2">
                <FileText className="w-4 h-4 text-gray-500" /> Active Configuration
              </h3>
              
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-md">{language}</span>
                <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-md">{gender}</span>
                <span className="px-2.5 py-1 bg-gray-100 text-gray-700 text-xs font-bold rounded-md">{style}</span>
              </div>

              <div className="flex-1 bg-gray-50 rounded-xl p-4 border border-gray-100 overflow-y-auto max-h-[150px] custom-scrollbar">
                <p className="text-[13px] text-gray-600 font-medium italic leading-relaxed">
                  {text ? `"${text}"` : "Your script will appear here during playback..."}
                </p>
              </div>
            </div>

            {/* Pro Upgrade Card */}
            <div className="bg-gradient-to-br from-indigo-600 to-blue-700 rounded-2xl p-6 shadow-md text-white relative overflow-hidden">
              <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl pointer-events-none"></div>
              <div className="flex items-center gap-3 mb-3">
                <Lock className="w-5 h-5 text-indigo-200" />
                <h3 className="text-lg font-bold">Premium API Coming Soon</h3>
              </div>
              <p className="text-indigo-100 text-sm font-medium mb-4 leading-relaxed">
                Unlock ultra-realistic, emotionally intelligent voices powered by ElevenLabs. Export directly to high-quality WAV/MP3 files.
              </p>
              <button className="w-full py-2.5 bg-white text-indigo-700 text-sm font-bold rounded-lg shadow-sm hover:bg-gray-50 transition-colors">
                Join the Waitlist
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
