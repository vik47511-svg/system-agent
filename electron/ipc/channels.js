/**
 * Canonical IPC channel names shared between main and preload.
 * Renderer invokes channels; main handles them.
 */
const CHANNELS = {
  // App
  APP_VERSION: 'app:version',
  APP_QUIT: 'app:quit',
  APP_MINIMIZE: 'app:minimize',
  APP_MAXIMIZE: 'app:maximize',
  APP_IS_MAXIMIZED: 'app:isMaximized',

  // Window
  WINDOW_FOCUS: 'window:focus',
  WINDOW_BLUR: 'window:blur',

  // Settings persistence
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',

  // System
  SYSTEM_INFO: 'system:info',
  OPEN_EXTERNAL: 'shell:openExternal',
};

module.exports = { CHANNELS };
