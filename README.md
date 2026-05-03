<div align="center">

# 🚦 Smart Traffic Light Management System

### AI-Powered Adaptive Signal Control with Real-Time Dashboard

<br/>

[![Python](https://img.shields.io/badge/Python-3.10+-3776AB?style=flat-square&logo=python&logoColor=white)](https://python.org)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110+-009688?style=flat-square&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com)
[![React](https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react&logoColor=black)](https://react.dev)
[![SUMO](https://img.shields.io/badge/SUMO-Simulation-F5A623?style=flat-square)](https://sumo.dlr.de)
[![YOLOv4](https://img.shields.io/badge/YOLOv4-Detection-EF4444?style=flat-square&logo=opencv&logoColor=white)](https://github.com/AlexeyAB/darknet)
[![License: MIT](https://img.shields.io/badge/License-MIT-green?style=flat-square)](LICENSE)

<br/>

> A full-stack intelligent traffic management system that replaces fixed-timer signals with a self-learning **Q-Learning AI agent**, supports live **YOLOv4 vehicle detection** from CCTV footage, and visualises everything on a real-time **React glassmorphism dashboard**.

</div>

---

## 📸 System Overview

```
┌─────────────────────────────────────────────────────────────┐
│                    React Dashboard (Port 3000)               │
│  Live Signal Monitor · Mode Switcher · Analytics · Heatmap  │
└────────────────────────────┬────────────────────────────────┘
                             │  HTTP polling (every 1s)
┌────────────────────────────▼────────────────────────────────┐
│                  FastAPI Backend (Port 8000)                  │
│  /live-status  /switch-mode  /analysis/start  /current-mode  │
└────────────────────────────┬────────────────────────────────┘
                             │  subprocess + env vars
┌────────────────────────────▼────────────────────────────────┐
│                     Python Controller                        │
│                                                              │
│   ┌─────────────┐   ┌──────────────┐   ┌─────────────────┐  │
│   │  Q-Learning │   │    Source    │   │  Live Status    │  │
│   │    Agent    │◄──│   Selector   │   │  Writer (JSON)  │  │
│   └──────┬──────┘   └──────┬───────┘   └─────────────────┘  │
│          │                 │                                  │
│      Bellman            ┌──▼──────────────────────┐          │
│      Equation           │  SUMO · YOLOv4 · MOCK   │          │
│                         └─────────────────────────┘          │
└─────────────────────────────────────────────────────────────┘
```

---

## ✨ Key Features

### 🤖 Reinforcement Learning Signal Control
- **Q-Learning agent** learns the optimal green-phase assignment from experience
- State = per-lane vehicle density discretised to `Low / Medium / High`
- Reward = `-average_waiting_time` — agent minimises congestion automatically
- **Epsilon-greedy** exploration that decays from 20% → 5% over training cycles
- Q-table is **persisted to disk** and reloaded on every restart (continuous learning)

### 📡 Three Live Data Source Modes

| Mode | How It Works | Requirements |
|------|-------------|--------------|
| `MOCK` | Randomised vehicle counts with realistic drift | None — works out of the box |
| `SUMO` | Full traffic simulation connected via TraCI API | SUMO installed + `SUMO_HOME` set |
| `VIDEO` | YOLOv4 detects vehicles frame-by-frame from uploaded CCTV footage | YOLOv4 weights file |

**Switch modes live from the Settings page — no restarts needed.**

### 🎥 4-Lane Video Upload Wizard
When you switch to **VIDEO** mode, an upload modal appears automatically:
1. Drag & drop or click to load footage for each lane (N / E / S / W)
2. Preview plays instantly inside each upload card
3. Click **Start YOLO Analysis** — all 4 videos are sent to the backend
4. The dashboard immediately shows `▶ PLAYING` or `⏸ PAUSED` per lane based on the live signal

### 🚨 Emergency Vehicle Override
- Siren pattern detection automatically grants `MAX_GREEN` to the priority lane
- Emergency banner with animated alert appears on the dashboard
- All other lanes go immediately to red

### 📊 Real-Time Dashboard
- **Traffic light animation** per lane (Red / Yellow / Green bulbs with glow effects)
- Live countdown timer per phase
- Per-lane vehicle count and speed (m/s)
- Network flow graph (avg wait + throughput over last 20 cycles)
- Next-lane prediction indicator

---

## 🏗️ Project Structure

```
Smart-Traffic-Light-Management/
│
├── 📁 backend/                      FastAPI REST API
│   ├── main.py                      All endpoints + mode switcher
│   └── traffic_service.py           Controller subprocess manager
│
├── 📁 controller/                   Core Python controller
│   ├── main.py                      Main cycle loop (Green → Yellow → RL update)
│   ├── config.py                    All tunable parameters
│   ├── source_selector.py           Routes data: SUMO / VIDEO / MOCK
│   ├── live_status_writer.py        Atomic JSON status file (no race conditions)
│   │
│   ├── 📁 analytics/
│   │   ├── traffic_analyzer.py      Emergency detection + detailed lane stats
│   │   ├── metrics.py               Wait time, throughput, efficiency tracker
│   │   ├── csv_logger.py            Per-cycle CSV logging
│   │   └── plot_metrics.py          Matplotlib plots saved as PNG
│   │
│   ├── 📁 core/
│   │   ├── signal_controller.py     TraCI green/yellow phase application
│   │   └── phase_manager.py         Cascading red timer calculator
│   │
│   └── 📁 ml_models/
│       └── q_learning_agent.py      Q-Learning with Bellman + epsilon decay
│
├── 📁 frontend/                     React 18 dashboard
│   └── src/
│       ├── App.js                   Root app, routing, 1s polling loop
│       ├── App.css                  Glassmorphism design system
│       └── components/
│           ├── Dashboard.jsx        4-lane signal monitor
│           ├── LaneBox.jsx          Lane card (traffic light + play/pause badge)
│           ├── Navbar.jsx           Navigation + ENGINE LIVE badge
│           ├── SettingsPage.jsx     Mode switcher + simulation controls
│           ├── VideoModeModal.jsx   4-lane CCTV upload wizard
│           ├── AnalyticsPanel.jsx   Performance metrics panel
│           ├── AnalysisPage.jsx     Traffic analysis charts
│           ├── HeatmapView.jsx      Lane congestion heatmap
│           ├── MLDatabase.jsx       Q-table viewer + learning logs
│           └── CCTVPanel.jsx        Live camera feed panel
│
├── 📁 simulation/                   SUMO network files
│   ├── run.sumocfg                  SUMO configuration entry point
│   ├── network.net.xml              Road network definition
│   ├── routes.rou.xml               Vehicle route definitions
│   ├── nodes.nod.xml                Junction node coordinates
│   └── edges.edg.xml                Road edge definitions
│
├── 📁 yolo/                         YOLOv4 model files (not committed)
│   ├── yolov4-tiny.weights          ← Download separately (see below)
│   ├── yolov4-tiny.cfg
│   └── coco.names
│
├── yolo_detection.py                YOLO lazy-load detection engine
├── requirements.txt                 Python dependencies
└── .gitignore
```

---

## 🚀 Installation & Setup

### Prerequisites

| Tool | Minimum Version | Purpose |
|------|----------------|---------|
| Python | 3.10 | Backend + Controller |
| Node.js | 18 | React Frontend |
| SUMO | 1.18 | SUMO mode (optional) |

---

### Step 1 — Clone the Repository

```bash
git clone https://github.com/vishaljatav777/smart-traffic-light-management-system.git
cd smart-traffic-light-management-system
```

### Step 2 — Python Virtual Environment

```bash
# Create
python -m venv venv

# Activate (Windows)
venv\Scripts\activate

# Activate (Linux / macOS)
source venv/bin/activate
```

### Step 3 — Install Python Dependencies

```bash
pip install -r requirements.txt
```

### Step 4 — Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

---

## ▶️ Running the System

Open **3 separate terminals** (all inside the project root):

**Terminal 1 — Backend**
```bash
cd backend
python -m uvicorn main:app --reload
# API available at → http://127.0.0.1:8000
# Swagger docs at  → http://127.0.0.1:8000/docs
```

**Terminal 2 — Controller**
```bash
cd controller
python main.py
# Starts in MOCK mode by default
# Switch modes from the dashboard Settings page
```

**Terminal 3 — Frontend**
```bash
cd frontend
npm start
# Dashboard opens at → http://localhost:3000
```

---

## ⚙️ Configuration

All parameters live in `controller/config.py`:

```python
DATA_SOURCE          = "MOCK"        # MOCK | SUMO | VIDEO
TLS_ID               = "J1"          # SUMO junction ID
DIRECTIONS           = ["N_J1", "E_J1", "S_J1", "W_J1"]

MIN_GREEN            = 8             # Minimum green phase (seconds)
MAX_GREEN            = 40            # Maximum green phase (seconds)
YELLOW_TIME          = 4             # Yellow phase duration (seconds)
STARVATION_THRESHOLD = 3             # Cycles before forcing a starved lane
```

---

## 🔁 Switching Data Source Modes

From the dashboard: **Settings → Data Source Mode**

| Click | What Happens |
|-------|-------------|
| ⚡ **MOCK** | Instantly switches to simulated drift traffic data |
| 📡 **SUMO** | Stops controller, restarts with SUMO-GUI opening automatically |
| 🎥 **VIDEO** | Opens the 4-lane CCTV footage upload wizard |

---

## 🟡 SUMO Mode Setup

> Skip this if you only need MOCK or VIDEO mode.

**1. Download and install SUMO:**
https://sumo.dlr.de/docs/Downloads.php → choose *Windows 64-bit installer*

**2. Set the `SUMO_HOME` environment variable:**

```powershell
# Run as Administrator in PowerShell
[System.Environment]::SetEnvironmentVariable(
  "SUMO_HOME",
  "C:\Program Files (x86)\Eclipse\Sumo",
  "User"
)
```

Restart your terminal. Verify with:
```powershell
echo $env:SUMO_HOME
# Should print: C:\Program Files (x86)\Eclipse\Sumo
```

**3.** Switch to SUMO mode in Settings — SUMO-GUI opens automatically.

---

## 🎥 VIDEO / YOLO Mode Setup

> Skip this if you only need MOCK or SUMO mode.

**1. Download YOLOv4-Tiny model files** and place them in the `yolo/` folder:

| File | Source |
|------|--------|
| `yolov4-tiny.weights` | [AlexeyAB Darknet Releases](https://github.com/AlexeyAB/darknet/releases) |
| `yolov4-tiny.cfg` | Included in this repo |
| `coco.names` | Included in this repo |

**2.** Switch to VIDEO mode in Settings → the upload wizard opens.

**3.** Upload one video per lane → click **Start YOLO Analysis**.

---

## 📡 API Reference

Base URL: `http://127.0.0.1:8000`

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/live-status` | Signal state, vehicle counts, phase, timer, per-lane signals |
| `GET` | `/simulation/status` | Whether the controller is running |
| `GET` | `/simulation/current-mode` | Active data source (MOCK / SUMO / VIDEO) |
| `POST` | `/simulation/start?mode=MOCK` | Start controller in specified mode |
| `POST` | `/simulation/stop` | Stop the running controller |
| `POST` | `/simulation/switch-mode?mode=SUMO` | Stop + restart in a new mode |
| `POST` | `/analysis/start` | Upload 4 video files + start YOLO analysis |
| `GET` | `/docs` | Interactive Swagger UI for all endpoints |

---

## 🧠 Q-Learning — How the Agent Learns

```
Every traffic cycle:

  1. OBSERVE STATE
     state = (N_traffic_level, E_traffic_level, S_traffic_level, W_traffic_level)
     where each level = 0 (0–4 vehicles) | 1 (5–14 vehicles) | 2 (15+ vehicles)

  2. CHOOSE ACTION  (which lane gets green next)
     • With probability ε  → random lane  (exploration)
     • With probability 1-ε → argmax Q(state) (exploitation)
     • ε decays: 0.20 → 0.05 over thousands of cycles

  3. RUN PHASE
     green_time = clamp(vehicle_count × 2 × speed_factor, MIN_GREEN, MAX_GREEN)

  4. OBSERVE REWARD
     reward = −average_waiting_time
     (minimising wait time = maximising reward)

  5. UPDATE Q-TABLE  (Bellman equation)
     Q(s,a) ← Q(s,a) + α [ r + γ · max_a' Q(s', a') − Q(s,a) ]
               α = 0.1 (learning rate)
               γ = 0.9 (discount factor)

  6. SAVE
     Q-table written to q_table.pkl after every session
     Loaded back on next startup — agent remembers everything
```

---

## 🛠️ Tech Stack

| Layer | Technology | Role |
|-------|-----------|------|
| Frontend | React 18, Recharts, Lucide Icons | Dashboard UI |
| Styling | Vanilla CSS — glassmorphism, dark mode | Visual design |
| Backend | FastAPI + Uvicorn | REST API |
| Controller | Python 3.10+ | Signal cycle logic |
| AI/ML | Q-Learning, NumPy | Adaptive signal decisions |
| Vision | YOLOv4-Tiny + OpenCV | Vehicle detection |
| Simulation | SUMO + TraCI | Traffic simulation |
| Storage | JSON (atomic), CSV, Pickle | State, logs, Q-table |

---

## 📄 License

Distributed under the **MIT License** — see [LICENSE](LICENSE) for details.

---

<div align="center">

**Smart Traffic Light Management System**
Built with Python · FastAPI · React · Q-Learning · YOLOv4

</div>
