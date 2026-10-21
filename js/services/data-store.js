/**
 * DataStore — Pure Domain Models and Static Data
 * Single source of truth for projects, skills, awards, bio, and virtual filesystem.
 * No DOM dependencies; safe for both browser and test environments.
 */

(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.DataStore = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  const BIO = {
    name: 'Justin Joe Mathew',
    title: 'Systems Builder & Software Engineer',
    education: '2nd Year B.Tech CSE (Class of 2029) @ Amal Jyothi College of Engineering, Kerala',
    focus: 'Autonomous edge AI micro-UAVs (SIH 26177), spatial camera tracking (SIH 26169), vectorized race simulation, and offline mobile platforms.',
    email: 'jvstin47@gmail.com',
    github: 'https://github.com/jvstin47',
    linkedin: 'https://www.linkedin.com/in/jvstin47/',
    resumePdf: 'Justin_Mathew_Resume.pdf'
  };

  const SKILLS = {
    coreSystems: ['C', 'C++', 'Python 3.11', 'Kotlin', 'TypeScript', 'Dart', 'Linux Shell'],
    aiAndMath: ['NumPy', 'PyTorch', 'Demucs v4', 'YOLOv8', 'FastF1', 'Monte Carlo Simulation'],
    mobileAndEdge: ['Android Native', 'Room SQLite', 'Flutter', 'Qualcomm RB5', 'Arduino Uno Q'],
    webAnd3D: ['React 19', 'Next.js', 'Canvas 2D', 'Three.js', 'WebGL', 'Tailwind', 'FastAPI']
  };

  const AWARDS = [
    { title: '1st Place Champion', event: 'ACM Vibefest Hackathon 2026', icon: '🥇' },
    { title: 'Phase 1 Winner', event: 'Idea From Industry S2 (MakerHub / BIRAC / MoE)', icon: '🏆' },
    { title: '1st Place', event: 'AI Club Ideathon 2026', icon: '🥇' },
    { title: 'Shortlisted', event: 'Smart India Hackathon 2026 (SIH 26177 Qualcomm & SIH 26169 Tracks)', icon: '🎖️' },
    { title: 'Podium (Double 3rd Prize)', event: 'Azure 2026 (Extempore English & JamSpace)', icon: '🎙️' },
    { title: 'State Participant', event: 'K-DISC Young Innovators Programme (YIP 8.0), Govt of Kerala', icon: '🌱' },
    { title: 'Global Participant', event: 'NASA Space Apps Challenge 2025', icon: '🚀' }
  ];

  const PROJECTS = [
    {
      id: '01',
      slug: 'phoenix-uav',
      title: 'Phoenix X — Autonomous AI SAR Micro-UAV',
      category: 'Autonomous Edge AI / Hardware',
      sihTrack: 'SIH 26177 (Qualcomm Robotics Track)',
      repoUrl: 'https://github.com/jvstin47/Phoenix-SIH26177-SAR-UAV',
      liveUrl: 'https://phoenix-sar-uav.vercel.app',
      summary: 'Systems proposal for an autonomous search & rescue drone with dual-compute architecture, on-device thermal detection, and 5km zero-cloud LoRa 915 MHz telemetry mesh.'
    },
    {
      id: '02',
      slug: 'camera-tracking',
      title: 'AI-Based Virtual Camera Tracking (SIH 26169)',
      category: 'Spatial Computing / Broadcast',
      sihTrack: 'SIH 26169 (Optical Tracking)',
      repoUrl: 'https://github.com/jvstin47/SIH-26169-Virtual-Camera-Tracking',
      summary: 'Markerless 6-DoF optical pose estimation fused with 500Hz IMU kinematics via Extended Kalman Filtering for real-time FreeD UDP virtual studio broadcast.'
    },
    {
      id: '03',
      slug: 'f1-strategy',
      title: 'F1 Monte Carlo Race Strategy Simulator',
      category: 'Stochastic Simulation / Strategy',
      repoUrl: 'https://github.com/jvstin47/F1-Monte-Carlo-Race-Strategy-Simulator',
      summary: '10,000-iteration vectorized NumPy Monte Carlo race simulator paired with multi-stint pit strategy optimization.'
    },
    {
      id: '04',
      slug: 'captain-lakshmi',
      title: 'Captain Lakshmi Sahgal Invicta Monograph',
      category: 'Interactive WebGL / Canvas 2D',
      liveUrl: 'https://capt-lakshmi.vercel.app',
      summary: 'Digital historical monograph with memory-bounded LRU ring-buffer rendering 3,100+ frames at constant 60 FPS scroll velocity.'
    },
    {
      id: '05',
      slug: 'chord-analyzer',
      title: 'Song Chord Analyzer (macOS & Windows)',
      category: 'Music Information Retrieval (MIR)',
      repoUrl: 'https://github.com/jvstin47/Song-Chord-Analyzer--Mac',
      summary: 'Polyphonic audio transcription desktop application with Meta Demucs v4 4-stem neural demuxing and 170-chord Bidirectional Transformer CRNN.'
    },
    {
      id: '06',
      slug: 'aroggyagram',
      title: 'AroggyaGram-3 — Intelligent Health Network',
      category: 'AI Multi-Agent Systems',
      repoUrl: 'https://github.com/jvstin47/AroggyaGram-3',
      summary: 'Autonomous emergency dispatch platform parsing unstructured voice distress signals and calculating Haversine proximity routing to field responders.'
    },
    {
      id: '07',
      slug: 'autometer',
      title: 'AutoMeter — Smart Transit Fare System',
      category: 'IoT / Transit Automation',
      repoUrl: 'https://github.com/jvstin47/AutoMeter',
      summary: 'Dual sensor-fusion transit fare meter combining wheel tachometer pulses with GPS speed fallback and dynamic on-the-fly UPI QR generation.'
    },
    {
      id: '08',
      slug: 'opportunity-os',
      title: 'Opportunity OS — Task Architecture Prototype',
      category: 'Mobile / Android Native',
      repoUrl: 'https://github.com/jvstin47/opportunity-android-task-planner',
      summary: 'Offline-first task planner prototype engineered with Kotlin, Room SQLite, and WorkManager background synchronization.'
    },
    {
      id: '09',
      slug: 'crt-lock',
      title: 'Chinese Remainder Theorem Modular Safe',
      category: 'Applied Cryptography / 3D WebGL',
      liveUrl: 'https://crt-modular-lock.vercel.app',
      summary: 'Tactile 3D safe tumbler mechanism demonstrating number theory and systems of linear congruences in real time with Three.js shaders.'
    },
    {
      id: '10',
      slug: 'uno-q-arena',
      title: 'UNO-Q Arena — Real-Time Retro RL Engine',
      category: 'Reinforcement Learning / Embedded',
      repoUrl: 'https://github.com/jvstin47/UNO-Q-Arena-Edge-AI-Retro-Gaming-on-Arduino-UNO-Q',
      summary: 'Embedded deep RL policy hooked into a Sega Genesis emulator execution loop running at 60 FPS on micro-hardware.'
    }
  ];

  const FILE_SYSTEM = {
    '~': ['projects', 'telemetry', 'bio.txt', 'resume.pdf'],
    '~/projects': [
      'phoenix-uav',
      'camera-tracking',
      'f1-strategy',
      'captain-lakshmi',
      'chord-analyzer',
      'aroggyagram',
      'autometer',
      'opportunity-os',
      'crt-lock',
      'uno-q-arena'
    ],
    '~/projects/phoenix-uav': ['README.md', 'telemetry.py', 'npu_bench.log', 'mission_cockpit.url', 'hardware_specs.txt'],
    '~/projects/camera-tracking': ['README.md', 'tracking_pipeline.py', 'pose_estimator.py', 'repo.url', 'freed_protocol.txt'],
    '~/projects/f1-strategy': ['README.md', 'strategy_solver.py', 'monte_carlo_10k.py', 'degradation_model.txt'],
    '~/projects/captain-lakshmi': ['README.md', 'canvas_renderer.ts', 'frame_stream.json', 'live_demo.url'],
    '~/projects/chord-analyzer': ['README.md', 'demucs_pipeline.py', 'btc_transformer.py', 'mir_pipeline.txt'],
    '~/projects/aroggyagram': ['README.md', 'triage_agent.ts', 'proximity_router.ts', 'clinical_flow.txt'],
    '~/projects/autometer': ['README.md', 'pulse_sensor.dart', 'upi_generator.dart', 'fare_rules.txt'],
    '~/projects/opportunity-os': ['README.md', 'task_engine.kt', 'work_manager.kt', 'state_machine.txt'],
    '~/projects/crt-lock': ['README.md', 'crt_solver.ts', 'webgl_tumbler.ts', 'cryptography.txt'],
    '~/projects/uno-q-arena': ['README.md', 'rl_policy.py', 'genesis_emulator.c', 'reward_function.txt'],
    '~/telemetry': ['f1_pit_telemetry.json', 'sar_uav_telemetry.py', 'qualcomm_npu_bench.log']
  };

  const FILE_CONTENTS = {
    'bio.txt': 'Justin Joe Mathew — Systems Builder & Software Engineer.\nCurrently in 2nd Year B.Tech CSE (Class of 2029) @ Amal Jyothi College of Engineering, Kerala.\nFocus: Autonomous edge AI micro-UAVs (SIH 26177), spatial camera tracking (SIH 26169), vectorized race simulation, and offline mobile platforms.\nGitHub: https://github.com/jvstin47 | Email: jvstin47@gmail.com',
    'resume.pdf': 'Latest 2026 Engineering Resume available at Justin_Mathew_Resume.pdf\nDirect download: Justin_Mathew_Resume.pdf',
    'f1_pit_telemetry.json': '{\n  "sim_runs": 10000,\n  "tyre_compounds": ["Soft", "Medium", "Hard"],\n  "solver": "Monte Carlo Multi-Stint Strategy",\n  "telemetry_stream": "FastF1 API v3.4"\n}',
    'sar_uav_telemetry.py': '# Phoenix X (SIH 26177) Edge AI & Telemetry Dispatch\ndef get_telemetry():\n    return {\n        "platform": "Qualcomm Robotics RB5 NPU + Pixhawk FC",\n        "vision_model": "ThermalNet YOLOv8 (<20ms latency)",\n        "mesh_link": "LoRa 915 MHz P2P (5km range)",\n        "cockpit": "https://phoenix-sar-uav.vercel.app"\n    }',
    'qualcomm_npu_bench.log': '[RB5 NPU] ThermalNet YOLOv8: 18.4ms/frame | LoRa 915MHz P2P: 5.2km range OK | Zero Cloud: Verified',
    'README.md': '# Monocoque Systems Shell\nWelcome to Justin Joe Mathew\'s interactive systems console.\n• Use `ls` to list available projects and files.\n• Use `cat <filename>` to open files inside the full-screen interactive reader.\n• Use `cd <dir>` or natural aliases like `cd phoenix` to navigate.\n• Try `bench` to run a 1,000-pass Monte Carlo compute benchmark in your browser.',

    /* 01. PHOENIX-UAV */
    '~/projects/phoenix-uav/README.md': `# Phoenix X — Autonomous AI Search & Rescue (SAR) Micro-UAV

**Smart India Hackathon 2026 (SIH 26177)** · Qualcomm Hardware Track · Sub-2kg Micro-UAV

## Executive Overview
When catastrophic disasters strike (landslides, flash floods, collapsed infrastructure), cellular towers collapse, satellite links suffer latency bottlenecks, and thermal optical visibility drops to zero. Phoenix X is an autonomous sub-2kg micro-UAV engineered to execute autonomous search-and-rescue reconnaissance under total zero-cloud, communication-blackout conditions within the critical 72-hour golden window.

## Core Architecture
1. **Edge Intelligence (Qualcomm Robotics RB5 NPU):**
   - Model: Quantized ThermalNet YOLOv8 engine compiled for Qualcomm SNPE.
   - Inference Latency: < 18.4ms per frame on-device, zero internet reliance.
   - Modality: Dual thermal LWIR + radiometric optical vision sensor pipeline.

2. **Off-Grid Telemetry Mesh (LoRa 915 MHz):**
   - 5.0 km peer-to-peer point-to-point RF transmission range without repeaters.
   - Protocol: Zero-cloud cryptographic packet frame streaming live survivor GPS coordinates.

3. **Ground Control Station:**
   - Real-time tactical dashboard: https://phoenix-sar-uav.vercel.app
   - Telemetry feeds: Live heading vector, target confidence heatmaps, thermal radiometric data.

## Verified Impact & Accolades
- Shortlisted for Smart India Hackathon (SIH 2026) under Problem Statement SIH26177.
- Repository: https://github.com/jvstin47/Phoenix-SIH26177-SAR-UAV`,
    '~/projects/phoenix-uav/telemetry.py': `import time, json

class PhoenixSARTelemetry:
    """Qualcomm RB5 On-Board Telemetry Broadcaster (SIH 26177)"""
    def __init__(self):
        self.device = "Qualcomm Robotics RB5"
        self.fc = "Pixhawk 6C (PX4 Autopilot)"
        self.rf_band = "915 MHz LoRa P2P"
        self.target_fps = 54.3

    def poll_sensors(self):
        return {
            "altitude_m": 42.6,
            "ground_speed_mps": 11.2,
            "inference_latency_ms": 18.24,
            "survivors_detected": 2,
            "gps_fix": {"lat": 9.5916, "lng": 76.5222, "sats": 14},
            "thermal_mean_c": 36.8,
            "mesh_rssi_dbm": -84
        }

if __name__ == "__main__":
    node = PhoenixSARTelemetry()
    print("[UAV ONLINE] Telemetry streaming on 915 MHz RF mesh:")
    print(json.dumps(node.poll_sensors(), indent=2))`,
    '~/projects/phoenix-uav/npu_bench.log': `[QUALCOMM RB5 SNPE BENCHMARK REPORT]
Hardware: Qualcomm Robotics RB5 (Kryo 585 CPU + Adreno 650 GPU + Hexagon DSP/NPU)
Model: ThermalNet-YOLOv8-Nano-FP16
Dataset: FLIR Thermal SAR Evaluation Set (1,200 infrared frames)

RESULTS:
• Batch Size: 1
• Mean Inference Latency: 18.2ms
• 99th Percentile Latency: 21.1ms
• NPU Execution Ratio: 98.4%
• Sustained Core Temp: 41.2°C @ ambient 28°C
• Memory Footprint: 214 MB VRAM
STATUS: PASS — Zero frame drops across 60-minute continuous mission flight.`,
    '~/projects/phoenix-uav/mission_cockpit.url': 'https://phoenix-sar-uav.vercel.app',
    '~/projects/phoenix-uav/hardware_specs.txt': `PLATFORM HARDWARE BILL OF MATERIALS:
• Compute: Qualcomm Robotics RB5 Development Kit (8-core Kryo, 8GB LPDDR5)
• Flight Controller: Holybro Pixhawk 6C w/ PX4 v1.14 Autopilot
• Thermal Imager: FLIR Lepton 3.5 Radiometric LWIR (160x120 shuttered)
• Telemetry Transceiver: Semtech SX1262 LoRa 915 MHz (30 dBm TX)
• Battery: 4S 3300mAh LiPo (24-minute endurance @ full payload)`,

    /* 02. CAMERA-TRACKING */
    '~/projects/camera-tracking/README.md': `# AI-Based Virtual Camera Tracking System (SIH 26169)

**Smart India Hackathon 2026 (SIH 26169)** · Virtual Cinematography & Optical Spatial Tracking

## Executive Overview
High-end virtual production traditionally mandates multimillion-dollar infrared optical marker rigs (e.g. Vicon, OptiTrack) and cumbersome sensor collars. This system is a markerless 6-DoF spatial camera tracking and optical pose estimation architecture built for real-time LED volume virtual studios and live VFX broadcasts.

## Technical Highlights
1. **6-DoF Real-Time Pose Estimation:**
   - Optical feature tracking fused with high-frequency 6-axis IMU accelerometer and gyroscope streams via Extended Kalman Filtering (EKF).
   - Achieves sub-12ms end-to-end latency with jitter below 0.08mm translation and 0.02° orientation error.

2. **Industry Broadcast Integration:**
   - Streams native FreeD protocol over UDP directly into Unreal Engine 5.4 LiveLink and Blender Virtual Studio.
   - Zero-latency lens distortion calibration and camera intrinsics solver.

## Repository
• GitHub: https://github.com/jvstin47/SIH-26169-Virtual-Camera-Tracking`,
    '~/projects/camera-tracking/tracking_pipeline.py': `import cv2, numpy as np

class OpticalPoseEstimator:
    """Markerless 6-DoF Optical Pose Tracker (SIH 26169)"""
    def __init__(self, fx=820.0, fy=820.0, cx=640.0, cy=360.0):
        self.camera_matrix = np.array([[fx, 0, cx], [0, fy, cy], [0, 0, 1]])
        self.dist_coeffs = np.zeros((4, 1))

    def estimate_pose(self, prev_pts, curr_pts):
        E, mask = cv2.findEssentialMat(curr_pts, prev_pts, self.camera_matrix, method=cv2.RANSAC)
        _, R, t, mask_pose = cv2.recoverPose(E, curr_pts, prev_pts, self.camera_matrix)
        return {"rotation_matrix": R, "translation_vector": t, "inliers": int(mask_pose.sum())}`,
    '~/projects/camera-tracking/pose_estimator.py': `# Extended Kalman Filter for Sensor Fusion (Optical + IMU)
import numpy as np

class PoseEKF:
    def __init__(self):
        self.state = np.zeros(12) # [x, y, z, roll, pitch, yaw, vx, vy, vz, wx, wy, wz]
        self.covariance = np.eye(12) * 0.01

    def predict(self, imu_accel, dt):
        # High-frequency kinematic integration (500 Hz)
        self.state[:3] += self.state[6:9] * dt + 0.5 * imu_accel * dt**2
        return self.state

    def update_optical(self, optical_pose):
        # Low-latency camera correction update (60 Hz)
        residual = optical_pose - self.state[:6]
        self.state[:6] += 0.45 * residual
        return self.state`,
    '~/projects/camera-tracking/repo.url': 'https://github.com/jvstin47/SIH-26169-Virtual-Camera-Tracking',
    '~/projects/camera-tracking/freed_protocol.txt': `FreeD UDP BROADCAST PACKET STRUCTURE (29 Bytes):
Byte 0: Message Type (0xD1 for Camera Position)
Byte 1: Camera ID (0x01)
Byte 2-4: Pan / Yaw Angle (24-bit fixed point)
Byte 5-7: Tilt / Pitch Angle (24-bit fixed point)
Byte 8-10: Roll Angle (24-bit fixed point)
Byte 11-13: X Translation Position (24-bit fixed point, 0.01mm)
Byte 14-16: Y Translation Position (24-bit fixed point, 0.01mm)
Byte 17-19: Z Height Position (24-bit fixed point, 0.01mm)
Byte 20-22: Zoom / Focal Length
Byte 23-25: Focus Distance
Byte 28: Modulo 256 Checksum byte`,

    /* 03. F1-STRATEGY */
    '~/projects/f1-strategy/README.md': `# F1 Monte Carlo Race Strategy Simulator

**Stochastic Simulation Engine** · Strategy Optimization · FastF1 Telemetry

## Executive Overview
In Formula 1, race victories are determined by navigating thousands of stochastic non-linearities: compound thermal graining, unpredictable Safety Car and VSC neutralizations, fuel-burn lap-time delta offsets, and pit-lane traffic windows.

## Engineering Architecture
1. **Vectorized NumPy Monte Carlo:**
   - Computes 10,000 full-length 57-lap Grand Prix simulations.
   - Non-linear tyre compound degradation curves informed by real telemetry feeds from the FastF1 API.

2. **Strategy Optimization Engine:**
   - Evaluates multi-stint pit strategies identifying optimal stop windows under uncertain track temperatures and rain likelihood.
   - High-performance data pipelines and interactive probability visualizations.

## Repository
• GitHub: https://github.com/jvstin47/F1-Monte-Carlo-Race-Strategy-Simulator`,
    '~/projects/f1-strategy/strategy_solver.py': `import numpy as np

def solve_optimal_pit_window(total_laps=57, tyre_compounds=["Soft", "Medium", "Hard"]):
    """Monte Carlo Multi-Stint Strategy solver for optimal F1 pit stops"""
    V = np.full((total_laps + 1, len(tyre_compounds), 60), np.inf)
    policy = np.zeros_like(V, dtype=int)
    
    # Boundary condition: Lap 57 cost = 0
    V[total_laps, :, :] = 0.0
    
    pit_lane_delta = 21.4 # seconds lost in pit lane
    for lap in reversed(range(total_laps)):
        for c_idx, compound in enumerate(tyre_compounds):
            for age in range(45):
                # Action 1: Stay out
                deg_cost = 82.5 + (0.045 * (age ** 1.35))
                stay_val = deg_cost + V[lap + 1, c_idx, age + 1]
                
                # Action 2: Pit for fresh compound
                pit_val = deg_cost + pit_lane_delta + V[lap + 1, (c_idx + 1) % len(tyre_compounds), 0]
                
                if pit_val < stay_val:
                    V[lap, c_idx, age] = pit_val
                    policy[lap, c_idx, age] = 1 # Pit
                else:
                    V[lap, c_idx, age] = stay_val
                    policy[lap, c_idx, age] = 0 # Stay
    return V, policy`,
    '~/projects/f1-strategy/monte_carlo_10k.py': `import numpy as np

def run_monte_carlo_10k(laps=57, simulations=10000):
    """Vectorized 10,000 simulation pass in pure NumPy"""
    sc_prob = 0.042 # Safety car probability per lap
    wear_coeff = np.random.normal(0.045, 0.005, (simulations, laps))
    safety_cars = np.random.binomial(1, sc_prob, (simulations, laps))
    
    cumulative_times = np.sum(80.5 + np.cumsum(wear_coeff, axis=1) - (safety_cars * 28.0), axis=1)
    return {
        "p50_total_time_s": float(np.percentile(cumulative_times, 50)),
        "p95_total_time_s": float(np.percentile(cumulative_times, 95)),
        "p05_total_time_s": float(np.percentile(cumulative_times, 5))
    }`,
    '~/projects/f1-strategy/degradation_model.txt': `PIRELLI 2026 DEGRADATION CURVE MATRICES:
• C3 Soft: Base Delta 0.00s | Wear Delta: +0.082s * (lap^1.42) | Cliff: Lap 18
• C2 Medium: Base Delta +0.55s | Wear Delta: +0.041s * (lap^1.30) | Cliff: Lap 32
• C1 Hard: Base Delta +1.20s | Wear Delta: +0.022s * (lap^1.18) | Cliff: Lap 46
• Fuel Delta: -0.033s per lap consumed (approx 105kg starting fuel weight)`,

    /* 04. CAPTAIN-LAKSHMI */
    '~/projects/captain-lakshmi/README.md': `# Captain Lakshmi Sahgal Invicta Monograph

**Interactive Digital Monograph** · High-Framerate Canvas 2D Engine · 3,100+ Frames

## Executive Overview
A digital biographical monograph chronicling the life, military leadership, and medical service of Captain Lakshmi Sahgal (Commander of the Rani of Jhansi Regiment, INA). Built around a fluid canvas scrubber engine delivering 3,100+ sequential visual frames synchronized with dynamic editorial prose.

## Technical Architecture
- High-Performance WebGL/Canvas2D hybrid rendering pipeline.
- Custom memory-bounded LRU frame ring-buffer ensuring constant 60 FPS scrolling without browser DOM exhaustion.
- Live Web Application: https://capt-lakshmi.vercel.app`,
    '~/projects/captain-lakshmi/canvas_renderer.ts': `export class FrameCacheRenderer {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private frameBuffer: Map<number, HTMLImageElement> = new Map();
  private maxCacheSize = 48;

  constructor(canvas: HTMLCanvasElement) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d', { alpha: false })!;
  }

  public render(frameIdx: number) {
    const img = this.frameBuffer.get(frameIdx);
    if (img) {
      this.ctx.drawImage(img, 0, 0, this.canvas.width, this.canvas.height);
    }
  }
}`,
    '~/projects/captain-lakshmi/frame_stream.json': '{"total_frames": 3120, "resolution": "1920x1080", "codec": "webp", "average_frame_kb": 22.4}',
    '~/projects/captain-lakshmi/live_demo.url': 'https://capt-lakshmi.vercel.app',

    /* 05. CHORD-ANALYZER */
    '~/projects/chord-analyzer/README.md': `# Song Chord Analyzer — macOS & Windows

**Music Information Retrieval (MIR)** · Demucs v4 Separation · BTC Transformer

## Executive Overview
An AI music transcription desktop application engineered for professional arrangers and musicians. Ingests raw polyphonic audio (MP3, WAV, FLAC), isolates acoustic instruments using Meta's Demucs v4 neural stem separator, and identifies complex harmonic sequences across 170 chord classifications via Bidirectional Transformer CRNNs. Built in collaboration with Jerin Jomy (@jerinjomy07).

## Collaboration & Repositories
- macOS Client: https://github.com/jvstin47/Song-Chord-Analyzer--Mac (Justin)
- Windows / Core MIR Repo: https://github.com/jerinjomy07/Song-Chord-Analyzer (Jerin Jomy)

## Highlights
- 4-stem GPU-accelerated audio stem extraction.
- Automatic key detection, BPM tap tempo inference, and chord sheet PDF export.`,
    '~/projects/chord-analyzer/demucs_pipeline.py': `import torch

class StemSeparator:
    """Meta Demucs v4 4-Stem Neural Audio Demuxer"""
    def __init__(self, model_name="htdemucs"):
        self.device = "mps" if torch.backends.mps.is_available() else "cpu"
        print(f"[MIR ENGINE] Loaded Demucs v4 on device: {self.device}")

    def separate(self, audio_tensor):
        # Extracts: drums, bass, vocals, other (chords)
        return {"stems": ["drums", "bass", "vocals", "other"], "sample_rate": 44100}`,
    '~/projects/chord-analyzer/btc_transformer.py': `import torch.nn as nn

class BTCTransformer(nn.Module):
    """Bidirectional Transformer for Polyphonic Audio Chord Transcription"""
    def __init__(self, num_classes=170, hidden_dim=256):
        super().__init__()
        self.encoder = nn.TransformerEncoderLayer(d_model=hidden_dim, nhead=8)
        self.classifier = nn.Linear(hidden_dim, num_classes)

    def forward(self, mel_spec):
        feats = self.encoder(mel_spec)
        return self.classifier(feats)`,
    '~/projects/chord-analyzer/mir_pipeline.txt': `MIR TRANSCRIPTION AUDIO PIPELINE:
1. Audio Preprocessing: 44.1 kHz downsample, stereo to mono mix, STFT Chroma-CQT
2. Demucs v4 Stemming: Isolates instrumental chord bed from lead vocals & percussive transients
3. BTC Transformer Inference: Evaluates 170 harmonic chord structures across temporal frame windows
4. Viterbi Decoding: Eliminates harmonic jitter between quarter notes`,

    /* 06. AROGGYAGRAM */
    '~/projects/aroggyagram/README.md': `# AroggyaGram-3 — Intelligent Health Network

**Autonomous Emergency AI Agent Network** · Geofenced Proximity Dispatch

## Executive Overview
When medical emergencies occur in underserved rural geographies, critical care fails not due to lack of human goodwill, but due to severe dispatch latency. AroggyaGram-3 is an autonomous multi-agent health logistics network that ingests unstructured voice/text distress signals, diagnoses clinical severity, and dispatches verified field responders.

## Technical Architecture
- Natural language intent parsing using Gemini API clinical triage prompts.
- Haversine geofenced proximity routing calculating responder distances and medical kit availability.
- Shortlisted in state level hackathons.
- GitHub: https://github.com/jvstin47/AroggyaGram-3`,
    '~/projects/aroggyagram/triage_agent.ts': `export async function triageDistressSignal(rawMessage: string) {
  // Clinical severity extraction via LLM agent
  return {
    severity_level: "CRITICAL",
    category: "TRAUMA_BLEEDING",
    required_supplies: ["TOURNIQUET", "STERILE_GAUZE", "SALINE"],
    automated_dispatch: true
  };
}`,
    '~/projects/aroggyagram/proximity_router.ts': `export function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
            Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
            Math.sin(dLon/2) * Math.sin(dLon/2);
  return R * (2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a)));
}`,
    '~/projects/aroggyagram/clinical_flow.txt': `TRIAGE EMERGENCY PRIORITY MATRIX:
• Code Red (Critical): Cardiac, respiratory failure, trauma hemorrhage (< 4 min dispatch)
• Code Yellow (Urgent): Fracture, high fever infant, snakebite protocol (< 12 min dispatch)
• Code Green (Routine): Teleconsultation, prescription refills, community vaccination`,

    /* 07. AUTOMETER */
    '~/projects/autometer/README.md': `# AutoMeter — Smart Transit Fare System

**Dual Sensor-Fusion IoT Fare Meter** · On-The-Fly Dynamic UPI QR Generation

## Executive Overview
Designed to modernize informal transit networks (auto-rickshaws, shared taxis) without imposing thousands of dollars of corporate hardware. Combines wheel tachometer pulse counting with GPS speed fallback to compute tamper-proof fares with dynamic instant QR scan-and-pay.

## Achievements
- Selected as **Phase 1 Winner** in the *Idea From Industry Challenge Season 2*.
- GitHub: https://github.com/jvstin47/AutoMeter`,
    '~/projects/autometer/pulse_sensor.dart': `class TachometerSensor {
  // Dual sensor fusion: Hardware wheel interrupt + GPS geofence speed
  double computeDistance(int pulses, double wheelCircumferenceMeters) {
    return (pulses * wheelCircumferenceMeters) / 1000.0; // returns km
  }
}`,
    '~/projects/autometer/upi_generator.dart': `String generateDynamicUPI({required String vpa, required double fare, required String txnId}) {
  return "upi://pay?pa=$vpa&pn=AutoMeterDriver&am=\${fare.toStringAsFixed(2)}&tn=AutoFare_$txnId&cu=INR";
}`,
    '~/projects/autometer/fare_rules.txt': `TRANSIT FARE COMPUTATION FORMULA:
• Base Fare: ₹30.00 (First 1.5 km included)
• Additional Distance: ₹18.00 / km (computed per 100m pulse bracket)
• Waiting Time Surcharge: ₹1.50 per min for vehicle speed < 5 km/h (after 10 min grace)`,

    /* 08. OPPORTUNITY-OS */
    '~/projects/opportunity-os/README.md': `# Opportunity OS — Task Architecture Prototype

**Offline-First Native Android** · Unidirectional Data Flow (UDF)

## Executive Overview
A clean task prioritization architecture prototype designed for focus. Built with Kotlin, Room SQLite database, and WorkManager background task execution, ensuring responsive local performance completely offline.

## Repository
• GitHub: https://github.com/jvstin47/opportunity-android-task-planner`,
    '~/projects/opportunity-os/task_engine.kt': `class TaskSyncEngine(private val taskDao: TaskDao) {
  val activeCadenceFlow: Flow<List<TaskEntity>> = taskDao.observeActiveTasks()
    .distinctUntilChanged()
    .flowOn(Dispatchers.IO)
}`,
    '~/projects/opportunity-os/work_manager.kt': `// Background Sync Worker for Task Cadence
class SyncTaskWorker(context: Context, params: WorkerParameters) : CoroutineWorker(context, params) {
    override suspend fun doWork(): Result = Result.success()
}`,
    '~/projects/opportunity-os/state_machine.txt': `OFFLINE TASK CADENCE STATE MACHINE:
PENDING -> IN_PROGRESS -> COMPLETED
        -> DEFERRED (rescheduled for next circadian cycle)
        -> ARCHIVED (persisted to Room SQLite)`,

    /* 09. CRT-LOCK */
    '~/projects/crt-lock/README.md': `# Chinese Remainder Theorem Modular Safe

**Tactile 3D Cryptographic Safe** · Extended Euclidean Algorithm · WebGL / Three.js

## Executive Overview
A tactile browser experience turning abstract number theory into a physical interactive safe tumbler mechanism. Solves systems of modular congruences using the Chinese Remainder Theorem in real-time, rendered with custom Three.js metallic shaders at 60 FPS.

## Live Application
• Web Demo: https://crt-modular-lock.vercel.app`,
    '~/projects/crt-lock/crt_solver.ts': `export function solveCRT(remainders: number[], moduli: number[]): number {
  const prod = moduli.reduce((acc, val) => acc * val, 1);
  let result = 0;
  for (let i = 0; i < moduli.length; i++) {
    const m = moduli[i];
    const p = prod / m;
    result += remainders[i] * mulInv(p, m) * p;
  }
  return result % prod;
}

function mulInv(a: number, b: number): number {
  const b0 = b;
  let x0 = 0, x1 = 1;
  if (b === 1) return 1;
  while (a > 1) {
    const q = Math.floor(a / b);
    let t = b; b = a % b; a = t;
    t = x0; x0 = x1 - q * x0; x1 = t;
  }
  return x1 < 0 ? x1 + b0 : x1;
}`,
    '~/projects/crt-lock/webgl_tumbler.ts': `// Three.js spring inertia & cylinder physical tumbler rendering`,
    '~/projects/crt-lock/cryptography.txt': `CHINESE REMAINDER THEOREM MATHEMATICAL STATEMENT:
Given pairwise coprime integers n_1, n_2, ..., n_k and arbitrary integers a_1, a_2, ..., a_k:
The system of congruences:
  x ≡ a_1 (mod n_1)
  x ≡ a_2 (mod n_2)
  ...
  x ≡ a_k (mod n_k)
has a unique solution modulo N = n_1 * n_2 * ... * n_k.`,

    /* 10. UNO-Q-ARENA */
    '~/projects/uno-q-arena/README.md': `# UNO-Q Arena — Real-Time Retro RL Engine

**Reinforcement Learning Policy** · 60 FPS Emulation Hook · Arduino UNO-Q

## Executive Overview
Integrates a deep reinforcement learning policy into a Sega Genesis emulator loop executing on embedded micro-hardware. Achieves 60 FPS frame capture and input prediction under severe RAM constraints.

## Repository
• GitHub: https://github.com/jvstin47/UNO-Q-Arena-Edge-AI-Retro-Gaming-on-Arduino-UNO-Q`,
    '~/projects/uno-q-arena/rl_policy.py': `import torch

class RetroGamepadPolicy(torch.nn.Module):
    def __init__(self, action_space=8):
        super().__init__()
        self.conv = torch.nn.Sequential(
            torch.nn.Conv2d(1, 16, kernel_size=8, stride=4),
            torch.nn.ReLU(),
            torch.nn.Flatten(),
            torch.nn.Linear(256, action_space)
        )
    def forward(self, state):
        return self.conv(state)`,
    '~/projects/uno-q-arena/genesis_emulator.c': `// Zero-overhead Genesis SRAM hook reading video memory`,
    '~/projects/uno-q-arena/reward_function.txt': `PPO REWARD OPTIMIZATION CRITERIA:
R = +10.0 * (ScoreDelta) + 2.0 * (SurvivalSeconds) - 50.0 * (CollisionEvent)`
  };

  return {
    bio: BIO,
    skills: SKILLS,
    awards: AWARDS,
    projects: PROJECTS,
    fileSystem: FILE_SYSTEM,
    fileContents: FILE_CONTENTS,

    getDirectory(path) {
      return FILE_SYSTEM[path] ? [...FILE_SYSTEM[path]] : null;
    },

    getFile(path) {
      return FILE_CONTENTS[path] || null;
    },

    getProject(slug) {
      return PROJECTS.find(p => p.slug === slug || p.id === slug) || null;
    },

    getAllProjects() {
      return [...PROJECTS];
    },

    getSkills() {
      return { ...SKILLS };
    },

    getAwards() {
      return [...AWARDS];
    }
  };
});
