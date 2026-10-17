/**
 * @file config.js
 * @description Centralized configuration and environment variable registry.
 * Isolates environmental endpoints, feature flags, storage keys, and limits from runtime logic.
 * @author Justin Mathew
 * @version 2.1.0
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AppConfig = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const isLocalhost = Boolean(
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
     window.location.hostname === '127.0.0.1' ||
     window.location.protocol === 'file:')
  );

  /**
   * Application Configuration Object
   * Allows override through window.__ENV__ or URL query params in development.
   */
  const config = {
    env: isLocalhost ? 'development' : 'production',
    version: '2.1.0',
    siteUrl: 'https://jvstin47.github.io/47',
    
    // API Services Configuration
    api: {
      githubBaseUrl: 'https://api.github.com',
      githubUsername: 'jvstin47',
      timeoutMs: 8000,
      cacheTtlMs: 5 * 60 * 1000, // 5 minutes in-memory caching
      maxRetries: 2
    },

    // Persistent Storage Keys
    storageKeys: {
      theme: 'portfolio_theme_mode',
      legacyTheme: 'theme',
      terminalHistory: 'portfolio_term_history_v2',
      analyticsConsent: 'portfolio_analytics_consent'
    },

    // Feature Flags (toggled per environment or runtime requirements)
    features: {
      enableMagneticCursor: true,
      enable3dPrismTilt: true,
      enableCanvasEffects: true,
      enableLiquidMercury: true,
      enableSoundFx: false,
      enableConsoleLogging: isLocalhost
    },

    // Computation Limits & Constants
    limits: {
      monteCarloDefaultPasses: 1000,
      maxTerminalHistory: 50,
      maxCanvasFps: 60,
      debounceScrollMs: 15
    },

    // Social Links & Contact Metadata
    metadata: {
      name: 'Justin Joe Mathew',
      email: 'jvstin47@gmail.com',
      github: 'https://github.com/jvstin47',
      linkedin: 'https://www.linkedin.com/in/jvstin47/',
      college: 'Amal Jyothi College of Engineering',
      graduationYear: 2029
    }
  };

  // Merge any runtime environment overrides if provided
  if (typeof window !== 'undefined' && window.__ENV__) {
    Object.assign(config, window.__ENV__);
  }

  // Freeze top-level configuration to prevent accidental mutations
  return Object.freeze(config);
});
