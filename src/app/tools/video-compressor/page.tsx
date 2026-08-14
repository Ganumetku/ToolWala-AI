"use client";

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { 
  ChevronLeft, Video, Film, Download, RefreshCw, Copy, Check, 
  AlertCircle, ShieldCheck, Play, Pause, Sliders, FileVideo, 
  Trash2, Sparkles, CheckCircle2, Zap, Clock, Info, AlertTriangle, Music, Scissors
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { MeshGradient, FloatingParticles } from '@/components/BackgroundEffects';
import ToolVisibilityGuard from '@/components/ToolVisibilityGuard';
import { toolArticles } from '@/data/toolArticles';
import ToolArticle from '@/components/ToolArticle';
// Helper: Convert URL to Blob URL using native fetch (avoids Turbopack dynamic import issues)
const fetchToBlobUrl = async (url: string, type: string): Promise<string> => {
  const res = await fetch(url);
  const buf = await res.arrayBuffer();
  const blob = new Blob([buf], { type });
  return URL.createObjectURL(blob);
};

// Helper: Format Bytes into KB/MB/GB
const formatBytes = (bytes: number, decimals = 2) => {
  if (!bytes || bytes === 0) return '0 Bytes';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

// Helper: Format Seconds to MM:SS
const formatTime = (seconds: number) => {
  if (!seconds || isNaN(seconds)) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};

interface VideoItem {
  id: string;
  file: File;
  name: string;
  originalSize: number;
  originalUrl: string;
  duration: number;
  width: number;
  height: number;
  status: 'idle' | 'loading-engine' | 'compressing' | 'completed' | 'error';
  progress: number;
  errorMessage?: string;
  compressedBlob?: Blob;
  compressedUrl?: string;
  compressedSize?: number;
  compressedFormat?: string;
}

export default function VideoCompressorPage() {
  const [mounted, setMounted] = useState(false);
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [activeVideoId, setActiveVideoId] = useState<string | null>(null);

  // Compression Controls
  const [targetFormat, setTargetFormat] = useState<'mp4' | 'webm'>('mp4');
  const [compressionPreset, setCompressionPreset] = useState<'low' | 'medium' | 'high' | 'custom'>('medium');
  const [crf, setCrf] = useState<number>(28); // Lower CRF = Higher quality, 18-35 range
  const [resolution, setResolution] = useState<'original' | '1080p' | '720p' | '480p' | '360p'>('original');
  const [fps, setFps] = useState<'original' | '30' | '24' | '15'>('original');
  const [extractAudioOnly, setExtractAudioOnly] = useState<boolean>(false);
  
  // Trimming
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(0);
  const [enableTrim, setEnableTrim] = useState<boolean>(false);

  // Engine state
  const [engineLoading, setEngineLoading] = useState(false);
  const [engineReady, setEngineReady] = useState(false);
  const [engineError, setEngineError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [copied, setCopied] = useState(false);

  const ffmpegRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Update CRF when compression preset changes
  useEffect(() => {
    if (compressionPreset === 'low') setCrf(22); // High quality / low compression
    if (compressionPreset === 'medium') setCrf(28); // Balanced
    if (compressionPreset === 'high') setCrf(34); // High compression / smaller size
  }, [compressionPreset]);

  // Lazy Load FFmpeg WASM Core
  const loadFFmpegEngine = async () => {
    if (ffmpegRef.current && engineReady) return ffmpegRef.current;

    setEngineLoading(true);
    setEngineError(null);

    try {
      const { FFmpeg } = await import('@ffmpeg/ffmpeg');
      const ffmpeg = new FFmpeg();

      // Fetch core and WASM binaries using native fetchToBlobUrl
      const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
      const [coreURL, wasmURL] = await Promise.all([
        fetchToBlobUrl(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        fetchToBlobUrl(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm')
      ]);

      await ffmpeg.load({
        coreURL,
        wasmURL,
      });

      ffmpegRef.current = ffmpeg;
      setEngineReady(true);
      setEngineLoading(false);
      return ffmpeg;
    } catch (err: any) {
      console.error('Failed to load FFmpeg WASM engine:', err);
      setEngineLoading(false);
      setEngineError(`Failed to initialize WebAssembly video engine: ${err?.message || err}`);
      return null;
    }
  };

  // Handle File Uploads
  const handleFilesAdded = (files: FileList | File[]) => {
    Array.from(files).forEach((file) => {
      const isVideo = 
        file.type.startsWith('video/') || 
        ['.mp4', '.mov', '.webm', '.avi', '.mkv', '.m4v', '.3gp', '.flv', '.ts'].some(ext => file.name.toLowerCase().endsWith(ext));
      
      if (!isVideo) {
        alert(`File "${file.name}" is not a recognized video format.`);
        return;
      }

      const url = URL.createObjectURL(file);
      const itemId = Math.random().toString(36).substring(2, 9);

      const item: VideoItem = {
        id: itemId,
        file,
        name: file.name,
        originalSize: file.size,
        originalUrl: url,
        duration: 0,
        width: 0,
        height: 0,
        status: 'idle',
        progress: 0
      };

      // Instantly add to state so user sees their file immediately
      setVideos((prev) => [...prev, item]);
      setActiveVideoId((prev) => prev || itemId);

      // Probe metadata asynchronously without blocking UI
      const videoEl = document.createElement('video');
      videoEl.preload = 'metadata';
      videoEl.src = url;

      videoEl.onloadedmetadata = () => {
        const dur = videoEl.duration || 0;
        const w = videoEl.videoWidth || 0;
        const h = videoEl.videoHeight || 0;

        setVideos((prev) =>
          prev.map((v) =>
            v.id === itemId
              ? { ...v, duration: dur, width: w, height: h }
              : v
          )
        );

        if (dur > 0) {
          setTrimEnd((prevTrim) => (prevTrim === 0 ? Math.floor(dur) : prevTrim));
        }
      };

      videoEl.onerror = () => {
        console.warn('Video metadata probe failed for:', file.name);
      };
    });
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFilesAdded(e.dataTransfer.files);
    }
  };

  const activeVideo = useMemo(() => {
    return videos.find((v) => v.id === activeVideoId) || videos[0] || null;
  }, [videos, activeVideoId]);

  // Execute FFmpeg WASM Video Compression
  const compressVideo = async (targetVideo: VideoItem) => {
    if (!targetVideo) return;

    setIsProcessing(true);

    // 1. Ensure Engine Loaded
    let ffmpeg = ffmpegRef.current;
    if (!ffmpeg || !engineReady) {
      updateVideoState(targetVideo.id, { status: 'loading-engine', progress: 0 });
      ffmpeg = await loadFFmpegEngine();
      if (!ffmpeg) {
        updateVideoState(targetVideo.id, { status: 'error', errorMessage: 'Could not load FFmpeg engine.' });
        setIsProcessing(false);
        return;
      }
    }

    updateVideoState(targetVideo.id, { status: 'compressing', progress: 5 });

    try {
      const inputExt = targetVideo.name.split('.').pop() || 'mp4';
      const inputName = `input_${targetVideo.id}.${inputExt}`;
      const outputExt = extractAudioOnly ? 'mp3' : targetFormat;
      const outputName = `output_${targetVideo.id}.${outputExt}`;

      // Write video file to FFmpeg Virtual File System (MEMFS)
      const fileBuf = await targetVideo.file.arrayBuffer();
      await ffmpeg.writeFile(inputName, new Uint8Array(fileBuf));

      // Setup Progress callback
      ffmpeg.on('progress', ({ progress }: { progress: number }) => {
        const pct = Math.min(99, Math.max(10, Math.round(progress * 100)));
        updateVideoState(targetVideo.id, { progress: pct });
      });

      // Construct FFmpeg CLI Command Arguments
      const args: string[] = ['-i', inputName];

      // Trim times
      if (enableTrim) {
        if (trimStart > 0) args.push('-ss', String(trimStart));
        if (trimEnd > 0 && trimEnd > trimStart) args.push('-to', String(trimEnd));
      }

      if (extractAudioOnly) {
        // Extract Audio MP3
        args.push('-vn', '-acodec', 'libmp3lame', '-ab', '192k', outputName);
      } else {
        // Video Compression Filters
        const vfFilters: string[] = [];

        // Resolution downscaling
        if (resolution !== 'original') {
          const resHeight = resolution.replace('p', '');
          vfFilters.push(`scale=-2:${resHeight}`);
        }

        if (vfFilters.length > 0) {
          args.push('-vf', vfFilters.join(','));
        }

        // Frame rate
        if (fps !== 'original') {
          args.push('-r', fps);
        }

        if (targetFormat === 'mp4') {
          // H.264 Encoding with Ultrafast WASM preset
          args.push(
            '-vcodec', 'libx264',
            '-crf', String(crf),
            '-preset', 'ultrafast',
            '-pix_fmt', 'yuv420p',
            '-acodec', 'aac',
            outputName
          );
        } else {
          // WebM VP8 Encoding
          args.push(
            '-vcodec', 'libvpx',
            '-crf', String(crf),
            '-b:v', '1M',
            '-acodec', 'libvorbis',
            outputName
          );
        }
      }

      // Execute Transcoding
      await ffmpeg.exec(args);

      // Read output file from FFmpeg MEMFS
      const outputData = await ffmpeg.readFile(outputName);
      const mimeType = extractAudioOnly ? 'audio/mp3' : `video/${targetFormat}`;
      const rawBytes = typeof outputData === 'string' ? new TextEncoder().encode(outputData) : outputData;
      const cleanBuffer = rawBytes.buffer.slice(rawBytes.byteOffset, rawBytes.byteOffset + rawBytes.byteLength) as ArrayBuffer;
      const compressedBlob = new Blob([cleanBuffer], { type: mimeType });
      const compressedUrl = URL.createObjectURL(compressedBlob);

      // Clean up Virtual File System
      await ffmpeg.deleteFile(inputName);
      await ffmpeg.deleteFile(outputName);

      updateVideoState(targetVideo.id, {
        status: 'completed',
        progress: 100,
        compressedBlob,
        compressedUrl,
        compressedSize: compressedBlob.size,
        compressedFormat: outputExt.toUpperCase()
      });

      setIsProcessing(false);
    } catch (err: any) {
      console.error('Video compression error:', err);
      updateVideoState(targetVideo.id, {
        status: 'error',
        errorMessage: err?.message || 'Video processing failed. Memory limit reached or unsupported codec.'
      });
      setIsProcessing(false);
    }
  };

  const updateVideoState = (id: string, updates: Partial<VideoItem>) => {
    setVideos((prev) =>
      prev.map((v) => (v.id === id ? { ...v, ...updates } : v))
    );
  };

  const handleRemoveVideo = (id: string) => {
    setVideos((prev) => prev.filter((v) => v.id !== id));
    if (activeVideoId === id) {
      const remaining = videos.filter((v) => v.id !== id);
      setActiveVideoId(remaining.length > 0 ? remaining[0].id : null);
    }
  };

  const handleReset = () => {
    videos.forEach((v) => {
      if (v.originalUrl) URL.revokeObjectURL(v.originalUrl);
      if (v.compressedUrl) URL.revokeObjectURL(v.compressedUrl);
    });
    setVideos([]);
    setActiveVideoId(null);
    setIsProcessing(false);
  };

  const handleCopySummary = () => {
    if (!activeVideo || !activeVideo.compressedSize) return;

    const diff = activeVideo.originalSize - activeVideo.compressedSize;
    const pctSaved = Math.round((diff / activeVideo.originalSize) * 100);

    const summary = `Video Compression Summary:
File Name: ${activeVideo.name}
Original Size: ${formatBytes(activeVideo.originalSize)}
Compressed Size: ${formatBytes(activeVideo.compressedSize)}
Savings: ${pctSaved}% Smaller (${formatBytes(diff)} saved)
Processed 100% Client-Side via ToolWala AI: ${window.location.href}`;

    navigator.clipboard.writeText(summary);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const article = toolArticles['video-compressor'];

  return (
    <ToolVisibilityGuard slug="video-compressor">
      <div className="relative min-h-screen bg-slate-50 dark:bg-black text-slate-900 dark:text-white transition-colors duration-300 overflow-hidden font-sans">
        {/* Ambient Gradients */}
        <MeshGradient />
        <FloatingParticles />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 pb-24">
          
          {/* Navigation */}
          <div className="flex items-center justify-between mb-8">
            <Link 
              href="/tools" 
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-gray-300 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all shadow-sm"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Tools
            </Link>

            <div className="flex items-center gap-3">
              <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-[11px] font-black uppercase tracking-wider text-purple-600 dark:text-purple-400">
                <ShieldCheck className="w-3.5 h-3.5" /> 100% In-Browser WASM Processing
              </span>
              {videos.length > 0 && (
                <button
                  onClick={handleReset}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-white/80 dark:bg-white/5 border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-700 dark:text-gray-300 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-white/10 transition-all shadow-sm cursor-pointer"
                  title="Clear All Videos"
                >
                  <RefreshCw className="w-3.5 h-3.5" /> Reset
                </button>
              )}
            </div>
          </div>

          {/* Header Title */}
          <div className="text-center max-w-3xl mx-auto mb-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-xs font-black uppercase tracking-widest text-purple-600 dark:text-purple-400 mb-4 shadow-sm">
              <Video className="w-4 h-4" /> FFmpeg WebAssembly Transcoder Engine
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-3">
              Client-Side <span className="text-purple-600 dark:text-purple-400">Video Compressor</span>
            </h1>
            <p className="text-slate-600 dark:text-gray-400 text-sm sm:text-base font-medium leading-relaxed">
              Compress MP4, MOV, WebM, and MKV video files directly inside browser RAM. Zero server uploads guarantee 100% privacy and lightning speed.
            </p>
          </div>

          {/* Warning Note for COOP/COEP / SharedArrayBuffer */}
          <div className="mb-8 max-w-5xl mx-auto p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-purple-900 dark:text-purple-200 text-xs font-semibold flex items-center gap-3 shadow-sm">
            <Info className="w-5 h-5 text-purple-600 dark:text-purple-400 shrink-0" />
            <div>
              <span className="font-bold uppercase tracking-wider block mb-0.5">Browser CPU & WASM Memory Notice</span>
              <span>
                Video compression requires significant CPU power and RAM. For best performance, recommend video files under 500MB. Processing takes place entirely on your device!
              </span>
            </div>
          </div>

          {/* Upload Dropzone if no videos added */}
          {videos.length === 0 ? (
            <div 
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className="max-w-4xl mx-auto bg-white/80 dark:bg-slate-900/80 border-2 border-dashed border-purple-400/50 dark:border-purple-500/30 hover:border-purple-500 dark:hover:border-purple-400 p-10 sm:p-16 rounded-[2.5rem] text-center cursor-pointer transition-all shadow-2xl backdrop-blur-xl group relative overflow-hidden"
            >
              <input 
                type="file"
                ref={fileInputRef}
                onChange={(e) => e.target.files && handleFilesAdded(e.target.files)}
                accept="video/*,.mp4,.mov,.webm,.avi,.mkv,.m4v,.3gp,.flv,.ts"
                multiple
                className="hidden"
              />

              <div className="w-20 h-20 mx-auto mb-6 rounded-3xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-600 dark:text-purple-400 group-hover:scale-110 transition-transform shadow-lg">
                <Film className="w-10 h-10" />
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white uppercase tracking-tight mb-2">
                Drag & Drop Video Files Here
              </h3>
              <p className="text-slate-500 dark:text-gray-400 text-xs sm:text-sm font-medium mb-6 max-w-md mx-auto">
                Supports MP4, MOV, WebM, AVI, and MKV. Process single or multiple videos in browser RAM.
              </p>

              <div className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-black text-xs uppercase tracking-widest transition-all shadow-xl shadow-purple-600/20 group-hover:shadow-purple-600/40">
                <FileVideo className="w-4 h-4" /> Browse Video Files
              </div>
            </div>
          ) : (
            /* Main 2-Column Interface (Inputs + Controls on Left, Player & Result on Right) */
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-12">
              
              {/* Left Column: File List + Compression Controls (5 cols) */}
              <div className="lg:col-span-5 space-y-6">
                
                {/* Active Video Info Card */}
                {activeVideo && (
                  <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 p-6 rounded-[2rem] shadow-xl backdrop-blur-xl space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                      <h4 className="text-xs font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                        <Film className="w-4 h-4 text-purple-500" /> Active Video File
                      </h4>
                      <button
                        onClick={() => handleRemoveVideo(activeVideo.id)}
                        className="text-slate-400 hover:text-rose-500 transition-colors p-1"
                        title="Remove Video"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="space-y-2">
                      <p className="font-black text-sm text-slate-900 dark:text-white truncate" title={activeVideo.name}>
                        {activeVideo.name}
                      </p>
                      <div className="grid grid-cols-3 gap-2 text-[11px] font-bold text-slate-500 dark:text-gray-400">
                        <div className="bg-slate-100 dark:bg-white/5 p-2 rounded-xl text-center">
                          <span className="block text-[9px] uppercase opacity-75">Size</span>
                          <span className="font-mono font-black text-slate-900 dark:text-white">{formatBytes(activeVideo.originalSize)}</span>
                        </div>
                        <div className="bg-slate-100 dark:bg-white/5 p-2 rounded-xl text-center">
                          <span className="block text-[9px] uppercase opacity-75">Duration</span>
                          <span className="font-mono font-black text-slate-900 dark:text-white">{formatTime(activeVideo.duration)}</span>
                        </div>
                        <div className="bg-slate-100 dark:bg-white/5 p-2 rounded-xl text-center">
                          <span className="block text-[9px] uppercase opacity-75">Res</span>
                          <span className="font-mono font-black text-slate-900 dark:text-white">{activeVideo.width}x{activeVideo.height}</span>
                        </div>
                      </div>
                    </div>

                    {/* File Size Large Warning */}
                    {activeVideo.originalSize > 500 * 1024 * 1024 && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs font-semibold flex items-center gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                        <span>File exceeds 500MB. WASM processing may take several minutes and high RAM.</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Compression Settings Panel */}
                <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 p-6 rounded-[2rem] shadow-xl backdrop-blur-xl space-y-6">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-white/5 pb-3">
                    <h3 className="text-base font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2">
                      <Sliders className="w-4 h-4 text-purple-500" /> Compression Controls
                    </h3>
                  </div>

                  {/* Mode: Video Compression vs Audio Extraction */}
                  <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-black/40 border border-slate-200 dark:border-white/10 rounded-xl">
                    <button
                      onClick={() => setExtractAudioOnly(false)}
                      className={`py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                        !extractAudioOnly
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      🎥 Compress Video
                    </button>
                    <button
                      onClick={() => setExtractAudioOnly(true)}
                      className={`py-2 px-3 rounded-lg text-xs font-black uppercase tracking-wider transition-all cursor-pointer ${
                        extractAudioOnly
                          ? 'bg-purple-600 text-white shadow-md'
                          : 'text-slate-600 dark:text-gray-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      🎧 Extract MP3 Audio
                    </button>
                  </div>

                  {!extractAudioOnly ? (
                    <>
                      {/* Target Format */}
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-gray-300">
                          Target Output Format
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            onClick={() => setTargetFormat('mp4')}
                            className={`py-2.5 px-3 rounded-xl border text-xs font-black uppercase transition-all cursor-pointer ${
                              targetFormat === 'mp4'
                                ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400'
                                : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-gray-400'
                            }`}
                          >
                            MP4 (H.264)
                          </button>
                          <button
                            onClick={() => setTargetFormat('webm')}
                            className={`py-2.5 px-3 rounded-xl border text-xs font-black uppercase transition-all cursor-pointer ${
                              targetFormat === 'webm'
                                ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400'
                                : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-gray-400'
                            }`}
                          >
                            WebM (VP8)
                          </button>
                        </div>
                      </div>

                      {/* Compression Quality Level */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <label className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-gray-300">
                            Quality & Compression Preset
                          </label>
                          <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                            CRF: {crf}
                          </span>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { id: 'low', label: 'High Quality', crfVal: 22 },
                            { id: 'medium', label: 'Balanced', crfVal: 28 },
                            { id: 'high', label: 'Small File', crfVal: 34 }
                          ].map((item) => (
                            <button
                              key={item.id}
                              onClick={() => setCompressionPreset(item.id as any)}
                              className={`py-2 px-2 rounded-xl border text-center text-xs font-black uppercase transition-all cursor-pointer ${
                                compressionPreset === item.id
                                  ? 'border-purple-500 bg-purple-500/10 text-purple-600 dark:text-purple-400'
                                  : 'border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-gray-400'
                              }`}
                            >
                              {item.label}
                            </button>
                          ))}
                        </div>

                        {/* Fine Tuning CRF Slider */}
                        <div className="pt-2">
                          <input
                            type="range"
                            min="18"
                            max="36"
                            step="1"
                            value={crf}
                            onChange={(e) => {
                              setCrf(Number(e.target.value));
                              setCompressionPreset('custom');
                            }}
                            className="w-full accent-purple-600 cursor-pointer"
                          />
                          <div className="flex justify-between text-[10px] font-bold text-slate-400">
                            <span>Best Quality (CRF 18)</span>
                            <span>Smallest Size (CRF 36)</span>
                          </div>
                        </div>
                      </div>

                      {/* Downscale Resolution */}
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-gray-300">
                          Resolution Downscale
                        </label>
                        <select
                          value={resolution}
                          onChange={(e) => setResolution(e.target.value as any)}
                          className="w-full bg-slate-100 dark:bg-black/50 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-purple-500 cursor-pointer"
                        >
                          <option value="original">Original Resolution</option>
                          <option value="1080p">1080p Full HD (1920x1080)</option>
                          <option value="720p">720p HD (1280x720)</option>
                          <option value="480p">480p SD (854x480)</option>
                          <option value="360p">360p Low (640x360)</option>
                        </select>
                      </div>

                      {/* Frame Rate Limit */}
                      <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-gray-300">
                          Frame Rate (FPS)
                        </label>
                        <select
                          value={fps}
                          onChange={(e) => setFps(e.target.value as any)}
                          className="w-full bg-slate-100 dark:bg-black/50 border border-slate-300 dark:border-white/10 rounded-xl px-4 py-2.5 text-xs font-bold text-slate-900 dark:text-white outline-none focus:border-purple-500 cursor-pointer"
                        >
                          <option value="original">Original FPS</option>
                          <option value="30">30 FPS</option>
                          <option value="24">24 FPS (Cinematic)</option>
                          <option value="15">15 FPS (High Compression)</option>
                        </select>
                      </div>
                    </>
                  ) : (
                    <div className="p-4 rounded-2xl bg-purple-500/10 border border-purple-500/20 text-xs font-semibold text-purple-900 dark:text-purple-200">
                      🎧 Extract Audio Mode selected. Video stream will be removed and output will be saved as high quality 192kbps MP3 audio file.
                    </div>
                  )}

                  {/* Video Trimming Controls */}
                  <div className="border-t border-slate-100 dark:border-white/5 pt-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <label className="text-xs font-black uppercase tracking-widest text-slate-700 dark:text-gray-300 flex items-center gap-1.5">
                        <Scissors className="w-4 h-4 text-purple-500" /> Trim Video Length
                      </label>
                      <input
                        type="checkbox"
                        checked={enableTrim}
                        onChange={(e) => setEnableTrim(e.target.checked)}
                        className="w-4 h-4 accent-purple-600 rounded cursor-pointer"
                      />
                    </div>

                    {enableTrim && activeVideo && (
                      <div className="grid grid-cols-2 gap-3 p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200 dark:border-white/5 text-xs">
                        <div>
                          <span className="block font-bold text-slate-600 dark:text-gray-400 mb-1">Start Time (sec)</span>
                          <input
                            type="number"
                            min="0"
                            max={trimEnd}
                            value={trimStart}
                            onChange={(e) => setTrimStart(Number(e.target.value))}
                            className="w-full bg-white dark:bg-black/50 border border-slate-300 dark:border-white/10 rounded-lg p-2 font-mono"
                          />
                        </div>
                        <div>
                          <span className="block font-bold text-slate-600 dark:text-gray-400 mb-1">End Time (sec)</span>
                          <input
                            type="number"
                            min={trimStart}
                            max={Math.floor(activeVideo.duration)}
                            value={trimEnd}
                            onChange={(e) => setTrimEnd(Number(e.target.value))}
                            className="w-full bg-white dark:bg-black/50 border border-slate-300 dark:border-white/10 rounded-lg p-2 font-mono"
                          />
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Submit Action Button */}
                  {activeVideo && (
                    <button
                      onClick={() => compressVideo(activeVideo)}
                      disabled={isProcessing}
                      className={`w-full py-4 rounded-2xl font-black uppercase tracking-widest text-xs transition-all shadow-xl flex items-center justify-center gap-2 cursor-pointer ${
                        isProcessing
                          ? 'bg-slate-400 text-white cursor-not-allowed'
                          : 'bg-purple-600 hover:bg-purple-500 text-white shadow-purple-600/30 hover:scale-[1.02] active:scale-95'
                      }`}
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" /> Processing WASM Transcoding...
                        </>
                      ) : (
                        <>
                          <Zap className="w-4 h-4" /> {extractAudioOnly ? 'Extract MP3 Audio' : 'Compress Video Now'}
                        </>
                      )}
                    </button>
                  )}

                  {/* Add More Videos Button */}
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isProcessing}
                    className="w-full py-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-gray-300 hover:bg-slate-100 dark:hover:bg-white/5 text-xs font-bold uppercase transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    + Add More Video Files
                  </button>
                </div>

              </div>

              {/* Right Column: Preview Player & Result Comparison (7 cols) */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Active Video Status & Progress Bar */}
                {activeVideo && activeVideo.status === 'compressing' && (
                  <motion.div 
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/90 dark:bg-slate-900/90 border border-purple-500/30 p-6 rounded-[2rem] shadow-xl backdrop-blur-xl space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black uppercase tracking-wider text-purple-600 dark:text-purple-400 flex items-center gap-2">
                        <RefreshCw className="w-4 h-4 animate-spin" /> Transcoding in Browser Memory...
                      </span>
                      <span className="font-mono font-black text-sm text-purple-600 dark:text-purple-400">
                        {activeVideo.progress}%
                      </span>
                    </div>

                    {/* Animated Progress Bar */}
                    <div className="w-full h-3 bg-slate-100 dark:bg-white/10 rounded-full overflow-hidden p-0.5">
                      <motion.div 
                        className="h-full bg-gradient-to-r from-purple-600 to-indigo-500 rounded-full"
                        animate={{ width: `${activeVideo.progress}%` }}
                        transition={{ duration: 0.3 }}
                      />
                    </div>

                    <p className="text-[11px] text-slate-500 dark:text-gray-400 text-center font-medium">
                      ⏳ FFmpeg WASM processing in progress. Please keep this browser tab open until completion.
                    </p>
                  </motion.div>
                )}

                {/* Error Banner */}
                {activeVideo && activeVideo.status === 'error' && (
                  <div className="p-5 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-900 dark:text-rose-200 text-xs font-semibold flex items-start gap-3">
                    <AlertCircle className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-bold uppercase tracking-wider mb-1">Processing Error</p>
                      <p>{activeVideo.errorMessage}</p>
                    </div>
                  </div>
                )}

                {/* Completed Result Card */}
                {activeVideo && activeVideo.status === 'completed' && activeVideo.compressedSize && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.98 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="p-6 sm:p-7 rounded-[2rem] bg-gradient-to-r from-emerald-500/15 via-teal-500/10 to-emerald-500/15 border border-emerald-500/30 text-slate-900 dark:text-white shadow-xl space-y-6"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-emerald-500 text-white flex items-center justify-center font-black text-xl shadow-lg">
                          🎉
                        </div>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 block">Compression Success</span>
                          <h3 className="text-lg font-black tracking-tight">
                            {Math.round(((activeVideo.originalSize - activeVideo.compressedSize) / activeVideo.originalSize) * 100)}% Size Reduction!
                          </h3>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={handleCopySummary}
                          className="px-4 py-2.5 rounded-xl bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-black uppercase tracking-wider text-slate-800 dark:text-white hover:bg-slate-100 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
                        >
                          {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                          {copied ? 'Copied!' : 'Copy Summary'}
                        </button>
                        <a
                          href={activeVideo.compressedUrl}
                          download={`compressed_${activeVideo.name.replace(/\.[^/.]+$/, "")}.${activeVideo.compressedFormat?.toLowerCase()}`}
                          className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-emerald-600/30 flex items-center gap-1.5 cursor-pointer"
                        >
                          <Download className="w-4 h-4" /> Download File
                        </a>
                      </div>
                    </div>

                    {/* Size Comparison Badge Bar */}
                    <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-white/80 dark:bg-black/40 border border-emerald-500/20 text-center">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400 block">Original Size</span>
                        <span className="font-mono font-black text-sm text-slate-900 dark:text-white">{formatBytes(activeVideo.originalSize)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400 block">Compressed Size</span>
                        <span className="font-mono font-black text-sm text-emerald-600 dark:text-emerald-400">{formatBytes(activeVideo.compressedSize)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-gray-400 block">Data Saved</span>
                        <span className="font-mono font-black text-sm text-purple-600 dark:text-purple-400">
                          {formatBytes(activeVideo.originalSize - activeVideo.compressedSize)}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}

                {/* Video Preview Players (Original vs Compressed) */}
                {activeVideo && (
                  <div className="bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-white/10 p-6 rounded-[2rem] shadow-xl backdrop-blur-xl space-y-6">
                    <h3 className="text-base font-black uppercase tracking-wider text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-100 dark:border-white/5 pb-3">
                      <Play className="w-4 h-4 text-purple-500" /> Video Preview Player
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* Original Video Preview */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black uppercase tracking-wider text-slate-700 dark:text-gray-300">
                            Original Input Video
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {formatBytes(activeVideo.originalSize)}
                          </span>
                        </div>
                        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-black aspect-video flex items-center justify-center shadow-inner">
                          <video
                            src={activeVideo.originalUrl}
                            controls
                            className="w-full h-full object-contain"
                          />
                        </div>
                      </div>

                      {/* Compressed Video Preview */}
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
                            {activeVideo.compressedSize ? 'Compressed Output' : 'Compressed Preview (Pending)'}
                          </span>
                          {activeVideo.compressedSize && (
                            <span className="text-[10px] font-mono text-emerald-500 font-bold">
                              {formatBytes(activeVideo.compressedSize)}
                            </span>
                          )}
                        </div>

                        <div className="rounded-2xl overflow-hidden border border-slate-200 dark:border-white/10 bg-black aspect-video flex items-center justify-center shadow-inner relative">
                          {activeVideo.compressedUrl ? (
                            activeVideo.compressedFormat === 'MP3' ? (
                              <div className="p-6 text-center space-y-3">
                                <Music className="w-12 h-12 text-purple-400 mx-auto animate-bounce" />
                                <p className="text-xs font-black uppercase text-purple-400">MP3 Audio File Ready</p>
                                <audio src={activeVideo.compressedUrl} controls className="w-full" />
                              </div>
                            ) : (
                              <video
                                src={activeVideo.compressedUrl}
                                controls
                                className="w-full h-full object-contain"
                              />
                            )
                          ) : (
                            <div className="text-center p-6 text-slate-500 dark:text-gray-500 text-xs font-bold">
                              <Film className="w-8 h-8 mx-auto mb-2 opacity-40" />
                              Click "Compress Video Now" to render output preview
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                )}

              </div>

            </div>
          )}

          {/* Deep Dive Article / FAQ Section */}
          {article && (
            <div className="mt-16">
              <ToolArticle {...article} />
            </div>
          )}

        </div>
      </div>
    </ToolVisibilityGuard>
  );
}
