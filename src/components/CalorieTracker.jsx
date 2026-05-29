import { useState, useEffect, useMemo } from "react";
import { today } from "../lib/helpers.js";
import { useSyncData } from "../lib/sync.js";
import useMediaQuery from "../lib/useMediaQuery.js";
import GlassCard from "./shared/GlassCard.jsx";
import PageHeader from "./shared/PageHeader.jsx";
import SectionLabel from "./shared/SectionLabel.jsx";
import CalorieInputCard from "./CalorieInputCard.jsx";
import CalorieAnalytics from "./CalorieAnalytics.jsx";

const emptyMeal = () => ({ cal: "", protein: "", carbs: "", fat: "", fiber: "" });

const parseNum = (v) => {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
};

export default function CalorieTracker() {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [logs, setLogs] = useSyncData("calorie_logs", []);
  const [view, setView] = useState("log");
  const todayStr = today();

  const todayEntry = useMemo(() => logs.find((l) => l.date === todayStr), [logs, todayStr]);

  const [breakfast, setBreakfast] = useState(todayEntry?.b_cal !== undefined
    ? { cal: todayEntry.b_cal, protein: todayEntry.b_protein, carbs: todayEntry.b_carbs, fat: todayEntry.b_fat, fiber: todayEntry.b_fiber }
    : emptyMeal()
  );
  const [lunch, setLunch] = useState(todayEntry?.l_cal !== undefined
    ? { cal: todayEntry.l_cal, protein: todayEntry.l_protein, carbs: todayEntry.l_carbs, fat: todayEntry.l_fat, fiber: todayEntry.l_fiber }
    : emptyMeal()
  );
  const [dinner, setDinner] = useState(todayEntry?.d_cal !== undefined
    ? { cal: todayEntry.d_cal, protein: todayEntry.d_protein, carbs: todayEntry.d_carbs, fat: todayEntry.d_fat, fiber: todayEntry.d_fiber }
    : emptyMeal()
  );
  const [snacks, setSnacks] = useState(todayEntry?.s_cal !== undefined
    ? { cal: todayEntry.s_cal, protein: todayEntry.s_protein, carbs: todayEntry.s_carbs, fat: todayEntry.s_fat, fiber: todayEntry.s_fiber }
    : emptyMeal()
  );

  const totals = useMemo(() => {
    const all = [breakfast, lunch, dinner, snacks];
    return {
      total_cal: all.reduce((s, m) => s + parseNum(m.cal), 0),
      total_protein: all.reduce((s, m) => s + parseNum(m.protein), 0),
      total_carbs: all.reduce((s, m) => s + parseNum(m.carbs), 0),
      total_fat: all.reduce((s, m) => s + parseNum(m.fat), 0),
      total_fiber: all.reduce((s, m) => s + parseNum(m.fiber), 0),
    };
  }, [breakfast, lunch, dinner, snacks]);

  const saveToday = () => {
    const entry = {
      date: todayStr,
      b_cal: parseNum(breakfast.cal),
      b_protein: parseNum(breakfast.protein),
      b_carbs: parseNum(breakfast.carbs),
      b_fat: parseNum(breakfast.fat),
      b_fiber: parseNum(breakfast.fiber),
      l_cal: parseNum(lunch.cal),
      l_protein: parseNum(lunch.protein),
      l_carbs: parseNum(lunch.carbs),
      l_fat: parseNum(lunch.fat),
      l_fiber: parseNum(lunch.fiber),
      d_cal: parseNum(dinner.cal),
      d_protein: parseNum(dinner.protein),
      d_carbs: parseNum(dinner.carbs),
      d_fat: parseNum(dinner.fat),
      d_fiber: parseNum(dinner.fiber),
      s_cal: parseNum(snacks.cal),
      s_protein: parseNum(snacks.protein),
      s_carbs: parseNum(snacks.carbs),
      s_fat: parseNum(snacks.fat),
      s_fiber: parseNum(snacks.fiber),
      ...totals,
    };
    setLogs((prev) => {
      const filtered = prev.filter((l) => l.date !== todayStr);
      return [...filtered, entry];
    });
  };

  useEffect(() => {
    saveToday();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [breakfast, lunch, dinner, snacks]);

  const totalBarStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "0.3rem 0",
    borderBottom: "1px solid rgba(255,255,255,0.04)",
  };

  return (
    <div>
      <PageHeader title="Calorie Tracker" sub="Log your daily nutrition" />

      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        <button
          onClick={() => setView("log")}
          style={{
            padding: "0.4rem 1rem",
            background: view === "log" ? "rgba(57,255,20,0.1)" : "transparent",
            border: view === "log" ? "1px solid rgba(57,255,20,0.4)" : "1px solid rgba(255,255,255,0.06)",
            borderRadius: 8,
            color: view === "log" ? "#39ff14" : "#555",
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.65rem",
            cursor: "pointer",
            letterSpacing: "0.1em",
          }}
        >
          LOG
        </button>
        <button
          onClick={() => setView("analytics")}
          style={{
            padding: "0.4rem 1rem",
            background: view === "analytics" ? "rgba(57,255,20,0.1)" : "transparent",
            border: view === "analytics" ? "1px solid rgba(57,255,20,0.4)" : "1px solid rgba(255,255,255,0.06)",
            borderRadius: 8,
            color: view === "analytics" ? "#39ff14" : "#555",
            fontFamily: "'Space Mono', monospace",
            fontSize: "0.65rem",
            cursor: "pointer",
            letterSpacing: "0.1em",
          }}
        >
          ANALYTICS
        </button>
      </div>

      {view === "log" && (
        <>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: isMobile ? "1fr 1fr" : "repeat(4, 1fr)",
              gap: "0.75rem",
              marginBottom: "1.5rem",
            }}
          >
            <CalorieInputCard label="Breakfast" values={breakfast} onChange={setBreakfast} />
            <CalorieInputCard label="Lunch" values={lunch} onChange={setLunch} />
            <CalorieInputCard label="Dinner" values={dinner} onChange={setDinner} />
            <CalorieInputCard label="Snacks" values={snacks} onChange={setSnacks} />
          </div>

          <GlassCard>
            <SectionLabel>Daily Totals</SectionLabel>
            <div style={totalBarStyle}>
              <span style={{ fontSize: "0.7rem", color: "#39ff14" }}>Calories</span>
              <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1.2rem", fontWeight: 700, color: "#39ff14" }}>
                {totals.total_cal}
                <span style={{ fontSize: "0.7rem", color: "#888", fontFamily: "'Space Mono', monospace" }}> kcal</span>
              </span>
            </div>
            <div style={totalBarStyle}>
              <span style={{ fontSize: "0.7rem", color: "#ff9f0a" }}>Protein</span>
              <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1rem", fontWeight: 700, color: "#ff9f0a" }}>
                {totals.total_protein.toFixed(1)}<span style={{ fontSize: "0.65rem", color: "#888", fontFamily: "'Space Mono', monospace" }}> g</span>
              </span>
            </div>
            <div style={totalBarStyle}>
              <span style={{ fontSize: "0.7rem", color: "#30d0fe" }}>Carbs</span>
              <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1rem", fontWeight: 700, color: "#30d0fe" }}>
                {totals.total_carbs.toFixed(1)}<span style={{ fontSize: "0.65rem", color: "#888", fontFamily: "'Space Mono', monospace" }}> g</span>
              </span>
            </div>
            <div style={totalBarStyle}>
              <span style={{ fontSize: "0.7rem", color: "#bf5af2" }}>Fat</span>
              <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1rem", fontWeight: 700, color: "#bf5af2" }}>
                {totals.total_fat.toFixed(1)}<span style={{ fontSize: "0.65rem", color: "#888", fontFamily: "'Space Mono', monospace" }}> g</span>
              </span>
            </div>
            <div style={{ ...totalBarStyle, borderBottom: "none" }}>
              <span style={{ fontSize: "0.7rem", color: "#ffd700" }}>Fiber</span>
              <span style={{ fontFamily: "'Orbitron', sans-serif", fontSize: "1rem", fontWeight: 700, color: "#ffd700" }}>
                {totals.total_fiber.toFixed(1)}<span style={{ fontSize: "0.65rem", color: "#888", fontFamily: "'Space Mono', monospace" }}> g</span>
              </span>
            </div>
          </GlassCard>
        </>
      )}

      {view === "analytics" && (
        <CalorieAnalytics logs={logs} />
      )}
    </div>
  );
}
