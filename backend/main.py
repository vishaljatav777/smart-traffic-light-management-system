from fastapi import FastAPI
import json
from traffic_service import TrafficService

app = FastAPI()
traffic_service = TrafficService()

@app.get("/")
def root():
    return {"message": "Smart Traffic Management API Running"}

@app.post("/start")
def start():
    return traffic_service.start_simulation()

@app.post("/stop")
def stop():
    return traffic_service.stop_simulation()

@app.get("/live-status")
def live_status():
    try:
        with open("../controller/live_status.json", "r") as f:
            data = json.load(f)
        return data
    except:
        return {"status": "No live data available"}
