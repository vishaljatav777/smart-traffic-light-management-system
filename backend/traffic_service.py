import subprocess
import sys
import os

# Absolute path to the controller script
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTROLLER_SCRIPT = os.path.join(BASE_DIR, "controller", "main.py")

class TrafficService:

    def __init__(self):
        self.process = None

    def _is_running(self):
        """Check if the simulation process is alive."""
        if self.process is None:
            return False
        # poll() returns None if still running
        if self.process.poll() is not None:
            self.process = None
            return False
        return True

    def start_simulation(self, nogui: bool = True, data_source: str = "MOCK", video_paths: dict = None):
        if self._is_running():
            return {"status": "Already Running"}
        
        env = os.environ.copy()
        env["DATA_SOURCE"] = data_source
        if video_paths:
            import json
            env["VIDEO_PATHS"] = json.dumps(video_paths)
            
        cmd = [sys.executable, CONTROLLER_SCRIPT]
        if nogui:
            cmd.append("--nogui")
            
        self.process = subprocess.Popen(
            cmd,
            cwd=os.path.join(BASE_DIR, "controller"),
            env=env
        )
        return {"status": "Simulation Started", "pid": self.process.pid}

    def stop_simulation(self):
        if self._is_running():
            self.process.terminate()
            try:
                self.process.wait(timeout=5)
            except subprocess.TimeoutExpired:
                self.process.kill()
            self.process = None
            return {"status": "Simulation Stopped"}
        return {"status": "No Simulation Running"}

    def get_status(self):
        if self._is_running():
            return {"status": "running", "pid": self.process.pid}
        return {"status": "stopped"}
