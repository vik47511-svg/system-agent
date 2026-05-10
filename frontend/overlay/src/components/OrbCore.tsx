import { motion } from 'framer-motion';
import type { OverlayState } from '../types';

interface OrbCoreConfig {
  primary: string;
  secondary: string;
  glow: string;
  pulseColor: string;
}

const ORB_CONFIG: Record<OverlayState, OrbCoreConfig> = {
  idle:      { primary: '#1e3a5f', secondary: '#0f2040', glow: 'rgba(30,58,95,0.5)',     pulseColor: 'rgba(30,58,95,0.3)' },
  listening: { primary: '#059669', secondary: '#047857', glow: 'rgba(16,185,129,0.7)',   pulseColor: 'rgba(16,185,129,0.35)' },
  thinking:  { primary: '#0284c7', secondary: '#0369a1', glow: 'rgba(14,165,233,0.7)',   pulseColor: 'rgba(14,165,233,0.3)' },
  speaking:  { primary: '#0d9488', secondary: '#0f766e', glow: 'rgba(20,184,166,0.7)',   pulseColor: 'rgba(20,184,166,0.35)' },
  executing: { primary: '#d97706', secondary: '#b45309', glow: 'rgba(245,158,11,0.7)',   pulseColor: 'rgba(245,158,11,0.3)' },
};

interface OrbCoreProps {
  state: OverlayState;
  audioLevel: number;
  size?: number;
}

export function OrbCore({ state, audioLevel, size = 48 }: OrbCoreProps) {
  const cfg = ORB_CONFIG[state];
  const isActive = state !== 'idle';
  const scale = isActive ? 1 + audioLevel * 0.12 : 1;

  return (
    <div
      style={{
        position: 'relative',
        width: size,
        height: size,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Outer pulse rings */}
      {isActive && (
        <>
          <motion.div
            style={{
              position: 'absolute',
              borderRadius: '50%',
              width: size * 1.6,
              height: size * 1.6,
              border: `1px solid ${cfg.primary}`,
            }}
            animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: 'easeInOut' }}
          />
          <motion.div
            style={{
              position: 'absolute',
              borderRadius: '50%',
              width: size * 1.3,
              height: size * 1.3,
              border: `1px solid ${cfg.primary}`,
            }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.05, 0.5] }}
            transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut', delay: 0.4 }}
          />
        </>
      )}

      {/* Glow backdrop */}
      <motion.div
        style={{
          position: 'absolute',
          borderRadius: '50%',
          width: size * 0.9,
          height: size * 0.9,
          background: cfg.glow,
          filter: `blur(${size * 0.3}px)`,
        }}
        animate={isActive ? { opacity: [0.6, 1, 0.6] } : { opacity: 0.3 }}
        transition={{ duration: 1.8, repeat: Infinity }}
      />

      {/* Main orb body */}
      <motion.div
        style={{
          position: 'relative',
          width: size,
          height: size,
          borderRadius: '50%',
          background: `radial-gradient(circle at 35% 30%, ${cfg.primary}, ${cfg.secondary})`,
          boxShadow: `0 0 ${size * 0.5}px ${cfg.glow}, inset 0 1px 0 rgba(255,255,255,0.18)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          overflow: 'hidden',
        }}
        animate={{ scale }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
      >
        {/* Shimmer highlight */}
        <motion.div
          style={{
            position: 'absolute',
            inset: 0,
            borderRadius: '50%',
            background: 'radial-gradient(circle at 30% 25%, rgba(255,255,255,0.22), transparent 55%)',
          }}
          animate={isActive ? { opacity: [0.5, 1, 0.5] } : { opacity: 0.35 }}
          transition={{ duration: 1.4, repeat: Infinity }}
        />

        {/* Atlas logo mark */}
        <AtlasLogoMark size={size} state={state} />

        {/* Thinking particles */}
        {state === 'thinking' && <ThinkingParticles size={size} />}

        {/* Listening wave rings */}
        {state === 'listening' && <ListeningRings size={size} audioLevel={audioLevel} />}
      </motion.div>
    </div>
  );
}

function AtlasLogoMark({ size, state }: { size: number; state: OverlayState }) {
  const s = size * 0.38;
  return (
    <svg width={s} height={s} viewBox="0 0 24 24" fill="none" style={{ position: 'relative', zIndex: 1 }}>
      <motion.path
        d="M12 2L2 7l10 5 10-5-10-5z"
        stroke="rgba(255,255,255,0.9)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        fill="rgba(255,255,255,0.12)"
        animate={state === 'thinking' ? { opacity: [0.7, 1, 0.7] } : {}}
        transition={{ duration: 0.7, repeat: Infinity }}
      />
      <motion.path
        d="M2 12l10 5 10-5"
        stroke="rgba(255,255,255,0.65)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        animate={state === 'speaking' ? { y: [0, -1, 0] } : {}}
        transition={{ duration: 0.35, repeat: Infinity }}
      />
      <motion.path
        d="M2 17l10 5 10-5"
        stroke="rgba(255,255,255,0.4)"
        strokeWidth="1.5"
        strokeLinejoin="round"
        animate={state === 'executing' ? { opacity: [0.4, 0.9, 0.4] } : {}}
        transition={{ duration: 0.5, repeat: Infinity, delay: 0.2 }}
      />
    </svg>
  );
}

function ThinkingParticles({ size }: { size: number }) {
  return (
    <div style={{ position: 'absolute', inset: 0 }}>
      {[0, 1, 2].map((i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            width: 3,
            height: 3,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.9)',
            left: `${28 + i * 18}%`,
            bottom: '22%',
          }}
          animate={{ y: [0, -(size * 0.35), 0], opacity: [0, 1, 0] }}
          transition={{ duration: 1.1, repeat: Infinity, delay: i * 0.28 }}
        />
      ))}
    </div>
  );
}

function ListeningRings({ size, audioLevel }: { size: number; audioLevel: number }) {
  return (
    <>
      {[0, 1].map((i) => (
        <motion.div
          key={i}
          style={{
            position: 'absolute',
            borderRadius: '50%',
            border: '1px solid rgba(255,255,255,0.3)',
            width: size * (0.5 + i * 0.18),
            height: size * (0.5 + i * 0.18),
          }}
          animate={{
            scale: [1, 1 + audioLevel * 0.25, 1],
            opacity: [0.4, 0.1, 0.4],
          }}
          transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.2 }}
        />
      ))}
    </>
  );
}
