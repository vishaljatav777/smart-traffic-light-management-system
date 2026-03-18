import requests
import time

BASE_URL = "http://127.0.0.1:8000"

def test():
    try:
        print("Testing /simulation/status (should be stopped)")
        print(requests.get(f"{BASE_URL}/simulation/status").json())
        
        print("\nTesting /simulation/start")
        print(requests.post(f"{BASE_URL}/simulation/start?nogui=true").json())

        time.sleep(2)
        print("\nTesting /simulation/status (should be running)")
        print(requests.get(f"{BASE_URL}/simulation/status").json())

        print("\nTesting /live-status")
        print(requests.get(f"{BASE_URL}/live-status").json())

        print("\nTesting /simulation/stop")
        print(requests.post(f"{BASE_URL}/simulation/stop").json())
        
        time.sleep(1)
        print("\nTesting /simulation/status (should be stopped)")
        print(requests.get(f"{BASE_URL}/simulation/status").json())
    except Exception as e:
        print("Error:", e)

if __name__ == "__main__":
    test()
