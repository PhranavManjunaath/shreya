import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { uid } from "../lib/helpers.js";
import { useSyncData } from "../lib/sync.js";
import useMediaQuery from "../lib/useMediaQuery.js";
import GlassCard from "./shared/GlassCard.jsx";
import PageHeader from "./shared/PageHeader.jsx";
import ProgressiveOverloadLog from "./ProgressiveOverloadLog.jsx";
import ProgressiveOverloadAnalytics from "./ProgressiveOverloadAnalytics.jsx";

export default function ProgressiveOverload() {
  const [logs, setLogs] = useSyncData("workout_logs", []);
  const [days, setDays] = useSyncData("workout_days", []);
  const [selectedDayId, setSelectedDayId] = useState(null);
  const [selectedExercise, setSelectedExercise] = useState(null);
  const [editingDayId, setEditingDayId] = useState(null);
  const [editingName, setEditingName] = useState("");
  const [editingExName, setEditingExName] = useState("");
  const [editingExIdx, setEditingExIdx] = useState(null);
  const [newDayInput, setNewDayInput] = useState("");
  const [newExInput, setNewExInput] = useState("");
  const isMobile = useMediaQuery("(max-width: 767px)");

  useEffect(() => {
    if (days.length > 0 && !selectedDayId) {
      setSelectedDayId(days[0].id);
    } else if (days.length === 0) {
      setSelectedDayId(null);
      setSelectedExercise(null);
    }
  }, [days, selectedDayId]);

  useEffect(() => {
    setSelectedExercise(null);
  }, [selectedDayId]);

  const handleLog = (entry) => {
    setLogs((prev) => [entry, ...prev]);
  };

  const selectedDay = days.find((d) => d.id === selectedDayId);
  const exercises = selectedDay?.exercises || [];
  const dayLogs = selectedExercise
    ? logs.filter((l) => l.exercise === selectedExercise)
    : [];

  const addDay = () => {
    const name = newDayInput.trim();
    if (!name) return;
    setDays((prev) => [
      ...prev,
      { id: uid(), name, exercises: [] },
    ]);
    setNewDayInput("");
  };

  const deleteDay = (id) => {
    setDays((prev) => prev.filter((d) => d.id !== id));
    if (selectedDayId === id) {
      setSelectedDayId(null);
      setSelectedExercise(null);
    }
  };

  const startEditDay = (day) => {
    setEditingDayId(day.id);
    setEditingName(day.name);
  };

  const saveDayName = (id) => {
    setDays((prev) =>
      prev.map((d) => (d.id === id ? { ...d, name: editingName.trim() || d.name } : d))
    );
    setEditingDayId(null);
  };

  const addExercise = () => {
    const name = newExInput.trim();
    if (!name || !selectedDayId) return;
    setDays((prev) =>
      prev.map((d) =>
        d.id === selectedDayId
          ? { ...d, exercises: [...d.exercises, { name }] }
          : d
      )
    );
    setNewExInput("");
  };

  const deleteExercise = (exName) => {
    setDays((prev) =>
      prev.map((d) =>
        d.id === selectedDayId
          ? { ...d, exercises: d.exercises.filter((e) => e.name !== exName) }
          : d
      )
    );
    if (selectedExercise === exName) setSelectedExercise(null);
  };

  const startEditEx = (name) => {
    setEditingExName(name);
    setEditingExIdx(exercises.findIndex((e) => e.name === name));
  };

  const saveExName = (oldName) => {
    const newName = editingExName.trim();
    if (!newName) {
      setEditingExIdx(null);
      return;
    }
    setDays((prev) =>
      prev.map((d) =>
        d.id === selectedDayId
          ? {
              ...d,
              exercises: d.exercises.map((e) =>
                e.name === oldName ? { ...e, name: newName } : e
              ),
            }
          : d
      )
    );
    if (selectedExercise === oldName) setSelectedExercise(newName);
    setEditingExIdx(null);
  };

  const moveExercise = (idx, dir) => {
    setDays((prev) =>
      prev.map((d) => {
        if (d.id !== selectedDayId) return d;
        const exs = [...d.exercises];
        const target = idx + dir;
        if (target < 0 || target >= exs.length) return d;
        [exs[idx], exs[target]] = [exs[target], exs[idx]];
        return { ...d, exercises: exs };
      })
    );
  };

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
          marginBottom: "1rem",
          overflowX: "auto",
          paddingBottom: "0.25rem",
          alignItems: "center",
        }}
      >
        {days.map((d) => (
          <div key={d.id} style={{ position: "relative", flexShrink: 0 }}>
            {editingDayId === d.id ? (
              <input
                value={editingName}
                onChange={(e) => setEditingName(e.target.value)}
                onBlur={() => saveDayName(d.id)}
                onKeyDown={(e) => e.key === "Enter" && saveDayName(d.id)}
                autoFocus
                style={{
                  background: "rgba(57,255,20,0.08)",
                  border: "1px solid rgba(57,255,20,0.4)",
                  borderRadius: 8,
                  color: "#39ff14",
                  fontFamily: "'Space Mono', monospace",
                  fontSize: isMobile ? "0.65rem" : "0.7rem",
                  padding: "0.5rem 1rem",
                  outline: "none",
                  width: 120,
                }}
              />
            ) : (
              <button
                onClick={() => {
                  setSelectedDayId(d.id);
                }}
                onDoubleClick={() => startEditDay(d)}
                style={{
                  padding: "0.5rem 1rem",
                  background:
                    selectedDayId === d.id
                      ? "rgba(57,255,20,0.1)"
                      : "transparent",
                  border:
                    selectedDayId === d.id
                      ? "1px solid rgba(57,255,20,0.4)"
                      : "1px solid rgba(255,255,255,0.06)",
                  borderRadius: 8,
                  color: selectedDayId === d.id ? "#39ff14" : "#555",
                  fontFamily: "'Space Mono', monospace",
                  fontSize: isMobile ? "0.65rem" : "0.7rem",
                  cursor: "pointer",
                  whiteSpace: "nowrap",
                  textAlign: "left",
                  fontWeight: 700,
                }}
              >
                {d.name}
              </button>
            )}
            {days.length > 1 && selectedDayId === d.id && (
              <button
                onClick={() => deleteDay(d.id)}
                style={{
                  position: "absolute",
                  top: -6,
                  right: -6,
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "rgba(255,69,58,0.2)",
                  border: "1px solid rgba(255,69,58,0.4)",
                  color: "#ff453a",
                  fontSize: "0.5rem",
                  cursor: "pointer",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  lineHeight: 1,
                  padding: 0,
                }}
              >
                ✕
              </button>
            )}
          </div>
        ))}
        <div style={{ display: "flex", gap: "0.3rem", flexShrink: 0 }}>
          <input
            value={newDayInput}
            onChange={(e) => setNewDayInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addDay()}
            placeholder="+ Add day"
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 8,
              color: "#888",
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.65rem",
              padding: "0.5rem 0.6rem",
              width: 90,
              outline: "none",
            }}
          />
          <button
            onClick={addDay}
            style={{
              background: "rgba(57,255,20,0.1)",
              border: "1px solid rgba(57,255,20,0.3)",
              borderRadius: 8,
              color: "#39ff14",
              fontSize: "0.8rem",
              cursor: "pointer",
              padding: "0.5rem 0.6rem",
              fontFamily: "'Space Mono', monospace",
            }}
          >
            +
          </button>
        </div>
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
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>EXERCISES</span>
              <span style={{ color: "#444", fontSize: "0.55rem" }}>
                {exercises.length}
              </span>
            </div>
            {!selectedDay ? (
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "#444",
                  padding: "0.5rem 0",
                }}
              >
                Create a workout day above
              </div>
            ) : exercises.length === 0 ? (
              <div
                style={{
                  fontSize: "0.7rem",
                  color: "#444",
                  padding: "0.5rem 0",
                }}
              >
                No exercises yet
              </div>
            ) : (
              exercises.map((ex, idx) => {
                const exLogs = logs.filter((l) => l.exercise === ex.name);
                const isEditing = editingExIdx === idx;
                return (
                  <div
                    key={ex.name}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "0.25rem",
                      borderBottom: "1px solid rgba(255,255,255,0.04)",
                    }}
                  >
                    <div style={{ display: "flex", flexDirection: "column", gap: 2 }}>
                      <button
                        onClick={() => moveExercise(idx, -1)}
                        disabled={idx === 0}
                        style={{
                          background: "none",
                          border: "none",
                          color: idx === 0 ? "transparent" : "#444",
                          cursor: idx === 0 ? "default" : "pointer",
                          fontSize: "0.4rem",
                          padding: 0,
                          lineHeight: 1,
                        }}
                      >
                        ▲
                      </button>
                      <button
                        onClick={() => moveExercise(idx, 1)}
                        disabled={idx === exercises.length - 1}
                        style={{
                          background: "none",
                          border: "none",
                          color:
                            idx === exercises.length - 1
                              ? "transparent"
                              : "#444",
                          cursor:
                            idx === exercises.length - 1
                              ? "default"
                              : "pointer",
                          fontSize: "0.4rem",
                          padding: 0,
                          lineHeight: 1,
                        }}
                      >
                        ▼
                      </button>
                    </div>
                    {isEditing ? (
                      <input
                        value={editingExName}
                        onChange={(e) => setEditingExName(e.target.value)}
                        onBlur={() => saveExName(ex.name)}
                        onKeyDown={(e) => e.key === "Enter" && saveExName(ex.name)}
                        autoFocus
                        style={{
                          flex: 1,
                          background: "rgba(57,255,20,0.05)",
                          border: "none",
                          color: "#39ff14",
                          fontFamily: "'Space Mono', monospace",
                          fontSize: "0.7rem",
                          padding: "0.6rem 0.5rem",
                          outline: "none",
                        }}
                      />
                    ) : (
                      <button
                        onClick={() => setSelectedExercise(ex.name)}
                        onDoubleClick={() => startEditEx(ex.name)}
                        style={{
                          flex: 1,
                          padding: "0.6rem 0.5rem",
                          background:
                            selectedExercise === ex.name
                              ? "rgba(57,255,20,0.08)"
                              : "transparent",
                          border: "none",
                          borderLeft:
                            selectedExercise === ex.name
                              ? "2px solid #39ff14"
                              : "2px solid transparent",
                          color:
                            selectedExercise === ex.name ? "#39ff14" : "#888",
                          fontFamily: "'Space Mono', monospace",
                          fontSize: "0.7rem",
                          textAlign: "left",
                          cursor: "pointer",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span>{ex.name}</span>
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
                    )}
                    <button
                      onClick={() => deleteExercise(ex.name)}
                      style={{
                        background: "none",
                        border: "none",
                        color: "#ff453a",
                        fontSize: "0.6rem",
                        cursor: "pointer",
                        padding: "0.25rem",
                        opacity: 0.5,
                      }}
                    >
                      ✕
                    </button>
                  </div>
                );
              })
            )}
            {selectedDay && (
              <div
                style={{
                  display: "flex",
                  gap: "0.3rem",
                  marginTop: "0.5rem",
                }}
              >
                <input
                  value={newExInput}
                  onChange={(e) => setNewExInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addExercise()}
                  placeholder="+ Add exercise"
                  style={{
                    flex: 1,
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.08)",
                    borderRadius: 6,
                    color: "#888",
                    fontFamily: "'Space Mono', monospace",
                    fontSize: "0.65rem",
                    padding: "0.4rem 0.5rem",
                    outline: "none",
                  }}
                />
                <button
                  onClick={addExercise}
                  style={{
                    background: "rgba(57,255,20,0.1)",
                    border: "1px solid rgba(57,255,20,0.3)",
                    borderRadius: 6,
                    color: "#39ff14",
                    fontSize: "0.7rem",
                    cursor: "pointer",
                    padding: "0.4rem 0.5rem",
                    fontFamily: "'Space Mono', monospace",
                  }}
                >
                  +
                </button>
              </div>
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
                {selectedDay
                  ? "Select an exercise to log or view history"
                  : "Create a workout day to get started"}
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
