'use strict';

const { Notification, shell } = require('electron');
const { getMainWindow } = require('../windows/mainWindow');
const logger = require('../utils/logger');

/** @type {Map<string, Electron.Notification>} */
const activeNotifications = new Map();

let notificationsEnabled = true;

const NOTIFICATION_ICONS = {
  success: null, // will use app icon
  error: null,
  info: null,
  warning: null,
};

/**
 * @typedef {Object} NotificationOptions
 * @property {string} id - unique id to prevent duplicates
 * @property {'success'|'error'|'info'|'warning'} [type]
 * @property {string} title
 * @property {string} body
 * @property {string} [actionUrl] - URL or page to open on click
 * @property {string} [actionPage] - App page to navigate to on click
 * @property {boolean} [silent]
 * @property {number} [timeoutMs] - auto-dismiss timeout
 */

/**
 * Show a desktop notification if enabled.
 * @param {NotificationOptions} opts
 * @returns {Electron.Notification|null}
 */
function showNotification(opts) {
  if (!notificationsEnabled) return null;
  if (!Notification.isSupported()) {
    logger.warn('Desktop notifications not supported on this platform');
    return null;
  }

  // Dismiss existing notification with same id
  if (opts.id && activeNotifications.has(opts.id)) {
    try { activeNotifications.get(opts.id).close(); } catch (_) {}
    activeNotifications.delete(opts.id);
  }

  const notification = new Notification({
    title: opts.title,
    body: opts.body,
    silent: opts.silent ?? false,
    urgency: opts.type === 'error' ? 'critical' : 'normal',
  });

  notification.on('click', () => {
    const win = getMainWindow();
    if (win) {
      if (!win.isVisible()) win.show();
      win.focus();
    }
    if (opts.actionUrl) {
      const allowed = /^https?:\/\//.test(opts.actionUrl);
      if (allowed) shell.openExternal(opts.actionUrl);
    }
    if (opts.actionPage && win) {
      win.webContents.send('navigate:page', opts.actionPage);
    }
  });

  notification.on('close', () => {
    if (opts.id) activeNotifications.delete(opts.id);
  });

  notification.show();

  if (opts.id) activeNotifications.set(opts.id, notification);

  if (opts.timeoutMs) {
    setTimeout(() => {
      try { notification.close(); } catch (_) {}
      if (opts.id) activeNotifications.delete(opts.id);
    }, opts.timeoutMs);
  }

  logger.debug(`Notification shown: [${opts.type ?? 'info'}] ${opts.title}`);
  return notification;
}

function dismissNotification(id) {
  if (activeNotifications.has(id)) {
    try { activeNotifications.get(id).close(); } catch (_) {}
    activeNotifications.delete(id);
  }
}

function dismissAll() {
  for (const [id, n] of activeNotifications) {
    try { n.close(); } catch (_) {}
    activeNotifications.delete(id);
  }
}

function setEnabled(enabled) {
  notificationsEnabled = enabled;
  logger.info(`Notifications ${enabled ? 'enabled' : 'disabled'}`);
}

function isEnabled() { return notificationsEnabled; }

// Convenience helpers
const notify = {
  workflowComplete: (workflowName, customer) =>
    showNotification({
      id: `workflow-complete-${Date.now()}`,
      type: 'success',
      title: 'Workflow Complete',
      body: `${workflowName} for ${customer} completed successfully.`,
      actionPage: 'workflow',
      timeoutMs: 6000,
    }),

  workflowFailed: (workflowName, customer, reason) =>
    showNotification({
      id: `workflow-failed-${Date.now()}`,
      type: 'error',
      title: 'Workflow Failed',
      body: `${workflowName} for ${customer} failed: ${reason}`,
      actionPage: 'logs',
      timeoutMs: 10000,
    }),

  assistantReady: () =>
    showNotification({
      id: 'assistant-ready',
      type: 'info',
      title: 'Atlas AI Ready',
      body: 'Assistant is running in the background. Say "Hey Atlas" to begin.',
      silent: true,
      timeoutMs: 4000,
    }),

  listeningStarted: () =>
    showNotification({
      id: 'listening',
      type: 'info',
      title: 'Atlas AI — Listening',
      body: 'Speak your command now.',
      silent: true,
      timeoutMs: 3000,
    }),
};

module.exports = { showNotification, dismissNotification, dismissAll, setEnabled, isEnabled, notify };
