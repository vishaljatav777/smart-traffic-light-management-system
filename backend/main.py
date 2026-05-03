# =============================
# PATH FIX (VERY IMPORTANT)
# =============================
import sys
import os
import time

# Absolute path to the current directory (backend) and project root
BACKEND_DIR = os.path.dirname(os.path.abspath(__file__))
BASE_DIR = os.path.dirname(BACKEND_DIR)

# Add both to sys.path to ensure all modules are discoverable
if BACKEND_DIR not in sys.path:
    sys.path.append(BACKEND_DIR)
if BASE_DIR not in sys.path:
    sys.path.append(BASE_DIR)

# =============================
# IMPORTS
# =============================
from fastapi import FastAPI, Query, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
import json

from traffic_service import TrafficService

# =============================
# APP INITIALIZATION
# =============================
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

CONTROLLER_STATUS_FILE = os.path.join(BASE_DIR, "controller", "live_status.json")

# Singleton service handling the SUMO controller subprocess
traffic_service = TrafficService()

# =============================
# SIMULATION CONTROL
# =============================
@app.post("/simulation/start")
def start_simulation(nogui: bool = Query(default=True, description="Run SUMO without GUI")):
    return traffic_service.start_simulation(nogui=nogui)

@app.post("/simulation/stop")
def stop_simulation():
    return traffic_service.stop_simulation()

@app.get("/simulation/status")
def simulation_status():
    return traffic_service.get_status()

# =============================
# LIVE STATUS (Traffic Light + Timer)
# =============================
@app.get("/live-status")
def live_status():
    try:
        if os.path.exists(CONTROLLER_STATUS_FILE):
            with open(CONTROLLER_STATUS_FILE, "r") as f:
                data = json.load(f)
            return data
        else:
            return {
                "current_direction": None,
                "phase": "RED",
                "remaining_time": 0
            }
    except Exception as e:
        print("Live status error:", e)
        return {
            "current_direction": None,
            "phase": "RED",
            "remaining_time": 0
        }

# =============================
# ROOT
# =============================
@app.get("/")
def root():
    return {"message": "Smart Traffic Management API Running"}
# =============================
# ANALYSIS ENGINE CONTROL
# =============================
@app.post("/analysis/start")
async def start_analysis(
    north: UploadFile = File(...),
    south: UploadFile = File(...),
    east: UploadFile = File(...),
    west: UploadFile = File(...)
):
    upload_dir = os.path.join(BASE_DIR, "uploads")
    os.makedirs(upload_dir, exist_ok=True)
    
    # Map frontend labels to config direction IDs
    direction_map = {
        "N_J1": north,
        "S_J1": south,
        "E_J1": east,
        "W_J1": west
    }
    
    video_paths = {}
    
    for dir_id, file in direction_map.items():
        timestamp = int(time.time())
        file_path = os.path.join(upload_dir, f"{dir_id}_{timestamp}_{file.filename}")
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        video_paths[dir_id] = file_path
    
    # 🛑 Stop existing simulation if running
    traffic_service.stop_simulation()
    
    # 🚀 Start simulation in VIDEO mode (GUI enabled for visualization)
    result = traffic_service.start_simulation(
        nogui=False, 
        data_source="VIDEO", 
        video_paths=video_paths
    )
    
    return {
        "status": "success",
        "message": "Deep RL Analysis Engine Initialized with 4-Way Footage.",
        "engine_status": result,
        "uploaded_files": [os.path.basename(p) for p in video_paths.values()]
    }

@app.get("/analysis/status")
def analysis_status():
    return traffic_service.get_status()

# =============================
# DATA SOURCE SWITCHER
# =============================
# Tracks what mode the controller is currently running in
_current_mode = {"source": "MOCK"}

@app.get("/simulation/current-mode")
def get_current_mode():
    """Returns which data source the controller is currently using."""
    return {"mode": _current_mode["source"]}

@app.post("/simulation/switch-mode")
def switch_mode(mode: str = Query(..., description="Target mode: MOCK, SUMO, or VIDEO")):
    """
    Stop the current controller and restart it with the selected data source.
    Supported modes: MOCK | SUMO | VIDEO
    - SUMO: launches with GUI (nogui=False) so SUMO-GUI window opens automatically
    - MOCK / VIDEO: headless (nogui=True), no GUI needed
    """
    mode = mode.upper()
    if mode not in ("MOCK", "SUMO", "VIDEO"):
        return {"status": "error", "message": f"Unknown mode '{mode}'. Use MOCK, SUMO, or VIDEO."}

    # Stop whatever is currently running
    traffic_service.stop_simulation()

    # SUMO needs GUI open so SUMO-GUI window appears — use nogui=False
    # MOCK and VIDEO are headless — no window needed
    use_gui = (mode == "SUMO")

    result = traffic_service.start_simulation(nogui=not use_gui, data_source=mode)
    _current_mode["source"] = mode

    return {
        "status": "switched",
        "mode": mode,
        "gui": use_gui,
        "controller": result
    }

