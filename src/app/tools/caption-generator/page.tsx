"use client";

import Link from 'next/link';
import { useState, useRef } from 'react';
import { 
  Type, Sparkles, RefreshCw, Copy, CheckCircle, 
  AlertCircle, Image as ImageIcon, Upload, Trash2, 
  Settings, MessageSquare, Hash, Clock, BarChart2
} from 'lucide-react';

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
                <Type className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AI Caption Generator</h1>
                <p className="text-sm text-gray-500 mt-1">Create engaging, highly-optimized captions for any social media platform.</p>
              </div>
            </div>
            <div className="flex gap-3 shrink-0">
              <button onClick={resetForm} className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors">
                Reset All
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
          <div className="w-full xl:w-[40%] space-y-6">
            
            {/* Input & Image */}
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Post Details</h2>
              </div>
              
              <div className="space-y-5">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Upload Image (Optional)</label>
                  {!data.imagePreview ? (
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-xl cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-500 font-medium">Click to upload image</p>
                      </div>
                      <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                    </label>
                  ) : (
                    <div className="relative w-full h-40 rounded-xl overflow-hidden border border-gray-200 group">
                      <img src={data.imagePreview} alt="Preview" className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <button onClick={removeImage} className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 shadow-lg transform hover:scale-105 transition-all">
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-2">Topic or Post Description *</label>
                  <textarea 
                    name="topic"
                    rows={4} 
                    value={data.topic} 
                    onChange={handleChange} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow outline-none text-sm resize-none custom-scrollbar" 
                    placeholder="Describe what your post is about... (e.g. My morning coffee routine at the beach)" 
                  />
                </div>
              </div>
            </section>

            {/* Customization */}
            <section className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4 pb-4 border-b border-gray-100">
                <Settings className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">Customization</h2>
              </div>
              <div className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Platform</label>
                    <select name="platform" value={data.platform} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-shadow outline-none text-sm font-medium text-gray-800">
                      <option>Instagram</option>
                      <option>YouTube Shorts</option>
                      <option>LinkedIn</option>
                      <option>Facebook</option>
                      <option>Twitter / X</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Tone</label>
                    <select name="tone" value={data.tone} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-shadow outline-none text-sm font-medium text-gray-800">
                      <option>Viral</option>
                      <option>Funny</option>
                      <option>Professional</option>
                      <option>Emotional</option>
                      <option>Luxury</option>
                      <option>Fitness</option>
                      <option>Motivational</option>
                      <option>Romantic</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Language</label>
                    <select name="language" value={data.language} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-shadow outline-none text-sm font-medium text-gray-800">
                      <option>English</option>
                      <option>Hindi</option>
                      <option>Hinglish</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Length</label>
                    <select name="length" value={data.length} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-shadow outline-none text-sm font-medium text-gray-800">
                      <option>Short</option>
                      <option>Medium</option>
                      <option>Long</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 uppercase tracking-wider mb-1">Hashtag Count</label>
                  <select name="hashtagCount" value={data.hashtagCount} onChange={handleChange} className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white transition-shadow outline-none text-sm font-medium text-gray-800">
                    <option value="5">5 Hashtags</option>
                    <option value="10">10 Hashtags</option>
                    <option value="15">15 Hashtags</option>
                    <option value="20">20 Hashtags</option>
                  </select>
                </div>
              </div>

              <button 
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full mt-6 flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-colors disabled:opacity-50 shadow-md"
              >
                {isGenerating ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Sparkles className="w-5 h-5" />}
                {isGenerating ? 'Analyzing context...' : 'Generate Captions'}
              </button>
            </section>
          </div>

          {/* RIGHT: GENERATED CONTENT */}
          <div className="w-full xl:w-[60%] flex flex-col gap-6">
            
            {!result && !isGenerating && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm h-full flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
                <div className="bg-blue-50 w-20 h-20 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="w-10 h-10 text-blue-500" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Ready to create magic</h3>
                <p className="text-gray-500 max-w-sm">Fill out the post details on the left and hit generate to get 5 highly engaging caption variations tailored for your audience.</p>
              </div>
            )}

            {isGenerating && (
              <div className="bg-white rounded-2xl border border-gray-200 shadow-sm h-full flex flex-col items-center justify-center p-12 text-center min-h-[400px]">
                <RefreshCw className="w-12 h-12 text-blue-600 animate-spin mb-4" />
                <h3 className="text-xl font-bold text-gray-900">Crafting your captions...</h3>
                <p className="text-gray-500 mt-2">Analyzing your topic and optimizing for {data.platform}.</p>
              </div>
            )}

            {result && !isGenerating && (
              <>
                {/* Engagement Tips Dashboard */}
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-4">
                    <BarChart2 className="w-5 h-5 text-blue-600" />
                    <h3 className="text-lg font-bold text-gray-900">Engagement Strategy</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-white p-4 rounded-xl border border-blue-50 shadow-sm">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-blue-600 uppercase tracking-wide mb-1.5">
                        <Clock className="w-3.5 h-3.5" /> Best Time
                      </div>
                      <p className="text-sm font-semibold text-gray-800">{result.tips.time}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-blue-50 shadow-sm">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-600 uppercase tracking-wide mb-1.5">
                        <MessageSquare className="w-3.5 h-3.5" /> Suggested Hook
                      </div>
                      <p className="text-sm font-semibold text-gray-800 line-clamp-2">{result.tips.hook}</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl border border-blue-50 shadow-sm">
                      <div className="flex items-center gap-1.5 text-xs font-bold text-purple-600 uppercase tracking-wide mb-1.5">
                        <CheckCircle className="w-3.5 h-3.5" /> Action (CTA)
                      </div>
                      <p className="text-sm font-semibold text-gray-800 line-clamp-2">{result.tips.cta}</p>
                    </div>
                  </div>
                </div>

                {/* Hashtags */}
                <div className="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm relative group">
                  <div className="flex justify-between items-start mb-3">
                    <div className="flex items-center gap-2">
                      <Hash className="w-5 h-5 text-blue-600" />
                      <h3 className="text-base font-bold text-gray-900">Optimized Hashtags ({data.hashtagCount})</h3>
                    </div>
                    <button 
                      onClick={() => copyToClipboard(result.hashtags, 'tags')}
                      className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-gray-700 bg-gray-100 border border-gray-200 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      {copiedTags ? <CheckCircle className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedTags ? 'Copied' : 'Copy Tags'}
                    </button>
                  </div>
                  <p className="text-[15px] leading-relaxed text-blue-600 font-medium break-words">
                    {result.hashtags}
                  </p>
                </div>

                {/* Captions */}
                <div className="space-y-4">
                  {result.captions.map((caption, idx) => (
                    <div key={idx} className="bg-white p-5 rounded-2xl border border-gray-200 shadow-sm hover:border-blue-300 hover:shadow-md transition-all group relative pl-12">
                      {/* Variation Badge */}
                      <div className="absolute left-4 top-5 w-6 h-6 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center text-xs font-black">
                        {idx + 1}
                      </div>
                      
                      <div className="whitespace-pre-wrap text-[15px] text-gray-800 leading-relaxed font-medium mb-4">
                        {caption}
                      </div>
                      
                      <div className="flex justify-end pt-3 border-t border-gray-50">
                        <button 
                          onClick={() => copyToClipboard(caption, idx)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold rounded-lg transition-colors border ${copiedIndex === idx ? 'bg-emerald-50 text-emerald-700 border-emerald-200' : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'}`}
                        >
                          {copiedIndex === idx ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                          {copiedIndex === idx ? 'Copied to clipboard' : 'Copy caption'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}
