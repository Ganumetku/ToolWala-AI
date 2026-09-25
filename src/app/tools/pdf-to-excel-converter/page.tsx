"use client";

import Link from 'next/link';
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FileSpreadsheet, Download, UploadCloud, Trash2,
  AlertCircle, CheckCircle, RefreshCw, ChevronLeft,
  Shield, Sparkles, Settings, FileWarning, ArrowRight,
  Eye, CheckSquare, Square, Layers, Cpu, Clock, Table,
  HelpCircle, Languages, AlertTriangle, FileText, Edit2,
  Check, X, Merge, FileCode, Zap, Layers3
} from 'lucide-react';
import { toast } from 'sonner';
import ToolArticle from '@/components/ToolArticle';
import { toolArticles } from '@/data/toolArticles';
import { MeshGradient } from '@/components/BackgroundEffects';

import {
  ExtractedCell,
  ExtractedRow,
  EditableSheet,
  DocClassification,
  ExportOptions,
  AdvancedSettings,
  ExtractionMode,
  OcrLanguage,
  ConversionStepStatus,
  ConversionResult
} from './types';

import { classifyPdfDocument } from './utils/docClassifier';
import { extractPdfToExcelSheets } from './utils/tableExtractor';
import { generateExcelFromSheets, formatBytes } from './utils/excelGenerator';

