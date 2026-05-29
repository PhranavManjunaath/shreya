import { useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import GlassCard from "./shared/GlassCard.jsx";
import StatCard from "./shared/StatCard.jsx";
import {
  calcVolume,
  estimate1RM,
  getWeeklyStrengthScore,
  getMonthlyProgress,
  getPRCountThisMonth,
} from "../lib/workoutData.js";
import { fmtDate } from "../lib/helpers.js";
import useMediaQuery from "../lib/useMediaQuery.js";

const TRACKED = ["Incline Dumbbell Press", "Squat / Hack Squat", "Romanian Deadlift", "Shoulder Press"];

export default function ProgressiveOverloadAnalytics({ logs }) {
  const isMobile = useMediaQuery("(max-width: 767px)");

  const stats = useMemo(() => {
    const wss = getWeeklyStrengthScore(logs);
    const mp = getMonthlyProgress(logs);
    const prCount = getPRCountThisMonth(logs);

    const byExercise = {};
    logs.forEach((l) => {
      if (!byExercise[l.exercise]) byExercise[l.exercise] = [];
      byExercise[l.exercise].push(l);
    });

    let strongest = { name: "", totalVol: 0 };
    let totalVolAll = 0;
    Object.entries(byExercise).forEach(([name, exLogs]) => {
      const vol = exLogs.reduce((s, l) => s + calcVolume(l.sets), 0);
      totalVolAll += vol;
      if (vol > strongest.totalVol) strongest = { name, totalVol: vol };
    });

    return { wss, mp, prCount, strongest: strongest.name, totalVol: totalVolAll };
  }, [logs]);

  const chartData = useMemo(() => {
    const byExercise = {};
    logs
      .filter((l) => TRACKED.includes(l.exercise))
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .forEach((l) => {
        if (!byExercise[l.exercise]) byExercise[l.exercise] = [];
        byExercise[l.exercise].push({
          date: l.date,
          vol: calcVolume(l.sets),
          label: fmtDate(l.date),
        });
      });
    return byExercise;
  }, [logs]);

  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: isMobile
            ? "repeat(2, 1fr)"
            : "repeat(auto-fit, minmax(140px, 1fr))",
          gap: isMobile ? "0.6rem" : "0.75rem",
          marginBottom: "1.5rem",
        }}
      >
        <StatCard
          label="Weekly Strength"
          value={stats.wss !== null ? `${stats.wss > 0 ? "+" : ""}${stats.wss}%` : "—"}
          sub="this week"
          accent="#39ff14"
        />
        <StatCard
          label="Monthly Progress"
          value={stats.mp !== null ? `${stats.mp > 0 ? "+" : ""}${stats.mp}%` : "—"}
          sub="volume change"
          accent="#bf5af2"
        />
        <StatCard
          label="PRs This Month"
          value={String(stats.prCount)}
          sub="personal records"
          accent="#ffd700"
        />
        <StatCard
          label="Strongest Ex."
          value={stats.strongest || "—"}
          sub="by total volume"
          accent="#ff9f0a"
        />
        <StatCard
          label="Total Volume"
          value={stats.totalVol.toLocaleString()}
          sub="kg lifted"
          accent="#30d0fe"
        />
      </div>

      {TRACKED.filter((ex) => chartData[ex] && chartData[ex].length > 1).map((ex) => {
        const data = chartData[ex];
        const bestVol = Math.max(...data.map((d) => d.vol));
        const bestEntry = data.find((d) => d.vol === bestVol);
        const latest = data[data.length - 1];
        const maxWeight = Math.max(
          ...logs
            .filter((l) => l.exercise === ex)
            .flatMap((l) => l.sets.map((s) => s.weight || 0))
        );
        const allReps = logs
          .filter((l) => l.exercise === ex)
          .flatMap((l) => l.sets);
        const bestSet = allReps.reduce(
          (best, s) => {
            const e1rm = estimate1RM(s.weight, s.reps);
            return e1rm > best.e1rm ? { ...s, e1rm } : best;
          },
          { e1rm: 0 }
        );

        return (
          <GlassCard key={ex} style={{ marginBottom: "1rem" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: "0.75rem",
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: "0.75rem",
                    color: "#e8e8e8",
                    fontWeight: 700,
                  }}
                >
                  {ex}
                </div>
                <div
                  style={{
                    display: "flex",
                    gap: "1rem",
                    marginTop: "0.4rem",
                    flexWrap: "wrap",
                  }}
                >
                  <div style={{ fontSize: "0.6rem", color: "#555" }}>
                    BEST WEIGHT:{" "}
                    <span style={{ color: "#39ff14" }}>{maxWeight}kg</span>
                  </div>
                  <div style={{ fontSize: "0.6rem", color: "#555" }}>
                    BEST VOLUME:{" "}
                    <span style={{ color: "#bf5af2" }}>{bestVol}kg</span>
                  </div>
                  <div style={{ fontSize: "0.6rem", color: "#555" }}>
                    EST 1RM:{" "}
                    <span style={{ color: "#ffd700" }}>
                      {bestSet.e1rm > 0 ? `${bestSet.e1rm}kg` : "—"}
                    </span>
                  </div>
                </div>
              </div>
              {latest && latest.vol === bestVol && (
                <div
                  style={{
                    padding: "0.25rem 0.6rem",
                    background: "rgba(255,215,0,0.15)",
                    borderRadius: 20,
                    fontSize: "0.6rem",
                    color: "#ffd700",
                    whiteSpace: "nowrap",
                  }}
                >
                  🏆 CURRENT PR
                </div>
              )}
            </div>
            <ResponsiveContainer width="100%" height={isMobile ? 120 : 160}>
              <LineChart data={data}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="rgba(255,255,255,0.04)"
                />
                <XAxis
                  dataKey="label"
                  tick={{ fill: "#444", fontSize: 9, fontFamily: "'Space Mono', monospace" }}
                />
                <YAxis tick={{ fill: "#444", fontSize: 9 }} />
                <Tooltip
                  contentStyle={{
                    background: "#111",
                    border: "1px solid rgba(57,255,20,0.3)",
                    borderRadius: 8,
                    fontSize: 11,
                    fontFamily: "'Space Mono', monospace",
                  }}
                />
                <Line
                  type="monotone"
                  dataKey="vol"
                  stroke="#39ff14"
                  strokeWidth={2}
                  dot={{ fill: "#39ff14", r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>
        );
      })}

      {Object.keys(chartData).length === 0 && (
        <GlassCard>
          <div
            style={{
              textAlign: "center",
              padding: "1rem",
              color: "#555",
              fontSize: "0.75rem",
            }}
          >
            Log some workouts to see your analytics
          </div>
        </GlassCard>
      )}
    </div>
  );
}
