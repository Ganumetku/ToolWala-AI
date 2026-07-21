import { Calendar, Clock, ArrowRight, Hourglass } from 'lucide-react';
import { motion } from 'framer-motion';
interface ScheduledItemInfo {
  id: string;
  title: string;
  publishDate?: string | null;
  categoryName?: string;
  icon?: string | null;
}

interface ToolSchedulerCardProps {
  scheduledTools: ScheduledItemInfo[];
  totalDrafts: number;
  totalPublished: number;
  totalArchived: number;
}

export default function ToolSchedulerCard({
  scheduledTools,
  totalDrafts,
  totalPublished,
  totalArchived
}: ToolSchedulerCardProps) {
  // Sort scheduled tools by nearest publish date
  const upcoming = [...scheduledTools]
    .filter(t => t.publishDate && new Date(t.publishDate) > new Date())
    .sort((a, b) => new Date(a.publishDate!).getTime() - new Date(b.publishDate!).getTime())
    .slice(0, 3);

  const getRelativeTime = (isoString: string) => {
    try {
      const diffMs = new Date(isoString).getTime() - new Date().getTime();
      if (diffMs <= 0) return 'Just now';
      
      const diffMins = Math.floor(diffMs / (1000 * 60));
      if (diffMins < 60) return `In ${diffMins} min${diffMins > 1 ? 's' : ''}`;
      
      const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
      if (diffHours < 24) return `In ${diffHours} hr${diffHours > 1 ? 's' : ''}`;
      
      const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      return `In ${diffDays} day${diffDays > 1 ? 's' : ''}`;
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
      
      {/* 1. Stat cards overview */}
      <div className="lg:col-span-1 bg-white dark:bg-white/[0.01] border border-slate-200/80 dark:border-white/5 p-6 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none group-hover:bg-blue-500/10 transition-colors" />
        
        <div>
          <div className="flex items-center gap-2 mb-4">
            <span className="h-2 w-2 rounded-full bg-purple-600 dark:bg-purple-500 animate-pulse" />
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-purple-600 dark:text-purple-400">Queue Status</span>
          </div>
          <h4 className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-widest mb-6">Publishing Workflow</h4>
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div className="p-3 bg-slate-50 dark:bg-white/[0.01] border border-slate-200/80 dark:border-white/5 rounded-xl text-center">
            <span className="text-2xl font-black text-slate-900 dark:text-white block mb-0.5">{totalPublished}</span>
            <span className="text-[8px] font-black uppercase tracking-wider text-slate-400 dark:text-gray-500 block">Live</span>
          </div>
          <div className="p-3 bg-purple-50 dark:bg-purple-500/5 border border-purple-200 dark:border-purple-500/10 rounded-xl text-center">
            <span className="text-2xl font-black text-purple-600 dark:text-purple-400 block mb-0.5">{scheduledTools.length}</span>
            <span className="text-[8px] font-black uppercase tracking-wider text-purple-700 dark:text-purple-500 block">Pending</span>
          </div>
          <div className="p-3 bg-amber-50/50 dark:bg-white/[0.01] border border-amber-200/60 dark:border-white/5 rounded-xl text-center">
            <span className="text-2xl font-black text-amber-600 dark:text-amber-500 block mb-0.5">{totalDrafts}</span>
            <span className="text-[8px] font-black uppercase tracking-wider text-amber-700 dark:text-gray-500 block">Drafts</span>
          </div>
        </div>
      </div>

      {/* 2. Upcoming queue list */}
      <div className="lg:col-span-2 bg-white dark:bg-white/[0.01] border border-slate-200/80 dark:border-white/5 p-6 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/5 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-500/10 transition-colors" />
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-purple-600 dark:text-purple-400" />
            <h4 className="text-xs font-black text-slate-900 dark:text-white uppercase tracking-widest">Upcoming Publications</h4>
          </div>
          <span className="text-[9px] font-black uppercase text-slate-400 dark:text-gray-500 tracking-wider">
            {upcoming.length} scheduled
          </span>
        </div>

        {upcoming.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center py-6 text-center">
            <Hourglass className="w-8 h-8 text-slate-300 dark:text-gray-700 mb-2 animate-pulse" />
            <p className="text-xs text-slate-400 dark:text-gray-500 font-semibold">No publications currently in queue.</p>
          </div>
        ) : (
          <div className="space-y-3 flex-1 mt-2">
            {upcoming.map((t, index) => (
              <motion.div
                key={t.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50/80 dark:bg-white/[0.01] hover:bg-slate-100 dark:hover:bg-white/[0.02] border border-slate-200/60 dark:border-white/5 transition-all"
              >
                <div className="flex items-center gap-3">
                  <div className="h-8 w-8 rounded-xl bg-purple-50 dark:bg-purple-600/10 border border-purple-200 dark:border-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 text-sm font-bold">
                    {t.icon || '🔧'}
                  </div>
                  <div>
                    <span className="text-xs font-black text-slate-900 dark:text-white block leading-tight">{t.title}</span>
                    <span className="text-[9px] text-slate-400 dark:text-gray-500 font-bold block mt-0.5 uppercase tracking-wider">
                      {t.categoryName || 'General'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-right shrink-0">
                  <div className="flex flex-col items-end">
                    <span className="text-[10px] font-black uppercase text-purple-600 dark:text-purple-400 tracking-wider">
                      {getRelativeTime(t.publishDate!)}
                    </span>
                    <span className="text-[8px] text-slate-400 dark:text-gray-500 font-bold block mt-0.5">
                      {new Date(t.publishDate!).toLocaleDateString()}
                    </span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 dark:text-gray-600" />
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
