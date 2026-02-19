def calculate_cascading_red(current_direction, directions, green_time, yellow_time):
    base_time = green_time + yellow_time
    red_times = {}

    current_index = directions.index(current_direction)
    cumulative = base_time

    for i in range(1, len(directions)):
        next_index = (current_index + i) % len(directions)
        side = directions[next_index]

        red_times[side] = cumulative
        cumulative += base_time

    return red_times
