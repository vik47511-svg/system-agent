import { motion, AnimatePresence } from 'framer-motion';
import type { OverlayState } from '../types';

const STATE_COLORS: Record<OverlayState, string> = {
  idle:      'rgba(148,163,184,0.9)',
  listening: '#10b981',
  thinking:  '#38bdf8',
  speaking:  '#2dd4bf',
  executing: '#fbbf24',
};

const STATE_DOTS: Record<OverlayState, string> = {
  idle:      'rgba(100,116,139,0.7)',
  listening: '#10b981',
  thinking:  '#0ea5e9',
  speaking:  '#14b8a6',
  executing: '#f59e0b',
};

interface StateLabelProps {
  state: OverlayState;
  label: string;
}

export function StateLabel({ state, label }: StateLabelProps) {
  const color = STATE_COLORS[state];
  const dotColor = STATE_DOTS[state];
  const isPulse = state !== 'idle';

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      {/* Status dot */}
      <div style={{ position: 'relative', width: 7, height: 7, flexShrink: 0 }}>
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: '50%',
            background: dotColor,
          }}
        />
        {isPulse && (
          <motion.div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              background: dotColor,
            }}
            animate={{ scale: [1, 2.5, 1], opacity: [0.7, 0, 0.7] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut' }}
          />
        )}
      </div>

      {/* Label text */}
      <AnimatePresence mode="wait">
        <motion.span
          key={state}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
          transition={{ duration: 0.18 }}
          style={{
            color,
            fontSize: 12,
            fontWeight: 600,
            fontFamily: 'Inter, system-ui, sans-serif',
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            lineHeight: 1,
          }}
        >
          {label}
        </motion.span>
      </AnimatePresence>
    </div>
  );
}
