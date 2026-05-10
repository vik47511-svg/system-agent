'use strict';

const { app } = require('electron');
const logger = require('../utils/logger');

const LOGIN_ITEM_SETTINGS = {
  openAtLogin: true,
  // On Windows, pass --hidden so the window starts minimized to tray
  args: process.platform === 'win32' ? ['--hidden'] : [],
};

/**
 * Enable or disable launching Atlas AI on Windows startup (login items on macOS).
 * @param {boolean} enabled
 */
function setLaunchOnStartup(enabled) {
  if (process.platform !== 'win32' && process.platform !== 'darwin') {
    logger.debug(`Launch-on-startup not supported on ${process.platform}`);
    return;
  }

  try {
    app.setLoginItemSettings({
      ...LOGIN_ITEM_SETTINGS,
      openAtLogin: enabled,
    });
    logger.info(`Launch on startup ${enabled ? 'enabled' : 'disabled'}`);
  } catch (err) {
    logger.error('Failed to set login item settings:', err);
  }
}

/**
 * Returns the current login-item state reported by Electron.
 * @returns {{ openAtLogin: boolean; openAsHidden: boolean; wasOpenedAtLogin: boolean; wasOpenedAsHidden: boolean; restoreState: boolean } | null}
 */
function getLaunchOnStartupSettings() {
  if (process.platform !== 'win32' && process.platform !== 'darwin') {
    return null;
  }
  try {
    return app.getLoginItemSettings({ args: LOGIN_ITEM_SETTINGS.args });
  } catch (err) {
    logger.error('Failed to read login item settings:', err);
    return null;
  }
}

/**
 * Returns true if the app was launched automatically at login (not by the user).
 */
function wasLaunchedAtLogin() {
  const settings = getLaunchOnStartupSettings();
  return settings ? settings.wasOpenedAtLogin === true : false;
}

/**
 * Returns true if the app should start hidden (minimized to tray).
 * Applies when launched at login with the --hidden flag.
 */
function shouldStartHidden() {
  if (process.argv.includes('--hidden')) return true;
  const settings = getLaunchOnStartupSettings();
  return settings ? settings.wasOpenedAsHidden === true : false;
}

/**
 * Ensure startup is registered during first launch.
 * Skips if already registered or if running in development.
 * @param {boolean} [force=false] Override dev-mode guard
 */
function ensureStartupRegistered(force = false) {
  const { isDev } = require('../utils/env');
  if (isDev && !force) {
    logger.debug('Skipping startup registration in development mode');
    return;
  }

  const settings = getLaunchOnStartupSettings();
  if (!settings) return;

  if (!settings.openAtLogin) {
    setLaunchOnStartup(true);
  } else {
    logger.debug('Launch on startup already registered');
  }
}

module.exports = {
  setLaunchOnStartup,
  getLaunchOnStartupSettings,
  wasLaunchedAtLogin,
  shouldStartHidden,
  ensureStartupRegistered,
};
