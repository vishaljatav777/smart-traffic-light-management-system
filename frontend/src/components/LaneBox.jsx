import React from "react";
import { Clock, Car, Activity, Play, Pause } from "lucide-react";

const LaneBox = ({ name, short, activeLane, seconds, phase, vehicleCount, isNextUp, isEmergency, speed, laneSignal, isVideoMode }) => {

  const isActive = short === activeLane;

  // Per-lane signal: use laneSignal if provided (VIDEO mode), else derive from isActive+phase
  const signal = laneSignal || (isActive ? phase : "RED");
  const isGreen  = signal === "GREEN";
  const isYellow = signal === "YELLOW";
  const isRed    = signal === "RED";

  const getLightClass = (color) => {
    if (color === "red"    && isRed)    return "active-red";
    if (color === "yellow" && isYellow) return "active-yellow glow-pulse";
    if (color === "green"  && isGreen)  return "active-green glow-pulse";
    return "dimmed";
  };

  const signalColor = isGreen ? "var(--color-green)" : isYellow ? "var(--color-yellow)" : "var(--color-red)";

  return (
    <div
      className={`glass-panel p-4 flex flex-col items-center justify-between transition-all duration-500 ${isActive ? 'active-scale' : 'inactive-lane'}`}
      style={{
        padding: "1rem",
        border: isActive
          ? `2px solid ${signalColor}`
          : "1px solid var(--glass-border)",
        position: "relative",
        overflow: "hidden",
        transform: isActive ? 'scale(1.05)' : 'scale(1)',
        boxShadow: isActive ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' : 'none',
        filter: isActive ? 'none' : 'grayscale(0.3)',
        opacity: isActive ? 1 : 0.6
      }}
    >
      {/* Active glow bar at top */}
      {isActive && (
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "4px",
          background: signalColor,
          boxShadow: `0 2px 10px ${signalColor}`
        }} />
      )}

      {/* Header Row */}
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: "0.5rem" }}>
        <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "600", color: isActive ? "var(--text-main)" : "var(--text-muted)" }}>
          {name}
        </h3>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "2px" }}>
          {isActive && (
            <div style={{ color: signalColor, fontSize: "0.65rem", fontWeight: "800", letterSpacing: "0.5px" }}>
              ACTIVE
            </div>
          )}
          {!isActive && isEmergency && (
            <div style={{ color: "var(--color-red)", fontSize: "0.65rem", fontWeight: "bold", animation: "glow-pulse 1s infinite alternate" }}>
              🚨 EMERGENCY
            </div>
          )}
          {!isActive && !isEmergency && isNextUp && (
            <div style={{ color: "var(--color-blue)", fontSize: "0.65rem", fontWeight: "bold" }}>
              NEXT UP
            </div>
          )}
        </div>
      </div>

      {/* 🚦 Traffic Light */}
      <div style={{
        backgroundColor: "#020617", padding: "0.8rem", borderRadius: "20px",
        display: "flex", flexDirection: "row", gap: "1rem",
        boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.5)", border: "2px solid #1e293b"
      }}>
        <div className={`light-bulb ${getLightClass("red")}`}    style={{ width: "25px", height: "25px" }} />
        <div className={`light-bulb ${getLightClass("yellow")}`} style={{ width: "25px", height: "25px" }} />
        <div className={`light-bulb ${getLightClass("green")}`}  style={{ width: "25px", height: "25px" }} />
      </div>

      {/* VIDEO MODE: Play / Pause indicator */}
      {isVideoMode && (
        <div style={{
          marginTop: "10px",
          display: "flex", alignItems: "center", gap: "6px",
          padding: "5px 14px", borderRadius: "20px",
          background: isGreen ? "rgba(16,185,129,0.12)" : isYellow ? "rgba(234,179,8,0.12)" : "rgba(239,68,68,0.12)",
          border: `1px solid ${isGreen ? "rgba(16,185,129,0.3)" : isYellow ? "rgba(234,179,8,0.3)" : "rgba(239,68,68,0.3)"}`,
          color: signalColor, fontSize: "0.72rem", fontWeight: "700", letterSpacing: "0.5px"
        }}>
          {isGreen || isYellow
            ? <><Play  size={12} /> VIDEO PLAYING</>
            : <><Pause size={12} /> VIDEO PAUSED</>
          }
        </div>
      )}

      {/* Stats Row */}
      <div style={{
        marginTop: "1rem", display: "flex", justifyContent: "space-between",
        alignItems: "center", width: "100%", padding: "0 5px"
      }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--color-accent)" }}>
            <Car size={16} />
            <span style={{ fontWeight: "bold" }}>{vehicleCount}</span>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--text-muted)" }}>
            <Activity size={16} />
            <span style={{ fontWeight: "bold", fontSize: "0.85rem" }}>{(speed || 0).toFixed(1)} m/s</span>
          </div>
        </div>

        <div style={{
          display: "flex", alignItems: "center", gap: "0.3rem",
          fontSize: "1.2rem", fontWeight: "bold",
          fontFamily: "'Inter', monospace",
          color: isActive ? "var(--text-main)" : "var(--text-muted)"
        }}>
          <Clock size={16} />
          {isActive ? `${seconds}s` : "--"}
        </div>
      </div>
    </div>
  );
};

export default LaneBox;