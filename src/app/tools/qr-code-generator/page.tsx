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
    <div className="bg-gray-50 min-h-screen py-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl">
        <Link href="/tools" className="text-sm font-medium text-blue-600 hover:text-blue-700 mb-6 inline-flex items-center group">
          <RotateCcw className="h-4 w-4 mr-1 group-hover:-rotate-45 transition-transform" />
          Back to all tools
        </Link>
        
        {/* HEADER */}
        <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 sm:p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
            <div className="flex items-center gap-5">
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-100">
                <Globe className="w-8 h-8" />
              </div>
              <div>
                <h1 className="text-3xl font-black text-gray-900 tracking-tight">Professional QR Generator</h1>
                <p className="text-gray-500 font-medium mt-1">Create, customize, and brand your QR codes instantly.</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={resetAll} className="flex items-center gap-2 px-5 py-2.5 text-sm font-bold text-gray-600 bg-gray-100 rounded-xl hover:bg-gray-200 transition-all active:scale-95">
                <RotateCcw className="w-4 h-4" /> Reset
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          
          {/* LEFT: SETTINGS */}
          <div className="w-full lg:w-[60%] space-y-8">
            
            {/* TYPE SELECTION */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                <Settings className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">1. Select Data Type</h2>
              </div>
              
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
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
                    className={`flex flex-col items-center gap-2 p-3 rounded-2xl transition-all border-2 ${
                      activeTab === type.id 
                        ? 'bg-blue-50 border-blue-600 text-blue-600 shadow-sm' 
                        : 'bg-gray-50 border-transparent text-gray-500 hover:bg-white hover:border-gray-200'
                    }`}
                  >
                    <type.icon className="w-6 h-6" />
                    <span className="text-[11px] font-black uppercase tracking-wider">{type.label}</span>
                  </button>
                ))}
              </div>

              {/* INPUT FIELDS */}
              <div className="mt-8 space-y-4">
                {activeTab === 'URL' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Website URL</label>
                    <input 
                      type="text" 
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none text-gray-900 font-medium transition-all"
                      placeholder="e.g. www.toolgpt.in"
                    />
                  </div>
                )}
                
                {activeTab === 'Text' && (
                  <div>
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Plain Text Content</label>
                    <textarea 
                      rows={4}
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                      className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-600 outline-none text-gray-900 font-medium transition-all resize-none"
                      placeholder="Enter any text you want to encode..."
                    />
                  </div>
                )}

                {activeTab === 'WiFi' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="sm:col-span-2">
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Network Name (SSID)</label>
                      <input type="text" value={wifiSsid} onChange={e => setWifiSsid(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-600" placeholder="My Home WiFi" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Password</label>
                      <input type="password" value={wifiPassword} onChange={e => setWifiPassword(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-600" placeholder="••••••••" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Encryption</label>
                      <select value={wifiEncryption} onChange={e => setWifiEncryption(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-600 bg-white">
                        <option value="WPA">WPA/WPA2</option>
                        <option value="WEP">WEP</option>
                        <option value="nopass">None</option>
                      </select>
                    </div>
                  </div>
                )}

                {activeTab === 'Email' && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Email Recipient</label>
                      <input type="email" value={emailTo} onChange={e => setEmailTo(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-600" placeholder="hello@example.com" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Subject</label>
                      <input type="text" value={emailSubject} onChange={e => setEmailSubject(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-600" placeholder="Inquiry" />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Message Body</label>
                      <textarea rows={3} value={emailBody} onChange={e => setEmailBody(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-600 resize-none" placeholder="Type your email content..." />
                    </div>
                  </div>
                )}

                {(activeTab === 'Phone' || activeTab === 'SMS') && (
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">Phone Number</label>
                      <input type="text" value={phone} onChange={e => setPhone(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-600" placeholder="+1 (555) 000-0000" />
                    </div>
                    {activeTab === 'SMS' && (
                      <div>
                        <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-2">SMS Message</label>
                        <textarea rows={3} value={smsMessage} onChange={e => setSmsMessage(e.target.value)} className="w-full px-4 py-3 rounded-xl border border-gray-200 outline-none focus:border-blue-600 resize-none" placeholder="Type your text message..." />
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* CUSTOMIZATION */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                <Palette className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">2. Design & Branding</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Colors */}
                <div className="space-y-5">
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-sm font-bold text-gray-700">QR Color</span>
                    <input type="color" value={fgColor} onChange={e => setFgColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-sm font-bold text-gray-700">Background</span>
                    <input type="color" value={bgColor} onChange={e => setBgColor(e.target.value)} className="w-10 h-10 rounded-lg cursor-pointer border-none bg-transparent" />
                  </div>
                  <div className="flex items-center justify-between p-3 bg-gray-50 rounded-2xl border border-gray-100">
                    <span className="text-sm font-bold text-gray-700">Include Margin</span>
                    <button 
                      onClick={() => setIncludeMargin(!includeMargin)}
                      className={`w-12 h-6 rounded-full transition-colors relative ${includeMargin ? 'bg-blue-600' : 'bg-gray-300'}`}
                    >
                      <div className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${includeMargin ? 'left-7' : 'left-1'}`} />
                    </button>
                  </div>
                </div>

                {/* Logo Upload */}
                <div className="space-y-4">
                  <label className="block text-xs font-bold text-gray-700 uppercase tracking-widest mb-1">Center Logo</label>
                  <div className="relative group">
                    <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-gray-200 rounded-2xl cursor-pointer bg-gray-50 hover:bg-gray-100 hover:border-blue-300 transition-all">
                      {logo ? (
                        <div className="relative group">
                          <img src={logo} alt="Logo" className="w-16 h-16 object-contain rounded-lg" />
                          <button 
                            onClick={(e) => { e.preventDefault(); setLogo(null); }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <>
                          <Upload className="w-8 h-8 text-gray-400 mb-2" />
                          <span className="text-xs font-bold text-gray-500 uppercase">Upload Logo</span>
                        </>
                      )}
                      <input type="file" className="hidden" onChange={handleLogoUpload} accept="image/*" />
                    </label>
                  </div>
                  {logo && (
                    <div className="pt-2">
                      <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase mb-2">
                        <span>Logo Size</span>
                        <span>{logoSize}%</span>
                      </div>
                      <input type="range" min="10" max="30" value={logoSize} onChange={e => setLogoSize(parseInt(e.target.value))} className="w-full accent-blue-600" />
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* FRAMES */}
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-200">
              <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                <Layout className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-bold text-gray-900">3. Select Frame Template</h2>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                {FRAMES.map((frame) => (
                  <button
                    key={frame.id}
                    onClick={() => setSelectedFrame(frame.id)}
                    className={`p-4 rounded-2xl border-2 transition-all flex flex-col items-center gap-3 ${
                      selectedFrame === frame.id 
                        ? 'border-blue-600 bg-blue-50 text-blue-600 shadow-sm' 
                        : 'border-gray-100 bg-gray-50 text-gray-500 hover:border-gray-200'
                    }`}
                  >
                    <div className={`w-12 h-16 border-2 rounded-md relative flex flex-col items-center justify-center ${selectedFrame === frame.id ? 'border-blue-400' : 'border-gray-300'}`}>
                      <div className="w-8 h-8 bg-gray-200 rounded-sm mb-1" />
                      {frame.id !== 'None' && (
                        <div className="absolute bottom-0 w-full h-3 bg-current opacity-20" />
                      )}
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-widest">{frame.label}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: LIVE PREVIEW */}
          <div className="w-full lg:w-[40%]">
            <div className="sticky top-24 space-y-6">
              <div className="bg-white p-8 rounded-[3rem] shadow-xl border border-gray-200 flex flex-col items-center">
                <div className="flex items-center gap-2 mb-8 bg-blue-50 px-4 py-2 rounded-full">
                  <Eye className="w-4 h-4 text-blue-600" />
                  <span className="text-xs font-black text-blue-600 uppercase tracking-widest">Live Preview</span>
                </div>

                {/* QR PREVIEW CARD */}
                <div className="w-full max-w-[320px] h-auto min-h-[320px] relative group bg-gray-100 rounded-2xl p-6 shadow-inner flex items-center justify-center">
                  <div className="absolute inset-0 bg-grid-pattern opacity-10 rounded-2xl" />
                  
                  {!getQRContent() ? (
                    <div className="text-center p-8 space-y-4 relative z-10">
                      <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                        <Smartphone className="w-10 h-10 text-gray-200" />
                      </div>
                      <p className="text-sm font-bold text-gray-400 uppercase tracking-tight">Enter data to see <br /> live preview</p>
                    </div>
                  ) : (
                    <div className="relative bg-white p-1 rounded-xl shadow-2xl transition-transform duration-500 hover:scale-[1.02] z-10">
                      <canvas 
                        ref={canvasRef} 
                        className="w-full h-auto rounded-lg shadow-sm block"
                        style={{ maxWidth: '100%', objectFit: 'contain' }}
                      />
                      {isGenerating && (
                        <div className="absolute inset-0 bg-white/50 backdrop-blur-[1px] flex items-center justify-center rounded-xl">
                          <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* DOWNLOAD CONTROLS */}
                <div className="w-full mt-10 space-y-3">
                  <button 
                    onClick={downloadPNG}
                    disabled={!getQRContent()}
                    className="w-full flex items-center justify-center gap-3 bg-gray-900 text-white py-4 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl shadow-gray-200 disabled:opacity-30 disabled:cursor-not-allowed active:scale-95 group"
                  >
                    <Download className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
                    Download PNG
                  </button>
                  <p className="text-[10px] text-gray-400 font-bold uppercase text-center">High Resolution 1000x1000 Output</p>
                </div>
              </div>

              {/* QUICK TIP */}
              <div className="bg-blue-600 rounded-[2rem] p-6 text-white shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-full -mr-8 -mt-8" />
                <h4 className="text-lg font-black mb-2 flex items-center gap-2">
                  <Sparkles className="w-5 h-5" /> Pro Tip
                </h4>
                <p className="text-sm text-blue-100 font-medium leading-relaxed">
                  Adding a center logo or a custom frame can increase your QR code scan rate by up to 40%!
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Hidden Download Helpers */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  );
}
