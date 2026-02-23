import traci

def get_vehicle_counts(directions):
    counts = {}
    for d in directions:
        counts[d] = traci.edge.getLastStepVehicleNumber(d)
    return counts

def detect_emergency_vehicle(directions):
    import traci

    for d in directions:
        vehicle_ids = traci.edge.getLastStepVehicleIDs(d)

        for vid in vehicle_ids:
            if traci.vehicle.getTypeID(vid) == "emergency":
                return d

    return None

def apply_police_siren_effect():
    import traci

    vehicle_ids = traci.vehicle.getIDList()

    for vid in vehicle_ids:
        if traci.vehicle.getTypeID(vid) == "police":

            # Alternate color based on simulation time
            sim_time = int(traci.simulation.getTime())

            if sim_time % 2 == 0:
                traci.vehicle.setColor(vid, (0, 0, 255))  # Blue
            else:
                traci.vehicle.setColor(vid, (255, 0, 0))  # Red