/**
 * @file api-client.js
 * @description Scalable, resilient HTTP client wrapper with timeout, retry, and error normalization.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['../config', '../utils/error-handler'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('../config'), require('../utils/error-handler'));
  } else {
    root.ApiClient = factory(root.AppConfig, root.ErrorHandler);
  }
})(typeof self !== 'undefined' ? self : this, function (config, errorHandler) {
  'use strict';

  class ApiError extends Error {
    constructor(message, status = 0, data = null) {
      super(message);
      this.name = 'ApiError';
      this.status = status;
      this.data = data;
    }
  }

  class ApiClient {
    constructor(options = {}) {
      this.timeoutMs = options.timeoutMs || config?.api?.timeoutMs || 8000;
      this.maxRetries = options.maxRetries || config?.api?.maxRetries || 1;
    }

    /**
     * Perform HTTP request with timeout and automatic retry
     * @param {string} url
     * @param {RequestInit} [options={}]
     * @returns {Promise<any>}
     */
    async request(url, options = {}) {
      let attempt = 0;
      let lastError = null;

      while (attempt <= this.maxRetries) {
        try {
          const controller = new AbortController();
          const timer = setTimeout(() => controller.abort(), this.timeoutMs);

          const response = await fetch(url, {
            ...options,
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
              ...(options.headers || {})
            }
          });

          clearTimeout(timer);

          if (!response.ok) {
            let errorBody = null;
            try { errorBody = await response.json(); } catch (_) { errorBody = await response.text(); }
            throw new ApiError(`HTTP Error ${response.status}: ${response.statusText}`, response.status, errorBody);
          }

          const contentType = response.headers.get('content-type') || '';
          if (contentType.includes('application/json')) {
            return await response.json();
          }
          return await response.text();

        } catch (err) {
          lastError = err;
          attempt++;

          // Don't retry on 4xx client errors
          if (err instanceof ApiError && err.status >= 400 && err.status < 500) {
            break;
          }

          if (attempt <= this.maxRetries) {
            // Exponential backoff
            await new Promise((res) => setTimeout(res, Math.pow(2, attempt) * 200));
          }
        }
      }

      errorHandler.logError('ApiClientFailure', lastError?.message || 'Network request failed', { url });
      throw lastError;
    }

    get(url, options = {}) {
      return this.request(url, { ...options, method: 'GET' });
    }

    post(url, body, options = {}) {
      return this.request(url, {
        ...options,
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
        body: JSON.stringify(body)
      });
    }
  }

  return {
    ApiClient,
    ApiError,
    defaultClient: new ApiClient()
  };
});
