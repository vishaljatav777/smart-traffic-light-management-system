"""source_selector.py

Utility module to select the appropriate data source for traffic data (vehicle counts, speeds).
Supported sources:
- SUMO: uses TraCI to fetch live simulation data.
- CCTV: placeholder for future OpenCV + YOLO integration.
- VIDEO: processes uploaded video files using YOLO detection.
- MOCK: generates realistic random vehicle counts (used when no data source is available).

The module provides a single function `get_traffic_data()` that returns a tuple:
    (vehicle_counts: dict, speeds: dict)
where keys are lane identifiers (e.g., "N_J1") and values are counts or average speeds.
"""

import os
import cv2
import random
from typing import Tuple, Dict

# Import config to know which source is selected
try:
    from . import config
except ImportError:
    import config

# Cache for VideoCapture objects and last frames
_video_captures = {}

def _get_sumo_data() -> Tuple[Dict[str, int], Dict[str, float]]:
    try:
        import traci
    except ImportError:
        raise RuntimeError("TraCI library not found. Ensure SUMO is installed and SUMO_HOME is set.")
    vehicle_counts = {}
    speeds = {}
    for edge in config.DIRECTIONS:
        try:
            # Use traci.edge for more accurate incoming counts
            vehicle_counts[edge] = traci.edge.getLastStepVehicleNumber(edge)
            speeds[edge] = traci.edge.getLastStepMeanSpeed(edge)
        except Exception as e:
            # Fallback to zero if edge not found
            vehicle_counts[edge] = 0
            speeds[edge] = 0.0
    return vehicle_counts, speeds

def _get_cctv_data() -> Tuple[Dict[str, int], Dict[str, float]]:
    # Future implementation: capture frame from camera, run YOLO detection
    return {}, {}

# ---------------------------------------------------------------------------
# MOCK DATA SOURCE — Realistic random counts so the agent always has data
# ---------------------------------------------------------------------------
# FIX #8: Use config.DIRECTIONS so mock data always matches the configured lanes
_mock_counts = {lane: random.randint(3, 12) for lane in config.DIRECTIONS}

def _get_mock_data() -> Tuple[Dict[str, int], Dict[str, float]]:
    """Simulate realistic traffic data with gradual random drift per cycle."""
    vehicle_counts = {}
    speeds = {}
    for lane in config.DIRECTIONS:
        # Drift the count ±1 to ±3 each cycle, clamped between 0 and 25
        drift = random.randint(-3, 3)
        _mock_counts[lane] = max(0, min(25, _mock_counts.get(lane, 5) + drift))
        vehicle_counts[lane] = _mock_counts[lane]
        # Speed inversely proportional to congestion
        speeds[lane] = max(2.0, 15.0 - vehicle_counts[lane] * 0.5)

    print(f"[MOCK DATA] Counts: { {k: v for k, v in vehicle_counts.items()} }")
    return vehicle_counts, speeds

def _get_video_data() -> Tuple[Dict[str, int], Dict[str, float]]:
    """Process one frame from each video, display them in a 2x2 grid, and return counts via YOLO."""
    from yolo_detection import detect_vehicles
    import numpy as np
    
    vehicle_counts = {}
    speeds = {}
    processed_frames = []
    
    # We expect 4 directions: N_J1, S_J1, E_J1, W_J1
    for lane in config.DIRECTIONS:
        video_path = config.VIDEO_PATHS.get(lane)
        if not video_path or not os.path.exists(video_path):
            vehicle_counts[lane] = 0
            speeds[lane] = 0.0
            # Placeholder black frame if video missing
            blank_frame = np.zeros((300, 400, 3), dtype=np.uint8)
            cv2.putText(blank_frame, f"MISSING: {lane}", (50, 150), cv2.FONT_HERSHEY_SIMPLEX, 1, (0,0,255), 2)
            processed_frames.append(blank_frame)
            continue
            
        if lane not in _video_captures:
            _video_captures[lane] = cv2.VideoCapture(video_path)
            
        cap = _video_captures[lane]
        ret, frame = cap.read()
        
        # Reset if video ends
        if not ret:
            cap.set(cv2.CAP_PROP_POS_FRAMES, 0)
            ret, frame = cap.read()
            
        if ret:
            # Resize frame for the grid (e.g., 400x300 for each quadrant)
            display_frame = cv2.resize(frame, (400, 300))
            
            # Detect vehicles and DRAW BOXES
            count = detect_vehicles(display_frame, draw_boxes=True, lane_mode=True)
            
            # Add Lane Label overlay
            cv2.putText(display_frame, f"LANE: {lane} | COUNT: {count}", (10, 30), 
                        cv2.FONT_HERSHEY_SIMPLEX, 0.7, (255, 255, 255), 2)
            
            processed_frames.append(display_frame)
            vehicle_counts[lane] = count
            speeds[lane] = 5.0 if count > 0 else 0.0
        else:
            vehicle_counts[lane] = 0
            speeds[lane] = 0.0
            processed_frames.append(np.zeros((300, 400, 3), dtype=np.uint8))
            
    # Combine frames into a 2x2 grid if we have 4 frames
    if len(processed_frames) == 4:
        top_row = np.hstack((processed_frames[0], processed_frames[1])) # N, S
        bottom_row = np.hstack((processed_frames[2], processed_frames[3])) # E, W
        grid = np.vstack((top_row, bottom_row))
        
        cv2.imshow("Smart Traffic Analysis - 4-Way Real-time Detection", grid)
        cv2.waitKey(1) # Necessary for the window to update
            
    return vehicle_counts, speeds

def get_traffic_data() -> Tuple[Dict[str, int], Dict[str, float]]:
    """Return vehicle counts and speeds based on the selected DATA_SOURCE."""
    source = getattr(config, "DATA_SOURCE", "MOCK")
    if source == "SUMO":
        return _get_sumo_data()
    elif source == "CCTV":
        return _get_cctv_data()
    elif source == "VIDEO":
        # If VIDEO_PATHS are all None, fall back to MOCK automatically
        has_videos = any(
            p and os.path.exists(p)
            for p in config.VIDEO_PATHS.values()
        )
        if not has_videos:
            print("[WARNING] VIDEO mode selected but no valid video paths found. Falling back to MOCK.")
            return _get_mock_data()
        return _get_video_data()
    elif source == "MOCK":
        return _get_mock_data()
    else:
        raise ValueError(f"Unsupported DATA_SOURCE: {source}")
