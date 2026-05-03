import React, { useState } from "react";
import { Upload, Video, X, CheckCircle, Activity } from "lucide-react";

const DirectionUpload = ({ direction, onFileSelect }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = (selectedFile) => {
    if (selectedFile && selectedFile.type.startsWith("video/")) {
      setFile(selectedFile);
      setPreview(URL.createObjectURL(selectedFile));
      onFileSelect(direction, selectedFile);
    }
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const onRemove = () => {
    setFile(null);
    setPreview(null);
    onFileSelect(direction, null);
  };

  return (
    <div 
      className={`glass-panel ${isDragging ? "dragging" : ""}`}
      style={{ 
        position: "relative",
        height: "100%", 
        minHeight: "300px",
        display: "flex", 
        flexDirection: "column", 
        alignItems: "center", 
        justifyContent: "center",
        padding: "2rem",
        transition: "all 0.3s ease",
        border: isDragging ? "2px dashed var(--color-blue)" : "1px solid rgba(255, 255, 255, 0.1)",
        background: isDragging ? "rgba(59, 130, 246, 0.1)" : "rgba(15, 23, 42, 0.3)"
      }}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={onDrop}
    >
      <div style={{ 
        position: "absolute", 
        top: "15px", 
        left: "20px", 
        fontSize: "0.75rem", 
        fontWeight: "700", 
        color: "var(--text-muted)",
        letterSpacing: "1px",
        textTransform: "uppercase"
      }}>
        {direction} QUADRANT
      </div>

      {!preview ? (
        <div style={{ textAlign: "center", pointerEvents: "none" }}>
          <div style={{ 
            width: "60px", 
            height: "60px", 
            borderRadius: "50%", 
            background: "rgba(59, 130, 246, 0.1)", 
            display: "flex", 
            alignItems: "center", 
            justifyContent: "center",
            margin: "0 auto 1.5rem",
            color: "var(--color-blue)"
          }}>
            <Upload size={28} />
          </div>
          <h4 style={{ margin: "0 0 10px", color: "white" }}>Drag & Drop Footage</h4>
          <p style={{ fontSize: "0.8rem", color: "var(--text-muted)", maxWidth: "200px", margin: "0 auto" }}>
            Upload High-Res CCTV Video for {direction} lane analysis
          </p>
          <input 
            type="file" 
            accept="video/*" 
            onChange={(e) => handleFile(e.target.files[0])}
            style={{ 
              position: "absolute", 
              top: 0, 
              left: 0, 
              width: "100%", 
              height: "100%", 
              opacity: 0, 
              cursor: "pointer",
              pointerEvents: "auto"
            }}
          />
        </div>
      ) : (
        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
          <div style={{ 
            flexGrow: 1, 
            borderRadius: "12px", 
            overflow: "hidden", 
            background: "#000",
            position: "relative"
          }}>
            <video 
              src={preview} 
              autoPlay 
              loop 
              muted 
              style={{ width: "100%", height: "100%", objectFit: "cover" }} 
            />
            <button 
              onClick={onRemove}
              style={{
                position: "absolute",
                top: "10px",
                right: "10px",
                background: "rgba(239, 68, 68, 0.2)",
                border: "1px solid rgba(239, 68, 68, 0.4)",
                color: "white",
                borderRadius: "50%",
                width: "30px",
                height: "30px",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: "pointer",
                backdropFilter: "blur(5px)"
              }}
            >
              <X size={16} />
            </button>
          </div>
          <div style={{ marginTop: "15px", display: "flex", alignItems: "center", gap: "10px" }}>
            <CheckCircle size={18} color="var(--color-green)" />
            <span style={{ fontSize: "0.85rem", color: "white" }}>{file?.name}</span>
          </div>
        </div>
      )}
    </div>
  );
};

const VideoUpload = ({ onStop }) => {
  const [uploads, setUploads] = useState({
    North: null,
    South: null,
    East: null,
    West: null
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);

  const handleFileSelect = (direction, file) => {
    setUploads(prev => ({ ...prev, [direction]: file }));
  };

  const handleSystemStart = async () => {
    const uploadedCount = Object.values(uploads).filter(v => v !== null).length;
    if (uploadedCount < 4) {
      alert("Please upload footage for all 4 quadrants to begin system analysis.");
      return;
    }

    setIsUploading(true);
    setUploadStatus("Initialising Deep RL Analysis Engine...");

    const formData = new FormData();
    formData.append("north", uploads.North);
    formData.append("south", uploads.South);
    formData.append("east", uploads.East);
    formData.append("west", uploads.West);

    try {
      const response = await fetch("http://127.0.0.1:8000/analysis/start", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (response.ok) {
        setUploadStatus("Success! Analysis Engine is now processing footage.");
        setTimeout(() => {
          window.location.href = "/"; // Redirect to dashboard
        }, 2000);
      } else {
        throw new Error(result.message || "Upload failed");
      }
    } catch (error) {
      console.error("Upload error:", error);
      alert("Error starting analysis engine: " + error.message);
      setIsUploading(false);
      setUploadStatus(null);
    }
  };

  return (
    <div style={{ padding: "0 10px" }}>
      <header style={{ marginBottom: "2.5rem", display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
        <div>
          <h1 style={{ fontSize: "1.8rem", margin: "0 0 10px", display: "flex", alignItems: "center", gap: "15px" }}>
             <Video size={32} color="var(--color-blue)" /> 4-Way Footage Ingestion
          </h1>
          <p style={{ color: "var(--text-muted)", margin: 0 }}>Upload traffic video sources for all intersection directions to sync with the RL Engine.</p>
        </div>
        <div style={{ display: "flex", gap: "15px" }}>
          {isUploading && (
            <button 
              onClick={onStop}
              style={{
                padding: "12px 25px",
                background: "rgba(239, 68, 68, 0.15)",
                color: "var(--color-red)",
                border: "1px solid rgba(239, 68, 68, 0.3)",
                borderRadius: "12px",
                fontWeight: "600",
                cursor: "pointer",
                transition: "all 0.3s ease"
              }}
            >
              STOP ANALYSIS
            </button>
          )}
          <button 
            onClick={handleSystemStart}
            disabled={isUploading}
            style={{
              padding: "12px 30px",
              background: isUploading 
                ? "rgba(59, 130, 246, 0.4)" 
                : "linear-gradient(to right, var(--color-blue), var(--color-accent))",
              color: isUploading ? "rgba(255,255,255,0.5)" : "black",
              border: "none",
              borderRadius: "12px",
              fontWeight: "600",
              cursor: isUploading ? "not-allowed" : "pointer",
              boxShadow: isUploading ? "none" : "0 0 20px rgba(59, 130, 246, 0.3)",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              gap: "10px"
            }}
            className={isUploading ? "" : "btn-primary"}
          >
            {isUploading ? <Activity className="animate-pulse" size={20} /> : <Activity size={20} />}
            {isUploading ? "STARTING ENGINE..." : "START ANALYSIS ENGINE"}
          </button>
        </div>
      </header>

      {uploadStatus && (
        <div style={{
          marginBottom: "20px",
          padding: "15px",
          borderRadius: "10px",
          backgroundColor: "rgba(59, 130, 246, 0.1)",
          border: "1px solid rgba(59, 130, 246, 0.3)",
          color: "var(--color-blue)",
          textAlign: "center",
          fontWeight: "600",
          fontSize: "0.9rem"
        }}>
          {uploadStatus}
        </div>
      )}

      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(2, 1fr)", 
        gap: "25px",
        marginBottom: "30px"
      }}>
        {["North", "East", "South", "West"].map(dir => (
          <DirectionUpload 
            key={dir} 
            direction={dir} 
            onFileSelect={handleFileSelect} 
          />
        ))}
      </div>
    </div>
  );
};

export default VideoUpload;