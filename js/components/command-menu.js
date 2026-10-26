/**
 * CommandMenu — Keyboard-driven spotlight command palette (Cmd+K / Ctrl+K / '/')
 * Provides instant fuzzy search across navigation, featured projects, and quick actions.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['DataStore', 'PortfolioStore'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('../services/data-store'), require('../state'));
  } else {
    root.CommandMenu = factory(root.DataStore, root.PortfolioStore);
  }
})(typeof self !== 'undefined' ? self : this, function (DataStore, PortfolioStore) {
  'use strict';

  class CommandMenu {
    constructor(options = {}) {
      this.store = options.store || (typeof window !== 'undefined' ? window.PortfolioStore : PortfolioStore);
      this.dataStore = options.dataStore || (typeof window !== 'undefined' ? window.DataStore : DataStore);

      this.isOpen = false;
      this.selectedIndex = 0;
      this.filteredItems = [];

      this.overlay = null;
      this.dialog = null;
      this.input = null;
      this.list = null;
      this.toastTimeout = null;

      this.commands = this.buildCommands();
      this.init();
    }

    buildCommands() {
      const isProjectsPage = typeof window !== 'undefined' && window.location.pathname.includes('projects.html');

      return [
        // Navigation
        { id: 'nav-home', title: 'Go to Home', category: 'Navigation', shortcut: 'H', action: () => this.navigate('index.html') },
        { id: 'nav-projects', title: 'Browse Case Studies', category: 'Navigation', shortcut: 'P', action: () => this.navigate('projects.html') },
        { id: 'nav-ideas', title: 'Open Ideas Lab', category: 'Navigation', shortcut: 'I', action: () => this.navigate('ideas-lab.html') },
        { id: 'nav-resume', title: 'View Resume (PDF)', category: 'Navigation', shortcut: 'R', action: () => window.open('Justin_Mathew_Resume.pdf', '_blank') },
        { id: 'nav-contact', title: 'Contact / Email', category: 'Navigation', shortcut: 'C', action: () => this.copyEmail() },

        // Featured Projects (Direct Section Jumps)
        { id: 'proj-sar', title: 'Autonomous SAR UAV (SIH 26177)', category: 'Projects', badge: 'SIH Shortlist', action: () => this.jumpTo('#p8', 'projects.html#p8') },
        { id: 'proj-camera', title: 'Virtual Camera Tracking (SIH 26169)', category: 'Projects', badge: 'ISRO/SAC', action: () => this.jumpTo('#p10', 'projects.html#p10') },
        { id: 'proj-f1', title: 'F1 Monte Carlo Strategy Simulator', category: 'Projects', badge: 'Simulation', action: () => this.jumpTo('#p2', 'projects.html#p2') },
        { id: 'proj-aroggya', title: 'AroggyaGram-3 Crisis Response', category: 'Projects', badge: 'ACM Winner', action: () => this.jumpTo('#p1', 'projects.html#p1') },
        { id: 'proj-autometer', title: 'AutoMeter Dynamic Fare System', category: 'Projects', badge: 'IoT Transit', action: () => this.jumpTo('#p3', 'projects.html#p3') },
        { id: 'proj-opp', title: 'Opportunity Android Task Planner', category: 'Projects', badge: 'Android', action: () => this.jumpTo('#p4', 'projects.html#p4') },
        { id: 'proj-crt', title: 'CRT Modular Cryptographic Safe (3D)', category: 'Projects', badge: 'WebGL', action: () => this.jumpTo('#p5', 'projects.html#p5') },
        { id: 'proj-lakshmi', title: 'Captain Lakshmi Invicta Archive', category: 'Projects', badge: 'Canvas 2D', action: () => this.jumpTo('#p6', 'projects.html#p6') },
        { id: 'proj-chord', title: 'Song Chord Analyzer (macOS)', category: 'Projects', badge: 'PyTorch/MIR', action: () => this.jumpTo('#p7', 'projects.html#p7') },
        { id: 'proj-uno', title: 'UNO-Q Arena Retro RL Engine', category: 'Projects', badge: 'Edge AI', action: () => this.jumpTo('#p9', 'projects.html#p9') },

        // Actions & Controls
        { id: 'act-theme', title: 'Toggle Light / Dark Mode', category: 'Actions', shortcut: 'L', action: () => this.toggleTheme() },
        { id: 'act-term', title: 'Open Interactive Terminal', category: 'Actions', shortcut: 'T', action: () => this.openTerminal() },
        { id: 'act-copy-email', title: 'Copy Email Address', category: 'Actions', shortcut: '↵', action: () => this.copyEmail() },
        { id: 'act-copy-github', title: 'Copy GitHub Profile URL', category: 'Actions', action: () => this.copyToClipboard('https://github.com/jvstin47', 'GitHub URL copied to clipboard') },
        { id: 'act-scroll-top', title: 'Scroll to Top of Page', category: 'Actions', action: () => window.scrollTo({ top: 0, behavior: 'smooth' }) }
      ];
    }

    init() {
      if (typeof document === 'undefined') return;

      this.createDOM();
      this.bindShortcuts();
      this.bindTriggers();
    }

    createDOM() {
      if (document.getElementById('cmd-menu-overlay')) return;

      const overlay = document.createElement('div');
      overlay.id = 'cmd-menu-overlay';
      overlay.className = 'cmd-overlay';
      overlay.setAttribute('aria-hidden', 'true');
      overlay.innerHTML = `
        <div class="cmd-dialog" role="dialog" aria-modal="true" aria-label="Command Menu">
          <div class="cmd-header">
            <span class="cmd-search-icon">🔍</span>
            <input type="text" id="cmd-input" class="cmd-input" placeholder="Type a command, project name, or action..." autocomplete="off" spellcheck="false" aria-label="Search commands" />
            <kbd class="cmd-esc-badge" id="cmd-close-btn" title="Close (ESC)">ESC</kbd>
          </div>
          <div class="cmd-results" id="cmd-results" role="listbox"></div>
          <div class="cmd-footer">
            <div class="cmd-footer-keys">
              <span><kbd>↑</kbd><kbd>↓</kbd> Navigate</span>
              <span><kbd>↵</kbd> Select</span>
              <span><kbd>ESC</kbd> Close</span>
            </div>
            <span class="cmd-footer-brand">Cmd Palette</span>
          </div>
        </div>
      `;

      document.body.appendChild(overlay);

      this.overlay = overlay;
      this.dialog = overlay.querySelector('.cmd-dialog');
      this.input = overlay.querySelector('#cmd-input');
      this.list = overlay.querySelector('#cmd-results');

      // Click outside to dismiss
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) this.close();
      });

      // Close button click
      const closeBtn = overlay.querySelector('#cmd-close-btn');
      if (closeBtn) closeBtn.addEventListener('click', () => this.close());

      // Live search input
      this.input.addEventListener('input', () => this.renderList(this.input.value.trim()));

      // Keyboard navigation inside menu
      this.input.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowDown') {
          e.preventDefault();
          this.moveSelection(1);
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          this.moveSelection(-1);
        } else if (e.key === 'Enter') {
          e.preventDefault();
          this.executeSelected();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          this.close();
        }
      });
    }

    bindShortcuts() {
      window.addEventListener('keydown', (e) => {
        // Toggle palette on Cmd+K or Ctrl+K
        if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) {
          e.preventDefault();
          this.toggle();
          return;
        }

        // Toggle palette on '/' if not inside an input/textarea
        const tag = (e.target.tagName || '').toLowerCase();
        const isEditable = e.target.isContentEditable || tag === 'input' || tag === 'textarea' || tag === 'select';

        if (e.key === '/' && !isEditable && !this.isOpen) {
          e.preventDefault();
          this.open();
          return;
        }

        // Shortcut: 'L' for theme toggle (when not typing in an input)
        if ((e.key === 'l' || e.key === 'L') && !isEditable && !this.isOpen) {
          if (!e.metaKey && !e.ctrlKey && !e.altKey) {
            e.preventDefault();
            this.toggleTheme();
            return;
          }
        }

        // Shortcut: 'T' for terminal drawer (when not typing in an input)
        if ((e.key === 't' || e.key === 'T') && !isEditable && !this.isOpen) {
          if (!e.metaKey && !e.ctrlKey && !e.altKey) {
            const term = document.getElementById('terminal-drawer');
            if (term) {
              e.preventDefault();
              this.openTerminal();
              return;
            }
          }
        }

        // Dismiss on Escape if open
        if (e.key === 'Escape' && this.isOpen) {
          e.preventDefault();
          this.close();
        }
      });
    }

    bindTriggers() {
      // Check for nav trigger button
      const triggerBtn = document.getElementById('cmd-menu-btn');
      if (triggerBtn) {
        triggerBtn.addEventListener('click', (e) => {
          e.preventDefault();
          this.toggle();
        });
      }
    }

    open() {
      if (!this.overlay) this.createDOM();
      this.isOpen = true;
      this.overlay.classList.add('active');
      this.overlay.setAttribute('aria-hidden', 'false');
      this.input.value = '';
      this.selectedIndex = 0;
      this.renderList('');

      // Avoid background scrolling
      document.body.style.overflow = 'hidden';

      // Focus input with slight tick for smooth display
      setTimeout(() => {
        if (this.input) this.input.focus();
      }, 50);
    }

    close() {
      if (!this.isOpen) return;
      this.isOpen = false;
      if (this.overlay) {
        this.overlay.classList.remove('active');
        this.overlay.setAttribute('aria-hidden', 'true');
      }
      document.body.style.overflow = '';
    }

    toggle() {
      if (this.isOpen) {
        this.close();
      } else {
        this.open();
      }
    }

    renderList(query = '') {
      const q = query.toLowerCase();
      this.filteredItems = this.commands.filter((cmd) => {
        if (!q) return true;
        const inTitle = cmd.title.toLowerCase().includes(q);
        const inCat = cmd.category.toLowerCase().includes(q);
        const inBadge = cmd.badge ? cmd.badge.toLowerCase().includes(q) : false;
        return inTitle || inCat || inBadge;
      });

      if (this.selectedIndex >= this.filteredItems.length) {
        this.selectedIndex = Math.max(0, this.filteredItems.length - 1);
      }

      if (this.filteredItems.length === 0) {
        this.list.innerHTML = `
          <div class="cmd-empty">
            <span class="cmd-empty-icon">🍃</span>
            <p>No matching commands found for "<strong>${this.escapeHTML(query)}</strong>"</p>
          </div>
        `;
        return;
      }

      let currentCategory = '';
      let html = '';

      this.filteredItems.forEach((item, index) => {
        if (item.category !== currentCategory) {
          currentCategory = item.category;
          html += `<div class="cmd-category-header">${currentCategory}</div>`;
        }

        const isSelected = index === this.selectedIndex;
        const shortcutHtml = item.shortcut ? `<kbd class="cmd-key">${item.shortcut}</kbd>` : '';
        const badgeHtml = item.badge ? `<span class="cmd-item-badge">${item.badge}</span>` : '';

        html += `
          <div class="cmd-item ${isSelected ? 'selected' : ''}" data-index="${index}" role="option" aria-selected="${isSelected}">
            <div class="cmd-item-left">
              <span class="cmd-item-bullet">${isSelected ? '▸' : '•'}</span>
              <span class="cmd-item-title">${this.highlightMatch(item.title, query)}</span>
              ${badgeHtml}
            </div>
            <div class="cmd-item-right">
              ${shortcutHtml}
            </div>
          </div>
        `;
      });

      this.list.innerHTML = html;

      // Click to select
      this.list.querySelectorAll('.cmd-item').forEach((el) => {
        el.addEventListener('click', () => {
          const idx = parseInt(el.getAttribute('data-index'), 10);
          this.selectedIndex = idx;
          this.executeSelected();
        });
        el.addEventListener('mouseenter', () => {
          const idx = parseInt(el.getAttribute('data-index'), 10);
          this.selectedIndex = idx;
          this.updateSelectionVisuals();
        });
      });
    }

    moveSelection(delta) {
      if (this.filteredItems.length === 0) return;
      this.selectedIndex = (this.selectedIndex + delta + this.filteredItems.length) % this.filteredItems.length;
      this.updateSelectionVisuals();
    }

    updateSelectionVisuals() {
      const items = this.list.querySelectorAll('.cmd-item');
      items.forEach((el, idx) => {
        const isSel = idx === this.selectedIndex;
        el.classList.toggle('selected', isSel);
        el.setAttribute('aria-selected', isSel ? 'true' : 'false');
        const bullet = el.querySelector('.cmd-item-bullet');
        if (bullet) bullet.textContent = isSel ? '▸' : '•';
      });

      const selectedEl = this.list.querySelector('.cmd-item.selected');
      if (selectedEl) {
        selectedEl.scrollIntoView({ block: 'nearest' });
      }
    }

    executeSelected() {
      if (this.filteredItems.length === 0) return;
      const cmd = this.filteredItems[this.selectedIndex];
      if (cmd && typeof cmd.action === 'function') {
        this.close();
        cmd.action();
      }
    }

    navigate(url) {
      window.location.href = url;
    }

    jumpTo(localHash, remoteUrl) {
      const target = document.querySelector(localHash);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.location.href = remoteUrl;
      }
    }

    toggleTheme() {
      if (typeof window.toggleTheme === 'function') {
        window.toggleTheme();
      } else {
        const isLight = document.body.classList.contains('light');
        document.body.classList.toggle('light', !isLight);
        document.documentElement.classList.toggle('light', !isLight);
        try {
          localStorage.setItem('theme', !isLight ? 'light' : 'dark');
        } catch (e) {}
      }
      this.showToast('Theme switched');
    }

    openTerminal() {
      if (typeof window.toggleTerminalDrawer === 'function') {
        window.toggleTerminalDrawer();
      } else {
        const term = document.getElementById('terminal-drawer');
        if (term) term.classList.add('open');
      }
    }

    copyEmail() {
      this.copyToClipboard('justinjmathew.ajce@gmail.com', 'Copied justinjmathew.ajce@gmail.com to clipboard');
    }

    copyToClipboard(text, message) {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(text).then(() => {
          this.showToast(message || 'Copied to clipboard');
        }).catch(() => {
          this.showToast('Copy failed');
        });
      } else {
        // Fallback for older browsers
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.select();
        try {
          document.execCommand('copy');
          this.showToast(message || 'Copied to clipboard');
        } catch (err) {
          this.showToast('Copy failed');
        }
        document.body.removeChild(ta);
      }
    }

    showToast(message, duration = 2800) {
      let toast = document.getElementById('portfolio-toast');
      if (!toast) {
        toast = document.createElement('div');
        toast.id = 'portfolio-toast';
        toast.className = 'portfolio-toast';
        document.body.appendChild(toast);
      }

      toast.textContent = message;
      toast.classList.add('visible');

      if (this.toastTimeout) clearTimeout(this.toastTimeout);
      this.toastTimeout = setTimeout(() => {
        toast.classList.remove('visible');
      }, duration);
    }

    highlightMatch(text, query) {
      if (!query) return this.escapeHTML(text);
      const safeQ = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`(${safeQ})`, 'gi');
      return this.escapeHTML(text).replace(regex, '<span class="cmd-highlight">$1</span>');
    }

    escapeHTML(str) {
      return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
    }
  }

  return CommandMenu;
});
