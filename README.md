# 🚦 Smart Traffic Light Management System

<div align="center">

![Traffic Management](https://img.shields.io/badge/AI-Q--Learning-blue?style=for-the-badge&logo=python)
![YOLO](https://img.shields.io/badge/Vision-YOLOv4-orange?style=for-the-badge&logo=opencv)
![FastAPI](https://img.shields.io/badge/Backend-FastAPI-009688?style=for-the-badge&logo=fastapi)
![React](https://img.shields.io/badge/Frontend-React-61DAFB?style=for-the-badge&logo=react)
![SUMO](https://img.shields.io/badge/Simulation-SUMO-yellow?style=for-the-badge)

**An AI-powered adaptive traffic signal controller with real-time Q-Learning, YOLOv4 vehicle detection, and a live React dashboard.**

</div>

---

## 📌 Overview

The **Smart Traffic Light Management System** is a full-stack intelligent traffic management platform that replaces fixed-timer traffic signals with a self-learning agent. The system:

- Uses **Reinforcement Learning (Q-Learning)** to dynamically assign green time based on live vehicle counts
- Supports **three data source modes**: SUMO simulation, YOLO-based CCTV/video analysis, and MOCK (demo/test)
- Displays real-time signal states, vehicle counts, and performance metrics on a **live React dashboard**
- Detects **emergency vehicles** and immediately grants a priority green phase
- Automatically **pauses/plays** video lanes based on the current signal phase in VIDEO mode

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        FRONTEND (React)                         │
│   Dashboard · Settings · CCTV · Upload · Analytics · Heatmap   │
└───────────────────────────┬────────────────────────────────────┘
                            │ HTTP (polling every 1s)
┌───────────────────────────▼────────────────────────────────────┐
│                      BACKEND (FastAPI)                          │
│   /live-status · /simulation/start · /simulation/switch-mode   │
│   /analysis/start · /simulation/current-mode                   │
└───────────────────────────┬────────────────────────────────────┘
                            │ subprocess + env vars
┌───────────────────────────▼────────────────────────────────────┐
│                   CONTROLLER (Python)                           │
│                                                                 │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │
│  │ Q-Learning   │  │ Source       │  │ Live Status Writer   │  │
│  │ Agent        │  │ Selector     │  │ (Atomic JSON write)  │  │
│  └──────────────┘  └──────────────┘  └──────────────────────┘  │
│         ▲                 │                                     │
│         │          ┌──────▼──────┐                             │
│         │          │ SUMO TraCI  │                             │
│         │          │ YOLO Video  │                             │
│         │          │ MOCK Data   │                             │
│         └──────────┴─────────────┘                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## ✨ Features

### 🤖 AI Signal Control
- **Q-Learning agent** builds a Q-table of (state, action) pairs using the Bellman equation
- State = discretized vehicle counts per lane (Low / Medium / High)
- Reward = negative average waiting time (agent learns to minimise congestion)
- Epsilon-greedy exploration with **automatic epsilon decay** (20% → 5% over time)
- Q-table **persisted to disk** (`q_table.pkl`) and restored on restart

### 🚦 Signal Phases
- **GREEN** → active lane gets proportional green time based on vehicle count + speed factor
- **YELLOW** → transitional phase between green cycles
- **RED** → all other lanes while one is green
- **Emergency Override** → detected emergency vehicle immediately gets MAX_GREEN time

### 📡 Three Data Source Modes

| Mode | Description | Requires |
|------|-------------|----------|
| `MOCK` | Realistic randomised vehicle counts with gradual drift | Nothing |
| `SUMO` | Full traffic simulation via TraCI API | SUMO installed + `SUMO_HOME` set |
| `VIDEO` | YOLOv4 object detection on 4 uploaded CCTV footages | YOLOv4 weights |

Switch modes **live from the Settings page** without restarting anything.

### 🎥 Video Mode — 4-Lane Upload Wizard
1. Click **VIDEO** in Settings → upload modal opens automatically
2. Drag & drop or click to upload footage for each lane (North / East / South / West)
3. Click **Start YOLO Analysis** → videos are uploaded and controller starts
4. Dashboard shows `▶ VIDEO PLAYING` (green lane) and `⏸ VIDEO PAUSED` (red lanes) per lane

### 📊 Live Dashboard
- Real-time signal phase indicator with countdown timer
- Per-lane vehicle counts and speed (m/s)
- Traffic light animation (Red / Yellow / Green bulbs)
- Network flow graph (average wait time + throughput over last 20 cycles)
- Emergency detection banner with siren animation

---

## 📁 Project Structure

```
Smart Traffic Light Management/
│
├── backend/                     # FastAPI REST API
│   ├── main.py                  # All API endpoints
│   └── traffic_service.py       # Controller subprocess manager
│
├── controller/                  # Python traffic controller
│   ├── main.py                  # Main control loop (green/yellow/RL cycle)
│   ├── config.py                # All tuneable parameters
│   ├── source_selector.py       # SUMO / VIDEO / MOCK data routing
│   ├── live_status_writer.py    # Atomic JSON status file writer
│   ├── shared_state.py          # Shared in-memory state
│   │
│   ├── analytics/
│   │   ├── traffic_analyzer.py  # Emergency detection, detailed stats
│   │   ├── metrics.py           # Wait time, throughput, efficiency
│   │   ├── csv_logger.py        # Per-cycle CSV logging
│   │   └── plot_metrics.py      # Matplotlib charts (saved as PNG)
│   │
│   ├── core/
│   │   ├── signal_controller.py # TraCI green/yellow signal application
│   │   └── phase_manager.py     # Cascading red time calculator
│   │
│   └── ml_models/
│       └── q_learning_agent.py  # Q-Learning agent with epsilon decay
│
├── frontend/                    # React dashboard
│   └── src/
│       ├── App.js               # Root app, routing, live-status polling
│       ├── App.css              # Global design system (glassmorphism)
│       └── components/
│           ├── Dashboard.jsx    # Main signal monitor (4 LaneBoxes)
│           ├── LaneBox.jsx      # Individual lane card with traffic light
│           ├── Navbar.jsx       # Top navigation + engine status badge
│           ├── SettingsPage.jsx # Mode switcher + simulation controls
│           ├── VideoModeModal.jsx  # 4-lane upload wizard
│           ├── AnalyticsPanel.jsx  # Performance stats panel
│           ├── AnalysisPage.jsx    # Traffic analysis charts
│           ├── HeatmapView.jsx     # Lane heatmap visualisation
│           ├── MLDatabase.jsx      # Q-Table and learning logs
│           ├── CCTVPanel.jsx       # Live CCTV feed view
│           └── VideoUpload.jsx     # Alternative upload page
│
├── simulation/                  # SUMO simulation files
│   ├── run.sumocfg              # SUMO configuration
│   ├── network.net.xml          # Road network
│   ├── routes.rou.xml           # Vehicle routes
│   ├── nodes.nod.xml            # Junction nodes
│   └── edges.edg.xml            # Road edges
│
├── yolo/                        # YOLOv4 model files (not included)
│   ├── yolov4-tiny.weights      # Download separately
│   ├── yolov4-tiny.cfg
│   └── coco.names
│
├── yolo_detection.py            # YOLO detection engine (lazy-loaded)
├── requirements.txt             # Python dependencies
└── .gitignore
```

---

## 🚀 Getting Started

### Prerequisites

| Tool | Version | Required For |
|------|---------|--------------|
| Python | 3.10+ | Backend + Controller |
| Node.js | 18+ | Frontend |
| SUMO | 1.18+ | SUMO mode only |

---

### 1. Clone & Setup

```bash
git clone https://github.com/vishaljatav777/smart-traffic-light-management-system.git
cd smart-traffic-light-management-system
```

### 2. Create Python Virtual Environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux / Mac
source venv/bin/activate
```

### 3. Install Python Dependencies

```bash
pip install -r requirements.txt
```

### 4. Install Frontend Dependencies

```bash
cd frontend
npm install
cd ..
```

---

### 5. Run the System (3 Terminals)

**Terminal 1 — Backend API:**
```bash
cd backend
python -m uvicorn main:app --reload
# Runs at http://127.0.0.1:8000
```

**Terminal 2 — Traffic Controller:**
```bash
cd controller
python main.py
# Starts in MOCK mode by default
```

**Terminal 3 — React Dashboard:**
```bash
cd frontend
npm start
# Opens at http://localhost:3000
```

---

## ⚙️ Configuration

Edit `controller/config.py` to tune the system:

```python
DATA_SOURCE   = "MOCK"    # Default mode: MOCK | SUMO | VIDEO
TLS_ID        = "J1"      # SUMO traffic light junction ID
DIRECTIONS    = ["N_J1", "E_J1", "S_J1", "W_J1"]  # Lane IDs

MIN_GREEN     = 5         # Minimum green phase duration (seconds)
MAX_GREEN     = 60        # Maximum green phase duration (seconds)
YELLOW_TIME   = 3         # Yellow phase duration (seconds)
```

---

## 🎮 Switching Modes

1. Open the dashboard at **http://localhost:3000**
2. Click **System Settings** in the navbar
3. Choose a mode card:

| Mode Card | What Happens |
|-----------|-------------|
| **⚡ MOCK** | Switches to simulated data immediately |
| **📡 SUMO** | Stops controller, restarts with SUMO-GUI opening automatically |
| **🎥 VIDEO** | Opens the 4-lane footage upload wizard |

---

## 🟡 SUMO Mode Setup

1. Download and install SUMO from **https://sumo.dlr.de/docs/Downloads.php**

2. Set the `SUMO_HOME` environment variable:
   ```powershell
   # Windows PowerShell (run as Administrator)
   [System.Environment]::SetEnvironmentVariable("SUMO_HOME", "C:\Program Files (x86)\Eclipse\Sumo", "User")
   ```
   Restart your terminal after setting this.

3. Switch to SUMO mode in Settings → SUMO-GUI window opens automatically.

---

## 🎥 VIDEO Mode Setup

1. Download YOLOv4-Tiny weights and place in the `yolo/` folder:
   - `yolov4-tiny.weights` — [Download here](https://github.com/AlexeyAB/darknet/releases)
   - `yolov4-tiny.cfg` — included in this repo
   - `coco.names` — included in this repo

2. Switch to VIDEO mode in Settings → upload modal appears automatically.

3. Upload CCTV footage for all 4 lanes → click **Start YOLO Analysis**.

---

## 📡 API Reference

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET`  | `/live-status` | Current signal state, counts, phase, timer |
| `GET`  | `/simulation/status` | Is controller running? |
| `POST` | `/simulation/start?mode=MOCK` | Start controller in specified mode |
| `POST` | `/simulation/stop` | Stop controller |
| `POST` | `/simulation/switch-mode?mode=SUMO` | Stop + restart in new mode |
| `GET`  | `/simulation/current-mode` | Which mode is currently active |
| `POST` | `/analysis/start` | Upload 4 videos + start YOLO analysis |

Interactive API docs available at **http://127.0.0.1:8000/docs**

---

## 🧠 How Q-Learning Works

```
Each traffic cycle:
  1. Observe state  = (lane_N_traffic, lane_E_traffic, lane_S_traffic, lane_W_traffic)
                       each discretised as 0=Low, 1=Medium, 2=High

  2. Choose action  = which lane gets green next
                       (20% random exploration → decays to 5% over time)

  3. Apply action   → green phase runs, vehicles clear, yellow phase follows

  4. Observe reward = − average_waiting_time
                       (agent maximises flow by minimising congestion)

  5. Update Q-table via Bellman equation:
     Q(s,a) ← Q(s,a) + α [ r + γ · max Q(s',a') − Q(s,a) ]
```

The Q-table is saved to `q_table.pkl` after every session and reloaded on next start — so the agent gets smarter over time.

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Recharts, Lucide Icons |
| Backend | FastAPI, Uvicorn |
| Controller | Python 3.10+ |
| AI/ML | Q-Learning (custom), NumPy |
| Vision | YOLOv4-Tiny, OpenCV |
| Simulation | SUMO + TraCI |
| Styling | Vanilla CSS (glassmorphism, dark mode) |

---

## 📄 License

MIT License — see [LICENSE](LICENSE) for details.

---

<div align="center">
  Made with ❤️ | Smart Traffic Light Management System
</div>
