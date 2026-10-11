/**
 * @file github-service.js
 * @description Scalable client for GitHub API with TTL caching and offline fallbacks.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['../config', './api-client', '../utils/error-handler'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('../config'), require('./api-client'), require('../utils/error-handler'));
  } else {
    root.GitHubService = factory(root.AppConfig, root.ApiClient, root.ErrorHandler);
  }
})(typeof self !== 'undefined' ? self : this, function (config, clientModule, errorHandler) {
  'use strict';

  const client = clientModule.defaultClient || new clientModule.ApiClient();
  const baseUrl = config?.api?.githubBaseUrl || 'https://api.github.com';
  const username = config?.api?.githubUsername || 'jvstin47';
  const cacheTtl = config?.api?.cacheTtlMs || 300000;

  class GitHubService {
    constructor() {
      this.memoryCache = new Map();
    }

    /**
     * Cache-assisted fetcher
     * @private
     */
    async _fetchCached(cacheKey, url) {
      const now = Date.now();

      // 1. Check memory cache
      if (this.memoryCache.has(cacheKey)) {
        const item = this.memoryCache.get(cacheKey);
        if (now - item.timestamp < cacheTtl) {
          return item.data;
        }
      }

      // 2. Check sessionStorage
      const sessionItem = errorHandler.safeExecute(() => {
        const raw = sessionStorage.getItem(`gh_cache_${cacheKey}`);
        return raw ? JSON.parse(raw) : null;
      });

      if (sessionItem && now - sessionItem.timestamp < cacheTtl) {
        this.memoryCache.set(cacheKey, sessionItem);
        return sessionItem.data;
      }

      // 3. Network fetch
      try {
        const data = await client.get(url);
        const cachePayload = { data, timestamp: now };
        this.memoryCache.set(cacheKey, cachePayload);

        errorHandler.safeExecute(() => {
          sessionStorage.setItem(`gh_cache_${cacheKey}`, JSON.stringify(cachePayload));
        });

        return data;
      } catch (err) {
        errorHandler.logError('GitHubService', `Failed to fetch ${cacheKey}`, { error: err.message });
        // If cached stale data exists, return as graceful fallback
        if (sessionItem) return sessionItem.data;
        throw err;
      }
    }

    /**
     * Fetch user profile stats
     * @returns {Promise<object>}
     */
    async getUserProfile() {
      return this._fetchCached('profile', `${baseUrl}/users/${username}`);
    }

    /**
     * Fetch public repositories
     * @param {number} [perPage=30]
     * @returns {Promise<Array>}
     */
    async getRepositories(perPage = 30) {
      return this._fetchCached('repos', `${baseUrl}/users/${username}/repos?per_page=${perPage}&sort=updated`);
    }

    /**
     * Fetch repository star & fork counts
     * @param {string} repoName
     * @returns {Promise<object>}
     */
    async getRepo(repoName) {
      return this._fetchCached(`repo_${repoName}`, `${baseUrl}/repos/${username}/${repoName}`);
    }
  }

  return new GitHubService();
});
