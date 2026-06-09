"use client";

import { useState, useEffect } from 'react';
import { Sparkles, Copy, Check, AlertCircle, RefreshCw, Eye, EyeOff, Upload } from 'lucide-react';
import { toast } from 'sonner';

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
    toast.success('Copied generation to clipboard!');
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
        toast.error(`Please complete the required field: ${inp.label}`);
        setIsLoading(false);
        return;
      }
    }

    try {
      const res = await fetch('/api/ai/run', {
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
        toast.success('Utility executed successfully!');
      } else {
        toast.error(data.error || 'Execution handler failed.');
      }
    } catch (err) {
      console.error(err);
      toast.error('Unable to establish connection to execution servers.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
      
      {/* 1. INPUT CONSOLE */}
      <div className="glass rounded-[2rem] border border-white/5 bg-white/[0.01] p-8 sm:p-10 shadow-2xl relative">
        <div className="absolute top-0 right-10 h-[1px] w-24 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        
        <h3 className="text-sm font-black uppercase tracking-widest text-white mb-8 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-500" /> Command Console
        </h3>

        <form onSubmit={handleSubmit} className="space-y-6">
          {inputsSchema.map((field) => {
            const id = `field_${field.name}`;
            return (
              <div key={field.name} className="space-y-2">
                <div className="flex justify-between items-center">
                  <label htmlFor={id} className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-1">
                    {field.label} {field.required && <span className="text-blue-500">*</span>}
                  </label>
                  {field.helperText && (
                    <span className="text-[9px] text-gray-600 font-bold italic">{field.helperText}</span>
                  )}
                </div>

                {/* TEXT FIELD */}
                {field.type === 'text' && (
                  <input
                    id={id}
                    type="text"
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    placeholder={field.placeholder || `Enter ${field.label.toLowerCase()}...`}
                    required={field.required}
                    className="w-full bg-white/[0.02] border border-white/5 focus:border-blue-500/50 rounded-2xl px-5 py-4 text-white text-sm font-semibold outline-none transition-all focus:ring-4 focus:ring-blue-500/10 placeholder-gray-600"
                  />
                )}

                {/* TEXTAREA */}
                {field.type === 'textarea' && (
                  <textarea
                    id={id}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    placeholder={field.placeholder || `Enter instructions...`}
                    required={field.required}
                    rows={4}
                    className="w-full bg-white/[0.02] border border-white/5 focus:border-blue-500/50 rounded-2xl p-5 text-white text-sm font-semibold outline-none transition-all focus:ring-4 focus:ring-blue-500/10 placeholder-gray-600 resize-none"
                  />
                )}

                {/* SELECT DROPDOWN */}
                {field.type === 'select' && (
                  <select
                    id={id}
                    value={formData[field.name] || ''}
                    onChange={(e) => handleChange(field.name, e.target.value)}
                    required={field.required}
                    className="w-full bg-[#090d16] border border-white/5 focus:border-blue-500/50 rounded-2xl px-5 py-4 text-white text-sm font-bold outline-none transition-all focus:ring-4 focus:ring-blue-500/10 cursor-pointer"
                  >
                    <option value="" className="text-gray-600">-- Select Choice --</option>
                    {(field.options || '').split(',').map((opt) => {
                      const trimmed = opt.trim();
                      return (
                        <option key={trimmed} value={trimmed} className="bg-slate-950 text-white font-semibold">
                          {trimmed}
                        </option>
                      );
                    })}
                  </select>
                )}

                {/* TOGGLE */}
                {field.type === 'toggle' && (
                  <label className="flex items-center gap-3 p-4 bg-white/[0.01] border border-white/5 hover:border-white/10 rounded-2xl cursor-pointer transition-all">
                    <input
                      id={id}
                      type="checkbox"
                      checked={!!formData[field.name]}
                      onChange={(e) => handleChange(field.name, e.target.checked)}
                      className="rounded text-blue-500 h-4.5 w-4.5 cursor-pointer"
                    />
                    <div>
                      <span className="text-xs font-bold text-white block">{field.label} Enable</span>
                    </div>
                  </label>
                )}

                {/* CHECKBOX */}
                {field.type === 'checkbox' && (
                  <label className="flex items-center gap-3 p-4 bg-white/[0.01] border border-white/5 hover:border-white/10 rounded-2xl cursor-pointer transition-all">
                    <input
                      id={id}
                      type="checkbox"
                      checked={!!formData[field.name]}
                      onChange={(e) => handleChange(field.name, e.target.checked)}
                      className="rounded text-blue-500 h-4.5 w-4.5 cursor-pointer"
                    />
                    <span className="text-xs font-semibold text-gray-300">{field.placeholder || 'Enable verification'}</span>
                  </label>
                )}

                {/* SLIDER RANGE */}
                {field.type === 'slider' && (
                  <div className="space-y-2 p-4 bg-white/[0.01] border border-white/5 rounded-2xl">
                    <div className="flex justify-between text-xs font-bold text-gray-500">
                      <span>Value: {formData[field.name] || 0}</span>
                      <span>Range: 0 - 100</span>
                    </div>
                    <input
                      id={id}
                      type="range"
                      min="0"
                      max="100"
                      value={formData[field.name] || 50}
                      onChange={(e) => handleChange(field.name, Number(e.target.value))}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-blue-500"
                    />
                  </div>
                )}

                {/* COLOR PICKER */}
                {field.type === 'color' && (
                  <div className="flex items-center gap-4 bg-white/[0.01] border border-white/5 rounded-2xl p-4">
                    <input
                      id={id}
                      type="color"
                      value={formData[field.name] || '#2563eb'}
                      onChange={(e) => handleChange(field.name, e.target.value)}
                      className="h-10 w-16 border-none bg-transparent rounded-xl cursor-pointer"
                    />
                    <span className="text-xs font-mono font-black text-white uppercase">{formData[field.name] || '#2563eb'}</span>
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
                    className="w-full bg-white/[0.02] border border-white/5 focus:border-blue-500/50 rounded-2xl px-5 py-4 text-white text-sm font-semibold outline-none transition-all placeholder-gray-600"
                  />
                )}

                {/* FILE UPLOAD */}
                {field.type === 'file' && (
                  <div className="border border-white/5 border-dashed rounded-2xl bg-white/[0.01] p-6 text-center hover:bg-white/[0.02] transition-colors cursor-pointer relative">
                    <input
                      id={id}
                      type="file"
                      required={field.required}
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          handleChange(field.name, file.name); // Mock upload string representation
                          toast.info(`Local upload loaded: ${file.name}`);
                        }
                      }}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    <Upload className="w-8 h-8 text-gray-500 mx-auto mb-3" />
                    <span className="text-xs font-bold text-white block">
                      {formData[field.name] || 'Drag & drop image/document or Browse'}
                    </span>
                    <span className="text-[10px] text-gray-600 font-bold block mt-1">Supports file types up to 10MB</span>
                  </div>
                )}
              </div>
            );
          })}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-3 px-8 py-5 text-xs font-black uppercase tracking-widest text-white bg-blue-600 hover:bg-blue-500 rounded-2xl transition-all shadow-[0_0_30px_rgba(37,99,235,0.4)] disabled:opacity-50 disabled:hover:bg-blue-600 active:scale-[0.99] cursor-pointer"
          >
            {isLoading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4 text-blue-200" /> {ctaText}
              </>
            )}
          </button>
        </form>
      </div>

      {/* 2. OUTPUT DISPLAY */}
      <div className="glass rounded-[2rem] border border-white/5 bg-white/[0.01] p-8 sm:p-10 shadow-2xl flex flex-col justify-between relative min-h-[300px]">
        <div className="absolute top-0 right-10 h-[1px] w-24 bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
        
        <div>
          <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6">
            <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">
              Output Generation Panel
            </h3>
            {output && (
              <button
                onClick={handleCopy}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-white/5 hover:border-white/10 rounded-xl bg-white/[0.02] text-[10px] font-black uppercase tracking-wider text-gray-400 hover:text-white transition-all cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Response
              </button>
            )}
          </div>

          {isLoading ? (
            <div className="space-y-4 py-8 animate-pulse">
              <div className="h-4 bg-white/5 rounded-lg w-3/4" />
              <div className="h-4 bg-white/5 rounded-lg w-5/6" />
              <div className="h-4 bg-white/5 rounded-lg w-2/3" />
              <div className="h-4 bg-white/5 rounded-lg w-1/2" />
            </div>
          ) : output ? (
            <div className="text-gray-300 text-sm font-medium leading-relaxed whitespace-pre-wrap select-text p-2 max-h-[450px] overflow-y-auto font-mono">
              {output}
            </div>
          ) : (
            <div className="text-center py-20 text-gray-600">
              <AlertCircle className="w-10 h-10 text-gray-700 mx-auto mb-4" />
              <p className="text-xs font-black uppercase tracking-widest">Awaiting execution run</p>
              <p className="text-[10px] font-semibold text-gray-700 mt-1 max-w-[200px] mx-auto">Fill dynamic parameters in the console and hit execute.</p>
            </div>
          )}
        </div>

        {runStats && (
          <div className="border-t border-white/5 pt-4 mt-6 flex justify-between text-[9px] font-black uppercase tracking-widest text-gray-500">
            <span>Server Response: <strong className="text-gray-400">{runStats.latencyMs}ms</strong></span>
            {runStats.tokens > 0 && (
              <span>Model Weight: <strong className="text-gray-400">{runStats.tokens} tokens</strong></span>
            )}
          </div>
        )}
      </div>

    </div>
  );
}
