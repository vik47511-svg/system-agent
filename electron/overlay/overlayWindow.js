'use strict';

const { BrowserWindow, screen, ipcMain } = require('electron');
const { getOverlayPreloadPath, getOverlayUrl } = require('../utils/env');
const logger = require('../utils/logger');

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const OVERLAY_WIDTH  = 300;
const OVERLAY_HEIGHT = 90;
const MARGIN         = 20;

/** @type {BrowserWindow | null} */
let overlayWindow = null;

/** @type {boolean} */
let isMuted = false;

/** @type {string} */
let currentState = 'idle';

/** @type {NodeJS.Timeout | null} */
let audioSimTimer = null;

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

function buildWindowConfig(x, y) {
  return {
    width: OVERLAY_WIDTH,
    height: OVERLAY_HEIGHT,
    x,
    y,
    resizable: false,
    movable: true,
    minimizable: false,
    maximizable: false,
    fullscreenable: false,
    skipTaskbar: true,
    alwaysOnTop: true,
    level: 'floating',        // macOS: float above normal windows
    frame: false,
    transparent: true,
    hasShadow: false,         // shadow handled by renderer CSS
    show: false,
    acceptFirstMouse: true,
    webPreferences: {
      preload: getOverlayPreloadPath(),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
      webSecurity: true,
    },
  };
}

// ---------------------------------------------------------------------------
// Position helpers
// ---------------------------------------------------------------------------

/**
 * Returns the overlay position in the bottom-right corner of the primary display.
 */
function getPrimaryCornerPosition() {
  const display = screen.getPrimaryDisplay();
  const { width, height } = display.workAreaSize;
  return {
    x: width  - OVERLAY_WIDTH  - MARGIN,
    y: height - OVERLAY_HEIGHT - MARGIN,
  };
}

/**
 * Returns display info for multi-monitor support.
 * @returns {{ id: number; label: string }[]}
 */
function getAllDisplays() {
  return screen.getAllDisplays().map((d, i) => ({
    id: d.id,
    label: `Display ${i + 1} (${d.size.width}x${d.size.height})`,
    bounds: d.workArea,
  }));
}

/**
 * Snap the overlay to a corner of the given display.
 * @param {'bottom-right'|'bottom-left'|'top-right'|'top-left'} corner
 * @param {Electron.Display|null} [display] defaults to primary
 */
function snapToCorner(corner = 'bottom-right', display = null) {
  if (!overlayWindow || overlayWindow.isDestroyed()) return;

  const d = display ?? screen.getPrimaryDisplay();
  const { x: dx, y: dy, width: dw, height: dh } = d.workArea;

  let x, y;
  switch (corner) {
    case 'bottom-left':  x = dx + MARGIN;            y = dy + dh - OVERLAY_HEIGHT - MARGIN; break;
    case 'top-right':    x = dx + dw - OVERLAY_WIDTH - MARGIN; y = dy + MARGIN;            break;
    case 'top-left':     x = dx + MARGIN;            y = dy + MARGIN;                      break;
    default:             x = dx + dw - OVERLAY_WIDTH - MARGIN; y = dy + dh - OVERLAY_HEIGHT - MARGIN;
  }

  overlayWindow.setPosition(x, y);
  logger.debug(`Overlay snapped to ${corner} on display ${d.id}`);
}

// ---------------------------------------------------------------------------
// URL builder
// ---------------------------------------------------------------------------

function buildOverlayUrl() {
  return getOverlayUrl();
}

// ---------------------------------------------------------------------------
// Window lifecycle
// ---------------------------------------------------------------------------

/**
 * Create (or return existing) overlay BrowserWindow.
 * @returns {BrowserWindow}
 */
function createOverlayWindow() {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.show();
    return overlayWindow;
  }

  logger.info('Creating overlay window');

  const { x, y } = getPrimaryCornerPosition();
  overlayWindow = new BrowserWindow(buildWindowConfig(x, y));

  overlayWindow.loadURL(buildOverlayUrl());

  overlayWindow.once('ready-to-show', () => {
    overlayWindow.show();
    logger.debug('Overlay window ready');
  });

  overlayWindow.on('closed', () => {
    overlayWindow = null;
    stopAudioSimulation();
    logger.debug('Overlay window closed');
  });

  // Block any renderer-initiated navigation
  overlayWindow.webContents.on('will-navigate', (event) => {
    event.preventDefault();
  });
  overlayWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  registerOverlayIpc();

  return overlayWindow;
}

function showOverlay() {
  if (!overlayWindow || overlayWindow.isDestroyed()) {
    createOverlayWindow();
    return;
  }
  const { x, y } = getPrimaryCornerPosition();
  overlayWindow.setPosition(x, y);
  overlayWindow.show();
  sendToOverlay('overlay:visibilityChanged', true);
  logger.debug('Overlay shown');
}

function hideOverlay() {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.hide();
    sendToOverlay('overlay:visibilityChanged', false);
    logger.debug('Overlay hidden');
  }
}

function toggleOverlay() {
  if (isOverlayVisible()) {
    hideOverlay();
  } else {
    showOverlay();
  }
}

function destroyOverlay() {
  stopAudioSimulation();
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.destroy();
  }
  overlayWindow = null;
}

function getOverlayWindow() {
  return overlayWindow;
}

function isOverlayVisible() {
  return !!(overlayWindow && !overlayWindow.isDestroyed() && overlayWindow.isVisible());
}

