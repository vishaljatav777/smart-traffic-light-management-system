
import json
import os

def write_live_status(active_side, vehicle_counts,
                      average_wait, throughput):

    data = {
        "active_side": active_side,
        "vehicle_counts": vehicle_counts,
        "average_wait": round(average_wait, 2),
        "throughput": throughput
    }

    file_path = os.path.join(os.path.dirname(__file__), "live_status.json")

    with open(file_path, "w") as f:
        json.dump(data, f)
