import { useState } from "react";
import { motion } from "framer-motion";
import { weekDays, today } from "../lib/helpers.js";
import GlassCard from "./shared/GlassCard.jsx";
import PageHeader from "./shared/PageHeader.jsx";
import useMediaQuery from "../lib/useMediaQuery.js";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export default function CalendarView({ history, pctToday }) {
  const isMobile = useMediaQuery("(max-width: 767px)");
  const now = new Date();
  const [viewYear, setViewYear] = useState(now.getFullYear());
  const [viewMonth, setViewMonth] = useState(now.getMonth());

  const prevMonth = () => {
    if (viewMonth === 0) { setViewYear((y) => y - 1); setViewMonth(11); }
    else setViewMonth((m) => m - 1);
  };

  const nextMonth = () => {
    if (viewMonth === 11) { setViewYear((y) => y + 1); setViewMonth(0); }
    else setViewMonth((m) => m + 1);
  };

  const prevYear = () => setViewYear((y) => y - 1);
  const nextYear = () => setViewYear((y) => y + 1);

  const firstDay = new Date(viewYear, viewMonth, 1).getDay();
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const histMap = {};
  history.forEach((d) => {
    histMap[d.date] = d.pct;
  });
  histMap[today()] = pctToday;

  const isCurrentMonth = viewMonth === now.getMonth() && viewYear === now.getFullYear();

  return (
    <div>
      <PageHeader
        title="Calendar"
        sub={`${MONTHS[viewMonth]} ${viewYear}`}
      />
      <GlassCard>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            marginBottom: "1rem",
          }}
        >
          <div style={{ display: "flex", gap: "0.3rem" }}>
            <button
              onClick={prevYear}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 6,
                color: "#555",
                width: 36,
                height: 36,
                cursor: "pointer",
                fontSize: "0.8rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Space Mono', monospace",
              }}
            >
              «
            </button>
            <button
              onClick={prevMonth}
              style={{
                background: "transparent",
                border: "1px solid rgba(57,255,20,0.2)",
                borderRadius: 6,
                color: "#39ff14",
                width: 36,
                height: 36,
                cursor: "pointer",
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Space Mono', monospace",
              }}
            >
              ‹
            </button>
          </div>
          <div
            style={{
              fontFamily: "'Orbitron', sans-serif",
              fontSize: isMobile ? "0.9rem" : "1rem",
              color: "#fff",
            }}
          >
            {MONTHS[viewMonth]} {viewYear}
          </div>
          <div style={{ display: "flex", gap: "0.3rem" }}>
            <button
              onClick={nextMonth}
              style={{
                background: "transparent",
                border: "1px solid rgba(57,255,20,0.2)",
                borderRadius: 6,
                color: "#39ff14",
                width: 36,
                height: 36,
                cursor: "pointer",
                fontSize: "1rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Space Mono', monospace",
              }}
            >
              ›
            </button>
            <button
              onClick={nextYear}
              style={{
                background: "transparent",
                border: "1px solid rgba(255,255,255,0.08)",
                borderRadius: 6,
                color: "#555",
                width: 36,
                height: 36,
                cursor: "pointer",
                fontSize: "0.8rem",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontFamily: "'Space Mono', monospace",
              }}
            >
              »
            </button>
          </div>
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "4px",
            marginBottom: "0.5rem",
          }}
        >
          {weekDays.map((d) => (
            <div
              key={d}
              style={{
                textAlign: "center",
                fontSize: "0.65rem",
                color: "#444",
                padding: "0.4rem 0",
                letterSpacing: "0.1em",
              }}
            >
              {d.toUpperCase()}
            </div>
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(7, 1fr)",
            gap: "4px",
          }}
        >
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`e${i}`} />
          ))}
          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1;
            const dateStr = `${viewYear}-${String(viewMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
            const pct = histMap[dateStr];
            const isToday = dateStr === today();
            let bg = "#1a1a1a";
            if (pct !== undefined)
              bg =
                pct >= 60
                  ? `rgba(57,255,20,${0.1 + (pct / 100) * 0.5})`
                  : pct >= 30
                    ? "rgba(255,159,10,0.2)"
                    : "rgba(255,69,58,0.15)";
            return (
              <motion.div
                key={day}
                whileHover={{ scale: 1.05 }}
                style={{
                  aspectRatio: "1",
                  borderRadius: 8,
                  background: bg,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  border: isToday ? "2px solid #39ff14" : "none",
                  cursor: "pointer",
                }}
              >
                <span
                  style={{
                    fontSize: "0.8rem",
                    fontWeight: isToday ? 700 : 400,
                    color: isToday ? "#39ff14" : "#888",
                  }}
                >
                  {day}
                </span>
                {pct !== undefined && (
                  <span
                    style={{
                      fontSize: "0.55rem",
                      color:
                        pct >= 60
                          ? "#39ff14"
                          : pct >= 30
                            ? "#ff9f0a"
                            : "#ff453a",
                    }}
                  >
                    {pct}%
                  </span>
                )}
              </motion.div>
            );
          })}
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "0.75rem",
            marginTop: "1rem",
            fontSize: "0.7rem",
          }}
        >
          {[
            ["rgba(57,255,20,0.4)", "Productive (60%+)"],
            ["rgba(255,159,10,0.3)", "Moderate (30-59%)"],
            ["rgba(255,69,58,0.2)", "Low (<30%)"],
          ].map(([c, l]) => (
            <div
              key={l}
              style={{ display: "flex", alignItems: "center", gap: "0.4rem" }}
            >
              <div
                style={{
                  width: 12,
                  height: 12,
                  borderRadius: 3,
                  background: c,
                }}
              />
              <span style={{ color: "#444" }}>{l}</span>
            </div>
          ))}
        </div>
      </GlassCard>
    </div>
  );
}
