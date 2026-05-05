import os
import sys

# Import config to check DATA_SOURCE
try:
    from . import config
except ImportError:
    try:
        import config
    except ImportError:
        config = None

class TrafficMetrics:

    def __init__(self):
        self.total_waiting_time = 0
        self.total_vehicles = 0
        self.completed_vehicles = 0
        self.peak_waiting_time = 0

    def _traci_safe(self):
        if not config or config.DATA_SOURCE != "SUMO":
            return False
        import traci
        try:
            traci.getLabel()
            return True
        except Exception:
            return False

    def update(self, vehicle_counts=None):
        if not self._traci_safe():
            # MOCK MODE SIMULATION
            if vehicle_counts:
                # Calculate mock waiting time based on number of vehicles waiting (counts > 0)
                waiting_vehicles = sum(count for count in vehicle_counts.values())
                self.total_waiting_time += waiting_vehicles
                self.total_vehicles = max(1, waiting_vehicles)  # Avoid division by zero
                # Update peak wait
                simulated_peak = int(waiting_vehicles * 1.5)
                if simulated_peak > self.peak_waiting_time:
                    self.peak_waiting_time = simulated_peak
            return

        import traci
        try:
            vehicle_ids = traci.vehicle.getIDList()
            current_step_wait = 0
            
            for vid in vehicle_ids:
                if traci.vehicle.getSpeed(vid) < 0.1:
                    current_step_wait += 1
                    
                v_wait = traci.vehicle.getWaitingTime(vid)
                if v_wait > self.peak_waiting_time:
                    self.peak_waiting_time = v_wait

            self.total_waiting_time += current_step_wait
            self.total_vehicles = len(vehicle_ids)
        except Exception:
            pass

    def vehicle_arrived(self):
        if not self._traci_safe():
            # MOCK MODE SIMULATION
            import random
            if random.random() < 0.3: # 30% chance a vehicle arrives per second (simulates throughput)
                self.completed_vehicles += 1
            return

        import traci
        try:
            arrived = traci.simulation.getArrivedNumber()
            self.completed_vehicles += arrived
        except Exception:
            pass

    def get_average_wait(self):
        if not self._traci_safe():
            if self.total_vehicles == 0:
                return 0
            # MOCK MODE SIMULATION
            return round((self.total_waiting_time / self.total_vehicles) * 0.5, 2)
            
        import traci
        try:
            vids = traci.vehicle.getIDList()
            if not vids: return 0
            avg = sum(traci.vehicle.getWaitingTime(v) for v in vids) / len(vids)
            return round(avg, 2)
        except Exception:
            return 0

    def get_throughput(self):
        return self.completed_vehicles

    def get_peak_wait(self):
        return self.peak_waiting_time

    def get_efficiency_score(self):
        if not self._traci_safe():
            # MOCK MODE SIMULATION:
            # Efficiency drops if average wait is high. Max 100%.
            avg_wait = self.get_average_wait()
            score = max(0.0, 100.0 - (avg_wait * 1.5))
            return round(score, 1)
            
        import traci
        try:
            vids = traci.vehicle.getIDList()
            if not vids: return 100.0
            
            moving = sum(1 for v in vids if traci.vehicle.getSpeed(v) > 5)
            score = (moving / len(vids)) * 100
            return round(score, 1)
        except Exception:
            return 100.0