export default function PdfToExcelConverter() {
  const [pdfjs, setPdfjs] = useState<any>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfDoc, setPdfDoc] = useState<any>(null);
  const [classification, setClassification] = useState<DocClassification | null>(null);
  const [sheets, setSheets] = useState<EditableSheet[]>([]);

  // Extraction Mode
  const [extractionMode, setExtractionMode] = useState<ExtractionMode>('smart');

  // Workflow states
  const [isUploading, setIsUploading] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [conversionResult, setConversionResult] = useState<ConversionResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Table Preview & Inline Editing State
  const [activeSheetIndex, setActiveSheetIndex] = useState(0);
  const [editingCell, setEditingCell] = useState<{ rIdx: number; cIdx: number } | null>(null);
  const [cellEditValue, setCellEditValue] = useState("");
  
  // Sheet Renaming State
  const [isRenamingSheet, setIsRenamingSheet] = useState(false);
  const [sheetNameInput, setSheetNameInput] = useState("");

  // Merge Sheets Option
  const [mergeAllIntoOneSheet, setMergeAllIntoOneSheet] = useState(false);

  // Export Settings State
  const [outputName, setOutputName] = useState("extracted_spreadsheet");
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    outputFormat: 'xlsx',
    extractionMode: 'smart',
    exportMode: 'entire',
    pageRange: '',
    tableSelection: 'all',
    selectedTableIds: []
  });

  // Advanced Options State (8 checkboxes)
  const [advancedSettings, setAdvancedSettings] = useState<AdvancedSettings>({
    preserveFormatting: true,
    preserveEmptyCells: true,
    detectMergedCells: true,
    autoFormatColumns: true,
    keepNumberFormatting: true,
    detectDates: true,
    detectCurrency: true,
    detectPercentages: true,
    keepEmptyRows: false,
    detectHeaders: true
  });

  // OCR Mode State
  const [enableOcr, setEnableOcr] = useState(false);
  const [ocrLanguage, setOcrLanguage] = useState<OcrLanguage>('eng');

  // Conversion steps progress
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [progressPct, setProgressPct] = useState(0);
  const [statusMessage, setStatusMessage] = useState("");

  const steps: ConversionStepStatus[] = [
    { id: '1', label: 'Reading PDF', status: currentStepIndex > 0 ? 'completed' : currentStepIndex === 0 ? 'in-progress' : 'pending' },
    { id: '2', label: 'Detecting Tables', status: currentStepIndex > 1 ? 'completed' : currentStepIndex === 1 ? 'in-progress' : 'pending' },
    { id: '3', label: 'Extracting Data', status: currentStepIndex > 2 ? 'completed' : currentStepIndex === 2 ? 'in-progress' : 'pending' },
    { id: '4', label: 'Formatting Excel', status: currentStepIndex > 3 ? 'completed' : currentStepIndex === 3 ? 'in-progress' : 'pending' },
    { id: '5', label: 'Generating Workbook', status: currentStepIndex > 4 ? 'completed' : currentStepIndex === 4 ? 'in-progress' : 'pending' }
  ];

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDraggingOverUpload, setIsDraggingOverUpload] = useState(false);

  // Load PDF.js dynamically
  useEffect(() => {
    const loadPdfjs = async () => {
      try {
        const lib = await import('pdfjs-dist');
        lib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';
        setPdfjs(lib);
      } catch (err) {
        console.error("Failed to load pdfjs-dist:", err);
        toast.error("Failed to initialize PDF engine.");
      }
    };
    loadPdfjs();
  }, []);

  const getColLabel = (index: number): string => {
    let label = '';
    let i = index;
    while (i >= 0) {
      label = String.fromCharCode((i % 26) + 65) + label;
      i = Math.floor(i / 26) - 1;
    }
    return label;
  };

  // Handle PDF Upload & Auto-Detection Analysis
  const handlePdfUpload = async (file: File) => {
    const maxSize = 100 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error("File size exceeds 100 MB limit.");
      return;
    }

    if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
      toast.error("Please upload a valid PDF file.");
      return;
    }

    setPdfFile(file);
    setIsUploading(true);
    setIsAnalyzing(true);
    setIsCompleted(false);
    setConversionResult(null);
    setErrorMsg(null);
    setActiveSheetIndex(0);
    setOutputName(file.name.replace(/\.[^/.]+$/, ""));

    try {
      if (!pdfjs) {
        throw new Error("PDF engine initializing...");
      }

      const arrayBuffer = await file.arrayBuffer();
      const loadedDoc = await pdfjs.getDocument({ data: arrayBuffer }).promise;
      setPdfDoc(loadedDoc);

      // 1. Run Automated Layout & Document Type Classification
      const docInfo = await classifyPdfDocument(loadedDoc, pdfjs);
      setClassification(docInfo);

      if (docInfo.isScanned) {
        setEnableOcr(true);
        toast.info("Scanned PDF detected! OCR mode auto-enabled.");
      }

      // 2. Extract initial sheets
      const extractedSheets = await extractPdfToExcelSheets(
        loadedDoc,
        pdfjs,
        extractionMode,
        docInfo,
        advancedSettings,
        docInfo.isScanned,
        ocrLanguage,
        (msg, pct) => {
          setStatusMessage(msg);
          setProgressPct(pct);
        }
      );

      setSheets(extractedSheets);
      setExportOptions(prev => ({
        ...prev,
        selectedTableIds: extractedSheets.map(s => s.id)
      }));

      if (extractedSheets.length === 0) {
        setErrorMsg("No tables were detected in this PDF. Would you like to extract all text instead?");
      }
    } catch (err: any) {
      console.error("PDF Analysis Error:", err);
      setErrorMsg(err.message || "Failed to analyze PDF file.");
      toast.error("Error analyzing PDF layout.");
    } finally {
      setIsUploading(false);
      setIsAnalyzing(false);
    }
  };

  // Re-run extraction if mode, OCR, or options change
  const handleReExtract = async (overrideMode?: ExtractionMode) => {
    if (!pdfDoc || !classification) return;
    const targetMode = overrideMode || extractionMode;
    setIsAnalyzing(true);
    setErrorMsg(null);
    try {
      const updatedSheets = await extractPdfToExcelSheets(
        pdfDoc,
        pdfjs,
        targetMode,
        classification,
        advancedSettings,
        enableOcr,
        ocrLanguage,
        (msg, pct) => {
          setStatusMessage(msg);
          setProgressPct(pct);
        }
      );

      setSheets(updatedSheets);
      setActiveSheetIndex(0);
      setExportOptions(prev => ({
        ...prev,
        selectedTableIds: updatedSheets.map(s => s.id)
      }));

      if (updatedSheets.length === 0) {
        setErrorMsg("No tables were detected in this PDF. Would you like to extract all text instead?");
      } else {
        toast.success(`Extracted ${updatedSheets.length} sheet(s) using ${targetMode.toUpperCase()} mode.`);
      }
    } catch (err: any) {
      toast.error("Failed to extract data.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Cell Editing Handlers
  const handleCellClick = (rIdx: number, cIdx: number, currentText: string) => {
    setEditingCell({ rIdx, cIdx });
    setCellEditValue(currentText);
  };

  const handleCellSave = () => {
    if (!editingCell || !sheets[activeSheetIndex]) return;
    const { rIdx, cIdx } = editingCell;

    const updatedSheets = [...sheets];
    const sheet = { ...updatedSheets[activeSheetIndex] };
    const rows = [...sheet.rows];
    const row = { ...rows[rIdx] };
    const cells = [...row.cells];

    cells[cIdx] = {
      ...cells[cIdx],
      text: cellEditValue,
      rawValue: cellEditValue
    };

    row.cells = cells;
    rows[rIdx] = row;
    sheet.rows = rows;
    updatedSheets[activeSheetIndex] = sheet;

    setSheets(updatedSheets);
    setEditingCell(null);
    toast.success("Cell updated.");
  };

  // Sheet Renaming Handler
  const handleRenameSheet = () => {
    if (!sheetNameInput.trim() || !sheets[activeSheetIndex]) return;
    const updatedSheets = [...sheets];
    updatedSheets[activeSheetIndex].name = sheetNameInput.trim();
    setSheets(updatedSheets);
    setIsRenamingSheet(false);
    toast.success("Sheet renamed.");
  };

  // Delete Current Sheet Handler
  const handleDeleteCurrentSheet = () => {
    if (!sheets[activeSheetIndex]) return;
    const updatedSheets = [...sheets];
    updatedSheets[activeSheetIndex].isDeleted = true;
    setSheets(updatedSheets);
    setActiveSheetIndex(0);
    toast.info("Sheet removed from export.");
  };

  // Trigger Conversion Execution
  const handleConvert = async () => {
    const activeSheets = sheets.filter(s => !s.isDeleted);
    if (activeSheets.length === 0) {
      toast.error("No active sheets selected for export.");
      return;
    }

    setIsConverting(true);
    setCurrentStepIndex(0);
    setProgressPct(10);

    try {
      setCurrentStepIndex(0);
      setStatusMessage("Reading PDF layout parameters...");
      setProgressPct(20);
      await new Promise(r => setTimeout(r, 200));

      setCurrentStepIndex(1);
      setStatusMessage("Detecting tables and structure...");
      setProgressPct(40);
      await new Promise(r => setTimeout(r, 200));

      setCurrentStepIndex(2);
      setStatusMessage("Extracting rows and columns...");
      setProgressPct(60);
      await new Promise(r => setTimeout(r, 250));

      setCurrentStepIndex(3);
      setStatusMessage("Formatting Excel grid properties...");
      setProgressPct(80);
      await new Promise(r => setTimeout(r, 200));

      setCurrentStepIndex(4);
      setStatusMessage("Generating final .xlsx workbook...");
      setProgressPct(95);

      const result = await generateExcelFromSheets(
        sheets,
        classification?.pageCount || 1,
        exportOptions,
        advancedSettings,
        outputName,
        mergeAllIntoOneSheet
      );

      setProgressPct(100);
      setConversionResult(result);
      setIsCompleted(true);
      toast.success("PDF successfully converted to Excel!");
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
    setPdfFile(null);
    setPdfDoc(null);
    setClassification(null);
    setSheets([]);
    setIsUploading(false);
    setIsAnalyzing(false);
    setIsConverting(false);
    setIsCompleted(false);
    setConversionResult(null);
    setErrorMsg(null);
    setActiveSheetIndex(0);
  };

  const article = toolArticles['pdf-to-excel-converter'];

  return (
    <div className="relative min-h-screen py-10 px-4 sm:px-6 lg:px-8 text-slate-900 dark:text-neutral-100 bg-[#F6F8FC] dark:bg-[#030712] transition-colors">
      <MeshGradient />

      <div className="max-w-6xl mx-auto relative z-10 space-y-8">

        {/* Back Navigation */}
        <div>
          <Link
            href="/tools/pdf-tools"
            className="inline-flex items-center text-xs font-semibold text-slate-500 dark:text-neutral-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
          >
            <ChevronLeft className="w-4 h-4 mr-1 group-hover:-translate-x-1 transition-transform" />
            Back to PDF Tools
          </Link>
        </div>

        {/* HEADER SECTION - Blue + Purple Premium Gradient Theme */}
        <div className="text-center space-y-3 max-w-3xl mx-auto">
          <div className="inline-flex items-center justify-center p-3 bg-gradient-to-br from-blue-600/20 to-purple-600/30 rounded-2xl border border-blue-500/30 mb-1 shadow-lg shadow-blue-500/10">
            <FileSpreadsheet className="w-9 h-9 text-blue-400" />
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight bg-gradient-to-r from-blue-700 via-indigo-600 to-purple-600 dark:from-blue-400 dark:via-purple-300 dark:to-indigo-400 bg-clip-text text-transparent">
            Free PDF to Excel Converter
          </h1>

          <p className="text-sm sm:text-base text-slate-600 dark:text-neutral-300 leading-relaxed">
            Tables from a PDF into .xlsx. 100 MB cap. You get values, not live formulas. Scans need OCR.
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

          {/* STATE 1: UPLOAD AREA */}
          {!pdfFile && (
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
                    handlePdfUpload(e.dataTransfer.files[0]);
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
                  accept=".pdf,application/pdf"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handlePdfUpload(e.target.files[0]);
                    }
                  }}
                />

                <div className="w-14 h-14 mx-auto mb-3 rounded-2xl bg-gradient-to-br from-blue-600/30 to-purple-600/30 flex items-center justify-center text-blue-400 border border-blue-500/20 shadow-inner">
                  <UploadCloud className="w-7 h-7 animate-bounce" />
                </div>

                <h3 className="text-lg font-bold text-slate-900 dark:text-neutral-100 mb-1">
                  Drag & Drop PDF file here
                </h3>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mb-4">
                  or click to select from your computer
                </p>

                <div className="flex flex-wrap items-center justify-center gap-2 text-[11px] text-slate-500 dark:text-neutral-400">
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 font-medium">
                    PDF Document
                  </span>
                  <span className="px-2.5 py-1 rounded-md bg-slate-100 dark:bg-neutral-800 border border-slate-200 dark:border-neutral-700 font-medium">
                    Max 100 MB
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* FILE BAR & AUTO-DETECTION BADGES */}
          {pdfFile && (
            <div className="space-y-6">
              
              {/* File Info Card */}
              <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-slate-50 dark:bg-neutral-800/70 border border-slate-200 dark:border-neutral-700/80">
                <div className="flex items-center space-x-3 overflow-hidden">
                  <div className="p-2.5 bg-blue-500/20 rounded-xl text-blue-400 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 dark:text-neutral-100 truncate text-sm">
                      {pdfFile.name}
                    </p>
                    <div className="flex items-center space-x-2 text-xs text-slate-500 dark:text-neutral-400">
                      <span>Size: {formatBytes(pdfFile.size)}</span>
                      <span>•</span>
                      <span>Pages: {classification ? classification.pageCount : '...'}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={isAnalyzing || isConverting}
                    className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-neutral-600 hover:bg-slate-100 dark:hover:bg-neutral-700 text-xs font-semibold transition-colors disabled:opacity-50"
                  >
                    Change File
                  </button>
                  <button
                    onClick={handleReset}
                    disabled={isAnalyzing || isConverting}
                    className="p-2 rounded-xl text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors disabled:opacity-50"
                    title="Remove File"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* AUTO-DETECTION INFORMATION BADGES */}
              {classification && !isAnalyzing && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/60 dark:to-purple-950/60 border border-blue-200 dark:border-blue-800/60 space-y-2">
                  <div className="flex items-center space-x-2">
                    <Zap className="w-4 h-4 text-blue-400 animate-pulse" />
                    <span className="text-xs font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wide">
                      Automated Layout & Document Classification
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 text-xs font-medium pt-1">
                    <span className="px-2.5 py-1 rounded-lg bg-blue-100 dark:bg-blue-900/60 border border-blue-200 dark:border-blue-700/60 text-blue-800 dark:text-blue-200">
                      ✓ {classification.isTextBased ? 'Text PDF' : 'Scanned PDF'}
                    </span>

                    <span className="px-2.5 py-1 rounded-lg bg-purple-100 dark:bg-purple-900/60 border border-purple-200 dark:border-purple-700/60 text-purple-800 dark:text-purple-200">
                      ✓ Document Type: {classification.docType}
                    </span>

                    <span className="px-2.5 py-1 rounded-lg bg-indigo-100 dark:bg-indigo-900/60 border border-indigo-200 dark:border-indigo-700/60 text-indigo-800 dark:text-indigo-200">
                      ✓ Tables Detected ({classification.tablesDetectedCount})
                    </span>

                    {classification.hasInvoices && (
                      <span className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/60 border border-emerald-200 dark:border-emerald-700/60 text-emerald-800 dark:text-emerald-200">
                        ✓ Invoices Identified
                      </span>
                    )}

                    {classification.hasBankStatements && (
                      <span className="px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/60 border border-amber-200 dark:border-amber-700/60 text-amber-800 dark:text-amber-200">
                        ✓ Bank Statement Identified
                      </span>
                    )}

                    <span className="px-2.5 py-1 rounded-lg bg-teal-100 dark:bg-teal-900/60 border border-teal-200 dark:border-teal-700/60 text-teal-800 dark:text-teal-200">
                      ✓ {classification.ocrRequired ? 'OCR Required' : 'OCR Not Required'}
                    </span>
                  </div>
                </div>
              )}

              {/* THREE EXTRACTION MODES SELECTOR */}
              {classification && !isAnalyzing && !isCompleted && (
                <div className="space-y-3">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-neutral-400">
                    Select Extraction Mode
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">

                    {/* Mode 1 */}
                    <div
                      onClick={() => { setExtractionMode('tables'); handleReExtract('tables'); }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        extractionMode === 'tables'
                          ? 'bg-blue-50 dark:bg-blue-950/70 border-blue-500 ring-2 ring-blue-500/30'
                          : 'bg-slate-50 dark:bg-neutral-800/40 border-slate-200 dark:border-neutral-700 hover:border-slate-300 dark:hover:border-neutral-600'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <Table className="w-4 h-4 text-blue-400" />
                        <h4 className="font-bold text-xs text-slate-900 dark:text-neutral-100">Mode 1: Extract Tables Only</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-neutral-400 leading-tight">
                        Extract structured tables for invoices, bank statements, reports, and attendance lists.
                      </p>
                    </div>

                    {/* Mode 2 */}
                    <div
                      onClick={() => { setExtractionMode('text'); handleReExtract('text'); }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all ${
                        extractionMode === 'text'
                          ? 'bg-purple-50 dark:bg-purple-950/70 border-purple-500 ring-2 ring-purple-500/30'
                          : 'bg-slate-50 dark:bg-neutral-800/40 border-slate-200 dark:border-neutral-700 hover:border-slate-300 dark:hover:border-neutral-600'
                      }`}
                    >
                      <div className="flex items-center space-x-2 mb-1">
                        <FileCode className="w-4 h-4 text-purple-400" />
                        <h4 className="font-bold text-xs text-slate-900 dark:text-neutral-100">Mode 2: Extract Text</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-neutral-400 leading-tight">
                        Convert all paragraphs into clean Excel rows without sentence fragmenting.
                      </p>
                    </div>

                    {/* Mode 3 (Recommended) */}
                    <div
                      onClick={() => { setExtractionMode('smart'); handleReExtract('smart'); }}
                      className={`p-4 rounded-2xl border cursor-pointer transition-all relative ${
                        extractionMode === 'smart'
                          ? 'bg-indigo-50 dark:bg-indigo-950/80 border-indigo-500 ring-2 ring-indigo-500/30'
                          : 'bg-slate-50 dark:bg-neutral-800/40 border-slate-200 dark:border-neutral-700 hover:border-slate-300 dark:hover:border-neutral-600'
                      }`}
                    >
                      <span className="absolute -top-2 -right-2 px-2 py-0.5 rounded-md bg-gradient-to-r from-blue-600 to-purple-600 text-[10px] font-black uppercase text-white shadow">
                        Recommended
                      </span>
                      <div className="flex items-center space-x-2 mb-1">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                        <h4 className="font-bold text-xs text-slate-900 dark:text-neutral-100">Mode 3: Smart AI Detection</h4>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-neutral-400 leading-tight">
                        Auto-detect document type. Exports tables if present, or clean layout text.
                      </p>
                    </div>

                  </div>
                </div>
              )}

              {/* ANALYZING SHIMMER STATE */}
              {isAnalyzing && (
                <div className="space-y-4 py-8 text-center">
                  <div className="w-10 h-10 mx-auto rounded-full border-4 border-blue-500 border-t-transparent animate-spin" />
                  <p className="text-xs font-medium text-slate-600 dark:text-neutral-300 animate-pulse">
                    {statusMessage || 'Processing layout & extracting data...'}
                  </p>
                  <div className="w-48 mx-auto bg-slate-200 dark:bg-neutral-800 h-2 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-blue-500 to-purple-500 h-full transition-all duration-300" style={{ width: `${progressPct}%` }} />
                  </div>
                </div>
              )}

              {/* ERROR STATE: NO TABLES FOUND */}
              {errorMsg && !isAnalyzing && (
                <div className="p-5 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-center space-y-3">
                  <FileWarning className="w-8 h-8 text-amber-400 mx-auto" />
                  <div>
                    <h4 className="font-bold text-amber-800 dark:text-amber-200 text-sm">{errorMsg}</h4>
                  </div>
                  <div className="flex justify-center gap-3">
                    <button
                      onClick={() => handleReExtract('text')}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors"
                    >
                      Switch to Mode 2 (Extract All Text)
                    </button>
                  </div>
                </div>
              )}

              {/* INTERACTIVE EDITABLE SPREADSHEET PREVIEW */}
              {sheets.length > 0 && !isAnalyzing && !isCompleted && (
                <div className="space-y-4 border border-slate-200 dark:border-neutral-800 rounded-2xl p-4 sm:p-6 bg-slate-50 dark:bg-neutral-900/60">
                  
                  {/* PREVIEW TOOLBAR */}
                  <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-neutral-800 pb-3">
                    
                    {/* SHEET TABS */}
                    <div className="flex items-center space-x-1.5 overflow-x-auto max-w-full py-1">
                      {sheets.map((sheet, idx) => (
                        !sheet.isDeleted && (
                          <div
                            key={sheet.id}
                            className={`flex items-center space-x-1 px-3 py-1.5 rounded-xl text-xs font-medium cursor-pointer transition-all ${
                              activeSheetIndex === idx
                                ? 'bg-blue-600 text-white shadow-md'
                                : 'bg-slate-100 dark:bg-neutral-800 text-slate-500 dark:text-neutral-400 hover:bg-slate-200 dark:hover:bg-neutral-700'
                            }`}
                            onClick={() => setActiveSheetIndex(idx)}
                          >
                            <span>{sheet.name}</span>
                            {activeSheetIndex === idx && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSheetNameInput(sheet.name);
                                  setIsRenamingSheet(true);
                                }}
                                className="p-0.5 hover:bg-blue-700 rounded text-white"
                                title="Rename Sheet"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                            )}
                          </div>
                        )
                      ))}
                    </div>

                    {/* SHEET CONTROLS */}
                    <div className="flex items-center space-x-3 text-xs">
                      <label className="flex items-center space-x-1.5 text-slate-600 dark:text-neutral-300 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={mergeAllIntoOneSheet}
                          onChange={(e) => setMergeAllIntoOneSheet(e.target.checked)}
                          className="rounded border-slate-300 dark:border-neutral-700 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                        />
                        <span>Merge All Sheets into One</span>
                      </label>

                      <button
                        onClick={handleDeleteCurrentSheet}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-800 hover:bg-rose-100 dark:hover:bg-rose-900/60 transition-colors text-xs"
                      >
                        Delete Sheet
                      </button>
                    </div>

                  </div>

                  {/* RENAME MODAL INLINE */}
                  {isRenamingSheet && (
                    <div className="flex items-center space-x-2 p-2 bg-slate-100 dark:bg-neutral-800 rounded-xl border border-slate-200 dark:border-neutral-700">
                      <input
                        type="text"
                        value={sheetNameInput}
                        onChange={(e) => setSheetNameInput(e.target.value)}
                        className="px-3 py-1 bg-white dark:bg-neutral-900 border border-slate-200 dark:border-neutral-700 rounded-lg text-xs text-slate-900 dark:text-neutral-100 focus:ring-1 focus:ring-blue-500"
                        placeholder="Enter sheet name"
                      />
                      <button onClick={handleRenameSheet} className="p-1 bg-blue-600 text-white rounded-lg"><Check className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setIsRenamingSheet(false)} className="p-1 bg-slate-200 dark:bg-neutral-700 text-slate-700 dark:text-neutral-300 rounded-lg"><X className="w-3.5 h-3.5" /></button>
                    </div>
                  )}

                  {/* EDITABLE SPREADSHEET GRID */}
                  {sheets[activeSheetIndex] && !sheets[activeSheetIndex].isDeleted && (
                    <div className="overflow-x-auto border border-slate-200 dark:border-neutral-800 rounded-xl max-h-96 shadow-inner bg-white dark:bg-neutral-950/70">
                      <table className="w-full text-xs text-left border-collapse min-w-[500px]">
                        <thead>
                          <tr className="bg-slate-100 dark:bg-neutral-800/90 text-slate-500 dark:text-neutral-400 font-mono text-[11px] border-b border-slate-200 dark:border-neutral-700">
                            <th className="p-2 border-r border-slate-200 dark:border-neutral-700 text-center w-10 font-normal select-none">#</th>
                            {Array.from({ length: sheets[activeSheetIndex].columnCount }).map((_, colIdx) => (
                              <th key={colIdx} className="p-2 border-r border-slate-200 dark:border-neutral-700 text-center font-bold">
                                {getColLabel(colIdx)}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {sheets[activeSheetIndex].rows.map((row, rIdx) => (
                            <tr
                              key={rIdx}
                              className={`border-b border-slate-100 dark:border-neutral-800/80 hover:bg-blue-50 dark:hover:bg-blue-950/20 transition-colors ${
                                row.isHeader ? 'bg-blue-50 dark:bg-blue-950/30 font-semibold text-blue-800 dark:text-blue-200' : ''
                              }`}
                            >
                              <td className="p-2 border-r border-slate-100 dark:border-neutral-800 bg-slate-50 dark:bg-neutral-800/40 text-center font-mono text-[11px] text-slate-400 dark:text-neutral-500 select-none">
                                {rIdx + 1}
                              </td>
                              {row.cells.map((cell, cIdx) => (
                                <td
                                  key={cIdx}
                                  onClick={() => handleCellClick(rIdx, cIdx, cell.text)}
                                  className={`p-2 border-r border-slate-100 dark:border-neutral-800/80 truncate max-w-[220px] cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/30 ${
                                    cell.align === 'right' ? 'text-right' : cell.align === 'center' ? 'text-center' : 'text-left'
                                  }`}
                                  title="Click cell to edit value"
                                >
                                  {editingCell?.rIdx === rIdx && editingCell?.cIdx === cIdx ? (
                                    <input
                                      type="text"
                                      autoFocus
                                      value={cellEditValue}
                                      onChange={(e) => setCellEditValue(e.target.value)}
                                      onBlur={handleCellSave}
                                      onKeyDown={(e) => { if (e.key === 'Enter') handleCellSave(); }}
                                      className="w-full px-1.5 py-0.5 bg-white dark:bg-neutral-900 border border-blue-500 rounded text-xs text-slate-900 dark:text-white"
                                    />
                                  ) : (
                                    cell.text || <span className="text-slate-400 dark:text-neutral-600 italic">empty</span>
                                  )}
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <p className="text-[11px] text-slate-400 dark:text-neutral-500 italic text-right">
                    💡 Click any table cell above to edit its value directly before downloading as Excel.
                  </p>
                </div>
              )}

              {/* OCR MULTI-LANGUAGE CONTROLS */}
              <div className="p-4 rounded-2xl bg-slate-50 dark:bg-neutral-800/40 border border-slate-200 dark:border-neutral-800 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-purple-400" />
                    <span className="text-xs font-bold text-slate-800 dark:text-neutral-200">OCR Engine Settings</span>
                  </div>

                  <div className="flex items-center space-x-3">
                    <label className="flex items-center space-x-2 cursor-pointer text-xs font-medium">
                      <input
                        type="checkbox"
                        checked={enableOcr}
                        onChange={(e) => { setEnableOcr(e.target.checked); handleReExtract(); }}
                        className="rounded border-slate-300 dark:border-neutral-700 text-blue-600 focus:ring-blue-500 w-3.5 h-3.5"
                      />
                      <span>Enable OCR</span>
                    </label>

                    <select
                      value={ocrLanguage}
                      onChange={(e) => { setOcrLanguage(e.target.value as OcrLanguage); handleReExtract(); }}
                      disabled={!enableOcr}
                      className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-neutral-700 bg-white dark:bg-neutral-900 text-xs text-slate-800 dark:text-neutral-200 focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                    >
                      <option value="eng">English</option>
                      <option value="hin">Hindi</option>
                      <option value="mar">Marathi</option>
                      <option value="auto">Auto Detect</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ADVANCED USER EXPORT OPTIONS (8 Checkboxes) */}
              <div className="p-5 rounded-2xl bg-slate-50 dark:bg-neutral-800/40 border border-slate-200 dark:border-neutral-800 space-y-3">
                <h3 className="font-bold text-xs text-slate-600 dark:text-neutral-300 uppercase tracking-wider flex items-center space-x-2">
                  <Settings className="w-4 h-4 text-blue-400" />
                  <span>Advanced Export Settings</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {[
                    { key: 'preserveFormatting', label: 'Preserve Formatting' },
                    { key: 'preserveEmptyCells', label: 'Preserve Empty Cells' },
                    { key: 'detectMergedCells', label: 'Detect Merged Cells' },
                    { key: 'autoFormatColumns', label: 'Auto-Fit Columns' },
                    { key: 'keepNumberFormatting', label: 'Keep Number Formatting' },
                    { key: 'detectDates', label: 'Detect Dates' },
                    { key: 'detectCurrency', label: 'Detect Currency' },
                    { key: 'detectPercentages', label: 'Detect Percentages' }
                  ].map(opt => (
                    <label key={opt.key} className="flex items-center space-x-2 text-xs font-medium cursor-pointer text-slate-600 dark:text-neutral-300">
                      <input
                        type="checkbox"
                        checked={Boolean((advancedSettings as any)[opt.key])}
                        onChange={(e) => setAdvancedSettings(prev => ({ ...prev, [opt.key]: e.target.checked }))}
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
                  disabled={isConverting || sheets.length === 0}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold text-base shadow-xl hover:shadow-blue-500/20 transition-all flex items-center justify-center space-x-2 mx-auto disabled:opacity-50"
                >
                  <FileSpreadsheet className="w-5 h-5" />
                  <span>Convert PDF to Excel (.xlsx)</span>
                  <ArrowRight className="w-4 h-4 ml-1" />
                </button>
              </div>

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

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 max-w-2xl mx-auto pt-4">
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
                  Conversion Complete!
                </h2>
                <p className="text-xs text-slate-500 dark:text-neutral-400 mt-1">
                  Your PDF tables and data have been formatted into a clean Excel workbook.
                </p>
              </div>

              {/* RESULT METRICS */}
              <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 max-w-4xl mx-auto">
                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-700/60">
                  <p className="text-[10px] text-slate-500 dark:text-neutral-400 font-medium uppercase">Pages Processed</p>
                  <p className="text-lg font-black text-slate-900 dark:text-neutral-100 mt-0.5">{conversionResult.pagesConverted}</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-700/60">
                  <p className="text-[10px] text-slate-500 dark:text-neutral-400 font-medium uppercase">Tables Extracted</p>
                  <p className="text-lg font-black text-blue-400 mt-0.5">{conversionResult.tablesExtracted}</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-700/60">
                  <p className="text-[10px] text-slate-500 dark:text-neutral-400 font-medium uppercase">Rows Extracted</p>
                  <p className="text-lg font-black text-slate-900 dark:text-neutral-100 mt-0.5">{conversionResult.totalRows}</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-700/60">
                  <p className="text-[10px] text-slate-500 dark:text-neutral-400 font-medium uppercase">OCR Confidence</p>
                  <p className="text-lg font-black text-purple-400 mt-0.5">{conversionResult.ocrConfidence}%</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-700/60">
                  <p className="text-[10px] text-slate-500 dark:text-neutral-400 font-medium uppercase">Processing Time</p>
                  <p className="text-lg font-black text-indigo-400 mt-0.5">{(conversionResult.processingTimeMs / 1000).toFixed(2)}s</p>
                </div>

                <div className="p-3 rounded-2xl bg-slate-50 dark:bg-neutral-800/50 border border-slate-200 dark:border-neutral-700/60">
                  <p className="text-[10px] text-slate-500 dark:text-neutral-400 font-medium uppercase">File Size</p>
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
                  <span>Download Excel (.xlsx)</span>
                </button>

                <button
                  onClick={handleReset}
                  className="px-6 py-3.5 rounded-2xl border border-slate-300 dark:border-neutral-700 hover:bg-slate-100 dark:hover:bg-neutral-800 text-slate-700 dark:text-neutral-200 font-semibold text-xs transition-colors flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Convert Another PDF</span>
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
