/**
 * @file dom.js
 * @description Safe DOM query, mutation, and event delegation utilities.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.DomUtils = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  /**
   * Safe single element selector
   * @param {string} selector
   * @param {HTMLElement|Document} [scope=document]
   * @returns {HTMLElement|null}
   */
  function $(selector, scope = document) {
    if (!scope || !scope.querySelector) return null;
    return scope.querySelector(selector);
  }

  /**
   * Safe multiple element selector
   * @param {string} selector
   * @param {HTMLElement|Document} [scope=document]
   * @returns {HTMLElement[]}
   */
  function $$(selector, scope = document) {
    if (!scope || !scope.querySelectorAll) return [];
    return Array.from(scope.querySelectorAll(selector));
  }

  /**
   * Safe event listener with delegation support
   * @param {HTMLElement|Document|Window} target
   * @param {string} event
   * @param {Function} handler
   * @param {object|boolean} [options=false]
   */
  function on(target, event, handler, options = false) {
    if (!target || !target.addEventListener) return;
    target.addEventListener(event, handler, options);
  }

  /**
   * Event delegation helper
   * @param {HTMLElement} parent
   * @param {string} event
   * @param {string} childSelector
   * @param {Function} handler
   */
  function delegate(parent, event, childSelector, handler) {
    if (!parent || !parent.addEventListener) return;
    parent.addEventListener(event, function (e) {
      const match = e.target.closest(childSelector);
      if (match && parent.contains(match)) {
        handler.call(match, e, match);
      }
    });
  }

  /**
   * HTML character escaper for XSS prevention
   * @param {string} str
   * @returns {string}
   */
  function escapeHtml(str) {
    if (typeof str !== 'string') return '';
    return str
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  return {
    $,
    $$,
    on,
    delegate,
    escapeHtml
  };
});
