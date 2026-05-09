/**
 * Detects if the app is running inside Electron and exposes the API bridge.
 * In a browser/web environment all values are undefined/false.
 */
export function useElectron() {
  const isElectron = typeof window !== 'undefined' && !!window.electronAPI;
  const api = isElectron ? window.electronAPI : null;
  const platform = (typeof window !== 'undefined' ? window.platform : undefined) ?? null;

  return { isElectron, api, platform };
}
