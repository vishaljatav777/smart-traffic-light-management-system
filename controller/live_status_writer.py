import json
import os

def write_live_status(active_side, vehicle_counts,
                      average_wait, throughput, peak_wait=0, efficiency=0,
                      phase="RED", remaining_time=0, detailed_stats=None,
                      next_direction=None, speeds=None):

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
        "speeds": speeds or {}
    }

    file_path = os.path.join(os.path.dirname(__file__), "live_status.json")

    with open(file_path, "w") as f:
        json.dump(data, f)
