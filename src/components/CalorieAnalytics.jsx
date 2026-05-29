import { useMemo } from "react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import GlassCard from "./shared/GlassCard.jsx";
import StatCard from "./shared/StatCard.jsx";
import SectionLabel from "./shared/SectionLabel.jsx";
import useMediaQuery from "../lib/useMediaQuery.js";
import { fmtDate, weekDays } from "../lib/helpers.js";

const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function CalorieAnalytics({ logs }) {
  const isMobile = useMediaQuery("(max-width: 767px)");

  const sorted = useMemo(
    () => [...logs].sort((a, b) => new Date(a.date) - new Date(b.date)),
    [logs]
  );

  const dailyData = useMemo(() => {
    const all = sorted.map((l) => ({
      date: l.date,
      label: fmtDate(l.date),
      cal: l.total_cal || 0,
      protein: l.total_protein || 0,
      carbs: l.total_carbs || 0,
      fat: l.total_fat || 0,
      fiber: l.total_fiber || 0,
    }));
    return {
      last30: all.slice(-30),
      last90: all.slice(-90),
    };
  }, [sorted]);

  const weeklyData = useMemo(() => {
    const weeks = {};
    sorted.forEach((l) => {
      const d = new Date(l.date);
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - d.getDay());
      const key = weekStart.toISOString().slice(0, 10);
      if (!weeks[key]) weeks[key] = { cal: 0, protein: 0, count: 0 };
      weeks[key].cal += l.total_cal || 0;
      weeks[key].protein += l.total_protein || 0;
      weeks[key].count++;
    });
    return Object.entries(weeks)
      .slice(-8)
      .map(([date, v]) => ({
        date,
        label: fmtDate(date),
        cal: Math.round(v.cal / v.count),
        protein: Math.round(v.protein / v.count),
      }));
  }, [sorted]);

  const monthlyData = useMemo(() => {
    const months = {};
    sorted.forEach((l) => {
      const key = l.date.slice(0, 7);
      if (!months[key]) months[key] = { cal: 0, protein: 0, count: 0 };
      months[key].cal += l.total_cal || 0;
      months[key].protein += l.total_protein || 0;
      months[key].count++;
    });
    return Object.entries(months)
      .slice(-6)
      .map(([date, v]) => ({
        date,
        label: date,
        cal: Math.round(v.cal / v.count),
        protein: Math.round(v.protein / v.count),
      }));
  }, [sorted]);

  const insightStats = useMemo(() => {
    if (sorted.length === 0) return null;
    const cals = sorted.map((l) => l.total_cal || 0);
    const proteins = sorted.map((l) => l.total_protein || 0);
    const avgCal = Math.round(cals.reduce((a, b) => a + b, 0) / cals.length);
    const avgProtein = Math.round(proteins.reduce((a, b) => a + b, 0) / proteins.length);
    const maxCal = Math.max(...cals);
    const maxDay = sorted.find((l) => (l.total_cal || 0) === maxCal);
    const minCal = Math.min(...cals.filter((c) => c > 0));
    const minDay = sorted.find((l) => (l.total_cal || 0) === minCal);

    const lastWeek = sorted.slice(-7);
    const weekAvgCal = lastWeek.length > 0
      ? Math.round(lastWeek.reduce((s, l) => s + (l.total_cal || 0), 0) / lastWeek.length)
      : 0;

    return { avgCal, avgProtein, maxCal, maxDay: maxDay?.date, minCal, minDay: minDay?.date, weekAvgCal };
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
      {insightStats && (
        <div
          style={{
            display: "grid",
            gridTemplateColumns: isMobile ? "repeat(2, 1fr)" : "repeat(5, 1fr)",
            gap: isMobile ? "0.6rem" : "0.75rem",
            marginBottom: "1.5rem",
          }}
        >
          <StatCard label="Avg Daily Calories" value={insightStats.avgCal.toLocaleString()} sub="kcal" accent="#39ff14" />
          <StatCard label="Avg Protein" value={`${insightStats.avgProtein}g`} sub="daily" accent="#ff9f0a" />
          <StatCard label="Highest Day" value={insightStats.maxCal.toLocaleString()} sub={insightStats.maxDay ? fmtDate(insightStats.maxDay) : "—"} accent="#ff453a" />
          <StatCard label="Lowest Day" value={insightStats.minCal.toLocaleString()} sub={insightStats.minDay ? fmtDate(insightStats.minDay) : "—"} accent="#30d0fe" />
          <StatCard label="Weekly Avg" value={insightStats.weekAvgCal.toLocaleString()} sub="last 7 days" accent="#bf5af2" />
        </div>
      )}

      {dailyData.last30.length > 0 && (
        <>
          <GlassCard style={{ marginBottom: "1rem" }}>
            <SectionLabel>Daily Calories (30 days)</SectionLabel>
            <ResponsiveContainer width="100%" height={isMobile ? 140 : 200}>
              <LineChart data={dailyData.last30}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" tick={{ fill: "#444", fontSize: 9, fontFamily: "'Space Mono', monospace" }} />
                <YAxis tick={{ fill: "#444", fontSize: 9 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="cal" stroke="#39ff14" strokeWidth={2} dot={false} name="Calories" />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard style={{ marginBottom: "1rem" }}>
            <SectionLabel>Daily Macros (30 days)</SectionLabel>
            <ResponsiveContainer width="100%" height={isMobile ? 140 : 200}>
              <LineChart data={dailyData.last30}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" tick={{ fill: "#444", fontSize: 9, fontFamily: "'Space Mono', monospace" }} />
                <YAxis tick={{ fill: "#444", fontSize: 9 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="protein" stroke="#ff9f0a" strokeWidth={2} dot={false} name="Protein (g)" />
                <Line type="monotone" dataKey="carbs" stroke="#30d0fe" strokeWidth={2} dot={false} name="Carbs (g)" />
                <Line type="monotone" dataKey="fat" stroke="#bf5af2" strokeWidth={2} dot={false} name="Fat (g)" />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>

          <GlassCard style={{ marginBottom: "1rem" }}>
            <SectionLabel>Daily Fiber (30 days)</SectionLabel>
            <ResponsiveContainer width="100%" height={isMobile ? 120 : 160}>
              <LineChart data={dailyData.last30}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                <XAxis dataKey="label" tick={{ fill: "#444", fontSize: 9, fontFamily: "'Space Mono', monospace" }} />
                <YAxis tick={{ fill: "#444", fontSize: 9 }} />
                <Tooltip contentStyle={tooltipStyle} />
                <Line type="monotone" dataKey="fiber" stroke="#ffd700" strokeWidth={2} dot={false} name="Fiber (g)" />
              </LineChart>
            </ResponsiveContainer>
          </GlassCard>

          <div style={{ display: "grid", gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr", gap: "1rem", marginBottom: "1rem" }}>
            <GlassCard>
              <SectionLabel>Weekly Avg Calories</SectionLabel>
              <ResponsiveContainer width="100%" height={isMobile ? 120 : 160}>
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="label" tick={{ fill: "#444", fontSize: 9 }} />
                  <YAxis tick={{ fill: "#444", fontSize: 9 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="cal" fill="#39ff14" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>

            <GlassCard>
              <SectionLabel>Monthly Avg Calories</SectionLabel>
              <ResponsiveContainer width="100%" height={isMobile ? 120 : 160}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
                  <XAxis dataKey="label" tick={{ fill: "#444", fontSize: 9 }} />
                  <YAxis tick={{ fill: "#444", fontSize: 9 }} />
                  <Tooltip contentStyle={tooltipStyle} />
                  <Bar dataKey="cal" fill="#bf5af2" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </GlassCard>
          </div>
        </>
      )}

      {dailyData.last30.length === 0 && (
        <GlassCard>
          <div style={{ textAlign: "center", padding: "1rem", color: "#555", fontSize: "0.75rem" }}>
            Log some meals to see your calorie analytics
          </div>
        </GlassCard>
      )}
    </div>
  );
}
