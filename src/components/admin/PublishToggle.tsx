import { useState, useRef, useEffect } from 'react';
import { Globe, Clock, FileText, Archive, ChevronDown } from 'lucide-react';

interface PublishToggleProps {
  status?: 'draft' | 'scheduled' | 'published' | 'archived';
  onStatusChange: (status: 'draft' | 'scheduled' | 'published' | 'archived') => void;
  onScheduleClick: () => void;
}

export default function PublishToggle({
  status = 'draft',
  onStatusChange,
  onScheduleClick
}: PublishToggleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAction = (action: 'draft' | 'scheduled' | 'published' | 'archived') => {
    setIsOpen(false);
    if (action === 'scheduled') {
      onScheduleClick();
    } else {
      onStatusChange(action);
    }
  };

  const getButtonTextAndIcon = () => {
    switch (status) {
      case 'published':
        return { text: 'Published Now', icon: Globe, color: 'text-emerald-400' };
      case 'scheduled':
        return { text: 'Scheduled', icon: Clock, color: 'text-purple-400' };
      case 'archived':
        return { text: 'Archived', icon: Archive, color: 'text-gray-400' };
      case 'draft':
      default:
        return { text: 'Draft Mode', icon: FileText, color: 'text-amber-400' };
    }
  };

  const current = getButtonTextAndIcon();
  const Icon = current.icon;

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 border border-slate-200 dark:border-white/5 hover:border-slate-300 dark:hover:border-white/15 bg-white dark:bg-white/[0.02] hover:bg-slate-50 dark:hover:bg-white/[0.04] text-[10px] font-black uppercase tracking-widest text-slate-700 dark:text-gray-300 rounded-xl transition-all cursor-pointer select-none shadow-sm"
      >
        <Icon className={`w-3.5 h-3.5 ${current.color}`} />
        <span>{current.text}</span>
        <ChevronDown className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-white dark:bg-[#090d16] border border-slate-200 dark:border-white/10 shadow-2xl z-20 py-1.5 overflow-hidden backdrop-blur-md">
          {status !== 'published' && (
            <button
              onClick={() => handleAction('published')}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 transition-colors text-left cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              Publish Now
            </button>
          )}

          <button
            onClick={() => handleAction('scheduled')}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-500/10 transition-colors text-left cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" />
            Schedule...
          </button>

          {status !== 'draft' && (
            <button
              onClick={() => handleAction('draft')}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 transition-colors text-left cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
              Revert to Draft
            </button>
          )}

          {status !== 'archived' && (
            <button
              onClick={() => handleAction('archived')}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-slate-700 dark:text-gray-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors text-left cursor-pointer"
            >
              <Archive className="w-3.5 h-3.5 text-slate-400 dark:text-gray-500" />
              Archive Tool
            </button>
          )}
        </div>
      )}
    </div>
  );
}
