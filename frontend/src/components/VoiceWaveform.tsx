import { motion } from 'framer-motion';

interface VoiceWaveformProps {
  isActive: boolean;
  audioLevel?: number;
  bars?: number;
  color?: string;
  height?: number;
}

export function VoiceWaveform({
  isActive,
  audioLevel = 0.5,
  bars = 20,
  color = '#10b981',
  height = 40,
}: VoiceWaveformProps) {
  return (
    <div
      className="flex items-center gap-[3px]"
      style={{ height }}
    >
      {Array.from({ length: bars }).map((_, i) => {
        const base = Math.sin((i / bars) * Math.PI) * 0.6 + 0.15;
        const maxH = base * height;
        const delay = (i / bars) * 0.4;

        return (
          <motion.div
            key={i}
            className="rounded-full flex-shrink-0"
            style={{ width: 3, backgroundColor: color }}
            animate={
              isActive
                ? {
                    height: [
                      maxH * 0.2,
                      maxH * audioLevel * (0.8 + Math.random() * 0.4),
                      maxH * 0.3,
                      maxH * audioLevel,
                      maxH * 0.15,
                    ],
                  }
                : { height: maxH * 0.12 }
            }
            transition={
              isActive
                ? {
                    duration: 0.8 + Math.random() * 0.4,
                    repeat: Infinity,
                    delay,
                    ease: 'easeInOut',
                  }
                : { duration: 0.3 }
            }
          />
        );
      })}
    </div>
  );
}
