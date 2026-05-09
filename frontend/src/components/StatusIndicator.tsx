import { motion } from 'framer-motion';
import type { AssistantStatus } from '../types';

const statusConfig: Record<AssistantStatus, { label: string; color: string; dot: string }> = {
  idle:          { label: 'Idle',          color: 'text-slate-400', dot: 'bg-slate-500' },
  listening:     { label: 'Listening',     color: 'text-emerald-400', dot: 'bg-emerald-400' },
  thinking:      { label: 'Thinking',      color: 'text-sky-400', dot: 'bg-sky-400' },
  executing:     { label: 'Executing',     color: 'text-amber-400', dot: 'bg-amber-400' },
  reading_screen:{ label: 'Reading Screen',color: 'text-cyan-400', dot: 'bg-cyan-400' },
  speaking:      { label: 'Speaking',      color: 'text-teal-400', dot: 'bg-teal-400' },
  error:         { label: 'Error',         color: 'text-red-400', dot: 'bg-red-400' },
};

interface StatusIndicatorProps {
  status: AssistantStatus;
  size?: 'sm' | 'md' | 'lg';
}

export function StatusIndicator({ status, size = 'md' }: StatusIndicatorProps) {
  const cfg = statusConfig[status];
  const dotSize = size === 'sm' ? 'w-1.5 h-1.5' : size === 'lg' ? 'w-3 h-3' : 'w-2 h-2';
  const textSize = size === 'sm' ? 'text-xs' : size === 'lg' ? 'text-base' : 'text-sm';
  const pulse = status !== 'idle' && status !== 'error';

  return (
    <div className={`flex items-center gap-2 ${cfg.color}`}>
      <div className="relative flex items-center justify-center">
        <div className={`${dotSize} rounded-full ${cfg.dot}`} />
        {pulse && (
          <motion.div
            className={`absolute ${dotSize} rounded-full ${cfg.dot} opacity-60`}
            animate={{ scale: [1, 2.2, 1], opacity: [0.6, 0, 0.6] }}
            transition={{ duration: 1.4, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>
      <span className={`font-medium tracking-wide uppercase ${textSize}`}>{cfg.label}</span>
    </div>
  );
}
