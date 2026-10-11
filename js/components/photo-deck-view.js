/**
 * PhotoDeckView — 3D Perspective Portrait Photo Deck Controller
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.PhotoDeckView = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  class PhotoDeckView {
    constructor() {
      this.activeIndex = 0;
      this.timer = null;
      this.init();
    }

    init() {
      if (typeof document === 'undefined') return;

      const self = this;
      window.cyclePhotoDeck = function (index) {
        self.cycle(index);
      };
    }

    cycle(index) {
      const deck = document.getElementById('photoDeck');
      const dots = document.querySelectorAll('.photo-dot');
      if (!deck) return;

      if (typeof index === 'number') {
        this.activeIndex = index;
      } else {
        this.activeIndex = (this.activeIndex + 1) % 3;
      }

      deck.classList.remove('manual-0', 'manual-1', 'manual-2');
      deck.classList.add(`manual-${this.activeIndex}`);

      dots.forEach((dot, idx) => {
        dot.classList.toggle('active', idx === this.activeIndex);
      });

      if (this.timer) clearTimeout(this.timer);
      this.timer = setTimeout(() => {
        deck.classList.remove('manual-0', 'manual-1', 'manual-2');
      }, 8000);
    }
  }

  return PhotoDeckView;
});
