import json
import os
import tempfile

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

    # FIX #5: Atomic write — write to temp file then rename to avoid race condition
    # between controller writing and backend reading the same file simultaneously
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
        # Fallback: direct write if atomic write fails
        try:
            with open(file_path, "w") as f:
                json.dump(data, f)
        except Exception:
            pass
