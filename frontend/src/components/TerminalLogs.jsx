import React, { useEffect, useState, useRef } from "react";
import { Terminal as TerminalIcon, Play, Square } from "lucide-react";

const TerminalLogs = () => {
  const [logs, setLogs] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const endOfLogsRef = useRef(null);

  useEffect(() => {
    let ws;
    let reconnectInterval;

    const connect = () => {
      ws = new WebSocket("ws://127.0.0.1:8000/ws/logs");

      ws.onopen = () => {
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        setLogs(prev => {
          const newLogs = [...prev, event.data];
          return newLogs.length > 1000 ? newLogs.slice(newLogs.length - 1000) : newLogs;
        });
      };

      ws.onclose = () => {
        setIsConnected(false);
        // Try to reconnect every 3 seconds
        reconnectInterval = setTimeout(connect, 3000);
      };
      
      ws.onerror = (err) => {
        console.error("WebSocket error:", err);
      };
    };

    connect();

    return () => {
      clearTimeout(reconnectInterval);
      if (ws) ws.close();
    };
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    if (endOfLogsRef.current) {
      endOfLogsRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [logs]);

  return (
    <div className="terminal-page flex flex-col gap-5">
      <header>
          <h2 style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <TerminalIcon color="var(--color-green)" /> Backend Process Terminal
          </h2>
          <p style={{ color: "var(--text-muted)", marginTop: "8px" }}>Live real-time output from the Python Traffic Controller Engine</p>
      </header>

      <div className="glass-panel" style={{ flexGrow: 1, display: "flex", flexDirection: "column", height: "70vh", padding: "0" }}>
        
        {/* Terminal Header */}
        <div style={{
          padding: "12px 20px", 
          borderBottom: "1px solid rgba(255,255,255,0.05)",
          display: "flex", justifyContent: "space-between", alignItems: "center",
          backgroundColor: "rgba(0,0,0,0.2)",
          borderTopLeftRadius: "16px", borderTopRightRadius: "16px"
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#ef4444" }}></div>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#eab308" }}></div>
            <div style={{ width: "12px", height: "12px", borderRadius: "50%", backgroundColor: "#22c55e" }}></div>
            <span style={{ marginLeft: "12px", fontSize: "0.85rem", color: "var(--text-muted)", fontFamily: "monospace" }}>
              bash — python main.py
            </span>
          </div>
          
          <div style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "0.8rem", color: isConnected ? "var(--color-green)" : "var(--color-red)" }}>
            {isConnected ? <><Play size={14} /> CONNECTED</> : <><Square size={14} /> DISCONNECTED</>}
          </div>
        </div>

        {/* Terminal Body */}
        <div style={{
          flexGrow: 1,
          padding: "20px",
          overflowY: "auto",
          fontFamily: "'Courier New', Courier, monospace",
          fontSize: "0.9rem",
          backgroundColor: "#050505",
          borderBottomLeftRadius: "16px",
          borderBottomRightRadius: "16px",
          color: "#e2e8f0",
          lineHeight: "1.5"
        }}>
          {logs.length === 0 && isConnected && (
             <div style={{ color: "var(--text-muted)" }}>[Waiting for process logs...]</div>
          )}
          {logs.map((log, index) => {
            let color = "#e2e8f0";
            if (log.includes("[ERROR]") || log.includes("CRITICAL")) color = "#ef4444";
            else if (log.includes("[WARNING]")) color = "#eab308";
            else if (log.includes("[SYSTEM]") || log.includes("[SUMO]")) color = "#3b82f6";
            else if (log.includes("GREEN") || log.includes("Connected Successfully")) color = "#10b981";
            else if (log.includes("Action:")) color = "#8b5cf6";

            return (
              <div key={index} style={{ color, wordBreak: "break-all", marginBottom: "4px" }}>
                {log}
              </div>
            );
          })}
          <div ref={endOfLogsRef} />
        </div>
      </div>
    </div>
  );
};

export default TerminalLogs;
