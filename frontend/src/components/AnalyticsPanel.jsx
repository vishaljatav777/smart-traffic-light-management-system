import React from "react";
import { 
  BarChart, Bar, 
  PieChart, Pie, Cell, 
  ResponsiveContainer, 
  XAxis, YAxis, 
  CartesianGrid, Tooltip, Legend 
} from "recharts";
import { Activity, TrendingUp, AlertTriangle, CheckCircle } from "lucide-react";

const AnalyticsPanel = ({ history, latestData }) => {
  
  if (!latestData) return null;

  const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444'];
  
  // Prepare data for vehicle type distribution
  const typeDistribution = Object.entries(latestData.detailed_stats?.types || {}).map(([key, value]) => ({
    name: key.charAt(0).toUpperCase() + key.slice(1),
    value: value
  })).filter(item => item.value > 0);

  // If no detailed stats yet, fallback to direction distribution
  const chartData = typeDistribution.length > 0 ? typeDistribution : 
    Object.entries(latestData.vehicle_counts || {}).map(([key, value]) => ({
      name: key.split('_')[0],
      value: value
    }));

  // Summary Metrics
  const metrics = [
    { 
      label: "System Efficiency", 
      value: `${latestData.efficiency}%`, 
      icon: <Activity size={20} color="#10b981" />,
      color: "#10b981" 
    },
    { 
      label: "Peak Wait Time", 
      value: `${latestData.peak_wait}s`, 
      icon: <AlertTriangle size={20} color="#ef4444" />,
      color: "#ef4444" 
    },
    { 
      label: "Total Arrived", 
      value: latestData.throughput, 
      icon: <CheckCircle size={20} color="#3b82f6" />,
      color: "#3b82f6" 
    },
    { 
      label: "Avg Wait Trend", 
      value: latestData.average_wait > 30 ? "High" : "Optimal", 
      icon: <TrendingUp size={20} color="#f59e0b" />,
      color: "#f59e0b" 
    }
  ];

  return (
    <div className="analytics-container" style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
      
      {/* Summary Cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "20px" }}>
        {metrics.map((m, i) => (
          <div key={i} className="glass-panel" style={{ padding: "1.25rem", display: "flex", alignItems: "center", gap: "15px" }}>
            <div style={{ backgroundColor: "rgba(255,255,255,0.03)", padding: "12px", borderRadius: "14px", border: "1px solid rgba(255,255,255,0.05)" }}>
              {m.icon}
            </div>
            <div>
              <div style={{ fontSize: "0.7rem", color: "var(--text-muted)", textTransform: "uppercase", fontWeight: "600", letterSpacing: "0.5px" }}>{m.label}</div>
              <div style={{ fontSize: "1.2rem", fontWeight: "700", color: m.color, marginTop: "2px" }}>{m.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Deep Charts Section */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "25px" }}>
        
        {/* Vehicle Distribution (Pie) */}
        <div className="glass-panel">
          <div className="card-header">
            <h4>Vehicle Distribution</h4>
          </div>
          <div className="card-body" style={{ height: "260px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentClassName="custom-tooltip" />
                <Legend iconType="circle" wrapperStyle={{ fontSize: "12px", paddingTop: "10px" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Efficiency Trend (Bar) */}
        <div className="glass-panel">
          <div className="card-header">
            <h4>Efficiency Trend</h4>
          </div>
          <div className="card-body" style={{ height: "260px" }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={history.slice(-10)} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" hide />
                <YAxis stroke="#64748b" fontSize={10} domain={[0, 100]} tickCount={6} axisLine={false} tickLine={false} />
                <Tooltip contentClassName="custom-tooltip" />
                <Bar 
                  dataKey="efficiency" 
                  fill="var(--color-green)" 
                  radius={[6, 6, 0, 0]} 
                  isAnimationActive={false} 
                  minPointSize={10}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

    </div>
  );
};

export default AnalyticsPanel;
