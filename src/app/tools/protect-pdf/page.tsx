"use client";

import Link from 'next/link';
import { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileText, Download, UploadCloud, Trash2,
  Shield, Eye, EyeOff, Lock, RefreshCw, AlertCircle,
  CheckCircle, ChevronLeft, ArrowRight, LockKeyhole,
  Sparkles, KeyRound, ShieldAlert, Files, Grid, Layers
} from 'lucide-react';
import { toast } from 'sonner';
import { encryptPDF } from '@pdfsmaller/pdf-encrypt-lite';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';
import { MeshGradient } from '@/components/BackgroundEffects';

interface StrengthIndicator {
  label: string;
  score: number; // 0, 1, 2, 3
  color: string;
  textColor: string;
}

const uint8ArrayToArrayBuffer = (bytes: Uint8Array): ArrayBuffer => {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;
};

export default function ProtectPdf() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfBytes, setPdfBytes] = useState<Uint8Array | null>(null);
  
  // Security Inputs
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [encryptedBytes, setEncryptedBytes] = useState<Uint8Array | null>(null);
  
  // Progress states
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDraggingOverUpload, setIsDraggingOverUpload] = useState(false);
  const [success, setSuccess] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatBytes = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Password strength logic
  const getPasswordStrength = (pwd: string): StrengthIndicator => {
    if (!pwd) return { label: 'None', score: 0, color: 'bg-white/5', textColor: 'text-gray-500' };
    
    let score = 0;
    if (pwd.length >= 6) score += 1;
    if (pwd.length >= 10) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    if (score <= 1) return { label: 'Weak', score: 1, color: 'bg-red-500', textColor: 'text-red-500' };
    if (score <= 3) return { label: 'Medium', score: 2, color: 'bg-amber-500', textColor: 'text-amber-500' };
    return { label: 'Strong', score: 3, color: 'bg-emerald-500', textColor: 'text-emerald-500' };
  };

  const strength = getPasswordStrength(password);
  const isMatch = password === confirmPassword;

  // ------------------------------------
  // FILE LOADER
  // ------------------------------------
  const handlePdfUpload = (file: File) => {
    setIsProcessing(true);
    setSuccess(false);
    setEncryptedBytes(null);
    setPassword("");
    setConfirmPassword("");

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const arrayBuffer = e.target?.result as ArrayBuffer;
        const bytes = new Uint8Array(arrayBuffer);
        
        // Verify document is not already encrypted
        try {
          const { PDFDocument } = await import('pdf-lib');
          await PDFDocument.load(bytes);
        } catch (loadErr: any) {
          if (
            loadErr.message?.includes('encrypted') || 
            loadErr.message?.includes('password') || 
            loadErr.message?.includes('Password')
          ) {
            toast.error("This PDF is already password-protected!");
            setIsProcessing(false);
            return;
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
    setConfirmPassword("");
    setEncryptedBytes(null);
    setIsProcessing(false);
    setSuccess(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // ------------------------------------
  // ENCRYPTION ROUTINE
  // ------------------------------------
  const encryptDocument = async () => {
    if (!pdfBytes || !pdfFile) return;
    if (!password) {
      toast.error("Please enter password.");
      return;
    }
    if (!isMatch) {
      toast.error("Passwords do not match.");
      return;
    }

    setIsProcessing(true);
    try {
      // Run the client-side encryption bytes compiler
      const encrypted = await encryptPDF(pdfBytes, password);
      
      setEncryptedBytes(encrypted);
      setSuccess(true);
      toast.success("PDF encrypted successfully!");
    } catch (err) {
      console.error(err);
      toast.error("Failed to encrypt document. Please check the file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadEncrypted = () => {
    if (!encryptedBytes || !pdfFile) return;
    
    const blob = new Blob([uint8ArrayToArrayBuffer(encryptedBytes)], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    
    const dl = document.createElement('a');
    dl.href = url;
    dl.download = pdfFile.name.replace(/\.pdf$/i, '_protected.pdf');
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
    <div className="bg-[#F6F8FC] dark:bg-[#030712] min-h-screen py-24 relative overflow-hidden transition-colors duration-250 font-sans">
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
                  <Lock className="w-7 h-7" />
                </div>
                <div>
                  <h1 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase">Protect PDF</h1>
                  <p className="text-gray-400 font-medium mt-1">Encrypt your PDF files with user passwords. Maximum privacy with edge processing.</p>
                </div>
              </div>
              <div className="flex items-center gap-3 bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20 h-fit">
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400">100% Secure Cryptography</span>
              </div>
            </div>
          </div>

          <div className="p-8 sm:p-10 bg-white dark:bg-black/[0.15]">
            
            {/* Success state display */}
            {success && encryptedBytes && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mb-10 p-8 border border-emerald-500/20 bg-emerald-500/5 rounded-[2rem] text-center"
              >
                <div className="w-16 h-16 bg-emerald-500/25 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                  <LockKeyhole className="w-8 h-8" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-2">Document Protected!</h3>
                <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
                  Your PDF was encrypted successfully using the specified password. Keep the password in a safe place.
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <button 
                    onClick={downloadEncrypted} 
                    className="flex items-center gap-2 px-7 py-4 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] cursor-pointer"
                  >
                    <Download className="w-4 h-4" /> Download Protected PDF
                  </button>
                  <button 
                    onClick={resetAll} 
                    className="px-7 py-4 bg-white/5 border border-white/10 text-gray-300 text-[10px] font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all"
                  >
                    Encrypt Another File
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
                  <h3 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter uppercase mb-3">Upload PDF Document</h3>
                  <p className="text-gray-400 font-medium max-w-sm mx-auto mb-8 text-sm">
                    Drag and drop your PDF here, or click to search files.
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
                      <h4 className="text-base font-black text-slate-900 dark:text-white line-clamp-1">{pdfFile.name}</h4>
                      <p className="text-xs text-gray-500 font-semibold mt-0.5">
                        {formatBytes(pdfFile.size)}
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

                {/* Password Setting & Encryption Panel */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                  
                  {/* Left Column: Input Forms */}
                  <div className="glass p-8 rounded-[2rem] border border-white/5 bg-white/[0.01] relative flex flex-col justify-between">
                    <div className="space-y-6">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white border-b border-white/5 pb-4 flex items-center gap-2">
                        <KeyRound className="w-4 h-4 text-blue-500" /> Security Credentials
                      </h3>

                      {/* Password Field */}
                      <div className="space-y-2 relative">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">New PDF Password</label>
                        <div className="relative">
                          <input
                            type={showPassword ? "text" : "password"}
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            disabled={isProcessing}
                            className="w-full bg-[#F6F8FC] dark:bg-[#030712]/50 border border-white/5 focus:border-blue-500/50 rounded-xl pl-4 pr-12 py-3.5 text-white text-sm font-semibold outline-none transition-all focus:ring-4 focus:ring-blue-500/5"
                            placeholder="Enter password lock..."
                          />
                          <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white cursor-pointer"
                          >
                            {showPassword ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                          </button>
                        </div>
                      </div>

                      {/* Password Strength Meter */}
                      {password && (
                        <div className="space-y-2 px-1">
                          <div className="flex justify-between items-center text-[9px] font-black uppercase tracking-widest">
                            <span className="text-gray-500">Strength Rating</span>
                            <span className={strength.textColor}>{strength.label}</span>
                          </div>
                          <div className="grid grid-cols-3 gap-1.5 h-1.5">
                            {[1, 2, 3].map((step) => (
                              <div
                                key={step}
                                className={`rounded-full transition-all duration-300 ${
                                  strength.score >= step 
                                    ? strength.color 
                                    : 'bg-white/5'
                                }`}
                              />
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Confirm Password Field */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">Confirm Password</label>
                        <input
                          type={showPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          disabled={isProcessing}
                          className={`w-full bg-[#F6F8FC] dark:bg-[#030712]/50 border rounded-xl px-4 py-3.5 text-white text-sm font-semibold outline-none transition-all focus:ring-4 focus:ring-blue-500/5
                            ${confirmPassword 
                              ? (isMatch 
                                ? 'border-emerald-500/30 focus:border-emerald-500/50' 
                                : 'border-red-500/30 focus:border-red-500/50'
                                ) 
                              : 'border-white/5 focus:border-blue-500/50'
                            }
                          `}
                          placeholder="Re-type password lock..."
                        />
                        {confirmPassword && !isMatch && (
                          <p className="text-[9px] text-red-500 font-bold uppercase tracking-wider ml-1 mt-1 flex items-center gap-1">
                            <ShieldAlert className="w-3 h-3" /> Password credentials do not match
                          </p>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={encryptDocument}
                      disabled={isProcessing || !password || !confirmPassword || !isMatch}
                      className="w-full flex items-center justify-center gap-2 px-6 py-4.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-black uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(37,99,235,0.3)] disabled:opacity-50 mt-10 cursor-pointer"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Compiling Protection...
                        </>
                      ) : (
                        <>
                          <Lock className="w-4 h-4" /> Encrypt PDF File
                        </>
                      )}
                    </button>
                  </div>

                  {/* Right Column: Educational Security Panels */}
                  <div className="glass p-8 rounded-[2rem] border border-white/5 bg-white/[0.01] flex flex-col justify-between">
                    <div className="space-y-6">
                      <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 dark:text-white border-b border-white/5 pb-4 flex items-center gap-2">
                        <Shield className="w-4 h-4 text-blue-500" /> Edge Cryptography Info
                      </h3>
                      
                      <div className="space-y-5 text-gray-400 text-sm font-medium leading-relaxed">
                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-blue-400 border border-white/5 flex-shrink-0">
                            🔒
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-1">Local Processing only</h4>
                            <p className="text-[11px] font-semibold text-gray-500">
                              Your documents do not pass through servers. All encryption byte compiling executes in your browser's V8 Javascript engine.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-emerald-400 border border-white/5 flex-shrink-0">
                            🛡️
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-1">Standard Encryption Schema</h4>
                            <p className="text-[11px] font-semibold text-gray-500">
                              The locked document complies with Adobe PDF user protection standards. It triggers password prompts in Chrome, iOS Safari, Acrobat, and Edge.
                            </p>
                          </div>
                        </div>

                        <div className="flex gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-amber-400 border border-white/5 flex-shrink-0">
                            ⚠️
                          </div>
                          <div>
                            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-wider mb-1">No Password Recovery</h4>
                            <p className="text-[11px] font-semibold text-gray-500">
                              We do not store passwords. If you lose the password, there is no master recovery key or database. Save it carefully.
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
            
            {/* Split PDF Card */}
            <Link 
              href="/tools/split-pdf"
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
                  <Grid className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="mb-3 text-2xl font-black text-slate-900 dark:text-white group-hover:text-blue-400 transition-colors tracking-tight">Split PDF</h3>
                <p className="text-sm text-gray-400 leading-relaxed font-medium line-clamp-3 group-hover:text-gray-300 transition-colors">
                  Extract specific page segments or split your PDF documents into separate individual files.
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
                <h3 className="mb-3 text-2xl font-black text-slate-900 dark:text-white group-hover:text-blue-400 transition-colors tracking-tight">Merge PDF</h3>
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
                <h3 className="mb-3 text-2xl font-black text-slate-900 dark:text-white group-hover:text-blue-400 transition-colors tracking-tight">PDF to JPG</h3>
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
      {toolArticles['protect-pdf'] && (
        <ToolArticle {...toolArticles['protect-pdf']} />
      )}
    </div>
  );
}
