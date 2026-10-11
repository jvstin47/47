/**
 * @file formatters.js
 * @description Safe string sanitization, Markdown parsing, and numerical formatting.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['./dom'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./dom'));
  } else {
    root.Formatters = factory(root.DomUtils);
  }
})(typeof self !== 'undefined' ? self : this, function (domUtils) {
  'use strict';

  const escapeHtml = domUtils ? domUtils.escapeHtml : (str) => str;

  /**
   * Parse inline Markdown syntax (bold, code, links, italic)
   * @param {string} str
   * @returns {string}
   */
  function parseInlineMarkdown(str) {
    return str
      // Inline code
      .replace(/`([^`]+)`/g, '<code style="background:rgba(16,185,129,0.15);color:#34d399;padding:1px 5px;border-radius:4px;font-size:0.9em;">$1</code>')
      // Bold
      .replace(/\*\*([^*]+)\*\*/g, '<strong style="color:var(--text, #f0fdf4);">$1</strong>')
      // Italic
      .replace(/\*([^*]+)\*/g, '<em>$1</em>')
      // Links: [text](url)
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer" style="color:var(--nature, #10b981);text-decoration:underline;text-underline-offset:2px;">$1 ↗</a>');
  }

  /**
   * Parse multi-line Markdown into safe HTML elements
   * @param {string} md - Raw markdown text
   * @returns {string}
   */
  function formatMarkdown(md) {
    if (typeof md !== 'string') return '';
    const lines = md.split('\n');
    let html = '';
    let inList = false;

    for (let rawLine of lines) {
      let line = escapeHtml(rawLine);

      // Headings
      if (line.startsWith('# ')) {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<h1 style="font-size:1.6rem;margin:16px 0 8px;color:var(--text);">${line.slice(2)}</h1>`;
        continue;
      }
      if (line.startsWith('## ')) {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<h2 style="font-size:1.3rem;margin:14px 0 6px;color:var(--text);">${line.slice(3)}</h2>`;
        continue;
      }
      if (line.startsWith('### ')) {
        if (inList) { html += '</ul>'; inList = false; }
        html += `<h3 style="font-size:1.1rem;margin:12px 0 4px;color:var(--text);">${line.slice(4)}</h3>`;
        continue;
      }

      // Unordered lists
      if (line.startsWith('• ') || line.startsWith('- ') || line.startsWith('* ')) {
        if (!inList) { html += '<ul style="margin:8px 0;padding-left:20px;line-height:1.6;">'; inList = true; }
        const itemContent = parseInlineMarkdown(line.slice(2));
        html += `<li>${itemContent}</li>`;
        continue;
      } else if (inList && line.trim() === '') {
        html += '</ul>';
        inList = false;
      }

      if (!line.trim()) {
        if (inList) { html += '</ul>'; inList = false; }
        continue;
      }

      // Paragraphs
      html += `<p style="margin:6px 0;line-height:1.6;">${parseInlineMarkdown(line)}</p>`;
    }

    if (inList) html += '</ul>';
    return html;
  }

  /**
   * Format numbers with localized commas
   * @param {number} num
   * @returns {string}
   */
  function formatNumber(num) {
    return Number(num).toLocaleString('en-US');
  }

  return {
    parseInlineMarkdown,
    formatMarkdown,
    formatNumber
  };
});
