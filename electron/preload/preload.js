'use strict';

const { contextBridge, ipcRenderer } = require('electron');

// Allowed send (fire-and-forget) channels — renderer → main, no reply expected
const SEND_CHANNELS = new Set([]);

// Allowed invoke (request/response) channels — renderer → main → renderer
const INVOKE_CHANNELS = new Set([
  'app:version',
  'app:quit',
  'app:minimize',
  'app:maximize',
  'app:isMaximized',
  'settings:get',
  'settings:set',
  'system:info',
  'shell:openExternal',
  // Overlay controls
  'overlay:show',
  'overlay:hide',
  'overlay:toggle',
  'overlay:isVisible',
  'overlay:setState',
  'overlay:setPosition',
  'overlay:snapCorner',
]);

// Allowed on (main → renderer push) channels
const ON_CHANNELS = new Set([
  'window:focus',
  'window:blur',
  'app:update-available',
  'app:update-downloaded',
]);

/**
 * Secure bridge exposed to the renderer under window.electronAPI.
 * contextIsolation ensures renderer JS cannot access Node/Electron directly.
 */
contextBridge.exposeInMainWorld('electronAPI', {
  // Invoke a whitelisted IPC channel and await the response
  invoke: (channel, ...args) => {
    if (!INVOKE_CHANNELS.has(channel)) {
      console.warn(`[preload] Blocked invoke on unknown channel: ${channel}`);
      return Promise.reject(new Error(`Channel "${channel}" is not allowed`));
    }
    return ipcRenderer.invoke(channel, ...args);
  },

  // Send to a whitelisted channel without expecting a reply
  send: (channel, ...args) => {
    if (!SEND_CHANNELS.has(channel)) {
      console.warn(`[preload] Blocked send on unknown channel: ${channel}`);
      return;
    }
    ipcRenderer.send(channel, ...args);
  },

  // Subscribe to a whitelisted push event from main
  on: (channel, callback) => {
    if (!ON_CHANNELS.has(channel)) {
      console.warn(`[preload] Blocked on() for unknown channel: ${channel}`);
      return () => {};
    }
    const handler = (_event, ...args) => callback(...args);
    ipcRenderer.on(channel, handler);
    // Return an unsubscribe function
    return () => ipcRenderer.removeListener(channel, handler);
  },

  // Convenience wrappers for common operations
  app: {
    version: () => ipcRenderer.invoke('app:version'),
    quit: () => ipcRenderer.invoke('app:quit'),
    minimize: () => ipcRenderer.invoke('app:minimize'),
    maximize: () => ipcRenderer.invoke('app:maximize'),
    isMaximized: () => ipcRenderer.invoke('app:isMaximized'),
  },

  settings: {
    get: (key) => ipcRenderer.invoke('settings:get', key),
    set: (key, value) => ipcRenderer.invoke('settings:set', key, value),
  },

  system: {
    info: () => ipcRenderer.invoke('system:info'),
    openExternal: (url) => ipcRenderer.invoke('shell:openExternal', url),
  },

  overlay: {
    show:        () => ipcRenderer.invoke('overlay:show'),
    hide:        () => ipcRenderer.invoke('overlay:hide'),
    toggle:      () => ipcRenderer.invoke('overlay:toggle'),
    isVisible:   () => ipcRenderer.invoke('overlay:isVisible'),
    setState:    (state) => ipcRenderer.invoke('overlay:setState', state),
    setPosition: (x, y) => ipcRenderer.invoke('overlay:setPosition', x, y),
    snapCorner:  (corner) => ipcRenderer.invoke('overlay:snapCorner', corner),
  },
});

// Expose only the platform string — no other process internals
contextBridge.exposeInMainWorld('platform', process.platform);
