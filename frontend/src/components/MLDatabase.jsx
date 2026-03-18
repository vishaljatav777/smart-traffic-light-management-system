import React from "react";
import { Database, Cpu, BrainCircuit, ListChecks, ArrowRightCircle } from "lucide-react";

const MLDatabase = ({ latestData }) => {
  // Mock Q-learning decisions based on live data
  const recentDecisions = [
    { time: "22:45:01", state: "N_HEAVY", action: "EXTEND_NORTH", reward: "+12.5", efficiency: "88%" },
    { time: "22:45:15", state: "E_CLEAR", action: "SWITCH_SOUTH", reward: "-2.1", efficiency: "85%" },
    { time: "22:45:30", state: "W_EMERGENCY", action: "FORCE_WEST", reward: "+50.0", efficiency: "92%" },
    { time: "22:45:45", state: "ALL_BUSY", action: "ROUND_ROBIN", reward: "+5.2", efficiency: "86%" },
    { time: "22:46:00", state: "S_HEAVY", action: "EXTEND_SOUTH", reward: "+8.9", efficiency: "89%" }
  ];

  return (
    <div className="ml-database-page" style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
      <header>
          <h2 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <BrainCircuit color="var(--color-blue)" /> Deep Q-Learning Agent Logs
          </h2>
          <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>Real-time audit of reinforcement learning state transitions and reward outcomes</p>
      </header>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px" }}>
          {/* Agent Insights Cards */}
          <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", gap: "15px" }}>
             <h4 style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <Cpu size={18} color="var(--color-accent)" /> Agent Configuration
             </h4>
             <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                <div style={{ padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "8px" }}>
                   <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>LR (Learning Rate)</div>
                   <div style={{ fontWeight: "bold" }}>0.001</div>
                </div>
                <div style={{ padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "8px" }}>
                   <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Gamma (Discount)</div>
                   <div style={{ fontWeight: "bold" }}>0.95</div>
                </div>
                <div style={{ padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "8px" }}>
                   <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Epsilon (Exploration)</div>
                   <div style={{ fontWeight: "bold" }}>0.1</div>
                </div>
                <div style={{ padding: "12px", background: "rgba(255,255,255,0.02)", borderRadius: "8px" }}>
                   <div style={{ fontSize: "0.7rem", color: "var(--text-muted)" }}>Exploration Decay</div>
                   <div style={{ fontWeight: "bold" }}>0.995</div>
                </div>
             </div>
             <div style={{ marginTop: "10px", padding: "15px", backgroundColor: "rgba(59, 130, 246, 0.1)", borderRadius: "8px", border: "1px solid rgba(59, 130, 246, 0.2)" }}>
                <p style={{ fontSize: "0.85rem", lineHeight: "1.4" }}>
                   Agent is currently in <strong>EXPLOITATION</strong> mode. Prioritizing actions with highest predicted Q-values based on historical traffic patterns.
                </p>
             </div>
          </div>

          {/* Model Status */}
          <div className="glass-panel" style={{ padding: "1.5rem", display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", textAlign: "center", gap: "15px" }}>
             <div style={{ width: "80px", height: "80px", borderRadius: "50%", backgroundColor: "rgba(59, 130, 246, 0.1)", display: "flex", justifyContent: "center", alignItems: "center" }}>
                <Database size={40} color="var(--color-blue)" />
             </div>
             <div>
                <h4 style={{ margin: 0 }}>Q-Table Database</h4>
                <p style={{ color: "var(--text-muted)", fontSize: "0.85rem", marginTop: "5px" }}>Stored in <code>controller/ml_models/q_table.pkl</code></p>
             </div>
             <div style={{ fontSize: "1.2rem", fontWeight: "bold" }}>14,582 <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>Unique States Maped</span></div>
             <button style={{ backgroundColor: "var(--color-blue)", color: "white", border: "none", padding: "10px 20px", borderRadius: "8px", cursor: "pointer", fontWeight: "600" }}>
                FLUSH & RETRAIN MODEL
             </button>
          </div>
      </div>

      {/* Decision Log Table */}
      <div className="glass-panel" style={{ padding: "1.5rem" }}>
         <h4 style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "8px" }}>
            <ListChecks size={18} color="var(--color-green)" /> Recent State Transformations
         </h4>
         <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.9rem" }}>
            <thead>
               <tr style={{ borderBottom: "1px solid var(--glass-border)", color: "var(--text-muted)", textAlign: "left" }}>
                  <th style={{ padding: "12px" }}>TIMESTAMP</th>
                  <th style={{ padding: "12px" }}>TRAFFIC STATE</th>
                  <th style={{ padding: "12px" }}>AGENT ACTION</th>
                  <th style={{ padding: "12px" }}>REWARD SCORE</th>
                  <th style={{ padding: "12px" }}>OUTCOME</th>
               </tr>
            </thead>
            <tbody>
               {recentDecisions.map((log, i) => (
                  <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                     <td style={{ padding: "12px", fontFamily: "monospace", color: "var(--text-muted)" }}>{log.time}</td>
                     <td style={{ padding: "12px" }}>
                        <span style={{ fontSize: "0.75rem", backgroundColor: "rgba(255,255,255,0.05)", padding: "2px 6px", borderRadius: "4px" }}>{log.state}</span>
                     </td>
                     <td style={{ padding: "12px", fontWeight: "600" }}>{log.action}</td>
                     <td style={{ padding: "12px", color: log.reward.startsWith("+") ? "var(--color-green)" : "var(--color-red)" }}>{log.reward}</td>
                     <td style={{ padding: "12px" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                           <ArrowRightCircle size={14} color="var(--color-blue)" />
                           {log.efficiency} EFF
                        </div>
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
      </div>
    </div>
  );
};

export default MLDatabase;
