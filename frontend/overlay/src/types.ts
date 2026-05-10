export type OverlayState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'executing';

export interface OverlayConfig {
  state: OverlayState;
  audioLevel: number;
  label: string;
  isMuted: boolean;
}

export interface OverlayElectronAPI {
  onStateChange: (cb: (state: OverlayState) => void) => () => void;
  onAudioLevel: (cb: (level: number) => void) => () => void;
  onMuteChange: (cb: (muted: boolean) => void) => () => void;
  onVisibilityChange: (cb: (visible: boolean) => void) => () => void;
  requestHide: () => void;
  requestMuteToggle: () => void;
  requestOpenMain: () => void;
}

declare global {
  interface Window {
    overlayAPI?: OverlayElectronAPI;
    platform?: string;
  }
}
