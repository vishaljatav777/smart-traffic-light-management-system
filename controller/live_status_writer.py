
import json
import os

def write_live_status(active_side, vehicle_counts,
                      average_wait, throughput, peak_wait=0, efficiency=0,
                      phase="RED", remaining_time=0, detailed_stats=None):

    data = {
        "current_direction": active_side,
        "vehicle_counts": vehicle_counts,
        "average_wait": round(average_wait, 2),
        "throughput": throughput,
        "peak_wait": round(peak_wait, 2),
        "efficiency": efficiency,
        "phase": phase,
        "remaining_time": remaining_time,
        "detailed_stats": detailed_stats or {}
    }

    file_path = os.path.join(os.path.dirname(__file__), "live_status.json")

    with open(file_path, "w") as f:
        json.dump(data, f)
