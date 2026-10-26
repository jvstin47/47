/**
 * ThemeController — Handles light/dark theme toggles, system preference sync, and UI indicators.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['Store', 'AppConfig'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('../state'), require('../config'));
  } else {
    root.ThemeController = factory(root.PortfolioStore, root.AppConfig);
  }
})(typeof self !== 'undefined' ? self : this, function (Store, AppConfig) {
  'use strict';

  class ThemeController {
    constructor(options = {}) {
      this.store = options.store || (typeof window !== 'undefined' ? window.PortfolioStore : Store);
      this.themeBtn = null;
      this.init();
    }

    init() {
      if (typeof document === 'undefined') return;

      this.themeBtn = document.getElementById('theme-btn');
      const currentTheme = this.getInitialTheme();
      this.apply(currentTheme, false);

      if (this.themeBtn) {
        this.themeBtn.addEventListener('click', () => this.toggle());
      }

      // Listen to OS system theme changes
      if (window.matchMedia) {
        window.matchMedia('(prefers-color-scheme: light)').addEventListener('change', (e) => {
          const stored = localStorage.getItem('theme');
          if (!stored) {
            this.apply(e.matches ? 'light' : 'dark', false);
          }
        });
      }

      // Subscribe to state changes if store is available
      if (this.store && this.store.subscribe) {
        this.store.subscribe('theme', (newTheme) => {
          this.apply(newTheme, false);
        });
      }
    }

    getInitialTheme() {
      try {
        const saved = localStorage.getItem('theme');
        if (saved === 'light' || saved === 'dark') return saved;
      } catch (err) {
        // Fallback if storage access is restricted
      }
      const prefersLight = window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches;
      return prefersLight ? 'light' : 'dark';
    }

    apply(theme, persist = true) {
      const isLight = theme === 'light';
      document.body.classList.toggle('light', isLight);
      document.documentElement.classList.toggle('light', isLight);

      if (this.themeBtn) {
        this.themeBtn.textContent = isLight ? '☀' : '☾';
        this.themeBtn.setAttribute('aria-label', isLight ? 'Switch to Dark Mode' : 'Switch to Light Mode');
        this.themeBtn.setAttribute('title', isLight ? 'Switch to Dark Mode (Hotkey: L)' : 'Switch to Light Mode (Hotkey: L)');
      }

      if (persist) {
        try {
          localStorage.setItem('theme', theme);
        } catch (err) {
          // Ignore storage quota or permission errors
        }
        if (this.store && this.store.getState().theme !== theme) {
          this.store.setState({ theme });
        }
      }
    }

    toggle() {
      const isLight = document.body.classList.contains('light');
      const nextTheme = isLight ? 'dark' : 'light';

      if (document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.startViewTransition(() => {
          this.apply(nextTheme, true);
        });
      } else {
        this.apply(nextTheme, true);
      }
    }
  }

  return ThemeController;
});
