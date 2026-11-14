/**
 * Cross-Window Kinetic Elasticity
 * Connects separate browser windows / satellite popout HUD via BroadcastChannel
 * and renders gooey bioluminescent elastic filaments across screen coordinates.
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.CrossWindowPhysics = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function initCrossWindowPhysics() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if (window.innerWidth < 640) return; // Guard for mobile battery & layout safety

    const mainCanvas = document.getElementById('cross-window-main-canvas');
    if (!mainCanvas) return;
    const ctx = mainCanvas.getContext('2d');
    if (!ctx) return;

    function resizeMainCanvas() {
      mainCanvas.width = window.innerWidth;
      mainCanvas.height = window.innerHeight;
      mainCanvas.style.width = '100%';
      mainCanvas.style.height = '100%';
      mainCanvas.style.maxWidth = '100vw';
    }
    window.addEventListener('resize', resizeMainCanvas);
    resizeMainCanvas();

    if (typeof BroadcastChannel === 'undefined') return;
    const channel = new BroadcastChannel('monocoque_window_mesh');
    let satellitePos = null;
    let lastSatTime = 0;
    let particles = [];
    let wasConnected = false;

    // Broadcast our window coordinates across the desktop
    function broadcastMain() {
      channel.postMessage({
        type: 'window_pos',
        sender: 'main',
        x: window.screenX,
        y: window.screenY,
        w: window.outerWidth,
        h: window.outerHeight,
        time: Date.now()
      });
    }

    channel.onmessage = (e) => {
      if (e.data && e.data.type === 'window_pos' && e.data.sender === 'satellite') {
        satellitePos = e.data;
        lastSatTime = Date.now();
      }
    };

    function triggerSplatter(x, y) {
      for (let i = 0; i < 40; i++) {
        const angle = Math.random() * Math.PI * 2;
        const spd = Math.random() * 9 + 2;
        particles.push({
          x, y,
          vx: Math.cos(angle) * spd,
          vy: Math.sin(angle) * spd,
          life: 1.0,
          color: Math.random() > 0.5
            ? (getComputedStyle(document.documentElement).getPropertyValue('--nature').trim() || '#10b981')
            : (getComputedStyle(document.documentElement).getPropertyValue('--glacier').trim() || '#2dd4bf')
        });
      }
    }

    function renderMainBridge() {
      ctx.clearRect(0, 0, mainCanvas.width, mainCanvas.height);

      const isAlive = satellitePos && (Date.now() - lastSatTime < 1600);

      if (isAlive) {
        const myCenterX = window.screenX + window.outerWidth / 2;
        const myCenterY = window.screenY + window.outerHeight / 2;
        const otherCenterX = satellitePos.x + satellitePos.w / 2;
        const otherCenterY = satellitePos.y + satellitePos.h / 2;

        const dx = otherCenterX - myCenterX;
        const dy = otherCenterY - myCenterY;
        const dist = Math.hypot(dx, dy);
        const maxDist = 720;

        if (dist < maxDist) {
          wasConnected = true;
          const angle = Math.atan2(dy, dx);

          // Clamped edge point
          const startX = mainCanvas.width / 2 + Math.cos(angle) * (mainCanvas.width / 2.05);
          const startY = mainCanvas.height / 2 + Math.sin(angle) * (mainCanvas.height / 2.05);

          const reach = Math.max(1.0 - (dist / maxDist), 0.1);
          const endX = startX + Math.cos(angle) * (reach * 260);
          const endY = startY + Math.sin(angle) * (reach * 260);

          const thickness = 24 * reach;
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.lineWidth = thickness;
          ctx.lineCap = 'round';
          const cs = getComputedStyle(document.documentElement);
          const acc = cs.getPropertyValue('--nature').trim() || '#10b981';
          const accHi = cs.getPropertyValue('--nature-hi').trim() || '#34d399';
          const accGl = cs.getPropertyValue('--glacier').trim() || '#2dd4bf';

          ctx.strokeStyle = acc;
          ctx.shadowColor = accHi;
          ctx.shadowBlur = 25;
          ctx.stroke();

          // Luminous core filament
          ctx.beginPath();
          ctx.moveTo(startX, startY);
          ctx.lineTo(endX, endY);
          ctx.lineWidth = thickness * 0.45;
          ctx.strokeStyle = '#f0fdf4';
          ctx.shadowColor = accGl;
          ctx.shadowBlur = 12;
          ctx.stroke();

          // Pulsing energy nodes
          const pNorm = (Math.sin(Date.now() * 0.007) + 1) / 2;
          const nodeX = startX + (endX - startX) * pNorm;
          const nodeY = startY + (endY - startY) * pNorm;
          ctx.beginPath();
          ctx.arc(nodeX, nodeY, thickness * 0.7, 0, Math.PI * 2);
          ctx.fillStyle = accHi;
          ctx.shadowBlur = 20;
          ctx.fill();

          ctx.restore();
        } else if (wasConnected) {
          wasConnected = false;
          const angle = Math.atan2(dy, dx);
          const snapX = mainCanvas.width / 2 + Math.cos(angle) * (mainCanvas.width / 2.05);
          const snapY = mainCanvas.height / 2 + Math.sin(angle) * (mainCanvas.height / 2.05);
          triggerSplatter(snapX, snapY);
        }
      }

      // Splatter particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vx *= 0.94;
        p.vy *= 0.94;
        p.life -= 0.025;

        if (p.life <= 0) {
          particles.splice(i, 1);
        } else {
          ctx.save();
          ctx.beginPath();
          ctx.arc(p.x, p.y, 3.5 * p.life, 0, Math.PI * 2);
          ctx.fillStyle = p.color;
          ctx.globalAlpha = p.life;
          ctx.shadowColor = p.color;
          ctx.shadowBlur = 10;
          ctx.fill();
          ctx.restore();
        }
      }

      broadcastMain();
      requestAnimationFrame(renderMainBridge);
    }
    renderMainBridge();
  }

  // Auto-bootstrap
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initCrossWindowPhysics);
    } else {
      initCrossWindowPhysics();
    }
  }

  return { init: initCrossWindowPhysics };
});
