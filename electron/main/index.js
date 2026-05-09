'use strict';

const { app, Menu } = require('electron');
const { createMainWindow, getMainWindow, destroyMainWindow } = require('../windows/mainWindow');
const { registerHandlers, unregisterHandlers } = require('../ipc/handlers');
const { createTray, destroyTray } = require('../tray/trayManager');
const logger = require('../utils/logger');
const { isDev } = require('../utils/env');

// --------------------------------------------------------------------------
// Security: lock down renderer permissions globally
// --------------------------------------------------------------------------
app.on('web-contents-created', (_event, contents) => {
  // Block new window creation from renderer
  contents.setWindowOpenHandler(() => ({ action: 'deny' }));

  // Prevent permission requests for sensitive APIs unless explicitly needed
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
    const win = getMainWindow();
    if (win) {
      if (win.isMinimized()) win.restore();
      win.focus();
    }
  });
}

// --------------------------------------------------------------------------
// App lifecycle
// --------------------------------------------------------------------------
app.whenReady().then(() => {
  logger.info(`Atlas AI starting — Electron ${process.versions.electron} / Node ${process.versions.node}`);
  logger.info(`Mode: ${isDev ? 'development' : 'production'}`);

  // Remove the default application menu
  Menu.setApplicationMenu(null);

  const mainWindow = createMainWindow();
  registerHandlers(mainWindow);
  createTray();

  app.on('activate', () => {
    // macOS: re-create window when dock icon is clicked and no windows are open
    if (!getMainWindow()) {
      const win = createMainWindow();
      registerHandlers(win);
    } else {
      getMainWindow().show();
    }
  });
});

app.on('window-all-closed', () => {
  // On macOS keep the process alive (standard macOS convention)
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('before-quit', () => {
  logger.info('App quitting — cleaning up');
  unregisterHandlers();
  destroyTray();
  destroyMainWindow();
});

// Handle uncaught errors gracefully
process.on('uncaughtException', (err) => {
  logger.error('Uncaught exception:', err);
});

process.on('unhandledRejection', (reason) => {
  logger.error('Unhandled rejection:', reason);
});
