import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { QUOTES } from "../lib/constants.js";
import { weekDays, getGreeting } from "../lib/helpers.js";
import GlassCard from "./shared/GlassCard.jsx";
import StatCard from "./shared/StatCard.jsx";
import ProgressRing from "./shared/ProgressRing.jsx";
import SectionLabel from "./shared/SectionLabel.jsx";

export default function Dashboard({
  user,
  tasks,
  pctToday,
  completedToday,
  totalToday,
  streak,
  history,
  level,
  xp,
  earnedBadges,
  water,
  addWater,
  resetWater,
}) {
  const quote = QUOTES[new Date().getDay() % QUOTES.length];
  const weekData = history
    .slice(-7)
    .map((d) => ({ name: weekDays[new Date(d.date).getDay()], pct: d.pct }));

  return (
    <div>
      <div style={{ marginBottom: "2rem" }}>
        <h2
          style={{
            fontFamily: "'Orbitron', sans-serif",
            fontSize: "1.4rem",
            color: "#fff",
            margin: 0,
          }}
        >
          Good {getGreeting()}, <span style={{ color: "#39ff14" }}>{user?.name || "Grinder"}</span>
        </h2>
        <p
          style={{
            color: "#444",
            fontSize: "0.75rem",
            marginTop: "0.4rem",
            letterSpacing: "0.1em",
          }}
        >
          {quote.toUpperCase()}
        </p>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <StatCard
          label="Today's Progress"
          value={`${pctToday}%`}
          sub={`${completedToday}/${totalToday} tasks`}
          accent="#39ff14"
        />
        <StatCard
          label="Daily Streak"
          value={`${streak}d`}
          sub="consecutive days"
          accent="#ff9f0a"
        />
        <StatCard
          label="XP Points"
          value={xp.toLocaleString()}
          sub={`Level ${level}`}
          accent="#bf5af2"
        />
        <StatCard
          label="Water Today"
          value={`${water}ml`}
          sub="goal: 2000ml"
          accent="#30d0fe"
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 2fr",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <GlassCard>
          <div style={{ textAlign: "center", padding: "0.5rem 0" }}>
            <ProgressRing pct={pctToday} />
            <div
              style={{
                fontSize: "0.7rem",
                color: "#444",
                marginTop: "0.5rem",
                letterSpacing: "0.1em",
              }}
            >
              TODAY'S COMPLETION
            </div>
          </div>
        </GlassCard>

        <GlassCard>
          <SectionLabel>Weekly Productivity</SectionLabel>
          <ResponsiveContainer width="100%" height={140}>
            <LineChart data={weekData}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
              />
              <XAxis
                dataKey="name"
                tick={{
                  fill: "#555",
                  fontSize: 11,
                  fontFamily: "'Space Mono', monospace",
                }}
              />
              <YAxis tick={{ fill: "#555", fontSize: 11 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  background: "#111",
                  border: "1px solid rgba(57,255,20,0.3)",
                  borderRadius: 8,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="pct"
                stroke="#39ff14"
                strokeWidth={2}
                dot={{ fill: "#39ff14", r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "1rem",
          marginBottom: "2rem",
        }}
      >
        <GlassCard>
          <SectionLabel>💧 Water Intake</SectionLabel>
          <div
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: "1.8rem",
              color: "#30d0fe",
              marginBottom: "0.75rem",
            }}
          >
            {water}
            <span style={{ fontSize: "0.9rem" }}>ml</span>
          </div>
          <div
            style={{
              height: 8,
              background: "#1a1a1a",
              borderRadius: 4,
              marginBottom: "1rem",
              overflow: "hidden",
            }}
          >
            <motion.div
              animate={{
                width: `${Math.min((water / 2000) * 100, 100)}%`,
              }}
              style={{
                height: "100%",
                background: "#30d0fe",
                borderRadius: 4,
              }}
            />
          </div>
          <div style={{ display: "flex", gap: "0.5rem", flexWrap: "wrap" }}>
            {[250, 500].map((ml) => (
              <button
                key={ml}
                onClick={() => addWater(ml)}
                style={{
                  padding: "0.4rem 0.8rem",
                  background: "rgba(48,208,254,0.1)",
                  border: "1px solid rgba(48,208,254,0.3)",
                  color: "#30d0fe",
                  borderRadius: 6,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: "0.7rem",
                  cursor: "pointer",
                }}
              >
                +{ml}ml
              </button>
            ))}
            <button
              onClick={resetWater}
              style={{
                padding: "0.4rem 0.8rem",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.1)",
                color: "#444",
                borderRadius: 6,
                fontFamily: "'Space Mono', monospace",
                fontSize: "0.7rem",
                cursor: "pointer",
              }}
            >
              Reset
            </button>
          </div>
        </GlassCard>

        <GlassCard>
          <SectionLabel>🏆 Recent Badges</SectionLabel>
          {earnedBadges.length === 0 ? (
            <p style={{ color: "#333", fontSize: "0.75rem" }}>
              Complete tasks to earn badges
            </p>
          ) : (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {earnedBadges.map((b) => (
                <motion.div
                  key={b.id}
                  whileHover={{ scale: 1.05 }}
                  style={{
                    padding: "0.4rem 0.75rem",
                    background: "rgba(57,255,20,0.08)",
                    border: "1px solid rgba(57,255,20,0.25)",
                    borderRadius: 20,
                    fontSize: "0.7rem",
                    color: "#39ff14",
                  }}
                >
                  {b.icon} {b.label}
                </motion.div>
              ))}
            </div>
          )}
        </GlassCard>
      </div>

      <GlassCard>
        <SectionLabel>Today's Priority Tasks</SectionLabel>
        {tasks
          .filter((t) => t.priority === "high" && !t.done)
          .slice(0, 4)
          .map((t) => (
            <div
              key={t.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.75rem",
                padding: "0.5rem 0",
                borderBottom: "1px solid rgba(255,255,255,0.04)",
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  background: "#ff453a",
                  borderRadius: "50%",
                  flexShrink: 0,
                }}
              />
              <span style={{ fontSize: "0.8rem", color: "#ccc" }}>
                {t.text}
              </span>
              <span
                style={{
                  marginLeft: "auto",
                  fontSize: "0.65rem",
                  color: "#444",
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                }}
              >
                {t.section}
              </span>
            </div>
          ))}
        {tasks.filter((t) => t.priority === "high" && !t.done).length ===
          0 && (
          <p style={{ color: "#39ff14", fontSize: "0.8rem" }}>
            All high-priority tasks done! 🎉
          </p>
        )}
      </GlassCard>
    </div>
  );
}
