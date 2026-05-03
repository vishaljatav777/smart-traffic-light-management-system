import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

// Components
import Dashboard from "./components/Dashboard";
import AnalyticsPanel from "./components/AnalyticsPanel";
import Navbar from "./components/Navbar";
import CCTVPanel from "./components/CCTVPanel";
import AnalysisPage from "./components/AnalysisPage";
import HeatmapView from "./components/HeatmapView";
import MLDatabase from "./components/MLDatabase";
import SettingsPage from "./components/SettingsPage";
import VideoUpload from "./components/VideoUpload";

const DashboardView = ({ data, history }) => (
  <div className="dashboard-grid" style={{ 
    display: "grid", 
    gridTemplateColumns: "1fr 1.5fr", 
    gap: "30px"
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
                  <Tooltip contentStyle={{ backgroundColor: '#020617', border: 'none' }} />
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
);

function App() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [isEngineRunning, setIsEngineRunning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      fetch("http://127.0.0.1:8000/live-status")
        .then(res => res.json())
        .then(newData => {
          setData(newData);
          // FIX #8: Only show "Running" when real traffic data is present
          setIsEngineRunning(newData.current_direction !== null && newData.current_direction !== undefined);
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
        .catch(err => {
          console.log(err);
          setIsEngineRunning(false);
        });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const stopEngine = async () => {
    try {
      const resp = await fetch("http://127.0.0.1:8000/simulation/stop", { method: "POST" });
      if (resp.ok) {
        alert("Traffic Engine Stopped successfully.");
      }
    } catch (err) {
      console.error("Stop error:", err);
    }
  };


  return (
    <Router>
      <div className="app-layout">
        <Navbar onStop={stopEngine} isRunning={isEngineRunning} />
        
        <main className="main-content">

          <Routes>
            <Route path="/" element={<DashboardView data={data} history={history} />} />
            <Route path="/cctv" element={<CCTVPanel />} />
            <Route path="/analytics" element={<AnalysisPage history={history} />} />
            <Route path="/heatmap" element={<HeatmapView latestData={data} />} />
            <Route path="/ml-logs" element={<MLDatabase latestData={data} />} />
            <Route path="/upload" element={<VideoUpload onStop={stopEngine} />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<DashboardView data={data} history={history} />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
