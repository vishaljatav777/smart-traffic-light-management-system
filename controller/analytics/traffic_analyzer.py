import traci

def get_vehicle_counts(directions):
    counts = {}
    for d in directions:
        counts[d] = traci.edge.getLastStepVehicleNumber(d)
    return counts
