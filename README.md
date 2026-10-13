# Smart Traffic Light Management System

An adaptive traffic signal controller and live dashboard for a four-way intersection. The Python controller combines Q-learning with traffic data from mock input, SUMO, or uploaded video analyzed with YOLOv4-Tiny.

[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python&logoColor=white)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-REST%20API-009688?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## Contents

- [About](#about)
- [Tech stack](#tech-stack)
- [Features](#features)
- [Getting started](#getting-started)
- [Run the application](#run-the-application)
- [Configuration](#configuration)
- [API overview](#api-overview)
- [Project structure](#project-structure)
- [Roadmap](#roadmap)
- [Contributing](#contributing)
- [License](#license)
- [Contact and acknowledgments](#contact-and-acknowledgments)

## About

Fixed traffic-light schedules cannot respond to changing traffic demand. This project explores an adaptive alternative: a Python controller observes vehicle counts for the north, east, south, and west approaches, chooses signal phases, and updates a Q-learning table over repeated cycles. A React dashboard displays signal state and analytics, and a FastAPI service manages the controller and accepts video uploads.

The system supports three traffic input modes:

- **MOCK** generates traffic counts for local development and demonstrations.
- **SUMO** connects the controller to a SUMO traffic simulation through TraCI.
- **VIDEO** analyzes uploaded lane videos with OpenCV and YOLOv4-Tiny.

This project is a simulation and demonstration system. It is not a certified controller for real-world traffic infrastructure.

## Tech stack

- **Frontend:** React, React Router, Recharts, Lucide React, and CSS.
- **API:** FastAPI and Uvicorn.
- **Controller and analytics:** Python, NumPy, and Matplotlib.
- **Vehicle detection:** OpenCV and YOLOv4-Tiny.
- **Traffic simulation:** Eclipse SUMO and TraCI (optional).
- **Learning and local data:** Q-learning with a pickle Q-table; JSON live status and CSV metrics.

## Features

- Four-approach signal control with configurable minimum and maximum green time.
- Q-learning policy with persisted Q-table and epsilon-greedy exploration.
- Mock traffic mode for running the dashboard without SUMO or video input.
- SUMO mode with optional graphical simulation.
- Four-video upload flow for YOLO vehicle detection.
- Live signal state, vehicle counts, phase timer, and performance metrics.
- Dashboard pages for analytics, congestion heatmap, settings, and learning data.
- FastAPI endpoints and interactive API documentation.

## Getting started

### Prerequisites

- Python 3.10 or newer.
- Node.js and npm (Node.js 18 or newer recommended).
- Git.
- For **SUMO** mode: Eclipse SUMO installed and `SUMO_HOME` set.
- For **VIDEO** mode: YOLOv4-Tiny weights at `yolo/yolov4-tiny.weights`, plus four video files to upload. The weights file is ignored by Git and may need to be obtained separately.

MOCK mode does not require SUMO or YOLO weights.

### Installation

Clone the repository and enter its directory:

```bash
git clone https://github.com/vishaljatav777/smart-traffic-light-management-system.git
cd smart-traffic-light-management-system
```

Create and activate a Python virtual environment:

```bash
python -m venv venv
```

Windows PowerShell:

```powershell
.\venv\Scripts\Activate.ps1
```

Windows Command Prompt:

```bat
venv\Scripts\activate.bat
```

Linux or macOS:

```bash
source venv/bin/activate
```

Install the Python dependencies and `psutil` (used by the backend to manage controller processes):

```bash
python -m pip install -r requirements.txt
python -m pip install psutil
```

Install the frontend dependencies:

```bash
cd frontend
npm install
cd ..
```

No `.env` file is required for the default local setup.

## Run the application

Start the API from the project root:

```bash
python -m uvicorn backend.main:app --reload
```

Start the frontend in a second terminal:

```bash
cd frontend
npm start
```

Open [http://localhost:3000](http://localhost:3000). The dashboard talks to the API at `http://127.0.0.1:8000`. Use the Settings page to start the controller in MOCK mode or select another source. The API manages the controller process, so a separate controller terminal is not required for the dashboard workflow.

Useful local URLs:

- Dashboard: [http://localhost:3000](http://localhost:3000)
- API root: [http://127.0.0.1:8000/](http://127.0.0.1:8000/)
- Interactive API docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

You can also run the controller directly from its directory for a standalone run:

```bash
cd controller
python main.py
```

The direct controller run defaults to MOCK mode. Set `DATA_SOURCE=SUMO` in the process environment to request SUMO mode, or use `python main.py --sumo`. The API-driven workflow is recommended when using the dashboard.

### Optional: SUMO setup

Install SUMO and set `SUMO_HOME` to its installation directory. For example, in PowerShell for the current session:

```powershell
$env:SUMO_HOME = 'C:\Program Files (x86)\Eclipse\Sumo'
```

Restart the API process after changing the environment. Select **SUMO** in the dashboard Settings page. The application uses the included `simulation/run.sumocfg` configuration; the mode switcher launches the SUMO GUI.

### Optional: video / YOLO setup

Place the YOLOv4-Tiny weights file at `yolo/yolov4-tiny.weights`. The configuration and class-name files are `yolo/yolov4-tiny.cfg` and `yolo/coco.names`. Select VIDEO mode and provide one video for each of the north, south, east, and west lanes in the upload flow.

## Configuration

The default local setup does not read a `.env` file. Settings are defined in `controller/config.py` or passed through the process environment by the API. The API and frontend currently use fixed local addresses (`127.0.0.1:8000` and `localhost:3000`).

| Setting | Where it is read | Default | Description |
| --- | --- | --- | --- |
| `DATA_SOURCE` | Controller process environment | `MOCK` | Traffic source: `MOCK`, `SUMO`, or `VIDEO`. The API sets this when it launches the controller. |
| `SUMO_HOME` | Controller process environment | Unset | SUMO installation directory. Required for SUMO mode; without it the controller falls back to MOCK. |
| `VIDEO_PATHS` | Controller process environment | Unset | JSON map of lane IDs to video paths. Set internally by the API after upload; usually not configured manually. |
| `MIN_GREEN` | `controller/config.py` | `8` seconds | Minimum green phase duration. |
| `MAX_GREEN` | `controller/config.py` | `40` seconds | Maximum green phase duration. |
| `YELLOW_TIME` | `controller/config.py` | `4` seconds | Yellow phase duration. |
| `STARVATION_THRESHOLD` | `controller/config.py` | `3` cycles | Threshold used by the controller's starvation handling. |
| `TLS_ID` | `controller/config.py` | `J1` | SUMO traffic-light identifier. |
| `DIRECTIONS` | `controller/config.py` | `N_J1`, `E_J1`, `S_J1`, `W_J1` | Incoming lane IDs used by the controller. |

## API overview

Base URL: `http://127.0.0.1:8000`. Start the API before using these examples.

```bash
# Check the live signal state
curl http://127.0.0.1:8000/live-status

# Start in MOCK mode
curl -X POST 'http://127.0.0.1:8000/simulation/start?mode=MOCK'

# Switch to SUMO mode
curl -X POST 'http://127.0.0.1:8000/simulation/switch-mode?mode=SUMO'

# Stop the controller
curl -X POST http://127.0.0.1:8000/simulation/stop
```

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/` | API health message. |
| `GET` | `/live-status` | Current signal and traffic status. |
| `GET` | `/simulation/status` | Controller process status. |
| `GET` | `/simulation/current-mode` | Current source mode. |
| `POST` | `/simulation/start?mode=MOCK` | Start the controller. Accepts `MOCK`, `SUMO`, or `VIDEO`. |
| `POST` | `/simulation/switch-mode?mode=MOCK` | Restart the controller with another source mode. |
| `POST` | `/simulation/stop` | Stop the controller. |
| `POST` | `/simulation/flush-model` | Delete the saved Q-table. |
| `POST` | `/analysis/start` | Upload `north`, `south`, `east`, and `west` video files and start video analysis. |
| `GET` | `/analysis/status` | Controller status for analysis. |
| `WS` | `/ws/logs` | Stream controller log lines. |

The full request and response schemas are available in the interactive docs at `/docs`.

## Project structure

```text
.
├── backend/                 FastAPI app and controller process service
├── controller/
│   ├── analytics/           Traffic analysis, metrics, CSV logging, plotting
│   ├── core/                Signal phases and controller logic
│   ├── ml_models/           Q-learning agent
│   ├── config.py            Controller settings
│   ├── main.py              Controller cycle loop
│   └── source_selector.py   MOCK, SUMO, and VIDEO data sources
├── frontend/
│   ├── public/              Static app assets
│   └── src/                 React dashboard and components
├── simulation/              SUMO network, routes, and configuration
├── yolo/                    YOLO config and class names; weights are external/ignored
├── yolo_detection.py        OpenCV/YOLO detection helper
├── requirements.txt         Python dependencies
└── README.md
```

Runtime outputs such as uploaded videos, live status, metrics, plots, and the learned Q-table are generated locally.

## Roadmap

- Add automated setup and dependency checks for optional SUMO and YOLO modes.
- Make API and frontend addresses configurable instead of fixed to localhost.
- Add reproducible sample scenarios and documented performance evaluation.
- Expand automated integration coverage for mode switching and video input.

## Contributing

Contributions are welcome. Open an issue to discuss larger changes, then submit a pull request with a focused description. Keep changes scoped, update documentation when behavior or setup changes, and avoid committing generated files, uploaded videos, model weights, or secrets.

## License

Distributed under the MIT License. See [LICENSE](LICENSE) for details.

## Contact and acknowledgments

Maintainer: [Vishal Jatav](https://github.com/vishaljatav777). See the repository's Issues page for questions and bug reports.

Thanks to the maintainers of FastAPI, React, Eclipse SUMO, OpenCV, and the YOLO/Darknet project for the tools and resources used here.
