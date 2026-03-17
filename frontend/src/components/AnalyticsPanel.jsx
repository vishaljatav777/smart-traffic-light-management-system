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
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "15px" }}>
        {metrics.map((m, i) => (
          <div key={i} className="glass-panel" style={{ padding: "1rem", display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{ backgroundColor: "rgba(255,255,255,0.05)", padding: "10px", borderRadius: "12px" }}>
              {m.icon}
            </div>
            <div>
              <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", textTransform: "uppercase" }}>{m.label}</div>
              <div style={{ fontSize: "1.1rem", fontWeight: "bold", color: m.color }}>{m.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Deep Charts Section */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
        
        {/* Vehicle Distribution (Pie) */}
        <div className="glass-panel" style={{ padding: "1.5rem", height: "300px" }}>
          <h4 style={{ margin: "0 0 1rem 0", fontSize: "1rem" }}>Vehicle Distribution</h4>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Efficiency Trend (Bar) */}
        <div className="glass-panel" style={{ padding: "1.5rem", height: "300px" }}>
          <h4 style={{ margin: "0 0 1rem 0", fontSize: "1rem" }}>Efficiency Trend</h4>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={history.slice(-10)} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" vertical={false} />
              <XAxis dataKey="time" hide />
              <YAxis stroke="#94a3b8" fontSize={10} domain={[0, 100]} tickCount={6} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#0f172a', border: 'none', borderRadius: '8px' }}
                itemStyle={{ color: '#fff' }}
              />
              <Bar 
                dataKey="efficiency" 
                fill="#10b981" 
                radius={[4, 4, 0, 0]} 
                isAnimationActive={false} 
                minPointSize={10}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>

      </div>

    </div>
  );
};

export default AnalyticsPanel;
