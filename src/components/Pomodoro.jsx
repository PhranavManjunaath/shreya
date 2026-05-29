import { motion } from "framer-motion";
import GlassCard from "./shared/GlassCard.jsx";
import PageHeader from "./shared/PageHeader.jsx";

export default function Pomodoro({
  pomodoroTime,
  setPomodoroTime,
  pomodoroActive,
  setPomodoroActive,
  pomodoroMode,
  setPomodoroMode,
}) {
  const mins = String(Math.floor(pomodoroTime / 60)).padStart(2, "0");
  const secs = String(pomodoroTime % 60).padStart(2, "0");
  const maxTime = pomodoroMode === "work" ? 25 * 60 : 5 * 60;
  const pct = ((maxTime - pomodoroTime) / maxTime) * 100;

  const reset = () => {
    setPomodoroActive(false);
    setPomodoroTime(pomodoroMode === "work" ? 25 * 60 : 5 * 60);
  };

  return (
    <div>
      <PageHeader title="Pomodoro Timer" sub="Deep work sessions" />
      <div style={{ display: "flex", justifyContent: "center" }}>
        <GlassCard
          style={{ maxWidth: 400, width: "100%", textAlign: "center" }}
        >
          <div
            style={{
              display: "flex",
              gap: "0.5rem",
              marginBottom: "2rem",
              justifyContent: "center",
            }}
          >
            {["work", "break"].map((m) => (
              <button
                key={m}
                onClick={() => {
                  setPomodoroMode(m);
                  setPomodoroTime(m === "work" ? 25 * 60 : 5 * 60);
                  setPomodoroActive(false);
                }}
                style={{
                  padding: "0.4rem 1rem",
                  background: pomodoroMode === m ? "#39ff14" : "transparent",
                  border: "1px solid rgba(57,255,20,0.3)",
                  color: pomodoroMode === m ? "#000" : "#555",
                  borderRadius: 6,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "0.7rem",
                  cursor: "pointer",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                }}
              >
                {m === "work" ? "Focus" : "Break"}
              </button>
            ))}
          </div>
          <div
            style={{
              position: "relative",
              display: "inline-block",
              marginBottom: "2rem",
            }}
          >
            <svg width={200} height={200} viewBox="0 0 200 200">
              <circle
                cx={100}
                cy={100}
                r={88}
                fill="none"
                stroke="rgba(57,255,20,0.08)"
                strokeWidth={8}
              />
              <motion.circle
                cx={100}
                cy={100}
                r={88}
                fill="none"
                stroke="#39ff14"
                strokeWidth={8}
                strokeLinecap="round"
                strokeDasharray={2 * Math.PI * 88}
                animate={{
                  strokeDashoffset:
                    2 * Math.PI * 88 * (1 - pct / 100),
                }}
                transition={{ duration: 0.5 }}
                transform="rotate(-90 100 100)"
              />
            </svg>
            <div
              style={{
                position: "absolute",
                inset: 0,
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <div
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: "2.5rem",
                  fontWeight: 700,
                  color: pomodoroActive ? "#39ff14" : "#fff",
                }}
              >
                {mins}:{secs}
              </div>
              <div
                style={{
                  fontSize: "0.65rem",
                  color: "#444",
                  letterSpacing: "0.15em",
                  textTransform: "uppercase",
                }}
              >
                {pomodoroMode === "work" ? "Focus" : "Break"}
              </div>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              gap: "0.75rem",
              justifyContent: "center",
            }}
          >
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => setPomodoroActive((a) => !a)}
              style={{
                padding: "0.75rem 2rem",
                background: pomodoroActive ? "transparent" : "#39ff14",
                border: pomodoroActive
                  ? "1px solid #ff453a"
                  : "none",
                color: pomodoroActive ? "#ff453a" : "#000",
                borderRadius: 8,
                fontFamily: "'Orbitron', sans-serif",
                fontWeight: 700,
                fontSize: "0.85rem",
                cursor: "pointer",
                letterSpacing: "0.05em",
              }}
            >
              {pomodoroActive ? "PAUSE" : "START"}
            </motion.button>
            <button
              onClick={reset}
              style={{
                padding: "0.75rem 1.5rem",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#444",
                borderRadius: 8,
                fontFamily: "'Space Mono', monospace",
                fontSize: "0.75rem",
                cursor: "pointer",
              }}
            >
              RESET
            </button>
          </div>
        </GlassCard>
      </div>
    </div>
  );
}
