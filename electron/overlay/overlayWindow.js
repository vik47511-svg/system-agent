'use strict';

const { BrowserWindow, screen } = require('electron');
const path = require('path');
const { getPreloadPath, isDev, DEV_SERVER_URL, FRONTEND_DIST } = require('../utils/env');
const logger = require('../utils/logger');

/** @type {BrowserWindow | null} */
let overlayWindow = null;

const OVERLAY_WIDTH = 280;
const OVERLAY_HEIGHT = 88;
const MARGIN = 20;

const OVERLAY_CONFIG = {
  width: OVERLAY_WIDTH,
  height: OVERLAY_HEIGHT,
  resizable: false,
  movable: true,
  minimizable: false,
  maximizable: false,
  fullscreenable: false,
  skipTaskbar: true,
  alwaysOnTop: true,
  frame: false,
  transparent: true,
  hasShadow: true,
  show: false,
  webPreferences: {
    preload: getPreloadPath(),
    contextIsolation: true,
    nodeIntegration: false,
    sandbox: true,
    webSecurity: true,
  },
};

function getOverlayPosition() {
  const display = screen.getPrimaryDisplay();
  const { width, height } = display.workAreaSize;
  return {
    x: width - OVERLAY_WIDTH - MARGIN,
    y: height - OVERLAY_HEIGHT - MARGIN,
  };
}

function buildOverlayUrl() {
  if (isDev) return `${DEV_SERVER_URL}/?overlay=1`;
  return `file://${path.join(FRONTEND_DIST, 'index.html')}?overlay=1`;
}

function createOverlayWindow() {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.show();
    return overlayWindow;
  }

  logger.info('Creating overlay window');

  const { x, y } = getOverlayPosition();

  overlayWindow = new BrowserWindow({
    ...OVERLAY_CONFIG,
    x,
    y,
  });

  overlayWindow.loadURL(buildOverlayUrl());

  overlayWindow.once('ready-to-show', () => {
    overlayWindow.show();
    logger.debug('Overlay window ready');
  });

  overlayWindow.on('closed', () => {
    overlayWindow = null;
    logger.debug('Overlay window closed');
  });

  // Prevent navigation away
  overlayWindow.webContents.on('will-navigate', (event) => {
    event.preventDefault();
  });

  overlayWindow.webContents.setWindowOpenHandler(() => ({ action: 'deny' }));

  return overlayWindow;
}

function showOverlay() {
  if (!overlayWindow || overlayWindow.isDestroyed()) {
    createOverlayWindow();
    return;
  }
  const { x, y } = getOverlayPosition();
  overlayWindow.setPosition(x, y);
  overlayWindow.show();
  logger.debug('Overlay shown');
}

function hideOverlay() {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.hide();
    logger.debug('Overlay hidden');
  }
}

function destroyOverlay() {
  if (overlayWindow && !overlayWindow.isDestroyed()) {
    overlayWindow.destroy();
  }
  overlayWindow = null;
}

function getOverlayWindow() {
  return overlayWindow;
}

function isOverlayVisible() {
  return overlayWindow && !overlayWindow.isDestroyed() && overlayWindow.isVisible();
}

/**
 * Push state updates from main process to the overlay renderer.
 * @param {string} channel
 * @param  {...any} args
 */
function sendToOverlay(channel, ...args) {
  if (overlayWindow && !overlayWindow.isDestroyed() && overlayWindow.webContents) {
    overlayWindow.webContents.send(channel, ...args);
  }
}

/**
 * Snap the overlay to a corner of the primary display.
 * @param {'bottom-right'|'bottom-left'|'top-right'|'top-left'} corner
 */
function snapToCorner(corner = 'bottom-right') {
  if (!overlayWindow || overlayWindow.isDestroyed()) return;
  const display = screen.getPrimaryDisplay();
  const { width, height } = display.workAreaSize;

  let x, y;
  switch (corner) {
    case 'bottom-left':  x = MARGIN; y = height - OVERLAY_HEIGHT - MARGIN; break;
    case 'top-right':    x = width - OVERLAY_WIDTH - MARGIN; y = MARGIN; break;
    case 'top-left':     x = MARGIN; y = MARGIN; break;
    default:             x = width - OVERLAY_WIDTH - MARGIN; y = height - OVERLAY_HEIGHT - MARGIN;
  }
  overlayWindow.setPosition(x, y);
}

module.exports = {
  createOverlayWindow,
  showOverlay,
  hideOverlay,
  destroyOverlay,
  getOverlayWindow,
  isOverlayVisible,
  sendToOverlay,
  snapToCorner,
};
