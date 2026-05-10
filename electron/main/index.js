'use strict';

const { app, Menu } = require('electron');
const { createMainWindow, getMainWindow, destroyMainWindow } = require('../windows/mainWindow');
const { registerHandlers, unregisterHandlers } = require('../ipc/handlers');
const { createTray, destroyTray, onNavigate } = require('../tray/trayManager');
const {
  createOverlayWindow,
  showOverlay,
  destroyOverlay,
  startDemoMode,
  stopDemoMode,
  unregisterOverlayIpc,
} = require('../overlay/overlayWindow');
const logger = require('../utils/logger');
const { isDev } = require('../utils/env');

// Startup / lifecycle infrastructure
const { ensureStartupRegistered, shouldStartHidden, wasLaunchedAtLogin } = require('../startup/startupManager');
const lifecycleManager = require('../startup/lifecycleManager');
const { assistantStateManager } = require('../startup/assistantStateManager');

// --------------------------------------------------------------------------
// Security: lock down renderer permissions globally
// --------------------------------------------------------------------------
app.on('web-contents-created', (_event, contents) => {
  contents.setWindowOpenHandler(() => ({ action: 'deny' }));

  contents.session.setPermissionRequestHandler((_wc, permission, callback) => {
    const allowed = ['notifications', 'clipboard-sanitized-write'];
    callback(allowed.includes(permission));
  });
});

// --------------------------------------------------------------------------
// Single-instance lock — only one Atlas AI process at a time
// --------------------------------------------------------------------------
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  logger.warn('Another instance is already running. Quitting.');
  app.quit();
} else {
  app.on('second-instance', () => {
    const { restoreWindow } = require('../tray/trayManager');
    const win = getMainWindow();
    restoreWindow(win);
    lifecycleManager.exitBackground();
    assistantStateManager.exitBackgroundMode();
  });
}

// --------------------------------------------------------------------------
// App lifecycle
// --------------------------------------------------------------------------
app.whenReady().then(() => {
  logger.info(`Atlas AI starting — Electron ${process.versions.electron} / Node ${process.versions.node}`);
  logger.info(`Mode: ${isDev ? 'development' : 'production'}`);
  if (wasLaunchedAtLogin()) logger.info('Launched automatically at login');

  // Register Windows/macOS startup item in production
  ensureStartupRegistered();

  // Wire lifecycle phase machine (power events, window-all-closed guard, etc.)
  lifecycleManager.wire();

  // Sync lifecycle background phase → assistant state
  lifecycleManager.onPhaseChange((next) => {
    const { Phase } = lifecycleManager;
    if (next === Phase.BACKGROUND) {
      assistantStateManager.enterBackgroundMode();
    } else if (next === Phase.RUNNING) {
      assistantStateManager.exitBackgroundMode();
    } else if (next === Phase.QUITTING || next === Phase.SUSPENDED) {
      assistantStateManager.setFlags({ reducedPolling: true });
    }
  });

  Menu.setApplicationMenu(null);

  const mainWindow = createMainWindow();
  registerHandlers(mainWindow);
  createTray(mainWindow);

  // Create and show the floating overlay window
  createOverlayWindow();
  startDemoMode();

  // Mark tray as active now that the tray icon exists
  assistantStateManager.setFlags({ trayActive: true });

  // Forward tray navigation to renderer
  onNavigate((page) => {
    const win = getMainWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send('navigate:page', page);
    }
  });

  // Hide window immediately if launched at login (--hidden flag)
  if (shouldStartHidden()) {
    mainWindow.once('ready-to-show', () => {
      mainWindow.hide();
      lifecycleManager.enterBackground();
      logger.info('Window hidden — started in background (login startup)');
    });
  }

  // macOS: re-create or restore window on dock click
  app.on('activate', () => {
    const win = getMainWindow();
    if (!win) {
      const newWin = createMainWindow();
      registerHandlers(newWin);
    } else {
      win.show();
    }
    lifecycleManager.exitBackground();
    assistantStateManager.exitBackgroundMode();
  });

  // Signal ready
  assistantStateManager.markReady();
});

// --------------------------------------------------------------------------
// Clean shutdown — coordinate all managers
// --------------------------------------------------------------------------
app.on('before-quit', () => {
  logger.info('App quitting — cleaning up');
  lifecycleManager.setQuitting(true);

  // Sync tray manager quit flag (used by mainWindow close handler)
  const trayManager = require('../tray/trayManager');
  trayManager.setQuitting(true);

  assistantStateManager.shutdown();
  stopDemoMode();
  unregisterHandlers();
  unregisterOverlayIpc();
  destroyOverlay();
  destroyTray();
  destroyMainWindow();
});

// --------------------------------------------------------------------------
// Uncaught error handling
// --------------------------------------------------------------------------
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection:', reason);
});
