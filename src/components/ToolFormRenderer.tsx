"use client";

import { useState, useEffect } from 'react';
import { Sparkles, Copy, Check, AlertCircle, RefreshCw, Upload, Sliders, Type, Hash, ListFilter, Palette, ShieldCheck, Cpu, FileCheck } from 'lucide-react';
import { toast } from 'sonner';
import { useTranslation } from '@/components/I18nContext';

export interface FormFieldSchema {
  id?: string;
  name: string;
  label: string;
  placeholder?: string | null;
  type: string;
  required: boolean;
  defaultValue?: string | null;
  options?: string | null;
  helperText?: string | null;
  order: number;
}

interface ToolFormRendererProps {
  toolId: string;
  slug: string;
  inputsSchema: FormFieldSchema[];
  ctaText: string;
}

export default function ToolFormRenderer({ toolId, slug, inputsSchema, ctaText }: ToolFormRendererProps) {
  const { t } = useTranslation();
  const [formData, setFormData] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [output, setOutput] = useState('');
  const [copied, setCopied] = useState(false);
  const [runStats, setRunStats] = useState<{ latencyMs: number; tokens: number } | null>(null);

  // Initialize form default values
  useEffect(() => {
    const defaults: Record<string, any> = {};
    inputsSchema.forEach(inp => {
      defaults[inp.name] = inp.defaultValue || '';
      if (inp.type === 'toggle' || inp.type === 'checkbox') {
        defaults[inp.name] = inp.defaultValue === 'true';
      }
    });
    setFormData(defaults);
  }, [inputsSchema]);

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    toast.success(t('form.copied_success', 'Copied generation to clipboard!'));
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setOutput('');
    setRunStats(null);

    // Validate required fields
    for (const inp of inputsSchema) {
      if (inp.required && !formData[inp.name]) {
        toast.error(t('form.required_field_missing', 'Please complete the required field: {field}').replace('{field}', inp.label));
        setIsLoading(false);
        return;
      }
    }

    try {
      const res = await fetch('/api/ai/run/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          toolId,
          slug,
          inputs: formData
        })
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setOutput(data.output);
        setRunStats({
          latencyMs: data.latencyMs,
          tokens: data.tokens
        });
        toast.success(t('form.executed_success', 'Utility executed successfully!'));
      } else {
        toast.error(data.error || t('form.execution_failed', 'Execution handler failed.'));
      }
    } catch (err) {
      console.error(err);
      toast.error(t('form.connection_failed', 'Unable to establish connection to execution servers.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Workspace Sub-Header / Status Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-[1.125rem] bg-[#FBFCFE] dark:bg-white/[0.02] border border-[#E6ECF5] dark:border-white/5 shadow-[0_4px_20px_rgba(15,23,42,0.03)]">
        <div className="flex items-center gap-3">
          <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300">
            {t('workspace.active_mode', 'SaaS Workspace Console')}
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/20 text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400">
            <Sparkles className="w-3 h-3" /> ✨ Ready
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            <ShieldCheck className="w-3 h-3" /> Privacy Protected
          </span>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            <Cpu className="w-3 h-3" /> Local Processing
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 1. CONFIGURATION PANEL */}
        <div className="rounded-[1.125rem] border border-[#E6ECF5] dark:border-white/5 bg-[#FBFCFE] dark:bg-[#090d16] p-6 sm:p-8 shadow-[0_10px_35px_rgba(15,23,42,0.06)] dark:shadow-2xl relative transition-all duration-250">
          <div className="absolute top-0 right-10 h-[2px] w-24 bg-gradient-to-r from-transparent via-blue-500 to-transparent" />
          
          <div className="flex items-center justify-between mb-6 pb-4 border-b border-[#E6ECF5] dark:border-white/5">
            <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-blue-600 dark:text-blue-500" />
              {t('form.command_console', 'Configuration Panel')}
            </h3>
            <span className="text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400">
              Parameters
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {inputsSchema.map((field) => {
              const id = `field_${field.name}`;
              return (
                <div key={field.name} className="space-y-2">
                  <div className="flex justify-between items-center">
                    <label htmlFor={id} className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-gray-300 ml-1">
                      {field.label} {field.required && <span className="text-blue-600 dark:text-blue-500">*</span>}
                    </label>
                    {field.helperText && (
                      <span className="text-[10px] text-slate-500 dark:text-gray-400 font-semibold italic">{field.helperText}</span>
                    )}
                  </div>

                  {/* TEXT FIELD */}
                  {field.type === 'text' && (
                    <div className="relative flex items-center">
                      <Type className="absolute left-4 w-4 h-4 text-slate-400 dark:text-gray-500 pointer-events-none" />
                      <input
                        id={id}
                        type="text"
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        placeholder={field.placeholder || t('form.enter_placeholder', 'Enter {field}...').replace('{field}', field.label.toLowerCase())}
                        required={field.required}
                        className="w-full bg-[#F8FAFC] dark:bg-[#0f172a] border border-[#E6ECF5] dark:border-[#1e293b] focus:border-blue-600 dark:focus:border-blue-500 rounded-[16px] pl-11 pr-5 h-[52px] text-slate-900 dark:text-white text-sm font-medium outline-none transition-all focus:ring-4 focus:ring-blue-500/15 placeholder:text-slate-400 dark:placeholder:text-gray-600"
                      />
                    </div>
                  )}

                  {/* TEXTAREA */}
                  {field.type === 'textarea' && (
                    <textarea
                      id={id}
                      value={formData[field.name] || ''}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      placeholder={field.placeholder || t('form.enter_instructions', 'Enter instructions...')}
                      required={field.required}
                      rows={4}
                      className="w-full bg-[#F8FAFC] dark:bg-[#0f172a] border border-[#E6ECF5] dark:border-[#1e293b] focus:border-blue-600 dark:focus:border-blue-500 rounded-[16px] p-4 text-slate-900 dark:text-white text-sm font-medium outline-none transition-all focus:ring-4 focus:ring-blue-500/15 placeholder:text-slate-400 dark:placeholder:text-gray-600 resize-none"
                    />
                  )}

                  {/* SELECT DROPDOWN */}
                  {field.type === 'select' && (
                    <div className="relative flex items-center">
                      <ListFilter className="absolute left-4 w-4 h-4 text-slate-400 dark:text-gray-500 pointer-events-none z-10" />
                      <select
                        id={id}
                        value={formData[field.name] || ''}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        required={field.required}
                        className="w-full bg-[#F8FAFC] dark:bg-[#0f172a] border border-[#E6ECF5] dark:border-[#1e293b] focus:border-blue-600 dark:focus:border-blue-500 rounded-[16px] pl-11 pr-5 h-[52px] text-slate-900 dark:text-white text-sm font-medium outline-none transition-all focus:ring-4 focus:ring-blue-500/15 cursor-pointer appearance-none"
                      >
                        <option value="" className="text-slate-400">{t('form.select_choice', '-- Select Choice --')}</option>
                        {(field.options || '').split(',').map((opt) => {
                          const trimmed = opt.trim();
                          return (
                            <option key={trimmed} value={trimmed} className="bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium">
                              {trimmed}
                            </option>
                          );
                        })}
                      </select>
                    </div>
                  )}

                  {/* TOGGLE */}
                  {field.type === 'toggle' && (
                    <label className="flex items-center gap-3 p-4 bg-white dark:bg-white/[0.01] border border-[#E6ECF5] dark:border-white/5 hover:border-blue-400/50 rounded-[16px] cursor-pointer transition-all shadow-[0_2px_10px_rgba(15,23,42,0.02)]">
                      <input
                        id={id}
                        type="checkbox"
                        checked={!!formData[field.name]}
                        onChange={(e) => handleChange(field.name, e.target.checked)}
                        className="rounded text-blue-600 dark:text-blue-500 h-5 w-5 cursor-pointer accent-blue-600"
                      />
                      <div>
                        <span className="text-xs font-bold text-slate-900 dark:text-white block">{t('form.enable_field', 'Enable {field}').replace('{field}', field.label)}</span>
                      </div>
                    </label>
                  )}

                  {/* CHECKBOX */}
                  {field.type === 'checkbox' && (
                    <label className="flex items-center gap-3 p-4 bg-white dark:bg-white/[0.01] border border-[#E6ECF5] dark:border-white/5 hover:border-blue-400/50 rounded-[16px] cursor-pointer transition-all shadow-[0_2px_10px_rgba(15,23,42,0.02)]">
                      <input
                        id={id}
                        type="checkbox"
                        checked={!!formData[field.name]}
                        onChange={(e) => handleChange(field.name, e.target.checked)}
                        className="rounded text-blue-600 dark:text-blue-500 h-5 w-5 cursor-pointer accent-blue-600"
                      />
                      <span className="text-xs font-semibold text-slate-700 dark:text-gray-300">{field.placeholder || t('form.enable_verification', 'Enable verification')}</span>
                    </label>
                  )}

                  {/* SLIDER RANGE */}
                  {field.type === 'slider' && (
                    <div className="space-y-3 p-4 bg-white dark:bg-white/[0.01] border border-[#E6ECF5] dark:border-white/5 rounded-[16px] shadow-[0_2px_10px_rgba(15,23,42,0.02)]">
                      <div className="flex justify-between text-xs font-bold text-slate-700 dark:text-gray-300">
                        <span>{t('form.value_label', 'Value')}: {formData[field.name] || 0}</span>
                        <span className="text-slate-400 dark:text-gray-500">{t('form.range_label', 'Range: 0 - 100')}</span>
                      </div>
                      <input
                        id={id}
                        type="range"
                        min="0"
                        max="100"
                        value={formData[field.name] || 50}
                        onChange={(e) => handleChange(field.name, Number(e.target.value))}
                        className="w-full h-2 bg-slate-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
                      />
                    </div>
                  )}

                  {/* COLOR PICKER */}
                  {field.type === 'color' && (
                    <div className="flex items-center gap-4 bg-white dark:bg-white/[0.01] border border-[#E6ECF5] dark:border-white/5 rounded-[16px] p-4 shadow-[0_2px_10px_rgba(15,23,42,0.02)]">
                      <Palette className="w-5 h-5 text-slate-400 dark:text-gray-500" />
                      <input
                        id={id}
                        type="color"
                        value={formData[field.name] || '#2563eb'}
                        onChange={(e) => handleChange(field.name, e.target.value)}
                        className="h-10 w-16 border-none bg-transparent rounded-xl cursor-pointer"
                      />
                      <span className="text-xs font-mono font-bold text-slate-900 dark:text-white uppercase">{formData[field.name] || '#2563eb'}</span>
                    </div>
                  )}

                  {/* NUMBER */}
                  {field.type === 'number' && (
                    <div className="relative flex items-center">
                      <Hash className="absolute left-4 w-4 h-4 text-slate-400 dark:text-gray-500 pointer-events-none" />
                      <input
                        id={id}
                        type="number"
                        value={formData[field.name] !== undefined ? formData[field.name] : ''}
                        onChange={(e) => handleChange(field.name, e.target.value === '' ? '' : Number(e.target.value))}
                        placeholder={field.placeholder || '0'}
                        required={field.required}
                        className="w-full bg-[#F8FAFC] dark:bg-[#0f172a] border border-[#E6ECF5] dark:border-[#1e293b] focus:border-blue-600 dark:focus:border-blue-500 rounded-[16px] pl-11 pr-5 h-[52px] text-slate-900 dark:text-white text-sm font-medium outline-none transition-all focus:ring-4 focus:ring-blue-500/15 placeholder:text-slate-400 dark:placeholder:text-gray-600"
                      />
                    </div>
                  )}

                  {/* FILE UPLOAD */}
                  {field.type === 'file' && (
                    <div className="upload-dropzone p-6 text-center cursor-pointer relative group">
                      <input
                        id={id}
                        type="file"
                        required={field.required}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            handleChange(field.name, file.name);
                            toast.info(`Local upload loaded: ${file.name}`);
                          }
                        }}
                        className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                      />
                      <div className="mx-auto h-12 w-12 text-blue-600 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <Upload className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-slate-900 dark:text-white block">
                        {formData[field.name] || t('form.drag_drop_browse', 'Drag & drop file or Browse')}
                      </span>
                      <span className="text-[10px] text-slate-500 dark:text-gray-400 font-medium block mt-1">{t('form.max_file_size', 'Supports documents & media up to 25MB')}</span>
                    </div>
                  )}
                </div>
              );
            })}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-3 px-8 h-[52px] text-xs font-black uppercase tracking-widest text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:-translate-y-0.5 rounded-[16px] transition-all duration-250 shadow-[0_4px_20px_rgba(37,99,235,0.25)] hover:shadow-[0_8px_30px_rgba(99,102,241,0.35)] active:translate-y-0 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" /> {t('form.generating', 'Processing Workspace...')}
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-blue-100" /> {t('tools.' + slug + '.cta', ctaText)}
                </>
              )}
            </button>
          </form>
        </div>

        {/* 2. LIVE PREVIEW & OUTPUT WORKSPACE */}
        <div className="rounded-[1.125rem] border border-[#E6ECF5] dark:border-white/5 bg-[#FBFCFE] dark:bg-[#090d16] p-6 sm:p-8 shadow-[0_10px_35px_rgba(15,23,42,0.06)] dark:shadow-2xl flex flex-col justify-between relative min-h-[420px] transition-all duration-250">
          <div className="absolute top-0 right-10 h-[2px] w-24 bg-gradient-to-r from-transparent via-purple-500 to-transparent" />
          
          <div>
            <div className="flex justify-between items-center border-b border-[#E6ECF5] dark:border-white/5 pb-4 mb-6">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-900 dark:text-white flex items-center gap-2">
                <FileCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                {t('form.output_panel', 'Live Preview Workspace')}
              </h3>
              {output && (
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 border border-[#E6ECF5] dark:border-white/5 hover:border-blue-300 dark:hover:border-white/10 rounded-xl bg-white dark:bg-white/[0.02] text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-gray-300 hover:text-blue-600 transition-all cursor-pointer shadow-sm"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? t('form.copied', 'Copied!') : t('form.copy_response', 'Copy Response')}
                </button>
              )}
            </div>

            {isLoading ? (
              <div className="space-y-4 py-12 animate-pulse">
                <div className="h-4 bg-slate-200 dark:bg-white/5 rounded-lg w-3/4 shimmer" />
                <div className="h-4 bg-slate-200 dark:bg-white/5 rounded-lg w-5/6 shimmer" />
                <div className="h-4 bg-slate-200 dark:bg-white/5 rounded-lg w-2/3 shimmer" />
                <div className="h-4 bg-slate-200 dark:bg-white/5 rounded-lg w-1/2 shimmer" />
              </div>
            ) : output ? (
              <div className="text-slate-800 dark:text-gray-200 text-sm font-medium leading-relaxed whitespace-pre-wrap select-text p-4 bg-white dark:bg-[#0f172a] rounded-[16px] border border-[#E6ECF5] dark:border-[#1e293b] max-h-[450px] overflow-y-auto font-mono shadow-[0_2px_10px_rgba(15,23,42,0.02)]">
                {output}
              </div>
            ) : (
              <div className="text-center py-12">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-50 dark:bg-blue-500/10 border border-blue-100 dark:border-blue-500/20 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-[0_4px_20px_rgba(37,99,235,0.1)]">
                  <Sparkles className="w-10 h-10" />
                </div>
                <h4 className="text-base font-black uppercase tracking-tight text-slate-900 dark:text-white mb-2">
                  {t('form.awaiting_execution', 'Ready for Live Preview')}
                </h4>
                <p className="text-xs font-medium text-slate-500 dark:text-gray-400 max-w-xs mx-auto leading-relaxed mb-6 font-sans">
                  {t('form.fill_parameters', 'Configure your parameters on the left panel and hit execute to trigger processing.')}
                </p>

                {/* Helper badges container */}
                <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
                  <span className="px-3 py-1 rounded-full bg-white dark:bg-white/5 border border-[#E6ECF5] dark:border-white/10 text-[10px] font-bold text-slate-600 dark:text-gray-400 shadow-sm">
                    ✨ ATS Friendly
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white dark:bg-white/5 border border-[#E6ECF5] dark:border-white/10 text-[10px] font-bold text-slate-600 dark:text-gray-400 shadow-sm">
                    🛡️ No Data Stored
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white dark:bg-white/5 border border-[#E6ECF5] dark:border-white/10 text-[10px] font-bold text-slate-600 dark:text-gray-400 shadow-sm">
                    ⚡ Instant Execution
                  </span>
                </div>
              </div>
            )}
          </div>

          {runStats && (
            <div className="border-t border-[#E6ECF5] dark:border-white/5 pt-4 mt-6 flex justify-between text-[10px] font-black uppercase tracking-widest text-slate-500 dark:text-gray-400">
              <span>{t('form.server_response', 'Processing Time:')} <strong className="text-slate-800 dark:text-gray-200">{runStats.latencyMs}ms</strong></span>
              {runStats.tokens > 0 && (
                <span>{t('form.model_weight', 'Tokens Processed:')} <strong className="text-slate-800 dark:text-gray-200">{runStats.tokens}</strong></span>
              )}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
