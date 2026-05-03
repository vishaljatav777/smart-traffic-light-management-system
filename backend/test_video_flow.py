import requests
import os
import time

BASE_URL = "http://127.0.0.1:8000"

def test_video_upload():
    print("🚀 Starting Video Flow Verification Test")
    
    # Create dummy video files
    video_files = {}
    for dir_name in ["north", "south", "east", "west"]:
        file_path = f"test_{dir_name}.mp4"
        with open(file_path, "wb") as f:
            f.write(b"dummy video content")
        video_files[dir_name] = open(file_path, "rb")
    
    try:
        print("\n📤 Uploading 4-way footage...")
        response = requests.post(
            f"{BASE_URL}/analysis/start",
            files=video_files
        )
        print("Response:", response.json())
        
        if response.status_code == 200:
            print("\n✅ Upload successful. Waiting for engine to initialize...")
            time.sleep(3)
            
            print("\n📡 Checking /live-status...")
            status_res = requests.get(f"{BASE_URL}/live-status").json()
            print("Live Status Data Source:", status_res.get("current_direction"))
            
            # Since our dummy files aren't real videos, YOLO might return 0, 
            # but the engine should at least be running and updating the file.
            if "current_direction" in status_res:
                print("✅ Engine is running and providing status updates.")
            else:
                print("❌ Engine status not as expected.")
        else:
            print("❌ Upload failed.")
            
    finally:
        # Cleanup
        for f in video_files.values():
            f.close()
        for dir_name in ["north", "south", "east", "west"]:
            if os.path.exists(f"test_{dir_name}.mp4"):
                os.remove(f"test_{dir_name}.mp4")

if __name__ == "__main__":
    test_video_upload()
