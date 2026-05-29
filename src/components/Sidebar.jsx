import { motion } from "framer-motion";
import { NAV_ITEMS } from "../lib/constants.js";

export default function Sidebar({
  nav,
  setNav,
  name,
  streak,
  level,
  xp,
  levelPct,
}) {
  return (
    <aside
      style={{
        width: 240,
        minHeight: "100vh",
        background: "#0f0f0f",
        borderRight: "1px solid rgba(57,255,20,0.12)",
        display: "flex",
        flexDirection: "column",
        padding: "1.5rem 0",
        position: "sticky",
        top: 0,
        zIndex: 10,
      }}
    >
      <div style={{ padding: "0 1.5rem", marginBottom: "2rem" }}>
        <div
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontWeight: 900,
            fontSize: "1.1rem",
            color: "#39ff14",
            letterSpacing: "0.05em",
          }}
        >
          GRIND<span style={{ color: "#fff" }}>TRACKER</span>
        </div>
      </div>
      <nav style={{ flex: 1 }}>
        {NAV_ITEMS.map((item) => (
          <button
            key={item.id}
            onClick={() => setNav(item.id)}
            style={{
              width: "100%",
              padding: "0.75rem 1.5rem",
              background:
                nav === item.id
                  ? "rgba(57,255,20,0.1)"
                  : "transparent",
              border: "none",
              borderLeft:
                nav === item.id
                  ? "3px solid #39ff14"
                  : "3px solid transparent",
              color: nav === item.id ? "#39ff14" : "#555",
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.8rem",
              textAlign: "left",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem",
              transition: "all 0.15s",
              letterSpacing: "0.05em",
            }}
          >
            <span style={{ fontSize: "1rem" }}>{item.icon}</span>
            {item.label}
          </button>
        ))}
      </nav>
      <div
        style={{
          padding: "1rem 1.5rem",
          borderTop: "1px solid rgba(255,255,255,0.06)",
        }}
      >
        <div
          style={{
            fontSize: "0.7rem",
            color: "#39ff14",
            marginBottom: "0.3rem",
          }}
        >
          LVL {level} · {streak} day streak 🔥
        </div>
        <div
          style={{
            height: 4,
            background: "#1a1a1a",
            borderRadius: 2,
            marginBottom: "0.75rem",
            overflow: "hidden",
          }}
        >
          <motion.div
            animate={{ width: `${levelPct}%` }}
            style={{
              height: "100%",
              background: "#39ff14",
              borderRadius: 2,
            }}
          />
        </div>
        <div
          style={{
            fontSize: "0.7rem",
            color: "#444",
            marginBottom: "0.5rem",
          }}
        >
          {name || "Grinder"}
        </div>
      </div>
    </aside>
  );
}
