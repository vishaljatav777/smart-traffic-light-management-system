import traci

class TrafficMetrics:

    def __init__(self):
        self.total_waiting_time = 0
        self.total_vehicles = 0
        self.completed_vehicles = 0

    def update(self):
        vehicle_ids = traci.vehicle.getIDList()

        for vid in vehicle_ids:
            waiting_time = traci.vehicle.getWaitingTime(vid)
            self.total_waiting_time += waiting_time

        self.total_vehicles = len(vehicle_ids)

    def vehicle_arrived(self):
        arrived = traci.simulation.getArrivedNumber()
        self.completed_vehicles += arrived

    def get_average_wait(self):
        if self.total_vehicles == 0:
            return 0
        return self.total_waiting_time / self.total_vehicles

    def get_throughput(self):
        return self.completed_vehicles
