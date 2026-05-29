import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { today, fmtDate } from "../lib/helpers.js";
import useMediaQuery from "../lib/useMediaQuery.js";
import GlassCard from "./shared/GlassCard.jsx";
import PageHeader from "./shared/PageHeader.jsx";
import SectionLabel from "./shared/SectionLabel.jsx";

export default function WeightTracker({ weight, setWeight }) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const [val, setVal] = useState("");
  const add = () => {
    const n = parseFloat(val);
    if (!n || n < 20 || n > 500) return;
    setWeight((w) => [...w, { date: today(), kg: n, id: crypto.randomUUID() }]);
    setVal("");
  };
  const data = weight.slice(-14);

  return (
    <div>
      <PageHeader
        title="Weight Tracker"
        sub="Monitor your physique progress"
      />
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile ? "1fr" : "1fr 2fr",
          gap: "1rem",
        }}
      >
        <GlassCard>
          <SectionLabel>Log Weight</SectionLabel>
          <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
            <input
              type="number"
              value={val}
              onChange={(e) => setVal(e.target.value)}
              placeholder="kg"
              onKeyDown={(e) => e.key === "Enter" && add()}
              style={{
                flex: 1,
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 6,
                color: "#e8e8e8",
                fontFamily: "'Space Mono', monospace",
                fontSize: "0.9rem",
                padding: "0.5rem 0.75rem",
                outline: "none",
              }}
            />
            <button
              onClick={add}
              style={{
                background: "#39ff14",
                border: "none",
                borderRadius: 6,
                color: "#000",
                fontWeight: 700,
                padding: "0.5rem 1rem",
                cursor: "pointer",
                fontFamily: "'Orbitron', sans-serif",
                fontSize: "0.75rem",
              }}
            >
              LOG
            </button>
          </div>
          {weight.length > 0 && (
            <div style={{ marginTop: "1rem" }}>
              <div
                style={{
                  fontSize: "0.65rem",
                  color: "#444",
                  letterSpacing: "0.1em",
                }}
              >
                CURRENT
              </div>
              <div
                style={{
                  fontFamily: "'Orbitron', sans-serif",
                  fontSize: "2rem",
                  color: "#39ff14",
                }}
              >
                {weight[weight.length - 1].kg}
                <span style={{ fontSize: "1rem" }}>kg</span>
              </div>
            </div>
          )}
        </GlassCard>
        <GlassCard>
          <SectionLabel>Weight Trend</SectionLabel>
          {data.length < 2 ? (
            <p style={{ color: "#333", fontSize: "0.8rem" }}>
              Log at least 2 entries to see your trend.
            </p>
          ) : (
            <ResponsiveContainer width="100%" height={isMobile ? 140 : 180}>
              <LineChart data={data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                />
                <XAxis
                  dataKey="date"
                  tickFormatter={fmtDate}
                  tick={{ fill: "#444", fontSize: 10 }}
                />
                <YAxis
                  tick={{ fill: "#444", fontSize: 10 }}
                  domain={["auto", "auto"]}
                />
                <Tooltip
                  contentStyle={{
                    background: "#111",
                    border: "1px solid rgba(57,255,20,0.3)",
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                  labelFormatter={fmtDate}
                />
                <Line
                  type="monotone"
                  dataKey="kg"
                  stroke="#39ff14"
                  strokeWidth={2}
                  dot={{ fill: "#39ff14", r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </GlassCard>
      </div>
    </div>
  );
}
