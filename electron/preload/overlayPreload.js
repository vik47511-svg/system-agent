'use strict';

const { contextBridge, ipcRenderer } = require('electron');

const INVOKE_CHANNELS = new Set([
  'overlay:requestHide',
  'overlay:requestMuteToggle',
  'overlay:requestOpenMain',
]);

const ON_CHANNELS = new Set([
  'overlay:stateChanged',
  'overlay:audioLevel',
  'overlay:muteChanged',
  'overlay:visibilityChanged',
]);

contextBridge.exposeInMainWorld('overlayAPI', {
  onStateChange: (cb) => {
    const handler = (_e, state) => cb(state);
    ipcRenderer.on('overlay:stateChanged', handler);
    return () => ipcRenderer.removeListener('overlay:stateChanged', handler);
  },

  onAudioLevel: (cb) => {
    const handler = (_e, level) => cb(level);
    ipcRenderer.on('overlay:audioLevel', handler);
    return () => ipcRenderer.removeListener('overlay:audioLevel', handler);
  },

  onMuteChange: (cb) => {
    const handler = (_e, muted) => cb(muted);
    ipcRenderer.on('overlay:muteChanged', handler);
    return () => ipcRenderer.removeListener('overlay:muteChanged', handler);
  },

  onVisibilityChange: (cb) => {
    const handler = (_e, visible) => cb(visible);
    ipcRenderer.on('overlay:visibilityChanged', handler);
    return () => ipcRenderer.removeListener('overlay:visibilityChanged', handler);
  },

  requestHide: () => {
    ipcRenderer.invoke('overlay:requestHide');
  },

  requestMuteToggle: () => {
    ipcRenderer.invoke('overlay:requestMuteToggle');
  },

  requestOpenMain: () => {
    ipcRenderer.invoke('overlay:requestOpenMain');
  },
});

contextBridge.exposeInMainWorld('platform', process.platform);
