import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, CheckCircle2, AlertCircle, Clock, ChevronDown, ChevronUp, RefreshCw, User } from 'lucide-react';
import { useAssistantStore } from '../store/useAssistantStore';
import { WorkflowCard } from '../components/WorkflowCard';
import { ExecutionTimeline } from '../components/ExecutionTimeline';
import { formatRelativeTime } from '../utils/formatters';
import type { Workflow } from '../types';

const statusIcon = {
  active:    <Play className="w-3.5 h-3.5 text-amber-400" />,
  completed: <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />,
  failed:    <AlertCircle className="w-3.5 h-3.5 text-red-400" />,
  queued:    <Clock className="w-3.5 h-3.5 text-sky-400" />,
};

function WorkflowRow({ wf, isSelected, onSelect }: { wf: Workflow; isSelected: boolean; onSelect: () => void }) {
  const completed = wf.steps.filter((s) => s.status === 'completed').length;
  const progress = Math.round((completed / wf.steps.length) * 100);

  return (
    <motion.div
      layout
      className={`rounded-xl border transition-all cursor-pointer ${
        isSelected
          ? 'border-sky-500/40 bg-sky-500/5'
          : 'border-slate-700/40 bg-slate-800/30 hover:bg-slate-800/50'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-center gap-4 p-4">
        <div className="flex-shrink-0">{statusIcon[wf.status]}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-200 truncate">{wf.name}</span>
          </div>
          <div className="flex items-center gap-2 mt-1 text-xs text-slate-400">
            <User className="w-3 h-3" />
            <span>{wf.customer}</span>
            <span className="text-slate-600">·</span>
            <span>{formatRelativeTime(wf.startedAt)}</span>
          </div>
        </div>
        <div className="flex items-center gap-4 flex-shrink-0">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white">{progress}%</p>
            <p className="text-xs text-slate-500">{completed}/{wf.steps.length} steps</p>
          </div>
          {isSelected ? (
            <ChevronUp className="w-4 h-4 text-slate-500" />
          ) : (
            <ChevronDown className="w-4 h-4 text-slate-500" />
          )}
        </div>
      </div>

      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden border-t border-slate-700/40"
          >
            <div className="p-4">
              <ExecutionTimeline steps={wf.steps} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

export function WorkflowActivity() {
  const { workflows, activeWorkflow, setActiveWorkflow } = useAssistantStore();
  const [selectedId, setSelectedId] = useState<string | null>(activeWorkflow?.id ?? null);
  const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'failed' | 'queued'>('all');

  const filtered = workflows.filter((w) => filter === 'all' || w.status === filter);

  const counts = {
    all:       workflows.length,
    active:    workflows.filter((w) => w.status === 'active').length,
    completed: workflows.filter((w) => w.status === 'completed').length,
    failed:    workflows.filter((w) => w.status === 'failed').length,
    queued:    workflows.filter((w) => w.status === 'queued').length,
  };

  const detailWf = workflows.find((w) => w.id === selectedId);

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Workflow Activity</h1>
          <p className="text-sm text-slate-400 mt-1">Step-by-step execution monitor</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-sm text-slate-300 hover:bg-slate-800 transition-colors">
          <RefreshCw className="w-3.5 h-3.5" />
          Refresh
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2">
        {(['all', 'active', 'completed', 'failed', 'queued'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
              filter === f
                ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                : 'text-slate-400 hover:text-slate-200 bg-slate-800/40 border border-slate-700/30'
            }`}
          >
            {f} <span className="ml-1 opacity-60">({counts[f]})</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-12 gap-5">
        {/* Workflow list */}
        <div className="col-span-7 space-y-3">
          <AnimatePresence>
            {filtered.map((wf) => (
              <WorkflowRow
                key={wf.id}
                wf={wf}
                isSelected={selectedId === wf.id}
                onSelect={() => {
                  setSelectedId(selectedId === wf.id ? null : wf.id);
                  setActiveWorkflow(wf);
                }}
              />
            ))}
          </AnimatePresence>
        </div>

        {/* Detail panel */}
        <div className="col-span-5">
          <AnimatePresence mode="wait">
            {detailWf ? (
              <motion.div
                key={detailWf.id}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                <WorkflowCard workflow={detailWf} />
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="glass-card rounded-xl p-8 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center mx-auto mb-3">
                  <Play className="w-5 h-5 text-slate-600" />
                </div>
                <p className="text-sm text-slate-400">Select a workflow to see execution details</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
