import { motion } from 'framer-motion';
import type { OverlayState } from '../types';

const BARS = 16;

interface MicIndicatorProps {
  state: OverlayState;
  audioLevel: number;
  isMuted: boolean;
}

export function MicIndicator({ state, audioLevel, isMuted }: MicIndicatorProps) {
  const isAudioActive = (state === 'listening' || state === 'speaking') && !isMuted;

  const barColor =
    state === 'listening' ? '#10b981' :
    state === 'speaking'  ? '#14b8a6' :
    state === 'executing' ? '#f59e0b' :
    state === 'thinking'  ? '#0ea5e9' :
    'rgba(100,116,139,0.5)';

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        height: 20,
        marginTop: 4,
      }}
    >
      {isMuted ? (
        <MutedIndicator />
      ) : (
        Array.from({ length: BARS }).map((_, i) => {
          const center = Math.sin((i / BARS) * Math.PI) * 0.7 + 0.15;
          const maxH = center * 18;
          const delay = (i / BARS) * 0.35;

          return (
            <motion.div
              key={i}
              style={{
                width: 2,
                borderRadius: 2,
                background: barColor,
                flexShrink: 0,
              }}
              animate={
                isAudioActive
                  ? {
                      height: [
                        maxH * 0.15,
                        maxH * (0.5 + audioLevel * 0.5),
                        maxH * 0.25,
                        maxH * audioLevel,
                        maxH * 0.1,
                      ],
                    }
                  : { height: maxH * 0.12 }
              }
              transition={
                isAudioActive
                  ? {
                      duration: 0.7 + (i % 3) * 0.2,
                      repeat: Infinity,
                      delay,
                      ease: 'easeInOut',
                    }
                  : { duration: 0.3 }
              }
            />
          );
        })
      )}
    </div>
  );
}

function MutedIndicator() {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: 4,
        color: 'rgba(239,68,68,0.8)',
        fontSize: 10,
        fontFamily: 'Inter, system-ui, sans-serif',
        fontWeight: 500,
      }}
    >
      <motion.div
        style={{
          width: 6,
          height: 6,
          borderRadius: '50%',
          background: 'rgba(239,68,68,0.8)',
        }}
        animate={{ opacity: [1, 0.3, 1] }}
        transition={{ duration: 1.2, repeat: Infinity }}
      />
      Muted
    </div>
  );
}
