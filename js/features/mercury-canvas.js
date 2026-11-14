/**
 * Interactive Liquid Mercury Fluid Dynamics
 * Full-page quicksilver cursor tracking, particle cohesion, and surface tension physics.
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.MercuryCanvas = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function initHeroLiquidMercury() {
    if (typeof window === 'undefined' || typeof document === 'undefined') return;
    if (window.innerWidth < 640) return; // Disable intensive per-frame loop on mobile viewports

    const mercCanvas = document.getElementById('hero-mercury-canvas');
    if (!mercCanvas) return;

    const ctx = mercCanvas.getContext('2d');
    if (!ctx) return;

    let width = window.innerWidth;
    let height = window.innerHeight;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      mercCanvas.width = width * dpr;
      mercCanvas.height = height * dpr;
      mercCanvas.style.width = '100%';
      mercCanvas.style.height = '100%';
      mercCanvas.style.maxWidth = '100vw';
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    window.addEventListener('resize', resize);
    resize();

    let mouse = {
      x: width * 0.5,
      y: height * 0.4,
      targetX: width * 0.5,
      targetY: height * 0.4,
      isInside: false,
      vx: 0,
      vy: 0
    };

    window.addEventListener('mousemove', (e) => {
      const mx = e.clientX;
      const my = e.clientY;
      mouse.vx = mx - mouse.targetX;
      mouse.vy = my - mouse.targetY;
      mouse.targetX = mx;
      mouse.targetY = my;
      mouse.isInside = true;
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      mouse.isInside = false;
      mouse.targetX = window.innerWidth * 0.5;
      mouse.targetY = window.innerHeight * 0.4;
    });

    // Liquid Mercury Beads (Refined compact & glassy profile)
    const numSatellites = 7;
    const numAmbient = 6;
    const beads = [];

    // 0: Master core bead (compact ~18px radius)
    beads.push({
      x: mouse.targetX,
      y: mouse.targetY,
      vx: 0,
      vy: 0,
      r: 18,
      baseR: 18,
      isMaster: true,
      phase: 0
    });

    // Satellite beads clustering in a cohesive orbit
    for (let i = 0; i < numSatellites; i++) {
      const angle = (i / numSatellites) * Math.PI * 2;
      const dist = 16 + Math.random() * 22;
      beads.push({
        x: mouse.targetX + Math.cos(angle) * dist,
        y: mouse.targetY + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 1.2,
        vy: (Math.random() - 0.5) * 1.2,
        r: 6 + Math.random() * 6,
        baseR: 6 + Math.random() * 6,
        isMaster: false,
        isAmbient: false,
        orbitDist: dist,
        phase: Math.random() * Math.PI * 2
      });
    }

    // Ambient roving quicksilver droplets
    for (let i = 0; i < numAmbient; i++) {
      beads.push({
        x: Math.random() * (width || 800),
        y: Math.random() * (height || 500),
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        r: 3.5 + Math.random() * 3.5,
        baseR: 3.5 + Math.random() * 3.5,
        isMaster: false,
        isAmbient: true,
        wanderPhase: Math.random() * Math.PI * 2
      });
    }

    // Click: Delicate splatter & outward impulse
    window.addEventListener('click', (e) => {
      const clickX = e.clientX;
      const clickY = e.clientY;

      beads.forEach(b => {
        const dx = b.x - clickX;
        const dy = b.y - clickY;
        const dist = Math.hypot(dx, dy) || 1;
        const impulse = Math.min(140 / dist, 12);
        const angle = Math.atan2(dy, dx) + (Math.random() - 0.5) * 0.5;
        b.vx += Math.cos(angle) * impulse * 1.5;
        b.vy += Math.sin(angle) * impulse * 1.5;
        b.r = Math.max(3.5, b.baseR * 0.7);
      });
    });

    let time = 0;

    function drawLiquidBridge(b1, b2) {
      const dx = b2.x - b1.x;
      const dy = b2.y - b1.y;
      const dist = Math.hypot(dx, dy);
      const maxConnect = (b1.r + b2.r) * 1.85;

      if (dist < maxConnect && dist > 2) {
        const factor = Math.max(0, 1 - (dist / maxConnect));
        const midX = (b1.x + b2.x) * 0.5;
        const midY = (b1.y + b2.y) * 0.5;
        const bridgeWidth = Math.min(b1.r, b2.r) * factor * 0.75;

        if (bridgeWidth > 0.8) {
          ctx.save();
          ctx.beginPath();
          ctx.moveTo(b1.x, b1.y);
          ctx.lineTo(b2.x, b2.y);
          ctx.lineWidth = bridgeWidth * 2;
          ctx.lineCap = 'round';

          const isLight = document.body.classList.contains('light');
          if (isLight) {
            ctx.strokeStyle = `rgba(180, 205, 190, ${0.45 * factor})`;
          } else {
            ctx.strokeStyle = `rgba(16, 185, 129, ${0.30 * factor})`;
          }
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    function drawMercuryDroplet(b) {
      ctx.save();
      const isLight = document.body.classList.contains('light');

      // Specular liquid gradient
      const grad = ctx.createRadialGradient(
        b.x - b.r * 0.32,
        b.y - b.r * 0.35,
        b.r * 0.08,
        b.x,
        b.y,
        b.r
      );

      if (isLight) {
        grad.addColorStop(0, 'rgba(255, 255, 255, 0.95)');
        grad.addColorStop(0.35, 'rgba(220, 235, 226, 0.85)');
        grad.addColorStop(0.75, 'rgba(175, 205, 188, 0.75)');
        grad.addColorStop(1, 'rgba(130, 165, 145, 0.60)');
        ctx.shadowColor = 'rgba(16, 185, 129, 0.18)';
        ctx.shadowBlur = 10;
      } else {
        grad.addColorStop(0, 'rgba(240, 253, 244, 0.90)');
        grad.addColorStop(0.35, 'rgba(52, 211, 153, 0.65)');
        grad.addColorStop(0.80, 'rgba(16, 185, 129, 0.35)');
        grad.addColorStop(1, 'rgba(5, 150, 105, 0.15)');
        ctx.shadowColor = 'rgba(16, 185, 129, 0.45)';
        ctx.shadowBlur = 12;
      }

      ctx.beginPath();
      ctx.arc(b.x, b.y, Math.max(1, b.r), 0, Math.PI * 2);
      ctx.fillStyle = grad;
      ctx.fill();

      // Sharp glass reflection specular highlight
      ctx.beginPath();
      ctx.ellipse(
        b.x - b.r * 0.30,
        b.y - b.r * 0.34,
        b.r * 0.32,
        b.r * 0.18,
        Math.PI * 0.25,
        0,
        Math.PI * 2
      );
      ctx.fillStyle = 'rgba(255, 255, 255, 0.82)';
      ctx.fill();

      ctx.restore();
    }

    function renderMercuryLoop() {
      time += 0.02;
      ctx.clearRect(0, 0, width, height);

      // Smooth mouse spring interpolation
      mouse.x += (mouse.targetX - mouse.x) * 0.12;
      mouse.y += (mouse.targetY - mouse.y) * 0.12;

      const master = beads[0];
      master.x = mouse.x;
      master.y = mouse.y;

      // Pulse breathing
      master.r = master.baseR + Math.sin(time * 2) * 1.5;

      // Update positions & physics
      for (let i = 1; i < beads.length; i++) {
        const b = beads[i];

        if (!b.isAmbient) {
          // Satellites cluster orbit around master
          const targetDist = b.orbitDist;
          b.phase += 0.035;
          const tx = master.x + Math.cos(b.phase) * targetDist;
          const ty = master.y + Math.sin(b.phase) * targetDist;

          b.vx += (tx - b.x) * 0.08;
          b.vy += (ty - b.y) * 0.08;

          // Drag
          b.vx *= 0.88;
          b.vy *= 0.88;

          b.x += b.vx;
          b.y += b.vy;

          // Return to base radius
          b.r += (b.baseR - b.r) * 0.08;
        } else {
          // Ambient wanderers
          b.wanderPhase += 0.015;
          b.vx += Math.cos(b.wanderPhase) * 0.08;
          b.vy += Math.sin(b.wanderPhase * 0.8) * 0.08;

          // Gentle attraction toward master if within proximity
          const dx = master.x - b.x;
          const dy = master.y - b.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 180 && dist > 20) {
            const pull = (1 - dist / 180) * 0.35;
            b.vx += (dx / dist) * pull;
            b.vy += (dy / dist) * pull;
          }

          b.vx *= 0.94;
          b.vy *= 0.94;
          b.x += b.vx;
          b.y += b.vy;

          // Boundary bouncing
          if (b.x < 20) { b.x = 20; b.vx *= -1; }
          if (b.x > width - 20) { b.x = width - 20; b.vx *= -1; }
          if (b.y < 20) { b.y = 20; b.vy *= -1; }
          if (b.y > height - 20) { b.y = height - 20; b.vy *= -1; }
        }
      }

      // Draw bridges between near beads
      for (let i = 0; i < beads.length; i++) {
        for (let j = i + 1; j < beads.length; j++) {
          drawLiquidBridge(beads[i], beads[j]);
        }
      }

      // Draw droplets
      for (let i = 0; i < beads.length; i++) {
        drawMercuryDroplet(beads[i]);
      }

      requestAnimationFrame(renderMercuryLoop);
    }

    renderMercuryLoop();
  }

  // Auto-bootstrap
  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initHeroLiquidMercury);
    } else {
      initHeroLiquidMercury();
    }
  }

  return { init: initHeroLiquidMercury };
});
