import { motion } from "framer-motion";
import { BADGES } from "../lib/constants.js";
import GlassCard from "./shared/GlassCard.jsx";
import PageHeader from "./shared/PageHeader.jsx";
import SectionLabel from "./shared/SectionLabel.jsx";

export default function BadgesPage({ earnedBadges, stats }) {
  const earnedIds = new Set(earnedBadges.map((b) => b.id));
  return (
    <div>
      <PageHeader
        title="Achievements"
        sub={`${earnedBadges.length}/${BADGES.length} unlocked`}
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "1rem",
        }}
      >
        {BADGES.map((b) => {
          const earned = earnedIds.has(b.id);
          return (
            <motion.div
              key={b.id}
              whileHover={{ scale: 1.03 }}
              style={{
                padding: "1.5rem",
                background: earned
                  ? "rgba(57,255,20,0.08)"
                  : "rgba(255,255,255,0.03)",
                border: `1px solid ${earned ? "rgba(57,255,20,0.35)" : "rgba(255,255,255,0.06)"}`,
                borderRadius: 12,
                textAlign: "center",
                filter: earned ? "none" : "grayscale(1) opacity(0.4)",
              }}
            >
              <div style={{ fontSize: "2.5rem", marginBottom: "0.5rem" }}>
                {b.icon}
              </div>
              <div
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: "0.75rem",
                  color: earned ? "#39ff14" : "#555",
                  letterSpacing: "0.05em",
                }}
              >
                {b.label}
              </div>
              {earned && (
                <div
                  style={{
                    fontSize: "0.65rem",
                    color: "#39ff14",
                    marginTop: "0.4rem",
                    opacity: 0.7,
                  }}
                >
                  UNLOCKED
                </div>
              )}
            </motion.div>
          );
        })}
      </div>
      <GlassCard style={{ marginTop: "1.5rem" }}>
        <SectionLabel>Your Stats</SectionLabel>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
            gap: "0.75rem",
          }}
        >
          {[
            ["🔥 Streak", `${stats.streak} days`],
            ["⚡ XP", stats.xp.toLocaleString()],
            ["💪 Gym Sessions", stats.totalGym],
            ["💼 Work Tasks", stats.totalWork],
            ["💧 Water Logged", `${stats.water}ml`],
          ].map(([l, v]) => (
            <div
              key={l}
              style={{
                padding: "0.75rem",
                background: "rgba(255,255,255,0.03)",
                borderRadius: 8,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  fontSize: "0.65rem",
                  color: "#444",
                  marginBottom: "0.3rem",
                }}
              >
                {l}
              </div>
              <div
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: "1.1rem",
                  color: "#e8e8e8",
                }}
              >
                {v}
              </div>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
