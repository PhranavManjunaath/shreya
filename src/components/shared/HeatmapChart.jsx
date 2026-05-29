import { motion } from "framer-motion";
import { fmtDate } from "../../lib/helpers.js";

export default function HeatmapChart({ data }) {
  const max = Math.max(...data.map((d) => d.habits), 1);
  return (
    <div
      style={{
        display: "flex",
        gap: "4px",
        flexWrap: "wrap",
        marginTop: "0.5rem",
      }}
    >
      {data.map((d, i) => {
        const intensity = d.habits / max;
        const bg =
          intensity === 0
            ? "#1a1a1a"
            : `rgba(57,255,20,${0.1 + intensity * 0.85})`;
        return (
          <motion.div
            key={i}
            whileHover={{ scale: 1.2 }}
            title={`${fmtDate(d.date)}: ${d.habits} habits`}
            style={{
              width: 36,
              height: 36,
              borderRadius: 4,
              background: bg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "0.65rem",
              color: intensity > 0.5 ? "#000" : "#555",
            }}
          >
            {d.habits}
          </motion.div>
        );
      })}
    </div>
  );
}
