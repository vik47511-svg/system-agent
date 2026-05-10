'use strict';

const { EventEmitter } = require('events');
const logger = require('../utils/logger');

// ---------------------------------------------------------------------------
// State constants
// ---------------------------------------------------------------------------

/** @enum {string} */
const AssistantState = {
  OFFLINE:      'offline',
  INITIALIZING: 'initializing',
  IDLE:         'idle',
  ACTIVE:       'active',
  BUSY:         'busy',
  ERROR:        'error',
  SHUTDOWN:     'shutdown',
};

// ---------------------------------------------------------------------------
// Background execution flags
// ---------------------------------------------------------------------------

/**
 * @typedef {Object} BackgroundFlags
 * @property {boolean} wakeWordEnabled  - always-on microphone listening
 * @property {boolean} notificationsEnabled
 * @property {boolean} trayActive
 * @property {boolean} reducedPolling   - lower CPU when screen is locked
 */

/** @type {BackgroundFlags} */
const DEFAULT_FLAGS = {
  wakeWordEnabled: true,
  notificationsEnabled: true,
  trayActive: false,
  reducedPolling: false,
};

// ---------------------------------------------------------------------------
// Core class
// ---------------------------------------------------------------------------

class AssistantStateManager extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(30);

    /** @type {AssistantState} */
    this._state = AssistantState.OFFLINE;

    /** @type {BackgroundFlags} */
    this._flags = { ...DEFAULT_FLAGS };

    /** @type {Map<string, unknown>} - arbitrary key/value metadata */
    this._meta = new Map();

    /** @type {number} - monotonically increasing state revision */
    this._revision = 0;

    /** @type {string | null} - ISO timestamp of last transition */
    this._lastTransitionAt = null;

    /** @type {number} - uptime counter start (ms) */
    this._uptimeStart = Date.now();
  }

  // -------------------------------------------------------------------------
  // State transitions
  // -------------------------------------------------------------------------

  /** @returns {AssistantState} */
  get state() {
    return this._state;
  }

  /**
   * Transition to a new assistant state.
   * Emits 'state-change' with { next, prev, revision }.
   * @param {AssistantState} next
   * @param {string} [reason]
   */
  setState(next, reason) {
    if (!Object.values(AssistantState).includes(next)) {
      logger.warn(`Unknown assistant state: ${next}`);
      return;
    }
    if (next === this._state) return;

    const prev = this._state;
    this._state = next;
    this._revision += 1;
    this._lastTransitionAt = new Date().toISOString();

    logger.info(`Assistant: ${prev} → ${next}${reason ? ` (${reason})` : ''}`);
    this.emit('state-change', { next, prev, revision: this._revision });
  }

  // -------------------------------------------------------------------------
  // Background flags
  // -------------------------------------------------------------------------

  /**
   * Read a background flag.
   * @param {keyof BackgroundFlags} key
   */
  getFlag(key) {
    return this._flags[key];
  }

  /**
   * Set one or more background flags.
   * Emits 'flags-change' with the delta.
   * @param {Partial<BackgroundFlags>} delta
   */
  setFlags(delta) {
    const changed = {};
    for (const [k, v] of Object.entries(delta)) {
      if (this._flags[k] !== v) {
        this._flags[k] = v;
        changed[k] = v;
      }
    }
    if (Object.keys(changed).length > 0) {
      logger.debug('Background flags updated:', changed);
      this.emit('flags-change', changed);
    }
  }

  /** @returns {Readonly<BackgroundFlags>} */
  get flags() {
    return Object.freeze({ ...this._flags });
  }

  // -------------------------------------------------------------------------
  // Metadata store
  // -------------------------------------------------------------------------

  setMeta(key, value) {
    this._meta.set(key, value);
  }

  getMeta(key) {
    return this._meta.get(key) ?? null;
  }

  deleteMeta(key) {
    this._meta.delete(key);
  }

  // -------------------------------------------------------------------------
  // Lifecycle helpers
  // -------------------------------------------------------------------------

  /** Mark the assistant as ready after app init. */
  markReady() {
    this.setState(AssistantState.IDLE, 'app-ready');
    this._flags.trayActive = true;
    logger.info('Assistant state manager: ready');
  }

  /**
   * Enter reduced-resource mode when the app is in background.
   * Lowers polling frequency, disables non-essential background tasks.
   */
  enterBackgroundMode() {
    this.setFlags({ reducedPolling: true });
    if (this._state === AssistantState.IDLE) {
      this.setState(AssistantState.IDLE, 'background');
    }
    logger.debug('Assistant: entered background mode');
  }

  /** Restore normal resource usage when the app window is visible again. */
  exitBackgroundMode() {
    this.setFlags({ reducedPolling: false });
    logger.debug('Assistant: exited background mode');
  }

  /** Initiate clean shutdown sequence. */
  shutdown() {
    this.setState(AssistantState.SHUTDOWN, 'shutdown-requested');
    this._flags = { ...DEFAULT_FLAGS, trayActive: false };
    this.removeAllListeners();
    logger.info('Assistant state manager: shutdown complete');
  }

  // -------------------------------------------------------------------------
  // Diagnostics
  // -------------------------------------------------------------------------

  /** @returns {{ state: string; flags: BackgroundFlags; revision: number; uptimeMs: number; lastTransitionAt: string | null }} */
  snapshot() {
    return {
      state: this._state,
      flags: { ...this._flags },
      revision: this._revision,
      uptimeMs: Date.now() - this._uptimeStart,
      lastTransitionAt: this._lastTransitionAt,
    };
  }
}

// ---------------------------------------------------------------------------
// Singleton export
// ---------------------------------------------------------------------------

/** @type {AssistantStateManager} */
const assistantStateManager = new AssistantStateManager();

module.exports = {
  AssistantState,
  assistantStateManager,
  AssistantStateManager,
};
