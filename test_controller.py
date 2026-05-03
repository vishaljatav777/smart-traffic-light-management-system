import os
import sys
import json
import subprocess

# Set up environment for the test
BASE_DIR = r"c:\Users\visha\Desktop\Traffic Ligth Management System\Smart Traffice light Managment"
env = os.environ.copy()
env["DATA_SOURCE"] = "VIDEO"

# Fake video paths (just to see if it starts)
# Use the same file for all if it exists
video_file = os.path.join(BASE_DIR, "yolo", "traffic.mp4") # Check if this exists
if os.path.exists(video_file):
    video_paths = {
        "N_J1": video_file,
        "S_J1": video_file,
        "E_J1": video_file,
        "W_J1": video_file
    }
    env["VIDEO_PATHS"] = json.dumps(video_paths)
else:
    print("Warning: yolo/traffic.mp4 not found. Testing with empty paths.")

cmd = [sys.executable, os.path.join(BASE_DIR, "controller", "main.py")]

print(f"Starting controller: {cmd}")
process = subprocess.Popen(cmd, cwd=os.path.join(BASE_DIR, "controller"), env=env, stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True)

# Read output for a few seconds
import time
start_time = time.time()
while time.time() - start_time < 10:
    line = process.stdout.readline()
    if line:
        print(f"CONTROLLER: {line.strip()}")
    if process.poll() is not None:
        print(f"Controller exited with code {process.returncode}")
        break

if process.poll() is None:
    process.terminate()
    print("Controller still running, terminated test.")
