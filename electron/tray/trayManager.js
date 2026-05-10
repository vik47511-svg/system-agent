'use strict';

const { Tray, Menu, nativeImage, app } = require('electron');
const path = require('path');
const logger = require('../utils/logger');

/** @type {Tray | null} */
let tray = null;

/** @type {(() => void) | null} — injected by main to navigate renderer */
let navigateCallback = null;

/** @type {boolean} — tracks whether close should quit or hide to tray */
let isQuitting = false;

/**
 * Called by main process to signal an intentional quit so the close handler
 * knows not to intercept the window-close event.
 */
function setQuitting(value) {
  isQuitting = value;
}

function getIsQuitting() {
  return isQuitting;
}

/**
 * Register a callback invoked when a tray menu item requests page navigation.
 * The callback receives a page-name string matching the app's route map.
 * @param {(page: string) => void} cb
 */
function onNavigate(cb) {
  navigateCallback = cb;
}

function navigate(page) {
  if (typeof navigateCallback === 'function') {
    navigateCallback(page);
  }
}

// --------------------------------------------------------------------------
// Icon helpers
// --------------------------------------------------------------------------

/**
 * Attempt to load a tray icon from the assets directory.
 * Falls back to a programmatically-generated 16x16 monochrome icon so the
 * tray always has something visible even without bundled assets.
 */
function loadTrayIcon() {
  try {
    const iconFile = process.platform === 'win32' ? 'tray.ico' : 'tray.png';
    const iconPath = path.join(__dirname, '..', '..', 'assets', 'icons', iconFile);
    const img = nativeImage.createFromPath(iconPath);
    if (!img.isEmpty()) return img;
  } catch (_) {
    // asset not present — fall through to generated icon
  }
  return generateFallbackIcon();
}

/**
 * Generates a small Atlas logo as a NativeImage using raw ARGB pixel data.
 * The icon is a 16x16 white square with a simple cross-hatch that's visible
 * on both light and dark system tray backgrounds.
 */
function generateFallbackIcon() {
  const SIZE = 16;
  const buf = Buffer.alloc(SIZE * SIZE * 4); // RGBA

  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const i = (y * SIZE + x) * 4;
      // Draw a simple diamond shape
      const cx = SIZE / 2 - 0.5;
      const cy = SIZE / 2 - 0.5;
      const dist = Math.abs(x - cx) + Math.abs(y - cy);
      const alpha = dist <= 6 ? 220 : 0;
      buf[i + 0] = 255; // R
      buf[i + 1] = 255; // G
      buf[i + 2] = 255; // B
      buf[i + 3] = alpha;
    }
  }

  return nativeImage.createFromBuffer(buf, { width: SIZE, height: SIZE });
}

// --------------------------------------------------------------------------
// Menu builder — called on creation and whenever state changes
// --------------------------------------------------------------------------

/**
 * @param {Electron.BrowserWindow | null} win
 */
function buildContextMenu(win) {
  const isVisible = win && !win.isDestroyed() && win.isVisible();

  return Menu.buildFromTemplate([
    {
      label: 'Atlas AI',
      enabled: false,
      // Acts as a non-clickable header
    },
    { type: 'separator' },
    {
      label: isVisible ? 'Focus Window' : 'Open Assistant',
      accelerator: process.platform === 'darwin' ? 'Cmd+Shift+A' : undefined,
      click: () => restoreWindow(win),
    },
    {
      label: 'Show Logs',
      click: () => {
        restoreWindow(win);
        navigate('logs');
      },
    },
    {
      label: 'Settings',
      click: () => {
        restoreWindow(win);
        navigate('settings');
      },
    },
    { type: 'separator' },
    {
      label: 'Exit',
      click: () => {
        setQuitting(true);
        app.quit();
      },
    },
  ]);
}

// --------------------------------------------------------------------------
// Window restore helper
// --------------------------------------------------------------------------

/**
 * Bring the main window to the foreground. Handles minimized, hidden, and
 * already-visible states across Windows and macOS.
 * @param {Electron.BrowserWindow | null} win
 */
function restoreWindow(win) {
  if (!win || win.isDestroyed()) return;

  if (win.isMinimized()) win.restore();
  if (!win.isVisible()) win.show();
  win.focus();

  // Windows: ensure the taskbar button flashes / window is foregrounded
  if (process.platform === 'win32') {
    win.setSkipTaskbar(false);
  }
}

// --------------------------------------------------------------------------
// Public API
// --------------------------------------------------------------------------

/**
 * Create the system tray and wire up all event handlers.
 * Safe to call multiple times — returns existing tray if already created.
 * @param {Electron.BrowserWindow} mainWindow
 * @returns {Tray | null}
 */
function createTray(mainWindow) {
  if (tray && !tray.isDestroyed()) return tray;

  try {
    const icon = loadTrayIcon();
    tray = new Tray(icon);

    tray.setToolTip('Atlas AI — Operations Assistant');
    tray.setContextMenu(buildContextMenu(mainWindow));

    // Single-click: toggle window visibility
    tray.on('click', () => {
      const win = mainWindow && !mainWindow.isDestroyed() ? mainWindow : null;
      if (!win) return;

      if (win.isVisible() && win.isFocused()) {
        // Already front-and-center — minimise to tray
        win.hide();
        if (process.platform === 'win32') {
          win.setSkipTaskbar(true);
        }
      } else {
        restoreWindow(win);
      }
    });

    // Double-click on Windows raises the window directly
    tray.on('double-click', () => {
      restoreWindow(mainWindow);
    });

    // Rebuild the menu whenever the window visibility changes so the label
    // reflects current state ("Open Assistant" vs "Focus Window")
    if (mainWindow && !mainWindow.isDestroyed()) {
      mainWindow.on('show', () => tray && tray.setContextMenu(buildContextMenu(mainWindow)));
      mainWindow.on('hide', () => tray && tray.setContextMenu(buildContextMenu(mainWindow)));
    }

    logger.info('System tray created');
  } catch (err) {
    logger.warn('Tray creation failed (expected in headless/CI env):', err.message);
    return null;
  }

  return tray;
}

/**
 * Refresh the tray context menu. Call after window state changes that are not
 * covered by the automatic show/hide listeners.
 * @param {Electron.BrowserWindow | null} win
 */
function refreshMenu(win) {
  if (tray && !tray.isDestroyed()) {
    tray.setContextMenu(buildContextMenu(win));
  }
}

/**
 * Cleanly destroy the tray icon and release all references.
 */
function destroyTray() {
  if (tray && !tray.isDestroyed()) {
    tray.destroy();
  }
  tray = null;
  navigateCallback = null;
  logger.debug('Tray destroyed');
}

/**
 * Returns the active Tray instance, or null if not yet created / destroyed.
 * @returns {Tray | null}
 */
function getTray() {
  return tray && !tray.isDestroyed() ? tray : null;
}

module.exports = {
  createTray,
  destroyTray,
  getTray,
  refreshMenu,
  setQuitting,
  getIsQuitting,
  onNavigate,
  restoreWindow,
};
