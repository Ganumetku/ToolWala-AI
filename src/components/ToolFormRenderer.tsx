"use client";

import { useState, useEffect } from 'react';
import { Sparkles, Copy, Check, AlertCircle, RefreshCw, Eye, EyeOff, Upload } from 'lucide-react';
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
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      
      {/* 1. INPUT CONSOLE */}
      <div className="rounded-[2rem] border border-gray-200 dark:border-white/5 bg-[#F3F4F6] dark:bg-[#090d16] p-8 sm:p-10 shadow-sm dark:shadow-2xl relative transition-colors duration-250">
        <div className="absolute top-0 right-10 h-[1px] w-24 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        
        <h3 className="text-sm font-black uppercase tracking-widest text-gray-900 dark:text-white mb-8 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-600 dark:text-blue-500" /> {t('form.command_console', 'Command Console')}
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {inputsSchema.map((field) => {
            const id = `field_${field.name}`;
            return (
              <div key={field.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor={id} className="text-[10px] font-black uppercase tracking-widest text-gray-600 dark:text-gray-400 ml-1">
                    {field.label} {field.required && <span className="text-blue-600 dark:text-blue-500">*</span>}
                  </label>
                  {field.helperText && (
                    <span className="text-[9px] text-gray-500 font-bold italic">{field.helperText}</span>
                  )}
                </div>

                {/* TEXT FIELD */}
                {field.type === 'text' && (
                  <input
                    id={id}
                    type="text"
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    placeholder={field.placeholder || t('form.enter_placeholder', 'Enter {field}...').replace('{field}', field.label.toLowerCase())}
                    required={field.required}
                    className="w-full bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e293b] focus:border-blue-600 dark:focus:border-blue-500 rounded-2xl px-5 py-4 text-gray-900 dark:text-white text-sm font-semibold outline-none transition-all focus:ring-2 focus:ring-blue-600/20 placeholder:text-gray-400 dark:placeholder:text-gray-600"
                  />
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
                    className="w-full bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e293b] focus:border-blue-600 dark:focus:border-blue-500 rounded-2xl p-5 text-gray-900 dark:text-white text-sm font-semibold outline-none transition-all focus:ring-2 focus:ring-blue-600/20 placeholder:text-gray-400 dark:placeholder:text-gray-600 resize-none"
                  />
                )}

                {/* SELECT DROPDOWN */}
                {field.type === 'select' && (
                  <select
                    id={id}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                    className="w-full bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e293b] focus:border-blue-600 dark:focus:border-blue-500 rounded-2xl px-5 py-4 text-gray-900 dark:text-white text-sm font-bold outline-none transition-all focus:ring-2 focus:ring-blue-600/20 cursor-pointer"
                  >
                    <option value="" className="text-gray-500">{t('form.select_choice', '-- Select Choice --')}</option>
                    {(field.options || '').split(',').map((opt) => {
                      const trimmed = opt.trim();
                      return (
                        <option key={trimmed} value={trimmed} className="bg-white dark:bg-slate-950 text-gray-900 dark:text-white font-semibold">
                          {trimmed}
                        </option>
                      );
                    })}
                  </select>
                )}

                {/* TOGGLE */}
                {field.type === 'toggle' && (
                  <label className="flex items-center gap-3 p-4 bg-white dark:bg-white/[0.01] border border-gray-200 dark:border-white/5 hover:border-blue-500/30 rounded-2xl cursor-pointer transition-all">
                    <input
                      id={id}
                      type="checkbox"
                      checked={!!formData[field.name]}
                      onChange={(e) => handleChange(field.name, e.target.checked)}
                      className="rounded text-blue-600 dark:text-blue-500 h-4.5 w-4.5 cursor-pointer accent-blue-600"
                    />
                    <div>
                      <span className="text-xs font-bold text-gray-900 dark:text-white block">{t('form.enable_field', 'Enable {field}').replace('{field}', field.label)}</span>
                    </div>
                  </label>
                )}

                {/* CHECKBOX */}
                {field.type === 'checkbox' && (
                  <label className="flex items-center gap-3 p-4 bg-white dark:bg-white/[0.01] border border-gray-200 dark:border-white/5 hover:border-blue-500/30 rounded-2xl cursor-pointer transition-all">
                    <input
                      id={id}
                      type="checkbox"
                      checked={!!formData[field.name]}
                      onChange={(e) => handleChange(field.name, e.target.checked)}
                      className="rounded text-blue-600 dark:text-blue-500 h-4.5 w-4.5 cursor-pointer accent-blue-600"
                    />
                    <span className="text-xs font-semibold text-gray-700 dark:text-gray-300">{field.placeholder || t('form.enable_verification', 'Enable verification')}</span>
                  </label>
                )}

                {/* SLIDER RANGE */}
                {field.type === 'slider' && (
                  <div className="space-y-2 p-4 bg-white dark:bg-white/[0.01] border border-gray-200 dark:border-white/5 rounded-2xl">
                    <div className="flex justify-between text-xs font-bold text-gray-600 dark:text-gray-400">
                      <span>{t('form.value_label', 'Value')}: {formData[field.name] || 0}</span>
                      <span>{t('form.range_label', 'Range: 0 - 100')}</span>
                    </div>
                    <input
                      id={id}
                      type="range"
                      min="0"
                      max="100"
                      value={formData[field.name] || 50}
                      onChange={(e) => handleChange(field.name, Number(e.target.value))}
                      className="w-full h-1.5 bg-gray-200 dark:bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-600 dark:accent-blue-500"
                    />
                  </div>
                )}

                {/* COLOR PICKER */}
                {field.type === 'color' && (
                  <div className="flex items-center gap-4 bg-white dark:bg-white/[0.01] border border-gray-200 dark:border-white/5 rounded-2xl p-4">
                    <input
                      id={id}
                      type="color"
                      value={formData[field.name] || '#2563eb'}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      className="h-10 w-16 border-none bg-transparent rounded-xl cursor-pointer"
                    />
                    <span className="text-xs font-mono font-black text-gray-900 dark:text-white uppercase">{formData[field.name] || '#2563eb'}</span>
                  </div>
                )}

                {/* NUMBER */}
                {field.type === 'number' && (
                  <input
                    id={id}
                    type="number"
                    value={formData[field.name] !== undefined ? formData[field.name] : ''}
                    onChange={(e) => handleChange(field.name, e.target.value === '' ? '' : Number(e.target.value))}
                    placeholder={field.placeholder || '0'}
                    required={field.required}
                    className="w-full bg-white dark:bg-[#0f172a] border border-gray-200 dark:border-[#1e293b] focus:border-blue-600 dark:focus:border-blue-500 rounded-2xl px-5 py-4 text-gray-900 dark:text-white text-sm font-semibold outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600"
                  />
                )}

                {/* FILE UPLOAD */}
                {field.type === 'file' && (
                  <div className="upload-dropzone rounded-2xl p-6 text-center transition-colors cursor-pointer relative">
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
                    <Upload className="w-8 h-8 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                    <span className="text-xs font-bold text-gray-900 dark:text-white block">
                      {formData[field.name] || t('form.drag_drop_browse', 'Drag & drop image/document or Browse')}
                    </span>
                    <span className="text-[10px] text-gray-500 dark:text-gray-600 font-bold block mt-1">{t('form.max_file_size', 'Supports file types up to 10MB')}</span>
                  </div>
                )}
              </div>
            );
          })}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-8 py-5 text-xs font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-700 rounded-2xl transition-all shadow-md active:scale-[0.99] cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> {t('form.generating', 'Generating...')}
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-blue-100" /> {t('tools.' + slug + '.cta', ctaText)}
              </>
            )}
          </button>
        </form>
      </div>

      {/* 2. OUTPUT DISPLAY */}
      <div className="rounded-[2rem] border border-gray-200 dark:border-white/5 bg-[#F3F4F6] dark:bg-[#090d16] p-8 sm:p-10 shadow-sm dark:shadow-2xl flex flex-col justify-between relative min-h-[300px] transition-colors duration-250">
        <div className="absolute top-0 right-10 h-[1px] w-24 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        
        <div>
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-white/5 pb-4 mb-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-600 dark:text-gray-400">
              {t('form.output_panel', 'Output Generation Panel')}
            </h3>
            {output && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-gray-200 dark:border-white/5 hover:border-gray-300 dark:hover:border-white/10 rounded-xl bg-white dark:bg-white/[0.02] text-[10px] font-black uppercase tracking-wider text-gray-700 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-all cursor-pointer shadow-sm"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? t('form.copied', 'Copied!') : t('form.copy_response', 'Copy Response')}
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-4 py-8 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-white/5 rounded-lg w-3/4" />
              <div className="h-4 bg-gray-200 dark:bg-white/5 rounded-lg w-5/6" />
              <div className="h-4 bg-gray-200 dark:bg-white/5 rounded-lg w-2/3" />
              <div className="h-4 bg-gray-200 dark:bg-white/5 rounded-lg w-1/2" />
            </div>
          ) : output ? (
            <div className="text-gray-900 dark:text-gray-300 text-sm font-medium leading-relaxed whitespace-pre-wrap select-text p-2 max-h-[450px] overflow-y-auto font-mono">
              {output}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-400 dark:text-gray-600">
              <AlertCircle className="w-10 h-10 text-gray-400 dark:text-gray-700 mx-auto mb-4" />
              <p className="text-xs font-black uppercase tracking-widest">{t('form.awaiting_execution', 'Awaiting execution run')}</p>
              <p className="text-[10px] font-semibold text-gray-500 dark:text-gray-700 mt-1 max-w-[200px] mx-auto">{t('form.fill_parameters', 'Fill dynamic parameters in the console and hit execute.')}</p>
            </div>
          )}
        </div>

        {runStats && (
          <div className="border-t border-gray-200 dark:border-white/5 pt-4 mt-6 flex justify-between text-[9px] font-black uppercase tracking-widest text-gray-500">
            <span>{t('form.server_response', 'Server Response:')} <strong className="text-gray-700 dark:text-gray-400">{runStats.latencyMs}ms</strong></span>
            {runStats.tokens > 0 && (
              <span>{t('form.model_weight', 'Model Weight:')} <strong className="text-gray-700 dark:text-gray-400">{runStats.tokens} tokens</strong></span>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
