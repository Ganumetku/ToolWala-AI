"use client";

import Link from 'next/link';
import { useState, useEffect, useRef, useCallback } from 'react';
import QRCode from 'qrcode';
import { 
  Link as LinkIcon, 
  Type, 
  Wifi, 
  Mail, 
  Phone, 
  MessageSquare, 
  Download, 
  RotateCcw, 
  Image as ImageIcon,
  Check,
  Smartphone,
  Settings,
  Palette,
  Layout,
  Globe,
  Upload,
  XCircle,
  Eye,
  Sparkles
} from 'lucide-react';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';
import { motion, AnimatePresence } from 'framer-motion';

// QR Types
type QRType = 'URL' | 'Text' | 'WiFi' | 'Email' | 'Phone' | 'SMS';

// Frame Types
type FrameType = 'None' | 'ScanMe' | 'FollowUs' | 'VisitWebsite' | 'ContactUs' | 'WiFiAccess';

interface FrameConfig {
  id: FrameType;
  label: string;
  text: string;
}

const FRAMES: FrameConfig[] = [
  { id: 'None', label: 'No Frame', text: '' },
  { id: 'ScanMe', label: 'Scan Me', text: 'SCAN ME' },
  { id: 'FollowUs', label: 'Follow Us', text: 'FOLLOW US' },
  { id: 'VisitWebsite', label: 'Website', text: 'VISIT WEBSITE' },
  { id: 'ContactUs', label: 'Contact', text: 'CONTACT US' },
  { id: 'WiFiAccess', label: 'WiFi', text: 'WIFI ACCESS' },
];

