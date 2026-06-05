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
        className="flex items-center gap-2 px-3 py-2 border border-white/5 hover:border-white/15 bg-white/[0.02] hover:bg-white/[0.04] text-[10px] font-black uppercase tracking-widest text-gray-300 rounded-xl transition-all cursor-pointer select-none"
      >
        <Icon className={`w-3.5 h-3.5 ${current.color}`} />
        <span>{current.text}</span>
        <ChevronDown className="w-3.5 h-3.5 text-gray-500" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-44 rounded-2xl bg-[#090d16] border border-white/10 shadow-2xl z-20 py-1.5 overflow-hidden backdrop-blur-md">
          {status !== 'published' && (
            <button
              onClick={() => handleAction('published')}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-gray-400 hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors text-left cursor-pointer"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-400" />
              Publish Now
            </button>
          )}

          <button
            onClick={() => handleAction('scheduled')}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-gray-400 hover:text-purple-400 hover:bg-purple-500/10 transition-colors text-left cursor-pointer"
          >
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            Schedule...
          </button>

          {status !== 'draft' && (
            <button
              onClick={() => handleAction('draft')}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-gray-400 hover:text-amber-400 hover:bg-amber-500/10 transition-colors text-left cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              Revert to Draft
            </button>
          )}

          {status !== 'archived' && (
            <button
              onClick={() => handleAction('archived')}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-[10px] font-black uppercase tracking-wider text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-colors text-left cursor-pointer"
            >
              <Archive className="w-3.5 h-3.5 text-gray-500" />
              Archive Tool
            </button>
          )}
        </div>
      )}
    </div>
  );
}
