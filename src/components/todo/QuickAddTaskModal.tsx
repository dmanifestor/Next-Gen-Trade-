import React, { useState } from 'react';
import { useTrading } from '../../context/TradingContext';
import { Modal } from '../ui/Modal';
import { TaskPriority, TaskCategory } from '../../types';
import { 
  CheckSquare, 
  Calendar, 
  Tag, 
  AlertTriangle, 
  FileText, 
  Plus, 
  Sparkles,
  Clock,
  ShieldCheck
} from 'lucide-react';

interface QuickAddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickAddTaskModal: React.FC<QuickAddTaskModalProps> = ({ isOpen, onClose }) => {
  const { addTask } = useTrading();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<TaskPriority>('medium');
  const [category, setCategory] = useState<TaskCategory>('Trading');
  const [dueDate, setDueDate] = useState('Today');

  const categories: TaskCategory[] = ['Trading', 'Compliance', 'Security', 'Analysis', 'General'];
  const priorities: { id: TaskPriority; label: string; color: string; badgeBg: string }[] = [
    { id: 'low', label: 'Low', color: 'text-slate-400', badgeBg: 'bg-slate-800 border-slate-700' },
    { id: 'medium', label: 'Medium', color: 'text-sky-400', badgeBg: 'bg-sky-500/20 border-sky-500/40' },
    { id: 'high', label: 'High', color: 'text-amber-400', badgeBg: 'bg-amber-500/20 border-amber-500/40' },
    { id: 'urgent', label: 'Urgent', color: 'text-rose-400', badgeBg: 'bg-rose-500/20 border-rose-500/40' },
  ];

  const quickDueOptions = ['Today', 'Tomorrow', 'In 3 Days', 'Next Week'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addTask({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      category,
      dueDate: dueDate || undefined,
      completed: false,
    });

    // Reset form
    setTitle('');
    setDescription('');
    setPriority('medium');
    setCategory('Trading');
    setDueDate('Today');
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Trader Task"
      subtitle="Quickly organize action items, trade reviews, and compliance checkpoints"
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Task Title */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
            <span>Task Title *</span>
            <span className="text-[10px] text-slate-500">Required</span>
          </label>
          <div className="relative">
            <input
              type="text"
              required
              autoFocus
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Review TRC20 Outbound Clearance ($15,000.00)"
              className="glass-input w-full px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium placeholder:text-slate-500 focus:border-emerald-500"
            />
          </div>
        </div>

        {/* Category Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Tag className="w-3.5 h-3.5 text-emerald-400" />
            <span>Category</span>
          </label>
          <div className="flex flex-wrap gap-1.5">
            {categories.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  category === cat
                    ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Priority Selection */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            <span>Priority Level</span>
          </label>
          <div className="grid grid-cols-4 gap-2">
            {priorities.map((p) => {
              const isSelected = priority === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => setPriority(p.id)}
                  className={`py-2 px-2.5 rounded-xl text-xs font-bold border transition-all text-center cursor-pointer ${
                    isSelected
                      ? `${p.badgeBg} ${p.color} ring-1 ring-current`
                      : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Due Date & Quick Shortcuts */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-sky-400" />
            <span>Due Date</span>
          </label>
          <div className="flex flex-wrap items-center gap-1.5">
            {quickDueOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setDueDate(opt)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  dueDate === opt
                    ? 'bg-sky-500/20 text-sky-300 border border-sky-500/40'
                    : 'bg-slate-900/80 hover:bg-slate-800 text-slate-400 border border-slate-800'
                }`}
              >
                {opt}
              </button>
            ))}
            <input
              type="text"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              placeholder="Or custom date..."
              className="glass-input flex-1 min-w-[120px] px-2.5 py-1 rounded-lg text-xs font-medium placeholder:text-slate-500"
            />
          </div>
        </div>

        {/* Notes / Description */}
        <div>
          <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>Notes & Context (Optional)</span>
          </label>
          <textarea
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add relevant notes, contract addresses, or operational checkpoints..."
            className="glass-input w-full px-3.5 py-2 rounded-xl text-xs font-medium placeholder:text-slate-500 resize-none"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-3 border-t border-slate-800">
          <button
            type="submit"
            disabled={!title.trim()}
            className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs sm:text-sm transition-all shadow-lg shadow-emerald-500/20 active:scale-95 flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
          >
            <Plus className="w-4 h-4" />
            <span>Add Task</span>
          </button>
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </form>
    </Modal>
  );
};