export default function ProfessionalQRCodeGenerator() {
  const [activeTab, setActiveTab] = useState<QRType>('URL');
  const [inputText, setInputText] = useState('');
  
  // WiFi Fields
  const [wifiSsid, setWifiSsid] = useState('');
  const [wifiPassword, setWifiPassword] = useState('');
  const [wifiEncryption, setWifiEncryption] = useState('WPA');
  
  // Email Fields
  const [emailTo, setEmailTo] = useState('');
  const [emailSubject, setEmailSubject] = useState('');
  const [emailBody, setEmailBody] = useState('');
  
  // Phone/SMS Fields
  const [phone, setPhone] = useState('');
  const [smsMessage, setSmsMessage] = useState('');

  // Customization
  const [fgColor, setFgColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [size, setSize] = useState(300);
  const [margin, setMargin] = useState(1);
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  const [includeMargin, setIncludeMargin] = useState(true);
  
  // Logo
  const [logo, setLogo] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(20); // percentage

  // Frame
  const [selectedFrame, setSelectedFrame] = useState<FrameType>('None');

  // Preview
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Get content based on active tab
  const getQRContent = useCallback(() => {
    switch (activeTab) {
      case 'URL':
        if (!inputText) return '';
        let url = inputText.trim();
        if (url && !url.startsWith('http://') && !url.startsWith('https://')) {
          url = 'https://' + url;
        }
        return url;
      case 'Text':
        return inputText;
      case 'WiFi':
        if (!wifiSsid) return '';
        return `WIFI:S:${wifiSsid};T:${wifiEncryption};P:${wifiPassword};;`;
      case 'Email':
        if (!emailTo) return '';
        return `MATMSG:TO:${emailTo};SUB:${emailSubject};BODY:${emailBody};;`;
      case 'Phone':
        if (!phone) return '';
        return `tel:${phone}`;
      case 'SMS':
        if (!phone) return '';
        return `smsto:${phone}:${smsMessage}`;
      default:
        return '';
    }
  }, [activeTab, inputText, wifiSsid, wifiPassword, wifiEncryption, emailTo, emailSubject, emailBody, phone, smsMessage]);

  // Generate QR on Canvas
  const renderQRCode = useCallback(async () => {
    const content = getQRContent();
    if (!content || !canvasRef.current) return;

    setIsGenerating(true);
    try {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Reset canvas size for higher resolution output
      const baseSize = 1000; 
      const padding = 60; // Internal high-res padding
      const totalWidth = baseSize + (padding * 2);
      
      let totalHeight = totalWidth;
      let qrYOffset = padding;
      
      const frameHeight = selectedFrame !== 'None' ? baseSize * 0.25 : 0;
      if (selectedFrame !== 'None') {
        totalHeight += frameHeight;
      }

      canvas.width = totalWidth;
      canvas.height = totalHeight;

      // Draw Background
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      // Temporary canvas for QR only
      const qrCanvas = document.createElement('canvas');
      await QRCode.toCanvas(qrCanvas, content, {
        width: baseSize,
        margin: includeMargin ? margin : 0,
        errorCorrectionLevel: errorLevel,
        color: {
          dark: fgColor,
          light: bgColor,
        },
      });

      // Draw QR on main canvas
      ctx.drawImage(qrCanvas, padding, qrYOffset, baseSize, baseSize);

      // Draw Logo if exists
      if (logo) {
        const logoImg = new Image();
        logoImg.src = logo;
        await new Promise((resolve) => {
          logoImg.onload = resolve;
        });

        const lSize = (baseSize * logoSize) / 100;
        const lx = (totalWidth - lSize) / 2;
        const ly = (baseSize - lSize) / 2 + qrYOffset;

        // Draw white background for logo area
        ctx.fillStyle = bgColor;
        ctx.fillRect(lx - 10, ly - 10, lSize + 20, lSize + 20);
        
        ctx.drawImage(logoImg, lx, ly, lSize, lSize);
      }

      // Draw Frame if selected
      if (selectedFrame !== 'None') {
        const frameConfig = FRAMES.find(f => f.id === selectedFrame);
        if (frameConfig) {
          // Add bottom frame area
          ctx.fillStyle = fgColor;
          const frameY = baseSize + padding;
          ctx.fillRect(padding, frameY, baseSize, frameHeight);

          // Add text
          ctx.fillStyle = bgColor;
          ctx.font = `bold ${baseSize * 0.08}px Inter, system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(frameConfig.text, totalWidth / 2, frameY + frameHeight / 2);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsGenerating(false);
    }
  }, [getQRContent, fgColor, bgColor, margin, errorLevel, includeMargin, logo, logoSize, selectedFrame]);

  useEffect(() => {
    const timer = setTimeout(() => {
      renderQRCode();
    }, 300);
    return () => clearTimeout(timer);
  }, [renderQRCode]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogo(event.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadPNG = () => {
    if (!canvasRef.current) return;
    const link = document.createElement('a');
    link.download = `qrcode_${activeTab.toLowerCase()}.png`;
    link.href = canvasRef.current.toDataURL('image/png', 1.0);
    link.click();
  };

  const resetAll = () => {
    setInputText('');
    setWifiSsid('');
    setWifiPassword('');
    setEmailTo('');
    setPhone('');
    setLogo(null);
    setSelectedFrame('None');
    setFgColor('#000000');
    setBgColor('#ffffff');
  };

  return (
    <div className="bg-[#030712] min-h-screen py-24 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[500px] bg-blue-600/5 blur-[120px] -z-10" />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors mb-10 group">
          <RotateCcw className="h-4 w-4 group-hover:-rotate-45 transition-transform" />
          Back to Directory
        </Link>
        
        {/* HEADER */}
        <div className="glass rounded-[2.5rem] border border-white/5 p-8 sm:p-10 mb-10 shadow-2xl relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-600/5 blur-[80px] -z-10" />
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-8">
            <div className="flex items-center gap-6">
              <div className="flex h-16 w-16 items-center justify-center rounded-[1.5rem] bg-blue-600 text-white shadow-[0_0_30px_rgba(37,99,235,0.4)] border border-blue-400/20">
                <Globe className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Professional QR Generator</h1>
                <p className="text-gray-400 font-medium mt-1">Create, customize, and brand your QR codes instantly.</p>
              </div>
            </div>
            <div className="flex gap-4 shrink-0">
              <button onClick={resetAll} className="px-6 py-3.5 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-white/5 border border-white/5 rounded-2xl hover:bg-white/10 hover:text-white transition-all active:scale-95">
                <RotateCcw className="w-4 h-4 mr-2" /> Reset Studio
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-10">
          
          {/* LEFT: SETTINGS */}
          <div className="w-full lg:w-[60%] space-y-10">
            
            {/* TYPE SELECTION */}
            <div className="glass p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
              <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                <Settings className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-black text-white tracking-tight uppercase">1. Select Data Type</h2>
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                {[
                  { id: 'URL', icon: LinkIcon, label: 'URL' },
                  { id: 'Text', icon: Type, label: 'Text' },
                  { id: 'WiFi', icon: Wifi, label: 'WiFi' },
                  { id: 'Email', icon: Mail, label: 'Email' },
                  { id: 'Phone', icon: Phone, label: 'Phone' },
                  { id: 'SMS', icon: MessageSquare, label: 'SMS' },
                ].map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setActiveTab(type.id as QRType)}
                    className={`flex flex-col items-center gap-3 p-4 rounded-[1.5rem] transition-all border-2 ${
                      activeTab === type.id 
                        ? 'bg-blue-600/10 border-blue-600 text-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.2)]' 
                        : 'bg-white/5 border-transparent text-gray-500 hover:bg-white/10 hover:border-white/10'
                    }`}
                  >
                    <type.icon className="w-6 h-6" />
                    <span className="text-[10px] font-black uppercase tracking-widest">{type.label}</span>
                  </button>
                ))}
              </div>

              {/* INPUT FIELDS */}
              <div className="mt-10 space-y-6">
                {activeTab === 'URL' && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Website URL</label>
                    <input 
                      type="text" 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm font-black text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-700"
                      placeholder="e.g. www.toolwala.co"
                    />
                  </div>
                )}
                
                {activeTab === 'Text' && (
                  <div className="space-y-3">
                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Plain Text Content</label>
                    <textarea 
                      rows={4}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-6 py-5 text-sm font-black text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-700 resize-none custom-scrollbar"
                      placeholder="Enter any text you want to encode..."
                    />
                  </div>
                )}

                {activeTab === 'WiFi' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="sm:col-span-2 space-y-3">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Network Name (SSID)</label>
                      <input type="text" value={wifiSsid} onChange={e => setWifiSsid(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm font-black text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-700" placeholder="My Home WiFi" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Password</label>
                      <input type="password" value={wifiPassword} onChange={e => setWifiPassword(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm font-black text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-700" placeholder="••••••••" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Encryption</label>
                      <select value={wifiEncryption} onChange={e => setWifiEncryption(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm font-black text-white focus:border-blue-500/50 outline-none transition-all appearance-none cursor-pointer">
                        <option className="bg-slate-900" value="WPA">WPA/WPA2</option>
                        <option className="bg-slate-900" value="WEP">WEP</option>
                        <option className="bg-slate-900" value="nopass">None</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeTab === 'Email' && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Email Recipient</label>
                      <input type="email" value={emailTo} onChange={e => setEmailTo(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm font-black text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-700" placeholder="hello@example.com" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Subject</label>
                      <input type="text" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm font-black text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-700" placeholder="Inquiry" />
                    </div>
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Message Body</label>
                      <textarea rows={3} value={emailBody} onChange={e => setEmailBody(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-6 py-5 text-sm font-black text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-700 resize-none custom-scrollbar" placeholder="Type your email content..." />
                    </div>
                  </div>
                )}

                {(activeTab === 'Phone' || activeTab === 'SMS') && (
                  <div className="space-y-6">
                    <div className="space-y-3">
                      <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Phone Number</label>
                      <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-5 text-sm font-black text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-700" placeholder="+1 (555) 000-0000" />
                    </div>
                    {activeTab === 'SMS' && (
                      <div className="space-y-3">
                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">SMS Message</label>
                        <textarea rows={3} value={smsMessage} onChange={e => setSmsMessage(e.target.value)} className="w-full bg-white/5 border border-white/10 rounded-[2rem] px-6 py-5 text-sm font-black text-white focus:border-blue-500/50 outline-none transition-all placeholder:text-gray-700 resize-none custom-scrollbar" placeholder="Type your text message..." />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* CUSTOMIZATION */}
            <div className="glass p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
              <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                <Palette className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-black text-white tracking-tight uppercase">2. Design & Branding</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                {/* Colors */}
                <div className="space-y-6">
                  <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10 group hover:border-blue-500/30 transition-all">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">QR Color</span>
                    <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} className="w-12 h-12 rounded-xl cursor-pointer border-2 border-white/10 bg-transparent overflow-hidden" />
                  </div>
                  <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10 group hover:border-blue-500/30 transition-all">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Background</span>
                    <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-12 h-12 rounded-xl cursor-pointer border-2 border-white/10 bg-transparent overflow-hidden" />
                  </div>
                  <div className="flex items-center justify-between p-5 bg-white/5 rounded-2xl border border-white/10">
                    <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Include Margin</span>
                    <button 
                      onClick={() => setIncludeMargin(!includeMargin)}
                      className={`w-14 h-7 rounded-full transition-all relative ${includeMargin ? 'bg-blue-600' : 'bg-white/10'}`}
                    >
                      <div className={`absolute top-1 w-5 h-5 bg-white rounded-full transition-all shadow-xl ${includeMargin ? 'left-8' : 'left-1'}`} />
                    </button>
                  </div>
                </div>

                {/* Logo Upload */}
                <div className="space-y-5">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">Center Logo</label>
                  <div className="relative group">
                    <label className="flex flex-col items-center justify-center w-full h-40 border-2 border-dashed border-white/10 rounded-[2rem] cursor-pointer bg-white/5 hover:bg-white/[0.08] hover:border-blue-500/50 transition-all group overflow-hidden">
                      {logo ? (
                        <div className="relative z-10">
                          <img src={logo} alt="Logo" className="w-20 h-20 object-contain rounded-xl shadow-2xl" />
                          <button 
                            onClick={(e) => { e.preventDefault(); setLogo(null); }}
                            className="absolute -top-3 -right-3 bg-red-600 text-white p-1.5 rounded-full shadow-2xl transition-all hover:scale-110"
                          >
                            <XCircle className="w-5 h-5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-3">
                          <div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-500 group-hover:text-blue-400 transition-colors">
                            <Upload className="w-6 h-6" />
                          </div>
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Upload Branding</span>
                        </div>
                      )}
                      <input type="file" className="hidden" onChange={handleLogoUpload} accept="image/*" />
                      <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                    </label>
                  </div>
                  {logo && (
                    <div className="pt-4 space-y-4">
                      <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest ml-1">
                        <span>Logo Size</span>
                        <span className="text-blue-500">{logoSize}%</span>
                      </div>
                      <input type="range" min="10" max="30" value={logoSize} onChange={e => setLogoSize(parseInt(e.target.value))} className="w-full h-2 bg-white/5 rounded-full appearance-none cursor-pointer accent-blue-600" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* FRAMES */}
            <div className="glass p-8 rounded-[2.5rem] border border-white/5 shadow-2xl">
              <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-6">
                <Layout className="w-5 h-5 text-blue-500" />
                <h2 className="text-xl font-black text-white tracking-tight uppercase">3. Select Frame Template</h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
                {FRAMES.map((frame) => (
                  <button
                    key={frame.id}
                    onClick={() => setSelectedFrame(frame.id)}
                    className={`p-6 rounded-[2rem] border-2 transition-all flex flex-col items-center gap-4 group ${
                      selectedFrame === frame.id 
                        ? 'border-blue-600 bg-blue-600/10 text-blue-500 shadow-[0_0_20px_rgba(37,99,235,0.2)]' 
                        : 'border-white/5 bg-white/5 text-gray-500 hover:border-white/10 hover:bg-white/[0.08]'
                    }`}
                  >
                    <div className={`w-14 h-20 border-2 rounded-lg relative flex flex-col items-center justify-center transition-all ${selectedFrame === frame.id ? 'border-blue-400' : 'border-white/20 group-hover:border-white/40'}`}>
                      <div className={`w-10 h-10 rounded-sm mb-1 ${selectedFrame === frame.id ? 'bg-blue-600/20' : 'bg-white/10'}`} />
                      {frame.id !== 'None' && (
                        <div className="absolute bottom-0 w-full h-4 bg-current opacity-20" />
                      )}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest transition-colors group-hover:text-white">{frame.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: LIVE PREVIEW */}
          <div className="w-full lg:w-[40%]">
            <div className="sticky top-32 space-y-8">
              <div className="glass p-10 rounded-[3rem] shadow-[0_0_80px_rgba(37,99,235,0.15)] border border-white/5 flex flex-col items-center relative overflow-hidden">
                <div className="absolute top-0 right-0 p-10">
                   <div className="bg-blue-600/10 text-blue-500 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-xl border border-blue-500/20 flex items-center gap-2 backdrop-blur-md">
                    <Eye className="w-4 h-4" /> Live
                  </div>
                </div>

                <div className="w-full mb-12">
                  <h3 className="text-2xl font-black text-white tracking-tight uppercase">Studio Preview</h3>
                  <p className="text-gray-500 font-medium mt-1">Real-time generation engine.</p>
                </div>

                {/* QR PREVIEW CARD */}
                <div className="w-full aspect-square relative group bg-black/40 rounded-[2.5rem] p-10 shadow-inner flex items-center justify-center border border-white/5">
                  <div className="absolute inset-0 bg-grid-pattern opacity-[0.03] rounded-[2.5rem]" />
                  
                  {!getQRContent() ? (
                    <div className="text-center p-8 space-y-6 relative z-10 opacity-30">
                      <div className="w-24 h-24 bg-white/5 rounded-[2rem] flex items-center justify-center mx-auto border border-white/10">
                        <Smartphone className="w-12 h-12 text-gray-500" />
                      </div>
                      <p className="text-[10px] font-black text-gray-500 uppercase tracking-[0.3em] leading-loose">Enter configuration to <br /> initiate preview</p>
                    </div>
                  ) : (
                    <div className="relative bg-white p-2 rounded-[1.5rem] shadow-[0_0_50px_rgba(255,255,255,0.1)] transition-all duration-700 hover:scale-[1.05] z-10 group-hover:shadow-[0_0_80px_rgba(37,99,235,0.3)]">
                      <canvas 
                        ref={canvasRef} 
                        className="w-full h-auto rounded-xl block"
                        style={{ maxWidth: '100%', objectFit: 'contain' }}
                      />
                      {isGenerating && (
                        <div className="absolute inset-0 bg-white/80 backdrop-blur-[2px] flex items-center justify-center rounded-xl">
                          <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* DOWNLOAD CONTROLS */}
                <div className="w-full mt-12 space-y-4">
                  <button 
                    onClick={downloadPNG}
                    disabled={!getQRContent()}
                    className="w-full flex items-center justify-center gap-4 bg-blue-600 text-white py-6 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-blue-500 transition-all shadow-[0_0_40px_rgba(37,99,235,0.4)] disabled:opacity-20 disabled:grayscale active:scale-95 group"
                  >
                    <Download className="w-5 h-5 group-hover:translate-y-1 transition-transform" />
                    Download Master Assets
                  </button>
                  <p className="text-[10px] text-gray-600 font-black uppercase tracking-[0.2em] text-center">Ultra-High Res 1000x1000px Output</p>
                </div>
              </div>

              {/* QUICK TIP */}
              <div className="bg-gradient-to-br from-blue-600 to-indigo-900 rounded-[3rem] p-10 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-[60px] pointer-events-none group-hover:scale-150 transition-transform duration-1000" />
                <h4 className="text-xl font-black mb-3 flex items-center gap-3 uppercase tracking-tight">
                  <Sparkles className="w-6 h-6 text-amber-400" /> Marketing Tip
                </h4>
                <p className="text-sm text-blue-100 font-medium leading-relaxed">
                  Branded QR codes with custom frames increase user engagement by up to 40% compared to standard generic codes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hidden Download Helpers */}
      <canvas ref={canvasRef} className="hidden" />
      
      {/* SEO Article Section */}
      <ToolArticle {...toolArticles['qr-code-generator']} />
    </div>
  );

}
