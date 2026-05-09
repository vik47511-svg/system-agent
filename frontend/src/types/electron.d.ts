export {};

declare global {
  interface Window {
    /** Exposed by electron/preload/preload.js via contextBridge */
    electronAPI: {
      invoke: (channel: string, ...args: unknown[]) => Promise<unknown>;
      send: (channel: string, ...args: unknown[]) => void;
      on: (channel: string, callback: (...args: unknown[]) => void) => () => void;

      app: {
        version: () => Promise<string>;
        quit: () => Promise<void>;
        minimize: () => Promise<void>;
        maximize: () => Promise<void>;
        isMaximized: () => Promise<boolean>;
      };

      settings: {
        get: (key: string) => Promise<unknown>;
        set: (key: string, value: unknown) => Promise<boolean>;
      };

      system: {
        info: () => Promise<{
          platform: string;
          arch: string;
          nodeVersion: string;
          electronVersion: string;
          chromeVersion: string;
        }>;
        openExternal: (url: string) => Promise<{ success: boolean; reason?: string }>;
      };
    };

    /** Process platform string ('win32' | 'darwin' | 'linux') */
    platform: string | undefined;
  }

  /** True when running inside Electron */
  const isElectron: boolean;
}
