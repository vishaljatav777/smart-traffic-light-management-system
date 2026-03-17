# =============================
# PATH FIX (VERY IMPORTANT)
# =============================
import sys
import os

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.append(BASE_DIR)

# =============================
# IMPORTS
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import json

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