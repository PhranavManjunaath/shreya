import { motion } from "framer-motion";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { SECTIONS } from "../lib/constants.js";
import { fmtDate } from "../lib/helpers.js";
import useMediaQuery from "../lib/useMediaQuery.js";
import GlassCard from "./shared/GlassCard.jsx";
import PageHeader from "./shared/PageHeader.jsx";
import SectionLabel from "./shared/SectionLabel.jsx";
import HeatmapChart from "./shared/HeatmapChart.jsx";

export default function Analytics({ history, tasks }) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const last14 = history.slice(-14);
  const gymData = last14.map((d) => ({
    name: fmtDate(d.date),
    gym: d.gym,
    work: d.work,
  }));
  const sectionCounts = SECTIONS.map((s) => ({
    name: s.label.split(" ").slice(1).join(" "),
    done: tasks.filter((t) => t.section === s.id && t.done).length,
    total: tasks.filter((t) => t.section === s.id).length,
  }));

  return (
    <div>
      <PageHeader title="Analytics" sub="Your performance at a glance" />
      <div style={{ display: "grid", gap: "1.5rem" }}>
        <GlassCard>
          <SectionLabel>Daily Productivity (14 days)</SectionLabel>
          <ResponsiveContainer width="100%" height={isMobile ? 160 : 200}>
            <LineChart data={last14}>
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="rgba(255,255,255,0.04)"
              />
              <XAxis
                dataKey="date"
                tickFormatter={fmtDate}
                tick={{
                  fill: "#444",
                  fontSize: 10,
                  fontFamily: "'Space Mono', monospace",
                }}
              />
              <YAxis tick={{ fill: "#444", fontSize: 10 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{
                  background: "#111",
                  border: "1px solid rgba(57,255,20,0.3)",
                  borderRadius: 8,
                  fontFamily: "'Space Mono', monospace",
                  fontSize: 11,
                }}
                labelFormatter={fmtDate}
              />
              <Line
                type="monotone"
                dataKey="pct"
                name="Productivity %"
                stroke="#39ff14"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
            gap: "1rem",
          }}
        >
          <GlassCard>
            <SectionLabel>Gym vs Work Tasks</SectionLabel>
            <ResponsiveContainer width="100%" height={isMobile ? 140 : 180}>
              <BarChart data={gymData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                />
                <XAxis
                  dataKey="name"
                  tick={{ fill: "#444", fontSize: 9 }}
                />
                <YAxis tick={{ fill: "#444", fontSize: 9 }} />
                <Tooltip
                  contentStyle={{
                    background: "#111",
                    border: "1px solid rgba(255,255,255,0.1)",
                    borderRadius: 8,
                    fontSize: 11,
                  }}
                />
                <Bar dataKey="gym" fill="#ff9f0a" radius={[3, 3, 0, 0]} />
                <Bar dataKey="work" fill="#bf5af2" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard>
            <SectionLabel>Today's Completion by Category</SectionLabel>
            {sectionCounts.map((s, i) => (
              <div key={i} style={{ marginBottom: "0.75rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    fontSize: "0.75rem",
                    color: "#888",
                    marginBottom: "0.3rem",
                  }}
                >
                  <span>{s.name}</span>
                  <span>
                    {s.done}/{s.total}
                  </span>
                </div>
                <div
                  style={{
                    height: 6,
                    background: "#1a1a1a",
                    borderRadius: 3,
                    overflow: "hidden",
                  }}
                >
                  <motion.div
                    animate={{
                      width: `${
                        s.total > 0 ? (s.done / s.total) * 100 : 0
                      }%`,
                    }}
                    style={{
                      height: "100%",
                      background: SECTIONS[i].color,
                      borderRadius: 3,
                    }}
                  />
                </div>
              </div>
            ))}
          </GlassCard>
        </div>

        <GlassCard>
          <SectionLabel>Habit Streak Heatmap (Last 14 Days)</SectionLabel>
          <HeatmapChart data={history.slice(-14)} />
        </GlassCard>
      </div>
    </div>
  );
}
