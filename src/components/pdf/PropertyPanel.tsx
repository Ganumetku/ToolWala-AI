"use client";

import {
  Highlighter,
  Minus,
  Plus,
  Bold,
  Italic,
  Underline,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Sparkles,
  Paintbrush,
  Trash2,
  Settings,
} from 'lucide-react';
import { FONT_SIZES } from '@/types/pdf';
import type { SelectedObjectInfo } from '@/types/pdf';
import { rgbaToHex } from '@/lib/twpdf/utils';

export interface PropertyPanelProps {
  selectedObjectInfo: SelectedObjectInfo | null;
  handleHighlightSelectedText: () => void;
  changeSelectedProperty: (key: string, value: unknown) => void;
  adjustLayer: (action: 'front' | 'back' | 'forward' | 'backward') => void;
  handleDeleteSelected: () => void;
}

export function PropertyPanel({
  selectedObjectInfo,
  handleHighlightSelectedText,
  changeSelectedProperty,
  adjustLayer,
  handleDeleteSelected,
}: PropertyPanelProps) {
  return (
    <div className="p-5 space-y-6">
      {selectedObjectInfo ? (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Selected Object type indicator */}
          <div className="bg-slate-900/50 p-4 rounded-2xl border border-slate-900">
            <span className="text-[9px] font-black uppercase tracking-wider text-slate-500 block mb-0.5">Selection Type</span>
            <span className="text-xs font-bold text-slate-300 capitalize">
              {selectedObjectInfo.type === 'i-text' || selectedObjectInfo.type === 'textbox'
                ? (selectedObjectInfo.isHighlight ? "Highlight Shape" : "Text Box")
                : selectedObjectInfo.type}
            </span>
          </div>

          {/* Text Properties controls */}
          {(selectedObjectInfo.type === 'textbox' || selectedObjectInfo.type === 'i-text') && (
            <div className="space-y-4 border-t border-slate-900 pt-4">
              {/* Quick Action Highlight */}
              <button
                onClick={handleHighlightSelectedText}
                className="w-full flex items-center justify-center gap-2 bg-yellow-600/10 hover:bg-yellow-600/20 border border-yellow-500/25 text-yellow-400 py-2.5 rounded-xl text-xs font-bold transition-all"
              >
                <Highlighter className="w-4 h-4 text-yellow-450" />
                Highlight Text Box
              </button>

              {/* Font options */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Font Family</label>
                <select
                  value={selectedObjectInfo.fontFamily}
                  onChange={(e) => changeSelectedProperty('fontFamily', e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-blue-500"
                >
                  {selectedObjectInfo.fontFamily && !['Helvetica', 'Times New Roman', 'Courier'].includes(selectedObjectInfo.fontFamily) && (
                    <option value={selectedObjectInfo.fontFamily}>
                      Original PDF Font ({selectedObjectInfo.fontFamily.split(',')[0].replace(/"/g, '')})
                    </option>
                  )}
                  <option value="Helvetica">Helvetica (Sans-Serif)</option>
                  <option value="Times New Roman">Times New Roman (Serif)</option>
                  <option value="Courier">Courier (Monospace)</option>
                </select>
              </div>

              {/* Font Size controls */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Font Size</label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => changeSelectedProperty('fontSize', Math.max(6, selectedObjectInfo.fontSize - 1))}
                    className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <Minus className="w-4 h-4" />
                  </button>
                  
                  <select
                    value={selectedObjectInfo.fontSize}
                    onChange={(e) => changeSelectedProperty('fontSize', parseInt(e.target.value))}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white outline-none focus:border-blue-500 text-center"
                  >
                    {FONT_SIZES.map((sz) => (
                      <option key={sz} value={sz}>{sz} px</option>
                    ))}
                  </select>

                  <button
                    onClick={() => changeSelectedProperty('fontSize', Math.min(100, selectedObjectInfo.fontSize + 1))}
                    className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-white"
                  >
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Text Style toggles */}
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Text Style</label>
                <div className="grid grid-cols-4 gap-1.5">
                  <button
                    onClick={() => changeSelectedProperty('fontWeight', selectedObjectInfo.fontWeight === 'bold' ? 'normal' : 'bold')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      selectedObjectInfo.fontWeight === 'bold' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Bold className="w-3.5 h-3.5 mx-auto" />
                  </button>
                  <button
                    onClick={() => changeSelectedProperty('fontStyle', selectedObjectInfo.fontStyle === 'italic' ? 'normal' : 'italic')}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      selectedObjectInfo.fontStyle === 'italic' ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Italic className="w-3.5 h-3.5 mx-auto" />
                  </button>
                  <button
                    onClick={() => changeSelectedProperty('underline', !selectedObjectInfo.underline)}
                    className={`p-2.5 rounded-xl border text-xs font-bold transition-all ${
                      selectedObjectInfo.underline ? 'bg-blue-600 border-blue-500 text-white' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Underline className="w-3.5 h-3.5 mx-auto" />
                  </button>
                  <button
                    onClick={() => {
                      const aligns = ['left', 'center', 'right'];
                      const nextIdx = (aligns.indexOf(selectedObjectInfo.textAlign) + 1) % aligns.length;
                      changeSelectedProperty('textAlign', aligns[nextIdx]);
                    }}
                    className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white text-xs font-bold"
                  >
                    {selectedObjectInfo.textAlign === 'left' && <AlignLeft className="w-3.5 h-3.5 mx-auto" />}
                    {selectedObjectInfo.textAlign === 'center' && <AlignCenter className="w-3.5 h-3.5 mx-auto" />}
                    {selectedObjectInfo.textAlign === 'right' && <AlignRight className="w-3.5 h-3.5 mx-auto" />}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Colors parameters */}
          <div className="space-y-3 border-t border-slate-900 pt-4">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
              {selectedObjectInfo.type === 'textbox' || selectedObjectInfo.type === 'i-text'
                ? "Font Color"
                : selectedObjectInfo.isHighlight
                ? "Highlight Color"
                : "Stroke Color"}
            </label>
            <div className="flex flex-wrap gap-2">
              {/* Auto-Match Detected Color */}
              {selectedObjectInfo.originalTextData?.detectedColor && (
                <button
                  key="auto-match"
                  onClick={() => {
                    const detColor = selectedObjectInfo.originalTextData?.detectedColor;
                    if (selectedObjectInfo.type === 'textbox' || selectedObjectInfo.type === 'i-text' || selectedObjectInfo.isHighlight) {
                      changeSelectedProperty('fill', detColor);
                    } else {
                      changeSelectedProperty('stroke', detColor);
                    }
                  }}
                  className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
                    (selectedObjectInfo.type === 'textbox' || selectedObjectInfo.type === 'i-text'
                      ? selectedObjectInfo.fill
                      : selectedObjectInfo.isHighlight
                      ? (selectedObjectInfo.fill.startsWith('rgba') ? rgbaToHex(selectedObjectInfo.fill) : selectedObjectInfo.fill)
                      : selectedObjectInfo.stroke) === selectedObjectInfo.originalTextData.detectedColor
                      ? 'border-blue-500 scale-110 shadow-md shadow-blue-500/10'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: selectedObjectInfo.originalTextData.detectedColor }}
                    title={`Auto-matched Color (${selectedObjectInfo.originalTextData.detectedColor})`}
                >
                  <Sparkles className="w-3.5 h-3.5 text-white mix-blend-difference" />
                </button>
              )}
              {[
                { hex: '#0b2c8c', label: 'GST Navy Blue' },
                { hex: '#000099', label: 'Classic Navy Blue' },
                { hex: '#000000', label: 'Black' },
                { hex: '#3b82f6', label: 'Light Blue' },
                { hex: '#fbbf24', label: 'Yellow' },
                { hex: '#22c55e', label: 'Green' },
                { hex: '#ef4444', label: 'Red' },
                { hex: '#ffffff', label: 'White' },
              ].map((color) => (
                <button
                  key={color.hex}
                  onClick={() => {
                    if (selectedObjectInfo.type === 'textbox' || selectedObjectInfo.type === 'i-text' || selectedObjectInfo.isHighlight) {
                      changeSelectedProperty('fill', color.hex);
                    } else {
                      changeSelectedProperty('stroke', color.hex);
                    }
                  }}
                  className={`w-7 h-7 rounded-full border-2 transition-all ${
                    (selectedObjectInfo.type === 'textbox' || selectedObjectInfo.type === 'i-text'
                      ? selectedObjectInfo.fill
                      : selectedObjectInfo.isHighlight
                      ? (selectedObjectInfo.fill.startsWith('rgba') ? rgbaToHex(selectedObjectInfo.fill) : selectedObjectInfo.fill)
                      : selectedObjectInfo.stroke) === color.hex
                      ? 'border-blue-500 scale-110 shadow-md shadow-blue-500/10'
                      : 'border-transparent hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.hex }}
                  title={color.label}
                />
              ))}
              {/* Native Custom Color Picker */}
              <div className="relative w-7 h-7 rounded-full border border-slate-800 flex items-center justify-center bg-slate-900 hover:bg-slate-800 cursor-pointer overflow-hidden transition-all hover:scale-105" title="Custom Eyedropper Color">
                <Paintbrush className="w-3.5 h-3.5 text-slate-400 pointer-events-none" />
                <input
                  type="color"
                  value={
                    selectedObjectInfo.type === 'textbox' || selectedObjectInfo.type === 'i-text'
                      ? (selectedObjectInfo.fill === 'transparent' ? (selectedObjectInfo.originalTextData?.detectedColor || '#0b2c8c') : selectedObjectInfo.fill)
                      : selectedObjectInfo.isHighlight
                      ? (selectedObjectInfo.fill.startsWith('rgba') ? rgbaToHex(selectedObjectInfo.fill) : selectedObjectInfo.fill)
                      : selectedObjectInfo.stroke
                  }
                  onChange={(e) => {
                    if (selectedObjectInfo.type === 'textbox' || selectedObjectInfo.type === 'i-text' || selectedObjectInfo.isHighlight) {
                      changeSelectedProperty('fill', e.target.value);
                    } else {
                      changeSelectedProperty('stroke', e.target.value);
                    }
                  }}
                  className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                />
              </div>
            </div>
          </div>

          {/* Shape parameters (Opacity and Thickness) */}
          <div className="space-y-4 border-t border-slate-900 pt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Opacity</label>
                <span className="text-[10px] font-bold text-slate-400">
                  {selectedObjectInfo.isHighlight
                    ? Math.round((selectedObjectInfo.fill.startsWith('rgba')
                      ? parseFloat(selectedObjectInfo.fill.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/)?.[4] || '0.4')
                      : 1) * 100)
                    : Math.round(selectedObjectInfo.opacity * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.1"
                max="1.0"
                step="0.05"
                value={
                  selectedObjectInfo.isHighlight
                    ? parseFloat(selectedObjectInfo.fill.match(/rgba?\((\d+),\s*(\d+),\s*(\d+),\s*([\d.]+)\)/)?.[4] || '0.4')
                    : selectedObjectInfo.opacity
                }
                onChange={(e) => changeSelectedProperty('opacity', parseFloat(e.target.value))}
                className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-blue-500"
              />
            </div>

            {selectedObjectInfo.type !== 'textbox' && selectedObjectInfo.type !== 'i-text' && selectedObjectInfo.type !== 'image' && !selectedObjectInfo.isHighlight && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Border Thickness</label>
                  <span className="text-[10px] font-bold text-slate-400">{selectedObjectInfo.strokeWidth}px</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="15"
                  step="1"
                  value={selectedObjectInfo.strokeWidth}
                  onChange={(e) => changeSelectedProperty('strokeWidth', parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-900 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>
            )}
          </div>

          {/* Layer controls */}
          <div className="space-y-2 border-t border-slate-900 pt-4">
            <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">Layer Controls</label>
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => adjustLayer('front')}
            className="py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-[10px] font-bold uppercase rounded-xl transition-colors"
          >
            Bring Front
          </button>
          <button
            onClick={() => adjustLayer('back')}
            className="py-2.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 hover:border-slate-700 text-[10px] font-bold uppercase rounded-xl transition-colors"
          >
            Send Back
          </button>
        </div>
      </div>

      {/* Delete control */}
      <div className="pt-4">
        <button
          onClick={handleDeleteSelected}
          className="w-full flex items-center justify-center gap-2 bg-red-950/20 hover:bg-red-950/40 text-red-400 py-3.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all active:scale-95 border border-red-900/30"
        >
          <Trash2 className="w-4 h-4" />
          Delete Element
        </button>
      </div>
    </div>
  ) : (
    // Properties inspector empty
    <div className="py-20 text-center space-y-4">
      <div className="bg-slate-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto border border-slate-800 text-slate-600 shadow-inner">
        <Settings className="w-6 h-6 animate-pulse-slow" />
      </div>
      <h4 className="text-xs font-bold text-slate-400">No Selection</h4>
      <p className="text-[11px] font-medium text-slate-600 leading-relaxed px-4">
        Select an element on any page to custom-adjust its color, fonts, opacity, or layers.
      </p>
    </div>
  )}
</div>
  );
}
