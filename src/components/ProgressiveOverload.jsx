import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { DAYS, WORKOUTS } from "../lib/workoutData.js";
import useMediaQuery from "../lib/useMediaQuery.js";
import GlassCard from "./shared/GlassCard.jsx";
import PageHeader from "./shared/PageHeader.jsx";
import ProgressiveOverloadLog from "./ProgressiveOverloadLog.jsx";
import ProgressiveOverloadAnalytics from "./ProgressiveOverloadAnalytics.jsx";

const loadLogs = () => {
  try {
    const raw = localStorage.getItem("gt_progressive_overload");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export default function ProgressiveOverload() {
  const [logs, setLogs] = useState(loadLogs);
  const [selectedDay, setSelectedDay] = useState("monday");
  const [selectedExercise, setSelectedExercise] = useState(null);
  const isMobile = useMediaQuery("(max-width: 767px)");

  useEffect(() => {
    try {
      localStorage.setItem("gt_progressive_overload", JSON.stringify(logs));
    } catch {}
  }, [logs]);

  useEffect(() => {
    setSelectedExercise(null);
  }, [selectedDay]);

  const handleLog = (entry) => {
    setLogs((prev) => [entry, ...prev]);
  };

  const exercises = WORKOUTS[selectedDay] || [];

  return (
    <div>
      <PageHeader
        title="Progressive Overload Tracker"
        sub="Track strength progression across every exercise"
      />

      <div
        style={{
          display: "flex",
          gap: "0.5rem",
          marginBottom: "1.5rem",
          overflowX: "auto",
          paddingBottom: "0.25rem",
        }}
      >
        {DAYS.map((d) => (
          <button
            key={d.key}
            onClick={() => setSelectedDay(d.key)}
            style={{
              padding: "0.5rem 1rem",
              background:
                selectedDay === d.key
                  ? "rgba(57,255,20,0.1)"
                  : "transparent",
              border:
                selectedDay === d.key
                  ? "1px solid rgba(57,255,20,0.4)"
                  : "1px solid rgba(255,255,255,0.06)",
              borderRadius: 8,
              color: selectedDay === d.key ? "#39ff14" : "#555",
              fontFamily: "'Space Mono', monospace",
              fontSize: isMobile ? "0.65rem" : "0.7rem",
              cursor: "pointer",
              whiteSpace: "nowrap",
              flexShrink: 0,
              textAlign: "left",
            }}
          >
            <div style={{ fontWeight: 700 }}>{d.label.slice(0, 3)}</div>
            <div
              style={{
                fontSize: "0.55rem",
                color: selectedDay === d.key ? "rgba(57,255,20,0.6)" : "#444",
                marginTop: "0.15rem",
              }}
            >
              {d.sub}
            </div>
          </button>
        ))}
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "240px 1fr",
          gap: "1.5rem",
        }}
      >
        <div>
          <GlassCard>
            <div
              style={{
                fontSize: "0.65rem",
                color: "#555",
                letterSpacing: "0.1em",
                marginBottom: "0.75rem",
              }}
            >
              EXERCISES
            </div>
            {exercises.length === 0 ? (
              <div style={{ fontSize: "0.7rem", color: "#444", padding: "0.5rem 0" }}>
                No exercises for this day.
              </div>
            ) : (
              exercises.map((ex) => {
                const exLogs = logs.filter((l) => l.exercise === ex);
                return (
                  <button
                    key={ex}
                    onClick={() => setSelectedExercise(ex)}
                    style={{
                      width: "100%",
                      padding: "0.6rem 0.75rem",
                      background:
                        selectedExercise === ex
                          ? "rgba(57,255,20,0.08)"
                          : "transparent",
                      border: "none",
                      borderLeft:
                        selectedExercise === ex
                          ? "2px solid #39ff14"
                          : "2px solid transparent",
                      color: selectedExercise === ex ? "#39ff14" : "#888",
                      fontFamily: "'Space Mono', monospace",
                      fontSize: "0.7rem",
                      textAlign: "left",
                      cursor: "pointer",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span>{ex}</span>
                    {exLogs.length > 0 && (
                      <span
                        style={{
                          fontSize: "0.55rem",
                          color: "#555",
                          background: "rgba(255,255,255,0.04)",
                          borderRadius: 10,
                          padding: "0.1rem 0.4rem",
                        }}
                      >
                        {exLogs.length}
                      </span>
                    )}
                  </button>
                );
              })
            )}
          </GlassCard>
        </div>

        <div>
          {!selectedExercise ? (
            <GlassCard>
              <div
                style={{
                  textAlign: "center",
                  padding: "2rem 1rem",
                  color: "#555",
                  fontSize: "0.75rem",
                }}
              >
                Select an exercise to log or view history
              </div>
            </GlassCard>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedExercise}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                <GlassCard style={{ marginBottom: "1.5rem" }}>
                  <div
                    style={{
                      fontSize: "0.85rem",
                      fontWeight: 700,
                      color: "#e8e8e8",
                      fontFamily: "'Orbitron', sans-serif",
                      marginBottom: "1rem",
                    }}
                  >
                    {selectedExercise}
                  </div>
                  <ProgressiveOverloadLog
                    exercise={selectedExercise}
                    logs={logs}
                    onLog={handleLog}
                  />
                </GlassCard>

                <ProgressiveOverloadAnalytics logs={logs} />
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
}
