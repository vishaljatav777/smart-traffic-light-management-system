class SharedState:
    active_side = None
    vehicle_counts = {}
    average_wait = 0
    throughput = 0

state = SharedState()
