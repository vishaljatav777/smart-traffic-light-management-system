import React, { useState } from "react";
import axios from "axios";

const VideoUpload = () => {
  const [videos, setVideos] = useState({
    north: null,
    south: null,
    east: null,
    west: null,
  });

  const handleChange = (lane, file) => {
    setVideos({ ...videos, [lane]: file });
  };

  const uploadLane = async (lane) => {
    if (!videos[lane]) {
      alert(`Please select video for ${lane}`);
      return;
    }

    const formData = new FormData();
    formData.append("file", videos[lane]);

    await axios.post(
      `http://127.0.0.1:8000/upload-video/${lane}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );

    alert(`${lane.toUpperCase()} uploaded`);
  };

    const switchMode = async (mode) => {
    await axios.post(`http://127.0.0.1:8000/set-mode/${mode}`);
    alert(`Switched to ${mode} mode`);
};


  return (
    <div style={{ padding: "20px" }}>
      <h2>Lane-wise Video Upload (YOLO Mode)</h2>

        <button onClick={() => switchMode("YOLO")}>Start YOLO</button>
        <button onClick={() => switchMode("SUMO")}>Start SUMO</button>
      <div>
        <h4>North Lane</h4>
        <input type="file" onChange={(e) => handleChange("north", e.target.files[0])}/>
        <button onClick={() => uploadLane("north")}>Upload</button>
      </div>

      <div>
        <h4>South Lane</h4>
        <input type="file" onChange={(e) => handleChange("south", e.target.files[0])}/>
        <button onClick={() => uploadLane("south")}>Upload</button>
      </div>

      <div>
        <h4>East Lane</h4>
        <input type="file" onChange={(e) => handleChange("east", e.target.files[0])}/>
        <button onClick={() => uploadLane("east")}>Upload</button>
      </div>

      <div>
        <h4>West Lane</h4>
        <input type="file" onChange={(e) => handleChange("west", e.target.files[0])}/>
        <button onClick={() => uploadLane("west")}>Upload</button>
      </div>
    </div>
  );
};

export default VideoUpload;