import { useState, useMemo } from "react";
import { motion } from "framer-motion";
import { calcVolume, estimate1RM, getProgress, detectPR } from "../lib/workoutData.js";

const emptySet = () => ({ weight: "", reps: "" });
const MAX_SETS = 4;

export default function ProgressiveOverloadLog({
  exercise,
  logs,
  onLog,
}) {
  const [sets, setSets] = useState(() => Array.from({ length: MAX_SETS }, emptySet));
  const [notes, setNotes] = useState("");
  const [result, setResult] = useState(null);

  const exerciseLogs = useMemo(
    () =>
      logs
        .filter((l) => l.exercise === exercise)
        .sort((a, b) => new Date(b.date) - new Date(a.date)),
    [logs, exercise]
  );

  const lastEntry = exerciseLogs[0];

  const updateSet = (idx, field, value) => {
    setSets((prev) => {
      const next = prev.map((s, i) => (i === idx ? { ...s, [field]: value } : s));
      return next;
    });
  };

  const handleSubmit = () => {
    const parsed = sets.map((s) => ({
      weight: parseFloat(s.weight) || 0,
      reps: parseInt(s.reps, 10) || 0,
    }));

    const hasData = parsed.some((s) => s.weight > 0 && s.reps > 0);
    if (!hasData) return;

    const entry = {
      id: crypto.randomUUID(),
      date: new Date().toISOString(),
      exercise,
      sets: parsed,
      notes: notes.trim(),
    };

    const progress = getProgress(entry, lastEntry);
    const prs = detectPR(entry, exerciseLogs);
    setResult({ progress, prs });

    onLog(entry);
    setSets(Array.from({ length: MAX_SETS }, emptySet));
    setNotes("");

    setTimeout(() => setResult(null), 4000);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div>
      {lastEntry && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(4, 1fr)",
            gap: "0.5rem",
            marginBottom: "1rem",
            padding: "0.75rem",
            background: "rgba(57,255,20,0.05)",
            borderRadius: 10,
            border: "1px solid rgba(57,255,20,0.1)",
          }}
        >
          <div style={{ gridColumn: "1 / -1", fontSize: "0.65rem", color: "#555", marginBottom: "0.25rem", letterSpacing: "0.1em" }}>
            LAST SESSION — {new Date(lastEntry.date).toLocaleDateString()}
          </div>
          {lastEntry.sets.map((s, i) => (
            <div key={i} style={{ textAlign: "center" }}>
              <div style={{ fontSize: "0.6rem", color: "#444" }}>S{i + 1}</div>
              <div style={{ fontSize: "0.8rem", color: "#39ff14" }}>
                {s.weight || "-"}kg
              </div>
              <div style={{ fontSize: "0.65rem", color: "#888" }}>
                ×{s.reps || "-"}
              </div>
            </div>
          ))}
          <div style={{ gridColumn: "1 / -1", fontSize: "0.7rem", color: "#888", marginTop: "0.25rem" }}>
            Volume: {calcVolume(lastEntry.sets)}kg
          </div>
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(3, 1fr)`,
          gap: "0.5rem",
          marginBottom: "0.75rem",
        }}
      >
        <div style={{ fontSize: "0.6rem", color: "#555", letterSpacing: "0.1em" }}>SET</div>
        <div style={{ fontSize: "0.6rem", color: "#555", letterSpacing: "0.1em" }}>WEIGHT</div>
        <div style={{ fontSize: "0.6rem", color: "#555", letterSpacing: "0.1em" }}>REPS</div>
      </div>

      {sets.map((s, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(3, 1fr)",
            gap: "0.5rem",
            marginBottom: "0.5rem",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              fontSize: "0.75rem",
              color: "#666",
              fontFamily: "'Orbitron', sans-serif",
            }}
          >
            {i + 1}
          </div>
          <input
            type="number"
            step="0.5"
            min="0"
            placeholder="kg"
            value={s.weight}
            onChange={(e) => updateSet(i, "weight", e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 6,
              color: "#e8e8e8",
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.8rem",
              padding: "0.35rem 0.5rem",
              width: "100%",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
          <input
            type="number"
            min="0"
            placeholder="reps"
            value={s.reps}
            onChange={(e) => updateSet(i, "reps", e.target.value)}
            onKeyDown={handleKeyDown}
            style={{
              background: "transparent",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: 6,
              color: "#e8e8e8",
              fontFamily: "'Space Mono', monospace",
              fontSize: "0.8rem",
              padding: "0.35rem 0.5rem",
              width: "100%",
              outline: "none",
              boxSizing: "border-box",
            }}
          />
        </div>
      ))}

      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes (optional)"
        rows={2}
        style={{
          width: "100%",
          background: "transparent",
          border: "1px solid rgba(255,255,255,0.08)",
          borderRadius: 6,
          color: "#888",
          fontFamily: "'Space Mono', monospace",
          fontSize: "0.7rem",
          padding: "0.5rem",
          resize: "vertical",
          outline: "none",
          marginBottom: "0.75rem",
          boxSizing: "border-box",
        }}
      />

      <button
        onClick={handleSubmit}
        style={{
          background: "#39ff14",
          border: "none",
          borderRadius: 8,
          color: "#000",
          fontWeight: 700,
          fontFamily: "'Orbitron', sans-serif",
          fontSize: "0.8rem",
          padding: "0.6rem 1.5rem",
          cursor: "pointer",
          letterSpacing: "0.05em",
          width: "100%",
        }}
      >
        LOG WORKOUT
      </button>

      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            marginTop: "0.75rem",
            padding: "0.75rem",
            borderRadius: 10,
            background:
              result.progress.status === "up"
                ? "rgba(57,255,20,0.08)"
                : result.progress.status === "down"
                  ? "rgba(255,69,58,0.08)"
                  : "rgba(255,255,255,0.03)",
            border: `1px solid ${
              result.progress.status === "up"
                ? "rgba(57,255,20,0.3)"
                : result.progress.status === "down"
                  ? "rgba(255,69,58,0.3)"
                  : "rgba(255,255,255,0.1)"
            }`,
          }}
        >
          <div style={{ fontSize: "0.75rem", color: "#e8e8e8" }}>
            {result.progress.label}
          </div>
          <div style={{ fontSize: "0.65rem", color: "#888", marginTop: "0.25rem" }}>
            Volume: {calcVolume(sets)}kg
            {lastEntry && (
              <>
                {" · "}Previous: {calcVolume(lastEntry.sets)}kg
              </>
            )}
          </div>
          {result.prs && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300 }}
              style={{
                marginTop: "0.5rem",
                padding: "0.4rem 0.75rem",
                background: "rgba(255,215,0,0.15)",
                borderRadius: 20,
                display: "inline-block",
                fontSize: "0.7rem",
                color: "#ffd700",
                fontWeight: 700,
              }}
            >
              🏆 {result.prs[0].label}: {result.prs[0].value}
            </motion.div>
          )}
        </motion.div>
      )}

      {exerciseLogs.length > 0 && (
        <div style={{ marginTop: "1.5rem" }}>
          <div
            style={{
              fontSize: "0.65rem",
              color: "#555",
              letterSpacing: "0.1em",
              marginBottom: "0.5rem",
            }}
          >
            HISTORY ({exerciseLogs.length} sessions)
          </div>
          <div style={{ overflowX: "auto" }}>
            <table
              style={{
                width: "100%",
                borderCollapse: "collapse",
                fontSize: "0.7rem",
              }}
            >
              <thead>
                <tr style={{ color: "#555", borderBottom: "1px solid rgba(255,255,255,0.06)" }}>
                  <th style={{ padding: "0.4rem 0.5rem", textAlign: "left", whiteSpace: "nowrap" }}>Date</th>
                  <th style={{ padding: "0.4rem 0.5rem", textAlign: "right" }}>S1</th>
                  <th style={{ padding: "0.4rem 0.5rem", textAlign: "right" }}>S2</th>
                  <th style={{ padding: "0.4rem 0.5rem", textAlign: "right" }}>S3</th>
                  <th style={{ padding: "0.4rem 0.5rem", textAlign: "right" }}>S4</th>
                  <th style={{ padding: "0.4rem 0.5rem", textAlign: "right" }}>Vol</th>
                  <th style={{ padding: "0.4rem 0.5rem", textAlign: "right" }}>1RM</th>
                </tr>
              </thead>
              <tbody>
                {exerciseLogs.slice(0, 20).map((l) => {
                  const vol = calcVolume(l.sets);
                  const maxWeight = Math.max(...l.sets.map((s) => s.weight || 0));
                  const maxReps = l.sets.reduce(
                    (best, s) => (s.reps > best.reps ? s : best),
                    { reps: 0 }
                  );
                  const est1RM = estimate1RM(maxWeight, maxReps.reps);

                  return (
                    <tr
                      key={l.id}
                      style={{ borderBottom: "1px solid rgba(255,255,255,0.03)" }}
                    >
                      <td style={{ padding: "0.4rem 0.5rem", color: "#888", whiteSpace: "nowrap" }}>
                        {new Date(l.date).toLocaleDateString()}
                      </td>
                      {l.sets.map((s, si) => (
                        <td key={si} style={{ padding: "0.4rem 0.5rem", textAlign: "right", color: "#ccc" }}>
                          {s.weight ? `${s.weight}×${s.reps}` : "-"}
                        </td>
                      ))}
                      <td style={{ padding: "0.4rem 0.5rem", textAlign: "right", color: "#39ff14", fontWeight: 700 }}>
                        {vol}
                      </td>
                      <td style={{ padding: "0.4rem 0.5rem", textAlign: "right", color: "#bf5af2" }}>
                        {est1RM > 0 ? `${est1RM}kg` : "-"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
