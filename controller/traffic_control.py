import traci
import os
import sys

# =============================
# SUMO SETUP
# =============================
if 'SUMO_HOME' in os.environ:
    tools = os.path.join(os.environ['SUMO_HOME'], 'tools')
    sys.path.append(tools)
else:
    sys.exit("Please declare environment variable 'SUMO_HOME'")

sumoBinary = "sumo-gui"
sumoCmd = [sumoBinary, "-c", "../simulation/run.sumocfg"]

traci.start(sumoCmd)

# =============================
# PARAMETERS
# =============================
min_green = 8
max_green = 40
yellow_time = 10
cycle = 0

# =============================
# GET SIGNAL LINKS
# =============================
links = traci.trafficlight.getControlledLinks("J1")
num_links = len(links)

directions = ["N_J1", "E_J1", "S_J1", "W_J1"]

green_times = {
    "N_J1": 0,
    "E_J1": 0,
    "S_J1": 0,
    "W_J1": 0
}

print("Total Signal Links:", num_links)

# =============================
# MAIN LOOP
# =============================
while cycle < 50:

    current_direction = directions[cycle % 4]

    # Count vehicles on active side
    vehicle_count = traci.edge.getLastStepVehicleNumber(current_direction)

    # Adaptive green time
    green_time = min(max(vehicle_count * 2, min_green), max_green)
    green_times[current_direction] = green_time

    # =============================
    # GREEN PHASE (FULLY OPEN SIDE)
    # =============================
    state = []

    for i in range(num_links):
        connection = links[i][0]
        from_lane = connection[0]
        from_edge = from_lane.rsplit("_", 1)[0]

        if from_edge == current_direction:
            state.append("G")   # LEFT + STRAIGHT + RIGHT open
        else:
            state.append("r")   # Other 3 sides fully STOP

    green_state = "".join(state)
    traci.trafficlight.setRedYellowGreenState("J1", green_state)

    # =============================
    # PRINT OUTPUT
    # =============================
    cycle_time = 0
    for d in directions:
        cycle_time += green_times[d] + yellow_time

    print("\n===================================================")
    print(f"Cycle {cycle}")
    print(f"🟢 OPEN SIDE: {current_direction}")
    print("   Movements Allowed: LEFT | STRAIGHT | RIGHT")
    print(f"   Vehicles on this side: {vehicle_count}")
    print(f"   Green Time: {green_time}s")
    print(f"   Yellow Time: {yellow_time}s")

    for d in directions:
        if d != current_direction:
            red_time = cycle_time - (green_times[d] + yellow_time)
            print(f"🔴 CLOSED SIDE: {d}  |  RED Time: {red_time}s")


    print("===================================================")

    # Run GREEN
    for _ in range(green_time):
        traci.simulationStep()

    # =============================
    # YELLOW PHASE
    # =============================
    yellow_state = []

    for i in range(num_links):
        connection = links[i][0]
        from_lane = connection[0]
        from_edge = from_lane.rsplit("_", 1)[0]

        if from_edge == current_direction:
            yellow_state.append("y")
        else:
            yellow_state.append("r")

    yellow_state = "".join(yellow_state)
    traci.trafficlight.setRedYellowGreenState("J1", yellow_state)

    for _ in range(yellow_time):
        traci.simulationStep()

    cycle += 1

traci.close()
