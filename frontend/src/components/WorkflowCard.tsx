import { motion } from 'framer-motion';
import { CheckCircle2, Circle, Loader2, XCircle, Clock } from 'lucide-react';
import type { Workflow, WorkflowStep, WorkflowStepStatus } from '../types';
import { formatRelativeTime } from '../utils/formatters';

const stepIcon: Record<WorkflowStepStatus, JSX.Element> = {
  pending:   <Circle className="w-4 h-4 text-slate-500" />,
  running:   <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />,
  completed: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
  error:     <XCircle className="w-4 h-4 text-red-400" />,
};

function StepRow({ step, index }: { step: WorkflowStep; index: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={`flex items-start gap-3 py-2 px-3 rounded-lg transition-colors ${
        step.status === 'running'
          ? 'bg-amber-500/10 border border-amber-500/20'
          : step.status === 'completed'
          ? 'bg-emerald-500/5'
          : 'opacity-50'
      }`}
    >
      <div className="mt-0.5 flex-shrink-0">{stepIcon[step.status]}</div>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium ${step.status === 'pending' ? 'text-slate-500' : 'text-slate-200'}`}>
          {step.label}
        </p>
        <p className="text-xs text-slate-500 mt-0.5 truncate">{step.description}</p>
      </div>
      {step.status === 'running' && (
        <motion.div
          className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-1.5 flex-shrink-0"
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 0.8, repeat: Infinity }}
        />
      )}
    </motion.div>
  );
}

interface WorkflowCardProps {
  workflow: Workflow;
  compact?: boolean;
}

export function WorkflowCard({ workflow, compact = false }: WorkflowCardProps) {
  const completedSteps = workflow.steps.filter((s) => s.status === 'completed').length;
  const progress = (completedSteps / workflow.steps.length) * 100;

  const statusColors: Record<Workflow['status'], string> = {
    active:    'text-amber-400 bg-amber-400/10 border-amber-400/20',
    completed: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    failed:    'text-red-400 bg-red-400/10 border-red-400/20',
    queued:    'text-sky-400 bg-sky-400/10 border-sky-400/20',
  };

  return (
    <div className="glass-card rounded-xl p-4 space-y-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-semibold text-slate-100 truncate">{workflow.name}</h3>
          <p className="text-xs text-slate-400 mt-0.5">{workflow.customer}</p>
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full border capitalize flex-shrink-0 ${statusColors[workflow.status]}`}>
          {workflow.status}
        </span>
      </div>

      {/* Progress */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>{completedSteps}/{workflow.steps.length} steps</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-1.5 bg-slate-700/60 rounded-full overflow-hidden">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-500"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
          />
        </div>
      </div>

      {!compact && (
        <div className="space-y-1">
          {workflow.steps.map((step, i) => (
            <StepRow key={step.id} step={step} index={i} />
          ))}
        </div>
      )}

      <div className="flex items-center gap-1.5 text-xs text-slate-500">
        <Clock className="w-3.5 h-3.5" />
        <span>Started {formatRelativeTime(workflow.startedAt)}</span>
      </div>
    </div>
  );
}
