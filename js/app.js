/**
 * Justin Joe Mathew Portfolio — Application Orchestrator
 * Bootstraps services, state management, error boundaries, and component views.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'AppConfig',
      'PortfolioStore',
      'ErrorHandler',
      'DataStore',
      'BenchmarkEngine',
      'TerminalEngine',
      'ThemeController',
      'NavigationController',
      'PhotoDeckView',
      'PrismView',
      'CertModal',
      'TechTerminal'
    ], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(
      require('./config'),
      require('./state'),
      require('./utils/error-handler'),
      require('./services/data-store'),
      require('./services/benchmark-engine'),
      require('./services/terminal-engine'),
      require('./components/theme-controller'),
      require('./components/navigation-controller'),
      require('./components/photo-deck-view'),
      require('./components/prism-view'),
      require('./components/cert-modal'),
      require('./components/tech-terminal')
    );
  } else {
    root.Portfolio = factory(
      root.AppConfig,
      root.PortfolioStore,
      root.ErrorHandler,
      root.DataStore,
      root.BenchmarkEngine,
      root.TerminalEngine,
      root.ThemeController,
      root.NavigationController,
      root.PhotoDeckView,
      root.PrismView,
      root.CertModal,
      root.TechTerminal
    );
  }
})(typeof self !== 'undefined' ? self : this, function (
  AppConfig,
  PortfolioStore,
  ErrorHandler,
  DataStore,
  BenchmarkEngine,
  TerminalEngine,
  ThemeController,
  NavigationController,
  PhotoDeckView,
  PrismView,
  CertModal,
  TechTerminal
) {
  'use strict';

  class PortfolioApp {
    constructor() {
      this.config = AppConfig || (typeof window !== 'undefined' ? window.AppConfig : null);
      this.store = PortfolioStore || (typeof window !== 'undefined' ? window.PortfolioStore : null);
      this.errorHandler = ErrorHandler || (typeof window !== 'undefined' ? window.ErrorHandler : null);
      this.dataStore = DataStore || (typeof window !== 'undefined' ? window.DataStore : null);
      this.benchmarkEngine = BenchmarkEngine || (typeof window !== 'undefined' ? window.BenchmarkEngine : null);

      this.themeController = null;
      this.navigationController = null;
      this.photoDeckView = null;
      this.prismView = null;
      this.certModal = null;
      this.techTerminal = null;

      this.isInitialized = false;
    }

    init() {
      if (this.isInitialized || typeof document === 'undefined') return;

      try {
        // Initialize global error tracking
        if (this.errorHandler && typeof this.errorHandler.init === 'function') {
          this.errorHandler.init();
        }

        // Initialize component controllers
        if (ThemeController) {
          this.themeController = new ThemeController({ store: this.store });
        }

        if (NavigationController) {
          this.navigationController = new NavigationController();
        }

        if (PhotoDeckView) {
          this.photoDeckView = new PhotoDeckView();
        }

        if (PrismView) {
          this.prismView = new PrismView();
        }

        if (CertModal) {
          this.certModal = new CertModal();
        }

        if (TechTerminal) {
          this.techTerminal = new TechTerminal({
            TerminalEngine: TerminalEngine,
            dataStore: this.dataStore,
            benchmarkEngine: this.benchmarkEngine
          });
        }

        this.isInitialized = true;

        if (this.config && this.config.DEBUG) {
          console.log(`[PortfolioApp] Initialized successfully. Version: ${this.config.VERSION}`);
        }
      } catch (err) {
        if (this.errorHandler) {
          this.errorHandler.handle(err, 'PortfolioApp Initialization');
        } else {
          console.error('[PortfolioApp] Initialization error:', err);
        }
      }
    }
  }

  const appInstance = new PortfolioApp();

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () => appInstance.init());
    } else {
      appInstance.init();
    }
  }

  return appInstance;
});
