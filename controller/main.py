import sys
import os
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import time
import argparse
import numpy as np
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

from source_selector import get_traffic_data

# =============================
# ENVIRONMENT OVERRIDES
# =============================
if os.environ.get("DATA_SOURCE"):
    config.DATA_SOURCE = os.environ.get("DATA_SOURCE")
    print(f"[DATA SOURCE OVERRIDE] {config.DATA_SOURCE}")

if os.environ.get("VIDEO_PATHS"):
    import json
    try:
        paths = json.loads(os.environ.get("VIDEO_PATHS"))
        config.VIDEO_PATHS.update(paths)
        print("[VIDEO PATHS CONFIGURED]")
    except Exception as e:
        print(f"Error loading video paths: {e}")

# =============================
# SUMO SETUP (Conditional)
# =============================
sumo_active = (config.DATA_SOURCE == "SUMO")

if sumo_active:
    # FIX #1 & #11: traci imported only when SUMO is actually needed
    try:
        import traci
    except ImportError:
        print("[SUMO] traci not installed. Falling back to MOCK mode.")
        sumo_active = False
        config.DATA_SOURCE = "MOCK"

if sumo_active:
    if 'SUMO_HOME' in os.environ:
        tools = os.path.join(os.environ['SUMO_HOME'], 'tools')
        sys.path.append(tools)
    else:
        print("[SUMO] SUMO_HOME not set. Falling back to MOCK mode.")
        sumo_active = False
        config.DATA_SOURCE = "MOCK"

parser = argparse.ArgumentParser()
parser.add_argument("--nogui", action="store_true", help="Run SUMO without a GUI")
parser.add_argument("--cycles", type=int, default=99999, help="Number of cycles to run")
args = parser.parse_args()

if sumo_active:
    # Use headless 'sumo' if --nogui is passed, otherwise 'sumo-gui'
    sumoBinaryName = "sumo" if args.nogui else "sumo-gui"

    # 🪟 Windows Binary Detection (using SUMO_HOME)
    sumo_home = os.environ.get('SUMO_HOME')
    sumoBinary = sumoBinaryName  # Default to filename

    if sumo_home:
        # Check standard bin directory
        bin_path = os.path.join(sumo_home, "bin", f"{sumoBinaryName}.exe")
        if os.path.exists(bin_path):
            sumoBinary = bin_path
            print(f"[SUMO] Found binary at: {sumoBinary}")
        else:
            print(f"[SUMO WARNING] Could not find {sumoBinaryName}.exe in {sumo_home}\\bin")

    config_path = os.path.abspath(os.path.join(BASE_DIR, "simulation", "run.sumocfg"))
    sumoCmd = [
        sumoBinary,
        "-c", config_path,
        "--step-length", "1.0",
        "--no-step-log", "true",
        "--waiting-time-memory", "1000",
        "--start", "true",        # 🚀 Start simulation automatically
        "--quit-on-end", "true",   # 🛑 Close when done
        "--no-warnings", "true"    # 🤫 Keep logs clean
    ]

    print(f"[SUMO STARTUP] Attempting to launch: {sumoBinary}")
    print(f"[SUMO CONFIG] {config_path}")

    connected = False
    max_retries = 3
    for attempt in range(max_retries):
        try:
            print(f"[SUMO] Connection attempt {attempt + 1}/{max_retries}...")
            traci.start(sumoCmd, label="default")
            connected = True
            print("[SUMO] TraCI Connected Successfully!")
            break
        except Exception as e:
            print(f"[SUMO ERROR] Attempt {attempt + 1} failed: {e}")
            print("[SUMO] Please ensure SUMO-GUI window opens. If it hangs, the port might be busy.")
            time.sleep(4)  # Wait longer for GUI initialization

    if not connected:
        print("[SUMO CRITICAL] Could not connect to SUMO. Falling back to MOCK mode.")
        sumo_active = False
        config.DATA_SOURCE = "MOCK"
        links = []
        num_links = 0
    else:
        try:
            # Verify junction ID exists in the network
            all_tls = traci.trafficlight.getIDList()
            if config.TLS_ID not in all_tls:
                print(f"[SUMO ERROR] Traffic Light ID '{config.TLS_ID}' not found in network!")
                print(f"[SUMO] Available IDs: {all_tls}")
                raise ValueError("Invalid TLS_ID")

            links = traci.trafficlight.getControlledLinks(config.TLS_ID)
            num_links = len(links)
            print(f"[SUMO] Controlled links for '{config.TLS_ID}': {num_links}")
        except Exception as e:
            print(f"[SUMO ERROR] Setup failed: {e}")
            try:
                traci.close()
            except Exception:
                pass
            sumo_active = False
            config.DATA_SOURCE = "MOCK"
            links = []
            num_links = 0
