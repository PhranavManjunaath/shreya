import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { today, fmtDate } from "../lib/helpers.js";
import useMediaQuery from "../lib/useMediaQuery.js";
import GlassCard from "./shared/GlassCard.jsx";
import PageHeader from "./shared/PageHeader.jsx";
import SectionLabel from "./shared/SectionLabel.jsx";

const loadLogs = () => {
  try {
    const raw = localStorage.getItem("gt_calorie_logs");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

const loadRatios = () => {
  try {
    const raw = localStorage.getItem("gt_macro_ratios");
    return raw ? JSON.parse(raw) : { protein: 30, carbs: 40, fat: 30 };
  } catch {
    return { protein: 30, carbs: 40, fat: 30 };
  }
};

export default function CalorieTracker() {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [logs, setLogs] = useState(loadLogs);
  const [ratios, setRatios] = useState(loadRatios);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const todayStr = today();

  const todayEntry = logs.find((l) => l.date === todayStr);
  const [breakfast, setBreakfast] = useState(todayEntry?.breakfast ?? "");
  const [lunch, setLunch] = useState(todayEntry?.lunch ?? "");
  const [dinner, setDinner] = useState(todayEntry?.dinner ?? "");
  const [snacks, setSnacks] = useState(todayEntry?.snacks ?? "");

  useEffect(() => {
    try {
      localStorage.setItem("gt_macro_ratios", JSON.stringify(ratios));
    } catch {}
  }, [ratios]);

  const parse = (v) => parseInt(v, 10) || 0;
  const total = parse(breakfast) + parse(lunch) + parse(dinner) + parse(snacks);

  const proteinG = Math.round((total * (ratios.protein / 100)) / 4);
  const carbsG = Math.round((total * (ratios.carbs / 100)) / 4);
  const fatG = Math.round((total * (ratios.fat / 100)) / 9);

  const saveToday = () => {
    setLogs((prev) => {
      const filtered = prev.filter((l) => l.date !== todayStr);
      return [
        ...filtered,
        {
          date: todayStr,
          breakfast: parse(breakfast),
          lunch: parse(lunch),
          dinner: parse(dinner),
          snacks: parse(snacks),
          total,
        },
      ];
    });
  };

  useEffect(() => {
    saveToday();
  }, [breakfast, lunch, dinner, snacks]);

  const pastLogs = [...logs]
    .filter((l) => l.date !== todayStr)
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 14);

  const updateRatio = (key, val) => {
    const n = Math.min(100, Math.max(0, parseInt(val, 10) || 0));
    setRatios((prev) => {
      const next = { ...prev, [key]: n };
      const sum = next.protein + next.carbs + next.fat;
      if (sum > 100) {
        if (key === "protein") {
          next.carbs = Math.max(0, next.carbs - (sum - 100));
        } else if (key === "carbs") {
          next.fat = Math.max(0, next.fat - (sum - 100));
        } else {
          next.protein = Math.max(0, next.protein - (sum - 100));
        }
      }
      return next;
    });
  };

  const inputStyle = {
    width: "100%",
    background: "transparent",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: 8,
    color: "#e8e8e8",
    fontFamily: "'Orbitron', sans-serif",
    fontSize: "1.4rem",
    fontWeight: 700,
    padding: "0.5rem",
    textAlign: "center",
    outline: "none",
    boxSizing: "border-box",
  };

  return (
    <div>
      <PageHeader title="Calorie Tracker" sub="Monitor your daily nutrition" />

      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "1rem" }}>
        <button
          onClick={() => setSettingsOpen((o) => !o)}
          style={{
            background: "transparent",
            border: "1px solid rgba(255,255,255,0.08)",
            borderRadius: 8,
            color: "#888",
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.65rem",
            padding: "0.4rem 0.75rem",
            cursor: "pointer",
            letterSpacing: "0.1em",
          }}
        >
          ⚙ MACRO SETTINGS
        </button>
      </div>

      {settingsOpen && (
        <GlassCard style={{ marginBottom: "1rem" }}>
          <SectionLabel>Macro Ratio Settings</SectionLabel>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr 1fr",
              gap: "1rem",
              marginTop: "0.5rem",
            }}
          >
            {[
              { key: "protein", label: "Protein", color: "#ff9f0a", unit: "g (÷4)" },
              { key: "carbs", label: "Carbs", color: "#30d0fe", unit: "g (÷4)" },
              { key: "fat", label: "Fat", color: "#bf5af2", unit: "g (÷9)" },
            ].map((m) => (
              <div key={m.key}>
                <div
                  style={{
                    fontSize: "0.65rem",
                    color: m.color,
                    marginBottom: "0.3rem",
                    letterSpacing: "0.1em",
                  }}
                >
                  {m.label} ({ratios[m.key]}%)
                </div>
                <input
                  type="range"
                  min={5}
                  max={70}
                  value={ratios[m.key]}
                  onChange={(e) => updateRatio(m.key, e.target.value)}
                  style={{ width: "100%" }}
                />
                <div
                  style={{
                    fontSize: "0.55rem",
                    color: "#555",
                    marginTop: "0.15rem",
                  }}
                >
                  {m.unit}
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
          gap: "0.75rem",
          marginBottom: "1rem",
        }}
      >
        {[
          { key: "breakfast", label: "Breakfast", val: breakfast, set: setBreakfast },
          { key: "lunch", label: "Lunch", val: lunch, set: setLunch },
          { key: "dinner", label: "Dinner", val: dinner, set: setDinner },
          { key: "snacks", label: "Snacks", val: snacks, set: setSnacks },
        ].map((m) => (
          <GlassCard key={m.key}>
            <div
              style={{
                fontSize: "0.6rem",
                color: "#555",
                letterSpacing: "0.1em",
                marginBottom: "0.4rem",
              }}
            >
              {m.label}
            </div>
            <input
              type="number"
              min={0}
              value={m.val}
              onChange={(e) => m.set(e.target.value)}
              placeholder="0"
              style={inputStyle}
            />
          </GlassCard>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
          gap: "1rem",
          marginBottom: "1.5rem",
        }}
      >
        <GlassCard>
          <SectionLabel>Total Daily Calories</SectionLabel>
          <div
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: isMobile ? "2rem" : "2.5rem",
              fontWeight: 700,
              color: total > 0 ? "#39ff14" : "#555",
              textAlign: "center",
              padding: "0.5rem 0",
            }}
          >
            {total > 0 ? total : "—"}
            {total > 0 && (
              <span style={{ fontSize: "0.9rem", color: "#888" }}> kcal</span>
            )}
          </div>
        </GlassCard>

        <GlassCard>
          <SectionLabel>Estimated Macros</SectionLabel>
          {total > 0 ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem", padding: "0.5rem 0" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.7rem", color: "#ff9f0a" }}>Protein</span>
                <span style={{ fontSize: "0.85rem", color: "#e8e8e8", fontFamily: "'Orbitron', sans-serif" }}>
                  {proteinG}g <span style={{ fontSize: "0.6rem", color: "#555" }}>({ratios.protein}%)</span>
                </span>
              </div>
              <div style={{ height: 4, background: "#1a1a1a", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${ratios.protein}%`, height: "100%", background: "#ff9f0a", borderRadius: 2 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.7rem", color: "#30d0fe" }}>Carbs</span>
                <span style={{ fontSize: "0.85rem", color: "#e8e8e8", fontFamily: "'Orbitron', sans-serif" }}>
                  {carbsG}g <span style={{ fontSize: "0.6rem", color: "#555" }}>({ratios.carbs}%)</span>
                </span>
              </div>
              <div style={{ height: 4, background: "#1a1a1a", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${ratios.carbs}%`, height: "100%", background: "#30d0fe", borderRadius: 2 }} />
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: "0.7rem", color: "#bf5af2" }}>Fat</span>
                <span style={{ fontSize: "0.85rem", color: "#e8e8e8", fontFamily: "'Orbitron', sans-serif" }}>
                  {fatG}g <span style={{ fontSize: "0.6rem", color: "#555" }}>({ratios.fat}%)</span>
                </span>
              </div>
              <div style={{ height: 4, background: "#1a1a1a", borderRadius: 2, overflow: "hidden" }}>
                <div style={{ width: `${ratios.fat}%`, height: "100%", background: "#bf5af2", borderRadius: 2 }} />
              </div>
            </div>
          ) : (
            <div style={{ fontSize: "0.7rem", color: "#444", padding: "0.5rem 0" }}>
              Enter calories above to see macros
            </div>
          )}
        </GlassCard>
      </div>

      {pastLogs.length > 0 && (
        <GlassCard>
          <SectionLabel>Recent History</SectionLabel>
          <div style={{ overflowX: "auto", marginTop: "0.5rem" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.7rem" }}>
              <thead>
                <tr style={{ color: "#555", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <th style={{ padding: "0.35rem 0.5rem", textAlign: "left" }}>Date</th>
                  <th style={{ padding: "0.35rem 0.5rem", textAlign: "right" }}>B</th>
                  <th style={{ padding: "0.35rem 0.5rem", textAlign: "right" }}>L</th>
                  <th style={{ padding: "0.35rem 0.5rem", textAlign: "right" }}>D</th>
                  <th style={{ padding: "0.35rem 0.5rem", textAlign: "right" }}>S</th>
                  <th style={{ padding: "0.35rem 0.5rem", textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {pastLogs.slice(0, 14).map((l) => (
                  <tr key={l.date} style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}>
                    <td style={{ padding: "0.35rem 0.5rem", color: "#888" }}>{fmtDate(l.date)}</td>
                    <td style={{ padding: "0.35rem 0.5rem", textAlign: "right", color: "#ccc" }}>{l.breakfast}</td>
                    <td style={{ padding: "0.35rem 0.5rem", textAlign: "right", color: "#ccc" }}>{l.lunch}</td>
                    <td style={{ padding: "0.35rem 0.5rem", textAlign: "right", color: "#ccc" }}>{l.dinner}</td>
                    <td style={{ padding: "0.35rem 0.5rem", textAlign: "right", color: "#ccc" }}>{l.snacks}</td>
                    <td style={{ padding: "0.35rem 0.5rem", textAlign: "right", color: "#39ff14", fontWeight: 700 }}>
                      {l.total}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassCard>
      )}
    </div>
  );
}
