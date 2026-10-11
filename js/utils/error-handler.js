/**
 * @file error-handler.js
 * @description Global error handling, boundary wrappers, and non-intrusive UI alerts.
 * Ensures zero silent failures and shields the application from unhandled exceptions.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['../config'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('../config'));
  } else {
    root.ErrorHandler = factory(root.AppConfig);
  }
})(typeof self !== 'undefined' ? self : this, function (config) {
  'use strict';

  class ErrorHandler {
    constructor() {
      this.initialized = false;
      this.errorLog = [];
    }

    /**
     * Initialize global error listeners
     */
    init() {
      if (this.initialized || typeof window === 'undefined') return;

      window.addEventListener('error', (event) => {
        this.logError('UncaughtException', event.message, {
          filename: event.filename,
          lineno: event.lineno,
          colno: event.colno,
          error: event.error
        });
      });

      window.addEventListener('unhandledrejection', (event) => {
        this.logError('UnhandledRejection', event.reason?.message || String(event.reason), {
          reason: event.reason
        });
      });

      this.initialized = true;
    }

    /**
     * Record and conditionally output structured error log
     * @param {string} type - Error category
     * @param {string} message - Human-readable explanation
     * @param {object} [context={}] - Supplementary debugging context
     */
    logError(type, message, context = {}) {
      const entry = {
        type,
        message,
        context,
        timestamp: new Date().toISOString()
      };

      this.errorLog.push(entry);
      if (this.errorLog.length > 50) this.errorLog.shift();

      if (config && config.features && config.features.enableConsoleLogging) {
        console.error(`[Portfolio Error] [${type}]:`, message, context);
      }
    }

    /**
     * Wrap execution in a safe try-catch with a fallback return value
     * @param {Function} fn - Function to execute
     * @param {*} [fallback=null] - Value returned if fn throws
     * @param {string} [contextName='SafeExec'] - Trace label
     * @returns {*}
     */
    safeExecute(fn, fallback = null, contextName = 'SafeExec') {
      try {
        return fn();
      } catch (err) {
        this.logError(contextName, err.message, { stack: err.stack });
        return fallback;
      }
    }

    /**
     * Safely access localStorage with try/catch fallback (protects Incognito mode)
     * @param {string} key
     * @param {*} [defaultValue=null]
     * @returns {*}
     */
    getStorage(key, defaultValue = null) {
      return this.safeExecute(() => {
        const val = localStorage.getItem(key);
        return val !== null ? val : defaultValue;
      }, defaultValue, 'LocalStorageRead');
    }

    /**
     * Safely write to localStorage
     * @param {string} key
     * @param {string} value
     * @returns {boolean}
     */
    setStorage(key, value) {
      return this.safeExecute(() => {
        localStorage.setItem(key, value);
        return true;
      }, false, 'LocalStorageWrite');
    }

    /**
     * Display a non-intrusive UI toast notification
     * @param {string} message
     * @param {'info'|'success'|'warning'|'error'} [type='info']
     * @param {number} [durationMs=3200]
     */
    showToast(message, type = 'info', durationMs = 3200) {
      if (typeof document === 'undefined') return;

      let toastContainer = document.getElementById('portfolio-toast-container');
      if (!toastContainer) {
        toastContainer = document.createElement('div');
        toastContainer.id = 'portfolio-toast-container';
        toastContainer.style.cssText = `
          position: fixed;
          bottom: 24px;
          left: 50%;
          transform: translateX(-50%);
          z-index: 1000000;
          display: flex;
          flex-direction: column;
          gap: 8px;
          pointer-events: none;
        `;
        document.body.appendChild(toastContainer);
      }

      const toast = document.createElement('div');
      const bgColors = {
        info: 'rgba(6, 20, 12, 0.92)',
        success: 'rgba(5, 46, 22, 0.95)',
        warning: 'rgba(45, 26, 6, 0.95)',
        error: 'rgba(69, 10, 10, 0.95)'
      };
      const borderColors = {
        info: '#10b981',
        success: '#34d399',
        warning: '#f59e0b',
        error: '#ef4444'
      };

      toast.style.cssText = `
        background: ${bgColors[type] || bgColors.info};
        color: #f0fdf4;
        border: 1px solid ${borderColors[type] || borderColors.info};
        padding: 8px 16px;
        border-radius: 8px;
        font-family: var(--font-mono, monospace);
        font-size: 12px;
        letter-spacing: 0.04em;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.6);
        pointer-events: auto;
        opacity: 0;
        transform: translateY(10px);
        transition: opacity 0.25s ease, transform 0.25s ease;
      `;
      toast.textContent = message;
      toastContainer.appendChild(toast);

      requestAnimationFrame(() => {
        toast.style.opacity = '1';
        toast.style.transform = 'translateY(0)';
      });

      setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(10px)';
        setTimeout(() => toast.remove(), 260);
      }, durationMs);
    }
  }

  const instance = new ErrorHandler();
  instance.init();
  return instance;
});
