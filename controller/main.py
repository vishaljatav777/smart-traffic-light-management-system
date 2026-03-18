import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import shutil
import time
import argparse
import numpy as np
import traci
import config

from analytics.traffic_analyzer import (
    get_detailed_stats,
    detect_emergency_vehicle,
    apply_police_siren_effect
)
from analytics.metrics import TrafficMetrics
from analytics.csv_logger import CSVLogger
from analytics.plot_metrics import plot_metrics

from core.phase_manager import calculate_cascading_red
from core.signal_controller import apply_green, apply_yellow

from live_status_writer import write_live_status
from ml_models.q_learning_agent import QLearningAgent

# =============================
# PATHS
# =============================
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# =============================
# SUMO SETUP
# =============================
if 'SUMO_HOME' in os.environ:
    tools = os.path.join(os.environ['SUMO_HOME'], 'tools')
    sys.path.append(tools)
else:
    sys.exit("Please declare SUMO_HOME")

parser = argparse.ArgumentParser()
parser.add_argument("--nogui", action="store_true", help="Run SUMO without a GUI")
parser.add_argument("--cycles", type=int, default=99999, help="Number of cycles to run")
args = parser.parse_args()

# Use headless 'sumo' if --nogui is passed, otherwise 'sumo-gui'
sumoBinary = "sumo" if args.nogui else "sumo-gui" 
sumoCmd = [
    sumoBinary, 
    "-c", os.path.join(BASE_DIR, "simulation", "run.sumocfg"),
    "--step-length", "0.7"
]

try:
    traci.start(sumoCmd)
except traci.exceptions.FatalTraCIError as e:
    print(f"Failed to connect to SUMO TraCI: {e}")
    sys.exit(1)


# =============================
# INITIALIZATION
# =============================
links = traci.trafficlight.getControlledLinks(config.TLS_ID)
num_links = len(links)

metrics = TrafficMetrics()
csv_logger = CSVLogger()

agent = QLearningAgent()
agent.load_model()

previous_state = None
previous_action = None
cycle = 0


# =============================
# MAIN CONTROL LOOP
# =============================
while cycle < args.cycles:

    # =============================
    # VEHICLE COUNT SOURCE (SUMO ONLY)
    # =============================
    detailed_stats = get_detailed_stats(config.DIRECTIONS)
    vehicle_counts = {d: traci.edge.getLastStepVehicleNumber(d) for d in config.DIRECTIONS}
    print("🟢 SUMO Counts:", vehicle_counts)

    # =============================
    # RL STATE
    # =============================
    state = agent.discretize(vehicle_counts)

    emergency_direction = detect_emergency_vehicle(config.DIRECTIONS)

    if emergency_direction:
        current_direction = emergency_direction
        action = config.DIRECTIONS.index(emergency_direction)
        print("🚨 EMERGENCY OVERRIDE ACTIVE")
    else:
        # Strict Round-Robin Sequence
        if previous_action is None:
            action = 0
        else:
            action = (previous_action + 1) % len(config.DIRECTIONS)
            
            # Skip empty lanes intelligently 
            attempts = 0
            while vehicle_counts.get(config.DIRECTIONS[action], 0) == 0 and attempts < 3:
                action = (action + 1) % len(config.DIRECTIONS)
                attempts += 1
        
        current_direction = config.DIRECTIONS[action]

    # Predict Next Direction
    next_action = (action + 1) % len(config.DIRECTIONS)
    attempts_next = 0
    while vehicle_counts.get(config.DIRECTIONS[next_action], 0) == 0 and attempts_next < 3:
        next_action = (next_action + 1) % len(config.DIRECTIONS)
        attempts_next += 1

    next_direction = config.DIRECTIONS[next_action]

    vehicle_count = vehicle_counts.get(current_direction, 0)
    
    # Speed Analysis factor
    mean_speed = traci.edge.getLastStepMeanSpeed(current_direction)
    # Provide more time for highly congested slow lanes
    if mean_speed < 3.0:
        speed_factor = 1.3
    elif mean_speed > 8.0:
        speed_factor = 0.8
    else:
        speed_factor = 1.0

    # =============================
    # GREEN TIME CALCULATION
    # =============================
    if emergency_direction:
        green_time = config.MAX_GREEN
    else:
        green_time = min(
            max(int(vehicle_count * 2 * speed_factor), config.MIN_GREEN),
            config.MAX_GREEN
        )

    # =============================
    # APPLY GREEN
    # =============================
    apply_green(links, num_links, current_direction, config.TLS_ID)

    red_times = calculate_cascading_red(
        current_direction,
        config.DIRECTIONS,
        green_time,
        config.YELLOW_TIME
    )

    print("\n===================================================")
    print(f"Cycle: {cycle}")
    print(f"🟢 ACTIVE SIDE: {current_direction}")
    print(f"Vehicles: {vehicle_count}")
    print(f"Green: {green_time}s | Yellow: {config.YELLOW_TIME}s")
    print("===================================================")

    # =============================
    # RUN GREEN PHASE
    # =============================
    for i in range(green_time):
        remaining = green_time - i
        # Refresh stats during the loop to catch new arrivals
        current_stats = get_detailed_stats(config.DIRECTIONS)
        live_vehicle_counts = {d: traci.edge.getLastStepVehicleNumber(d) for d in config.DIRECTIONS}
        live_lane_speeds = {d: traci.edge.getLastStepMeanSpeed(d) for d in config.DIRECTIONS}
        
        write_live_status(
            current_direction, live_vehicle_counts,
            metrics.get_average_wait(), metrics.get_throughput(),
            metrics.get_peak_wait(), metrics.get_efficiency_score(),
            "GREEN", remaining,
            detailed_stats=current_stats,
            next_direction=next_direction,
            speeds=live_lane_speeds
        )
        traci.simulationStep()
        metrics.update()
        metrics.vehicle_arrived()
        apply_police_siren_effect()
        time.sleep(1)

    # =============================
    # APPLY YELLOW
    # =============================
    apply_yellow(links, num_links, current_direction, config.TLS_ID)

    for i in range(config.YELLOW_TIME):
        remaining = config.YELLOW_TIME - i
        current_stats = get_detailed_stats(config.DIRECTIONS)
        live_vehicle_counts = {d: traci.edge.getLastStepVehicleNumber(d) for d in config.DIRECTIONS}
        live_lane_speeds = {d: traci.edge.getLastStepMeanSpeed(d) for d in config.DIRECTIONS}
        
        write_live_status(
            current_direction, live_vehicle_counts,
            metrics.get_average_wait(), metrics.get_throughput(),
            metrics.get_peak_wait(), metrics.get_efficiency_score(),
            "YELLOW", remaining,
            detailed_stats=current_stats,
            next_direction=next_direction,
            speeds=live_lane_speeds
        )
        traci.simulationStep()
        metrics.update()
        metrics.vehicle_arrived()
        apply_police_siren_effect()
        time.sleep(1)

    # =============================
    # RL UPDATE
    # =============================
    next_state = agent.discretize(vehicle_counts)
    reward = -metrics.get_average_wait()

    if previous_state is not None:
        agent.update(previous_state, previous_action, reward, next_state)

    previous_state = state
    previous_action = action

    cycle += 1


# =============================
# CLEANUP
# =============================
traci.close()
agent.save_model()
plot_metrics()