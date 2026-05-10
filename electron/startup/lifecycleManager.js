'use strict';

const { app, powerMonitor } = require('electron');
const logger = require('../utils/logger');

// ---------------------------------------------------------------------------
// Phase constants
// ---------------------------------------------------------------------------

/** @enum {string} */
const Phase = {
  INITIALIZING: 'initializing',
  RUNNING:      'running',
  BACKGROUND:   'background',   // window hidden, process alive
  SUSPENDED:    'suspended',    // system sleep / lock screen
  RESTARTING:   'restarting',
  QUITTING:     'quitting',
};

// ---------------------------------------------------------------------------
// Internal state
// ---------------------------------------------------------------------------

/** @type {Phase} */
let currentPhase = Phase.INITIALIZING;

/** @type {Set<() => void>} */
const phaseListeners = new Set();

/** @type {NodeJS.Timeout | null} */
let gcTimer = null;

/** Whether an intentional quit has been requested (vs. just hiding). */
let intentionalQuit = false;

// ---------------------------------------------------------------------------
// Phase management
// ---------------------------------------------------------------------------

function getPhase() {
  return currentPhase;
}

/**
 * Transition to a new lifecycle phase and notify all listeners.
 * @param {Phase} next
 */
function transitionTo(next) {
  if (next === currentPhase) return;
  const prev = currentPhase;
  currentPhase = next;
  logger.info(`Lifecycle: ${prev} → ${next}`);
  phaseListeners.forEach((cb) => {
    try { cb(next, prev); } catch (err) { logger.error('Phase listener error:', err); }
  });
}

/**
 * Register a callback invoked on every phase transition.
 * @param {(next: Phase, prev: Phase) => void} cb
 * @returns {() => void} Unsubscribe function
 */
function onPhaseChange(cb) {
  phaseListeners.add(cb);
  return () => phaseListeners.delete(cb);
}

// ---------------------------------------------------------------------------
// Quit intent
// ---------------------------------------------------------------------------

function requestQuit() {
  intentionalQuit = true;
  transitionTo(Phase.QUITTING);
  app.quit();
}

function isQuitting() {
  return intentionalQuit;
}

function setQuitting(value) {
  intentionalQuit = value;
  if (value) transitionTo(Phase.QUITTING);
}

// ---------------------------------------------------------------------------
// Background-mode helpers
// ---------------------------------------------------------------------------

/**
 * Enter background mode: the window is hidden but the process stays alive.
 * Electron already keeps running when all windows close; this just tracks it.
 */
function enterBackground() {
  if (currentPhase !== Phase.BACKGROUND) {
    transitionTo(Phase.BACKGROUND);
    scheduleGC();
  }
}

/**
 * Leave background mode: window is being restored.
 */
function exitBackground() {
  if (currentPhase === Phase.BACKGROUND) {
    transitionTo(Phase.RUNNING);
    cancelGC();
  }
}

// ---------------------------------------------------------------------------
// Periodic GC while in background to keep RSS low
// ---------------------------------------------------------------------------

const GC_INTERVAL_MS = 60 * 1000; // every 60 s

function scheduleGC() {
  cancelGC();
  gcTimer = setInterval(() => {
    if (global.gc) {
      global.gc();
      logger.debug('Background GC cycle completed');
    }
  }, GC_INTERVAL_MS);
  // Do not prevent the process from exiting due to this timer
  if (gcTimer.unref) gcTimer.unref();
}

function cancelGC() {
  if (gcTimer) {
    clearInterval(gcTimer);
    gcTimer = null;
  }
}

// ---------------------------------------------------------------------------
// Power / system events
// ---------------------------------------------------------------------------

function attachPowerMonitor() {
  try {
    powerMonitor.on('suspend', () => {
      logger.info('System suspending — entering suspended phase');
      transitionTo(Phase.SUSPENDED);
    });

    powerMonitor.on('resume', () => {
      logger.info('System resumed');
      // Return to whichever phase makes sense
      transitionTo(intentionalQuit ? Phase.QUITTING : Phase.RUNNING);
    });

    powerMonitor.on('lock-screen', () => {
      logger.debug('Screen locked');
      if (currentPhase === Phase.RUNNING) transitionTo(Phase.BACKGROUND);
    });

    powerMonitor.on('unlock-screen', () => {
      logger.debug('Screen unlocked');
      if (currentPhase === Phase.BACKGROUND) transitionTo(Phase.RUNNING);
    });

    powerMonitor.on('shutdown', () => {
      logger.info('System shutdown detected — forcing clean exit');
      intentionalQuit = true;
      transitionTo(Phase.QUITTING);
    });
  } catch (err) {
    // powerMonitor may throw in headless/test environments
    logger.warn('powerMonitor unavailable:', err.message);
  }
}

// ---------------------------------------------------------------------------
// App-event wiring
// ---------------------------------------------------------------------------

/**
 * Wire all Electron app lifecycle events to phase transitions.
 * Call once after app.whenReady().
 */
function wire() {
  transitionTo(Phase.RUNNING);
  attachPowerMonitor();

  // Prevent default quit when all windows close — keep running in tray
  app.on('window-all-closed', (event) => {
    if (!intentionalQuit) {
      event.preventDefault?.();
      enterBackground();
    }
  });

  app.on('before-quit', () => {
    intentionalQuit = true;
    transitionTo(Phase.QUITTING);
    cancelGC();
  });

  app.on('will-quit', () => {
    logger.info('App will quit — final cleanup');
    cancelGC();
  });

  // macOS: dock click — leave background
  app.on('activate', () => {
    exitBackground();
  });

  logger.info('Lifecycle manager wired');
}

// ---------------------------------------------------------------------------
// Crash recovery / restart
// ---------------------------------------------------------------------------

/**
 * Schedule a graceful restart of the application.
 * @param {number} [delayMs=500]
 */
function scheduleRestart(delayMs = 500) {
  logger.info(`Scheduling restart in ${delayMs}ms`);
  transitionTo(Phase.RESTARTING);
  setTimeout(() => {
    app.relaunch();
    intentionalQuit = true;
    app.quit();
  }, delayMs);
}

// ---------------------------------------------------------------------------
// Exports
// ---------------------------------------------------------------------------

module.exports = {
  Phase,
  getPhase,
  transitionTo,
  onPhaseChange,
  requestQuit,
  isQuitting,
  setQuitting,
  enterBackground,
  exitBackground,
  wire,
  scheduleRestart,
};
