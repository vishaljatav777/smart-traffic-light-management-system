# FIX #11: traci imported lazily inside functions only — safe in non-SUMO mode

def apply_green(links, num_links, current_direction, tls_id):
    import traci
    state = []

    for i in range(num_links):
        connection = links[i][0]
        from_lane = connection[0]
        from_edge = from_lane.rsplit("_", 1)[0]

        if from_edge == current_direction:
            state.append("G")
        else:
            state.append("r")

    if not state or not tls_id:
        return

    green_state = "".join(state)
    try:
        traci.trafficlight.setRedYellowGreenState(tls_id, green_state)
    except Exception as e:
        print(f"[TRACI ERROR] Failed to set green state: {e}")


def apply_yellow(links, num_links, current_direction, tls_id):
    import traci
    state = []

    for i in range(num_links):
        connection = links[i][0]
        from_lane = connection[0]
        from_edge = from_lane.rsplit("_", 1)[0]

        if from_edge == current_direction:
            state.append("y")
        else:
            state.append("r")

    if not state or not tls_id:
        return

    yellow_state = "".join(state)
    try:
        traci.trafficlight.setRedYellowGreenState(tls_id, yellow_state)
    except Exception as e:
        print(f"[TRACI ERROR] Failed to set yellow state: {e}")
