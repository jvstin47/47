/**
 * NavigationController — Handles scroll progress, section scroll-spy,
 * mobile drawer toggle, email clipboard copy, and toolkit filtering.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['DomUtils', 'ErrorHandler'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('../utils/dom'), require('../utils/error-handler'));
  } else {
    root.NavigationController = factory(root.DomUtils, root.ErrorHandler);
  }
})(typeof self !== 'undefined' ? self : this, function (DomUtils, ErrorHandler) {
  'use strict';

  class NavigationController {
    constructor() {
      this.init();
    }

    init() {
      if (typeof document === 'undefined') return;

      this.initScrollProgress();
      this.initScrollSpy();
      this.initScrollReveal();
      this.initMobileNav();
      this.initFloatingDock();
      this.initToolkitFilter();
      this.initCopyEmail();
    }

    initScrollProgress() {
      const progressBar = document.getElementById('progress');
      if (!progressBar) return;

      window.addEventListener('scroll', () => {
        const scrolled = window.scrollY;
        const total = document.documentElement.scrollHeight - window.innerHeight;
        if (total > 0) {
          progressBar.style.width = `${(scrolled / total) * 100}%`;
        }
      }, { passive: true });
    }

    initScrollSpy() {
      const sections = document.querySelectorAll('section[id]');
      const navLinks = document.querySelectorAll('.nav-links a[href^="#"]');
      if (!sections.length || !navLinks.length) return;

      const spy = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            const targetId = '#' + entry.target.id;
            navLinks.forEach(link => {
              link.style.color = link.getAttribute('href') === targetId ? 'var(--nature)' : '';
            });
          }
        });
      }, { threshold: 0.45 });

      sections.forEach(s => spy.observe(s));
    }

    initScrollReveal() {
      const revealItems = document.querySelectorAll('.reveal');
      if (revealItems.length) {
        const revObs = new IntersectionObserver((entries) => {
          entries.forEach(e => {
            if (e.isIntersecting) {
              e.target.classList.add('visible');
              revObs.unobserve(e.target);
            }
          });
        }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

        revealItems.forEach(el => revObs.observe(el));
      }

      // Projects page staggered field reveal
      const projects = document.querySelectorAll('.project');
      if (projects.length) {
        const fieldObs = new IntersectionObserver((entries) => {
          entries.forEach(entry => {
            if (entry.isIntersecting) {
              entry.target.classList.add('visible');
              const fields = entry.target.querySelectorAll('.field');
              fields.forEach((f, i) => {
                f.style.opacity = '0';
                f.style.transform = 'translateY(20px)';
                f.style.transition = `opacity 0.6s ease ${i * 0.1}s, transform 0.6s ease ${i * 0.1}s`;
                setTimeout(() => {
                  f.style.opacity = '1';
                  f.style.transform = 'translateY(0)';
                }, 50 + i * 100);
              });
              fieldObs.unobserve(entry.target);
            }
          });
        }, { threshold: 0.08 });

        projects.forEach(p => fieldObs.observe(p));
      }
    }

    initMobileNav() {
      const links = document.getElementById('nav-links');
      const hamburger = document.querySelector('.nav-hamburger');

      window.toggleMobileNav = function (e) {
        if (e && e.stopPropagation) e.stopPropagation();
        if (!links) return;
        const isOpen = links.classList.toggle('open');
        if (hamburger) hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      };

      if (links) {
        links.querySelectorAll('a').forEach(a => {
          a.addEventListener('click', () => {
            links.classList.remove('open');
            if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
          });
        });
      }

      document.addEventListener('click', (e) => {
        if (links && links.classList.contains('open') && !links.contains(e.target) && !e.target.closest('.nav-hamburger')) {
          links.classList.remove('open');
          if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
        }
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && links && links.classList.contains('open')) {
          links.classList.remove('open');
          if (hamburger) hamburger.setAttribute('aria-expanded', 'false');
        }
      });
    }

    initFloatingDock() {
      const dock = document.getElementById('floating-iso-dock');
      const toggle = document.getElementById('iso-dock-toggle');

      const setOpen = (open) => {
        const d = dock || document.getElementById('floating-iso-dock');
        const t = toggle || document.getElementById('iso-dock-toggle');
        if (!d) return;
        const next = typeof open === 'boolean' ? open : !d.classList.contains('is-open');
        d.classList.toggle('is-open', next);
        if (t) t.setAttribute('aria-expanded', next ? 'true' : 'false');

        // Focus management: move focus to first action link on open, return to toggle on close
        if (next) {
          setTimeout(() => {
            const first = d.querySelector('.iso-card a');
            if (first) first.focus();
          }, 60);
        } else if (t && document.activeElement && d.contains(document.activeElement)) {
          t.focus();
        }
      };

      // Expose globally for inline onclick and external callers
      window.toggleMobileDock = (e) => {
        if (e && e.stopPropagation) e.stopPropagation();
        setOpen();
      };

      if (!dock || !toggle) return;

      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        setOpen();
      });

      toggle.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          setOpen();
        }
      });

      dock.querySelectorAll('a').forEach(a => {
        a.addEventListener('click', () => setOpen(false));
      });

      // Keyboard accessibility: Tab trapping inside expanded speed dial
      dock.addEventListener('keydown', (e) => {
        if (!dock.classList.contains('is-open')) return;
        if (e.key === 'Escape') {
          e.preventDefault();
          setOpen(false);
          return;
        }
        if (e.key === 'Tab') {
          const links = [...dock.querySelectorAll('.iso-card a')];
          if (!links.length) return;
          const first = links[0];
          const last = links[links.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === first || document.activeElement === toggle) {
              e.preventDefault();
              (document.activeElement === first ? toggle : last).focus();
            }
          } else {
            if (document.activeElement === last || document.activeElement === toggle) {
              e.preventDefault();
              (document.activeElement === last ? toggle : first).focus();
            }
          }
        }
      });

      document.addEventListener('click', (e) => {
        if (dock.classList.contains('is-open') && !dock.contains(e.target)) {
          setOpen(false);
        }
      });

      // Auto-collapse on significant touch scroll so it never obstructs
      let lastScroll = window.scrollY;
      window.addEventListener('scroll', () => {
        if (dock.classList.contains('is-open') && Math.abs(window.scrollY - lastScroll) > 40) {
          setOpen(false);
          lastScroll = window.scrollY;
        }
      }, { passive: true });
    }

    initToolkitFilter() {
      window.filterToolkit = function (category, btn) {
        document.querySelectorAll('.toolkit-btn').forEach(b => b.classList.remove('active'));
        if (btn) btn.classList.add('active');
        const cards = document.querySelectorAll('.toolkit-card');
        cards.forEach(card => {
          if (category === 'all' || card.dataset.category === category) {
            card.style.display = 'block';
          } else {
            card.style.display = 'none';
          }
        });
      };
    }

    initCopyEmail() {
      window.copyEmail = function (btn) {
        const email = 'jvstin47@gmail.com';
        if (navigator.clipboard && navigator.clipboard.writeText) {
          navigator.clipboard.writeText(email).then(() => {
            const textSpan = btn ? btn.querySelector('.copy-btn-text') : null;
            if (textSpan) {
              const orig = textSpan.textContent;
              textSpan.textContent = 'COPIED! ✓';
              btn.style.color = 'var(--building)';
              setTimeout(() => {
                textSpan.textContent = orig;
                btn.style.color = '';
              }, 2000);
            }
          }).catch(err => {
            if (ErrorHandler) ErrorHandler.handle(err, 'Clipboard copy');
          });
        }
      };
    }
  }

  return NavigationController;
});
