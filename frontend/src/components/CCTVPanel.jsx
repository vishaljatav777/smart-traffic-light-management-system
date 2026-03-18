import React, { useState, useEffect } from "react";
import { Camera, Maximize2, Shield, Video, Clock } from "lucide-react";

const CCTVPanel = () => {
    const [currentTime, setCurrentTime] = useState(new Date().toLocaleTimeString());

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentTime(new Date().toLocaleTimeString());
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const cameras = [
        { id: "CAM-NORTH-01", label: "NORTH INTERSECTION", status: "LIVE" },
        { id: "CAM-EAST-02", label: "EAST INTERSECTION", status: "LIVE" },
        { id: "CAM-SOUTH-03", label: "SOUTH INTERSECTION", status: "LIVE" },
        { id: "CAM-WEST-04", label: "WEST INTERSECTION", status: "LIVE" }
    ];

    return (
        <div className="cctv-container" style={{ padding: "20px", height: "calc(100vh - 100px)" }}>
            <header style={{ marginBottom: "20px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                    <h2 style={{ display: "flex", alignItems: "center", gap: "10px", margin: 0 }}>
                        <Shield color="var(--color-blue)" /> Multi-Angle Traffic Surveillance
                    </h2>
                    <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", margin: "5px 0 0 0" }}>
                        Real-time feed from 4-way intersection cameras
                    </p>
                </div>
                <div className="glass-panel" style={{ padding: "8px 15px", display: "flex", alignItems: "center", gap: "10px" }}>
                    <Clock size={18} color="var(--color-blue)" />
                    <span style={{ fontWeight: "bold", fontFamily: "monospace" }}>{currentTime}</span>
                </div>
            </header>

            <div style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gridTemplateRows: "1fr 1fr",
                gap: "20px",
                height: "calc(100% - 60px)"
            }}>
                {cameras.map((cam, index) => (
                    <div key={index} className="glass-panel" style={{
                        position: "relative",
                        overflow: "hidden",
                        border: "1px solid rgba(255,255,255,0.1)",
                        backgroundColor: "#000",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                    }}>
                        {/* Feed Info Overlay */}
                        <div style={{
                            position: "absolute",
                            top: "15px",
                            left: "15px",
                            zIndex: 10,
                            display: "flex",
                            flexDirection: "column",
                            gap: "5px"
                        }}>
                            <div style={{
                                backgroundColor: "rgba(0,0,0,0.6)",
                                padding: "4px 10px",
                                borderRadius: "4px",
                                fontSize: "0.75rem",
                                color: "#fff",
                                fontWeight: "bold",
                                borderLeft: "3px solid var(--color-blue)"
                            }}>
                                {cam.id} | {cam.label}
                            </div>
                            <div style={{
                                display: "flex",
                                alignItems: "center",
                                gap: "6px",
                                backgroundColor: "rgba(239, 68, 68, 0.2)",
                                padding: "2px 8px",
                                borderRadius: "4px",
                                width: "fit-content"
                            }}>
                                <div style={{
                                    width: "8px",
                                    height: "8px",
                                    borderRadius: "50%",
                                    backgroundColor: "var(--color-red)",
                                    animation: "live-pulse 1s infinite alternate"
                                }} />
                                <span style={{ fontSize: "0.7rem", color: "var(--color-red)", fontWeight: "bold" }}>{cam.status}</span>
                            </div>
                        </div>

                        {/* Camera Controls Overlay */}
                        <div style={{
                            position: "absolute",
                            bottom: "15px",
                            right: "15px",
                            zIndex: 10,
                            display: "flex",
                            gap: "10px"
                        }}>
                            <button className="icon-btn" style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "none", color: "#fff", padding: "8px", borderRadius: "8px", cursor: "pointer" }}>
                                <Maximize2 size={18} />
                            </button>
                            <button className="icon-btn" style={{ backgroundColor: "rgba(255,255,255,0.1)", border: "none", color: "#fff", padding: "8px", borderRadius: "8px", cursor: "pointer" }}>
                                <Camera size={18} />
                            </button>
                        </div>

                        {/* Simulated Static/Effect */}
                        <div style={{
                            width: "100%",
                            height: "100%",
                            opacity: 0.3,
                            background: "linear-gradient(rgba(18, 16, 16, 0) 50%, rgba(0, 0, 0, 0.25) 50%), linear-gradient(90deg, rgba(255, 0, 0, 0.06), rgba(0, 255, 0, 0.02), rgba(0, 0, 255, 0.06))",
                            backgroundSize: "100% 2px, 3px 100%",
                            pointerEvents: "none"
                        }} />
                        
                        <div style={{ position: "absolute", textAlign: "center", color: "rgba(255,255,255,0.2)" }}>
                           <Video size={48} />
                           <div style={{ fontSize: "0.8rem", marginTop: "10px" }}>SECURE STREAM TUNNEL ACTIVE</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CCTVPanel;
