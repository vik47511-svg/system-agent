const { BrowserWindow, shell } = require('electron');
const path = require('path');
const { getEntryUrl, getPreloadPath, isDev } = require('../utils/env');
const logger = require('../utils/logger');

// Lazy-require to avoid circular dependency at module load time
function getTrayModule() {
  return require('../tray/trayManager');
}

/** @type {BrowserWindow | null} */
let mainWindow = null;

const WINDOW_CONFIG = {
  width: 1440,
  height: 900,
  minWidth: 1024,
  minHeight: 640,
  show: false, // show after ready-to-show to avoid flash
  titleBarStyle: 'hiddenInset',
  backgroundColor: '#020817', // matches app background
  webPreferences: {
    preload: getPreloadPath(),
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true,
    webSecurity: true,
    allowRunningInsecureContent: false,
    experimentalFeatures: false,
  },
};

function createMainWindow() {
  logger.info('Creating main window');

  mainWindow = new BrowserWindow(WINDOW_CONFIG);

  // Show once content is ready to avoid white flash
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
    if (isDev) {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  });

  // Block navigation to external URLs; open them in the OS browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://') || url.startsWith('https://')) {
      shell.openExternal(url);
    }
    return { action: 'deny' };
  });

  mainWindow.webContents.on('will-navigate', (event, url) => {
    const entryUrl = getEntryUrl();
    if (!url.startsWith(entryUrl)) {
      event.preventDefault();
      logger.warn(`Blocked navigation to: ${url}`);
    }
  });

  // Intercept close: hide to tray unless the app is actually quitting
  mainWindow.on('close', (event) => {
    const { getIsQuitting } = getTrayModule();
    if (!getIsQuitting()) {
      event.preventDefault();
      mainWindow.hide();
      // Remove from taskbar while hidden on Windows
      if (process.platform === 'win32') {
        mainWindow.setSkipTaskbar(true);
      }
      logger.debug('Window hidden to tray');
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });

  const entryUrl = getEntryUrl();
  logger.info(`Loading: ${entryUrl}`);
  mainWindow.loadURL(entryUrl);

  return mainWindow;
}

function getMainWindow() {
  return mainWindow;
}

function destroyMainWindow() {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.destroy();
  }
  mainWindow = null;
}

module.exports = { createMainWindow, getMainWindow, destroyMainWindow };
