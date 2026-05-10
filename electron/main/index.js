'use strict';

const { app, Menu } = require('electron');
const { createMainWindow, getMainWindow, destroyMainWindow } = require('../windows/mainWindow');
const { registerHandlers, unregisterHandlers } = require('../ipc/handlers');
const { createTray, destroyTray, setQuitting, onNavigate } = require('../tray/trayManager');
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
    const { restoreWindow } = require('../tray/trayManager');
    restoreWindow(getMainWindow());
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
  createTray(mainWindow);

  // Forward tray navigation requests to the renderer
  onNavigate((page) => {
    const win = getMainWindow();
    if (win && !win.isDestroyed()) {
      win.webContents.send('navigate:page', page);
    }
  });

  // Keep the process alive when all windows are closed (tray keeps it running)
  app.on('window-all-closed', (event) => {
    if (process.platform !== 'darwin') {
      // Do not quit — tray is still active
      event.preventDefault?.();
    }
  });

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

app.on('before-quit', () => {
  logger.info('App quitting — cleaning up');
  setQuitting(true);
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