// ---------------------------------------------------------------------------
// State synchronisation
// ---------------------------------------------------------------------------

/**
 * Push a new assistant state to the overlay renderer.
 * @param {'idle'|'listening'|'thinking'|'speaking'|'executing'} state
 */
function setOverlayState(state) {
  currentState = state;
  sendToOverlay('overlay:stateChanged', state);

  // Auto-manage audio simulation
  if (state === 'listening' || state === 'speaking') {
    startAudioSimulation();
  } else {
    stopAudioSimulation();
    sendToOverlay('overlay:audioLevel', 0);
  }
}

/**
 * Push a raw audio level (0-1) to the overlay renderer.
 * @param {number} level
 */
function setAudioLevel(level) {
  sendToOverlay('overlay:audioLevel', level);
}

/**
 * Toggle mute state and push the change.
 */
function toggleMute() {
  isMuted = !isMuted;
  sendToOverlay('overlay:muteChanged', isMuted);
  logger.debug(`Overlay mute: ${isMuted}`);
}

// ---------------------------------------------------------------------------
// Simulated audio level (demo only — replace with real mic input)
// ---------------------------------------------------------------------------

function startAudioSimulation() {
  stopAudioSimulation();
  audioSimTimer = setInterval(() => {
    if (isMuted) {
      sendToOverlay('overlay:audioLevel', 0);
      return;
    }
    const lvl = 0.25 + Math.sin(Date.now() / 200) * 0.3 + Math.random() * 0.2;
    sendToOverlay('overlay:audioLevel', Math.max(0, Math.min(1, lvl)));
  }, 40);
}

function stopAudioSimulation() {
  if (audioSimTimer) {
    clearInterval(audioSimTimer);
    audioSimTimer = null;
  }
}

// ---------------------------------------------------------------------------
// IPC: renderer → main
// ---------------------------------------------------------------------------

let ipcRegistered = false;

function registerOverlayIpc() {
  if (ipcRegistered) return;
  ipcRegistered = true;

  // Overlay renderer requests to hide itself
  ipcMain.handle('overlay:requestHide', () => {
    hideOverlay();
  });

  // Overlay renderer requests mute toggle
  ipcMain.handle('overlay:requestMuteToggle', () => {
    toggleMute();
  });

  // Overlay renderer requests to open main window
  ipcMain.handle('overlay:requestOpenMain', () => {
    const { getMainWindow } = require('../windows/mainWindow');
    const win = getMainWindow();
    if (win && !win.isDestroyed()) {
      if (!win.isVisible()) win.show();
      win.focus();
    }
  });

  // Main-window IPC: control overlay from main renderer
  ipcMain.handle('overlay:show',         () => showOverlay());
  ipcMain.handle('overlay:hide',         () => hideOverlay());
  ipcMain.handle('overlay:toggle',       () => toggleOverlay());
  ipcMain.handle('overlay:isVisible',    () => isOverlayVisible());
  ipcMain.handle('overlay:setState',     (_e, state) => setOverlayState(state));
  ipcMain.handle('overlay:setPosition',  (_e, x, y) => {
    if (overlayWindow && !overlayWindow.isDestroyed()) overlayWindow.setPosition(x, y);
  });
  ipcMain.handle('overlay:snapCorner',   (_e, corner) => snapToCorner(corner));

  logger.debug('Overlay IPC handlers registered');
}

function unregisterOverlayIpc() {
  const channels = [
    'overlay:requestHide', 'overlay:requestMuteToggle', 'overlay:requestOpenMain',
    'overlay:show', 'overlay:hide', 'overlay:toggle', 'overlay:isVisible',
    'overlay:setState', 'overlay:setPosition', 'overlay:snapCorner',
  ];
  channels.forEach((ch) => ipcMain.removeAllListeners(ch));
  ipcRegistered = false;
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/**
 * Send a message to the overlay renderer (if alive).
 * @param {string} channel
 * @param  {...any} args
 */
function sendToOverlay(channel, ...args) {
  if (overlayWindow && !overlayWindow.isDestroyed() && overlayWindow.webContents) {
    overlayWindow.webContents.send(channel, ...args);
  }
}

// ---------------------------------------------------------------------------
// Demo mock-state cycling (for presentation / testing)
// ---------------------------------------------------------------------------

let demoTimer = null;
const DEMO_SEQUENCE = [
  { state: 'idle',      ms: 3000 },
  { state: 'listening', ms: 4000 },
  { state: 'thinking',  ms: 2500 },
  { state: 'executing', ms: 3500 },
  { state: 'speaking',  ms: 2500 },
];
let demoIndex = 0;

function startDemoMode() {
  stopDemoMode();
  function next() {
    const { state, ms } = DEMO_SEQUENCE[demoIndex % DEMO_SEQUENCE.length];
    setOverlayState(state);
    demoIndex += 1;
    demoTimer = setTimeout(next, ms);
  }
  next();
  logger.info('Overlay demo mode started');
}

function stopDemoMode() {
  if (demoTimer) {
    clearTimeout(demoTimer);
    demoTimer = null;
  }
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  createOverlayWindow,
  showOverlay,
  hideOverlay,
  toggleOverlay,
  destroyOverlay,
  getOverlayWindow,
  isOverlayVisible,
  sendToOverlay,
  setOverlayState,
  setAudioLevel,
  toggleMute,
  snapToCorner,
  getAllDisplays,
  startDemoMode,
  stopDemoMode,
  unregisterOverlayIpc,
};
