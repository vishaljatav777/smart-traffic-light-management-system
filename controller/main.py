import traci
import os
import sys
import config

from analytics.traffic_analyzer import get_vehicle_counts
from analytics.metrics import TrafficMetrics
from core.side_selector import select_side
from core.phase_manager import calculate_cascading_red
from core.signal_controller import apply_green, apply_yellow
from analytics.csv_logger import CSVLogger


# =============================
# SUMO SETUP
# =============================
if 'SUMO_HOME' in os.environ:
    tools = os.path.join(os.environ['SUMO_HOME'], 'tools')
    sys.path.append(tools)
else:
    sys.exit("Please declare SUMO_HOME")

sumoBinary = "sumo-gui"
sumoCmd = [sumoBinary, "-c", "../simulation/run.sumocfg"]

traci.start(sumoCmd)

# =============================
# INITIALIZATION
# =============================
links = traci.trafficlight.getControlledLinks(config.TLS_ID)
num_links = len(links)

waiting_cycles = {d: 0 for d in config.DIRECTIONS}

metrics = TrafficMetrics()
csv_logger = CSVLogger()

cycle = 0

# =============================
# MAIN CONTROL LOOP
# =============================
while cycle < 50:

    # 1️⃣ Get vehicle counts
    vehicle_counts = get_vehicle_counts(config.DIRECTIONS)

    # 2️⃣ Select side intelligently (starvation + max vehicle)
    current_direction = select_side(
        vehicle_counts,
        waiting_cycles,
        config.STARVATION_THRESHOLD
    )

    vehicle_count = vehicle_counts[current_direction]

    # 3️⃣ Adaptive green time
    green_time = min(
        max(vehicle_count * 2, config.MIN_GREEN),
        config.MAX_GREEN
    )

    # 4️⃣ Update waiting counters
    for d in config.DIRECTIONS:
        if d == current_direction:
            waiting_cycles[d] = 0
        else:
            waiting_cycles[d] += 1

    # 5️⃣ Apply GREEN phase
    apply_green(links, num_links, current_direction, config.TLS_ID)

    # 6️⃣ Cascading red calculation
    red_times = calculate_cascading_red(
        current_direction,
        config.DIRECTIONS,
        green_time,
        config.YELLOW_TIME
    )

    # =============================
    # PRINT STATUS
    # =============================
    print("\n===================================================")
    print(f"Cycle: {cycle}")
    print(f"🟢 ACTIVE SIDE: {current_direction}")
    print(f"Vehicles on active side: {vehicle_count}")
    print(f"Green: {green_time}s | Yellow: {config.YELLOW_TIME}s")

    print("\nMovement Status:")
    print(f"{current_direction} → LEFT | STRAIGHT | RIGHT = OPEN")

    for side in red_times:
        print(f"{side} → LEFT | STRAIGHT | RIGHT = STOP ({red_times[side]}s)")

    # Print performance metrics
    print("\n📊 PERFORMANCE METRICS")
    print(f"Average Waiting Time: {metrics.get_average_wait():.2f}s")
    print(f"Throughput: {metrics.get_throughput()} vehicles")

    csv_logger.log(
        cycle,
        current_direction,
        green_time,
        config.YELLOW_TIME,
        metrics.get_average_wait(),
        metrics.get_throughput()
    )


    print("===================================================")

    # =============================
    # RUN GREEN PHASE
    # =============================
    for _ in range(green_time):
        traci.simulationStep()
        metrics.update()
        metrics.vehicle_arrived()

    # =============================
    # APPLY YELLOW PHASE
    # =============================
    apply_yellow(links, num_links, current_direction, config.TLS_ID)

    for _ in range(config.YELLOW_TIME):
        traci.simulationStep()
        metrics.update()
        metrics.vehicle_arrived()

    cycle += 1

traci.close()
