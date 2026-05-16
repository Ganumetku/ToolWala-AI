"use client";

import Link from 'next/link';
import { useState, useRef } from 'react';
import { 
  Type, Sparkles, RefreshCw, Copy, CheckCircle, 
  AlertCircle, Image as ImageIcon, Upload, Trash2, 
  Settings, MessageSquare, Hash, Clock, BarChart2, ChevronLeft
} from 'lucide-react';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';

type CaptionData = {
  imageFile: File | null;
  imagePreview: string | null;
  topic: string;
  platform: 'Instagram' | 'YouTube Shorts' | 'LinkedIn' | 'Facebook' | 'Twitter / X';
  tone: 'Funny' | 'Professional' | 'Viral' | 'Emotional' | 'Luxury' | 'Fitness' | 'Motivational' | 'Romantic';
  language: 'English' | 'Hindi' | 'Hinglish';
  length: 'Short' | 'Medium' | 'Long';
  hashtagCount: '5' | '10' | '15' | '20';
};

const initialData: CaptionData = {
  imageFile: null,
  imagePreview: null,
  topic: "",
  platform: "Instagram",
  tone: "Viral",
  language: "English",
  length: "Medium",
  hashtagCount: "10"
};

type GeneratedResult = {
  captions: string[];
  hashtags: string;
  tips: {
    time: string;
    cta: string;
    hook: string;
  };
};

