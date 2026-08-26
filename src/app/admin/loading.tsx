import { Loader2 } from 'lucide-react';

export default function AdminLoading() {
  return (
    <div className="space-y-6 sm:space-y-10 animate-pulse">
      {/* Loading status banner */}
      <div className="bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 p-5 sm:p-6 rounded-2xl sm:rounded-3xl shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 sm:gap-4">
          <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl sm:rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
            <Loader2 className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <div className="h-4 w-48 bg-slate-200 dark:bg-white/10 rounded-md mb-1.5" />
            <div className="h-3 w-72 bg-slate-100 dark:bg-white/5 rounded-md" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="h-8 w-28 bg-slate-100 dark:bg-white/10 rounded-xl" />
        </div>
      </div>

      {/* Skeleton KPI Cards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-6">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-2xl sm:rounded-3xl p-5 sm:p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] flex flex-col justify-between h-36"
          >
            <div className="flex items-center justify-between">
              <div className="h-3 w-20 bg-slate-200 dark:bg-white/10 rounded-full" />
              <div className="h-9 w-9 bg-slate-100 dark:bg-white/5 rounded-xl" />
            </div>
            <div className="space-y-2">
              <div className="h-8 w-28 bg-slate-200 dark:bg-white/10 rounded-lg" />
              <div className="h-2.5 w-20 bg-slate-100 dark:bg-white/5 rounded-full" />
            </div>
          </div>
        ))}
      </div>

      {/* Skeleton Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7 bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] h-80 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="h-4 w-36 bg-slate-200 dark:bg-white/10 rounded-full" />
            <div className="h-4 w-20 bg-slate-100 dark:bg-white/5 rounded-full" />
          </div>
          <div className="h-44 bg-slate-50 dark:bg-white/[0.02] border border-slate-100 dark:border-white/5 rounded-2xl flex items-end justify-between p-4 gap-3">
            {[40, 65, 30, 85, 55, 90, 70].map((h, idx) => (
              <div
                key={idx}
                className="flex-1 bg-slate-200/80 dark:bg-white/10 rounded-t-lg"
                style={{ height: `${h}%` }}
              />
            ))}
          </div>
        </div>
        <div className="lg:col-span-5 bg-white dark:bg-white/5 border border-slate-200/80 dark:border-white/10 rounded-3xl p-6 shadow-[0_4px_20px_rgba(0,0,0,0.03)] h-80 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <div className="h-4 w-32 bg-slate-200 dark:bg-white/10 rounded-full" />
            <div className="h-4 w-16 bg-slate-100 dark:bg-white/5 rounded-full" />
          </div>
          <div className="flex items-center justify-center h-44">
            <div className="w-28 h-28 rounded-full border-4 border-slate-200/70 dark:border-white/10 border-t-blue-500 animate-spin" />
          </div>
        </div>
      </div>
    </div>
  );
}
