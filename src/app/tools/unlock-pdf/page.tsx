"use client";

import Link from 'next/link';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, UploadCloud, Trash2,
  Shield, Eye, EyeOff, Lock, Unlock, RefreshCw,
  AlertCircle, CheckCircle, ChevronLeft, ArrowRight,
  LockKeyhole, Sparkles, KeyRound, ShieldAlert,
  LockKeyholeOpen, Files, Grid, Layers
} from 'lucide-react';
import { toast } from 'sonner';
import { PDFDocument } from 'pdf-lib';
import { decryptPDF } from '@pdfsmaller/pdf-decrypt';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';
import { MeshGradient } from '@/components/BackgroundEffects';

const uint8ArrayToArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;
};

export default function UnlockPdf() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  
  // Security Inputs
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [decryptedBytes, setDecryptedBytes] = useState<Uint8Array | null>(null);
  
  // Progress states
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDraggingOverUpload, setIsDraggingOverUpload] = useState(false);
  const [success, setSuccess] = useState(false);
  const [isLocked, setIsLocked] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // ------------------------------------
  // FILE LOADER
  // ------------------------------------
  const handlePdfUpload = (file: File) => {
    setIsProcessing(true);
    setSuccess(false);
    setDecryptedBytes(null);
    setPassword("");
    setIsLocked(false);

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer);
        
        // Verify document is password locked
        try {
          await PDFDocument.load(bytes);
          // If it loads without throwing, the PDF is NOT locked
          toast.info("This PDF is already unlocked and does not require password removal.");
          setIsLocked(false);
          setIsProcessing(false);
          return;
        } catch (loadErr: any) {
          // If it throws, verify it is due to password protection
          const msg = loadErr.message || '';
          if (
            msg.includes('encrypted') || 
            msg.includes('password') || 
            msg.includes('Password')
          ) {
            setIsLocked(true);
          } else {
            throw loadErr; // trigger outer catch for general parser errors
          }
        }

        setPdfBytes(bytes);
        setPdfFile(file);
      } catch (err) {
        console.error(err);
        toast.error("Failed to read PDF file. Make sure it is not corrupted.");
      } finally {
        setIsProcessing(false);
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        handlePdfUpload(file);
      } else {
        toast.error("Please upload valid PDF files only.");
      }
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const resetAll = () => {
    setPdfFile(null);
    setPdfBytes(null);
    setPassword("");
    setDecryptedBytes(null);
    setIsProcessing(false);
    setSuccess(false);
    setIsLocked(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ------------------------------------
  // DECRYPTION ROUTINE
  // ------------------------------------
  const decryptDocument = async () => {
    if (!pdfBytes || !pdfFile) return;
    if (!password) {
      toast.error("Please enter the document password.");
      return;
    }

    setIsProcessing(true);
    try {
      // Run the client-side decryption bytes compiler
      const decrypted = await decryptPDF(pdfBytes, password);
      
      setDecryptedBytes(decrypted);
      setSuccess(true);
      toast.success("PDF decrypted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Incorrect password. Please verify your credentials and try again.");
      setPassword("");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadDecrypted = () => {
    if (!decryptedBytes || !pdfFile) return;
    
    const blob = new Blob([uint8ArrayToArrayBuffer(decryptedBytes)], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    
    const dl = document.createElement('a');
    dl.href = url;
    dl.download = pdfFile.name.replace(/\.pdf$/i, '_unlocked.pdf');
    document.body.appendChild(dl);
    dl.click();
    document.body.removeChild(dl);
    
    URL.revokeObjectURL(url);
  };

  // Drag-and-drop handlers
  const handleDragOverUpload = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverUpload(true);
  };

  const handleDragLeaveUpload = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverUpload(false);
  };

  const handleDropUpload = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOverUpload(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
        handlePdfUpload(file);
      } else {
        toast.error("Drop PDF files only.");
      }
    }
  };

  return (
    <div className="bg-[#030712] min-h-screen py-24 relative overflow-hidden">
      <MeshGradient />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-7xl relative z-10">
        
        {/* Navigation Link */}
        <Link href="/tools" className="inline-flex items-center gap-2 text-sm font-black uppercase tracking-widest text-gray-500 hover:text-blue-500 transition-colors mb-10 group">
          <ChevronLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          Back to Directory
        </Link>

        {/* Main Tool Card */}
        <div className="glass rounded-[2.5rem] border border-white/5 overflow-hidden shadow-2xl mb-16">
          
          {/* Header Banner */}
          <div className="p-8 sm:p-10 border-b border-white/5 bg-white/[0.02]">
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-[0_0_25px_rgba(37,99,235,0.4)]">
                  <Unlock className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-white tracking-tighter uppercase">Unlock PDF</h1>
                  <p className="text-gray-400 font-medium mt-1">Remove passwords and security restrictions from your encrypted PDF documents instantly.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 h-fit">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">Secure Client Decryption</span>
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-10 bg-black/[0.15]">
            
            {/* Success state display */}
            {success && decryptedBytes && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-10 p-8 border border-emerald-500/20 bg-emerald-500/5 rounded-[2rem] text-center"
              >
                <div className="w-16 h-16 bg-emerald-500/25 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                  <LockKeyholeOpen className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight mb-2">Document Unlocked!</h3>
                <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
                  Your PDF was decrypted successfully and all security password restrictions have been permanently removed.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <button 
                    onClick={downloadDecrypted} 
                    className="flex items-center gap-2 px-7 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download Unlocked PDF
                  </button>
                  <button 
                    onClick={resetAll} 
                    className="px-7 py-4 bg-white/5 border border-white/10 text-gray-300 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
                  >
                    Unlock Another File
                  </button>
                </div>
              </motion.div>
            )}

            {/* Layout Panels */}
            {!pdfFile ? (
              
              /* 1. Upload Deck */
              <div
                onDragOver={handleDragOverUpload}
                onDragLeave={handleDragLeaveUpload}
                onDrop={handleDropUpload}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-[3rem] p-12 sm:p-24 text-center transition-all cursor-pointer group relative overflow-hidden
                  ${isDraggingOverUpload 
                    ? 'border-blue-500 bg-blue-500/10 scale-[1.01] shadow-[0_0_30px_rgba(59,130,246,0.1)]' 
                    : 'border-white/10 bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/20'
                  }
                `}
              >
                <input 
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".pdf"
                  className="hidden"
                />
                
                <div className="relative z-10">
                  <div className="w-24 h-24 rounded-[2rem] bg-white/5 border border-white/10 flex items-center justify-center mx-auto mb-8 group-hover:scale-110 group-hover:border-blue-500/50 transition-all duration-500 shadow-inner">
                    <UploadCloud className="w-10 h-10 text-gray-400 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <h3 className="text-3xl font-black text-white tracking-tighter uppercase mb-3">Upload Protected PDF</h3>
                  <p className="text-gray-400 font-medium max-w-sm mx-auto mb-8 text-sm">
                    Drag and drop your password-locked PDF here, or click to search files.
                  </p>
                  
                  <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/5 text-[10px] font-bold text-gray-500 border border-white/5 uppercase tracking-widest">
                    🔒 Client-side security. Passwords are never sent to servers.
                  </div>
                </div>
                
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.02] pointer-events-none" />
              </div>

            ) : (

              /* 2. Workspace View */
              <div className="space-y-10">
                
                {/* File overview card */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white/[0.02] border border-white/5 rounded-2xl gap-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-base font-black text-white line-clamp-1">{pdfFile.name}</h4>
                      <p className="text-xs text-gray-500 font-semibold mt-0.5">
                        {formatBytes(pdfFile.size)} • <span className="text-amber-500 font-bold uppercase">Password Locked</span>
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={resetAll}
                    disabled={isProcessing}
                    className="flex items-center gap-2 px-4 py-2.5 border border-red-500/20 hover:border-red-500/50 bg-red-500/5 text-[10px] font-black text-red-500 hover:text-white uppercase tracking-widest rounded-xl transition-all disabled:opacity-50 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Remove File
                  </button>
                </div>

                {/* Password Setting & Decryption Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  
                  {/* Left Column: Password Credentials */}
                  <div className="glass p-8 rounded-[2rem] border border-white/5 bg-white/[0.01] relative flex flex-col justify-between">
                    <div className="space-y-6">
                      <h3 className="text-xs font-black uppercase tracking-widest text-white border-b border-white/5 pb-4 flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-blue-500" /> Enter PDF Password
                      </h3>

                      {/* Password Field */}
                      <div className="space-y-2 relative">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Document Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isProcessing}
                            className="w-full bg-[#030712]/50 border border-white/5 focus:border-blue-500/50 rounded-xl pl-4 pr-12 py-3.5 text-white text-sm font-semibold outline-none transition-all focus:ring-4 focus:ring-blue-500/5"
                            placeholder="Enter password lock to decrypt..."
                            onKeyDown={(e) => e.key === 'Enter' && decryptDocument()}
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                          </button>
                        </div>
                        <p className="text-[9px] text-gray-500 font-bold uppercase tracking-wider ml-1 mt-1 leading-normal">
                          This password will be tested locally in browser memory.
                        </p>
                      </div>
                    </div>

                    <button
                      onClick={decryptDocument}
                      disabled={isProcessing || !password}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50 mt-10 cursor-pointer"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Stripping Encryption...
                        </>
                      ) : (
                        <>
                          <Unlock className="w-4 h-4" /> Unlock PDF Document
                        </>
                      )}
                    </button>
                  </div>

                  {/* Right Column: Educational Security Panels */}
                  <div className="glass p-8 rounded-[2rem] border border-white/5 bg-white/[0.01] flex flex-col justify-between">
                    <div className="space-y-6">
                      <h3 className="text-xs font-black uppercase tracking-widest text-white border-b border-white/5 pb-4 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-500" /> Decryption Security Info
                      </h3>
                      
                      <div className="space-y-5 text-gray-400 text-sm font-medium leading-relaxed">
                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-blue-400 border border-white/5 flex-shrink-0">
                            🔑
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1">Local Decoding only</h4>
                            <p className="text-[11px] font-semibold text-gray-500">
                              Your password is never sent to the network. Cryptographic algorithms decrypt the byte buffers completely on your machine.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-emerald-400 border border-white/5 flex-shrink-0">
                            🛡️
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1">Permanent Removal</h4>
                            <p className="text-[11px] font-semibold text-gray-500">
                              Downloading compiles a standard PDF copy without encryption blocks, meaning it will open anywhere without password prompts.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-amber-400 border border-white/5 flex-shrink-0">
                            ⚠️
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-white uppercase tracking-wider mb-1">Password Requirement</h4>
                            <p className="text-[11px] font-semibold text-gray-500">
                              This tool removes restrictions from files you are authorized to access. You must provide the original password once to decode the stream.
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="p-4 bg-blue-500/5 border border-blue-500/10 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest text-blue-400 mt-6">
                      <Sparkles className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      Client-side processing preserves full document privacy.
                    </div>
                  </div>

                </div>

              </div>
            )}

          </div>
        </div>

        {/* RELATED TOOLS LIST */}
        <div className="mb-12 animate-fade-in">
          <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6 ml-1">Explore PDF Workspace</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Protect PDF Card */}
            <Link 
              href="/tools/protect-pdf"
              className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.03] p-7 transition-all duration-500 hover:bg-white/[0.05] hover:border-blue-500/50 glass"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-10">
                <span className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 border border-white/10 backdrop-blur-md">
                  PDF
                </span>
              </div>
              <div className="relative z-10 mt-2">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-white border border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <Lock className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="mb-3 text-2xl font-black text-white group-hover:text-blue-400 transition-colors tracking-tight">Protect PDF</h3>
                <p className="text-sm text-gray-400 leading-relaxed font-medium line-clamp-3 group-hover:text-gray-300 transition-colors">
                  Add secure user passwords and protect your PDF documents with client-side encryption.
                </p>
              </div>
              <div className="relative z-10 mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-500 transition-all group-hover:gap-4">
                Launch Utility
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* Merge PDF Card */}
            <Link 
              href="/tools/merge-pdf"
              className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.03] p-7 transition-all duration-500 hover:bg-white/[0.05] hover:border-blue-500/50 glass"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-10">
                <span className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 border border-white/10 backdrop-blur-md">
                  PDF
                </span>
              </div>
              <div className="relative z-10 mt-2">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-white border border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <Files className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="mb-3 text-2xl font-black text-white group-hover:text-blue-400 transition-colors tracking-tight">Merge PDF</h3>
                <p className="text-sm text-gray-400 leading-relaxed font-medium line-clamp-3 group-hover:text-gray-300 transition-colors">
                  Combine multiple distinct PDF documents into a single professional-grade file quickly and securely.
                </p>
              </div>
              <div className="relative z-10 mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-500 transition-all group-hover:gap-4">
                Launch Utility
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

            {/* PDF to JPG Card */}
            <Link 
              href="/tools/pdf-to-jpg"
              className="group relative flex flex-col justify-between overflow-hidden rounded-[2rem] border border-white/5 bg-white/[0.03] p-7 transition-all duration-500 hover:bg-white/[0.05] hover:border-blue-500/50 glass"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-purple-600/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="absolute top-4 right-4 flex flex-col gap-2 items-end z-10">
                <span className="inline-flex items-center rounded-full bg-white/5 px-3 py-1 text-[10px] font-bold uppercase tracking-widest text-gray-400 border border-white/10 backdrop-blur-md">
                  PDF
                </span>
              </div>
              <div className="relative z-10 mt-2">
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500/10 to-indigo-500/10 text-white border border-white/5 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500">
                  <Layers className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="mb-3 text-2xl font-black text-white group-hover:text-blue-400 transition-colors tracking-tight">PDF to JPG</h3>
                <p className="text-sm text-gray-400 leading-relaxed font-medium line-clamp-3 group-hover:text-gray-300 transition-colors">
                  Convert PDF pages into high-resolution JPG images directly in your browser.
                </p>
              </div>
              <div className="relative z-10 mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-blue-500 transition-all group-hover:gap-4">
                Launch Utility
                <ArrowRight className="w-4 h-4" />
              </div>
            </Link>

          </div>
        </div>

      </div>

      {/* SEO Deep-Dive Article Section */}
      {toolArticles['unlock-pdf'] && (
        <ToolArticle {...toolArticles['unlock-pdf']} />
      )}
    </div>
  );
}
