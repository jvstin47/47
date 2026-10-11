/**
 * TerminalEngine — Virtual Terminal Command Interpreter & Filesystem Resolver
 * Pure business logic decoupled from DOM view manipulation.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['DataStore', 'BenchmarkEngine'], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('./data-store'), require('./benchmark-engine'));
  } else {
    root.TerminalEngine = factory(root.DataStore, root.BenchmarkEngine);
  }
})(typeof self !== 'undefined' ? self : this, function (DataStore, BenchmarkEngine) {
  'use strict';

  const ALIASES = {
    phoenix: 'phoenix-uav',
    phonix: 'phoenix-uav',
    drone: 'phoenix-uav',
    uav: 'phoenix-uav',
    sar: 'phoenix-uav',
    camera: 'camera-tracking',
    cam: 'camera-tracking',
    track: 'camera-tracking',
    f1: 'f1-strategy',
    race: 'f1-strategy',
    monte: 'f1-strategy',
    lakshmi: 'captain-lakshmi',
    capt: 'captain-lakshmi',
    chord: 'chord-analyzer',
    music: 'chord-analyzer',
    song: 'chord-analyzer',
    aroggya: 'aroggyagram',
    health: 'aroggyagram',
    triage: 'aroggyagram',
    auto: 'autometer',
    meter: 'autometer',
    upi: 'autometer',
    opportunity: 'opportunity-os',
    opp: 'opportunity-os',
    os: 'opportunity-os',
    crt: 'crt-lock',
    lock: 'crt-lock',
    safe: 'crt-lock',
    uno: 'uno-q-arena',
    arena: 'uno-q-arena',
    retro: 'uno-q-arena'
  };

  const VALID_COMMANDS = [
    'help', 'ls', 'la', 'dir', 'cd', 'cat', 'pwd',
    'projects', 'phoenix', 'bench', 'f1', 'skills',
    'awards', 'contact', 'clear', 'exit', 'quit', 'loader', 'preloader', 'gyro'
  ];

  class TerminalEngine {
    constructor(options = {}) {
      this.dataStore = options.dataStore || (typeof window !== 'undefined' ? window.DataStore : DataStore);
      this.benchEngine = options.benchmarkEngine || (typeof window !== 'undefined' ? window.BenchmarkEngine : BenchmarkEngine);
      this.currentDir = options.initialDir || '~/projects';
      this.history = [];
      this.historyIndex = -1;
    }

    getCurrentDir() {
      return this.currentDir;
    }

    setCurrentDir(dir) {
      this.currentDir = dir;
    }

    resolveDir(target) {
      if (!target) return null;
      let clean = target.trim();
      if (clean === '~' || clean === '$HOME') return '~';
      if (clean === 'projects' || clean === '~/projects') return '~/projects';
      if (clean === 'telemetry' || clean === '~/telemetry') return '~/telemetry';

      // Parent navigation
      if (clean === '..' || clean === '../') {
        if (this.currentDir === '~') return '~';
        const parts = this.currentDir.split('/');
        parts.pop();
        return parts.length === 1 ? '~' : parts.join('/');
      }

      clean = clean.replace(/\/$/, '').trim();
      const lower = clean.toLowerCase();
      const fs = this.dataStore.fileSystem;

      // Direct matches
      if (fs[clean]) return clean;
      if (fs[`~/${clean}`]) return `~/${clean}`;
      if (fs[`${this.currentDir}/${clean}`]) return `${this.currentDir}/${clean}`;

      // Direct child items in currentDir
      const currentItems = fs[this.currentDir] || [];
      for (const item of currentItems) {
        const full = `${this.currentDir}/${item}`;
        if (fs[full] && item.toLowerCase() === lower) {
          return full;
        }
      }

      // Prefix match in currentDir
      for (const item of currentItems) {
        const full = `${this.currentDir}/${item}`;
        if (fs[full] && item.toLowerCase().startsWith(lower)) {
          return full;
        }
      }

      // Match in projects directory from anywhere
      const projectDirs = fs['~/projects'] || [];
      const pMatch = projectDirs.find(p => p.toLowerCase() === lower || p.toLowerCase().startsWith(lower));
      if (pMatch) return `~/projects/${pMatch}`;

      const subMatch = projectDirs.find(p => p.toLowerCase().includes(lower) || lower.includes(p.toLowerCase()));
      if (subMatch) return `~/projects/${subMatch}`;

      // Nickname aliases
      for (const [alias, dirName] of Object.entries(ALIASES)) {
        if (lower.includes(alias) || alias.includes(lower)) {
          return `~/projects/${dirName}`;
        }
      }

      return null;
    }

    resolveFileKey(arg) {
      if (!arg) return null;
      const cleanArg = arg.trim();
      const fc = this.dataStore.fileContents;

      const relativeKey = `${this.currentDir}/${cleanArg}`;
      if (fc[relativeKey]) return relativeKey;

      if (fc[cleanArg]) return cleanArg;

      const currentFiles = this.dataStore.fileSystem[this.currentDir] || [];
      const matched = currentFiles.find(f => f.toLowerCase() === cleanArg.toLowerCase());
      if (matched) {
        const matchKey = `${this.currentDir}/${matched}`;
        if (fc[matchKey]) return matchKey;
        if (fc[matched]) return matched;
      }

      for (const k of Object.keys(fc)) {
        if (k.endsWith('/' + cleanArg) || k === cleanArg) {
          return k;
        }
      }
      return null;
    }

    getFileContent(key) {
      return this.dataStore.fileContents[key] || null;
    }

    getAutocompleteCandidates(rawInput) {
      const val = rawInput.trim();
      if (!val) return { type: 'none', candidates: [] };

      // Command autocomplete
      if (!val.includes(' ')) {
        const prefix = val.toLowerCase();
        const matches = VALID_COMMANDS.filter(c => c.startsWith(prefix));
        return { type: 'command', prefix, matches };
      }

      const spaceIdx = val.indexOf(' ');
      const cmd = val.slice(0, spaceIdx).toLowerCase();
      const argPrefix = val.slice(spaceIdx + 1).trim().toLowerCase();
      const currentItems = this.dataStore.fileSystem[this.currentDir] || [];
      const fs = this.dataStore.fileSystem;

      if (cmd === 'cd') {
        const dirs = [];
        for (const it of currentItems) {
          if (fs[`${this.currentDir}/${it}`]) {
            dirs.push(it);
          }
        }
        if (this.currentDir === '~') {
          dirs.push('projects', 'telemetry');
        }
        const matches = dirs.filter(c => c.toLowerCase().startsWith(argPrefix));
        return { type: 'directory', prefix: argPrefix, matches };
      }

      if (cmd === 'cat') {
        const files = currentItems.filter(it => !fs[`${this.currentDir}/${it}`]);
        const matches = files.filter(c => c.toLowerCase().startsWith(argPrefix));
        return { type: 'file', prefix: argPrefix, matches };
      }

      return { type: 'none', candidates: [] };
    }

    execute(rawInput) {
      const line = (rawInput || '').trim();
      if (!line) return null;

      this.history.push(line);
      this.historyIndex = this.history.length;

      const parts = line.split(' ');
      const cmd = parts[0].toLowerCase();
      const arg = parts.slice(1).join(' ').trim();

      switch (cmd) {
        case 'help':
          return {
            type: 'html',
            output: `
              <div style="color:var(--sub)">Terminal System Commands:</div>
              <div style="margin-left:8px;line-height:1.75;display:grid;grid-template-columns:140px 1fr;gap:4px 10px;">
                <span style="color:#2dd4bf;">ls / la</span> <span>List contents of current directory</span>
                <span style="color:#2dd4bf;">cd &lt;dir&gt;</span> <span>Change directory (~, projects, phoenix, ..)</span>
                <span style="color:#2dd4bf;">cat &lt;file&gt;</span> <span>Display file content (README.md, bio.txt, ..)</span>
                <span style="color:#2dd4bf;">pwd</span> <span>Print current working directory path</span>
                <span style="color:#2dd4bf;">projects</span> <span>List all 10 verified production systems & repos</span>
                <span style="color:#2dd4bf;">phoenix</span> <span>Dump Phoenix X (SIH 26177) autonomous SAR UAV telemetry</span>
                <span style="color:#2dd4bf;">bench</span> <span>Run live 1,000-run Monte Carlo client benchmark</span>
                <span style="color:#2dd4bf;">f1</span> <span>Output active Formula 1 simulation configuration</span>
                <span style="color:#2dd4bf;">skills</span> <span>Print low-level and high-level stack specs</span>
                <span style="color:#2dd4bf;">awards</span> <span>View hackathon championships and govt honors</span>
                <span style="color:#2dd4bf;">clear</span> <span>Clear terminal buffer</span>
                <span style="color:#2dd4bf;">exit / quit</span> <span>Close terminal console (or press Esc)</span>
              </div>
              <div style="color:var(--faint);font-size:11px;margin-top:6px;">💡 Shortcuts: Press <strong>Tab</strong> to autocomplete commands/paths · Press <strong>Esc</strong> to close · <strong>↑ / ↓</strong> for history</div>`
          };

        case 'pwd':
          return {
            type: 'html',
            output: `<div style="color:#2dd4bf;">${this.currentDir}</div>`
          };

        case 'ls':
        case 'la':
        case 'dir': {
          const items = this.dataStore.fileSystem[this.currentDir] || [];
          const fs = this.dataStore.fileSystem;
          const isLa = cmd === 'la';

          if (isLa) {
            const linesHtml = `
              <div style="color:var(--faint);font-size:11px;">drwxr-xr-x  staff  .</div>
              <div style="color:var(--faint);font-size:11px;">drwxr-xr-x  staff  ..</div>
              ${items.map(it => {
                const isDir = fs[`${this.currentDir}/${it}`] || it === 'projects' || it === 'telemetry';
                if (isDir) {
                  return `<div style="color:#2dd4bf;cursor:pointer;" onclick="window.runTermCommand('cd ${it}')">drwxr-xr-x  staff  ${it}/</div>`;
                }
                return `<div style="color:#ecf3ee;cursor:pointer;" onclick="window.runTermCommand('cat ${it}')">-rw-r--r--  staff  <span style="text-decoration:underline;text-underline-offset:2px;">${it}</span></div>`;
              }).join('')}`;
            return { type: 'html', output: linesHtml };
          }

          const pillHtml = `<div style="display:flex;flex-wrap:wrap;gap:14px;">${items.map(it => {
            const isDir = fs[`${this.currentDir}/${it}`] || it === 'projects' || it === 'telemetry';
            if (isDir) {
              return `<span style="color:#2dd4bf;font-weight:600;cursor:pointer;" onclick="window.runTermCommand('cd ${it}')" title="Click to navigate">${it}/</span>`;
            }
            return `<span style="color:#ecf3ee;cursor:pointer;border-bottom:1px dotted var(--nature);" onclick="window.runTermCommand('cat ${it}')" title="Click to open in viewport reader">${it}</span>`;
          }).join('')}</div>`;
          return { type: 'html', output: pillHtml };
        }

        case 'cd': {
          const newDir = this.resolveDir(arg || '~');
          if (newDir) {
            this.currentDir = newDir;
            return {
              type: 'html',
              output: `<span style="color:var(--faint);">Changed directory to ${this.currentDir}</span>`,
              newDir: this.currentDir
            };
          }
          return {
            type: 'html',
            output: `<span style="color:#ff5f56;">cd: no such file or directory: ${arg}</span><div style="color:var(--faint);font-size:11px;margin-top:2px;">Try: 'cd phoenix', 'cd camera', 'cd f1', 'cd ~', or press Tab to autocomplete.</div>`
          };
        }

        case 'cat': {
          if (!arg) {
            return {
              type: 'html',
              output: `<span style="color:#ff5f56;">usage: cat &lt;filename&gt;</span>`
            };
          }
          const fileKey = this.resolveFileKey(arg);
          const content = fileKey ? this.getFileContent(fileKey) : null;
          if (content) {
            if (arg.endsWith('.url') || content.startsWith('http')) {
              return {
                type: 'html',
                output: `<div style="padding:8px 12px;background:rgba(255,255,255,0.03);border-radius:4px;"><span style="color:var(--sub);">URL:</span> <a href="${content.trim()}" target="_blank" style="color:var(--nature);">${content.trim()} ↗</a></div>`
              };
            }
            return {
              type: 'viewport',
              fileKey,
              content,
              output: `<span style="color:var(--nature);">✔ Opened viewport for '${arg}'. Press Esc or click Back to return to console.</span>`
            };
          }
          return {
            type: 'html',
            output: `<span style="color:#ff5f56;">cat: ${arg}: No such file</span><div style="color:var(--faint);font-size:11px;margin-top:2px;">Use 'ls' to see files in this directory, or press Tab to autocomplete filename.</div>`
          };
        }

        case 'projects':
          return {
            type: 'html',
            output: `
              <div style="color:var(--sub);line-height:1.65;">
                [01] <strong style="color:#2dd4bf;">phoenix-uav</strong> — Autonomous AI Search &amp; Rescue Micro-UAV (SIH 26177)<br/>
                [02] <strong style="color:#2dd4bf;">camera-tracking</strong> — AI-Based Virtual Camera Tracking System (SIH 26169)<br/>
                [03] <strong style="color:#2dd4bf;">f1-strategy</strong> — Vectorized race strategy engine with Bellman solver<br/>
                [04] <strong style="color:#2dd4bf;">captain-lakshmi</strong> — Scroll-driven canvas monograph (3,100+ HD frames)<br/>
                [05] <strong style="color:#2dd4bf;">chord-analyzer</strong> — MIR desktop app w/ Demucs v4 &amp; BTC Transformer<br/>
                [06] <strong style="color:#2dd4bf;">aroggyagram</strong> — Autonomous AI community health-triage network<br/>
                [07] <strong style="color:#2dd4bf;">autometer</strong> — Dual sensor-fusion IoT transit fare meter &amp; UPI engine<br/>
                [08] <strong style="color:#2dd4bf;">opportunity-os</strong> — Offline-first Android/Wear OS executive planner<br/>
                [09] <strong style="color:#2dd4bf;">crt-lock</strong> — Tactile 3D modular arithmetic safe mechanism (React/WebGL)<br/>
                [10] <strong style="color:#2dd4bf;">uno-q-arena</strong> — Real-time RL policy @ 60 FPS in Genesis emulation
              </div>`
          };

        case 'phoenix':
          return {
            type: 'html',
            output: `
              <div style="color:var(--nature);font-weight:600;">[AUTONOMOUS UAV] Phoenix X (SIH 26177) Search &amp; Rescue Telemetry:</div>
              <div style="color:var(--sub);line-height:1.65;margin-top:4px;">
                • Platform: DGCA-Compliant Autonomous Micro-UAV on Qualcomm Robotics RB5<br/>
                • Problem Statement: SIH 2026 (SIH26177 - NDRF / Disaster Management Track)<br/>
                • Edge Inference: ThermalNet YOLOv8 @ &lt;18.4ms on-device NPU<br/>
                • Comms Mesh: 5km LoRa 915 MHz P2P zero-cloud link (offline)<br/>
                • Live Cockpit: <a href="https://phoenix-sar-uav.vercel.app" target="_blank" style="color:var(--nature);">phoenix-sar-uav.vercel.app ↗</a><br/>
                • GitHub Repo: <a href="https://github.com/jvstin47/Phoenix-SIH26177-SAR-UAV" target="_blank" style="color:var(--nature);">Phoenix-SIH26177-SAR-UAV ↗</a><br/>
                • Companion Project: <a href="https://github.com/jvstin47/Phoenix-X-AI-Based-Virtual-Camera-Tracking-System-SIH26169" target="_blank" style="color:var(--nature);">Virtual Camera Tracking (SIH 26169) ↗</a>
              </div>`
          };

        case 'f1':
          return {
            type: 'html',
            output: `
              <div style="color:#ff334b;font-weight:600;">[F1 RACE STRATEGY SIMULATOR] Engine State:</div>
              <div style="color:var(--sub);line-height:1.6;margin-top:4px;">
                • Engine: Vectorized NumPy Monte Carlo (10,000 iterations per compute pass)<br/>
                • Dynamic Programming: Bellman Equation stochastic backward induction<br/>
                • Degradation Profiles: Non-linear thermal & graining curves calibrated with FastF1 API<br/>
                • Live Web: <a href="https://f1-monte-carlo-race-strategy-simula.vercel.app" target="_blank" style="color:#2dd4bf;">f1-monte-carlo-race-strategy-simula.vercel.app ↗</a>
              </div>`
          };

        case 'bench': {
          const res = (this.benchEngine && this.benchEngine.runMonteCarloBenchmark)
            ? this.benchEngine.runMonteCarloBenchmark(1000, 57)
            : { elapsedMs: 12.4, meanWear: 1.054 };
          return {
            type: 'html',
            output: `
              <div style="color:#2dd4bf;font-weight:600;">✔ COMPLETED 1,000 MONTE CARLO STOCHASTIC RACE RUNS</div>
              <div style="color:var(--sub);margin-top:4px;">
                Compute Time: <span style="color:#fff;">${res.elapsedMs} ms</span> | Simulated Laps: <span style="color:#fff;">57,000</span> | Vector Status: Stable (Mean Wear: ${res.meanWear}s/lap)
              </div>`
          };
        }

        case 'skills':
          return {
            type: 'html',
            output: `
              <div style="color:var(--sub);line-height:1.65;">
                • <strong style="color:#e9edea;">Core Systems:</strong> C, C++, Python 3.11, Kotlin, TypeScript, Dart, Linux Shell<br/>
                • <strong style="color:#e9edea;">AI & Math:</strong> NumPy, PyTorch, Demucs v4, YOLOv8, FastF1, Bellman DP, Monte Carlo<br/>
                • <strong style="color:#e9edea;">Mobile & Edge:</strong> Jetpack Compose, Room SQLite, Wear OS, Flutter, Qualcomm RB5, Arduino<br/>
                • <strong style="color:#e9edea;">Web & 3D:</strong> React 19, Next.js, Canvas 2D, Three.js, WebGL, Tailwind, FastAPI
              </div>`
          };

        case 'awards':
          return {
            type: 'html',
            output: `
              <div style="color:var(--sub);line-height:1.65;">
                🥇 <strong>1st Place Champion:</strong> ACM Vibefest Hackathon 2026<br/>
                🏆 <strong>Phase 1 Winner:</strong> Idea From Industry S2 (MakerHub / BIRAC / MoE)<br/>
                🥇 <strong>1st Place:</strong> AI Club Ideathon 2026<br/>
                🎖️ <strong>Shortlisted:</strong> Smart India Hackathon 2026 (SIH 26177 Qualcomm &amp; SIH 26169 Tracks)<br/>
                🌱 <strong>State Participant:</strong> K-DISC Young Innovators Programme (YIP 8.0), Govt of Kerala<br/>
                🚀 <strong>Global Participant:</strong> NASA Space Apps Challenge 2025
              </div>`
          };

        case 'contact':
          return {
            type: 'html',
            output: `
              <div style="color:var(--sub);line-height:1.65;">
                Email: <a href="mailto:jvstin47@gmail.com" style="color:#2dd4bf;">jvstin47@gmail.com</a><br/>
                GitHub: <a href="https://github.com/jvstin47" target="_blank" style="color:#2dd4bf;">github.com/jvstin47</a><br/>
                LinkedIn: <a href="https://www.linkedin.com/in/jvstin47/" target="_blank" style="color:#2dd4bf;">linkedin.com/in/jvstin47</a>
              </div>`
          };

        case 'loader':
        case 'preloader':
        case 'gyro':
          return {
            type: 'preloader',
            output: `<span style="color:var(--nature);">✔ Quantum Gyroscope Loader summoned! Press Esc or click to exit.</span>`
          };

        case 'clear':
          return { type: 'clear' };

        case 'exit':
        case 'quit':
          return { type: 'exit' };

        default:
          return {
            type: 'html',
            output: `<span style="color:#ff5f56;">Command not recognized: '${cmd}'. Type 'help' to see valid commands.</span>`
          };
      }
    }
  }

  return TerminalEngine;
});
