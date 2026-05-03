import React, { useState, useRef, useEffect } from "react";
import { Video, Upload, X, CheckCircle, Play, Loader, AlertTriangle } from "lucide-react";

// ─── Single Lane Upload Card ─────────────────────────────────────────────────
const LaneUploadCard = ({ direction, label, color, onFileSelect }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const inputRef = useRef();

  const handleFile = (f) => {
    if (f && f.type.startsWith("video/")) {
      setFile(f);
      setPreview(URL.createObjectURL(f));
      onFileSelect(direction, f);
    }
  };

  const onRemove = (e) => {
    e.stopPropagation();
    setFile(null);
    if (preview) URL.revokeObjectURL(preview);
    setPreview(null);
    onFileSelect(direction, null);
  };

  return (
    <div
      onClick={() => !file && inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFile(e.dataTransfer.files[0]); }}
      style={{
        borderRadius: "16px",
        border: `2px dashed ${file ? color : isDragging ? color : "rgba(255,255,255,0.15)"}`,
        background: file ? `${color}10` : isDragging ? `${color}08` : "rgba(255,255,255,0.03)",
        padding: "1.25rem",
        cursor: file ? "default" : "pointer",
        transition: "all 0.3s ease",
        position: "relative",
        minHeight: "200px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: "12px"
      }}
    >
      {/* Direction Badge */}
      <div style={{
        position: "absolute", top: "12px", left: "14px",
        fontSize: "0.65rem", fontWeight: "800", letterSpacing: "1px",
        color: color, background: `${color}20`,
        padding: "3px 10px", borderRadius: "20px",
        border: `1px solid ${color}40`
      }}>
        {label} LANE
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        style={{ display: "none" }}
        onChange={(e) => handleFile(e.target.files[0])}
      />

      {!file ? (
        <>
          <div style={{
            width: "52px", height: "52px", borderRadius: "50%",
            background: `${color}15`, display: "flex",
            alignItems: "center", justifyContent: "center",
            color: color, marginTop: "10px"
          }}>
            <Upload size={24} />
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontWeight: "700", color: "#fff", fontSize: "0.9rem" }}>
              Drop {label} Footage
            </div>
            <div style={{ fontSize: "0.72rem", color: "var(--text-muted)", marginTop: "4px" }}>
              MP4, AVI, MOV accepted
            </div>
          </div>
        </>
      ) : (
        <>
          <video
            src={preview} autoPlay loop muted
            style={{ width: "100%", borderRadius: "10px", objectFit: "cover", maxHeight: "120px" }}
          />
          <div style={{ display: "flex", alignItems: "center", gap: "8px", width: "100%" }}>
            <CheckCircle size={16} color={color} />
            <span style={{ fontSize: "0.78rem", color: "#fff", flex: 1, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
              {file.name}
            </span>
            <button
              onClick={onRemove}
              style={{ background: "rgba(239,68,68,0.2)", border: "none", borderRadius: "50%", width: "22px", height: "22px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", color: "#ef4444", flexShrink: 0 }}
            >
              <X size={12} />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

// ─── Main Video Mode Modal ────────────────────────────────────────────────────
const VideoModeModal = ({ onClose, onSuccess }) => {
  const [uploads, setUploads] = useState({ north: null, south: null, east: null, west: null });
  const [status, setStatus] = useState("idle"); // idle | uploading | success | error
  const [statusMsg, setStatusMsg] = useState("");

  // Prevent background scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = ""; };
  }, []);

  const handleFileSelect = (direction, file) => {
    setUploads(prev => ({ ...prev, [direction]: file }));
  };

  const readyCount = Object.values(uploads).filter(Boolean).length;
  const allReady = readyCount === 4;

  const laneConfigs = [
    { direction: "north", label: "NORTH", color: "#3b82f6" },
    { direction: "east",  label: "EAST",  color: "#10b981" },
    { direction: "south", label: "SOUTH", color: "#f59e0b" },
    { direction: "west",  label: "WEST",  color: "#8b5cf6" }
  ];

  const handleCancel = async () => {
    // FIX #6: If uploading, stop backend process before closing
    if (status === "uploading") {
      try {
        await fetch("http://127.0.0.1:8000/simulation/stop", { method: "POST" });
      } catch (_) {}
    }
    onClose();
  };

  const handleStart = async () => {
    if (!allReady) return;
    setStatus("uploading");
    setStatusMsg("Uploading footage and initialising YOLO engine...");

    const formData = new FormData();
    formData.append("north", uploads.north);
    formData.append("south", uploads.south);
    formData.append("east",  uploads.east);
    formData.append("west",  uploads.west);

    try {
      const res = await fetch("http://127.0.0.1:8000/analysis/start", {
        method: "POST",
        body: formData,
      });
      const result = await res.json();

      if (res.ok) {
        setStatus("success");
        setStatusMsg("✅ YOLO Analysis Engine started! Traffic signals are now live.");
        setTimeout(() => {
          onSuccess();   // close modal + mark VIDEO active
        }, 1800);
      } else {
        throw new Error(result.detail || result.message || "Upload failed");
      }
    } catch (err) {
      setStatus("error");
      setStatusMsg("❌ Error: " + err.message);
    }
  };


  return (
    // Overlay
    <div style={{
      position: "fixed", inset: 0, zIndex: 9999,
      background: "rgba(0,0,0,0.8)",
      backdropFilter: "blur(8px)",
      display: "flex", alignItems: "center", justifyContent: "center",
      padding: "20px"
    }}>
      {/* Modal Box */}
      <div style={{
        width: "100%", maxWidth: "760px",
        background: "linear-gradient(135deg, #0f172a 0%, #1e293b 100%)",
        border: "1px solid rgba(255,255,255,0.1)",
        borderRadius: "24px",
        boxShadow: "0 25px 60px rgba(0,0,0,0.6)",
        padding: "2rem",
        animation: "fadeInUp 0.3s ease"
      }}>
        {/* Header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "1.5rem" }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "6px" }}>
              <div style={{
                width: "38px", height: "38px", borderRadius: "10px",
                background: "rgba(245,158,11,0.15)", border: "1px solid rgba(245,158,11,0.3)",
                display: "flex", alignItems: "center", justifyContent: "center", color: "#f59e0b"
              }}>
                <Video size={20} />
              </div>
              <h2 style={{ margin: 0, fontSize: "1.3rem", fontWeight: "800" }}>
                4-Way Video Analysis Setup
              </h2>
            </div>
            <p style={{ margin: 0, color: "var(--text-muted)", fontSize: "0.83rem" }}>
              Upload CCTV footage for all 4 intersection lanes. YOLO will count vehicles and control signals in real-time.
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: "rgba(255,255,255,0.08)", border: "none", color: "#fff", borderRadius: "50%", width: "34px", height: "34px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
          >
            <X size={18} />
          </button>
        </div>

        {/* Progress bar */}
        <div style={{ marginBottom: "1.5rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "6px" }}>
            <span>Footage loaded</span>
            <span style={{ color: allReady ? "#10b981" : "#f59e0b", fontWeight: "700" }}>{readyCount} / 4 lanes</span>
          </div>
          <div style={{ height: "4px", background: "rgba(255,255,255,0.08)", borderRadius: "4px", overflow: "hidden" }}>
            <div style={{
              height: "100%", width: `${(readyCount / 4) * 100}%`,
              background: allReady ? "#10b981" : "#f59e0b",
              borderRadius: "4px", transition: "width 0.4s ease"
            }} />
          </div>
        </div>

        {/* 4 Upload cards grid */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "1.5rem" }}>
          {laneConfigs.map(cfg => (
            <LaneUploadCard
              key={cfg.direction}
              direction={cfg.direction}
              label={cfg.label}
              color={cfg.color}
              onFileSelect={handleFileSelect}
            />
          ))}
        </div>

        {/* Status message */}
        {status !== "idle" && (
          <div style={{
            padding: "12px 16px", borderRadius: "10px", marginBottom: "1rem",
            background: status === "error" ? "rgba(239,68,68,0.1)" : status === "success" ? "rgba(16,185,129,0.1)" : "rgba(59,130,246,0.1)",
            border: `1px solid ${status === "error" ? "rgba(239,68,68,0.3)" : status === "success" ? "rgba(16,185,129,0.3)" : "rgba(59,130,246,0.3)"}`,
            color: status === "error" ? "#ef4444" : status === "success" ? "#10b981" : "#3b82f6",
            fontSize: "0.85rem", fontWeight: "600", textAlign: "center"
          }}>
            {status === "uploading" && <span style={{ marginRight: "8px" }}>⏳</span>}
            {statusMsg}
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: "flex", gap: "12px", justifyContent: "flex-end" }}>
          <button
            onClick={handleCancel}
            disabled={status === "uploading"}
            style={{
              padding: "11px 24px", borderRadius: "12px",
              cursor: status === "uploading" ? "not-allowed" : "pointer",
              background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)",
              color: "var(--text-muted)", fontWeight: "600", fontSize: "0.88rem",
              opacity: status === "uploading" ? 0.4 : 1
            }}
          >
            Cancel
          </button>
          <button
            id="start-video-analysis-btn"
            onClick={handleStart}
            disabled={!allReady || status === "uploading" || status === "success"}
            style={{
              padding: "11px 30px", borderRadius: "12px", cursor: allReady && status === "idle" ? "pointer" : "not-allowed",
              background: allReady ? "linear-gradient(135deg, #f59e0b, #ef4444)" : "rgba(255,255,255,0.08)",
              border: "none", color: allReady ? "#000" : "var(--text-muted)",
              fontWeight: "700", fontSize: "0.88rem",
              display: "flex", alignItems: "center", gap: "8px",
              boxShadow: allReady ? "0 0 20px rgba(245,158,11,0.3)" : "none",
              transition: "all 0.3s ease",
              opacity: (!allReady || status === "uploading" || status === "success") ? 0.7 : 1
            }}
          >
            {status === "uploading"
              ? <><Loader size={18} style={{ animation: "spin 1s linear infinite" }} /> Starting Engine...</>
              : <><Play size={18} /> Start YOLO Analysis</>
            }
          </button>
        </div>

        {/* Info footer */}
        {!allReady && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "14px", color: "var(--text-muted)", fontSize: "0.75rem" }}>
            <AlertTriangle size={14} color="#f59e0b" />
            All 4 lane footages must be uploaded before starting analysis.
          </div>
        )}
      </div>
    </div>
  );
};

export default VideoModeModal;
