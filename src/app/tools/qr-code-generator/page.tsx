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
  Copy,
  Check,
  Palette, 
  Layout, 
  Globe, 
  Upload, 
  Trash2, 
  Eye, 
  Sparkles,
  QrCode,
  FileCode,
  ShieldCheck,
  HelpCircle
} from 'lucide-react';
import ToolLayout from '@/components/tools/ToolLayout';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';
import { toast } from 'sonner';
import PdfToolIcon from '@/components/PdfToolIcon';

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

const COLOR_PRESETS = [
  { name: 'Obsidian', fg: '#000000', bg: '#FFFFFF' },
  { name: 'Royal Blue', fg: '#2563EB', bg: '#FFFFFF' },
  { name: 'Emerald', fg: '#059669', bg: '#FFFFFF' },
  { name: 'Violet', fg: '#7C3AED', bg: '#FFFFFF' },
  { name: 'Sunset Red', fg: '#DC2626', bg: '#FFFFFF' },
  { name: 'Midnight', fg: '#0F172A', bg: '#F8FAFC' },
];

export default function ProfessionalQRCodeGenerator() {
  const [activeTab, setActiveTab] = useState<QRType>('URL');
  const [inputText, setInputText] = useState('https://www.toolwala.co');
  
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
  const [margin, setMargin] = useState(1);
  const [errorLevel, setErrorLevel] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  const [includeMargin, setIncludeMargin] = useState(true);
  
  // Logo
  const [logo, setLogo] = useState<string | null>(null);
  const [logoSize, setLogoSize] = useState(20); // percentage

  // Frame
  const [selectedFrame, setSelectedFrame] = useState<FrameType>('None');

  // Preview & Status
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

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

      // Base high resolution canvas output
      const baseSize = 1000; 
      const padding = 60;
      const totalWidth = baseSize + (padding * 2);
      
      let totalHeight = totalWidth;
      let qrYOffset = padding;
      
      const frameHeight = selectedFrame !== 'None' ? baseSize * 0.22 : 0;
      if (selectedFrame !== 'None') {
        totalHeight += frameHeight;
      }

      canvas.width = totalWidth;
      canvas.height = totalHeight;

      // Draw Canvas Background
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
        const pad = 12;

        // Draw soft rounded background for logo area
        ctx.fillStyle = bgColor;
        ctx.beginPath();
        const rx = lx - pad;
        const ry = ly - pad;
        const rw = lSize + (pad * 2);
        const rh = lSize + (pad * 2);
        const radius = 16;
        ctx.roundRect(rx, ry, rw, rh, radius);
        ctx.fill();
        
        ctx.drawImage(logoImg, lx, ly, lSize, lSize);
      }

      // Draw Frame if selected
      if (selectedFrame !== 'None') {
        const frameConfig = FRAMES.find(f => f.id === selectedFrame);
        if (frameConfig) {
          const frameY = baseSize + padding;
          
          // Draw frame container
          ctx.fillStyle = fgColor;
          ctx.beginPath();
          ctx.roundRect(padding, frameY, baseSize, frameHeight - 10, 16);
          ctx.fill();

          // Draw frame text
          ctx.fillStyle = bgColor;
          ctx.font = `bold ${baseSize * 0.075}px Inter, -apple-system, system-ui, sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(frameConfig.text, totalWidth / 2, frameY + (frameHeight - 10) / 2);
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
    }, 250);
    return () => clearTimeout(timer);
  }, [renderQRCode]);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        toast.error('Please upload an image file (PNG, JPG, SVG, etc.)');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        setLogo(event.target?.result as string);
        toast.success('Logo added to QR code');
      };
      reader.readAsDataURL(file);
    }
  };

  const downloadPNG = () => {
    if (!canvasRef.current || !getQRContent()) return;
    const link = document.createElement('a');
    link.download = `qrcode_${activeTab.toLowerCase()}_toolwala.png`;
    link.href = canvasRef.current.toDataURL('image/png', 1.0);
    link.click();
    toast.success('High-resolution PNG downloaded!');
  };

  const downloadSVG = async () => {
    const content = getQRContent();
    if (!content) return;
    try {
      const svgString = await QRCode.toString(content, {
        type: 'svg',
        margin: includeMargin ? margin : 0,
        errorCorrectionLevel: errorLevel,
        color: {
          dark: fgColor,
          light: bgColor,
        }
      });
      const blob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
      const link = document.createElement('a');
      link.download = `qrcode_${activeTab.toLowerCase()}_toolwala.svg`;
      link.href = URL.createObjectURL(blob);
      link.click();
      URL.revokeObjectURL(link.href);
      toast.success('Vector SVG downloaded!');
    } catch (err) {
      console.error('SVG export failed:', err);
      toast.error('Could not generate SVG vector');
    }
  };

  const copyToClipboard = async () => {
    if (!canvasRef.current || !getQRContent()) return;
    try {
      canvasRef.current.toBlob(async (blob) => {
        if (!blob) {
          toast.error('Failed to copy QR code');
          return;
        }
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ]);
        setCopied(true);
        toast.success('QR Code copied to clipboard!');
        setTimeout(() => setCopied(false), 2000);
      }, 'image/png', 1.0);
    } catch (err) {
      console.error('Clipboard copy failed:', err);
      toast.error('Clipboard copy is not supported in this browser');
    }
  };

  const resetAll = () => {
    setInputText('https://www.toolwala.co');
    setWifiSsid('');
    setWifiPassword('');
    setEmailTo('');
    setPhone('');
    setSmsMessage('');
    setLogo(null);
    setSelectedFrame('None');
    setFgColor('#000000');
    setBgColor('#ffffff');
    setErrorLevel('H');
    setIncludeMargin(true);
    toast.info('Studio reset to default configuration');
  };

  return (
    <ToolLayout>
      {/* COMPACT STUDIO HEADER */}
      <div className="bg-white dark:bg-slate-900/75 border border-slate-200/80 dark:border-white/10 rounded-2xl p-4 sm:p-5 mb-6 shadow-xs backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <PdfToolIcon toolId="qr-code-generator" size="xl" className="shrink-0" />
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg sm:text-xl font-black text-slate-900 dark:text-white tracking-tight">
                  Professional QR Generator
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                  <ShieldCheck className="w-3 h-3" /> 100% Client-Side
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-0.5">
                Create, customize, and download high-resolution QR codes with custom branding and frames.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-center shrink-0">
            <button 
              type="button"
              onClick={resetAll} 
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 bg-slate-100 hover:bg-slate-200/80 dark:bg-white/5 dark:hover:bg-white/10 border border-slate-200/80 dark:border-white/5 rounded-xl transition-all cursor-pointer active:scale-95"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* 2-COLUMN STUDIO WORKSPACE */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start mb-12">
        
        {/* LEFT COLUMN: CONTROLS & SETTINGS (7 COLS) */}
        <div className="lg:col-span-7 space-y-5">
          
          {/* STEP 1: TYPE SELECTION & CONTENT */}
          <div className="bg-white dark:bg-slate-900/75 border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 shadow-xs backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3.5 mb-4">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold">1</span>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Select Data Type</h2>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Step 1 of 3</span>
            </div>
            
            {/* DATA TYPE BUTTONS */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {[
                { id: 'URL', icon: LinkIcon, label: 'URL' },
                { id: 'Text', icon: Type, label: 'Text' },
                { id: 'WiFi', icon: Wifi, label: 'WiFi' },
                { id: 'Email', icon: Mail, label: 'Email' },
                { id: 'Phone', icon: Phone, label: 'Phone' },
                { id: 'SMS', icon: MessageSquare, label: 'SMS' },
              ].map((type) => {
                const isActive = activeTab === type.id;
                return (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setActiveTab(type.id as QRType)}
                    className={`flex flex-col items-center justify-center gap-1.5 py-2.5 px-2 rounded-xl transition-all border font-semibold text-xs cursor-pointer ${
                      isActive
                        ? 'bg-blue-600 text-white border-blue-600 shadow-xs shadow-blue-500/20' 
                        : 'bg-slate-50 dark:bg-white/5 border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10 hover:text-slate-900 dark:hover:text-white'
                    }`}
                  >
                    <type.icon className="w-4 h-4" />
                    <span>{type.label}</span>
                  </button>
                );
              })}
            </div>

            {/* INPUT FIELDS ACCORDING TO TYPE */}
            <div className="mt-4 pt-4 border-t border-slate-100 dark:border-white/5">
              {activeTab === 'URL' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Target Website URL</label>
                    <span className="text-[11px] text-slate-400">e.g. https://domain.com</span>
                  </div>
                  <input 
                    type="text" 
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-600/10 dark:focus:ring-blue-500/20 outline-none transition-all"
                    placeholder="https://example.com"
                  />
                </div>
              )}
              
              {activeTab === 'Text' && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Plain Text Content</label>
                    <span className="text-[11px] text-slate-400">{inputText.length} characters</span>
                  </div>
                  <textarea 
                    rows={3}
                    value={inputText}
                    onChange={(e) => setInputText(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-600 dark:focus:border-blue-500 focus:ring-2 focus:ring-blue-600/10 dark:focus:ring-blue-500/20 outline-none transition-all resize-none"
                    placeholder="Enter any text you want to encode..."
                  />
                </div>
              )}

              {activeTab === 'WiFi' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2 space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Network Name (SSID)</label>
                    <input 
                      type="text" 
                      value={wifiSsid} 
                      onChange={e => setWifiSsid(e.target.value)} 
                      className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-600 outline-none transition-all" 
                      placeholder="e.g. Home_WiFi_5G" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Password</label>
                    <input 
                      type="password" 
                      value={wifiPassword} 
                      onChange={e => setWifiPassword(e.target.value)} 
                      className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-600 outline-none transition-all" 
                      placeholder="••••••••" 
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Security Encryption</label>
                    <select 
                      value={wifiEncryption} 
                      onChange={e => setWifiEncryption(e.target.value)} 
                      className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-white focus:bg-white dark:focus:bg-slate-800 focus:border-blue-600 outline-none transition-all cursor-pointer"
                    >
                      <option value="WPA">WPA / WPA2 / WPA3 (Recommended)</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">None (Open Network)</option>
                    </select>
                  </div>
                </div>
              )}

              {activeTab === 'Email' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Email Recipient</label>
                      <input 
                        type="email" 
                        value={emailTo} 
                        onChange={e => setEmailTo(e.target.value)} 
                        className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-600 outline-none transition-all" 
                        placeholder="contact@company.com" 
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Subject</label>
                      <input 
                        type="text" 
                        value={emailSubject} 
                        onChange={e => setEmailSubject(e.target.value)} 
                        className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-600 outline-none transition-all" 
                        placeholder="Inquiry or Feedback" 
                      />
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pre-filled Body</label>
                    <textarea 
                      rows={2} 
                      value={emailBody} 
                      onChange={e => setEmailBody(e.target.value)} 
                      className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-600 outline-none transition-all resize-none" 
                      placeholder="Hi there, I wanted to reach out regarding..." 
                    />
                  </div>
                </div>
              )}

              {(activeTab === 'Phone' || activeTab === 'SMS') && (
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Phone Number (with Country Code)</label>
                    <input 
                      type="text" 
                      value={phone} 
                      onChange={e => setPhone(e.target.value)} 
                      className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-600 outline-none transition-all" 
                      placeholder="+1 (555) 000-0000" 
                    />
                  </div>
                  {activeTab === 'SMS' && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Pre-filled SMS Message</label>
                      <textarea 
                        rows={2} 
                        value={smsMessage} 
                        onChange={e => setSmsMessage(e.target.value)} 
                        className="w-full bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-medium text-slate-900 dark:text-white placeholder:text-slate-400 focus:bg-white dark:focus:bg-slate-800 focus:border-blue-600 outline-none transition-all resize-none" 
                        placeholder="Type your SMS message..." 
                      />
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* STEP 2: DESIGN & BRANDING */}
          <div className="bg-white dark:bg-slate-900/75 border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 shadow-xs backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3.5 mb-4">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold">2</span>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Design & Colors</h2>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Step 2 of 3</span>
            </div>

            {/* COLOR PRESETS */}
            <div className="mb-4">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2 block">Quick Color Presets</label>
              <div className="flex flex-wrap gap-2">
                {COLOR_PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => {
                      setFgColor(preset.fg);
                      setBgColor(preset.bg);
                    }}
                    className={`inline-flex items-center gap-2 px-2.5 py-1.5 rounded-lg border text-xs font-medium transition-all cursor-pointer ${
                      fgColor === preset.fg && bgColor === preset.bg
                        ? 'border-blue-600 bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 ring-1 ring-blue-600'
                        : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-700 dark:text-slate-300 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    <span className="w-3 h-3 rounded-full border border-black/10 shrink-0" style={{ backgroundColor: preset.fg }} />
                    <span>{preset.name}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* CUSTOM COLORS & MARGIN */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
              {/* Foreground Color */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/80 dark:border-white/10">
                <div className="min-w-0 pr-2">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block uppercase">QR Color</span>
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase">{fgColor}</span>
                </div>
                <input 
                  type="color" 
                  value={fgColor} 
                  onChange={e => setFgColor(e.target.value)} 
                  className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-600 bg-transparent shrink-0" 
                />
              </div>

              {/* Background Color */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/80 dark:border-white/10">
                <div className="min-w-0 pr-2">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block uppercase">Background</span>
                  <span className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase">{bgColor}</span>
                </div>
                <input 
                  type="color" 
                  value={bgColor} 
                  onChange={e => setBgColor(e.target.value)} 
                  className="w-8 h-8 rounded-lg cursor-pointer border border-slate-300 dark:border-slate-600 bg-transparent shrink-0" 
                />
              </div>

              {/* Include Margin Toggle */}
              <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/80 dark:border-white/10">
                <div className="min-w-0 pr-2">
                  <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block uppercase">Quiet Zone</span>
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">
                    {includeMargin ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <button 
                  type="button"
                  onClick={() => setIncludeMargin(!includeMargin)}
                  className={`w-11 h-6 rounded-full transition-colors relative cursor-pointer ${
                    includeMargin ? 'bg-blue-600' : 'bg-slate-300 dark:bg-slate-700'
                  }`}
                >
                  <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-transform shadow-xs ${
                    includeMargin ? 'left-6' : 'left-1'
                  }`} />
                </button>
              </div>
            </div>

            {/* ADVANCED: ERROR CORRECTION & LOGO */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3 border-t border-slate-100 dark:border-white/5">
              
              {/* Error Correction Selection */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Error Correction</label>
                  <span className="text-[10px] text-blue-600 dark:text-blue-400 font-bold">Recommended: High</span>
                </div>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['L', 'M', 'Q', 'H'] as const).map((lvl) => (
                    <button
                      key={lvl}
                      type="button"
                      onClick={() => setErrorLevel(lvl)}
                      className={`py-1.5 text-xs font-bold rounded-lg border transition-all cursor-pointer ${
                        errorLevel === lvl
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-white/5 border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/10'
                      }`}
                    >
                      {lvl} ({lvl === 'L' ? '7%' : lvl === 'M' ? '15%' : lvl === 'Q' ? '25%' : '30%'})
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-400 dark:text-slate-500">
                  Higher redundancy allows QR codes to scan smoothly even when damaged or covered by logos.
                </p>
              </div>

              {/* Logo Upload Dropzone */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">Center Logo / Icon</label>
                
                {logo ? (
                  <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/80 dark:border-white/10">
                    <div className="flex items-center gap-2.5">
                      <img src={logo} alt="Custom Logo" className="w-9 h-9 object-contain rounded-lg border border-slate-200 bg-white p-1" />
                      <div className="text-xs">
                        <span className="font-semibold text-slate-900 dark:text-white block">Logo Loaded</span>
                        <span className="text-[11px] text-slate-400">Size: {logoSize}%</span>
                      </div>
                    </div>
                    <button 
                      type="button"
                      onClick={() => setLogo(null)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-500/10 rounded-lg transition-colors cursor-pointer"
                      title="Remove Logo"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <label className="flex items-center justify-center gap-2 p-2.5 border border-dashed border-slate-300 dark:border-white/20 rounded-xl cursor-pointer bg-slate-50 dark:bg-white/5 hover:bg-slate-100/80 dark:hover:bg-white/10 hover:border-blue-500 transition-all text-xs font-semibold text-slate-600 dark:text-slate-400 group">
                    <Upload className="w-4 h-4 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    <span>Upload Logo (PNG / JPG)</span>
                    <input type="file" className="hidden" onChange={handleLogoUpload} accept="image/*" />
                  </label>
                )}

                {logo && (
                  <div className="flex items-center gap-3 pt-1">
                    <span className="text-[10px] font-semibold text-slate-400 uppercase">Scale</span>
                    <input 
                      type="range" 
                      min="12" 
                      max="28" 
                      value={logoSize} 
                      onChange={e => setLogoSize(parseInt(e.target.value))} 
                      className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600" 
                    />
                    <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 w-8 text-right">{logoSize}%</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* STEP 3: FRAMES & CALL TO ACTION */}
          <div className="bg-white dark:bg-slate-900/75 border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 shadow-xs backdrop-blur-md">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3.5 mb-4">
              <div className="flex items-center gap-2">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold">3</span>
                <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Select Frame Template</h2>
              </div>
              <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">Step 3 of 3</span>
            </div>

            <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
              {FRAMES.map((frame) => {
                const isSelected = selectedFrame === frame.id;
                return (
                  <button
                    key={frame.id}
                    type="button"
                    onClick={() => setSelectedFrame(frame.id)}
                    className={`py-2 px-2 rounded-xl border text-center transition-all cursor-pointer flex flex-col items-center gap-1.5 ${
                      isSelected
                        ? 'bg-blue-50 dark:bg-blue-600/10 border-blue-600 dark:border-blue-500 text-blue-600 dark:text-blue-400 ring-1 ring-blue-600/30'
                        : 'bg-slate-50 dark:bg-white/5 border-slate-200/80 dark:border-white/10 text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'
                    }`}
                  >
                    <div className={`w-8 h-10 border rounded flex flex-col items-center justify-center relative ${
                      isSelected ? 'border-blue-500 bg-white dark:bg-slate-900' : 'border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900'
                    }`}>
                      <div className={`w-5 h-5 rounded-xs ${isSelected ? 'bg-blue-600/20' : 'bg-slate-200 dark:bg-slate-700'}`} />
                      {frame.id !== 'None' && (
                        <div className={`w-full h-1.5 mt-0.5 rounded-b-xs ${isSelected ? 'bg-blue-600' : 'bg-slate-400 dark:bg-slate-600'}`} />
                      )}
                    </div>
                    <span className="text-[11px] font-medium leading-none">{frame.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: STICKY LIVE PREVIEW & EXPORT (5 COLS) */}
        <div className="lg:col-span-5">
          <div className="lg:sticky lg:top-8 space-y-4">
            
            {/* STUDIO PREVIEW CARD */}
            <div className="bg-white dark:bg-slate-900/75 border border-slate-200/80 dark:border-white/10 rounded-2xl p-5 shadow-xs dark:shadow-xl backdrop-blur-md">
              
              {/* Preview Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/5 mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">Live Preview</h3>
                  <p className="text-[11px] text-slate-400 mt-0.5">Real-time vector rendering engine</p>
                </div>
                <div className="flex items-center gap-1.5 bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-500/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </div>
              </div>

              {/* QR Code Canvas Frame */}
              <div className="relative rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-100/70 dark:bg-slate-950/70 p-4 sm:p-6 flex flex-col items-center justify-center min-h-[300px] sm:min-h-[340px] shadow-inner overflow-hidden">
                
                {/* Subtle dot pattern */}
                <div 
                  className="absolute inset-0 opacity-[0.25] dark:opacity-[0.1] pointer-events-none"
                  style={{
                    backgroundImage: 'radial-gradient(#64748b 1px, transparent 1px)',
                    backgroundSize: '16px 16px'
                  }}
                />

                {!getQRContent() ? (
                  <div className="text-center p-6 space-y-3 relative z-10">
                    <div className="w-14 h-14 bg-white dark:bg-slate-900 rounded-2xl flex items-center justify-center mx-auto border border-slate-200 dark:border-slate-800 shadow-xs text-slate-400">
                      <QrCode className="w-7 h-7" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold uppercase tracking-wider text-slate-700 dark:text-slate-300">Ready to Generate</p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-[200px] mx-auto">Enter text or URL to preview your branded QR code</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative bg-white p-3 rounded-xl shadow-lg border border-slate-200/80 dark:border-slate-700/80 transition-transform duration-300 hover:scale-[1.02] z-10 max-w-[260px] sm:max-w-[280px]">
                    <canvas 
                      ref={canvasRef} 
                      className="w-full h-auto rounded-lg block"
                      style={{ maxWidth: '100%', objectFit: 'contain' }}
                    />
                    {isGenerating && (
                      <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xs flex items-center justify-center rounded-xl">
                        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* SPECIFICATIONS BAR */}
              <div className="grid grid-cols-3 gap-2 text-center py-2 px-3 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-white/5 text-[11px] text-slate-600 dark:text-slate-400 mt-4">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Format</span>
                  <span className="font-bold text-slate-900 dark:text-white">PNG & SVG</span>
                </div>
                <div className="border-x border-slate-200/60 dark:border-white/5">
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">Resolution</span>
                  <span className="font-bold text-slate-900 dark:text-white">1000×1000</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase block font-semibold">ECC Level</span>
                  <span className="font-bold text-slate-900 dark:text-white">{errorLevel} ({errorLevel === 'H' ? '30%' : errorLevel === 'Q' ? '25%' : errorLevel === 'M' ? '15%' : '7%'})</span>
                </div>
              </div>

              {/* ACTION CONTROLS */}
              <div className="space-y-2.5 pt-3">
                <button 
                  type="button"
                  onClick={downloadPNG}
                  disabled={!getQRContent()}
                  className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-xl font-bold text-xs uppercase tracking-wider shadow-md shadow-blue-500/25 transition-all disabled:opacity-40 disabled:cursor-not-allowed disabled:shadow-none active:scale-[0.98] cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  Download Master PNG (1000px)
                </button>
                
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={copyToClipboard}
                    disabled={!getQRContent()}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copied ? 'Copied!' : 'Copy Image'}</span>
                  </button>
                  
                  <button
                    type="button"
                    onClick={downloadSVG}
                    disabled={!getQRContent()}
                    className="flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer active:scale-95"
                  >
                    <FileCode className="w-3.5 h-3.5" />
                    <span>Vector SVG</span>
                  </button>
                </div>
              </div>
            </div>

            {/* MARKETING & SCAN PRO-TIP */}
            <div className="p-3.5 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50/50 dark:from-blue-950/30 dark:to-indigo-950/20 border border-blue-100 dark:border-blue-900/40 text-xs flex items-start gap-2.5">
              <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
              <div className="text-slate-600 dark:text-slate-300 leading-relaxed text-[11.5px]">
                <strong className="text-slate-900 dark:text-white font-semibold">Pro Scannability Tip:</strong> Maintain sufficient contrast between your QR foreground and background. Branded frames increase user scan conversions by over 35%.
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* SEO ARTICLE CONTENT */}
      <ToolArticle {...toolArticles['qr-code-generator']} />
    </ToolLayout>
  );
}
