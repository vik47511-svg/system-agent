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

  // Overlay
  OVERLAY_SHOW:         'overlay:show',
  OVERLAY_HIDE:         'overlay:hide',
  OVERLAY_TOGGLE:       'overlay:toggle',
  OVERLAY_IS_VISIBLE:   'overlay:isVisible',
  OVERLAY_SET_STATE:    'overlay:setState',
  OVERLAY_SET_POSITION: 'overlay:setPosition',
  OVERLAY_SNAP_CORNER:  'overlay:snapCorner',

  // Overlay → main (renderer-initiated)
  OVERLAY_REQUEST_HIDE:        'overlay:requestHide',
  OVERLAY_REQUEST_MUTE_TOGGLE: 'overlay:requestMuteToggle',
  OVERLAY_REQUEST_OPEN_MAIN:   'overlay:requestOpenMain',

  // Main → overlay renderer (push)
  OVERLAY_STATE_CHANGED:   'overlay:stateChanged',
  OVERLAY_AUDIO_LEVEL:     'overlay:audioLevel',
  OVERLAY_MUTE_CHANGED:    'overlay:muteChanged',
};

module.exports = { CHANNELS };
