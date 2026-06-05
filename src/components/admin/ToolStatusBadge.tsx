import { Globe, Clock, FileText, Archive } from 'lucide-react';

interface ToolStatusBadgeProps {
  status?: 'draft' | 'scheduled' | 'published' | 'archived';
  publishDate?: string | null;
}

export default function ToolStatusBadge({ status = 'draft', publishDate }: ToolStatusBadgeProps) {
  let badgeStyles = '';
  let Icon = FileText;
  let label = 'Draft';
  let dateText = '';

  switch (status) {
    case 'published':
      badgeStyles = 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.1)]';
      Icon = Globe;
      label = 'Published';
      break;
    case 'scheduled':
      badgeStyles = 'border-purple-500/20 bg-purple-500/10 text-purple-400 shadow-[0_0_12px_rgba(168,85,247,0.1)]';
      Icon = Clock;
      label = 'Scheduled';
      if (publishDate) {
        try {
          const date = new Date(publishDate);
          dateText = date.toLocaleDateString(undefined, { 
            month: 'short', 
            day: 'numeric', 
            hour: '2-digit', 
            minute: '2-digit' 
          });
        } catch (e) {
          dateText = '';
        }
      }
      break;
    case 'archived':
      badgeStyles = 'border-white/5 bg-white/[0.02] text-gray-500';
      Icon = Archive;
      label = 'Archived';
      break;
    case 'draft':
    default:
      badgeStyles = 'border-amber-500/20 bg-amber-500/10 text-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.1)]';
      Icon = FileText;
      label = 'Draft';
      break;
  }

  return (
    <div className="flex flex-col gap-1 items-start">
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest border transition-all ${badgeStyles}`}>
        <Icon className="w-3 h-3" />
        {label}
      </span>
      {status === 'scheduled' && dateText && (
        <span className="text-[9px] text-gray-500 font-bold pl-0.5">
          {dateText}
        </span>
      )}
    </div>
  );
}
