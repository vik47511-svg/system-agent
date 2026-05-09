import { motion } from 'framer-motion';
import type { AssistantStatus } from '../types';

const orbConfig: Record<AssistantStatus, { primary: string; secondary: string; glow: string }> = {
  idle:          { primary: '#1e3a5f', secondary: '#0f2040', glow: 'rgba(30,58,95,0.3)' },
  listening:     { primary: '#10b981', secondary: '#059669', glow: 'rgba(16,185,129,0.4)' },
  thinking:      { primary: '#0ea5e9', secondary: '#0284c7', glow: 'rgba(14,165,233,0.4)' },
  executing:     { primary: '#f59e0b', secondary: '#d97706', glow: 'rgba(245,158,11,0.4)' },
  reading_screen:{ primary: '#06b6d4', secondary: '#0891b2', glow: 'rgba(6,182,212,0.4)' },
  speaking:      { primary: '#14b8a6', secondary: '#0d9488', glow: 'rgba(20,184,166,0.5)' },
  error:         { primary: '#ef4444', secondary: '#dc2626', glow: 'rgba(239,68,68,0.4)' },
};

interface AIOrb {
  status: AssistantStatus;
  size?: number;
}

export function AIOrb({ status, size = 96 }: AIOrb) {
  const cfg = orbConfig[status];
  const isActive = status !== 'idle';

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      {/* Outer glow rings */}
      {isActive && (
        <>
          <motion.div
            className="absolute rounded-full"
            style={{
              width: size * 1.5,
              height: size * 1.5,
              border: `1px solid ${cfg.primary}`,
              opacity: 0.3,
            }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            className="absolute rounded-full"
            style={{
              width: size * 1.25,
              height: size * 1.25,
              border: `1px solid ${cfg.primary}`,
              opacity: 0.5,
            }}
            animate={{ scale: [1, 1.15, 1], opacity: [0.5, 0.1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: 'easeInOut', delay: 0.3 }}
          />
        </>
      )}

      {/* Main orb */}
      <motion.div
        className="relative rounded-full flex items-center justify-center overflow-hidden"
        style={{
          width: size,
          height: size,
          background: `radial-gradient(circle at 35% 35%, ${cfg.primary}, ${cfg.secondary})`,
          boxShadow: `0 0 ${size * 0.4}px ${cfg.glow}, inset 0 1px 0 rgba(255,255,255,0.15)`,
        }}
        animate={isActive ? { scale: [1, 1.03, 1] } : {}}
        transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
      >
        {/* Inner shimmer */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{
            background: `radial-gradient(circle at 30% 25%, rgba(255,255,255,0.2), transparent 60%)`,
          }}
          animate={isActive ? { opacity: [0.6, 1, 0.6] } : { opacity: 0.4 }}
          transition={{ duration: 1.5, repeat: Infinity }}
        />

        {/* Atlas logo mark */}
        <svg width={size * 0.4} height={size * 0.4} viewBox="0 0 24 24" fill="none">
          <motion.path
            d="M12 2L2 7l10 5 10-5-10-5z"
            stroke="rgba(255,255,255,0.9)"
            strokeWidth="1.5"
            strokeLinejoin="round"
            fill="rgba(255,255,255,0.15)"
            animate={status === 'thinking' ? { opacity: [0.7, 1, 0.7] } : {}}
            transition={{ duration: 0.8, repeat: Infinity }}
          />
          <motion.path
            d="M2 12l10 5 10-5"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="1.5"
            strokeLinejoin="round"
            animate={status === 'speaking' ? { y: [0, -1, 0] } : {}}
            transition={{ duration: 0.4, repeat: Infinity }}
          />
          <motion.path
            d="M2 17l10 5 10-5"
            stroke="rgba(255,255,255,0.5)"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>

        {/* Thinking particles */}
        {status === 'thinking' && (
          <div className="absolute inset-0">
            {[0, 1, 2].map((i) => (
              <motion.div
                key={i}
                className="absolute w-1 h-1 rounded-full bg-white"
                style={{ left: `${30 + i * 20}%`, bottom: '20%' }}
                animate={{ y: [0, -size * 0.3, 0], opacity: [0, 1, 0] }}
                transition={{ duration: 1, repeat: Infinity, delay: i * 0.3 }}
              />
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
}
