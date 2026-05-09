import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2, XCircle, AlertTriangle, Loader2,
  RefreshCw, Search, Filter, Download, ChevronDown, ChevronUp,
} from 'lucide-react';
import { useAssistantStore } from '../store/useAssistantStore';
import { formatRelativeTime, formatDuration } from '../utils/formatters';
import type { AutomationLog } from '../types';

const statusConfig = {
  success: { icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-emerald-400', bg: 'bg-emerald-500/10', border: 'border-emerald-500/20' },
  failed:  { icon: <XCircle className="w-4 h-4" />,      color: 'text-red-400',     bg: 'bg-red-500/10',     border: 'border-red-500/20' },
  partial: { icon: <AlertTriangle className="w-4 h-4" />,color: 'text-amber-400',   bg: 'bg-amber-500/10',   border: 'border-amber-500/20' },
  running: { icon: <Loader2 className="w-4 h-4 animate-spin" />, color: 'text-sky-400', bg: 'bg-sky-500/10', border: 'border-sky-500/20' },
};

function LogRow({ log }: { log: AutomationLog }) {
  const [expanded, setExpanded] = useState(false);
  const cfg = statusConfig[log.status];
  const progressPct = Math.round((log.completedSteps / log.steps) * 100);

  return (
    <motion.div
      layout
      className="rounded-xl border border-slate-700/40 bg-slate-800/30 overflow-hidden"
    >
      <div
        className="flex items-center gap-4 p-4 cursor-pointer hover:bg-slate-800/50 transition-colors"
        onClick={() => setExpanded((v) => !v)}
      >
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg} ${cfg.color}`}>
          {cfg.icon}
        </div>

        <div className="flex-1 min-w-0 grid grid-cols-4 gap-4 items-center">
          <div className="col-span-2 min-w-0">
            <p className="text-sm font-medium text-slate-200 truncate">{log.workflowName}</p>
            <p className="text-xs text-slate-500 mt-0.5">{log.customer}</p>
          </div>

          <div className="space-y-1 hidden md:block">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{log.completedSteps}/{log.steps}</span>
              <span>{progressPct}%</span>
            </div>
            <div className="h-1 bg-slate-700/60 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${
                  log.status === 'success' ? 'bg-emerald-500' :
                  log.status === 'failed' ? 'bg-red-500' :
                  log.status === 'partial' ? 'bg-amber-500' : 'bg-sky-500'
                }`}
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          <div className="text-right hidden lg:block">
            <p className="text-xs text-slate-400">{formatRelativeTime(log.startedAt)}</p>
            {log.duration && <p className="text-xs text-slate-600 mt-0.5">{formatDuration(log.duration * 1000)}</p>}
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          {log.retryCount > 0 && (
            <span className="flex items-center gap-1 text-xs text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20">
              <RefreshCw className="w-3 h-3" />
              {log.retryCount}x
            </span>
          )}
          <span className={`text-xs font-medium capitalize px-2 py-0.5 rounded-full border ${cfg.bg} ${cfg.color} ${cfg.border}`}>
            {log.status}
          </span>
          {expanded ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
        </div>
      </div>

      {expanded && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          className="border-t border-slate-700/40 px-4 py-3 bg-slate-900/30"
        >
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Workflow ID</span>
                <span className="text-slate-300 font-mono">{log.workflowId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Started</span>
                <span className="text-slate-300">{new Date(log.startedAt).toLocaleString()}</span>
              </div>
              {log.completedAt && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Completed</span>
                  <span className="text-slate-300">{new Date(log.completedAt).toLocaleString()}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Duration</span>
                <span className="text-slate-300">{log.duration ? formatDuration(log.duration * 1000) : '—'}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-slate-500">Steps Completed</span>
                <span className="text-slate-300">{log.completedSteps} / {log.steps}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Retry Attempts</span>
                <span className={log.retryCount > 0 ? 'text-amber-400' : 'text-slate-300'}>{log.retryCount}</span>
              </div>
              {log.errorMessage && (
                <div className="col-span-2 mt-2 p-2 rounded-lg bg-red-500/10 border border-red-500/20">
                  <p className="text-red-400 text-xs">{log.errorMessage}</p>
                </div>
              )}
            </div>
          </div>
          {log.errorMessage && (
            <div className="mt-3 p-2.5 rounded-lg bg-red-500/10 border border-red-500/20">
              <p className="text-xs font-medium text-red-400 mb-0.5">Error Details</p>
              <p className="text-xs text-red-300/80">{log.errorMessage}</p>
            </div>
          )}
        </motion.div>
      )}
    </motion.div>
  );
}

export function AutomationLogs() {
  const { logs } = useAssistantStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = logs.filter((l) => {
    const matchSearch = l.customer.toLowerCase().includes(search.toLowerCase()) ||
      l.workflowName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || l.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const counts = {
    total: logs.length,
    success: logs.filter((l) => l.status === 'success').length,
    failed: logs.filter((l) => l.status === 'failed').length,
    partial: logs.filter((l) => l.status === 'partial').length,
    running: logs.filter((l) => l.status === 'running').length,
  };

  return (
    <div className="p-6 space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Automation Logs</h1>
          <p className="text-sm text-slate-400 mt-1">Full execution history with retry tracking</p>
        </div>
        <button className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/60 border border-slate-700/50 text-sm text-slate-300 hover:bg-slate-800 transition-colors">
          <Download className="w-3.5 h-3.5" />
          Export
        </button>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'Total Runs',  value: counts.total,   color: 'text-slate-300' },
          { label: 'Successful',  value: counts.success, color: 'text-emerald-400' },
          { label: 'Failed',      value: counts.failed,  color: 'text-red-400' },
          { label: 'Partial',     value: counts.partial, color: 'text-amber-400' },
        ].map(({ label, value, color }) => (
          <div key={label} className="glass-card rounded-xl p-4 text-center">
            <p className={`text-2xl font-bold ${color}`}>{value}</p>
            <p className="text-xs text-slate-500 mt-1">{label}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by customer or workflow..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-slate-800/60 border border-slate-700/50 text-sm text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-sky-500/50 focus:bg-slate-800"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          {(['all', 'success', 'failed', 'partial', 'running'] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-xl text-xs font-medium capitalize transition-all ${
                statusFilter === s
                  ? 'bg-sky-500/20 text-sky-300 border border-sky-500/30'
                  : 'text-slate-400 bg-slate-800/40 border border-slate-700/30 hover:text-slate-200'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Log list */}
      <div className="space-y-2">
        {filtered.length === 0 ? (
          <div className="text-center py-12 text-slate-500">No logs matching your filter.</div>
        ) : (
          filtered.map((log) => <LogRow key={log.id} log={log} />)
        )}
      </div>
    </div>
  );
}
