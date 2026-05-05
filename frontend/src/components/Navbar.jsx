import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { 
  LayoutDashboard, Settings, 
  Database, Activity, Map
} from "lucide-react";

const Navbar = (props) => {
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const menuItems = [
    { name: "Live Dashboard", icon: <LayoutDashboard size={18} />, path: "/" },
    { name: "Traffic Analysis", icon: <Activity size={18} />, path: "/analytics" },
    { name: "Heatmap View", icon: <Map size={18} />, path: "/heatmap" },
    { name: "ML Database", icon: <Database size={18} />, path: "/ml-logs" },
    { name: "System Settings", icon: <Settings size={18} />, path: "/settings" }
  ];

  return (
    <nav className="navbar">
      {/* Premium Branding */}
      <div className="brand-container">
        <div className="brand-icon-wrapper">
          🚦
        </div>
        <div className="brand-text-content">
          <h2 className="brand-title">SMART TRAFFIC</h2>
          <span className="brand-subtitle">AI CONTROL v2.4</span>
        </div>
      </div>

      {/* Desktop Navigation Links */}
      <div className="nav-menu-desktop" style={{ display: "flex", gap: "10px", alignItems: "center", flex: 1, justifyContent: "center" }}>
        {menuItems.map((item, index) => {
          const isActive = location.pathname === item.path;
          return (
            <Link 
              key={index} 
              to={item.path}
              title={item.name}
              style={{
                textDecoration: "none",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                padding: "10px 16px",
                borderRadius: "12px",
                color: isActive ? "#fff" : "var(--text-muted)",
                background: isActive ? "rgba(59, 130, 246, 0.15)" : "transparent",
                border: isActive ? "1px solid rgba(59, 130, 246, 0.3)" : "1px solid transparent",
                transition: "all 0.3s ease",
                fontWeight: isActive ? "600" : "500",
                fontSize: "0.85rem"
              }}
              className="nav-link-horizontal"
            >
              <span style={{ color: isActive ? "var(--color-blue)" : "inherit" }}>{item.icon}</span>
              <span>{item.name}</span>
            </Link>
          );
        })}
      </div>

      {/* Status Badges (Right Side) */}
      <div style={{ display: "flex", gap: "15px", alignItems: "center", marginLeft: "auto" }}>
        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "8px", 
          fontSize: "0.7rem", 
          color: props.isRunning ? "var(--color-green)" : "var(--text-muted)",
          backgroundColor: props.isRunning ? "rgba(16, 185, 129, 0.1)" : "rgba(156, 163, 175, 0.1)",
          padding: "6px 12px",
          borderRadius: "20px",
          border: props.isRunning ? "1px solid rgba(16, 185, 129, 0.2)" : "1px solid rgba(156, 163, 175, 0.2)"
        }}>
          <div style={{ 
            width: "6px", 
            height: "6px", 
            borderRadius: "50%", 
            backgroundColor: props.isRunning ? "var(--color-green)" : "var(--text-muted)", 
            animation: props.isRunning ? "glow-pulse 1s infinite alternate" : "none" 
          }}></div>
          {props.isRunning ? "ENGINE LIVE" : "ENGINE STOPPED"}
        </div>
        
        {props.isRunning && (
          <button 
            onClick={props.onStop}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "8px",
              fontSize: "0.75rem",
              color: "#fff",
              backgroundColor: "rgba(239, 68, 68, 0.2)",
              padding: "8px 16px",
              borderRadius: "12px",
              border: "1px solid rgba(239, 68, 68, 0.3)",
              cursor: "pointer",
              fontWeight: "600",
              transition: "all 0.3s ease",
              animation: "pulse-subtle 2s infinite"
            }}
            onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.4)"}
            onMouseOut={(e) => e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.2)"}
          >
            🛑 STOP ENGINE
          </button>
        )}
      </div>

      {/* Mobile Overlay */}
      <div 
        className={`mobile-overlay ${isMobileMenuOpen ? 'visible' : ''}`} 
        onClick={() => setIsMobileMenuOpen(false)}
      />
    </nav>
  );
};

export default Navbar;
