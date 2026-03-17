import React, { useEffect, useState } from "react";
import { AlertCircle } from "lucide-react";
import LaneBox from "./LaneBox";

const Dashboard = ({ liveData }) => {
  const [activeLane, setActiveLane] = useState("N");
  const [phase, setPhase] = useState("RED");
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    if (liveData) {
      if (liveData.current_direction) {
        const cleanDir = liveData.current_direction.split("_")[0];
        setActiveLane(cleanDir);
      }
      setPhase(liveData.phase || "RED");
      setSeconds(liveData.remaining_time || 0);
    }
  }, [liveData]);

  if (!liveData) return <div className="glass-panel p-6">Connecting to Traffic Controller...</div>;

  return (
    <div style={{ padding: "10px" }}>
      {/* 🚨 Emergency Alert Banner */}
      {liveData?.detailed_stats?.emergency_detected && (
        <div className="glass-panel" style={{ 
          padding: "1rem", 
          marginBottom: "1.5rem", 
          backgroundColor: "rgba(239, 68, 68, 0.2)",
          border: "2px solid var(--color-red)",
          display: "flex",
          alignItems: "center",
          gap: "15px",
          animation: "pulse-glow 1s infinite alternate"
        }}>
          <div style={{ backgroundColor: "var(--color-red)", padding: "10px", borderRadius: "50%" }}>
            <AlertCircle color="white" size={24} />
          </div>
          <div>
            <div style={{ fontWeight: "bold", color: "var(--color-red)", fontSize: "1.1rem" }}>
              EMERGENCY DETECTED: {liveData.detailed_stats.emergency_type?.toUpperCase()}
            </div>
            <div style={{ fontSize: "0.9rem", color: "var(--text-main)" }}>
              Priority override active for {liveData.detailed_stats.emergency_direction} Lane
            </div>
          </div>
        </div>
      )}
      <div style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center",
        marginBottom: "20px",
        padding: "15px",
        background: "rgba(59, 130, 246, 0.1)",
        borderRadius: "12px",
        border: "1px solid var(--color-accent)"
      }}>
        <h2 style={{ margin: 0 }}>🚦 Live Traffic Status</h2>
        <div style={{ display: "flex", gap: "20px", alignItems: "center" }}>
           <div style={{ textAlign: "right" }}>
             <div style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>ACTIVE PHASE</div>
             <div style={{ 
               fontWeight: "bold", 
               color: phase === "GREEN" ? "var(--color-green)" : phase === "YELLOW" ? "var(--color-yellow)" : "var(--color-red)" 
             }}>{phase}</div>
           </div>
           <div style={{ 
             fontSize: "2.5rem", 
             fontWeight: "bold", 
             fontFamily: "monospace",
             color: "var(--color-accent)",
             minWidth: "60px",
             textAlign: "center"
           }}>
             {seconds}s
           </div>
        </div>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        gap: "20px"
      }}>
        <LaneBox name="North" short="N" activeLane={activeLane} phase={phase} seconds={seconds} vehicleCount={liveData.vehicle_counts?.N_J1 || 0} />
        <LaneBox name="East" short="E" activeLane={activeLane} phase={phase} seconds={seconds} vehicleCount={liveData.vehicle_counts?.E_J1 || 0} />
        <LaneBox name="West" short="W" activeLane={activeLane} phase={phase} seconds={seconds} vehicleCount={liveData.vehicle_counts?.W_J1 || 0} />
        <LaneBox name="South" short="S" activeLane={activeLane} phase={phase} seconds={seconds} vehicleCount={liveData.vehicle_counts?.S_J1 || 0} />
      </div>
    </div>
  );
};

export default Dashboard;