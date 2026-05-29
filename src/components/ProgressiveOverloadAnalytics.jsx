import { useMemo } from "react";
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
import GlassCard from "./shared/GlassCard.jsx";
import StatCard from "./shared/StatCard.jsx";
import SectionLabel from "./shared/SectionLabel.jsx";
import {
  calcVolume,
  estimate1RM,
  getWeeklyStrengthScore,
  getMonthlyProgress,
  getPRCountThisMonth,
} from "../lib/workoutData.js";
import { fmtDate } from "../lib/helpers.js";
import useMediaQuery from "../lib/useMediaQuery.js";

export default function ProgressiveOverloadAnalytics({ logs }) {
  const isMobile = useMediaQuery("(max-width: 767px)");

  const sorted = useMemo(
    () => [...logs].sort((a, b) => new Date(a.date) - new Date(b.date)),
    [logs]
  );

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

  const trackedExercises = useMemo(() => {
    const count = {};
    logs.forEach((l) => { count[l.exercise] = (count[l.exercise] || 0) + 1; });
    return Object.entries(count)
      .filter(([, c]) => c > 1)
      .map(([name]) => name);
  }, [logs]);

  const chartData = useMemo(() => {
    const byExercise = {};
    logs
      .filter((l) => trackedExercises.includes(l.exercise))
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
  }, [logs, trackedExercises]);

  const weeklyVolume = useMemo(() => {
    const weeks = {};
    sorted.forEach((l) => {
      const d = new Date(l.date);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().slice(0, 10);
      if (!weeks[key]) weeks[key] = 0;
      weeks[key] += calcVolume(l.sets);
    });
    return Object.entries(weeks)
      .slice(-8)
      .map(([date, vol]) => ({ date, label: fmtDate(date), vol }));
  }, [sorted]);

  const monthlyStrength = useMemo(() => {
    const months = {};
    const byExercise = {};
    sorted.forEach((l) => {
      const key = l.date.slice(0, 7);
      if (!byExercise[l.exercise]) byExercise[l.exercise] = {};
      if (!byExercise[l.exercise][key]) byExercise[l.exercise][key] = [];
      byExercise[l.exercise][key].push(l);
    });

    Object.entries(byExercise).forEach(([ex, monthMap]) => {
      Object.entries(monthMap).forEach(([month, exLogs]) => {
        const vols = exLogs.map((l) => calcVolume(l.sets));
        const bestVol = Math.max(...vols);
        if (!months[month]) months[month] = { totalVol: 0, count: 0 };
        months[month].totalVol += bestVol;
        months[month].count++;
      });
    });

    return Object.entries(months)
      .slice(-6)
      .map(([month, v]) => ({
        month,
        label: month,
        avgVol: Math.round(v.totalVol / v.count),
      }));
  }, [sorted]);

  const prHistory = useMemo(() => {
    const prs = [];
    const byExercise = {};
    sorted.forEach((l) => {
      if (!byExercise[l.exercise]) byExercise[l.exercise] = [];
      const prev = byExercise[l.exercise];
      const prevBestWeight = prev.length > 0
        ? Math.max(...prev.map((e) => Math.max(...e.sets.map((s) => s.weight || 0))))
        : 0;
      const prevBestVolume = prev.length > 0
        ? Math.max(...prev.map((e) => calcVolume(e.sets)))
        : 0;
      const currVolume = calcVolume(l.sets);
      const currMaxWeight = Math.max(...l.sets.map((s) => s.weight || 0));

      if (currMaxWeight > prevBestWeight && prevBestWeight > 0) {
        prs.push({ date: l.date, label: fmtDate(l.date), exercise: l.exercise, type: "Weight PR", value: `${currMaxWeight}kg` });
      }
      if (currVolume > prevBestVolume && prevBestVolume > 0) {
        prs.push({ date: l.date, label: fmtDate(l.date), exercise: l.exercise, type: "Volume PR", value: `${currVolume}kg` });
      }
      byExercise[l.exercise].push(l);
    });
    return prs.slice(-20).reverse();
  }, [sorted]);

  const tooltipStyle = {
    background: "#111",
    border: "1px solid rgba(57,255,20,0.3)",
    borderRadius: 8,
    fontSize: 11,
    fontFamily: "'Space Mono', monospace",
  };

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

      {weeklyVolume.length > 0 && (
        <GlassCard style={{ marginBottom: "1rem" }}>
          <SectionLabel>Weekly Workout Volume</SectionLabel>
          <ResponsiveContainer width="100%" height={isMobile ? 120 : 160}>
            <BarChart data={weeklyVolume}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="label" tick={{ fill: "#444", fontSize: 9, fontFamily: "'Space Mono', monospace" }} />
              <YAxis tick={{ fill: "#444", fontSize: 9 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="vol" fill="#39ff14" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </GlassCard>
      )}

      {monthlyStrength.length > 0 && (
        <GlassCard style={{ marginBottom: "1rem" }}>
          <SectionLabel>Monthly Strength Progression</SectionLabel>
          <ResponsiveContainer width="100%" height={isMobile ? 120 : 160}>
            <LineChart data={monthlyStrength}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis dataKey="label" tick={{ fill: "#444", fontSize: 9, fontFamily: "'Space Mono', monospace" }} />
              <YAxis tick={{ fill: "#444", fontSize: 9 }} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="avgVol" stroke="#bf5af2" strokeWidth={2} dot={{ fill: "#bf5af2", r: 4 }} name="Avg Best Vol (kg)" />
            </LineChart>
          </ResponsiveContainer>
        </GlassCard>
      )}

      {prHistory.length > 0 && (
        <GlassCard style={{ marginBottom: "1rem" }}>
          <SectionLabel>PR History</SectionLabel>
          <div style={{ maxHeight: 200, overflowY: "auto" }}>
            {prHistory.slice(0, 20).map((pr, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.4rem 0",
                  borderBottom: "1px solid rgba(255,255,255,0.04)",
                  fontSize: "0.7rem",
                }}
              >
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                  <span style={{ color: "#ffd700" }}>🏆</span>
                  <span style={{ color: "#888" }}>{pr.exercise}</span>
                  <span style={{ color: "#555", fontSize: "0.6rem" }}>{pr.type}</span>
                </div>
                <div style={{ textAlign: "right" }}>
                  <span style={{ color: "#39ff14", fontWeight: 700 }}>{pr.value}</span>
                  <span style={{ color: "#444", marginLeft: "0.5rem", fontSize: "0.6rem" }}>{pr.label}</span>
                </div>
              </div>
            ))}
          </div>
        </GlassCard>
      )}

      {trackedExercises.filter((ex) => chartData[ex] && chartData[ex].length > 1).map((ex) => {
        const data = chartData[ex];
        const bestVol = Math.max(...data.map((d) => d.vol));
        const latest = data[data.length - 1];
        const previous = data.length > 1 ? data[data.length - 2] : null;
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

        const pctChange = previous && previous.vol > 0
          ? Math.round(((latest.vol - previous.vol) / previous.vol) * 100)
          : null;

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
                {previous && (
                  <div style={{ fontSize: "0.6rem", color: "#555", marginTop: "0.3rem" }}>
                    Previous: {previous.vol}kg → Current: {latest.vol}kg
                    {pctChange !== null && (
                      <span style={{ color: pctChange > 0 ? "#39ff14" : pctChange < 0 ? "#ff453a" : "#888", marginLeft: "0.3rem" }}>
                        ({pctChange > 0 ? "+" : ""}{pctChange}%)
                      </span>
                    )}
                  </div>
                )}
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