export default function CaptionGenerator() {
  const [data, setData] = useState<CaptionData>(initialData);
  const [result, setResult] = useState<GeneratedResult | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Track copy state for multiple items
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [copiedTags, setCopiedTags] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setData({ ...data, [e.target.name]: e.target.value });
    setError(null);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size should be less than 5MB");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = (event) => {
        setData({ 
          ...data, 
          imageFile: file,
          imagePreview: event.target?.result as string 
        });
        setError(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setData({ ...data, imageFile: null, imagePreview: null });
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetForm = () => {
    setData(initialData);
    setResult(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const copyToClipboard = (text: string, index: number | 'tags') => {
    navigator.clipboard.writeText(text);
    if (index === 'tags') {
      setCopiedTags(true);
      setTimeout(() => setCopiedTags(false), 2000);
    } else {
      setCopiedIndex(index as number);
      setTimeout(() => setCopiedIndex(null), 2000);
    }
  };

  const generateMockContent = (d: CaptionData): GeneratedResult => {
    const isHindi = d.language === 'Hindi';
    const isHinglish = d.language === 'Hinglish';
    const isProf = d.tone === 'Professional';
    const isFunny = d.tone === 'Funny';
    
    // Emojis based on tone
    let emojis = "🔥🚀✨";
    if (d.tone === 'Funny') emojis = "😂💀👀";
    if (d.tone === 'Professional') emojis = "💼📈🤝";
    if (d.tone === 'Romantic') emojis = "❤️🥺🌹";
    if (d.tone === 'Fitness') emojis = "💪🏋️‍♂️🔥";
    if (d.tone === 'Luxury') emojis = "✨🥂💎";
    
    // Base topic
    const subject = d.topic.trim() || (d.imageFile ? "this amazing moment" : "my latest update");
    
    // Generate 5 variations
    const captions: string[] = [];
    
    for (let i = 0; i < 5; i++) {
      let cap = "";
      
      // Variation 1: Direct & Punchy
      if (i === 0) {
        if (isHindi) cap = `आज का दिन: ${subject} ${emojis}\nक्या आप भी ऐसा सोचते हैं?`;
        else if (isHinglish) cap = `Vibe check: ${subject} ${emojis}\nLet me know comments mein! 👇`;
        else cap = `Just dropping this here: ${subject} ${emojis}\nThoughts on this? 👇`;
      }
      
      // Variation 2: Storytelling
      if (i === 1) {
        if (d.length === 'Short') cap = `The story behind ${subject} 📖${emojis}`;
        else cap = `It wasn't easy, but here we are. When it comes to ${subject}, you have to trust the process. Swipe to see the journey! ${emojis}`;
      }
      
      // Variation 3: Value/Tip based
      if (i === 2) {
        if (isProf) cap = `3 things I learned about ${subject}:\n1. Consistency is key\n2. Always adapt\n3. Value over volume\n\nWhat would you add? 💼`;
        else cap = `Unpopular opinion about ${subject}... wait for it 👀${emojis}`;
      }
      
      // Variation 4: Question/Engagement
      if (i === 3) {
        if (isFunny) cap = `Me pretending I know what I'm doing with ${subject} 🤡${emojis}`;
        else cap = `If you could change one thing about ${subject}, what would it be? Let's debate in the comments! 🗣️✨`;
      }
      
      // Variation 5: Short/Aesthetic
      if (i === 4) {
        cap = `${subject} era. ${emojis}`;
        if (d.tone === 'Luxury') cap = `Elevating the standard with ${subject}. 🥂💎`;
      }
      
      captions.push(cap);
    }
    
    // Generate Hashtags
    const count = parseInt(d.hashtagCount);
    const baseTags = ["#trending", "#viral", "#foryou", "#explore", "#growth", "#mindset", "#lifestyle", "#daily", "#content", "#community", "#inspiration", "#goals", "#success", "#hustle", "#create", "#moments", "#aesthetic", "#vibes", "#energy", "#focus"];
    let selectedTags = baseTags.sort(() => 0.5 - Math.random()).slice(0, count);
    
    // Add platform specific
    if (d.platform === 'Instagram') selectedTags[0] = "#instagood";
    if (d.platform === 'YouTube Shorts') selectedTags[0] = "#shorts";
    if (d.platform === 'LinkedIn') selectedTags[0] = "#networking";
    if (d.platform === 'Twitter / X') selectedTags[0] = "#tech";
    
    // Engagement Tips
    let time = "6:00 PM - 8:00 PM";
    if (d.platform === 'LinkedIn') time = "Tuesday 9:00 AM - 11:00 AM";
    if (d.platform === 'Twitter / X') time = "1:00 PM - 3:00 PM";
    
    return {
      captions,
      hashtags: selectedTags.join(' '),
      tips: {
        time: time,
        cta: isProf ? "Ask for a professional opinion in the comments." : "Tell them to tag a friend who needs to see this.",
        hook: `Start with a bold statement about ${subject.substring(0, 20)}...`
      }
    };
  };

  const handleGenerate = () => {
    if (!data.topic.trim() && !data.imageFile) {
      setError("Please either enter a topic or upload an image.");
      return;
    }
    
    setError(null);
    setIsGenerating(true);
    
    setTimeout(() => {
      setResult(generateMockContent(data));
      setIsGenerating(false);
    }, 1200);
  };

  return (
    <div className="bg-[#030712] min-h-screen py-24 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/5 blur-[120px] -z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors mb-10 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Directory
        </Link>
        
        {/* HEADER */}
        <div className="glass rounded-[2.5rem] border border-white/5 p-8 sm:p-10 mb-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_0_25px_rgba(37,99,235,0.4)] shrink-0">
                <Type className="w-7 h-7" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tighter">AI Caption Generator</h1>
                <p className="text-gray-400 font-medium mt-1">Create engaging, highly-optimized captions for any social media platform.</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-4 shrink-0">
              <button onClick={resetForm} className="px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all">
                Clear All
              </button>
            </div>
          </div>
          
          {error && (
            <div className="mt-8 animate-fade-in">
              <div className="bg-red-500/10 text-red-400 p-5 rounded-[2rem] flex items-start gap-4 border border-red-500/20">
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm font-medium">{error}</p>
              </div>
            </div>
          )}
        </div>
        
        <div className="flex flex-col xl:flex-row gap-10 relative items-start">
          
          {/* LEFT: FORM AREA */}
          <div className="w-full xl:w-[40%] space-y-8">
            
            {/* Input & Image */}
            <section className="glass rounded-[2rem] border border-white/5 p-8">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/5">
                <MessageSquare className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-black text-white tracking-tight">Post Details</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Visual Context (Optional)</label>
                  {!data.imagePreview ? (
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-white/10 border-dashed rounded-[2rem] cursor-pointer bg-white/5 hover:bg-white/10 transition-all group overflow-hidden relative">
                      <div className="flex flex-col items-center justify-center relative z-10">
                        <ImageIcon className="w-8 h-8 text-gray-500 mb-3 group-hover:scale-110 transition-transform" />
                        <p className="text-sm text-gray-400 font-bold uppercase tracking-widest">Upload Reference</p>
                      </div>
                      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                    </label>
                  ) : (
                    <div className="relative w-full h-48 rounded-[2rem] overflow-hidden border border-white/10 group shadow-2xl">
                      <img src={data.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-[#030712]/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                        <button onClick={removeImage} className="p-4 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-2xl transform hover:scale-110 transition-all">
                          <Trash2 className="w-6 h-6" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-black text-gray-500 uppercase tracking-widest mb-3 ml-1">Topic or Description *</label>
                  <textarea 
                    name="topic"
                    rows={5} 
                    value={data.topic} 
                    onChange={handleChange} 
                    className="w-full px-5 py-4 border border-white/10 rounded-2xl bg-white/5 text-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 outline-none text-sm font-bold transition-all resize-none custom-scrollbar shadow-2xl" 
                    placeholder="Describe your post... (e.g. My morning coffee routine at the beach)" 
                  />
                </div>
              </div>
            </section>

            {/* Customization */}
            <section className="glass rounded-[2rem] border border-white/5 p-8">
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-white/5">
                <Settings className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-black text-white tracking-tight">AI Settings</h2>
              </div>
              <div className="space-y-6">
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Platform</label>
                    <select name="platform" value={data.platform} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-black text-white focus:border-blue-500/50 outline-none transition-all appearance-none cursor-pointer">
                      <option className="bg-slate-900">Instagram</option>
                      <option className="bg-slate-900">YouTube Shorts</option>
                      <option className="bg-slate-900">LinkedIn</option>
                      <option className="bg-slate-900">Facebook</option>
                      <option className="bg-slate-900">Twitter / X</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Vibe/Tone</label>
                    <select name="tone" value={data.tone} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-black text-white focus:border-blue-500/50 outline-none transition-all appearance-none cursor-pointer">
                      <option className="bg-slate-900">Viral</option>
                      <option className="bg-slate-900">Funny</option>
                      <option className="bg-slate-900">Professional</option>
                      <option className="bg-slate-900">Emotional</option>
                      <option className="bg-slate-900">Luxury</option>
                      <option className="bg-slate-900">Fitness</option>
                      <option className="bg-slate-900">Motivational</option>
                      <option className="bg-slate-900">Romantic</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Language</label>
                    <select name="language" value={data.language} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-black text-white focus:border-blue-500/50 outline-none transition-all appearance-none cursor-pointer">
                      <option className="bg-slate-900">English</option>
                      <option className="bg-slate-900">Hindi</option>
                      <option className="bg-slate-900">Hinglish</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Length</label>
                    <select name="length" value={data.length} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-black text-white focus:border-blue-500/50 outline-none transition-all appearance-none cursor-pointer">
                      <option className="bg-slate-900">Short</option>
                      <option className="bg-slate-900">Medium</option>
                      <option className="bg-slate-900">Long</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Hashtag Density</label>
                  <select name="hashtagCount" value={data.hashtagCount} onChange={handleChange} className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-sm font-black text-white focus:border-blue-500/50 outline-none transition-all appearance-none cursor-pointer">
                    <option value="5" className="bg-slate-900">Low (5 Tags)</option>
                    <option value="10" className="bg-slate-900">Standard (10 Tags)</option>
                    <option value="15" className="bg-slate-900">High (15 Tags)</option>
                    <option value="20" className="bg-slate-900">Viral (20 Tags)</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full mt-10 flex items-center justify-center gap-3 px-8 py-5 text-[10px] font-black uppercase tracking-widest text-white bg-blue-600 rounded-[2rem] hover:bg-blue-500 transition-all disabled:opacity-50 shadow-[0_0_30px_rgba(37,99,235,0.4)] active:scale-95 group"
              >
                {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5 group-hover:rotate-12 transition-transform" />}
                {isGenerating ? 'Analyzing Trends...' : 'Craft Viral Captions'}
              </button>
            </section>
          </div>

          {/* RIGHT: GENERATED CONTENT */}
          <div className="w-full xl:w-[60%] flex flex-col gap-8 relative items-start">
            
            {!result && !isGenerating && (
              <div className="glass rounded-[3rem] border border-white/5 w-full flex flex-col items-center justify-center p-12 sm:p-20 text-center min-h-[600px] shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-blue-600/5 blur-[120px] -z-10" />
                <div className="bg-blue-500/10 w-24 h-24 rounded-[2rem] border border-blue-500/20 flex items-center justify-center mb-8 shadow-2xl rotate-3 group hover:rotate-12 transition-transform">
                  <Sparkles className="w-12 h-12 text-blue-500" />
                </div>
                <h3 className="text-3xl font-black text-white mb-4 tracking-tighter uppercase">AI Ready to Draft</h3>
                <p className="text-gray-500 max-w-sm font-medium leading-relaxed">Fill out the post details and witness 5 professional caption variations optimized for maximum engagement.</p>
              </div>
            )}

            {isGenerating && (
              <div className="glass rounded-[3rem] border border-white/5 w-full flex flex-col items-center justify-center p-12 sm:p-20 text-center min-h-[600px] shadow-2xl">
                <div className="relative mb-8">
                  <motion.div 
                    animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="absolute inset-0 bg-blue-600 rounded-full blur-2xl" 
                  />
                  <RefreshCw className="w-16 h-16 text-white animate-spin relative z-10" />
                </div>
                <h3 className="text-2xl font-black text-white mb-2 tracking-tighter">Crafting Engagement...</h3>
                <p className="text-gray-400 font-medium">Optimizing hooks and hashtags for {data.platform}.</p>
              </div>
            )}

            {result && !isGenerating && (
              <div className="w-full space-y-10">
                {/* Engagement Tips Dashboard */}
                <div className="glass p-8 rounded-[2.5rem] border border-blue-500/20 shadow-[0_0_50px_rgba(37,99,235,0.1)] relative overflow-hidden">
                  <div className="absolute top-0 right-0 bg-blue-600/20 text-blue-400 text-[10px] font-black uppercase tracking-widest px-5 py-2 rounded-bl-2xl border-l border-b border-white/5">
                    Insights
                  </div>
                  <div className="flex items-center gap-3 mb-8">
                    <BarChart2 className="w-6 h-6 text-blue-500" />
                    <h3 className="text-xl font-black text-white tracking-tight">Viral Strategy</h3>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5 backdrop-blur-sm">
                      <div className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest mb-2">
                        <Clock className="w-4 h-4" /> Peak Time
                      </div>
                      <p className="text-sm font-bold text-white leading-tight">{result.tips.time}</p>
                    </div>
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5 backdrop-blur-sm">
                      <div className="flex items-center gap-2 text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-2">
                        <MessageSquare className="w-4 h-4" /> Power Hook
                      </div>
                      <p className="text-sm font-bold text-white line-clamp-2 leading-tight">{result.tips.hook}</p>
                    </div>
                    <div className="bg-white/5 p-5 rounded-2xl border border-white/5 backdrop-blur-sm">
                      <div className="flex items-center gap-2 text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-2">
                        <CheckCircle className="w-4 h-4" /> Smart CTA
                      </div>
                      <p className="text-sm font-bold text-white line-clamp-2 leading-tight">{result.tips.cta}</p>
                    </div>
                  </div>
                </div>

                {/* Hashtags */}
                <div className="glass p-8 rounded-[2.5rem] border border-white/5 shadow-2xl relative group">
                  <div className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-6">
                    <div className="flex items-center gap-3">
                      <Hash className="w-6 h-6 text-blue-500" />
                      <h3 className="text-xl font-black text-white tracking-tight">Smart Hashtags</h3>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(result.hashtags, 'tags')}
                      className="flex items-center gap-2 px-6 py-2.5 text-[10px] font-black uppercase tracking-widest text-blue-400 bg-blue-500/10 border border-blue-500/20 rounded-xl hover:bg-blue-500/20 transition-all active:scale-95"
                    >
                      {copiedTags ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      {copiedTags ? 'Copied' : 'Copy Set'}
                    </button>
                  </div>
                  <p className="text-sm leading-relaxed text-blue-400 font-black break-words tracking-wide">
                    {result.hashtags}
                  </p>
                </div>

                {/* Captions */}
                <div className="space-y-6">
                  {result.captions.map((caption, idx) => (
                    <div key={idx} className="glass p-8 rounded-[2.5rem] border border-white/5 shadow-2xl hover:border-blue-500/30 transition-all group relative">
                      {/* Variation Badge */}
                      <div className="absolute -left-3 top-8 w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center text-sm font-black shadow-2xl rotate-[-12deg] group-hover:rotate-0 transition-transform">
                        {idx + 1}
                      </div>
                      
                      <div className="whitespace-pre-wrap text-base text-gray-300 leading-relaxed font-bold mb-8 pl-6">
                        {caption}
                      </div>
                      
                      <div className="flex justify-end pt-6 border-t border-white/5">
                        <button 
                          onClick={() => copyToClipboard(caption, idx)}
                          className={`flex items-center gap-2 px-6 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all border ${copiedIndex === idx ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-white/5 text-gray-400 border-white/10 hover:bg-white/10 hover:text-white active:scale-95'}`}
                        >
                          {copiedIndex === idx ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          {copiedIndex === idx ? 'Copied' : 'Copy Caption'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* SEO Article Section */}
      <ToolArticle {...toolArticles['caption-generator']} />
    </div>
  );
}
