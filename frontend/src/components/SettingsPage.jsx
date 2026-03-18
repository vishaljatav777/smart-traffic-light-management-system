import React, { useState, useEffect } from "react";
import { Settings, Save, RefreshCcw, ShieldCheck, Power, SlidersHorizontal, BellRing, Play } from "lucide-react";

const SettingsPage = () => {
    const [settings, setSettings] = useState({
        simulationFlow: 0.15,
        phaseDuration: 30,
        emergencyOverride: true,
        aiMode: "Hybrid",
        notifications: true,
        logLevel: "Detailed"
    });

    const [simulationStatus, setSimulationStatus] = useState("unknown");
    const [backendStatus, setBackendStatus] = useState("CHECKING");
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const res = await fetch("http://127.0.0.1:8000/simulation/status");
                if (res.ok) {
                    const data = await res.json();
                    setSimulationStatus(data.status);
                    setBackendStatus("ONLINE");
                } else {
                    setBackendStatus("ERROR");
                }
            } catch (error) {
                setBackendStatus("OFFLINE");
                setSimulationStatus("unknown");
            }
        };

        checkStatus();
        const interval = setInterval(checkStatus, 3000);
        return () => clearInterval(interval);
    }, []);

    const handleChange = (key, val) => {
        setSettings(prev => ({ ...prev, [key]: val }));
    };

    const handleStartSimulation = async () => {
        setIsLoading(true);
        try {
            await fetch("http://127.0.0.1:8000/simulation/start?nogui=true", { method: "POST" });
            setSimulationStatus("running");
        } catch (error) {
            console.error("Failed to start simulation", error);
        }
        setIsLoading(false);
    };

    const handleStopSimulation = async () => {
        setIsLoading(true);
        try {
            await fetch("http://127.0.0.1:8000/simulation/stop", { method: "POST" });
            setSimulationStatus("stopped");
        } catch (error) {
            console.error("Failed to stop simulation", error);
        }
        setIsLoading(false);
    };

    return (
        <div className="settings-page" style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            <header>
                <h2 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Settings color="var(--color-blue)" /> Global System Settings
                </h2>
                <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>Configure hardware parameters and AI optimization heuristics</p>
            </header>

            <div style={{ display: "grid", gridTemplateColumns: "2fr 1.2fr", gap: "25px" }}>
                {/* Simulation Control */}
                <div className="glass-panel" style={{ padding: "1.5rem" }}>
                    <h3 style={{ marginBottom: "1.5rem", display: "flex", alignItems: "center", gap: "10px", fontSize: "1.1rem" }}>
                        <SlidersHorizontal size={18} color="var(--color-blue)" /> Simulation Parameters
                    </h3>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                <label style={{ fontSize: "0.9rem" }}>Vehicle Flow Probability</label>
                                <span style={{ fontWeight: "bold", color: "var(--color-blue)" }}>{settings.simulationFlow * 100}%</span>
                            </div>
                            <input 
                                type="range" min="0.05" max="0.5" step="0.01" 
                                value={settings.simulationFlow} 
                                onChange={(e) => handleChange('simulationFlow', parseFloat(e.target.value))}
                                style={{ width: "100%", accentColor: "var(--color-blue)" }} 
                            />
                        </div>

                        <div>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
                                <label style={{ fontSize: "0.9rem" }}>Base Green Phase Duration (s)</label>
                                <span style={{ fontWeight: "bold", color: "var(--color-blue)" }}>{settings.phaseDuration}s</span>
                            </div>
                            <input 
                                type="range" min="10" max="60" step="1" 
                                value={settings.phaseDuration} 
                                onChange={(e) => handleChange('phaseDuration', parseInt(e.target.value))}
                                style={{ width: "100%", accentColor: "var(--color-blue)" }} 
                            />
                        </div>

                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px", backgroundColor: "rgba(255,255,255,0.02)", borderRadius: "12px" }}>
                            <div>
                                <div style={{ fontWeight: "600" }}>Emergency Vehicle Override</div>
                                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Automatically grant green phase to priority lanes</div>
                            </div>
                            <button 
                                onClick={() => handleChange('emergencyOverride', !settings.emergencyOverride)}
                                style={{ 
                                    padding: "8px 20px", 
                                    borderRadius: "20px", 
                                    border: "none", 
                                    backgroundColor: settings.emergencyOverride ? "rgba(16, 185, 129, 0.15)" : "rgba(239, 68, 68, 0.15)",
                                    color: settings.emergencyOverride ? "var(--color-green)" : "var(--color-red)",
                                    fontWeight: "bold",
                                    cursor: "pointer"
                                }}
                            >
                                {settings.emergencyOverride ? "ENABLED" : "DISABLED"}
                            </button>
                        </div>
                    </div>

                    <div style={{ marginTop: "2rem", display: "flex", gap: "10px" }}>
                        <button style={{ backgroundColor: "var(--color-blue)", color: "white", border: "none", padding: "12px 25px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                            <Save size={18} /> Apply Changes
                        </button>
                        <button style={{ backgroundColor: "rgba(255,255,255,0.05)", color: "white", border: "none", padding: "12px 25px", borderRadius: "10px", fontWeight: "bold", cursor: "pointer", display: "flex", alignItems: "center", gap: "8px" }}>
                            <RefreshCcw size={18} /> Reset Defaults
                        </button>
                    </div>
                </div>

                {/* System Status & Services */}
                <div style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
                    <div className="glass-panel" style={{ padding: "1.5rem" }}>
                        <h4 style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
                             <ShieldCheck size={18} color="var(--color-green)" /> System Integrity
                        </h4>
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                                <span style={{ color: "var(--text-muted)" }}>FASTAPI Backend</span>
                                <span style={{ color: backendStatus === "ONLINE" ? "var(--color-green)" : "var(--color-red)", fontWeight: "bold" }}>{backendStatus}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                                <span style={{ color: "var(--text-muted)" }}>TraCI Integration</span>
                                <span style={{ color: simulationStatus === "running" ? "var(--color-green)" : "var(--text-muted)", fontWeight: "bold" }}>{simulationStatus === "running" ? "ACTIVE" : "STANDBY"}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                                <span color="var(--text-muted)">Q-Table Serialization</span>
                                <span style={{ color: "var(--color-blue)", fontWeight: "bold" }}>SYNCED</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: "1.5rem" }}>
                        <h4 style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
                             <BellRing size={18} color="var(--color-yellow)" /> Operations
                        </h4>
                        <button 
                            onClick={simulationStatus === "running" ? handleStopSimulation : handleStartSimulation}
                            disabled={isLoading}
                            style={{ 
                                width: "100%", marginBottom: "10px", padding: "10px", 
                                backgroundColor: simulationStatus === "running" ? "rgba(239, 68, 68, 0.1)" : "rgba(16, 185, 129, 0.1)", 
                                border: `1px solid ${simulationStatus === "running" ? "rgba(239, 68, 68, 0.2)" : "rgba(16, 185, 129, 0.2)"}`, 
                                color: simulationStatus === "running" ? "var(--color-red)" : "var(--color-green)", 
                                borderRadius: "8px", fontWeight: "600", 
                                cursor: isLoading ? "not-allowed" : "pointer", 
                                opacity: isLoading ? 0.7 : 1, 
                                display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" 
                            }}>
                           {simulationStatus === "running" ? <><Power size={18} /> SHUTDOWN SIMULATION</> : <><Play size={18} /> START SIMULATION</>}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SettingsPage;
