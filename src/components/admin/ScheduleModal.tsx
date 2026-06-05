import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, X, Clock, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

interface ScheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSchedule: (dateIso: string) => void;
  initialDate?: string | null;
  toolTitle: string;
}

export default function ScheduleModal({
  isOpen,
  onClose,
  onSchedule,
  initialDate,
  toolTitle
}: ScheduleModalProps) {
  const [dateVal, setDateVal] = useState('');
  const [timeVal, setTimeVal] = useState('12:00');

  useEffect(() => {
    if (initialDate) {
      try {
        const d = new Date(initialDate);
        const yyyy = d.getFullYear();
        const mm = String(d.getMonth() + 1).padStart(2, '0');
        const dd = String(d.getDate()).padStart(2, '0');
        setDateVal(`${yyyy}-${mm}-${dd}`);
        
        const hh = String(d.getHours()).padStart(2, '0');
        const min = String(d.getMinutes()).padStart(2, '0');
        setTimeVal(`${hh}:${min}`);
      } catch (e) {
        setDefaultDateTime();
      }
    } else {
      setDefaultDateTime();
    }
  }, [initialDate, isOpen]);

  const setDefaultDateTime = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    setDateVal(`${yyyy}-${mm}-${dd}`);
    setTimeVal('09:00');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!dateVal || !timeVal) {
      toast.error('Please select both a date and a time.');
      return;
    }

    const targetStr = `${dateVal}T${timeVal}`;
    const selectedDate = new Date(targetStr);
    
    if (isNaN(selectedDate.getTime())) {
      toast.error('Invalid date or time selected.');
      return;
    }

    if (selectedDate <= new Date()) {
      toast.error('Please choose a future date and time for scheduling.');
      return;
    }

    onSchedule(selectedDate.toISOString());
    toast.success('Tool publication scheduled successfully.');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-sm p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="w-full max-w-md glass border border-white/10 p-6 sm:p-8 rounded-[2.5rem] shadow-2xl relative"
          >
            <button
              onClick={onClose}
              className="absolute top-6 right-6 p-2 border border-white/5 hover:border-white/20 rounded-xl text-gray-500 hover:text-white transition-all cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-3 mb-6">
              <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-400 flex items-center justify-center">
                <Calendar className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-black text-white uppercase tracking-widest">Schedule Tool</h3>
                <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mt-0.5 max-w-[280px] truncate">
                  {toolTitle}
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5 pl-0.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-500" /> Target Date
                </label>
                <input
                  type="date"
                  value={dateVal}
                  onChange={(e) => setDateVal(e.target.value)}
                  className="w-full bg-[#0a0d17] border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-white outline-none focus:border-blue-500/50 cursor-pointer"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-1.5 pl-0.5">
                  <Clock className="w-3.5 h-3.5 text-purple-500" /> Target Time
                </label>
                <input
                  type="time"
                  value={timeVal}
                  onChange={(e) => setTimeVal(e.target.value)}
                  className="w-full bg-[#0a0d17] border border-white/10 rounded-2xl px-5 py-3.5 text-sm font-bold text-white outline-none focus:border-blue-500/50 cursor-pointer"
                  required
                />
              </div>

              {/* Warning box */}
              <div className="flex gap-3 p-4 bg-purple-500/5 border border-purple-500/10 rounded-2xl text-[10px] text-purple-300 leading-normal font-semibold">
                <AlertTriangle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>
                  This tool will automatically become publicly visible and search-indexable on the live portal when the specified time arrives.
                </span>
              </div>

              <div className="flex gap-3 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={onClose}
                  className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-gray-400 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 text-xs font-black uppercase tracking-widest text-white bg-purple-600 hover:bg-purple-500 rounded-2xl transition-all shadow-[0_0_20px_rgba(168,85,247,0.3)] cursor-pointer"
                >
                  Confirm Schedule
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
