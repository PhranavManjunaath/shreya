import GlassCard from "./GlassCard.jsx";

export default function StatCard({ label, value, sub, accent }) {
  return (
    <GlassCard>
      <div
        style={{
          fontSize: "0.65rem",
          color: "#444",
          letterSpacing: "0.12em",
          textTransform: "uppercase",
          marginBottom: "0.4rem",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontFamily: "'Orbitron', sans-serif",
          fontSize: "1.6rem",
          fontWeight: 700,
          color: accent,
        }}
      >
        {value}
      </div>
      <div style={{ fontSize: "0.7rem", color: "#444", marginTop: "0.2rem" }}>
        {sub}
      </div>
    </GlassCard>
  );
}
