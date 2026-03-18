import React from "react";
import { Map, Zap, Thermometer, Filter } from "lucide-react";

const HeatmapView = ({ latestData }) => {
  const lanes = [
    { name: "North Direction", id: "N_J1", color: "#f87171" },
    { name: "East Direction", id: "E_J1", color: "#fbbf24" },
    { name: "South Direction", id: "S_J1", color: "#34d399" },
    { name: "West Direction", id: "W_J1", color: "#60a5fa" }
  ];

  const getHeatColor = (count) => {
    if (count > 25) return "rgba(239, 68, 68, 0.8)"; // Red
    if (count > 15) return "rgba(245, 158, 11, 0.7)"; // Yellow
    if (count > 5) return "rgba(16, 185, 129, 0.6)"; // Green
    return "rgba(59, 130, 246, 0.4)"; // Blue
  };

  return (
    <div className="heatmap-page" style={{ display: "flex", flexDirection: "column", gap: "25px", height: "100%" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div>
            <h2 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <Map color="var(--color-blue)" /> Traffic Density Heatmap
            </h2>
            <p style={{ color: "var(--text-muted)", fontSize: "0.9rem", marginTop: "4px" }}>Visual congestion analysis across intersection hotspots</p>
          </div>
          <div className="glass-panel" style={{ padding: "8px 15px", display: "flex", gap: "15px", fontSize: "0.8rem" }}>
             <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <Thermometer size={14} color="var(--color-red)" /> HIGH
             </div>
             <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <Thermometer size={14} color="var(--color-green)" /> OPTIMAL
             </div>
             <div style={{ display: "flex", alignItems: "center", gap: "5px", borderLeft: "1px solid var(--glass-border)", paddingLeft: "15px" }}>
                <Filter size={14} /> LIVE SYNC 
             </div>
          </div>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 350px", gap: "25px", flexGrow: 1 }}>
          {/* Main Heatmap Visualizer */}
          <div className="glass-panel" style={{ 
            position: "relative", 
            display: "flex", 
            justifyContent: "center", 
            alignItems: "center",
            background: "radial-gradient(circle at center, #1e293b 0%, #020617 100%)",
            minHeight: "500px",
            overflow: "hidden"
          }}>
             {/* Intersection Grid Overlay */}
             <div style={{ position: "absolute", width: "100%", height: "100%", opacity: 0.1, backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "30px 30px" }} />
             
             {/* Stylized Crossroad */}
             <div style={{ position: "relative", width: "300px", height: "300px" }}>
                {/* Horizontal Road */}
                <div style={{ position: "absolute", top: "110px", left: "-150px", width: "600px", height: "80px", backgroundColor: "#334155", borderRadius: "10px" }} />
                {/* Vertical Road */}
                <div style={{ position: "absolute", left: "110px", top: "-150px", height: "600px", width: "80px", backgroundColor: "#334155", borderRadius: "10px" }} />
                
                {/* Lane Hotspots */}
                {lanes.map((lane, i) => {
                   const count = latestData?.vehicle_counts?.[lane.id] || 0;
                   const positions = [
                     { top: "-80px", left: "110px", width: "80px", height: "100px" }, // N
                     { top: "110px", right: "-100px", width: "100px", height: "80px" }, // E
                     { bottom: "-80px", left: "110px", width: "80px", height: "100px" }, // S
                     { top: "110px", left: "-100px", width: "100px", height: "80px" } // W
                   ];
                   return (
                     <div key={i} style={{
                        position: "absolute",
                        ...positions[i],
                        backgroundColor: getHeatColor(count),
                        borderRadius: "8px",
                        filter: "blur(10px)",
                        transition: "all 0.5s ease",
                        animation: "live-pulse 2s infinite alternate",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center"
                     }}>
                        <span style={{ color: "white", fontWeight: "bold", filter: "blur(0)", opacity: 0.5 }}>{count}</span>
                     </div>
                   );
                })}
             </div>
          </div>

          {/* Lane Breakdown Sidebar */}
          <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
             {lanes.map((lane, i) => {
                const count = latestData?.vehicle_counts?.[lane.id] || 0;
                const percentage = Math.min((count / 30) * 100, 100);
                return (
                  <div key={i} className="glass-panel" style={{ padding: "1.2rem", borderLeft: `4px solid ${lane.color}` }}>
                     <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                        <span style={{ fontWeight: "600", fontSize: "0.9rem" }}>{lane.name}</span>
                        <Zap size={14} color={lane.color} />
                     </div>
                     <div style={{ fontSize: "1.5rem", fontWeight: "bold", marginBottom: "5px" }}>{count} <span style={{ fontSize: "0.8rem", color: "var(--text-muted)", marginLeft: "5px" }}>avg. vehicles</span></div>
                     <div style={{ width: "100%", height: "6px", backgroundColor: "rgba(255,255,255,0.05)", borderRadius: "3px", overflow: "hidden" }}>
                        <div style={{ 
                          width: `${percentage}%`, 
                          height: "100%", 
                          backgroundColor: getHeatColor(count),
                          transition: "width 0.5s ease" 
                        }} />
                     </div>
                  </div>
                );
             })}
          </div>
      </div>
    </div>
  );
};

export default HeatmapView;
