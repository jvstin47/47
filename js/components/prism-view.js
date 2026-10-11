/**
 * PrismView — 3D Glass Card Tilt Physics and Dynamic Spotlight Tracking
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PrismView = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  class PrismView {
    constructor() {
      this.init();
    }

    init() {
      if (typeof document === 'undefined') return;

      const prismCards = document.querySelectorAll('.prism-card');
      const feRed = document.getElementById('prism-red-offset');
      const feBlue = document.getElementById('prism-blue-offset');

      if (!prismCards.length) return;

      prismCards.forEach(card => {
        let isHovering = false;
        let targetX = 0, targetY = 0;
        let currentX = 0, currentY = 0;
        let rafId = null;

        card.addEventListener('mouseenter', () => {
          isHovering = true;
          if (!rafId) renderTilt();
        });

        card.addEventListener('mousemove', (e) => {
          const rect = card.getBoundingClientRect();
          const mouseX = e.clientX - rect.left;
          const mouseY = e.clientY - rect.top;

          card.style.setProperty('--mouse-x', `${mouseX}px`);
          card.style.setProperty('--mouse-y', `${mouseY}px`);

          const centerX = rect.width / 2;
          const centerY = rect.height / 2;
          const normX = (mouseX - centerX) / centerX;
          const normY = (mouseY - centerY) / centerY;
          targetY = normX * 8.5;
          targetX = -normY * 8.5;

          if (feRed && feBlue) {
            const shift = normX * 4.5;
            feRed.setAttribute('dx', (-shift).toFixed(2));
            feBlue.setAttribute('dx', (shift).toFixed(2));
          }
        });

        card.addEventListener('mouseleave', () => {
          isHovering = false;
          targetX = 0;
          targetY = 0;
          if (feRed && feBlue) {
            feRed.setAttribute('dx', '-2.5');
            feBlue.setAttribute('dx', '2.5');
          }
        });

        function renderTilt() {
          currentX += (targetX - currentX) * 0.14;
          currentY += (targetY - currentY) * 0.14;
          card.style.setProperty('--tilt-x', `${currentX.toFixed(2)}deg`);
          card.style.setProperty('--tilt-y', `${currentY.toFixed(2)}deg`);

          if (isHovering || Math.abs(targetX - currentX) > 0.05 || Math.abs(targetY - currentY) > 0.05) {
            rafId = requestAnimationFrame(renderTilt);
          } else {
            card.style.setProperty('--tilt-x', '0deg');
            card.style.setProperty('--tilt-y', '0deg');
            rafId = null;
          }
        }
      });
    }
  }

  return PrismView;
});
