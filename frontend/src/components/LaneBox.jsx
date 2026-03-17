import React from "react";
import { Clock, Car } from "lucide-react";

const LaneBox = ({ name, short, activeLane, seconds, phase, vehicleCount }) => {

  const isActive = short === activeLane;

  const getLightClass = (color) => {
    if (!isActive) {
      return color === "red" ? "active-red dimmed" : "dimmed";
    }
    if (phase === "GREEN" && color === "green") return "active-green pulse";
    if (phase === "YELLOW" && color === "yellow") return "active-yellow pulse";
    if (phase === "RED" && color === "red") return "active-red";
    return "dimmed";
  };

  return (
    <div className={`glass-panel p-4 flex flex-col items-center justify-between transition-all duration-500 ${isActive ? 'active-scale' : 'inactive-lane'}`}
         style={{ 
           padding: "1rem", 
           border: isActive ? `2px solid ${phase === "GREEN" ? "var(--color-green)" : phase === "YELLOW" ? "var(--color-yellow)" : "var(--color-red)"}` : "1px solid var(--glass-border)",
           position: "relative",
           overflow: "hidden",
           transform: isActive ? 'scale(1.05)' : 'scale(1)',
           boxShadow: isActive ? '0 10px 15px -3px rgba(0, 0, 0, 0.3)' : 'none',
           filter: isActive ? 'none' : 'grayscale(0.3)',
           opacity: isActive ? 1 : 0.6
         }}>
      
      {isActive && (
        <div style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: "4px",
          background: phase === "GREEN" ? "var(--color-green)" : phase === "YELLOW" ? "var(--color-yellow)" : "var(--color-red)",
          boxShadow: `0 2px 10px ${phase === "GREEN" ? "var(--color-green)" : phase === "YELLOW" ? "var(--color-yellow)" : "var(--color-red)"}`
        }} />
      )}

      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", marginBottom: "0.5rem" }}>
        <h3 style={{ margin: 0, fontSize: "1.1rem", fontWeight: "600", color: isActive ? "var(--text-main)" : "var(--text-muted)" }}>{name}</h3>
        {isActive && <div style={{ color: phase === "GREEN" ? "var(--color-green)" : "var(--color-red)", fontSize: "0.7rem", fontWeight: "bold" }}>ACTIVE</div>}
      </div>

      {/* 🚦 Traffic Light Body */}
      <div style={{
          backgroundColor: "#020617",
          padding: "0.8rem",
          borderRadius: "20px",
          display: "flex",
          flexDirection: "row",
          gap: "1rem",
          boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.5)",
          border: "2px solid #1e293b"
      }}>
        <div className={`light-bulb ${getLightClass("red")}`} style={{ width: "25px", height: "25px" }}></div>
        <div className={`light-bulb ${getLightClass("yellow")}`} style={{ width: "25px", height: "25px" }}></div>
        <div className={`light-bulb ${getLightClass("green")}`} style={{ width: "25px", height: "25px" }}></div>
      </div>

      {/* Stats row: Vehicles and Timer */}
      <div style={{ 
          marginTop: "1rem", 
          display: "flex", 
          justifyContent: "space-between",
          width: "100%",
          padding: "0 5px"
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "5px", color: "var(--color-accent)" }}>
          <Car size={16} />
          <span style={{ fontWeight: "bold" }}>{vehicleCount}</span>
        </div>
        
        <div style={{ 
            display: "flex", 
            alignItems: "center", 
            gap: "0.3rem",
            fontSize: "1.2rem",
            fontWeight: "bold",
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