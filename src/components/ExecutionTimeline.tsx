import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Loader2, XCircle } from 'lucide-react';
import type { WorkflowStep, WorkflowStepStatus } from '../types';

const iconMap: Record<WorkflowStepStatus, { icon: JSX.Element; line: string }> = {
  completed: { icon: <CheckCircle2 className="w-5 h-5 text-emerald-400" />, line: 'bg-emerald-500/50' },
  running:   { icon: <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />, line: 'bg-amber-500/30' },
  pending:   { icon: <Circle className="w-5 h-5 text-slate-600" />, line: 'bg-slate-700/50' },
  error:     { icon: <XCircle className="w-5 h-5 text-red-400" />, line: 'bg-red-500/30' },
};

interface ExecutionTimelineProps {
  steps: WorkflowStep[];
}

export function ExecutionTimeline({ steps }: ExecutionTimelineProps) {
  return (
    <div className="space-y-0">
      {steps.map((step, i) => {
        const { icon, line } = iconMap[step.status];
        const isLast = i === steps.length - 1;

        return (
          <motion.div
            key={step.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex gap-4"
          >
            {/* Timeline column */}
            <div className="flex flex-col items-center">
              <div className={`flex-shrink-0 mt-1 transition-all duration-300 ${
                step.status === 'running' ? 'drop-shadow-[0_0_6px_rgba(245,158,11,0.8)]' : ''
              }`}>
                {icon}
              </div>
              {!isLast && (
                <div className={`w-0.5 flex-1 my-1 min-h-[20px] ${line} transition-colors duration-500`} />
              )}
            </div>

            {/* Content */}
            <div className={`pb-4 flex-1 ${isLast ? '' : ''}`}>
              <div className={`text-sm font-medium ${
                step.status === 'pending' ? 'text-slate-500' :
                step.status === 'running' ? 'text-amber-300' :
                step.status === 'error' ? 'text-red-300' : 'text-slate-200'
              }`}>
                {step.label}
              </div>
              <div className="text-xs text-slate-500 mt-0.5">{step.description}</div>
              {step.status === 'running' && (
                <motion.div
                  className="mt-2 h-0.5 bg-gradient-to-r from-amber-500 to-transparent rounded-full"
                  animate={{ width: ['0%', '80%', '0%'] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
                  style={{ width: '60%' }}
                />
              )}
              {step.status === 'completed' && step.duration && (
                <span className="text-xs text-emerald-600 mt-1 block">
                  {(step.duration / 1000).toFixed(1)}s
                </span>
              )}
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
