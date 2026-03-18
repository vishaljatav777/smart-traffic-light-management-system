import React from "react";
import { 
  LineChart, Line, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer 
} from "recharts";
import { Activity, BarChart3, Database, Zap } from "lucide-react";

const AnalysisPage = ({ history }) => {
  return (
    <div className="analysis-page" style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
      <header>
          <h2 style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <BarChart3 color="var(--color-blue)" /> Traffic Intelligence Analytics
          </h2>
          <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>Deep dive into network performance and flow optimization trends</p>
      </header>

      {/* Primary Efficiency Area Chart */}
      <div className="glass-panel" style={{ padding: "2rem", height: "450px" }}>
          <h3 style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "10px" }}>
            <Activity size={18} color="var(--color-green)" /> Network Efficiency Timeline
          </h3>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={history}>
              <defs>
                <linearGradient id="colorEff" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
              <XAxis dataKey="time" stroke="#94a3b8" fontSize={12} />
              <YAxis stroke="#94a3b8" fontSize={12} domain={[0, 100]} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#020617', border: '1px solid var(--glass-border)', borderRadius: '12px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Area type="monotone" dataKey="efficiency" stroke="#10b981" fillOpacity={1} fill="url(#colorEff)" strokeWidth={3} />
            </AreaChart>
          </ResponsiveContainer>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px" }}>
          {/* Wait Time vs Throughput */}
          <div className="glass-panel" style={{ padding: "1.5rem", height: "350px" }}>
             <h4 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <Zap size={16} color="var(--color-red)" /> Delay-Throughput Correlation
             </h4>
             <ResponsiveContainer width="100%" height="100%">
                <LineChart data={history}>
                   <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                   <XAxis dataKey="time" hide />
                   <YAxis yAxisId="left" stroke="#ef4444" fontSize={10} />
                   <YAxis yAxisId="right" orientation="right" stroke="#3b82f6" fontSize={10} />
                   <Tooltip contentStyle={{ backgroundColor: '#020617', border: 'none' }} />
                   <Legend fontSize={10} />
                   <Line yAxisId="left" type="monotone" dataKey="wait" stroke="#ef4444" strokeWidth={2} dot={false} name="Avg Wait (s)" />
                   <Line yAxisId="right" type="monotone" dataKey="throughput" stroke="#3b82f6" strokeWidth={2} dot={false} name="Total Arrived" />
                </LineChart>
             </ResponsiveContainer>
          </div>

          {/* Peak Congestion Logs */}
          <div className="glass-panel" style={{ padding: "1.5rem", height: "350px" }}>
             <h4 style={{ marginBottom: "1rem", display: "flex", alignItems: "center", gap: "8px" }}>
                <Database size={16} color="var(--color-yellow)" /> Congestion Peak History
             </h4>
             <div style={{ overflowY: "auto", height: "calc(100% - 40px)" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.85rem" }}>
                   <thead>
                      <tr style={{ borderBottom: "1px solid var(--glass-border)", color: "var(--text-muted)", textAlign: "left" }}>
                         <th style={{ padding: "10px" }}>Time Segment</th>
                         <th style={{ padding: "10px" }}>Max Wait</th>
                         <th style={{ padding: "10px" }}>Efficiency</th>
                         <th style={{ padding: "10px" }}>Status</th>
                      </tr>
                   </thead>
                   <tbody>
                      {history.slice(-10).reverse().map((entry, i) => (
                        <tr key={i} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                           <td style={{ padding: "10px", fontFamily: "monospace" }}>{entry.time}</td>
                           <td style={{ padding: "10px", color: entry.wait > 40 ? "var(--color-red)" : "var(--text-main)" }}>{entry.wait}s</td>
                           <td style={{ padding: "10px" }}>{entry.efficiency}%</td>
                           <td style={{ padding: "10px" }}>
                              <span style={{ 
                                padding: "2px 8px", 
                                borderRadius: "10px", 
                                fontSize: "0.7rem", 
                                backgroundColor: entry.efficiency > 70 ? "rgba(16, 185, 129, 0.1)" : "rgba(239, 68, 68, 0.1)",
                                color: entry.efficiency > 70 ? "var(--color-green)" : "var(--color-red)"
                              }}>
                                {entry.efficiency > 70 ? "OPTIMAL" : "CONGESTED"}
                              </span>
                           </td>
                        </tr>
                      ))}
                   </tbody>
                </table>
             </div>
          </div>
      </div>
    </div>
  );
};

export default AnalysisPage;
