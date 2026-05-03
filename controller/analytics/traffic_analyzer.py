import os
import sys

# Import config to check DATA_SOURCE
try:
    from . import config
except ImportError:
    try:
        import config
    except ImportError:
        config = None

def get_detailed_stats(directions):
    stats = {
        "emergency_detected": False,
        "emergency_direction": None,
        "emergency_type": None,
        "types": {
            "car": 0,
            "bus": 0,
            "truck": 0,
            "ambulance": 0,
            "emergency": 0,
            "police": 0
        }
    }

    # If Not using SUMO, return empty stats (YOLO handles counts separately)
    if not config or config.DATA_SOURCE != "SUMO":
        return stats

    import traci
    # Check if TraCI is connected before proceeding
    try:
        traci.getLabel() # Simple call to check connection
    except Exception:
        return stats

    emergency_types = ["emergency", "ambulance", "police"]

    for d in directions:
        try:
            vehicle_ids = traci.edge.getLastStepVehicleIDs(d)
            for vid in vehicle_ids:
                vtype = traci.vehicle.getTypeID(vid).lower()
                
                # Count standard types
                if vtype in stats["types"]:
                    stats["types"][vtype] += 1
                else:
                    stats["types"]["car"] += 1 # Default to car
                
                # Emergency Detection
                if vtype in emergency_types and not stats["emergency_detected"]:
                    stats["emergency_detected"] = True
                    stats["emergency_direction"] = d
                    stats["emergency_type"] = vtype
        except Exception:
            continue

    return stats

def detect_emergency_vehicle(directions):
    stats = get_detailed_stats(directions)
    return stats["emergency_direction"]

def apply_police_siren_effect():
    if not config or config.DATA_SOURCE != "SUMO":
        return

    import traci
    try:
        vehicle_ids = traci.vehicle.getIDList()
        for vid in vehicle_ids:
            if traci.vehicle.getTypeID(vid) == "police":
                sim_time = int(traci.simulation.getTime())
                if sim_time % 2 == 0:
                    traci.vehicle.setColor(vid, (0, 0, 255))  # Blue
                else:
                    traci.vehicle.setColor(vid, (255, 0, 0))  # Red
    except Exception:
        pass