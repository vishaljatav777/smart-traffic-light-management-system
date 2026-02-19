import subprocess
import threading

class TrafficService:

    def __init__(self):
        self.process = None

    def start_simulation(self):
        if self.process is None:
            self.process = subprocess.Popen(
                ["python", "../controller/main.py"],
                shell=True
            )
            return {"status": "Simulation Started"}
        return {"status": "Already Running"}

    def stop_simulation(self):
        if self.process:
            self.process.terminate()
            self.process = None
            return {"status": "Simulation Stopped"}
        return {"status": "No Simulation Running"}
