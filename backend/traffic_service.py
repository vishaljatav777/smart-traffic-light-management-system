import subprocess
import sys
import os
import threading
from collections import deque

# Absolute path to the controller script
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CONTROLLER_SCRIPT = os.path.join(BASE_DIR, "controller", "main.py")

class TrafficService:

    def __init__(self):
        self.process = None
        self.logs = deque(maxlen=1000)
        self.log_lock = threading.Lock()

    def _is_running(self):
        """Check if the simulation process is alive."""
        if self.process is None:
            return False
        # poll() returns None if still running
        if self.process.poll() is not None:
            self.process = None
            return False
        return True

    def _read_logs(self, process):
        """Read logs from the subprocess stdout line by line."""
        for line in iter(process.stdout.readline, b''):
            decoded_line = line.decode('utf-8', errors='replace').strip()
            if decoded_line:
                with self.log_lock:
                    self.logs.append(decoded_line)
        process.stdout.close()

    def _kill_dangling_controllers(self):
        """Forcefully kill any python processes running controller/main.py (e.g. from user terminal)."""
        import psutil
        import time
        
        managed_pid = self.process.pid if self.process else None
        killed = False
        
        for proc in psutil.process_iter(['pid', 'name', 'cmdline']):
            try:
                if proc.info['pid'] == managed_pid:
                    continue
                    
                cmdline = proc.info.get('cmdline')
                if cmdline and any('main.py' in part for part in cmdline):
                    # Don't kill ourselves (uvicorn/backend)
                    if any('uvicorn' in part for part in cmdline):
                        continue
                    
                    print(f"[SYSTEM] Killing dangling controller PID {proc.info['pid']}")
                    proc.kill()
                    killed = True
            except (psutil.NoSuchProcess, psutil.AccessDenied):
                continue
        
        if killed:
            time.sleep(1.0) # Give OS time to release the socket lock

    def start_simulation(self, nogui: bool = True, data_source: str = "MOCK", video_paths: dict = None):
        self._kill_dangling_controllers()
        
        # Add a small secondary check/delay if it was recently stopped
        for _ in range(5):
            if not self._is_running():
                break
            time.sleep(0.5)
            
        stop_flag_path = os.path.join(BASE_DIR, "controller", "stop.flag")
        if os.path.exists(stop_flag_path):
            os.remove(stop_flag_path)
            
        # Clean up old status file so frontend doesn't read stale data
        status_file = os.path.join(BASE_DIR, "controller", "live_status.json")
        if os.path.exists(status_file):
            try:
                os.remove(status_file)
            except Exception:
                pass
        
        env = os.environ.copy()
        env["DATA_SOURCE"] = data_source
        if video_paths:
            import json
            env["VIDEO_PATHS"] = json.dumps(video_paths)
            
        cmd = [sys.executable, CONTROLLER_SCRIPT]
        if nogui:
            cmd.append("--nogui")
            
        with self.log_lock:
            self.logs.clear()
            self.logs.append(f"[SYSTEM] Starting Traffic Controller in {data_source} mode...")
            
        self.process = subprocess.Popen(
            cmd,
            cwd=os.path.join(BASE_DIR, "controller"),
            env=env,
            stdout=subprocess.PIPE,
            stderr=subprocess.STDOUT,
            bufsize=1
        )
        
        # Start background thread to consume logs
        threading.Thread(target=self._read_logs, args=(self.process,), daemon=True).start()
        
        return {"status": "Simulation Started", "pid": self.process.pid}

    def stop_simulation(self):
        self._kill_dangling_controllers()
        
        if self._is_running():
            stop_flag_path = os.path.join(BASE_DIR, "controller", "stop.flag")
            try:
                with open(stop_flag_path, "w") as f:
                    f.write("STOP")
            except Exception as e:
                print(f"Failed to write stop.flag: {e}")

            try:
                self.process.wait(timeout=8) # wait up to 8 seconds for graceful exit
            except subprocess.TimeoutExpired:
                self.process.kill() # Force kill if it didn't exit gracefully
                if os.path.exists(stop_flag_path):
                    try:
                        os.remove(stop_flag_path)
                    except:
                        pass
            
            self.process = None
            
            # Clean up old status file so frontend immediately shows stopped state
            status_file = os.path.join(BASE_DIR, "controller", "live_status.json")
            if os.path.exists(status_file):
                try:
                    os.remove(status_file)
                except Exception:
                    pass
            
            with self.log_lock:
                self.logs.append("[SYSTEM] Traffic Controller stopped.")
            return {"status": "Simulation Stopped"}
        return {"status": "No Simulation Running"}

    def get_status(self):
        if self._is_running():
            return {"status": "running", "pid": self.process.pid}
        return {"status": "stopped"}
        
    def get_recent_logs(self):
        with self.log_lock:
            return list(self.logs)

