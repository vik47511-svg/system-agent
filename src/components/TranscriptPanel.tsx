import { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, Settings2 } from 'lucide-react';
import type { TranscriptEntry } from '../types';
import { formatTimestamp } from '../utils/formatters';

const typeConfig = {
  user:      { icon: User,     label: 'You',    bg: 'bg-slate-700/40', border: 'border-slate-600/30', text: 'text-slate-200' },
  assistant: { icon: Bot,      label: 'Atlas',  bg: 'bg-sky-900/30',   border: 'border-sky-500/20',   text: 'text-sky-100' },
  system:    { icon: Settings2,label: 'System', bg: 'bg-slate-800/40', border: 'border-slate-700/30', text: 'text-slate-400' },
};

function TranscriptItem({ entry }: { entry: TranscriptEntry }) {
  const cfg = typeConfig[entry.type];
  const Icon = cfg.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      className={`flex gap-3 p-3 rounded-xl border ${cfg.bg} ${cfg.border}`}
    >
      <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
        entry.type === 'assistant' ? 'bg-sky-600/40' : entry.type === 'user' ? 'bg-slate-600/50' : 'bg-slate-700/50'
      }`}>
        <Icon className="w-3.5 h-3.5 text-slate-300" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2 mb-1">
          <span className="text-xs font-semibold text-slate-400">{cfg.label}</span>
          <span className="text-xs text-slate-600">{formatTimestamp(entry.timestamp)}</span>
        </div>
        <p className={`text-sm leading-relaxed ${cfg.text}`}>
          {entry.isStreaming ? (
            <>
              {entry.text}
              <motion.span
                className="inline-block w-0.5 h-4 bg-sky-400 ml-0.5 align-middle"
                animate={{ opacity: [1, 0, 1] }}
                transition={{ duration: 0.8, repeat: Infinity }}
              />
            </>
          ) : (
            entry.text
          )}
        </p>
      </div>
    </motion.div>
  );
}

interface TranscriptPanelProps {
  entries: TranscriptEntry[];
  className?: string;
}

export function TranscriptPanel({ entries, className = '' }: TranscriptPanelProps) {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [entries.length]);

  return (
    <div className={`flex flex-col gap-2 overflow-y-auto custom-scrollbar ${className}`}>
      <AnimatePresence initial={false}>
        {entries.map((entry) => (
          <TranscriptItem key={entry.id} entry={entry} />
        ))}
      </AnimatePresence>
      <div ref={bottomRef} />
    </div>
  );
}
