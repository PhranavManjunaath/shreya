import GlassCard from "./shared/GlassCard.jsx";

const FIELDS = [
  { key: "cal", label: "Cal", color: "#39ff14", placeholder: "0" },
  { key: "protein", label: "Protein", color: "#ff9f0a", placeholder: "g" },
  { key: "carbs", label: "Carbs", color: "#30d0fe", placeholder: "g" },
  { key: "fat", label: "Fat", color: "#bf5af2", placeholder: "g" },
  { key: "fiber", label: "Fiber", color: "#ffd700", placeholder: "g" },
];

export default function CalorieInputCard({ label, values, onChange }) {
  const handleChange = (field, val) => {
    onChange({ ...values, [field]: val === "" ? "" : val });
  };

  return (
    <GlassCard>
      <div
        style={{
          fontSize: "0.6rem",
          color: "#555",
          letterSpacing: "0.15em",
          textTransform: "uppercase",
          marginBottom: "0.6rem",
        }}
      >
        {label}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: "0.4rem" }}>
        {FIELDS.map((f) => (
          <div key={f.key}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "0.15rem",
              }}
            >
              <span
                style={{
                  fontSize: "0.55rem",
                  color: f.color,
                  letterSpacing: "0.1em",
                }}
              >
                {f.label}
              </span>
              <span
                style={{
                  fontSize: "0.5rem",
                  color: "#333",
                  fontFamily: "'Space Mono', monospace",
                }}
              >
                {f.placeholder}
              </span>
            </div>
            <input
              type="number"
              min={0}
              value={values[f.key]}
              onChange={(e) => handleChange(f.key, e.target.value)}
              placeholder="0"
              style={{
                width: "100%",
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.06)",
                borderRadius: 6,
                color: "#e8e8e8",
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "0.95rem",
                fontWeight: 700,
                padding: "0.3rem 0.5rem",
                textAlign: "right",
                outline: "none",
                boxSizing: "border-box",
              }}
            />
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
