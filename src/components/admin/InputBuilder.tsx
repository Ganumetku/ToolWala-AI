import { useState } from 'react';
import { Plus, Trash2, ArrowUp, ArrowDown, Settings, HelpCircle, GripVertical } from 'lucide-react';

export interface FormInputSchema {
  id?: string;
  name: string;
  label: string;
  placeholder?: string;
  type: 'text' | 'textarea' | 'select' | 'toggle' | 'checkbox' | 'slider' | 'number' | 'file' | 'color';
  required: boolean;
  defaultValue?: string;
  options?: string; // Comma separated
  helperText?: string;
  order: number;
}

interface InputBuilderProps {
  inputs: FormInputSchema[];
  onChange: (inputs: FormInputSchema[]) => void;
}

export default function InputBuilder({ inputs, onChange }: InputBuilderProps) {
  const addInput = () => {
    const name = `input_${Date.now()}`;
    const newInput: FormInputSchema = {
      name,
      label: 'New Field',
      placeholder: 'Enter value...',
      type: 'text',
      required: false,
      defaultValue: '',
      options: '',
      helperText: '',
      order: inputs.length
    };
    onChange([...inputs, newInput]);
  };

  const updateInput = (index: number, field: keyof FormInputSchema, value: any) => {
    const updated = inputs.map((inp, idx) => {
      if (idx === index) {
        const item = { ...inp, [field]: value };
        // Auto slugify name field
        if (field === 'label' && !inp.id) {
          item.name = value.toLowerCase().replace(/ /g, '_').replace(/[^\w]/g, '');
        }
        return item;
      }
      return inp;
    });
    onChange(updated);
  };

  const deleteInput = (index: number) => {
    const filtered = inputs.filter((_, idx) => idx !== index).map((inp, idx) => ({ ...inp, order: idx }));
    onChange(filtered);
  };

  const moveInput = (index: number, direction: 'up' | 'down') => {
    if (direction === 'up' && index === 0) return;
    if (direction === 'down' && index === inputs.length - 1) return;

    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const newInputs = [...inputs];
    const temp = newInputs[index];
    newInputs[index] = newInputs[targetIdx];
    newInputs[targetIdx] = temp;

    // Recalculate order fields
    const ordered = newInputs.map((inp, idx) => ({ ...inp, order: idx }));
    onChange(ordered);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-500">
          Form Input Builder Schema
        </span>
        <button
          type="button"
          onClick={addInput}
          className="flex items-center gap-1.5 px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-500 rounded-xl transition-all cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Add Form Field
        </button>
      </div>

      {inputs.length === 0 ? (
        <div className="text-center py-10 border border-white/5 border-dashed rounded-2xl bg-white/[0.005]">
          <p className="text-gray-500 text-xs font-semibold">No dynamic form fields built. The tool will execute on free input defaults.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {inputs.map((input, index) => (
            <div 
              key={index} 
              className="p-5 border border-white/5 bg-white/[0.01] rounded-2xl space-y-4 relative group"
            >
              {/* Header Toolbar */}
              <div className="flex items-center justify-between border-b border-white/5 pb-3">
                <div className="flex items-center gap-2">
                  <GripVertical className="w-4 h-4 text-gray-600" />
                  <span className="text-xs font-black text-white">Field #{index + 1} ({input.type.toUpperCase()})</span>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => moveInput(index, 'up')}
                    disabled={index === 0}
                    className="p-1.5 border border-white/5 rounded-lg text-gray-500 hover:text-white disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => moveInput(index, 'down')}
                    disabled={index === inputs.length - 1}
                    className="p-1.5 border border-white/5 rounded-lg text-gray-500 hover:text-white disabled:opacity-30 disabled:hover:text-gray-500 transition-colors"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteInput(index)}
                    className="p-1.5 border border-white/5 hover:border-red-500/20 rounded-lg text-gray-500 hover:text-red-400 transition-colors ml-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Editing Fields Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Field Type</label>
                  <select
                    value={input.type}
                    onChange={(e) => updateInput(index, 'type', e.target.value)}
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none cursor-pointer"
                  >
                    <option value="text">Single-line Text</option>
                    <option value="textarea">Multi-line Textarea</option>
                    <option value="select">Dropdown Select</option>
                    <option value="toggle">Toggle switch</option>
                    <option value="checkbox">Checkbox list</option>
                    <option value="slider">Range Slider</option>
                    <option value="number">Number input</option>
                    <option value="file">File uploader</option>
                    <option value="color">Color picker</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Field Label</label>
                  <input
                    type="text"
                    value={input.label}
                    onChange={(e) => updateInput(index, 'label', e.target.value)}
                    placeholder="e.g. Tone of Voice"
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">System Identifier (Slug)</label>
                  <input
                    type="text"
                    value={input.name}
                    onChange={(e) => updateInput(index, 'name', e.target.value)}
                    placeholder="e.g. tone_voice"
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none font-mono"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Placeholder text</label>
                  <input
                    type="text"
                    value={input.placeholder || ''}
                    onChange={(e) => updateInput(index, 'placeholder', e.target.value)}
                    placeholder="Enter placeholder..."
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Default value</label>
                  <input
                    type="text"
                    value={input.defaultValue || ''}
                    onChange={(e) => updateInput(index, 'defaultValue', e.target.value)}
                    placeholder="None"
                    className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none"
                  />
                </div>

                <div className="space-y-1 flex flex-col justify-end">
                  <label className="flex items-center gap-2 p-2 bg-slate-950/30 border border-white/5 rounded-xl cursor-pointer hover:bg-slate-950/50">
                    <input
                      type="checkbox"
                      checked={input.required}
                      onChange={(e) => updateInput(index, 'required', e.target.checked)}
                      className="rounded text-blue-500 h-3.5 w-3.5 cursor-pointer"
                    />
                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider">Required Field</span>
                  </label>
                </div>
              </div>

              {/* Conditional Options / Sub configurations */}
              {input.type === 'select' && (
                <div className="space-y-1.5 pt-2">
                  <label className="text-[9px] font-black text-blue-400 uppercase tracking-widest">Dropdown choices (Comma separated)</label>
                  <input
                    type="text"
                    value={input.options || ''}
                    onChange={(e) => updateInput(index, 'options', e.target.value)}
                    placeholder="e.g. Professional, Funny, Casual, Informative"
                    className="w-full bg-slate-950/80 border border-blue-500/20 focus:border-blue-500/50 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none"
                  />
                </div>
              )}

              <div className="space-y-1">
                <label className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Helper Instructions Text</label>
                <input
                  type="text"
                  value={input.helperText || ''}
                  onChange={(e) => updateInput(index, 'helperText', e.target.value)}
                  placeholder="e.g. Explain how to format the text..."
                  className="w-full bg-slate-950/80 border border-white/10 rounded-xl px-3 py-2 text-xs font-semibold text-white outline-none"
                />
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
