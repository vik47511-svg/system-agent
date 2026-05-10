import { useState, useEffect, useRef } from 'react';
import type { OverlayState } from './types';

const STATE_LABELS: Record<OverlayState, string> = {
  idle:      'Ready',
  listening: 'Listening',
  thinking:  'Thinking',
  speaking:  'Speaking',
  executing: 'Executing',
};

// Demo cycle for environments without Electron
const DEMO_STATES: OverlayState[] = ['idle', 'listening', 'thinking', 'executing', 'speaking'];
const DEMO_INTERVALS: number[] = [3000, 3000, 2500, 3500, 2000];

export function useOverlayStore() {
  const [state, setState] = useState<OverlayState>('idle');
  const [audioLevel, setAudioLevel] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const demoIndexRef = useRef(0);

  useEffect(() => {
    const api = window.overlayAPI;

    if (api) {
      const unsub1 = api.onStateChange(setState);
      const unsub2 = api.onAudioLevel(setAudioLevel);
      const unsub3 = api.onMuteChange(setIsMuted);
      return () => { unsub1(); unsub2(); unsub3(); };
    }

    // Demo cycle when running in browser
    let timeout: ReturnType<typeof setTimeout>;
    function cycle() {
      demoIndexRef.current = (demoIndexRef.current + 1) % DEMO_STATES.length;
      const nextState = DEMO_STATES[demoIndexRef.current];
      setState(nextState);

      if (nextState === 'listening' || nextState === 'speaking') {
        let lvl = 0;
        const waveFn = () => {
          lvl = 0.3 + Math.sin(Date.now() / 150) * 0.3 + Math.random() * 0.15;
          setAudioLevel(Math.max(0, Math.min(1, lvl)));
        };
        const waveInterval = setInterval(waveFn, 50);
        timeout = setTimeout(() => {
          clearInterval(waveInterval);
          setAudioLevel(0);
          cycle();
        }, DEMO_INTERVALS[demoIndexRef.current]);
        return;
      }
      setAudioLevel(0);
      timeout = setTimeout(cycle, DEMO_INTERVALS[demoIndexRef.current]);
    }

    timeout = setTimeout(cycle, DEMO_INTERVALS[0]);
    return () => clearTimeout(timeout);
  }, []);

  const label = STATE_LABELS[state];

  const handleHide = () => window.overlayAPI?.requestHide();
  const handleMuteToggle = () => {
    window.overlayAPI?.requestMuteToggle();
    if (!window.overlayAPI) setIsMuted((m) => !m);
  };
  const handleOpenMain = () => window.overlayAPI?.requestOpenMain();

  return { state, audioLevel, isMuted, label, handleHide, handleMuteToggle, handleOpenMain };
}
