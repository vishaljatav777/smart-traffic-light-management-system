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
    <div className="dashboard-content" style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
      {/* 🚨 Emergency Alert Banner */}
      {liveData?.detailed_stats?.emergency_detected && (
        <div className="glass-panel" style={{ 
          padding: "1.25rem 1.5rem", 
          backgroundColor: "rgba(239, 68, 68, 0.15)",
          border: "1px solid var(--color-red)",
          display: "flex",
          alignItems: "center",
          gap: "20px",
          animation: "glow-pulse 1s infinite alternate"
        }}>
          <div style={{ backgroundColor: "var(--color-red)", padding: "12px", borderRadius: "50%", boxShadow: "0 0 20px rgba(239, 68, 68, 0.4)" }}>
            <AlertCircle color="white" size={24} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: "700", color: "#fff", fontSize: "1.2rem", letterSpacing: "0.5px" }}>
              EMERGENCY DETECTED: {liveData.detailed_stats.emergency_type?.toUpperCase()}
            </div>
            <div style={{ fontSize: "0.95rem", color: "rgba(255,255,255,0.8)", marginTop: "4px" }}>
              Priority override active for <strong style={{ color: "white" }}>{liveData.detailed_stats.emergency_direction} Lane</strong>
            </div>
          </div>
        </div>
      )}

      {/* Main Signal Monitor */}
      <div className="glass-panel">
        <div className="card-header">
          <h2>🚦 Live Traffic Monitor</h2>
          <div style={{ display: "flex", gap: "25px", alignItems: "center" }}>
             <div style={{ textAlign: "right", paddingRight: "15px", borderRight: "1px solid rgba(255,255,255,0.1)" }}>
               <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>NEXT LANE</div>
               <div style={{ 
                 fontWeight: "700", 
                 fontSize: "1.1rem",
                 color: "var(--color-blue)"
               }}>{liveData.next_direction ? liveData.next_direction.split("_")[0] : "--"}</div>
             </div>
             <div style={{ textAlign: "right" }}>
               <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", fontWeight: "600", textTransform: "uppercase", letterSpacing: "1px" }}>CURRENT PHASE</div>
               <div style={{ 
                 fontWeight: "700", 
                 fontSize: "1.1rem",
                 color: phase === "GREEN" ? "var(--color-green)" : phase === "YELLOW" ? "var(--color-yellow)" : "var(--color-red)" 
               }}>{phase}</div>
             </div>
             <div style={{ 
               fontSize: "2.8rem", 
               fontWeight: "700", 
               fontFamily: "'Roboto Mono', monospace",
               color: "var(--color-accent)",
               minWidth: "70px",
               textAlign: "center",
               textShadow: "0 0 20px rgba(99, 102, 241, 0.3)"
             }}>
               {seconds}s
             </div>
          </div>
        </div>
        
        <div className="card-body">
          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "24px"
          }}>
            <LaneBox name="North" short="N" activeLane={activeLane} phase={phase} seconds={seconds} vehicleCount={liveData.vehicle_counts?.N_J1 || 0} isNextUp={liveData.next_direction === "N_J1"} isEmergency={liveData.detailed_stats?.emergency_direction === "N_J1"} speed={liveData.speeds?.N_J1 || 0} />
            <LaneBox name="East" short="E" activeLane={activeLane} phase={phase} seconds={seconds} vehicleCount={liveData.vehicle_counts?.E_J1 || 0} isNextUp={liveData.next_direction === "E_J1"} isEmergency={liveData.detailed_stats?.emergency_direction === "E_J1"} speed={liveData.speeds?.E_J1 || 0} />
            <LaneBox name="West" short="W" activeLane={activeLane} phase={phase} seconds={seconds} vehicleCount={liveData.vehicle_counts?.W_J1 || 0} isNextUp={liveData.next_direction === "W_J1"} isEmergency={liveData.detailed_stats?.emergency_direction === "W_J1"} speed={liveData.speeds?.W_J1 || 0} />
            <LaneBox name="South" short="S" activeLane={activeLane} phase={phase} seconds={seconds} vehicleCount={liveData.vehicle_counts?.S_J1 || 0} isNextUp={liveData.next_direction === "S_J1"} isEmergency={liveData.detailed_stats?.emergency_direction === "S_J1"} speed={liveData.speeds?.S_J1 || 0} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;