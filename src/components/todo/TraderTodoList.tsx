import React, { useState, useMemo } from 'react';
import { useTrading } from '../../context/TradingContext';
import { TodoTask, TaskPriority } from '../../types';
import { 
  CheckSquare, 
  Square, 
  Trash2, 
  Plus, 
  Clock, 
  Tag, 
  AlertTriangle, 
  CheckCircle2, 
  ListTodo,
  Sparkles,
  ChevronRight
} from 'lucide-react';

export const TraderTodoList: React.FC = () => {
  const { tasks, toggleTask, deleteTask, setQuickTaskModalOpen } = useTrading();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const filteredTasks = useMemo(() => {
    return tasks.filter((t) => {
      if (filter === 'pending') return !t.completed;
      if (filter === 'completed') return t.completed;
      return true;
    });
  }, [tasks, filter]);

  const total = tasks.length;
  const completedCount = tasks.filter((t) => t.completed).length;
  const percent = total > 0 ? Math.round((completedCount / total) * 100) : 0;

  const priorityStyles: Record<TaskPriority, { badge: string; dot: string }> = {
    urgent: { badge: 'bg-rose-500/20 text-rose-400 border-rose-500/30', dot: 'bg-rose-500' },
    high: { badge: 'bg-amber-500/20 text-amber-400 border-amber-500/30', dot: 'bg-amber-400' },
    medium: { badge: 'bg-sky-500/20 text-sky-400 border-sky-500/30', dot: 'bg-sky-400' },
    low: { badge: 'bg-slate-800 text-slate-400 border-slate-700', dot: 'bg-slate-500' },
  };

  return (
    <div className="glass-panel rounded-2xl p-4 sm:p-6 border border-slate-700/60 shadow-xl space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold">
            <ListTodo className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-100 flex items-center gap-2">
              <span>Trader Checklist & Action Items</span>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-[10px] font-mono font-bold text-emerald-400">
                {completedCount}/{total} Done
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Daily trading checkpoints, risk compliance reviews, and settlement authorizations
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick Add Button in Header */}
          <button
            type="button"
            onClick={() => setQuickTaskModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition-all shadow-md shadow-emerald-500/20 cursor-pointer shrink-0"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Task</span>
          </button>
        </div>
      </div>

      {/* Progress Bar & Filter Pills */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Progress Bar */}
        <div className="flex items-center gap-2.5 flex-1 max-w-xs">
          <div className="flex-1 h-2 rounded-full bg-slate-800 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
              style={{ width: `${percent}%` }}
            />
          </div>
          <span className="text-[11px] font-mono font-bold text-slate-400">
            {percent}%
          </span>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-xl border border-slate-800 self-start sm:self-auto">
          {(['all', 'pending', 'completed'] as const).map((mode) => (
            <button
              key={mode}
              type="button"
              onClick={() => setFilter(mode)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer capitalize ${
                filter === mode
                  ? 'bg-slate-800 text-slate-100 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {mode}
            </button>
          ))}
        </div>
      </div>

      {/* Task List */}
      <div className="divide-y divide-slate-800/60 max-h-80 overflow-y-auto pr-1">
        {filteredTasks.length === 0 ? (
          <div className="py-8 text-center text-slate-500 text-xs space-y-2">
            <CheckCircle2 className="w-6 h-6 text-slate-600 mx-auto" />
            <div>No tasks found under "{filter}".</div>
            <button
              type="button"
              onClick={() => setQuickTaskModalOpen(true)}
              className="text-emerald-400 hover:underline font-semibold cursor-pointer"
            >
              Create a new task now &rarr;
            </button>
          </div>
        ) : (
          filteredTasks.map((task) => {
            const style = priorityStyles[task.priority] || priorityStyles.medium;
            return (
              <div
                key={task.id}
                className="py-3 px-2 flex items-start justify-between gap-3 hover:bg-slate-800/40 rounded-xl transition-all group"
              >
                {/* Left: Checkbox & Title */}
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={() => toggleTask(task.id)}
                    className="mt-0.5 text-slate-400 hover:text-emerald-400 transition-colors cursor-pointer shrink-0"
                    title={task.completed ? 'Mark pending' : 'Mark completed'}
                  >
                    {task.completed ? (
                      <CheckSquare className="w-4 h-4 text-emerald-400" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-500 hover:text-slate-300" />
                    )}
                  </button>

                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        onClick={() => toggleTask(task.id)}
                        className={`text-xs sm:text-sm font-semibold cursor-pointer transition-colors ${
                          task.completed
                            ? 'line-through text-slate-500'
                            : 'text-slate-200 hover:text-emerald-300'
                        }`}
                      >
                        {task.title}
                      </span>

                      {/* Priority Badge */}
                      <span className={`px-2 py-0.2 rounded text-[9px] font-extrabold border uppercase tracking-wider ${style.badge}`}>
                        {task.priority}
                      </span>

                      {/* Category Badge */}
                      <span className="px-2 py-0.2 rounded bg-slate-800/80 text-slate-400 border border-slate-700/60 text-[9px] font-medium">
                        {task.category}
                      </span>
                    </div>

                    {task.description && (
                      <p className={`text-[11px] leading-relaxed truncate ${task.completed ? 'text-slate-600' : 'text-slate-400'}`}>
                        {task.description}
                      </p>
                    )}

                    {task.dueDate && (
                      <div className="flex items-center gap-1 text-[10px] text-slate-500">
                        <Clock className="w-3 h-3" />
                        <span>Due: {task.dueDate}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Actions */}
                <div className="flex items-center gap-1.5 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => deleteTask(task.id)}
                    className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
