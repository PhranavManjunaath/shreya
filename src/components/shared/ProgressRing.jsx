import { motion } from "framer-motion";

export default function ProgressRing({ pct }) {
  const r = 54,
    c = 2 * Math.PI * r;
  const offset = c - (pct / 100) * c;
  return (
    <svg width={130} height={130} viewBox="0 0 130 130">
      <circle
        cx={65}
        cy={65}
        r={r}
        fill="none"
        stroke="rgba(57,255,20,0.08)"
        strokeWidth={8}
      />
      <motion.circle
        cx={65}
        cy={65}
        r={r}
        fill="none"
        stroke="#39ff14"
        strokeWidth={8}
        strokeLinecap="round"
        strokeDasharray={c}
        initial={{ strokeDashoffset: c }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        transform="rotate(-90 65 65)"
      />
      <text
        x={65}
        y={62}
        textAnchor="middle"
        fill="#e8e8e8"
        fontFamily="'Orbitron', sans-serif"
        fontWeight={700}
        fontSize={20}
      >
        {pct}%
      </text>
      <text
        x={65}
        y={80}
        textAnchor="middle"
        fill="#555"
        fontFamily="'Space Mono', monospace"
        fontSize={9}
      >
        COMPLETE
      </text>
    </svg>
  );
}
