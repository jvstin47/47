/**
 * ═══════════════════════════════════════════════════════════════════════════════════════
 * JUSTIN MATHEW PORTFOLIO — 4 CUTTING-EDGE INTERACTIVE DESIGN SYSTEMS
 * 
 * Phase 1: Magnetic Cursor & Elastic Hover (Nav links, terminal button, and project cards)
 * Phase 2: Bento 3D Parallax Depth (Flagship drone card #p8, project cards, toolkit)
 * Phase 3: Iridescent Nature Mesh (Hero backdrop & terminal console backdrop)
 * Phase 4: Kinetic Typography (Hero headline / Section titles)
 * ═══════════════════════════════════════════════════════════════════════════════════════
 */

(function() {
  'use strict';

  const isTouch = window.matchMedia('(pointer: coarse)').matches;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ─────────────────────────────────────────────────────────────────────────────
     PHASE 1: MAGNETIC CURSOR & ELASTIC HOVER
     Target Placement: Nav links, terminal button, project cards, action buttons
     Features: Velocity squash & stretch, magnetic target snapping, spring attraction
  ───────────────────────────────────────────────────────────────────────────── */
  function initPhase1MagneticCursor() {
    if (isTouch || prefersReducedMotion) return;

    let cursorWrap = document.getElementById('mag-cursor');
    if (!cursorWrap) {
      cursorWrap = document.createElement('div');
      cursorWrap.id = 'mag-cursor';
      cursorWrap.className = 'mag-cursor';
      cursorWrap.innerHTML = `
        <div class="mag-cursor-dot" id="mag-dot"></div>
        <div class="mag-cursor-ring" id="mag-ring"></div>
      `;
      document.body.appendChild(cursorWrap);
    }

    const dot = document.getElementById('mag-dot');
    const ring = document.getElementById('mag-ring');
    if (!dot || !ring) return;

    let mouseX = -100, mouseY = -100;
    let ringX = -100, ringY = -100;
    let isHover = false;
    let isInput = false;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      dot.style.transform = `translate(${mouseX}px, ${mouseY}px)`;
      dot.style.opacity = isInput ? '0' : '1';
      ring.style.opacity = isInput ? '0' : '1';
    }, { passive: true });

    document.addEventListener('mouseleave', () => {
      dot.style.opacity = '0';
      ring.style.opacity = '0';
    });

    document.addEventListener('mouseenter', () => {
      if (!isInput) {
        dot.style.opacity = '1';
        ring.style.opacity = '1';
      }
    });

    const interactiveSelectors = [
      'nav.site-nav a',
      '.nav-links a',
      '.tech-terminal-trigger',
      '#theme-btn',
      '.project-link',
      '.repo-link',
      '.jump-pill',
      '.toolkit-btn',
      '.filter-btn',
      '.btn-primary',
      '.btn-ghost',
      '.btn-outline',
      '.btn-terminal',
      '.back-top',
      '.cert-modal-close',
      '.tech-term-dot'
    ].join(',');

    function bindInteractiveCursor() {
      const targets = document.querySelectorAll(interactiveSelectors);
      targets.forEach(elem => {
        if (elem.dataset.cursorBound) return;
        elem.dataset.cursorBound = 'true';

        elem.addEventListener('mouseenter', () => {
          isHover = true;
          ring.classList.add('hovering');
        });

        elem.addEventListener('mouseleave', () => {
          isHover = false;
          ring.classList.remove('hovering');
        });
      });

      // Hide custom cursor over inputs and textareas so standard text caret shows
      const inputs = document.querySelectorAll('input, textarea, [contenteditable="true"]');
      inputs.forEach(input => {
        if (input.dataset.cursorBound) return;
        input.dataset.cursorBound = 'true';
        input.addEventListener('mouseenter', () => {
          isInput = true;
          dot.style.opacity = '0';
          ring.style.opacity = '0';
        });
        input.addEventListener('mouseleave', () => {
          isInput = false;
          dot.style.opacity = '1';
          ring.style.opacity = '1';
        });
      });
    }

    bindInteractiveCursor();
    setInterval(bindInteractiveCursor, 2500);

    function renderBotanicalCursor() {
      ringX += (mouseX - ringX) * 0.28;
      ringY += (mouseY - ringY) * 0.28;

      const size = isHover ? 32 : 22;
      ring.style.width = `${size}px`;
      ring.style.height = `${size}px`;
      ring.style.transform = `translate(${ringX - size / 2}px, ${ringY - size / 2}px)`;

      requestAnimationFrame(renderBotanicalCursor);
    }
    renderBotanicalCursor();
  }

  /* ─────────────────────────────────────────────────────────────────────────────
     PHASE 2: BENTO 3D PARALLAX DEPTH
     Target Placement: Flagship drone card (#p8 / .hardware-panel-card), project cards, toolkit
     Impact: Turns flat cards into layered physical hardware panels
  ───────────────────────────────────────────────────────────────────────────── */
  function initPhase2Bento3DParallax() {
    if (isTouch || prefersReducedMotion) return;

    const cards = document.querySelectorAll('.prism-card, .project-card, .hardware-panel-card, .proof-card, .toolkit-card');
    cards.forEach(card => {
      card.classList.add('bento-parallax-card');

      // Stratify child layers
      const midLayers = card.querySelectorAll('.project-title, .proj-title, .project-desc, .field-body, .timeline-desc, .toolkit-card-list, .proj-hook');
      midLayers.forEach(el => el.classList.add('bento-layer-mid'));

      const foreLayers = card.querySelectorAll('.ptag, .tag, .proj-badge, .project-link, .repo-link, .outcome-big, .proof-stat, .toolkit-btn, .proj-num');
      foreLayers.forEach(el => el.classList.add('bento-layer-fore'));

      let targetX = 0, targetY = 0;
      let curX = 0, curY = 0;
      let isHover = false;
      let raf = null;

      card.addEventListener('mouseenter', () => {
        isHover = true;
        if (!raf) raf = requestAnimationFrame(animateBento);
      });

      card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const nx = (e.clientX - rect.left) / rect.width - 0.5;
        const ny = (e.clientY - rect.top) / rect.height - 0.5;
        targetX = ny * -13; // tiltX
        targetY = nx * 13;  // tiltY

        card.style.setProperty('--mouse-x', `${((nx + 0.5) * 100).toFixed(1)}%`);
        card.style.setProperty('--mouse-y', `${((ny + 0.5) * 100).toFixed(1)}%`);
      });

      card.addEventListener('mouseleave', () => {
        isHover = false;
        targetX = 0;
        targetY = 0;
      });

      function animateBento() {
        curX += (targetX - curX) * 0.16;
        curY += (targetY - curY) * 0.16;

        card.style.transform = `perspective(1000px) rotateX(${curX.toFixed(2)}deg) rotateY(${curY.toFixed(2)}deg)`;

        // Foreground elements slide with elevated ratio
        const foreOffset = `translate3d(${(curY * 0.75).toFixed(1)}px, ${(curX * -0.75).toFixed(1)}px, 50px)`;
        foreLayers.forEach(el => {
          el.style.transform = foreOffset;
        });

        // Mid elements slide with gentle ratio
        const midOffset = `translate3d(${(curY * 0.28).toFixed(1)}px, ${(curX * -0.28).toFixed(1)}px, 24px)`;
        midLayers.forEach(el => {
          el.style.transform = midOffset;
        });

        if (isHover || Math.abs(curX) > 0.05 || Math.abs(curY) > 0.05) {
          raf = requestAnimationFrame(animateBento);
        } else {
          card.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg)';
          foreLayers.forEach(el => el.style.transform = '');
          midLayers.forEach(el => el.style.transform = '');
          raf = null;
        }
      }
    });
  }

  /* ─────────────────────────────────────────────────────────────────────────────
     PHASE 3: IRIDESCENT NATURE MESH (GPU WebGL Fragment Shader)
     Target Placement: Hero backdrop (#prism-hero-canvas) & Terminal console backdrop (#term-mesh-canvas)
     Impact: Adds organic fluid depth locked to emerald/pine palette
  ───────────────────────────────────────────────────────────────────────────── */
  function initPhase3IridescentNatureMesh() {
    const targetCanvases = [
      document.getElementById('prism-hero-canvas'),
      document.getElementById('term-mesh-canvas')
    ].filter(Boolean);

    if (!targetCanvases.length) return;

    const vsSource = `
      attribute vec2 a_position;
      void main() {
        gl_Position = vec4(a_position, 0.0, 1.0);
      }
    `;

    const fsSource = `
      precision mediump float;
      uniform vec2 u_resolution;
      uniform vec2 u_mouse;
      uniform float u_time;
      uniform float u_isLight;
      uniform float u_intensity;
      uniform vec3 u_accent;
      uniform vec3 u_accentHi;
      uniform vec3 u_accentDim;

      vec3 mod289(vec3 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec2 mod289(vec2 x) { return x - floor(x * (1.0 / 289.0)) * 289.0; }
      vec3 permute(vec3 x) { return mod289(((x*34.0)+1.0)*x); }

      float snoise(vec2 v) {
        const vec4 C = vec4(0.211324865405187, 0.366025403784439, -0.577350269189626, 0.024390243902439);
        vec2 i  = floor(v + dot(v, C.yy) );
        vec2 x0 = v -   i + dot(i, C.xx);
        vec2 i1 = (x0.x > x0.y) ? vec2(1.0, 0.0) : vec2(0.0, 1.0);
        vec4 x12 = x0.xyxy + C.xxzz;
        x12.xy -= i1;
        i = mod289(i);
        vec3 p = permute( permute( i.y + vec3(0.0, i1.y, 1.0 )) + i.x + vec3(0.0, i1.x, 1.0 ));
        vec3 m = max(0.5 - vec3(dot(x0,x0), dot(x12.xy,x12.xy), dot(x12.zw,x12.zw)), 0.0);
        m = m*m ;
        m = m*m ;
        vec3 x = 2.0 * fract(p * C.www) - 1.0;
        vec3 h = abs(x) - 0.5;
        vec3 ox = floor(x + 0.5);
        vec3 a0 = x - ox;
        m *= 1.79284291400159 - 0.85373472095314 * ( a0*a0 + h*h );
        vec3 g;
        g.x  = a0.x  * x0.x  + h.x  * x0.y;
        g.yz = a0.yz * x12.xz + h.yz * x12.yw;
        return 130.0 * dot(m, g);
      }

      void main() {
        vec2 uv = gl_FragCoord.xy / u_resolution.xy;
        vec2 p = uv * 2.0 - 1.0;
        p.x *= u_resolution.x / u_resolution.y;

        vec2 mouseEffect = (u_mouse - 0.5) * 0.35;
        float t = u_time * 0.28;

        float n1 = snoise(p * 0.75 + vec2(t * 0.5, t * 0.3) + mouseEffect);
        float n2 = snoise(p * 1.25 - vec2(t * 0.4, -t * 0.6) + vec2(n1 * 0.5));
        float n3 = snoise(p * 2.0 + vec2(n2 * 0.7, t * 0.8));

        vec3 colVoidDark = vec3(0.012, 0.020, 0.018);   // Deep Midnight Void
        vec3 colPine     = u_accentDim;                 // Deep Accent
        vec3 colEmerald  = u_accent;                    // Primary Accent Silk
        vec3 colGlacier  = mix(u_accent, u_accentHi, 0.55);
        vec3 colSprout   = u_accentHi;                  // Highlight Aurora

        vec3 colLightDew = mix(vec3(0.969, 0.980, 0.973), u_accentHi, 0.22);

        vec3 finalColor;
        float alpha;

        if (u_isLight > 0.5) {
          vec3 colMint     = mix(vec3(0.95), u_accentHi, 0.45);
          vec3 colJade     = mix(vec3(0.90), u_accent, 0.65);
          vec3 colDeepPine = u_accentDim;
          vec3 blend1 = mix(colLightDew, colMint, smoothstep(-0.6, 0.5, n1));
          vec3 blend2 = mix(blend1, colJade, smoothstep(-0.3, 0.7, n2));
          finalColor = mix(blend2, colDeepPine, clamp(n3 * 0.28, 0.0, 0.35));
          alpha = 0.75 * (1.0 - smoothstep(0.05, 1.4, length(uv - vec2(0.5, 0.28)))) * u_intensity;
        } else {
          vec3 blend1 = mix(colVoidDark, colPine, smoothstep(-0.8, 0.4, n1));
          vec3 blend2 = mix(blend1, colEmerald, smoothstep(-0.2, 0.9, n2));
          vec3 blend3 = mix(blend2, colGlacier, smoothstep(0.1, 1.1, n3));
          finalColor = mix(blend3, colSprout, clamp(n1 * n2 * 0.4, 0.0, 0.4));
          alpha = 0.65 * (1.0 - smoothstep(0.05, 1.3, length(uv - vec2(0.5, 0.25)))) * u_intensity;
        }

        gl_FragColor = vec4(finalColor, alpha);
      }
    `;

    function attachShader(canvas, intensityMultiplier) {
      const gl = canvas.getContext('webgl', { alpha: true, antialias: true, powerPreference: 'low-power' });
      if (!gl) return null;

      function createShader(gl, type, source) {
        const shader = gl.createShader(type);
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
          gl.deleteShader(shader);
          return null;
        }
        return shader;
      }

      const vs = createShader(gl, gl.VERTEX_SHADER, vsSource);
      const fs = createShader(gl, gl.FRAGMENT_SHADER, fsSource);
      if (!vs || !fs) return null;

      const program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return null;

      gl.useProgram(program);

      const posBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, posBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        -1, -1,
         1, -1,
        -1,  1,
        -1,  1,
         1, -1,
         1,  1
      ]), gl.STATIC_DRAW);

      const aPos = gl.getAttribLocation(program, 'a_position');
      gl.enableVertexAttribArray(aPos);
      gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

      const uRes = gl.getUniformLocation(program, 'u_resolution');
      const uMouse = gl.getUniformLocation(program, 'u_mouse');
      const uTime = gl.getUniformLocation(program, 'u_time');
      const uLight = gl.getUniformLocation(program, 'u_isLight');
      const uInt = gl.getUniformLocation(program, 'u_intensity');
      const uAccent = gl.getUniformLocation(program, 'u_accent');
      const uAccentHi = gl.getUniformLocation(program, 'u_accentHi');
      const uAccentDim = gl.getUniformLocation(program, 'u_accentDim');

      function parseCssRgb(varName, fallback) {
        const raw = getComputedStyle(document.documentElement).getPropertyValue(varName).trim();
        if (!raw) return fallback;
        const parts = raw.split(',').map(n => parseFloat(n.trim()) / 255);
        return parts.length === 3 && !parts.some(isNaN) ? parts : fallback;
      }

      let cachedAccent = parseCssRgb('--accent-rgb', [0.063, 0.725, 0.506]);
      let cachedAccentHi = parseCssRgb('--accent-hi-rgb', [0.204, 0.827, 0.600]);
      let cachedAccentDim = parseCssRgb('--accent-dim-rgb', [0.016, 0.471, 0.341]);

      const refreshAccentUniforms = () => {
        cachedAccent = parseCssRgb('--accent-rgb', [0.063, 0.725, 0.506]);
        cachedAccentHi = parseCssRgb('--accent-hi-rgb', [0.204, 0.827, 0.600]);
        cachedAccentDim = parseCssRgb('--accent-dim-rgb', [0.016, 0.471, 0.341]);
      };

      window.addEventListener('accentchange', refreshAccentUniforms);
      window.addEventListener('themechange', refreshAccentUniforms);

      let mouse = { x: 0.5, y: 0.5, targetX: 0.5, targetY: 0.5 };
      window.addEventListener('mousemove', (e) => {
        mouse.targetX = e.clientX / window.innerWidth;
        mouse.targetY = 1.0 - (e.clientY / window.innerHeight);
      }, { passive: true });

      function resize() {
        const parent = canvas.parentElement || document.body;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        const width = parent.offsetWidth || window.innerWidth;
        const height = parent.offsetHeight || window.innerHeight;
        canvas.width = width * dpr;
        canvas.height = height * dpr;
        gl.viewport(0, 0, canvas.width, canvas.height);
      }
      resize();
      window.addEventListener('resize', resize);

      gl.enable(gl.BLEND);
      gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

      const startTime = performance.now();
      return function render(now) {
        // If canvas is not visible (e.g. terminal modal closed), skip heavy draw
        if (canvas.offsetParent === null && canvas.id === 'term-mesh-canvas') {
          return;
        }

        const elapsed = (now - startTime) * 0.001;
        mouse.x += (mouse.targetX - mouse.x) * 0.05;
        mouse.y += (mouse.targetY - mouse.y) * 0.05;

        const isLight = document.body.classList.contains('light') ? 1.0 : 0.0;

        gl.useProgram(program);
        gl.uniform2f(uRes, canvas.width, canvas.height);
        gl.uniform2f(uMouse, mouse.x, mouse.y);
        gl.uniform1f(uTime, elapsed);
        gl.uniform1f(uLight, isLight);
        gl.uniform1f(uInt, intensityMultiplier);
        if (uAccent) gl.uniform3f(uAccent, cachedAccent[0], cachedAccent[1], cachedAccent[2]);
        if (uAccentHi) gl.uniform3f(uAccentHi, cachedAccentHi[0], cachedAccentHi[1], cachedAccentHi[2]);
        if (uAccentDim) gl.uniform3f(uAccentDim, cachedAccentDim[0], cachedAccentDim[1], cachedAccentDim[2]);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
      };
    }

    const renderers = [];
    const heroCanvas = document.getElementById('prism-hero-canvas');
    if (heroCanvas) {
      const r = attachShader(heroCanvas, 1.0);
      if (r) renderers.push(r);
    }
    const termCanvas = document.getElementById('term-mesh-canvas');
    if (termCanvas) {
      const r = attachShader(termCanvas, 0.45);
      if (r) renderers.push(r);
    }

    if (renderers.length > 0) {
      function loopAll(now) {
        for (let i = 0; i < renderers.length; i++) {
          renderers[i](now);
        }
        requestAnimationFrame(loopAll);
      }
      requestAnimationFrame(loopAll);
    }
  }

  /* ─────────────────────────────────────────────────────────────────────────────
     PHASE 4: KINETIC TYPOGRAPHY & FLUID DISTORTION
     Target Placement: Hero headline (.hero-name) / Section titles (.section-title, .intro-h1, h1)
     Impact: Fluid liquid text displacement on hover with spring recovery
  ───────────────────────────────────────────────────────────────────────────── */
  function initPhase4KineticTypography() {
    if (prefersReducedMotion) return;

    if (!document.getElementById('kinetic-fluid-filter')) {
      const svgNS = 'http://www.w3.org/2000/svg';
      const svg = document.createElementNS(svgNS, 'svg');
      svg.setAttribute('style', 'position:absolute;width:0;height:0;pointer-events:none;');
      svg.setAttribute('aria-hidden', 'true');
      svg.innerHTML = `
        <defs>
          <filter id="kinetic-fluid-filter" x="-20%" y="-20%" width="140%" height="140%" filterUnits="objectBoundingBox">
            <feTurbulence id="kinetic-turb" type="fractalNoise" baseFrequency="0.035 0.035" numOctaves="2" result="noise" />
            <feDisplacementMap id="kinetic-disp" in="SourceGraphic" in2="noise" scale="0" xChannelSelector="R" yChannelSelector="G" />
          </filter>
        </defs>
      `;
      document.body.appendChild(svg);
    }

    const dispMap = document.getElementById('kinetic-disp');
    const turbNode = document.getElementById('kinetic-turb');
    if (!dispMap || !turbNode) return;

    const titles = document.querySelectorAll('.section-title, .intro-h1');
    if (!titles.length) return;

    titles.forEach(t => t.classList.add('kinetic-text-wrap'));

    let mouseX = 0, mouseY = 0;
    let lastX = 0, lastY = 0;
    let velocity = 0;
    let currentScale = 0;
    let targetScale = 0;
    let scaleVelocity = 0;
    const tension = 0.18;
    const damping = 0.76;
    let isNear = false;
    let time = 0;

    window.addEventListener('mousemove', (e) => {
      mouseX = e.clientX;
      mouseY = e.clientY;
      const dx = mouseX - lastX;
      const dy = mouseY - lastY;
      velocity = Math.min(Math.hypot(dx, dy), 50);
      lastX = mouseX;
      lastY = mouseY;

      isNear = false;
      titles.forEach(el => {
        const rect = el.getBoundingClientRect();
        const pad = 80;
        if (
          mouseX >= rect.left - pad &&
          mouseX <= rect.right + pad &&
          mouseY >= rect.top - pad &&
          mouseY <= rect.bottom + pad
        ) {
          isNear = true;
          el.classList.add('kinetic-fluid-active');
        } else {
          el.classList.remove('kinetic-fluid-active');
        }
      });

      if (isNear) {
        targetScale = Math.min(velocity * 0.75, 32);
      }
    }, { passive: true });

    function updateKineticPhysics() {
      time += 0.02;
      const force = (targetScale - currentScale) * tension;
      scaleVelocity = (scaleVelocity + force) * damping;
      currentScale += scaleVelocity;
      targetScale *= 0.84; // spring decay once velocity drops

      if (currentScale > 0.1) {
        dispMap.setAttribute('scale', currentScale.toFixed(2));
        turbNode.setAttribute('baseFrequency', `${(0.032 + Math.sin(time) * 0.006).toFixed(3)} ${(0.036 + Math.cos(time) * 0.006).toFixed(3)}`);
      } else if (currentScale !== 0) {
        currentScale = 0;
        scaleVelocity = 0;
        dispMap.setAttribute('scale', '0');
        titles.forEach(el => el.classList.remove('kinetic-fluid-active'));
      }

      requestAnimationFrame(updateKineticPhysics);
    }
    updateKineticPhysics();
  }

  /* ─────────────────────────────────────────────────────────────────────────────
     FEATURE 1: CROSS-WINDOW KINETIC ELASTICITY (BroadcastChannel Desktop Mesh)
     Target: Pop-out Satellite HUD + Main Window Bridge
     Modularized: Delegated to js/features/cross-window-physics.js
  ───────────────────────────────────────────────────────────────────────────── */
  function initCrossWindowPhysics() {
    if (window.CrossWindowPhysics && typeof window.CrossWindowPhysics.init === 'function') {
      window.CrossWindowPhysics.init();
    }
  }


  /* ─────────────────────────────────────────────────────────────────────────────
     FEATURE 3: VECTOR-CORROSION & CSS MELTING SHADERS
     Target: Toolkit buttons, project pills, and category filters
  ───────────────────────────────────────────────────────────────────────────── */
  function initLiquidMercuryMelting() {
    const turbNode = document.getElementById('mercury-turb');
    if (!turbNode) return;

    // Attach to interactive pills, buttons in Toolkit, Projects, and Hero actions
    const targets = document.querySelectorAll('.toolkit-btn, .filter-btn, .ptag, .status-pill, .hero-actions .btn, .hero-name .line-2');
    targets.forEach(t => t.classList.add('liquid-melt-target'));

    let isMelting = false;
    let meltTime = 0;

    targets.forEach(elem => {
      elem.addEventListener('mouseenter', () => { isMelting = true; });
      elem.addEventListener('mouseleave', () => { isMelting = false; });
    });

    function updateLiquidMelting() {
      if (isMelting) {
        meltTime += 0.04;
        const freqX = (0.04 + Math.sin(meltTime) * 0.015).toFixed(3);
        const freqY = (0.04 + Math.cos(meltTime * 0.8) * 0.015).toFixed(3);
        turbNode.setAttribute('baseFrequency', `${freqX} ${freqY}`);
      }
      requestAnimationFrame(updateLiquidMelting);
    }
    updateLiquidMelting();
  }

  /* ─────────────────────────────────────────────────────────────────────────────
     FEATURE 4: DIGITAL DECOUPLING & GRAVITATIONAL INERTIA
     Target: Toolkit & Achievements cards deflect dynamically on scroll velocity
  ───────────────────────────────────────────────────────────────────────────── */
  function initGravitationalInertia() {
    if (prefersReducedMotion) return;

    const cards = document.querySelectorAll('.toolkit-card, .achieve-stat-block, .timeline-item');
    if (!cards.length) return;

    cards.forEach(c => c.classList.add('inertia-physics-card'));

    let lastY = window.scrollY;
    let scrollVelocity = 0;
    let currentTilt = 0;
    let targetTilt = 0;

    window.addEventListener('scroll', () => {
      const curY = window.scrollY;
      const dy = curY - lastY;
      scrollVelocity = Math.max(Math.min(dy * 0.18, 12), -12);
      lastY = curY;
      targetTilt = scrollVelocity;
    }, { passive: true });

    function renderInertia() {
      // Spring decay
      targetTilt *= 0.88;
      currentTilt += (targetTilt - currentTilt) * 0.18;

      if (Math.abs(currentTilt) > 0.05) {
        const rad = (currentTilt * 0.4).toFixed(2);
        cards.forEach((card, idx) => {
          const stagger = (idx % 2 === 0 ? 1 : -1) * 0.5;
          card.style.transform = `translate3d(0, ${(currentTilt * 0.6).toFixed(1)}px, 0) rotate(${((currentTilt + stagger) * 0.08).toFixed(2)}deg)`;
        });
      } else if (currentTilt !== 0) {
        currentTilt = 0;
        cards.forEach(card => card.style.transform = '');
      }

      requestAnimationFrame(renderInertia);
    }
    renderInertia();
  }

  /* ─────────────────────────────────────────────────────────────────────────────
     FEATURE 5: HERO LIGHT-MODE INTERACTIVE SYSTEMS
     1. Computational Topography Vector Isolines Canvas (#hero-light-contour)
     2. Interactive Engineering Systems Showcase Deck (#hero-systems-deck)
  ───────────────────────────────────────────────────────────────────────────── */
  function initHeroLightInteractive() {
    // 1. TOPOGRAPHICAL CONTOUR ISOLINES CANVAS
    const canvas = document.getElementById('hero-light-contour');
    const heroSection = document.getElementById('hero');
    if (canvas && heroSection) {
      const ctx = canvas.getContext('2d');
      let mouseX = -1000, mouseY = -1000;
      let targetMouseX = -1000, targetMouseY = -1000;
      let time = 0;
      let ripples = [];

      function resizeCanvas() {
        const rect = heroSection.getBoundingClientRect();
        canvas.width = rect.width;
        canvas.height = rect.height;
      }
      window.addEventListener('resize', resizeCanvas);
      resizeCanvas();

      heroSection.addEventListener('mousemove', (e) => {
        const rect = heroSection.getBoundingClientRect();
        targetMouseX = e.clientX - rect.left;
        targetMouseY = e.clientY - rect.top;
      }, { passive: true });

      heroSection.addEventListener('mouseleave', () => {
        targetMouseX = -1000;
        targetMouseY = -1000;
      });

      heroSection.addEventListener('click', (e) => {
        const rect = heroSection.getBoundingClientRect();
        ripples.push({
          x: e.clientX - rect.left,
          y: e.clientY - rect.top,
          radius: 0,
          maxRadius: 280,
          strength: 28
        });
      });

      function renderContours() {
        if (!document.body.classList.contains('light')) {
          requestAnimationFrame(renderContours);
          return;
        }

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        time += 0.014;

        // Smooth cursor lerp
        mouseX += (targetMouseX - mouseX) * 0.12;
        mouseY += (targetMouseY - mouseY) * 0.12;

        const numLines = 16;
        const spacing = canvas.height / (numLines + 1);
        const stepX = 14;

        // Update ripples
        for (let r = ripples.length - 1; r >= 0; r--) {
          const rip = ripples[r];
          rip.radius += 5.5;
          rip.strength *= 0.94;
          if (rip.radius > rip.maxRadius || rip.strength < 0.2) {
            ripples.splice(r, 1);
          }
        }

        for (let i = 1; i <= numLines; i++) {
          const baseY = i * spacing;
          const isMajor = (i % 4 === 0);

          ctx.beginPath();
          ctx.lineWidth = isMajor ? 1.4 : 0.85;
          const accRgb = getComputedStyle(document.documentElement).getPropertyValue('--accent-rgb').trim() || '16, 185, 129';
          const accDimRgb = getComputedStyle(document.documentElement).getPropertyValue('--accent-dim-rgb').trim() || '4, 120, 87';
          ctx.strokeStyle = isMajor ? `rgba(${accDimRgb}, 0.28)` : `rgba(${accRgb}, 0.14)`;

          for (let x = 0; x <= canvas.width + stepX; x += stepX) {
            // Harmonic terrain wave
            const wave = Math.sin(x * 0.0035 + time * 0.8 + i * 0.3) * 10
                       + Math.cos(x * 0.007 - time * 0.5) * 6;

            // Cursor topographical deformation
            let cursorDisp = 0;
            if (mouseX > 0) {
              const dx = x - mouseX;
              const dy = baseY - mouseY;
              const dist = Math.hypot(dx, dy);
              if (dist < 220) {
                const norm = Math.max(0, 1 - dist / 220);
                cursorDisp = Math.sin(norm * Math.PI) * 42 * (dy > 0 ? 1 : -0.7);
              }
            }

            // Ripple influence
            let rippleDisp = 0;
            for (let rip of ripples) {
              const rDist = Math.hypot(x - rip.x, baseY - rip.y);
              const delta = Math.abs(rDist - rip.radius);
              if (delta < 40) {
                rippleDisp += Math.sin((1 - delta / 40) * Math.PI) * rip.strength;
              }
            }

            const y = baseY + wave + cursorDisp + rippleDisp;
            if (x === 0) {
              ctx.moveTo(x, y);
            } else {
              ctx.lineTo(x, y);
            }
          }
          ctx.stroke();
        }

        requestAnimationFrame(renderContours);
      }
      renderContours();
    }

    // 2. INTERACTIVE ENGINEERING SYSTEMS SHOWCASE DECK
    const deck = document.getElementById('hero-systems-deck');
    if (deck) {
      const tabs = deck.querySelectorAll('.deck-tab');
      const panels = deck.querySelectorAll('.deck-panel');

      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const targetId = tab.dataset.tab;
          tabs.forEach(t => {
            t.classList.remove('active');
            t.setAttribute('aria-selected', 'false');
          });
          tab.classList.add('active');
          tab.setAttribute('aria-selected', 'true');

          panels.forEach(p => {
            if (p.id === `deck-panel-${targetId}`) {
              p.classList.add('active');
              p.style.display = 'flex';
            } else {
              p.classList.remove('active');
              p.style.display = 'none';
            }
          });

          // Subtle tactile pop on tab switch
          deck.style.transform = 'scale(0.99)';
          setTimeout(() => { deck.style.transform = ''; }, 120);
        });
      });

      // Interactive Monte Carlo Simulation Iterations Scrubber
      const slider = document.getElementById('mc-iter-slider');
      const valEl = document.getElementById('mc-slider-val');
      const timeEl = document.getElementById('mc-calc-time');
      const memEl = document.getElementById('mc-calc-mem');
      const accEl = document.getElementById('mc-calc-acc');

      if (slider && valEl) {
        slider.addEventListener('input', (e) => {
          const runs = parseInt(e.target.value, 10);
          valEl.textContent = `${runs.toLocaleString()} runs`;

          // Realistic vectorized scaling curves
          const latencyMs = (runs * 0.00142).toFixed(1);
          const memoryMb = (runs * 0.00048).toFixed(1);
          // Convergence asymptotically approaching 99.9%
          const convergence = (99.0 + (1 - 1000 / runs) * 0.95).toFixed(2);

          if (timeEl) timeEl.textContent = `${latencyMs}ms`;
          if (memEl) memEl.textContent = `${memoryMb} MB`;
          if (accEl) accEl.textContent = `${convergence}%`;
        });
      }
    }

    // 3. INTERACTIVE LIQUID MERCURY FLUID DYNAMICS (Light Mode - Full Page Tracking)
    // Modularized: Delegated to js/features/mercury-canvas.js
    function initHeroLiquidMercury() {
      if (window.MercuryCanvas && typeof window.MercuryCanvas.init === 'function') {
        window.MercuryCanvas.init();
      }
    }

    initHeroLiquidMercury();
  }

  /* ─────────────────────────────────────────────────────────────────────────────
     FEATURE 6: 3D GYROSCOPIC GIMBAL & AVIONICS TELEMETRY RETICLE
     Target Placement: Phoenix X Autonomous SAR Micro-UAV Hardware Card (.drone-avionics-telemetry)
     Features: 3D perspective gimbal tilt, magnetic needle heading, live pitch/yaw telemetry,
               multi-mode sensor channel cycling (SAR, ThermalNet, LiDAR, Kalman, LoRa).
  ───────────────────────────────────────────────────────────────────────────── */
  function initGyroscopicReticle() {
    const reticles = document.querySelectorAll('.drone-reticle-widget');
    if (!reticles.length) return;

    const TELEMETRY_MODES = [
      { name: 'AUTONOMOUS SAR GIMBAL', label: 'AUTONOMOUS SAR' },
      { name: 'THERMALNET TARGET LOCK', label: 'TARGET LOCKED (98.4%)' },
      { name: 'LIDAR KINEMATICS SCAN', label: '3D SLAM MAPPING' },
      { name: 'RB5 KALMAN ATTITUDE FILTER', label: '6-DoF FUSION' },
      { name: 'RF LORA MESH TRACKING', label: '915 MHz P2P MESH' }
    ];

    reticles.forEach((reticle) => {
      const container = reticle.closest('.drone-avionics-telemetry') || reticle.parentElement;
      const gimbal = reticle.querySelector('.reticle-gimbal');
      const needle = reticle.querySelector('.reticle-compass-needle');
      const modeText = reticle.querySelector('#reticle-mode') || reticle.querySelector('.reticle-readout-line span:last-child');
      const coordsText = reticle.querySelector('#reticle-coords') || reticle.querySelector('.reticle-coords');
      const modeVal = container ? container.querySelector('#tel-mode-val') : null;
      const pitchYawVal = container ? container.querySelector('#tel-pitch-yaw') : null;

      let currentModeIndex = 0;
      let isInteracting = false;
      let targetPitch = 0;
      let targetYaw = 0;
      let currentPitch = 0;
      let currentYaw = 0;
      let targetNeedleAngle = 0;
      let currentNeedleAngle = 0;
      let animFrameId = null;

      function updateGimbalPhysics() {
        currentPitch += (targetPitch - currentPitch) * 0.15;
        currentYaw += (targetYaw - currentYaw) * 0.15;
        currentNeedleAngle += (targetNeedleAngle - currentNeedleAngle) * 0.16;

        if (gimbal) {
          gimbal.style.transform = `perspective(360px) rotateX(${currentPitch.toFixed(2)}deg) rotateY(${currentYaw.toFixed(2)}deg)`;
        }

        if (needle) {
          needle.style.transform = `rotate(${currentNeedleAngle.toFixed(1)}deg)`;
        }

        const pitchStr = (currentPitch >= 0 ? '+' : '') + currentPitch.toFixed(1) + '°';
        const yawStr = (currentYaw >= 0 ? '+' : '') + currentYaw.toFixed(1) + '°';

        if (coordsText) {
          coordsText.textContent = `PITCH: ${pitchStr} · YAW: ${yawStr}`;
        }
        if (pitchYawVal) {
          pitchYawVal.textContent = `${pitchStr} / ${yawStr}`;
        }

        if (isInteracting || Math.abs(currentPitch) > 0.05 || Math.abs(currentYaw) > 0.05) {
          animFrameId = requestAnimationFrame(updateGimbalPhysics);
        } else {
          currentPitch = 0;
          currentYaw = 0;
          if (gimbal) gimbal.style.transform = 'perspective(360px) rotateX(0deg) rotateY(0deg)';
          if (coordsText) coordsText.textContent = 'PITCH: 0.0° · YAW: 0.0°';
          if (pitchYawVal) pitchYawVal.textContent = '0.0° / 0.0°';
          animFrameId = null;
        }
      }

      function handleMove(e) {
        const rect = reticle.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const dx = e.clientX - centerX;
        const dy = e.clientY - centerY;
        const radius = rect.width / 2;

        const normX = Math.max(-1, Math.min(1, dx / radius));
        const normY = Math.max(-1, Math.min(1, dy / radius));

        targetPitch = -normY * 26;
        targetYaw = normX * 32;

        const rad = Math.atan2(dy, dx);
        targetNeedleAngle = rad * (180 / Math.PI) + 90;

        isInteracting = true;
        if (!animFrameId) {
          animFrameId = requestAnimationFrame(updateGimbalPhysics);
        }
      }

      reticle.addEventListener('mousemove', handleMove, { passive: true });
      if (container && container !== reticle) {
        container.addEventListener('mousemove', (e) => {
          const rRect = reticle.getBoundingClientRect();
          const distToReticle = Math.hypot(e.clientX - (rRect.left + rRect.width / 2), e.clientY - (rRect.top + rRect.height / 2));
          if (distToReticle < 300) {
            handleMove(e);
          }
        }, { passive: true });
      }

      reticle.addEventListener('mouseleave', () => {
        targetPitch = 0;
        targetYaw = 0;
        targetNeedleAngle = 0;
        isInteracting = false;
        if (!animFrameId) {
          animFrameId = requestAnimationFrame(updateGimbalPhysics);
        }
      });

      if (container && container !== reticle) {
        container.addEventListener('mouseleave', () => {
          targetPitch = 0;
          targetYaw = 0;
          targetNeedleAngle = 0;
          isInteracting = false;
          if (!animFrameId) {
            animFrameId = requestAnimationFrame(updateGimbalPhysics);
          }
        });
      }

      // Click to cycle telemetry channels
      reticle.addEventListener('click', (e) => {
        e.stopPropagation();
        currentModeIndex = (currentModeIndex + 1) % TELEMETRY_MODES.length;
        const mode = TELEMETRY_MODES[currentModeIndex];

        if (modeText) modeText.textContent = mode.name;
        if (modeVal) modeVal.textContent = mode.label;

        reticle.style.transform = 'scale(0.94)';
        setTimeout(() => {
          reticle.style.transform = '';
        }, 110);
      });
    });
  }

  /* ─────────────────────────────────────────────────────────────────────────────
     FUTURISTIC 3D GYROSCOPE PRELOADER (Uiverse.io by Nawsome)
  ───────────────────────────────────────────────────────────────────────────── */
  function initSitePreloader() {
    const preloader = document.getElementById('site-preloader');
    if (!preloader) return;

    const bar = document.getElementById('preloader-bar');
    const pct = document.getElementById('preloader-pct');
    const statusText = document.getElementById('preloader-status-text');
    const gyro = document.getElementById('preloader-gyro');

    // Interactive 3D tilt tracking for the gyro on pointer move
    if (gyro) {
      gyro.addEventListener('mousemove', (e) => {
        const rect = gyro.getBoundingClientRect();
        const nx = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        const ny = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);
        gyro.style.transform = `perspective(1000px) rotateX(${-ny * 25}deg) rotateY(${nx * 25}deg) scale(1.05)`;
      });
      gyro.addEventListener('mouseleave', () => {
        gyro.style.transform = '';
      });
    }

    let progress = 0;
    let isDismissed = false;

    function dismissPreloader() {
      if (isDismissed) return;
      isDismissed = true;
      if (bar) bar.style.width = '100%';
      if (pct) pct.textContent = '100%';
      if (statusText) statusText.textContent = 'SUBSYSTEMS ONLINE // READY';

      setTimeout(() => {
        preloader.classList.add('preloader-exit');
        setTimeout(() => {
          preloader.style.display = 'none';
        }, 500);
      }, 150);
    }

    // Dismiss on click or Escape
    preloader.addEventListener('click', dismissPreloader);
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && preloader.style.display !== 'none') {
        dismissPreloader();
      }
    });

    function runSimulation() {
      progress = 0;
      if (bar) bar.style.width = '0%';
      if (pct) pct.textContent = '0%';
      const statusSteps = [
        { at: 15, text: 'QUANTUM BUS ENERGIZED' },
        { at: 42, text: 'FETCHING AVIONICS TELEMETRY' },
        { at: 75, text: 'CALIBRATING GYRO SENSORS' },
        { at: 95, text: 'STABILIZING VECTOR MATRIX' }
      ];

      const interval = setInterval(() => {
        if (isDismissed) {
          clearInterval(interval);
          return;
        }

        const increment = Math.random() * 14 + 8;
        progress = Math.min(progress + increment, 98);

        if (bar) bar.style.width = `${progress.toFixed(0)}%`;
        if (pct) pct.textContent = `${progress.toFixed(0)}%`;

        for (const step of statusSteps) {
          if (progress >= step.at && statusText) {
            statusText.textContent = step.text;
          }
        }

        if (progress >= 98) {
          clearInterval(interval);
          dismissPreloader();
        }
      }, 55);
    }

    // Check if user already visited this session (avoid repetitive blocking)
    const hasLoaded = sessionStorage.getItem('preloader_seen');
    if (hasLoaded) {
      dismissPreloader();
      window.triggerCyberneticPreloader = function() {
        preloader.style.display = 'flex';
        preloader.classList.remove('preloader-exit');
        isDismissed = false;
        runSimulation();
      };
      return;
    }

    sessionStorage.setItem('preloader_seen', 'true');
    runSimulation();

    window.addEventListener('load', () => {
      setTimeout(dismissPreloader, 400);
    });

    window.triggerCyberneticPreloader = function() {
      preloader.style.display = 'flex';
      preloader.classList.remove('preloader-exit');
      isDismissed = false;
      runSimulation();
    };
  }

  /* ─────────────────────────────────────────────────────────────────────────────
     ORCHESTRATION OF ALL SYSTEMS
  ───────────────────────────────────────────────────────────────────────────── */
  function initAllPhases() {
    initSitePreloader();
    initPhase1MagneticCursor();
    initPhase2Bento3DParallax();
    initPhase3IridescentNatureMesh();
    initPhase4KineticTypography();

    // Advanced Systems
    initCrossWindowPhysics();
    initLiquidMercuryMelting();
    initGravitationalInertia();
    initHeroLightInteractive();
    initGyroscopicReticle();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAllPhases);
  } else {
    initAllPhases();
  }
})();
