/**
 * AccentController — Site-wide dynamic highlight color engine & bottom-of-page picker
 * Allows users to choose any highlight color across the entire portfolio (CSS tokens + WebGL shaders).
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.AccentController = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const STORAGE_KEY = 'accent-color';
  const DEFAULT_HEX = '#10b981';

  const PRESETS = [
    { id: 'emerald', name: 'Emerald', hex: '#10b981' },
    { id: 'cyan',    name: 'Cyan',    hex: '#06b6d4' },
    { id: 'cobalt',  name: 'Cobalt',  hex: '#3b82f6' },
    { id: 'violet',  name: 'Violet',  hex: '#8b5cf6' },
    { id: 'amber',   name: 'Amber',   hex: '#f59e0b' },
    { id: 'crimson', name: 'Crimson', hex: '#f43f5e' }
  ];

  function normalizeHex(hex) {
    if (!hex || typeof hex !== 'string') return DEFAULT_HEX;
    let h = hex.trim().replace(/^#/, '');
    if (h.length === 3) {
      h = h.split('').map(c => c + c).join('');
    }
    if (!/^[0-9a-fA-F]{6}$/.test(h)) return DEFAULT_HEX;
    return '#' + h.toLowerCase();
  }

  function hexToRgb(hex) {
    const clean = normalizeHex(hex).slice(1);
    const num = parseInt(clean, 16);
    return {
      r: (num >> 16) & 255,
      g: (num >> 8) & 255,
      b: num & 255
    };
  }

  function rgbToHex(r, g, b) {
    const clamp = v => Math.max(0, Math.min(255, Math.round(v)));
    return '#' + [clamp(r), clamp(g), clamp(b)]
      .map(v => v.toString(16).padStart(2, '0'))
      .join('');
  }

  function mixRgb(c1, c2, weight) {
    return {
      r: c1.r + (c2.r - c1.r) * weight,
      g: c1.g + (c2.g - c1.g) * weight,
      b: c1.b + (c2.b - c1.b) * weight
    };
  }

  function relativeLuminance(rgb) {
    const toLin = (c) => {
      const s = c / 255;
      return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
    };
    return 0.2126 * toLin(rgb.r) + 0.7152 * toLin(rgb.g) + 0.0722 * toLin(rgb.b);
  }

  function ensureLightModeContrast(rgb) {
    // Target relative luminance <= 0.17 for >= 4.5:1 WCAG AA contrast on #f7faf8 / #ffffff
    let current = { ...rgb };
    const black = { r: 0, g: 0, b: 0 };
    let step = 0;
    while (relativeLuminance(current) > 0.165 && step < 24) {
      current = mixRgb(current, black, 0.12);
      step++;
    }
    return current;
  }

  function ensureDarkModeContrast(rgb) {
    // Lift overly dark custom colors so they remain legible on #030705 / #08120c
    let current = { ...rgb };
    const white = { r: 255, g: 255, b: 255 };
    let step = 0;
    while (relativeLuminance(current) < 0.14 && step < 20) {
      current = mixRgb(current, white, 0.12);
      step++;
    }
    return current;
  }

  function derivePalette(hex, isLight) {
    const base = hexToRgb(hex);
    const white = { r: 255, g: 255, b: 255 };
    const black = { r: 0, g: 0, b: 0 };

    if (isLight) {
      // Luminance-calibrated darkening in light mode for crisp WCAG AA/AAA contrast
      const primary = ensureLightModeContrast(mixRgb(base, black, 0.18));
      const hi = mixRgb(primary, black, 0.22);
      const dim = mixRgb(primary, black, 0.42);
      const glacier = ensureLightModeContrast(mixRgb(base, { r: 15, g: 118, b: 110 }, 0.2));
      const sprout = ensureLightModeContrast(mixRgb(base, black, 0.12));

      return {
        hex: normalizeHex(hex),
        primaryHex: rgbToHex(primary.r, primary.g, primary.b),
        hiHex: rgbToHex(hi.r, hi.g, hi.b),
        dimHex: rgbToHex(dim.r, dim.g, dim.b),
        glacierHex: rgbToHex(glacier.r, glacier.g, glacier.b),
        sproutHex: rgbToHex(sprout.r, sprout.g, sprout.b),
        accentRgb: `${Math.round(primary.r)}, ${Math.round(primary.g)}, ${Math.round(primary.b)}`,
        hiRgb: `${Math.round(hi.r)}, ${Math.round(hi.g)}, ${Math.round(hi.b)}`,
        dimRgb: `${Math.round(dim.r)}, ${Math.round(dim.g)}, ${Math.round(dim.b)}`,
        glacierRgb: `${Math.round(glacier.r)}, ${Math.round(glacier.g)}, ${Math.round(glacier.b)}`,
        sproutRgb: `${Math.round(sprout.r)}, ${Math.round(sprout.g)}, ${Math.round(sprout.b)}`,
        glow: `rgba(${Math.round(primary.r)}, ${Math.round(primary.g)}, ${Math.round(primary.b)}, 0.14)`
      };
    }

    // Dark mode: vibrant primary, luminous hover, deep shadow
    const primary = ensureDarkModeContrast(base);
    const hi = mixRgb(primary, white, 0.30);
    const dim = mixRgb(primary, black, 0.42);
    const glacier = mixRgb(primary, { r: 200, g: 255, b: 245 }, 0.24);
    const sprout = mixRgb(primary, white, 0.22);

    return {
      hex: normalizeHex(hex),
      primaryHex: rgbToHex(primary.r, primary.g, primary.b),
      hiHex: rgbToHex(hi.r, hi.g, hi.b),
      dimHex: rgbToHex(dim.r, dim.g, dim.b),
      glacierHex: rgbToHex(glacier.r, glacier.g, glacier.b),
      sproutHex: rgbToHex(sprout.r, sprout.g, sprout.b),
      accentRgb: `${Math.round(primary.r)}, ${Math.round(primary.g)}, ${Math.round(primary.b)}`,
      hiRgb: `${Math.round(hi.r)}, ${Math.round(hi.g)}, ${Math.round(hi.b)}`,
      dimRgb: `${Math.round(dim.r)}, ${Math.round(dim.g)}, ${Math.round(dim.b)}`,
      glacierRgb: `${Math.round(glacier.r)}, ${Math.round(glacier.g)}, ${Math.round(glacier.b)}`,
      sproutRgb: `${Math.round(sprout.r)}, ${Math.round(sprout.g)}, ${Math.round(sprout.b)}`,
      glow: `rgba(${Math.round(primary.r)}, ${Math.round(primary.g)}, ${Math.round(primary.b)}, 0.16)`
    };
  }

  class AccentController {
    constructor(options = {}) {
      this.store = options.store || null;
      this.currentHex = DEFAULT_HEX;
      this.bar = null;
      this.init();
    }

    init() {
      if (typeof document === 'undefined') return;

      const saved = this.getSavedHex();
      this.apply(saved, false);

      this.mountBottomBar();
      this.observeThemeChanges();
    }

    getSavedHex() {
      try {
        const stored = localStorage.getItem(STORAGE_KEY);
        return stored ? normalizeHex(stored) : DEFAULT_HEX;
      } catch (e) {
        return DEFAULT_HEX;
      }
    }

    apply(hex, persist = true) {
      const normalized = normalizeHex(hex);
      this.currentHex = normalized;

      const isLight =
        document.documentElement.classList.contains('light') ||
        (document.body && document.body.classList.contains('light'));

      const rootEl = document.documentElement;

      if (normalized === DEFAULT_HEX && !isLight) {
        // Restore clean defaults if default emerald in dark mode, or set explicitly
        this.setCssTokens(rootEl, derivePalette(DEFAULT_HEX, false));
      } else {
        this.setCssTokens(rootEl, derivePalette(normalized, isLight));
      }

      if (persist) {
        try {
          if (normalized === DEFAULT_HEX) {
            localStorage.removeItem(STORAGE_KEY);
          } else {
            localStorage.setItem(STORAGE_KEY, normalized);
          }
        } catch (e) {}
      }

      this.syncUI();

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('accentchange', {
          detail: { hex: normalized }
        }));
      }
    }

    setCssTokens(rootEl, p) {
      const targets = [rootEl];
      if (document.body) targets.push(document.body);

      targets.forEach(el => {
        el.style.setProperty('--nature', p.primaryHex);
        el.style.setProperty('--nature-hi', p.hiHex);
        el.style.setProperty('--nature-dim', p.dimHex);
        el.style.setProperty('--nature-glow', p.glow);
        el.style.setProperty('--glacier', p.glacierHex);
        el.style.setProperty('--sprout', p.sproutHex);
        el.style.setProperty('--accent-rgb', p.accentRgb);
        el.style.setProperty('--accent-hi-rgb', p.hiRgb);
        el.style.setProperty('--accent-dim-rgb', p.dimRgb);
        el.style.setProperty('--glacier-rgb', p.glacierRgb);
        el.style.setProperty('--sprout-rgb', p.sproutRgb);
        el.style.setProperty('--gold', p.primaryHex);
        el.style.setProperty('--gold-hi', p.hiHex);
        el.style.setProperty('--gold-dim', p.dimHex);
        el.style.setProperty('--gold-glow', p.glow);
        el.style.setProperty('--building', p.primaryHex);
      });
    }

    observeThemeChanges() {
      if (typeof MutationObserver === 'undefined' || !document.body) return;
      const observer = new MutationObserver(() => {
        this.apply(this.currentHex, false);
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('themechange'));
        }
      });
      observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }

    mountBottomBar() {
      if (document.getElementById('accent-picker-bar')) return;

      const bar = document.createElement('div');
      bar.id = 'accent-picker-bar';
      bar.className = 'accent-picker-bar';
      bar.setAttribute('role', 'region');
      bar.setAttribute('aria-label', 'Highlight Color Switcher');

      const swatchesHtml = PRESETS.map(p => `
        <button
          type="button"
          class="accent-swatch"
          data-accent="${p.hex}"
          title="${p.name} (${p.hex})"
          aria-label="Set highlight color to ${p.name}"
          style="--swatch-color: ${p.hex};"
        ></button>
      `).join('');

      bar.innerHTML = `
        <div class="accent-picker-inner">
          <div class="accent-picker-label">
            <span class="accent-live-dot" aria-hidden="true"></span>
            <span>HIGHLIGHT COLOR</span>
          </div>
          <div class="accent-swatches" role="group" aria-label="Preset highlight colors">
            ${swatchesHtml}
            <label class="accent-custom-wrap" title="Pick custom highlight color">
              <input
                type="color"
                id="accent-custom-input"
                class="accent-custom-input"
                value="${this.currentHex}"
                aria-label="Custom highlight color picker"
              />
              <span class="accent-custom-btn" aria-hidden="true">+</span>
            </label>
          </div>
          <div class="accent-picker-meta">
            <code class="accent-hex-readout" id="accent-hex-readout">${this.currentHex.toUpperCase()}</code>
            <button type="button" class="accent-reset-btn" id="accent-reset-btn" title="Reset to default Emerald">Reset</button>
          </div>
        </div>
      `;

      // Mount inside the page footer if present, else at the bottom of body
      const footer =
        document.querySelector('footer.site-footer') ||
        document.querySelector('footer.projects-footer') ||
        document.querySelector('footer.page-footer') ||
        document.querySelector('footer');

      if (footer) {
        footer.appendChild(bar);
      } else {
        document.body.appendChild(bar);
      }

      this.bar = bar;
      this.bindEvents();
      this.syncUI();
    }

    bindEvents() {
      if (!this.bar) return;

      this.bar.querySelectorAll('.accent-swatch').forEach(btn => {
        btn.addEventListener('click', () => {
          const hex = btn.getAttribute('data-accent');
          this.applyWithTransition(hex);
        });
      });

      const customInput = this.bar.querySelector('#accent-custom-input');
      if (customInput) {
        customInput.addEventListener('input', (e) => {
          this.apply(e.target.value, true);
        });
      }

      const resetBtn = this.bar.querySelector('#accent-reset-btn');
      if (resetBtn) {
        resetBtn.addEventListener('click', () => {
          this.applyWithTransition(DEFAULT_HEX);
        });
      }
    }

    applyWithTransition(hex) {
      if (document.startViewTransition && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        document.startViewTransition(() => {
          this.apply(hex, true);
        });
      } else {
        this.apply(hex, true);
      }
    }

    syncUI() {
      if (!this.bar) return;

      const current = this.currentHex.toLowerCase();
      this.bar.querySelectorAll('.accent-swatch').forEach(btn => {
        const swatchHex = (btn.getAttribute('data-accent') || '').toLowerCase();
        btn.classList.toggle('active', swatchHex === current);
        btn.setAttribute('aria-pressed', swatchHex === current ? 'true' : 'false');
      });

      const customInput = this.bar.querySelector('#accent-custom-input');
      if (customInput) {
        customInput.value = current;
      }

      const readout = this.bar.querySelector('#accent-hex-readout');
      if (readout) {
        readout.textContent = current.toUpperCase();
      }

      const resetBtn = this.bar.querySelector('#accent-reset-btn');
      if (resetBtn) {
        resetBtn.classList.toggle('visible', current !== DEFAULT_HEX);
      }
    }
  }

  return AccentController;
});
