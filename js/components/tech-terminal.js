/**
 * TechTerminal — View Controller for the Interactive Systems Console Modal
 * Connects DOM inputs, outputs, and Viewport overlays to TerminalEngine.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['TerminalEngine', 'Formatters', 'DomUtils'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('../services/terminal-engine'), require('../utils/formatters'), require('../utils/dom'));
  } else {
    root.TechTerminal = factory(root.TerminalEngine, root.Formatters, root.DomUtils);
  }
})(typeof self !== 'undefined' ? self : this, function (TerminalEngine, Formatters, DomUtils) {
  'use strict';

  class TechTerminal {
    constructor(options = {}) {
      this.engine = new (options.TerminalEngine || TerminalEngine)();
      this.termModal = null;
      this.termInput = null;
      this.termOutput = null;
      this.termPwd = null;
      this.termPromptSymbol = null;
      this.termBody = null;
      this.viewportOverlay = null;
      this.currentViewportRawContent = '';
      this.init();
    }

    init() {
      if (typeof document === 'undefined') return;

      this.termModal = document.getElementById('tech-terminal');
      this.termInput = document.getElementById('term-input');
      this.termOutput = document.getElementById('term-output');
      this.termPwd = document.getElementById('term-pwd');
      this.termPromptSymbol = document.getElementById('term-prompt-symbol');
      this.termBody = document.getElementById('term-body');
      this.viewportOverlay = document.getElementById('term-viewport');

      if (!this.termModal) return;

      this.setupGlobalHandlers();
      this.setupInputHandlers();
      this.updatePrompt();

      if (this.termBody && this.termInput) {
        this.termBody.addEventListener('click', () => this.termInput.focus());
      }

      // Check #terminal hash on launch
      if (window.location.hash === '#terminal') {
        setTimeout(() => this.toggle(), 150);
      }
    }

    setupGlobalHandlers() {
      const self = this;

      window.toggleTechTerminal = function () {
        self.toggle();
      };

      window.closeTerminalOnBackdrop = function (e) {
        if (e && e.target && e.target.id === 'tech-terminal') {
          self.toggle();
        }
      };

      window.maximizeTerminal = function () {
        const box = document.querySelector('.tech-terminal-box');
        if (box) box.classList.toggle('maximized');
      };

      window.minimizeTerminal = function () {
        if (self.termOutput) {
          self.termOutput.innerHTML = '<div style="color:var(--faint);">[Buffer cleared] Type "help" or "ls" to inspect directory. Press Tab to autocomplete.</div>';
        }
      };

      window.openSatelliteWindow = function () {
        window.open('satellite.html', 'satellite_hud', 'width=440,height=600,left=120,top=120,resizable=yes');
      };

      window.runTermCommand = function (cmdString) {
        if (!self.termInput) return;
        self.termInput.value = cmdString;
        self.termInput.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
      };

      window.closeTermViewport = function () {
        self.closeViewport();
      };

      window.copyViewportContent = function () {
        if (!self.currentViewportRawContent) return;
        navigator.clipboard.writeText(self.currentViewportRawContent).then(() => {
          const btn = document.querySelector('.term-viewport-btn');
          if (btn) {
            const orig = btn.innerHTML;
            btn.innerHTML = '✔ Copied!';
            setTimeout(() => { btn.innerHTML = orig; }, 1800);
          }
        });
      };

      // Global keyboard shortcuts
      window.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          if (self.viewportOverlay && self.viewportOverlay.classList.contains('active')) {
            self.closeViewport();
            return;
          }
          if (self.termModal && self.termModal.classList.contains('active')) {
            self.toggle();
          }
        } else if ((e.key === '`' || e.key === '~') && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
          e.preventDefault();
          self.toggle();
        }
      });
    }

    toggle() {
      if (!this.termModal) return;
      this.termModal.classList.toggle('active');
      if (this.termModal.classList.contains('active')) {
        document.body.style.overflow = 'hidden';
        if (this.termInput) {
          setTimeout(() => this.termInput.focus(), 80);
        }
      } else {
        document.body.style.overflow = '';
      }
    }

    updatePrompt() {
      const currentDir = this.engine.getCurrentDir();
      if (this.termPwd) this.termPwd.textContent = currentDir;
      if (this.termPromptSymbol) {
        this.termPromptSymbol.textContent = `justin@monocoque:${currentDir}$`;
      }
    }

    openViewport(fileKey, content) {
      if (!this.viewportOverlay) return;

      this.currentViewportRawContent = content;
      const parts = fileKey.split('/');
      const fname = parts[parts.length - 1];

      const filenameEl = document.getElementById('term-viewport-filename');
      const pathEl = document.getElementById('term-viewport-path');
      const contentEl = document.getElementById('term-viewport-content');
      const metaEl = document.getElementById('term-viewport-meta');

      if (filenameEl) filenameEl.textContent = fname;
      if (pathEl) pathEl.textContent = fileKey;
      if (metaEl) {
        const isMd = fname.endsWith('.md');
        const isPy = fname.endsWith('.py');
        const isTs = fname.endsWith('.ts') || fname.endsWith('.kt');
        metaEl.textContent = isMd ? 'MARKDOWN DOCUMENT · READ-ONLY' : (isPy || isTs ? 'SOURCE CODE · READ-ONLY' : 'LOG BUFFER · READ-ONLY');
      }

      if (contentEl) {
        if (fname.endsWith('.md')) {
          contentEl.innerHTML = Formatters ? Formatters.formatMarkdown(content) : content;
        } else {
          const escaped = DomUtils ? DomUtils.escapeHtml(content) : content;
          contentEl.innerHTML = `<pre style="font-family:var(--font-mono);">${escaped}</pre>`;
        }
      }

      this.viewportOverlay.classList.add('active');
      this.viewportOverlay.scrollTop = 0;
    }

    closeViewport() {
      if (this.viewportOverlay) {
        this.viewportOverlay.classList.remove('active');
      }
      if (this.termInput) {
        setTimeout(() => this.termInput.focus(), 50);
      }
    }

    setupInputHandlers() {
      if (!this.termInput || !this.termOutput) return;

      const self = this;
      this.termInput.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') {
          e.preventDefault();
          self.toggle();
          return;
        }

        // Tab Autocomplete
        if (e.key === 'Tab') {
          e.preventDefault();
          const ac = self.engine.getAutocompleteCandidates(this.value);
          if (!ac || !ac.matches || !ac.matches.length) return;

          if (ac.type === 'command') {
            if (ac.matches.length === 1) {
              this.value = ac.matches[0] + ' ';
            } else if (ac.matches.length > 1) {
              let common = ac.matches[0];
              for (let i = 1; i < ac.matches.length; i++) {
                while (!ac.matches[i].startsWith(common)) {
                  common = common.slice(0, -1);
                }
              }
              if (common.length > ac.prefix.length) {
                this.value = common;
              } else {
                const hint = document.createElement('div');
                hint.style.margin = '4px 0 8px';
                hint.innerHTML = `<span style="color:var(--faint);font-size:12px;">Commands:</span> <span style="color:#2dd4bf;">${ac.matches.join('   ')}</span>`;
                self.termOutput.appendChild(hint);
                if (self.termBody) self.termBody.scrollTop = self.termBody.scrollHeight;
              }
            }
            return;
          }

          if (ac.type === 'directory') {
            if (ac.matches.length === 1) {
              this.value = `cd ${ac.matches[0]}/`;
            } else if (ac.matches.length > 1) {
              let common = ac.matches[0];
              for (let i = 1; i < ac.matches.length; i++) {
                while (!ac.matches[i].toLowerCase().startsWith(common.toLowerCase())) {
                  common = common.slice(0, -1);
                }
              }
              if (common.length > ac.prefix.length) {
                this.value = `cd ${common}`;
              } else {
                const hint = document.createElement('div');
                hint.style.margin = '4px 0 8px';
                hint.innerHTML = `<span style="color:var(--faint);font-size:12px;">Directories:</span> <span style="color:#2dd4bf;">${ac.matches.join('   ')}</span>`;
                self.termOutput.appendChild(hint);
                if (self.termBody) self.termBody.scrollTop = self.termBody.scrollHeight;
              }
            }
            return;
          }

          if (ac.type === 'file') {
            if (ac.matches.length === 1) {
              this.value = `cat ${ac.matches[0]}`;
            } else if (ac.matches.length > 1) {
              let common = ac.matches[0];
              for (let i = 1; i < ac.matches.length; i++) {
                while (!ac.matches[i].toLowerCase().startsWith(common.toLowerCase())) {
                  common = common.slice(0, -1);
                }
              }
              if (common.length > ac.prefix.length) {
                this.value = `cat ${common}`;
              } else {
                const hint = document.createElement('div');
                hint.style.margin = '4px 0 8px';
                hint.innerHTML = `<span style="color:var(--faint);font-size:12px;">Files:</span> <span style="color:#ecf3ee;">${ac.matches.join('   ')}</span>`;
                self.termOutput.appendChild(hint);
                if (self.termBody) self.termBody.scrollTop = self.termBody.scrollHeight;
              }
            }
            return;
          }
        }

        // History Up/Down
        if (e.key === 'ArrowUp') {
          e.preventDefault();
          if (self.engine.history.length > 0 && self.engine.historyIndex > 0) {
            self.engine.historyIndex--;
            this.value = self.engine.history[self.engine.historyIndex];
          } else if (self.engine.history.length > 0 && self.engine.historyIndex === -1) {
            self.engine.historyIndex = self.engine.history.length - 1;
            this.value = self.engine.history[self.engine.historyIndex];
          }
          return;
        }

        if (e.key === 'ArrowDown') {
          e.preventDefault();
          if (self.engine.historyIndex < self.engine.history.length - 1 && self.engine.historyIndex !== -1) {
            self.engine.historyIndex++;
            this.value = self.engine.history[self.engine.historyIndex];
          } else {
            self.engine.historyIndex = self.engine.history.length;
            this.value = '';
          }
          return;
        }

        // Execution on Enter
        if (e.key === 'Enter') {
          const raw = this.value;
          if (!raw.trim()) return;

          const currentDir = self.engine.getCurrentDir();
          const lineEl = document.createElement('div');
          lineEl.innerHTML = `<span style="color:var(--nature)">justin@monocoque:${currentDir}$</span> <span style="color:#fff;">${DomUtils ? DomUtils.escapeHtml(raw) : raw}</span>`;
          self.termOutput.appendChild(lineEl);

          const result = self.engine.execute(raw);
          if (result) {
            if (result.type === 'clear') {
              self.termOutput.innerHTML = '';
              this.value = '';
              return;
            }

            if (result.type === 'exit') {
              self.toggle();
              this.value = '';
              return;
            }

            if (result.type === 'preloader') {
              if (window.triggerCyberneticPreloader) {
                window.triggerCyberneticPreloader(true);
              }
            }

            if (result.newDir) {
              self.updatePrompt();
            }

            if (result.type === 'viewport') {
              self.openViewport(result.fileKey, result.content);
            }

            if (result.output) {
              const respEl = document.createElement('div');
              respEl.style.marginTop = '4px';
              respEl.style.marginBottom = '12px';
              respEl.innerHTML = result.output;
              self.termOutput.appendChild(respEl);
            }
          }

          this.value = '';
          if (self.termBody) self.termBody.scrollTop = self.termBody.scrollHeight;
        }
      });
    }
  }

  return TechTerminal;
});
