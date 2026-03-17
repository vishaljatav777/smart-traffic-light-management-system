import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from "recharts";
import Dashboard from "./components/Dashboard";
import AnalyticsPanel from "./components/AnalyticsPanel";

function App() {

  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("http://127.0.0.1:8000/live-status")
        .then(res => res.json())
        .then(newData => {
          setData(newData); // Store the raw live status for the Dashboard

          setHistory(prev => {
            const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit' });
            return [
              ...prev.slice(-20),
              {
                time: timestamp,
                wait: newData.average_wait || 0,
                throughput: newData.throughput || 0,
                peak_wait: newData.peak_wait || 0,
                efficiency: newData.efficiency || 0,
                counts: newData.vehicle_counts || {},
                detailed: newData.detailed_stats || {}
              }
            ];
          });
        })
        .catch(err => console.log(err));
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="app-container">
      <header className="glass-panel dashboard-header">
        <h1 style={{ margin: 0, display: "flex", alignItems: "center", gap: "10px" }}>
           🚦 Deep RL Traffic Control
        </h1>
        <div style={{ padding: "5px 15px", backgroundColor: "var(--bg-dark)", borderRadius: "20px", fontSize: "0.9rem" }}>
          Live SUMO Integration
        </div>
      </header>

      <div className="dashboard-grid" style={{ 
        display: "grid", 
        gridTemplateColumns: "1fr 1.5fr", 
        gap: "20px", 
        padding: "0 20px" 
      }}>
        {/* Left Col: Live Status & Traffic Signals */}
        <div className="flex flex-col gap-5">
           <div className="glass-panel" style={{ padding: "1.5rem" }}>
              <Dashboard liveData={data} />
           </div>
           
           {/* Performance Graph */}
           <div className="glass-panel chart-container" style={{ display: "flex", flexDirection: "column", padding: "1.5rem" }}>
                <h3 style={{ marginBottom: "1.5rem", textAlign: "center" }}>Real-time Network Flow</h3>
                <div style={{ flexGrow: 1, width: "100%", height: "250px" }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={history} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                      <XAxis dataKey="time" stroke="#94a3b8" fontSize={10} />
                      <YAxis stroke="#94a3b8" fontSize={10} />
                      <Tooltip contentStyle={{ backgroundColor: '#0f172a', border: 'none' }} />
                      <Line type="monotone" dataKey="wait" stroke="#ef4444" name="Avg Wait" strokeWidth={3} dot={false} isAnimationActive={false} />
                      <Line type="monotone" dataKey="throughput" stroke="#10b981" name="Throughput" strokeWidth={3} dot={false} isAnimationActive={false} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
            </div>
        </div>

        {/* Right Col: Deep Analytics Overview */}
        <div className="flex flex-col gap-5">
           <AnalyticsPanel history={history} latestData={data} />
        </div>
      </div>
    </div>
  );
}

export default App;
