import React from 'react';
import { useTrading } from '../../context/TradingContext';
import { CheckSquare, Plus, Sparkles } from 'lucide-react';

export const FloatingTaskButton: React.FC = () => {
  const { setQuickTaskModalOpen, tasks } = useTrading();

  const pendingCount = tasks.filter((t) => !t.completed).length;
  const urgentCount = tasks.filter((t) => !t.completed && t.priority === 'urgent').length;

  return (
    <div className="fixed bottom-20 md:bottom-8 right-4 sm:right-8 z-40 group">
      <button
        type="button"
        id="fab-quick-add-task"
        onClick={() => setQuickTaskModalOpen(true)}
        className="relative flex items-center gap-2.5 px-3.5 sm:px-4 py-3 rounded-full bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-xs sm:text-sm shadow-xl shadow-emerald-500/30 hover:shadow-emerald-500/50 hover:scale-105 active:scale-95 transition-all cursor-pointer border border-emerald-300/40"
        title="Quick Add Task (TodoList)"
        aria-label="Quick Add Task"
      >
        <div className="relative">
          <Plus className="w-5 h-5 stroke-[2.5]" />
          {urgentCount > 0 && (
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-rose-500 ring-2 ring-slate-950 animate-ping" />
          )}
        </div>

        <span className="font-extrabold tracking-tight hidden sm:inline">
          New Task
        </span>

        {pendingCount > 0 && (
          <span className="px-1.5 py-0.5 rounded-full bg-slate-950/80 text-emerald-400 text-[10px] font-mono font-bold border border-emerald-500/30">
            {pendingCount}
          </span>
        )}
      </button>
    </div>
  );
};
