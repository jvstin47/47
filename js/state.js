/**
 * @file state.js
 * @description Centralized reactive application state management using Pub/Sub.
 * Coordinates UI states, persistent preferences, and cross-component reactivity.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['./config', './utils/error-handler'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./config'), require('./utils/error-handler'));
  } else {
    root.Store = factory(root.AppConfig, root.ErrorHandler);
  }
})(typeof self !== 'undefined' ? self : this, function (config, errorHandler) {
  'use strict';

  class Store {
    constructor() {
      const storageKey = config?.storageKeys?.theme || 'portfolio_theme_mode';
      const legacyKey = config?.storageKeys?.legacyTheme || 'theme';

      // Detect stored theme or system preference
      const savedTheme = errorHandler.getStorage(storageKey) || errorHandler.getStorage(legacyKey);
      const prefersLight = typeof window !== 'undefined' &&
        window.matchMedia &&
        window.matchMedia('(prefers-color-scheme: light)').matches;

      const initialTheme = savedTheme === 'light' || (!savedTheme && prefersLight) ? 'light' : 'dark';

      this.state = {
        theme: initialTheme,
        isTerminalOpen: false,
        isTerminalMaximized: false,
        terminalCurrentDir: '~/projects',
        activeHeroTab: 'sim',
        photoDeckIndex: 0,
        photoDeckPaused: false,
        isMobileNavOpen: false,
        activeFilter: 'all',
        activeSection: 'hero',
        viewportModal: {
          isOpen: false,
          title: '',
          content: ''
        }
      };

      this.listeners = new Map();
    }

    /**
     * Get snapshot of current state or specific key
     * @param {string} [key]
     * @returns {*}
     */
    getState(key) {
      return key ? this.state[key] : Object.freeze({ ...this.state });
    }

    /**
     * Update state and notify subscribers
     * @param {object} partialState
     */
    setState(partialState) {
      if (!partialState || typeof partialState !== 'object') return;

      const changedKeys = [];

      for (const [key, value] of Object.entries(partialState)) {
        if (this.state[key] !== value) {
          this.state[key] = value;
          changedKeys.push(key);

          // Handle special persistent side-effects
          if (key === 'theme') {
            const storageKey = config?.storageKeys?.theme || 'portfolio_theme_mode';
            errorHandler.setStorage(storageKey, value);
            errorHandler.setStorage(config?.storageKeys?.legacyTheme || 'theme', value);
          }
        }
      }

      // Notify key-specific subscribers and wildcard subscribers
      changedKeys.forEach((key) => {
        if (this.listeners.has(key)) {
          this.listeners.get(key).forEach((cb) => {
            errorHandler.safeExecute(() => cb(this.state[key], this.state), null, `StateSub_${key}`);
          });
        }
      });

      if (this.listeners.has('*') && changedKeys.length > 0) {
        this.listeners.get('*').forEach((cb) => {
          errorHandler.safeExecute(() => cb(this.state, changedKeys), null, 'StateSub_Wildcard');
        });
      }
    }

    /**
     * Subscribe to state slice changes
     * @param {string} key - State property or '*' for all changes
     * @param {Function} callback - (newValue, fullState) => void
     * @returns {Function} Unsubscribe handle
     */
    subscribe(key, callback) {
      if (typeof callback !== 'function') return () => {};

      if (!this.listeners.has(key)) {
        this.listeners.set(key, new Set());
      }
      this.listeners.get(key).add(callback);

      return () => {
        const set = this.listeners.get(key);
        if (set) {
          set.delete(callback);
          if (set.size === 0) this.listeners.delete(key);
        }
      };
    }
  }

  return new Store();
});
