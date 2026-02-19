import traci

def apply_green(links, num_links, current_direction, tls_id):
    state = []

    for i in range(num_links):
        connection = links[i][0]
        from_lane = connection[0]
        from_edge = from_lane.rsplit("_", 1)[0]

        if from_edge == current_direction:
            state.append("G")
        else:
            state.append("r")

    green_state = "".join(state)
    traci.trafficlight.setRedYellowGreenState(tls_id, green_state)


def apply_yellow(links, num_links, current_direction, tls_id):
    state = []

    for i in range(num_links):
        connection = links[i][0]
        from_lane = connection[0]
        from_edge = from_lane.rsplit("_", 1)[0]

        if from_edge == current_direction:
            state.append("y")
        else:
            state.append("r")

    yellow_state = "".join(state)
    traci.trafficlight.setRedYellowGreenState(tls_id, yellow_state)
