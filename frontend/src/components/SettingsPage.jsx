import React, { useState, useEffect } from "react";
import { Settings, Save, RefreshCcw, ShieldCheck, Power, SlidersHorizontal, BellRing, Play, Zap, Radio, Video } from "lucide-react";

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
    const [activeMode, setActiveMode] = useState("MOCK");
    const [switchingMode, setSwitchingMode] = useState(null);

    useEffect(() => {
        const checkStatus = async () => {
            try {
                const [statusRes, modeRes] = await Promise.all([
                    fetch("http://127.0.0.1:8000/simulation/status"),
                    fetch("http://127.0.0.1:8000/simulation/current-mode")
                ]);
                if (statusRes.ok) {
                    const data = await statusRes.json();
                    setSimulationStatus(data.status);
                    setBackendStatus("ONLINE");
                } else {
                    setBackendStatus("ERROR");
                }
                if (modeRes.ok) {
                    const modeData = await modeRes.json();
                    setActiveMode(modeData.mode || "MOCK");
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

    const handleSwitchMode = async (targetMode) => {
        if (targetMode === activeMode) return;
        setSwitchingMode(targetMode);
        try {
            const res = await fetch(
                `http://127.0.0.1:8000/simulation/switch-mode?mode=${targetMode}`,
                { method: "POST" }
            );
            const result = await res.json();
            if (result.status === "switched") {
                setActiveMode(targetMode);
                setSimulationStatus("running");
            } else {
                alert(result.message || "Failed to switch mode");
            }
        } catch (error) {
            alert("Error switching mode: " + error.message);
        }
        setSwitchingMode(null);
    };

    // Mode definitions
    const modes = [
        {
            id: "MOCK",
            label: "MOCK",
            subtitle: "Simulated Data",
            description: "Realistic randomized traffic counts — no hardware needed. Great for testing the RL agent.",
            icon: <Zap size={22} />,
            color: "#10b981",      // green
            bg: "rgba(16, 185, 129, 0.12)",
            border: "rgba(16, 185, 129, 0.35)"
        },
        {
            id: "SUMO",
            label: "SUMO",
            subtitle: "Full Simulation",
            description: "Launches SUMO traffic simulator with TraCI. Requires SUMO installed and SUMO_HOME set.",
            icon: <Radio size={22} />,
            color: "#3b82f6",      // blue
            bg: "rgba(59, 130, 246, 0.12)",
            border: "rgba(59, 130, 246, 0.35)"
        },
        {
            id: "VIDEO",
            label: "VIDEO",
            subtitle: "CCTV / Footage",
            description: "Process uploaded traffic video with YOLOv4 detection. Upload footage via 'Upload Footage' page first.",
            icon: <Video size={22} />,
            color: "#f59e0b",      // amber
            bg: "rgba(245, 158, 11, 0.12)",
            border: "rgba(245, 158, 11, 0.35)"
        }
    ];

    return (
        <div className="settings-page" style={{ display: "flex", flexDirection: "column", gap: "25px" }}>
            <header>
                <h2 style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <Settings color="var(--color-blue)" /> Global System Settings
                </h2>
                <p style={{ color: "var(--text-muted)", marginTop: "4px" }}>Configure hardware parameters and AI optimization heuristics</p>
            </header>

            {/* ============================================
                DATA SOURCE SWITCHER — main feature
            ============================================ */}
            <div className="glass-panel" style={{ padding: "1.75rem" }}>
                <h3 style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "6px", fontSize: "1.05rem" }}>
                    <Radio size={18} color="var(--color-blue)" /> Data Source Mode
                </h3>
                <p style={{ color: "var(--text-muted)", fontSize: "0.82rem", marginBottom: "1.5rem" }}>
                    Switch the traffic data source live. The controller restarts automatically with the new mode.
                </p>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "16px" }}>
                    {modes.map(m => {
                        const isActive = activeMode === m.id;
                        const isSwitching = switchingMode === m.id;
                        return (
                            <button
                                key={m.id}
                                id={`mode-btn-${m.id.toLowerCase()}`}
                                onClick={() => handleSwitchMode(m.id)}
                                disabled={isSwitching || switchingMode !== null}
                                style={{
                                    padding: "1.25rem",
                                    borderRadius: "14px",
                                    border: isActive ? `2px solid ${m.border}` : "2px solid rgba(255,255,255,0.08)",
                                    background: isActive ? m.bg : "rgba(255,255,255,0.03)",
                                    color: isActive ? m.color : "var(--text-muted)",
                                    cursor: isSwitching ? "wait" : (isActive ? "default" : "pointer"),
                                    textAlign: "left",
                                    transition: "all 0.3s ease",
                                    opacity: (switchingMode !== null && !isSwitching) ? 0.5 : 1,
                                    position: "relative",
                                    boxShadow: isActive ? `0 0 20px ${m.bg}` : "none"
                                }}
                            >
                                {/* Active badge */}
                                {isActive && (
                                    <div style={{
                                        position: "absolute", top: "10px", right: "12px",
                                        fontSize: "0.6rem", fontWeight: "800",
                                        color: m.color, backgroundColor: m.bg,
                                        padding: "3px 8px", borderRadius: "20px",
                                        border: `1px solid ${m.border}`, letterSpacing: "0.5px"
                                    }}>
                                        ACTIVE
                                    </div>
                                )}

                                <div style={{ marginBottom: "12px", color: isActive ? m.color : "rgba(255,255,255,0.3)" }}>
                                    {isSwitching ? (
                                        <div style={{ animation: "spin 1s linear infinite", display: "inline-block" }}>⟳</div>
                                    ) : m.icon}
                                </div>

                                <div style={{ fontWeight: "800", fontSize: "1rem", letterSpacing: "1px", marginBottom: "3px" }}>
                                    {isSwitching ? "SWITCHING..." : m.label}
                                </div>
                                <div style={{ fontSize: "0.7rem", fontWeight: "600", opacity: 0.7, marginBottom: "10px" }}>
                                    {m.subtitle}
                                </div>
                                <div style={{ fontSize: "0.75rem", lineHeight: "1.5", color: "var(--text-muted)", fontWeight: "400" }}>
                                    {m.description}
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Status bar */}
                <div style={{
                    marginTop: "16px", padding: "10px 16px",
                    borderRadius: "10px", background: "rgba(255,255,255,0.03)",
                    border: "1px solid rgba(255,255,255,0.07)",
                    fontSize: "0.8rem", color: "var(--text-muted)",
                    display: "flex", alignItems: "center", gap: "10px"
                }}>
                    <div style={{
                        width: "8px", height: "8px", borderRadius: "50%",
                        backgroundColor: switchingMode ? "#f59e0b" : (activeMode === "SUMO" ? "#3b82f6" : activeMode === "VIDEO" ? "#f59e0b" : "#10b981"),
                        animation: "glow-pulse 1s infinite alternate"
                    }} />
                    Controller running in <strong style={{ color: "white" }}>{switchingMode ? "SWITCHING..." : activeMode}</strong> mode
                    &nbsp;·&nbsp;
                    {activeMode === "SUMO" && "SUMO_HOME must be set. SUMO-GUI will open automatically."}
                    {activeMode === "VIDEO" && "Upload videos on the 'Upload Footage' page to feed YOLO detection."}
                    {activeMode === "MOCK" && "Using randomized vehicle counts. Safe for demos and agent training."}
                </div>
            </div>

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
                                <span style={{ color: "var(--text-muted)" }}>FastAPI Backend</span>
                                <span style={{ color: backendStatus === "ONLINE" ? "var(--color-green)" : "var(--color-red)", fontWeight: "bold" }}>{backendStatus}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                                <span style={{ color: "var(--text-muted)" }}>Controller Mode</span>
                                <span style={{ color: "var(--color-blue)", fontWeight: "bold" }}>{activeMode}</span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                                <span style={{ color: "var(--text-muted)" }}>TraCI Integration</span>
                                <span style={{ color: simulationStatus === "running" && activeMode === "SUMO" ? "var(--color-green)" : "var(--text-muted)", fontWeight: "bold" }}>
                                    {simulationStatus === "running" && activeMode === "SUMO" ? "ACTIVE" : "STANDBY"}
                                </span>
                            </div>
                            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "0.85rem" }}>
                                <span style={{ color: "var(--text-muted)" }}>Q-Table Serialization</span>
                                <span style={{ color: "var(--color-blue)", fontWeight: "bold" }}>SYNCED</span>
                            </div>
                        </div>
                    </div>

                    <div className="glass-panel" style={{ padding: "1.5rem" }}>
                        <h4 style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "1rem" }}>
                            <BellRing size={18} color="var(--color-yellow)" /> Operations
                        </h4>
                        <button
                            id="sim-toggle-btn"
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