else:
    print(f"[Running in {config.DATA_SOURCE} Mode]")
    links = []
    num_links = 0

# =============================
# INITIALIZATION
# =============================
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
    # VEHICLE COUNT SOURCE (Unified)
    # =============================
    vehicle_counts, lane_speeds = get_traffic_data()
    detailed_stats = get_detailed_stats(config.DIRECTIONS)
    print(f"[Counts]:", vehicle_counts)

    # =============================
    # RL STATE
    # =============================
    state = agent.discretize(vehicle_counts)

    emergency_direction = detect_emergency_vehicle(config.DIRECTIONS)

    if emergency_direction:
        current_direction = emergency_direction
        action = config.DIRECTIONS.index(emergency_direction)
        print("[EMERGENCY OVERRIDE ACTIVE]")
    else:
        # FIX #6: Use Q-Learning agent's choose_action() instead of hard-coded Round-Robin
        action = agent.choose_action(state)

        # Skip empty lanes intelligently (max 3 attempts)
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
    if sumo_active:
        try:
            mean_speed = traci.edge.getLastStepMeanSpeed(current_direction)
            if mean_speed < 3.0:
                speed_factor = 1.3
            elif mean_speed > 8.0:
                speed_factor = 0.8
            else:
                speed_factor = 1.0
        except Exception:
            speed_factor = 1.0
    else:
        # Use lane speeds from source (MOCK/VIDEO provide speed data)
        raw_speed = lane_speeds.get(current_direction, 5.0)
        if raw_speed < 3.0:
            speed_factor = 1.3
        elif raw_speed > 8.0:
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
    if sumo_active:
        apply_green(links, num_links, current_direction, config.TLS_ID)

    red_times = calculate_cascading_red(
        current_direction,
        config.DIRECTIONS,
        green_time,
        config.YELLOW_TIME
    )

    print("\n" + "="*50)
    print(f"Cycle: {cycle} | Mode: {config.DATA_SOURCE} | Action: {'RL-Agent' if not emergency_direction else 'EMERGENCY'}")
    print(f"ACTIVE DIRECTION: {current_direction} (Green for {green_time}s)")
    print(f"NEXT DIRECTION: {next_direction}")
    print(f"Current Metrics: Avg Wait: {metrics.get_average_wait()}s | Total Thru: {metrics.get_throughput()}")
    print("="*50)

    # =============================
    # RUN GREEN PHASE
    # =============================
    for i in range(green_time):
        remaining = green_time - i

        # Refresh stats from unified source
        live_vehicle_counts, live_lane_speeds = get_traffic_data()
        current_stats = get_detailed_stats(config.DIRECTIONS)

        write_live_status(
            current_direction, live_vehicle_counts,
            metrics.get_average_wait(), metrics.get_throughput(),
            metrics.get_peak_wait(), metrics.get_efficiency_score(),
            "GREEN", remaining,
            detailed_stats=current_stats,
            next_direction=next_direction,
            speeds=live_lane_speeds
        )

        if sumo_active:
            traci.simulationStep()

        metrics.update()
        metrics.vehicle_arrived()
        apply_police_siren_effect()
        time.sleep(1)

    # =============================
    # APPLY YELLOW
    # =============================
    if sumo_active:
        apply_yellow(links, num_links, current_direction, config.TLS_ID)

    for i in range(config.YELLOW_TIME):
        remaining = config.YELLOW_TIME - i
        live_vehicle_counts, live_lane_speeds = get_traffic_data()
        current_stats = get_detailed_stats(config.DIRECTIONS)

        write_live_status(
            current_direction, live_vehicle_counts,
            metrics.get_average_wait(), metrics.get_throughput(),
            metrics.get_peak_wait(), metrics.get_efficiency_score(),
            "YELLOW", remaining,
            detailed_stats=current_stats,
            next_direction=next_direction,
            speeds=live_lane_speeds
        )

        if sumo_active:
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

    # FIX #2: Log each cycle to CSV so plot_metrics() has data
    csv_logger.log(
        cycle, current_direction, green_time, config.YELLOW_TIME,
        metrics.get_average_wait(), metrics.get_throughput()
    )

    cycle += 1


# =============================
# CLEANUP
# =============================
if sumo_active:
    traci.close()
agent.save_model()
plot_metrics()