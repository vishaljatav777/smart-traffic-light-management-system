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

_mock_emergency_active = False
_mock_emergency_ticks = 0
_mock_emergency_data = {}

def get_detailed_stats(directions):
    global _mock_emergency_active, _mock_emergency_ticks, _mock_emergency_data

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

    # If Not using SUMO, return empty stats or simulate mock emergencies
    if not config or config.DATA_SOURCE != "SUMO":
        import random
        
        if _mock_emergency_active:
            _mock_emergency_ticks -= 1
            if _mock_emergency_ticks <= 0:
                _mock_emergency_active = False
            else:
                stats["emergency_detected"] = True
                stats["emergency_direction"] = _mock_emergency_data["direction"]
                stats["emergency_type"] = _mock_emergency_data["type"]
                stats["types"]["emergency"] = 1
        else:
            # Simulate a 0.5% chance per tick of an emergency vehicle appearing
            if random.random() < 0.005:
                _mock_emergency_active = True
                _mock_emergency_ticks = 15 # persists for 15 seconds
                _mock_emergency_data = {
                    "direction": random.choice(directions),
                    "type": random.choice(["ambulance", "police", "firetruck"])
                }
                stats["emergency_detected"] = True
                stats["emergency_direction"] = _mock_emergency_data["direction"]
                stats["emergency_type"] = _mock_emergency_data["type"]
                stats["types"]["emergency"] = 1
                
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