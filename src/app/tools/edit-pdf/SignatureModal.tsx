"use client";

import React, { useState, useRef, useEffect } from 'react';
import { X, Edit2, Type, Upload, Check, Trash } from 'lucide-react';

interface SignatureModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signatureDataUrl: string) => void;
}

const SIGNATURE_FONTS = [
  { name: 'Great Vibes', family: '"Great Vibes", cursive' },
  { name: 'Dancing Script', family: '"Dancing Script", cursive' },
  { name: 'Sacramento', family: '"Sacramento", cursive' },
  { name: 'Pacifico', family: '"Pacifico", cursive' },
];

export default function SignatureModal({ isOpen, onClose, onSave }: SignatureModalProps) {
  const [activeTab, setActiveTab] = useState<'draw' | 'type' | 'upload'>('draw');
  
  // Draw Tab State
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  
  // Type Tab State
  const [typedName, setTypedName] = useState('');
  const [selectedFont, setSelectedFont] = useState(SIGNATURE_FONTS[0].family);
  const [textColor, setTextColor] = useState('#000000');
  
  // Upload Tab State
  const [uploadedImage, setUploadedImage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load cursive fonts dynamically
  useEffect(() => {
    if (isOpen) {
      const link = document.createElement('link');
      link.href = 'https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;700&family=Great+Vibes&family=Pacifico&family=Sacramento&display=swap';
      link.rel = 'stylesheet';
      document.head.appendChild(link);
      return () => {
        document.head.removeChild(link);
      };
    }
  }, [isOpen]);

  // Handle Drawing Canvas Setup
  useEffect(() => {
    if (isOpen && activeTab === 'draw' && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
      resizeCanvas();
    }
  }, [isOpen, activeTab]);

  const resizeCanvas = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.parentElement?.getBoundingClientRect();
      canvas.width = (rect?.width || 500) - 2;
      canvas.height = 240;
      
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 3;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
      }
    }
  };

  // Drawing Event Handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    setIsDrawing(true);
    const pos = getMousePos(canvas, e);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.beginPath();
      ctx.moveTo(pos.x, pos.y);
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const pos = getMousePos(canvas, e);
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.lineTo(pos.x, pos.y);
      ctx.stroke();
    }
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const getMousePos = (canvas: HTMLCanvasElement, e: any) => {
    const rect = canvas.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const clientY = e.touches ? e.touches[0].clientY : e.clientY;
    return {
      x: clientX - rect.left,
      y: clientY - rect.top
    };
  };

  const clearDrawing = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }
  };

  // File Upload Handlers
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setUploadedImage(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const clearUpload = () => {
    setUploadedImage(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Save Signature Handler
  const handleSave = () => {
    if (activeTab === 'draw') {
      const canvas = canvasRef.current;
      if (canvas) {
        // Check if canvas is empty
        const buffer = new Uint32Array(
          canvas.getContext('2d')?.getImageData(0, 0, canvas.width, canvas.height).data.buffer || []
        );
        const isCanvasBlank = !buffer.some(color => color !== 0);
        if (isCanvasBlank) return;
        
        onSave(canvas.toDataURL('image/png'));
      }
    } else if (activeTab === 'type') {
      if (!typedName.trim()) return;
      
      // Render typed text to a hidden canvas to create PNG
      const hiddenCanvas = document.createElement('canvas');
      hiddenCanvas.width = 600;
      hiddenCanvas.height = 200;
      const ctx = hiddenCanvas.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, hiddenCanvas.width, hiddenCanvas.height);
        ctx.fillStyle = textColor;
        ctx.font = `64px ${selectedFont}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(typedName, hiddenCanvas.width / 2, hiddenCanvas.height / 2);
        
        onSave(hiddenCanvas.toDataURL('image/png'));
      }
    } else if (activeTab === 'upload') {
      if (uploadedImage) {
        onSave(uploadedImage);
      }
    }
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-xl overflow-hidden shadow-2xl flex flex-col animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-800">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">Create Digital Signature</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-slate-100 dark:bg-slate-950/50 p-1.5 mx-6 mt-6 rounded-2xl border border-slate-200 dark:border-slate-800">
          <button
            onClick={() => setActiveTab('draw')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'draw' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Edit2 className="w-4 h-4" />
            Draw
          </button>
          <button
            onClick={() => setActiveTab('type')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'type' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Type className="w-4 h-4" />
            Type
          </button>
          <button
            onClick={() => setActiveTab('upload')}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === 'upload' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Upload className="w-4 h-4" />
            Upload
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-6 flex-1">
          {activeTab === 'draw' && (
            <div className="space-y-4">
              <div className="relative border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950 cursor-crosshair">
                <canvas
                  ref={canvasRef}
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                  className="w-full block"
                />
                <button
                  onClick={clearDrawing}
                  className="absolute bottom-3 right-3 p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50 hover:text-red-600 dark:hover:text-red-400 rounded-xl text-slate-500 dark:text-slate-400 transition-all shadow-md flex items-center gap-1.5 text-[10px] uppercase font-bold tracking-wider"
                  title="Clear drawing"
                >
                  <Trash className="w-3.5 h-3.5" />
                  Clear
                </button>
              </div>
              <p className="text-center text-[10px] text-slate-500 font-medium">Draw your signature using your mouse, trackpad, or touchscreen.</p>
            </div>
          )}

          {activeTab === 'type' && (
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Type Your Name</label>
                <input
                  type="text"
                  value={typedName}
                  onChange={(e) => setTypedName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none transition-colors"
                />
              </div>

              {/* Live Preview Panel */}
              <div className="border border-slate-200 dark:border-slate-800 rounded-2xl p-8 bg-slate-50 dark:bg-slate-950 flex items-center justify-center min-h-[140px] relative overflow-hidden select-none">
                {typedName ? (
                  <span
                    style={{ fontFamily: selectedFont, color: textColor }}
                    className="text-4xl md:text-5xl truncate max-w-full px-4"
                  >
                    {typedName}
                  </span>
                ) : (
                  <span className="text-slate-400 dark:text-slate-600 text-sm font-medium">Signature preview will appear here</span>
                )}
              </div>

              {/* Customizers */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Select Style</label>
                  <select
                    value={selectedFont}
                    onChange={(e) => setSelectedFont(e.target.value)}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-900 dark:text-white focus:border-blue-500 focus:outline-none transition-colors"
                  >
                    {SIGNATURE_FONTS.map((font) => (
                      <option key={font.name} value={font.family}>
                        {font.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">Ink Color</label>
                  <div className="flex gap-2">
                    {['#000000', '#1e3a8a', '#0284c7', '#ef4444'].map((color) => (
                      <button
                        key={color}
                        onClick={() => setTextColor(color)}
                        className={`w-8 h-8 rounded-full border-2 transition-all ${
                          color === '#000000' ? 'bg-black' : color === '#1e3a8a' ? 'bg-blue-900' : color === '#0284c7' ? 'bg-sky-600' : 'bg-red-500'
                        } ${textColor === color ? 'border-blue-500 scale-110' : 'border-transparent hover:scale-105'}`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div className="space-y-4">
              {uploadedImage ? (
                <div className="relative border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden bg-slate-50 dark:bg-slate-950 p-6 min-h-[200px] flex items-center justify-center">
                  <img src={uploadedImage} alt="Uploaded signature" className="max-h-[160px] object-contain" />
                  <button
                    onClick={clearUpload}
                    className="absolute top-3 right-3 p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:bg-red-50 dark:hover:bg-red-950/30 hover:border-red-200 dark:hover:border-red-900/50 hover:text-red-600 dark:hover:text-red-400 rounded-lg text-slate-400 transition-colors shadow-md"
                  >
                    <Trash className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-slate-200 dark:border-slate-800 hover:border-blue-500 bg-slate-50 dark:bg-slate-950 hover:bg-blue-50/50 dark:hover:bg-blue-950/10 rounded-2xl p-10 text-center cursor-pointer transition-all duration-200"
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleFileUpload}
                    accept="image/*"
                    className="hidden"
                  />
                  <Upload className="w-10 h-10 text-slate-400 dark:text-slate-600 mx-auto mb-3" />
                  <span className="block text-xs font-bold text-slate-600 dark:text-slate-400 mb-1">Upload image file</span>
                  <span className="text-[10px] text-slate-500 dark:text-slate-600">Supports PNG, JPG, JPEG with transparent or light background</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex justify-end items-center gap-3 px-6 py-4 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-200 dark:border-slate-800 select-none">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={
              (activeTab === 'draw' && !canvasRef.current) || 
              (activeTab === 'type' && !typedName.trim()) || 
              (activeTab === 'upload' && !uploadedImage)
            }
            className="flex items-center gap-1.5 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all disabled:opacity-40 disabled:hover:bg-blue-600"
          >
            <Check className="w-4 h-4" />
            Add Signature
          </button>
        </div>

      </div>
    </div>
  );
}
