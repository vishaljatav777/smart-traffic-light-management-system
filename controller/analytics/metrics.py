import traci

class TrafficMetrics:

    def __init__(self):
        self.total_waiting_time = 0
        self.total_vehicles = 0
        self.completed_vehicles = 0
        self.peak_waiting_time = 0

    def update(self):
        vehicle_ids = traci.vehicle.getIDList()
        current_step_wait = 0
        
        for vid in vehicle_ids:
            # We count vehicles moving slower than 0.1m/s as waiting
            if traci.vehicle.getSpeed(vid) < 0.1:
                current_step_wait += 1
                
            # Track peak wait from individual vehicles
            v_wait = traci.vehicle.getWaitingTime(vid)
            if v_wait > self.peak_waiting_time:
                self.peak_waiting_time = v_wait

        self.total_waiting_time += current_step_wait
        self.total_vehicles = len(vehicle_ids)

    def vehicle_arrived(self):
        arrived = traci.simulation.getArrivedNumber()
        self.completed_vehicles += arrived

    def get_average_wait(self):
        # Average wait of vehicles currently in the system
        if self.total_vehicles == 0:
            return 0
        
        # Get current waiting times of all vehicles in system
        vids = traci.vehicle.getIDList()
        if not vids: return 0
        avg = sum(traci.vehicle.getWaitingTime(v) for v in vids) / len(vids)
        return round(avg, 2)

    def get_throughput(self):
        return self.completed_vehicles

    def get_peak_wait(self):
        return self.peak_waiting_time

    def get_efficiency_score(self):
        # Real-time efficiency: % of vehicles moving faster than 5m/s
        vids = traci.vehicle.getIDList()
        if not vids: return 100.0
        
        moving = sum(1 for v in vids if traci.vehicle.getSpeed(v) > 5)
        score = (moving / len(vids)) * 100
        return round(score, 1)
