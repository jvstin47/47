/**
 * CertModal — Lightbox View Controller for Engineering & Hackathon Certificates
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CertModal = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  class CertModal {
    constructor() {
      this.modal = null;
      this.modalImg = null;
      this.modalTitle = null;
      this.init();
    }

    init() {
      if (typeof document === 'undefined') return;

      this.modal = document.getElementById('cert-modal');
      this.modalImg = document.getElementById('cert-modal-img');
      this.modalTitle = document.getElementById('cert-modal-title');

      const self = this;
      window.openCert = function (src, title) {
        self.open(src, title);
      };

      window.closeCert = function () {
        self.close();
      };

      window.closeCertOnBackdrop = function (e) {
        if (e && e.target && e.target.id === 'cert-modal') {
          self.close();
        }
      };

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.modal && this.modal.classList.contains('active')) {
          this.close();
        }
      });
    }

    open(src, title) {
      if (this.modal && this.modalImg) {
        this.modalImg.src = src;
        this.modalImg.alt = title || 'Certificate Preview';
        if (this.modalTitle) this.modalTitle.textContent = title || 'Certificate';
        this.modal.classList.add('active');
        document.body.style.overflow = 'hidden';
      }
    }

    close() {
      if (this.modal) {
        this.modal.classList.remove('active');
        document.body.style.overflow = '';
      }
    }
  }

  return CertModal;
});
