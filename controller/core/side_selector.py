def select_side(vehicle_counts, waiting_cycles, threshold):
    # Check starvation
    for d in vehicle_counts:
        if waiting_cycles[d] >= threshold:
            return d

    # Otherwise choose max vehicle side
    return max(vehicle_counts, key=vehicle_counts.get)
