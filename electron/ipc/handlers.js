const { ipcMain, app, shell } = require('electron');
const { CHANNELS } = require('./channels');
const logger = require('../utils/logger');

function registerHandlers(mainWindow) {
  // App version
  ipcMain.handle(CHANNELS.APP_VERSION, () => app.getVersion());

  // App quit
  ipcMain.handle(CHANNELS.APP_QUIT, () => {
    logger.info('Quit requested via IPC');
    app.quit();
  });

  // Window controls
  ipcMain.handle(CHANNELS.APP_MINIMIZE, () => {
    mainWindow?.minimize();
  });

  ipcMain.handle(CHANNELS.APP_MAXIMIZE, () => {
    if (!mainWindow) return;
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  });

  ipcMain.handle(CHANNELS.APP_IS_MAXIMIZED, () => mainWindow?.isMaximized() ?? false);

  // System info
  ipcMain.handle(CHANNELS.SYSTEM_INFO, () => ({
    platform: process.platform,
    arch: process.arch,
    nodeVersion: process.versions.node,
    electronVersion: process.versions.electron,
    chromeVersion: process.versions.chrome,
  }));

  // Open external URL safely
  ipcMain.handle(CHANNELS.OPEN_EXTERNAL, async (_event, url) => {
    const allowed = /^https?:\/\//.test(url);
    if (!allowed) {
      logger.warn(`Blocked external open for non-http URL: ${url}`);
      return { success: false, reason: 'URL must use http or https' };
    }
    await shell.openExternal(url);
    return { success: true };
  });

  // Settings (in-memory stub — swap for electron-store in production)
  const store = new Map();

  ipcMain.handle(CHANNELS.SETTINGS_GET, (_event, key) => store.get(key) ?? null);

  ipcMain.handle(CHANNELS.SETTINGS_SET, (_event, key, value) => {
    store.set(key, value);
    return true;
  });

  logger.info('IPC handlers registered');
}

function unregisterHandlers() {
  Object.values(CHANNELS).forEach((channel) => {
    ipcMain.removeAllListeners(channel);
  });
}

module.exports = { registerHandlers, unregisterHandlers };
