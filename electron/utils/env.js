const path = require('path');

const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
const isTest = process.env.NODE_ENV === 'test';

const DEV_SERVER_URL = process.env.VITE_DEV_SERVER_URL || 'http://localhost:5173';

const APP_ROOT = path.join(__dirname, '..', '..');
const FRONTEND_DIST = path.join(APP_ROOT, 'dist', 'frontend');

function getEntryUrl() {
  if (isDev) return DEV_SERVER_URL;
  return `file://${path.join(FRONTEND_DIST, 'index.html')}`;
}

function getPreloadPath() {
  return path.join(__dirname, '..', 'preload', 'preload.js');
}

function getOverlayPreloadPath() {
  return path.join(__dirname, '..', 'preload', 'overlayPreload.js');
}

function getOverlayUrl() {
  if (isDev) return `${DEV_SERVER_URL}/overlay/index.html`;
  return `file://${path.join(FRONTEND_DIST, 'overlay', 'index.html')}`;
}

function getIconPath() {
  const iconFile = process.platform === 'win32' ? 'icon.ico'
    : process.platform === 'darwin' ? 'icon.icns'
    : 'icon.png';
  return path.join(APP_ROOT, 'assets', 'icons', iconFile);
}

module.exports = { isDev, isTest, DEV_SERVER_URL, APP_ROOT, FRONTEND_DIST, getEntryUrl, getPreloadPath, getOverlayPreloadPath, getOverlayUrl, getIconPath };
