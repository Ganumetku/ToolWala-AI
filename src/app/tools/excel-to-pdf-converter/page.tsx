"use client";

import Link from 'next/link';
import { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import {
  FileText, Download, UploadCloud, Trash2,
  AlertCircle, CheckCircle, RefreshCw, ChevronLeft,
  Settings, ArrowRight, Table, Layers, FileSpreadsheet,
  CheckSquare, Square, Eye, Sliders, LayoutGrid
} from 'lucide-react';
import { toast } from 'sonner';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';
import { MeshGradient } from '@/components/BackgroundEffects';

import {
  ParsedSheet,
  PdfOptions,
  PdfOrientation,
  PdfPageSize,
  PdfMargins,
  ConversionStepStatus,
  ExcelToPdfResult
} from './types';

import { parseExcelWorkbook } from './utils/excelParser';
import { generatePdfFromSheets, formatBytes } from './utils/pdfGenerator';

export default function ExcelToPdfConverter() {
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [sheets, setSheets] = useState<ParsedSheet[]>([]);
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);

  // Workflow states
  const [isUploading, setIsUploading] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [conversionResult, setConversionResult] = useState<ExcelToPdfResult | null>(null);

  // Output filename
  const [outputName, setOutputName] = useState("converted_document");

  // PDF Configuration Options
  const [pdfOptions, setPdfOptions] = useState<PdfOptions>({
    orientation: 'portrait',
    pageSize: 'a4',
    margins: 'normal',
    fitToWidth: true,
    includeGridlines: true,
    highlightHeaders: true,
    showPageNumbers: true,
    customTitle: ''
  });

  // Conversion steps progress
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progressPct, setProgressPct] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  const steps: ConversionStepStatus[] = [
    { id: '1', label: 'Reading Spreadsheet', status: currentStepIndex > 0 ? 'completed' : currentStepIndex === 0 ? 'in-progress' : 'pending' },
    { id: '2', label: 'Formatting Layout', status: currentStepIndex > 1 ? 'completed' : currentStepIndex === 1 ? 'in-progress' : 'pending' },
    { id: '3', label: 'Building Pages', status: currentStepIndex > 2 ? 'completed' : currentStepIndex === 2 ? 'in-progress' : 'pending' },
    { id: '4', label: 'Generating PDF', status: currentStepIndex > 3 ? 'completed' : currentStepIndex === 3 ? 'in-progress' : 'pending' }
  ];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOverUpload, setIsDraggingOverUpload] = useState(false);

  const getColLabel = (index: number): string => {
    let label = '';
    let i = index;
    while (i >= 0) {
      label = String.fromCharCode((i % 26) + 65) + label;
      i = Math.floor(i / 26) - 1;
    }
    return label;
  };

  // Handle Excel Upload & Parsing
  const handleFileUpload = async (file: File) => {
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size exceeds 100 MB limit.");
      return;
    }

    const ext = file.name.split('.').pop()?.toLowerCase();
    if (!['xlsx', 'xls', 'csv'].includes(ext || '')) {
      toast.error("Please upload a valid Excel (.xlsx, .xls) or CSV file.");
      return;
    }

    setExcelFile(file);
    setIsUploading(true);
    setIsParsing(true);
    setIsCompleted(false);
    setConversionResult(null);
    setActiveSheetIndex(0);
    setOutputName(file.name.replace(/\.[^/.]+$/, ""));

    try {
      const parsed = await parseExcelWorkbook(file);
      setSheets(parsed);

      if (parsed.length === 0) {
        toast.error("No valid data rows found in this spreadsheet.");
      } else {
        toast.success(`Successfully parsed ${parsed.length} worksheet(s).`);
      }
    } catch (err: any) {
      console.error("Excel Parsing Error:", err);
      toast.error("Could not parse spreadsheet file.");
    } finally {
      setIsUploading(false);
      setIsParsing(false);
    }
  };

  // Toggle Sheet Selection
  const toggleSheetSelection = (id: string) => {
    setSheets(prev =>
      prev.map(s => (s.id === id ? { ...s, isSelected: !s.isSelected } : s))
    );
  };

  // Trigger Conversion Execution
  const handleConvert = async () => {
    const selectedSheets = sheets.filter(s => s.isSelected);
    if (selectedSheets.length === 0) {
      toast.error("Please select at least one worksheet to convert.");
      return;
    }

    setIsConverting(true);
    setCurrentStepIndex(0);
    setProgressPct(15);

    try {
      setCurrentStepIndex(0);
      setStatusMessage("Reading spreadsheet data...");
      setProgressPct(30);
      await new Promise(r => setTimeout(r, 200));

      setCurrentStepIndex(1);
      setStatusMessage("Formatting PDF table layout...");
      setProgressPct(55);
      await new Promise(r => setTimeout(r, 250));

      setCurrentStepIndex(2);
      setStatusMessage("Building page breaks and margins...");
      setProgressPct(80);
      await new Promise(r => setTimeout(r, 200));

      setCurrentStepIndex(3);
      setStatusMessage("Generating final PDF document...");
      setProgressPct(95);

      const result = await generatePdfFromSheets(sheets, pdfOptions, outputName);

      setProgressPct(100);
      setConversionResult(result);
      setIsCompleted(true);
      toast.success("Excel successfully converted to PDF!");
    } catch (err: any) {
      console.error("Conversion error:", err);
      toast.error("Conversion failed: " + (err.message || "Unknown error"));
    } finally {
      setIsConverting(false);
    }
  };

  const handleDownload = () => {
    if (!conversionResult) return;
    const url = URL.createObjectURL(conversionResult.blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = conversionResult.fileName;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success(`Downloaded ${conversionResult.fileName}`);
  };

  const handleReset = () => {
    setExcelFile(null);
    setSheets([]);
    setIsUploading(false);
    setIsParsing(false);
    setIsConverting(false);
    setIsCompleted(false);
    setConversionResult(null);
    setActiveSheetIndex(0);
  };

  const article = toolArticles['excel-to-pdf-converter'];

  return (
    <div className="relative min-h-screen py-10 px-4 sm:px-6 lg:px-8 text-slate-900 dark:text-neutral-100 bg-[#F6F8FC] dark:bg-[#030712] transition-colors">
      <MeshGradient />

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">

        {/* Back Link */}
        <div>
          <Link
            href="/tools/pdf-tools"
            className="inline-flex items-center text-xs font-semibold text-slate-500 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Back to PDF Tools
          </Link>
        </div>

        {/* HEADER SECTION - Blue + Purple Premium Gradient */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-blue-600/20 to-purple-600/30 rounded-2xl border border-blue-500/30 mb-1 shadow-lg shadow-blue-500/10">
            <FileSpreadsheet className="w-9 h-9 text-blue-400" />
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-purple-300 dark:to-indigo-400 bg-clip-text text-transparent">
            Free Excel to PDF Converter
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-neutral-300 leading-relaxed">
            Convert Excel spreadsheets (.xlsx, .xls, .csv) into clean, professional PDF documents instantly. Preserve table layout, formatting, gridlines, and page structure.
          </p>

          {/* Privacy Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800/80 text-[11px] font-semibold text-blue-700 dark:text-blue-300 shadow-sm">
            <span>🔒 100% Client-Side Processing</span>
            <span>•</span>
            <span>No Upload Required</span>
            <span>•</span>
            <span>Privacy First</span>
          </div>
        </div>

        {/* MAIN CONTAINER */}
        <div className="bg-white dark:bg-neutral-900/80 backdrop-blur-xl rounded-3xl border border-slate-200 dark:border-neutral-800 shadow-2xl overflow-hidden p-6 sm:p-8 space-y-8">

          {/* STATE 1: UPLOAD ZONE */}
          {!excelFile && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div
                onDragOver={(e) => { e.preventDefault(); setIsDraggingOverUpload(true); }}
                onDragLeave={() => setIsDraggingOverUpload(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setIsDraggingOverUpload(false);
                  if (e.dataTransfer.files && e.dataTransfer.files[0]) {
                    handleFileUpload(e.dataTransfer.files[0]);
                  }
                }}
                onClick={() => fileInputRef.current?.click()}
                className={`relative border-2 border-dashed rounded-2xl p-8 sm:p-12 text-center cursor-pointer transition-all ${
                  isDraggingOverUpload
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-950/40 scale-[1.01]'
                    : 'border-slate-300 dark:border-neutral-700 hover:border-blue-500/80 hover:bg-blue-50/80 dark:hover:bg-neutral-800/50'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".xlsx,.xls,.csv"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileUpload(e.target.files[0]);
                    }
                  }}
                />

                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-blue-600/30 to-purple-600/30 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-inner">
                  <UploadCloud className="w-7 h-7 animate-bounce" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-neutral-100 mb-1">
                  Drag & Drop Excel file here
                </h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mb-4">
                  or click to select .xlsx, .xls, or .csv from your device
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-neutral-400">
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 font-medium">
                    Supported: .xlsx, .xls, .csv
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 font-medium">
                    Maximum Size: 100 MB
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* FILE DETAILS BAR */}
          {excelFile && (
            <div className="space-y-6">
              
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-neutral-800/70 border border-slate-200 dark:border-neutral-700/80">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400 shrink-0">
                    <FileSpreadsheet className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-neutral-100 truncate text-sm">
                      {excelFile.name}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-neutral-400">
                      <span>Size: {formatBytes(excelFile.size)}</span>
                      <span>•</span>
                      <span>Sheets: {sheets.length}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isParsing || isConverting}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-neutral-600 hover:bg-slate-100 dark:hover:bg-neutral-700 text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    Change File
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={isParsing || isConverting}
                    className="p-2 rounded-xl text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-50"
                    title="Remove File"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* PARSING SHIMMER */}
              {isParsing && (
                <div className="space-y-4 py-8 text-center">
                  <div className="w-10 h-10 mx-auto rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                  <p className="text-xs font-medium text-slate-600 dark:text-neutral-300 animate-pulse">
                    Parsing Excel worksheets & cell grid structure...
                  </p>
                </div>
              )}

              {/* SHEET SELECTOR & PREVIEW */}
              {sheets.length > 0 && !isParsing && !isCompleted && (
                <div className="space-y-6">
                  
                  {/* MULTI-SHEET SELECTOR */}
                  <div className="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-800/40 border border-slate-200 dark:border-neutral-800 space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-neutral-300 flex items-center space-x-2">
                        <Layers className="w-4 h-4 text-blue-400" />
                        <span>Worksheets to Convert ({sheets.filter(s => s.isSelected).length} selected)</span>
                      </h4>
                    </div>

                    <div className="flex flex-wrap gap-2 pt-1">
                      {sheets.map(sheet => (
                        <button
                          key={sheet.id}
                          onClick={() => toggleSheetSelection(sheet.id)}
                          className={`px-3 py-1.5 rounded-xl text-xs font-medium flex items-center space-x-2 transition-all ${
                            sheet.isSelected
                              ? 'bg-blue-50 dark:bg-blue-900/60 border border-blue-500 text-blue-800 dark:text-blue-200'
                              : 'bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 text-slate-400 dark:text-neutral-500 hover:text-slate-600 dark:hover:text-neutral-300'
                          }`}
                        >
                          {sheet.isSelected ? <CheckSquare className="w-3.5 h-3.5 text-blue-400" /> : <Square className="w-3.5 h-3.5 text-neutral-600" />}
                          <span>{sheet.name}</span>
                          <span className="text-[10px] text-slate-500 dark:text-neutral-400 font-mono">({sheet.rowCount} rows)</span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* SPREADSHEET TABLE PREVIEW GRID */}
                  <div className="space-y-3 border border-slate-200 dark:border-neutral-800 rounded-2xl p-4 bg-slate-50 dark:bg-neutral-950/60">
                    <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-neutral-800">
                      <span className="text-xs font-bold text-slate-800 dark:text-neutral-200 flex items-center space-x-2">
                        <Eye className="w-4 h-4 text-purple-400" />
                        <span>Spreadsheet Preview ({sheets[activeSheetIndex]?.name})</span>
                      </span>

                      <div className="flex items-center space-x-1 overflow-x-auto">
                        {sheets.map((s, idx) => (
                          <button
                            key={s.id}
                            onClick={() => setActiveSheetIndex(idx)}
                            className={`px-2.5 py-1 rounded-lg text-xs transition-colors ${
                              activeSheetIndex === idx
                                ? 'bg-purple-600 text-white font-bold'
                                : 'bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-700'
                            }`}
                          >
                            {s.name}
                          </button>
                        ))}
                      </div>
                    </div>

                    {sheets[activeSheetIndex] && (
                      <div className="overflow-x-auto border border-slate-200 dark:border-neutral-800 rounded-xl max-h-80 shadow-inner">
                        <table className="w-full text-xs text-left border-collapse min-w-[500px]">
                          <thead>
                            <tr className="bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400 font-mono text-[11px] border-b border-slate-200 dark:border-neutral-700">
                              <th className="p-2 border-r border-slate-200 dark:border-neutral-700 text-center w-10">#</th>
                              {Array.from({ length: sheets[activeSheetIndex].columnCount }).map((_, cIdx) => (
                                <th key={cIdx} className="p-2 border-r border-slate-200 dark:border-neutral-700 text-center font-bold">
                                  {getColLabel(cIdx)}
                                </th>
                              ))}
                            </tr>
                          </thead>
                          <tbody>
                            {sheets[activeSheetIndex].rows.map((row, rIdx) => (
                              <tr
                                key={rIdx}
                                className={`border-b border-slate-100 dark:border-neutral-800/80 hover:bg-purple-50 dark:hover:bg-purple-950/20 transition-colors ${
                                  row.isHeader ? 'bg-purple-50 dark:bg-purple-950/30 font-semibold text-purple-800 dark:text-purple-200' : ''
                                }`}
                              >
                                <td className="p-2 border-r border-slate-100 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-800/40 text-center font-mono text-[11px] text-slate-400 dark:text-neutral-500">
                                  {rIdx + 1}
                                </td>
                                {row.cells.map((cell, cIdx) => (
                                  <td
                                    key={cIdx}
                                    className={`p-2 border-r border-slate-100 dark:border-neutral-800/80 truncate max-w-[200px] ${
                                      cell.align === 'right' ? 'text-right' : 'text-left'
                                    }`}
                                  >
                                    {cell.text || <span className="text-slate-400 dark:text-neutral-600 italic">empty</span>}
                                  </td>
                                ))}
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>

                  {/* PDF LAYOUT CONFIGURATION PANEL */}
                  <div className="p-5 rounded-2xl bg-slate-50 dark:bg-neutral-800/40 border border-slate-200 dark:border-neutral-800 space-y-4">
                    <h3 className="font-bold text-xs text-slate-600 dark:text-neutral-300 uppercase tracking-wider flex items-center space-x-2">
                      <Sliders className="w-4 h-4 text-blue-400" />
                      <span>PDF Layout & Page Settings</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      
                      {/* Orientation */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-1.5">
                          Page Orientation
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => setPdfOptions(p => ({ ...p, orientation: 'portrait' }))}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                              pdfOptions.orientation === 'portrait'
                                ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                                : 'bg-white dark:bg-neutral-900 text-slate-500 dark:text-neutral-400 border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800'
                            }`}
                          >
                            Portrait
                          </button>
                          <button
                            type="button"
                            onClick={() => setPdfOptions(p => ({ ...p, orientation: 'landscape' }))}
                            className={`px-3 py-2 rounded-xl text-xs font-bold border transition-all ${
                              pdfOptions.orientation === 'landscape'
                                ? 'bg-blue-600 text-white border-blue-500 shadow-md'
                                : 'bg-white dark:bg-neutral-900 text-slate-500 dark:text-neutral-400 border-slate-200 dark:border-neutral-700 hover:bg-slate-50 dark:hover:bg-neutral-800'
                            }`}
                          >
                            Landscape
                          </button>
                        </div>
                      </div>

                      {/* Paper Size */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-1.5">
                          Paper Size
                        </label>
                        <select
                          value={pdfOptions.pageSize}
                          onChange={(e) => setPdfOptions(p => ({ ...p, pageSize: e.target.value as PdfPageSize }))}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-xs font-medium text-slate-800 dark:text-neutral-200 focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="a4">A4 (Standard 210 x 297 mm)</option>
                          <option value="letter">Letter (8.5 x 11 in)</option>
                          <option value="legal">Legal (8.5 x 14 in)</option>
                          <option value="a3">A3 (Large 297 x 420 mm)</option>
                        </select>
                      </div>

                      {/* Margins */}
                      <div>
                        <label className="block text-xs font-semibold text-slate-500 dark:text-neutral-400 mb-1.5">
                          Margin Spacing
                        </label>
                        <select
                          value={pdfOptions.margins}
                          onChange={(e) => setPdfOptions(p => ({ ...p, margins: e.target.value as PdfMargins }))}
                          className="w-full px-3 py-2 rounded-xl bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 text-xs font-medium text-slate-800 dark:text-neutral-200 focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="normal">Normal Margins (15 mm)</option>
                          <option value="narrow">Narrow Margins (8 mm)</option>
                          <option value="wide">Wide Margins (25 mm)</option>
                        </select>
                      </div>

                    </div>

                    {/* Layout Toggles */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-200 dark:border-neutral-800">
                      {[
                        { key: 'fitToWidth', label: 'Fit Table to Page Width' },
                        { key: 'includeGridlines', label: 'Include Table Gridlines' },
                        { key: 'highlightHeaders', label: 'Highlight Header Rows' },
                        { key: 'showPageNumbers', label: 'Show Page Numbers' }
                      ].map(opt => (
                        <label key={opt.key} className="flex items-center space-x-2 text-xs font-medium cursor-pointer text-slate-600 dark:text-neutral-300">
                          <input
                            type="checkbox"
                            checked={Boolean((pdfOptions as any)[opt.key])}
                            onChange={(e) => setPdfOptions(p => ({ ...p, [opt.key]: e.target.checked }))}
                            className="rounded border-slate-300 dark:border-neutral-700 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                          />
                          <span>{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  {/* CONVERT BUTTON */}
                  <div className="pt-2 text-center">
                    <button
                      onClick={handleConvert}
                      disabled={isConverting}
                      className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-base shadow-xl hover:shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 mx-auto disabled:opacity-50"
                    >
                      <FileText className="w-5 h-5" />
                      <span>Convert Excel to PDF</span>
                      <ArrowRight className="w-4 h-4 ml-1" />
                    </button>
                  </div>

                </div>
              )}

            </div>
          )}

          {/* CONVERSION ANIMATED PROGRESS BAR */}
          {isConverting && (
            <div className="space-y-6 py-6 text-center">
              <div className="max-w-md mx-auto space-y-2">
                <div className="flex justify-between text-xs font-bold text-slate-600 dark:text-neutral-300">
                  <span>{statusMessage}</span>
                  <span>{progressPct}%</span>
                </div>
                <div className="w-full bg-slate-200 dark:bg-neutral-800 h-3 rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-full rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${progressPct}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 max-w-xl mx-auto pt-4">
                {steps.map((step, idx) => (
                  <div
                    key={step.id}
                    className={`p-2 rounded-xl border text-[11px] font-semibold flex flex-col items-center transition-all ${
                      step.status === 'completed'
                        ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-200 dark:border-blue-700 text-blue-700 dark:text-blue-300'
                        : step.status === 'in-progress'
                        ? 'bg-purple-50 dark:bg-purple-950/60 border-purple-300 dark:border-purple-500 text-purple-700 dark:text-purple-300 animate-pulse'
                        : 'bg-slate-50 dark:bg-neutral-800/40 border-slate-200 dark:border-neutral-800 text-slate-400 dark:text-neutral-500'
                    }`}
                  >
                    <span className="text-[9px] uppercase font-mono text-slate-400 dark:text-neutral-500 mb-0.5">Step {idx + 1}</span>
                    <span>{step.label}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* RESULT SCREEN */}
          {isCompleted && conversionResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6 py-4 text-center"
            >
              <div className="inline-flex items-center justify-center p-4 bg-blue-50 dark:bg-blue-950 text-blue-600 dark:text-blue-400 rounded-full shadow-lg border border-blue-200 dark:border-blue-800">
                <CheckCircle className="w-10 h-10" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-900 dark:text-neutral-100">
                  PDF Document Created!
                </h2>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                  Your Excel spreadsheet has been formatted into a high-density PDF.
                </p>
              </div>

              {/* RESULT METRICS */}
              <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 max-w-3xl mx-auto">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-700/60">
                  <p className="text-[10px] text-slate-500 dark:text-neutral-400 font-medium uppercase">Pages Generated</p>
                  <p className="text-lg font-black text-slate-900 dark:text-neutral-100 mt-0.5">{conversionResult.pagesGenerated}</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-700/60">
                  <p className="text-[10px] text-slate-500 dark:text-neutral-400 font-medium uppercase">Sheets Converted</p>
                  <p className="text-lg font-black text-blue-400 mt-0.5">{conversionResult.sheetsConverted}</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-700/60">
                  <p className="text-[10px] text-slate-500 dark:text-neutral-400 font-medium uppercase">Rows Processed</p>
                  <p className="text-lg font-black text-slate-900 dark:text-neutral-100 mt-0.5">{conversionResult.totalRows}</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-700/60">
                  <p className="text-[10px] text-slate-500 dark:text-neutral-400 font-medium uppercase">Processing Time</p>
                  <p className="text-lg font-black text-indigo-400 mt-0.5">{(conversionResult.processingTimeMs / 1000).toFixed(2)}s</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-700/60">
                  <p className="text-[10px] text-slate-500 dark:text-neutral-400 font-medium uppercase">PDF File Size</p>
                  <p className="text-lg font-black text-emerald-400 mt-0.5">{conversionResult.outputFileSizeFormatted}</p>
                </div>
              </div>

              {/* ACTIONS */}
              <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
                <button
                  onClick={handleDownload}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-base shadow-xl hover:shadow-blue-500/20 transition-all flex items-center space-x-2"
                >
                  <Download className="w-5 h-5" />
                  <span>Download PDF</span>
                </button>

                <button
                  onClick={handleReset}
                  className="px-6 py-3.5 rounded-2xl border border-slate-300 dark:border-neutral-700 hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-200 font-semibold text-xs transition-colors flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Convert Another Spreadsheet</span>
                </button>
              </div>
            </motion.div>
          )}

        </div>

        {/* SEO CONTENT SECTION */}
        {article && (
          <div className="mt-12">
            <ToolArticle {...article} />
          </div>
        )}

      </div>
    </div>
  );
}
