import json
import os
import tempfile

# FIX #10: Read lane list from config instead of hardcoding
# This keeps lane_signals in sync if DIRECTIONS ever changes
try:
    from . import config as _cfg
except ImportError:
    import config as _cfg

_ALL_LANES = _cfg.DIRECTIONS

def write_live_status(active_side, vehicle_counts,
                      average_wait, throughput, peak_wait=0, efficiency=0,
                      phase="RED", remaining_time=0, detailed_stats=None,
                      next_direction=None, speeds=None):

    # ── Compute per-lane signal states ──────────────────────────────────────
    # active_side = currently GREEN/YELLOW lane (e.g. "N_J1")
    # All other lanes are RED (their videos should pause)
    lane_signals = {}
    for lane in _ALL_LANES:
        if lane == active_side:
            lane_signals[lane] = phase          # GREEN or YELLOW for the active lane
        else:
            lane_signals[lane] = "RED"          # All others are red → video paused

    data = {
        "current_direction": active_side,
        "next_direction": next_direction,
        "vehicle_counts": vehicle_counts,
        "average_wait": round(average_wait, 2),
        "throughput": throughput,
        "peak_wait": round(peak_wait, 2),
        "efficiency": efficiency,
        "phase": phase,
        "remaining_time": remaining_time,
        "detailed_stats": detailed_stats or {},
        "speeds": speeds or {},
        "lane_signals": lane_signals          # ← NEW: per-lane RED/GREEN/YELLOW
    }

    file_path = os.path.join(os.path.dirname(__file__), "live_status.json")

    # Atomic write — temp file then rename to avoid race condition
    dir_path = os.path.dirname(file_path)
    try:
        with tempfile.NamedTemporaryFile(
            mode="w",
            dir=dir_path,
            suffix=".tmp",
            delete=False
        ) as tmp_file:
            json.dump(data, tmp_file)
            tmp_path = tmp_file.name

        os.replace(tmp_path, file_path)  # Atomic on all platforms
    except Exception as e:
        print(f"[LiveStatus] Write error: {e}")
        try:
            with open(file_path, "w") as f:
                json.dump(data, f)
        except Exception:
            pass
