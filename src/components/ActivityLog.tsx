import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, Loader2, Download, Lock, UserCheck } from 'lucide-react';
import type { RecentAction } from '../types';
import { formatRelativeTime } from '../utils/formatters';

const iconMap: Record<string, JSX.Element> = {
  download:   <Download className="w-3.5 h-3.5" />,
  'check-circle': <CheckCircle2 className="w-3.5 h-3.5" />,
  'x-circle': <XCircle className="w-3.5 h-3.5" />,
  'user-check': <UserCheck className="w-3.5 h-3.5" />,
  lock:       <Lock className="w-3.5 h-3.5" />,
};

const statusColors = {
  success: 'text-emerald-400 bg-emerald-500/10',
  failed:  'text-red-400 bg-red-500/10',
  running: 'text-amber-400 bg-amber-500/10',
};

interface ActivityLogProps {
  actions: RecentAction[];
  limit?: number;
}

export function ActivityLog({ actions, limit }: ActivityLogProps) {
  const items = limit ? actions.slice(0, limit) : actions;

  return (
    <div className="space-y-1.5">
      {items.map((action, i) => (
        <motion.div
          key={action.id}
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: i * 0.04 }}
          className="flex items-center gap-3 p-2.5 rounded-lg bg-slate-800/40 border border-slate-700/30 hover:bg-slate-800/60 transition-colors"
        >
          <div className={`w-6 h-6 rounded-lg flex items-center justify-center flex-shrink-0 ${statusColors[action.status]}`}>
            {action.status === 'running'
              ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
              : (iconMap[action.icon] ?? <CheckCircle2 className="w-3.5 h-3.5" />)}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-slate-300 truncate">{action.action}</p>
            {action.customer && (
              <p className="text-xs text-slate-500 truncate">{action.customer}</p>
            )}
          </div>
          <span className="text-xs text-slate-600 flex-shrink-0">{formatRelativeTime(action.timestamp)}</span>
        </motion.div>
      ))}
    </div>
  );
}
