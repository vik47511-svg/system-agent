import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, Square, Radio } from 'lucide-react';
import { useAssistantStore } from '../store/useAssistantStore';
import { VoiceWaveform } from './VoiceWaveform';
import { StatusIndicator } from './StatusIndicator';

export function FloatingAssistant() {
  const { status, isMuted, isWakeWordActive, audioLevel, toggleMute, stopExecution, setStatus } = useAssistantStore();
  const isListening = status === 'listening';
  const isExecuting = status === 'executing' || status === 'reading_screen';

  const handleMicClick = () => {
    if (status === 'idle') {
      setStatus('listening');
    } else if (status === 'listening') {
      setStatus('idle');
    }
  };

  return (
    <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="flex items-center gap-4 px-6 py-3 rounded-2xl glass-card border border-slate-700/50 shadow-2xl"
        style={{
          backdropFilter: 'blur(24px)',
          boxShadow: isListening
            ? '0 8px 40px rgba(16,185,129,0.25), 0 0 0 1px rgba(16,185,129,0.2)'
            : '0 8px 40px rgba(0,0,0,0.5)',
        }}
      >
        {/* Wake word indicator */}
        <div className="flex items-center gap-2 pr-4 border-r border-slate-700/50">
          <motion.div
            className={`w-2 h-2 rounded-full ${isWakeWordActive ? 'bg-emerald-400' : 'bg-slate-600'}`}
            animate={isWakeWordActive ? { opacity: [1, 0.4, 1] } : {}}
            transition={{ duration: 2, repeat: Infinity }}
          />
          <span className="text-xs text-slate-400 font-medium hidden sm:block">
            {isWakeWordActive ? 'Hey Atlas' : 'Wake word off'}
          </span>
        </div>

        {/* Waveform */}
        <div className="flex-1 flex items-center justify-center min-w-[120px]">
          <AnimatePresence mode="wait">
            {isListening ? (
              <motion.div
                key="wave"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <VoiceWaveform isActive={true} audioLevel={audioLevel} bars={24} color="#10b981" height={32} />
              </motion.div>
            ) : (
              <motion.div
                key="status"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <StatusIndicator status={status} size="sm" />
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-2 pl-4 border-l border-slate-700/50">
          {/* Stop execution */}
          <AnimatePresence>
            {isExecuting && (
              <motion.button
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0, opacity: 0 }}
                onClick={stopExecution}
                className="w-9 h-9 rounded-xl bg-red-500/20 border border-red-500/30 flex items-center justify-center text-red-400 hover:bg-red-500/30 transition-colors"
                title="Stop execution"
              >
                <Square className="w-4 h-4 fill-current" />
              </motion.button>
            )}
          </AnimatePresence>

          {/* Mute */}
          <button
            onClick={toggleMute}
            className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all ${
              isMuted
                ? 'bg-red-500/20 border-red-500/30 text-red-400 hover:bg-red-500/30'
                : 'bg-slate-700/50 border-slate-600/30 text-slate-400 hover:bg-slate-700/70'
            }`}
            title={isMuted ? 'Unmute' : 'Mute'}
          >
            {isMuted ? <MicOff className="w-4 h-4" /> : <Radio className="w-4 h-4" />}
          </button>

          {/* Mic button */}
          <motion.button
            onClick={handleMicClick}
            whileTap={{ scale: 0.92 }}
            className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all font-medium relative overflow-hidden ${
              isListening
                ? 'bg-emerald-500 shadow-lg shadow-emerald-500/40 text-white'
                : 'bg-sky-600 hover:bg-sky-500 text-white shadow-lg shadow-sky-600/30'
            }`}
          >
            {isListening && (
              <motion.div
                className="absolute inset-0 bg-emerald-400/30 rounded-xl"
                animate={{ scale: [1, 1.3, 1], opacity: [0.5, 0, 0.5] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              />
            )}
            <Mic className="w-4.5 h-4.5 relative z-10" />
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}
